import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { ListaMembros } from "@/features/grupo/membros";
import { TorneioGrupo } from "@/features/grupo/torneio";
import type { Grupo, PartidaGrupo } from "@/lib/tipos";
import { partidaGrupo } from "../fixtures/grupo";

function comQuery(children: ReactNode) {
  return <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>;
}

const ana = partidaGrupo().timeA!;
const meuTime = { ...ana, seuTime: true };

function grupo(extra: Partial<Grupo> = {}): Grupo {
  return {
    codigo: "abc123defg",
    nome: "Pelada de sexta",
    visibilidade: "privado",
    status: "em_andamento",
    faseAtual: "oitavas",
    competicao: { slug: "libertadores", nome: "Libertadores", formato: "grupos_mata_mata", jogosAteTitulo: 7 },
    agora: new Date().toISOString(),
    souMembro: true,
    souModerador: false,
    meuMembro: { id: "m1", nomeTime: "Ana FC", pronto: true, campanha: null },
    membros: [
      { id: "m1", nomeTime: "Ana FC", pronto: true, convidado: false, moderador: true, seuTime: true, montagem: null },
      { id: "m2", nomeTime: "Beto United", pronto: true, convidado: true, moderador: false, seuTime: false, montagem: null },
    ],
    vagas: { total: 32, ocupadas: 2 },
    visaoCompleta: false,
    meuTime,
    campeao: null,
    proximaPartida: null,
    aguardandoFase: false,
    progressoFase: { jogos: 4, jogados: 1 },
    grupos: [],
    partidas: [],
    pendentes: [],
    criadoEm: "2026-10-16T10:00:00.000Z",
    iniciadoEm: "2026-10-16T11:00:00.000Z",
    encerradoEm: null,
    ...extra,
  };
}

const pendente = (situacao: "jogar" | "aguardando_adversario" | "adversario_pronto"): NonNullable<Grupo["proximaPartida"]> => ({
  ...partidaGrupo({ timeA: meuTime, simulada: false, simuladaEm: null, golsA: null, golsB: null, vencedor: null, gols: [], penaltis: null, penaltisA: null, penaltisB: null, prorrogacao: false }),
  situacao,
});

describe("TorneioGrupo", () => {
  it("jogo contra outro membro: pede confirmação e depois espera o adversário", () => {
    const { rerender } = render(comQuery(<TorneioGrupo grupo={grupo({ proximaPartida: pendente("jogar") })} recebidoEm={Date.now()} />));
    expect(screen.getByRole("button", { name: /Estou pronto para o jogo/ })).toBeInTheDocument();
    expect(screen.getByText(/começa quando os dois confirmarem/)).toBeInTheDocument();

    rerender(comQuery(<TorneioGrupo grupo={grupo({ proximaPartida: pendente("aguardando_adversario") })} recebidoEm={Date.now()} />));
    expect(screen.queryByRole("button", { name: /Bola rolando|Estou pronto/ })).not.toBeInTheDocument();
    expect(screen.getByText(/Esperando Beto United confirmar/)).toBeInTheDocument();

    rerender(comQuery(<TorneioGrupo grupo={grupo({ proximaPartida: pendente("adversario_pronto") })} recebidoEm={Date.now()} />));
    expect(screen.getByRole("button", { name: /Bola rolando/ })).toBeInTheDocument();
    expect(screen.getByText(/já está pronto esperando você/)).toBeInTheDocument();
  });

  it("meu jogo que acabou de começar abre ao vivo (sem mostrar o placar antes)", () => {
    const agora = Date.now();
    const jogo: PartidaGrupo = partidaGrupo({ timeA: meuTime, simuladaEm: new Date(agora - 1_500).toISOString() });
    render(comQuery(<TorneioGrupo grupo={grupo({ agora: new Date(agora).toISOString(), partidas: [jogo] })} recebidoEm={agora} />));
    expect(screen.getByRole("button", { name: /Pular/ })).toBeInTheDocument();
    expect(screen.getByLabelText("0 a 0")).toBeInTheDocument();
    expect(screen.queryByText("Todos os jogos")).not.toBeInTheDocument();
  });

  it("jogo antigo não reabre ao vivo; esperando a fase mostra o progresso", () => {
    const jogo = partidaGrupo({ timeA: meuTime, simuladaEm: "2026-10-16T08:00:00.000Z" });
    render(comQuery(<TorneioGrupo grupo={grupo({ partidas: [jogo], aguardandoFase: true })} recebidoEm={Date.now()} />));
    expect(screen.queryByRole("button", { name: /Pular/ })).not.toBeInTheDocument();
    expect(screen.getByText(/1 de 4 jogos dos membros/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Seus jogos e os do seu grupo" })).toBeInTheDocument();
  });

  it("moderador vê os jogos travados e pode forçar", () => {
    render(
      comQuery(
        <TorneioGrupo
          grupo={grupo({ souModerador: true, pendentes: [{ id: "p9", fase: "oitavas", timeA: "Caio", timeB: "Duda", prontoA: true, prontoB: false }] })}
          recebidoEm={Date.now()}
        />,
      ),
    );
    const painel = screen.getByRole("region", { name: /jogos esperando/ });
    expect(within(painel).getByText(/Caio ✓ × Duda/)).toBeInTheDocument();
    expect(within(painel).getByRole("button", { name: /Forçar jogo/ })).toBeInTheDocument();
  });

  it("no fim, mostra o campeão para todo mundo", () => {
    render(comQuery(<TorneioGrupo grupo={grupo({ status: "encerrado", visaoCompleta: true, campeao: { ...meuTime } })} recebidoEm={Date.now()} />));
    expect(screen.getByText("É campeão!")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Compartilhar/ })).toBeInTheDocument();
  });
});

describe("ListaMembros", () => {
  it("mostra só os nomes dos times, quem modera e quem está pronto", () => {
    const g = grupo({ status: "inscricoes", membros: [...grupo().membros.slice(0, 1), { id: "m3", nomeTime: null, pronto: false, convidado: true, moderador: false, seuTime: false, montagem: null }] });
    render(<ListaMembros grupo={g} />);
    expect(screen.getByLabelText("Moderador")).toBeInTheDocument();
    expect(screen.getByText("Sem nome ainda")).toBeInTheDocument();
    expect(screen.getByText("Pronto")).toBeInTheDocument();
    expect(screen.getByText("Aguardando")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /2 de 32/ })).toBeInTheDocument();
  });
});
