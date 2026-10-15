import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Campo } from "@/components/jogo/campo";
import { CardJogador } from "@/components/jogo/card-jogador";
import { SeloResultado } from "@/components/jogo/placar";
import { PartidaAoVivo } from "@/features/campanha/partida-ao-vivo";
import type { PartidaCampanha, VagaCampanha } from "@/lib/tipos";

const vagas: VagaCampanha[] = [
  { codigo: "GOL_1", posicao: "GOL", x: 50, y: 92, jogador: null },
  { codigo: "ZAG_1", posicao: "ZAG", x: 40, y: 75, jogador: null },
  {
    codigo: "ATA_1", posicao: "ATA", x: 50, y: 18,
    jogador: { id: "j1", nome: "Fulano de Tal", posicao: "ATA", overall: 91, overallEfetivo: 91, encaixe: "principal", elenco: null },
  },
];

describe("CardJogador", () => {
  it("mostra overall, posição e raridade", () => {
    const { container } = render(<CardJogador nome="Zico" posicao="MEI" overall={94} legenda="Flamengo 1981" />);
    expect(screen.getByText("94")).toBeInTheDocument();
    expect(screen.getByText("Lendário")).toBeInTheDocument();
    expect(container.firstElementChild).toHaveAttribute("data-raridade", "lendario");
  });
});

describe("Campo", () => {
  it("desenha vagas vazias, preenchidas e só deixa clicar nas destacadas", async () => {
    const escolher = vi.fn();
    const { container } = render(<Campo vagas={vagas} destacadas={["ZAG_1"]} aoEscolherVaga={escolher} />);
    expect(container.querySelector('[data-vaga="GOL_1"]')).toHaveAttribute("data-estado", "vazia");
    expect(container.querySelector('[data-vaga="ATA_1"]')).toHaveAttribute("data-estado", "preenchida");
    expect(screen.getByText("Tal")).toBeInTheDocument();
    expect(screen.getAllByRole("button")).toHaveLength(1);
    await userEvent.click(screen.getByRole("button", { name: /vaga ZAG/ }));
    expect(escolher).toHaveBeenCalledWith("ZAG_1");
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
    for (let i = 0; i < 12; i++) act(() => vi.advanceTimersByTime(45));
    expect(screen.getByText("Artilheiro")).toBeInTheDocument();
    expect(screen.queryByText("Rival")).not.toBeInTheDocument();
  });

  it("pular mostra o resultado final e continuar encerra", async () => {
    const onFim = vi.fn();
    render(<PartidaAoVivo partida={partida} onFim={onFim} />);
    await userEvent.click(screen.getByRole("button", { name: /Pular/ }));
    expect(screen.getByText("Rival")).toBeInTheDocument();
    expect(screen.getByText("Classificado nos pênaltis!")).toBeInTheDocument();
    expect(screen.getByLabelText("1 a 1")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /Continuar/ }));
    expect(onFim).toHaveBeenCalledOnce();
  });
});
