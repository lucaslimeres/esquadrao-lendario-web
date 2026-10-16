import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Campo } from "@/components/jogo/campo";
import { CardJogador } from "@/components/jogo/card-jogador";
import { SeloResultado } from "@/components/jogo/placar";
import { ListaPartidas } from "@/features/campanha/andamento";
import { PartidaAoVivo } from "@/features/campanha/partida-ao-vivo";
import { RITMO } from "@/lib/ritmo";
import type { PartidaCampanha, VagaCampanha } from "@/lib/tipos";

const vagas: VagaCampanha[] = [
  { codigo: "GK_1", posicao: "GK", x: 50, y: 92, jogador: null },
  { codigo: "CB_1", posicao: "CB", x: 40, y: 75, jogador: null },
  {
    codigo: "ST_1", posicao: "ST", x: 50, y: 18,
    jogador: { id: "j1", nome: "Fulano de Tal", posicao: "ST", overall: 91, overallEfetivo: 91, encaixe: "principal", elenco: null },
  },
];

describe("CardJogador", () => {
  it("mostra overall, posição e raridade", () => {
    const { container } = render(<CardJogador nome="Zico" posicao="CAM" overall={94} legenda="Flamengo 1981" />);
    expect(screen.getByText("94")).toBeInTheDocument();
    expect(screen.getByText("Lendário")).toBeInTheDocument();
    expect(container.firstElementChild).toHaveAttribute("data-raridade", "lendario");
  });
});

describe("Campo", () => {
  it("desenha vagas vazias, preenchidas e só deixa clicar nas destacadas", async () => {
    const escolher = vi.fn();
    const { container } = render(<Campo vagas={vagas} destacadas={["CB_1"]} aoEscolherVaga={escolher} />);
    expect(container.querySelector('[data-vaga="GK_1"]')).toHaveAttribute("data-estado", "vazia");
    expect(container.querySelector('[data-vaga="ST_1"]')).toHaveAttribute("data-estado", "preenchida");
    expect(screen.getByText("Tal")).toBeInTheDocument();
    expect(screen.getAllByRole("button")).toHaveLength(1);
    await userEvent.click(screen.getByRole("button", { name: /vaga CB/ }));
    expect(escolher).toHaveBeenCalledWith("CB_1");
  });
});

describe("SeloResultado", () => {
  it("a letra sempre acompanha a cor", () => {
    render(<SeloResultado resultado="V" />);
    expect(screen.getByLabelText("Vitória")).toHaveTextContent("V");
  });
});

