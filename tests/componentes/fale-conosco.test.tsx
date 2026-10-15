import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FormFaleConosco } from "@/features/fale-conosco";

const comQuery = (ui: React.ReactNode) => render(<QueryClientProvider client={new QueryClient()}>{ui}</QueryClientProvider>);
const resposta = (corpo: unknown, status = 200) => new Response(JSON.stringify(corpo), { status, headers: { "Content-Type": "application/json" } });

afterEach(() => vi.unstubAllGlobals());

async function preencher() {
  await userEvent.type(screen.getByLabelText("Nome"), "Bia Souza");
  await userEvent.type(screen.getByLabelText("E-mail"), "bia@exemplo.com");
  await userEvent.type(screen.getByLabelText("Assunto"), "Sugestão");
  await userEvent.type(screen.getByLabelText("Mensagem"), "Coloquem a Copa do Mundo!");
}

describe("FormFaleConosco", () => {
  it("envia sem o campo oculto e mostra a confirmação", async () => {
    const fetch = vi.fn(async (_url: string, _init?: RequestInit) => resposta({ recebida: true }, 201));
    vi.stubGlobal("fetch", fetch);
    comQuery(<FormFaleConosco />);
    await preencher();
    await userEvent.click(screen.getByRole("button", { name: /Enviar mensagem/ }));

    expect(await screen.findByText("Mensagem enviada!")).toBeInTheDocument();
    expect(screen.getByText(/A resposta chega no bia@exemplo.com/)).toBeInTheDocument();
    const [url, init] = fetch.mock.calls[0]!;
    expect(url).toMatch(/\/contato$/);
    expect(JSON.parse(String(init!.body))).toEqual({ nome: "Bia Souza", email: "bia@exemplo.com", assunto: "Sugestão", mensagem: "Coloquem a Copa do Mundo!", site: "" });
    expect((init!.headers as Record<string, string>).Authorization).toBeUndefined();
  });

  it("mostra o erro da API (ex.: limite de mensagens) e mantém o que foi escrito", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => resposta({ erro: "Muitas mensagens em pouco tempo. Tente de novo em alguns minutos.", codigo: "muitas_mensagens" }, 429)));
    comQuery(<FormFaleConosco />);
    await preencher();
    await userEvent.click(screen.getByRole("button", { name: /Enviar mensagem/ }));
    expect(await screen.findByText(/Muitas mensagens em pouco tempo/)).toBeInTheDocument();
    expect(screen.getByLabelText("Mensagem")).toHaveValue("Coloquem a Copa do Mundo!");
  });
});
