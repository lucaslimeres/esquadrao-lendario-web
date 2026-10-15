import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { EditorRascunho, NovaImportacaoDialogo } from "@/features/admin/importacao";
import type { CompeticaoAdmin, ItemImportacao } from "@/lib/admin-tipos";

function comQuery(ui: React.ReactNode) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

const resposta = (corpo: unknown, status = 200) => new Response(JSON.stringify(corpo), { status, headers: { "Content-Type": "application/json" } });

afterEach(() => vi.unstubAllGlobals());

describe("NovaImportacaoDialogo", () => {
  it("manda anos, fontes na ordem escolhida e a página", async () => {
    const fetch = vi.fn(async (url: string, init?: RequestInit) => {
      if (url.endsWith("/admin/importacoes/fontes")) {
        return resposta({
          campeoes: [{ id: "wikidata", nome: "Wikidata", indisponivel: null }],
          elencos: [{ id: "wikipedia-en", nome: "Wikipedia (inglês)", indisponivel: null }, { id: "wikidata", nome: "Wikidata", indisponivel: null }],
        });
      }
      return resposta({ id: "imp-1", ...JSON.parse(String(init?.body)) }, 202);
    });
    vi.stubGlobal("fetch", fetch);
    const aoCriar = vi.fn();
    const competicao = { id: "c1", nome: "Libertadores", slug: "libertadores" } as CompeticaoAdmin;
    comQuery(<NovaImportacaoDialogo competicao={competicao} aoFechar={() => {}} aoCriar={aoCriar} />);

    await userEvent.click(await screen.findByRole("button", { name: "Subir Wikidata" }));
    const de = screen.getByLabelText("De (ano do título)");
    await userEvent.clear(de);
    await userEvent.type(de, "2000");
    await userEvent.type(screen.getByLabelText(/Página na Wikipedia/), "Copa Libertadores");
    await userEvent.click(screen.getByRole("button", { name: /Começar importação/ }));

    await waitFor(() => expect(aoCriar).toHaveBeenCalled());
    const envio = JSON.parse(String(fetch.mock.calls.at(-1)![1]!.body));
    expect(envio).toMatchObject({ competicaoId: "c1", anoInicio: 2000, fontesCampeoes: ["wikidata"], fontesElencos: ["wikidata", "wikipedia-en"], paginaWikipedia: "Copa Libertadores" });
  });
});

describe("NovaImportacaoDialogo com a Highlightly", () => {
  it("fonte sem chave aparece desmarcada com o motivo; com chave, pede o nome da liga", async () => {
    const fetch = vi.fn(async (url: string, init?: RequestInit) => {
      if (url.endsWith("/admin/importacoes/fontes")) {
        return resposta({
          campeoes: [{ id: "wikidata", nome: "Wikidata", indisponivel: null }, { id: "highlightly", nome: "Highlightly", indisponivel: null }],
          elencos: [{ id: "highlightly", nome: "Highlightly", indisponivel: "Configure HIGHLIGHTLY_API_KEY na API para usar esta fonte." }],
        });
      }
      return resposta({ id: "imp-2", ...JSON.parse(String(init?.body)) }, 202);
    });
    vi.stubGlobal("fetch", fetch);
    const aoCriar = vi.fn();
    comQuery(<NovaImportacaoDialogo competicao={{ id: "c1", nome: "Libertadores", slug: "libertadores" } as CompeticaoAdmin} aoFechar={() => {}} aoCriar={aoCriar} />);

    expect(await screen.findByText("Configure HIGHLIGHTLY_API_KEY na API para usar esta fonte.")).toBeInTheDocument();
    const checkboxes = screen.getAllByRole("checkbox", { name: /Highlightly/ });
    expect(checkboxes.at(-1)).toBeDisabled();
    await userEvent.type(screen.getByLabelText(/Nome da liga na Highlightly/), "CONMEBOL Libertadores");
    expect(screen.getByRole("button", { name: /Começar importação/ })).toBeDisabled(); // no elenco source left
  });
});

describe("EditorRascunho", () => {
  it("edita posição, remove e adiciona jogador e salva no formato do JSON", async () => {
    const item: ItemImportacao = {
      id: "it-1",
      importacaoId: "imp-1",
      temporada: 2005,
      status: "rascunho",
      dados: {
        temporada: 2005,
        equipe: { nome: "São Paulo", sigla: "SAO", pais: "BR", corPrimaria: "#201E1D", corSecundaria: "#F3F2F2" },
        jogadores: [
          { nome: "Rogério Ceni", posicao: "GK", secundarias: [], overall: 82 },
          { nome: "Mineiro", posicao: "CM", secundarias: ["CDM"], overall: 78 },
          { nome: "Sobra", posicao: "ST", secundarias: [], overall: 70 },
        ],
      },
      avisos: [],
      referencias: [],
      elencoId: null,
    };
    const fetch = vi.fn(async (_url: string, init?: RequestInit) => resposta({ ...item, dados: JSON.parse(String(init?.body)) }));
    vi.stubGlobal("fetch", fetch);
    const aoSalvar = vi.fn();
    comQuery(<EditorRascunho item={item} aoFechar={() => {}} aoSalvar={aoSalvar} />);

    await userEvent.selectOptions(screen.getByLabelText("Posição de Mineiro"), "CDM");
    await userEvent.click(screen.getByRole("button", { name: "Remover Sobra" }));
    await userEvent.click(screen.getByRole("button", { name: /Adicionar jogador/ }));
    await userEvent.type(screen.getByLabelText("Nome do jogador 3"), "Amoroso");
    await userEvent.click(screen.getByRole("button", { name: "Salvar rascunho" }));

    await waitFor(() => expect(aoSalvar).toHaveBeenCalled());
    const [url, init] = fetch.mock.calls[0]!;
    expect(url).toMatch(/\/admin\/importacoes\/itens\/it-1$/);
    expect(init!.method).toBe("PATCH");
    expect(JSON.parse(String(init!.body)).jogadores).toEqual([
      { nome: "Rogério Ceni", posicao: "GK", secundarias: [], overall: 82 },
      { nome: "Mineiro", posicao: "CDM", secundarias: [], overall: 78 },
      { nome: "Amoroso", posicao: "ST", secundarias: [], overall: 70 },
    ]);
  });
});