describe("PartidaAoVivo", () => {
  afterEach(() => vi.useRealTimers());

  const partida: PartidaCampanha = {
    id: "p1", fase: "quartas", rodada: 1,
    adversario: { id: "e1", temporada: 2005, rotulo: "São Paulo 2005", equipe: { nome: "São Paulo", sigla: "SAO", pais: "BR", corPrimaria: "#FFFFFF", corSecundaria: "#000000" } },
    simulada: true, golsPro: 1, golsContra: 1, prorrogacao: true, penaltisPro: 4, penaltisContra: 3, resultado: "V",
    gols: [
      { minuto: 10, doSeuTime: true, jogadorId: "a", jogadorNome: "Artilheiro" },
      { minuto: 80, doSeuTime: false, jogadorId: "b", jogadorNome: "Rival" },
    ],
    penaltis: [{ doSeuTime: true, jogadorNome: "Batedor", convertido: true }],
  };

  it("revela os gols conforme o minuto passa", () => {
    vi.useFakeTimers();
    render(<PartidaAoVivo partida={partida} onFim={() => {}} />);
    expect(screen.queryByText("Artilheiro")).not.toBeInTheDocument();
    // One tick per act: each minute's state update schedules the next timer.
    const avancar = (passos: number) => {
      for (let i = 0; i < passos; i++) act(() => vi.advanceTimersByTime(RITMO.gol));
    };
    expect(screen.getByText("Bola rolando!")).toBeInTheDocument();
    expect(screen.getByText("Partida iniciada")).toBeInTheDocument();
    avancar(10);
    expect(screen.getByText("Artilheiro")).toBeInTheDocument();
    // The reveal holds on the goal minute.
    expect(document.querySelector("[data-etapa]")).toHaveTextContent("Gol!");
    expect(screen.getByText("Artilheiro").closest("li")).toHaveAttribute("data-novo");
    expect(screen.queryByText("Rival")).not.toBeInTheDocument();
    avancar(35);
    expect(screen.getByText("Intervalo")).toBeInTheDocument();
    expect(screen.getByText("Fim do 1º tempo")).toBeInTheDocument();
    expect(screen.queryByText("Início do 2º tempo")).not.toBeInTheDocument();
    // Newest on top.
    const lances = screen.getAllByRole("listitem").map((li) => li.getAttribute("data-evento"));
    expect(lances).toEqual(["fim_primeiro_tempo", "gol", "inicio"]);
  });

  it("pular mostra o resultado final e continuar encerra", async () => {
    const onFim = vi.fn();
    render(<PartidaAoVivo partida={partida} onFim={onFim} />);
    await userEvent.click(screen.getByRole("button", { name: /Pular/ }));
    expect(screen.getByText("Rival")).toBeInTheDocument();
    expect(screen.getByText("Classificado nos pênaltis!")).toBeInTheDocument();
    expect(screen.getByLabelText("1 a 1")).toBeInTheDocument();
    for (const lance of ["Fim do tempo normal", "Início da prorrogação", "Intervalo da prorrogação", "Fim da prorrogação", "Disputa de pênaltis", "Fim de jogo"]) {
      expect(screen.getByText(lance)).toBeInTheDocument();
    }
    expect(screen.getByText(/Converteu/).closest("li")).toHaveTextContent("Batedor");
    await userEvent.click(screen.getByRole("button", { name: /Continuar/ }));
    expect(onFim).toHaveBeenCalledOnce();
  });
});

describe("ListaPartidas", () => {
  const jogo: PartidaCampanha = {
    id: "p2", fase: "grupo", rodada: 1,
    adversario: { id: "e1", temporada: 2005, rotulo: "São Paulo 2005", equipe: { nome: "São Paulo", sigla: "SAO", pais: "BR", corPrimaria: "#FFFFFF", corSecundaria: "#000000" } },
    simulada: true, golsPro: 2, golsContra: 0, prorrogacao: false, penaltisPro: null, penaltisContra: null, resultado: "V",
    gols: [
      { minuto: 63, doSeuTime: true, jogadorId: "b", jogadorNome: "Segundo" },
      { minuto: 5, doSeuTime: true, jogadorId: "a", jogadorNome: "Primeiro" },
    ],
    penaltis: null,
  };

  it("clicar no jogo mostra quem fez os gols e em que minuto", async () => {
    render(<ListaPartidas partidas={[jogo]} />);
    const linha = screen.getByRole("button", { name: /São Paulo 2005/ });
    expect(linha).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("Primeiro")).not.toBeInTheDocument();
    await userEvent.click(linha);
    expect(linha).toHaveAttribute("aria-expanded", "true");
    const lances = within(screen.getByRole("list", { name: "Lances da partida" })).getAllByRole("listitem");
    expect(lances.map((l) => l.textContent)).toEqual([
      expect.stringContaining("Partida iniciada"),
      expect.stringMatching(/5'.*Primeiro.*1–0/),
      expect.stringContaining("Fim do 1º tempo"),
      expect.stringContaining("Início do 2º tempo"),
      expect.stringMatching(/63'.*Segundo.*2–0/),
      expect.stringMatching(/90'.*Fim de jogo.*2–0/),
    ]);
    await userEvent.click(linha);
    expect(screen.queryByText("Primeiro")).not.toBeInTheDocument();
  });
});
