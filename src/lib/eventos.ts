import type { PartidaCampanha } from "./tipos";

/*
 * Match timeline (kickoff, goals, half-time, extra time, penalties, full time), built from
 * what the API already simulated: goal minutes, extra time and each penalty kick. Nothing
 * is decided here; it only puts those facts in order. Shared with the mobile app
 * (lib/eventos.ts there): keep both copies in sync.
 *
 * `passo` follows the live reveal (lib/ritmo.ts): 0…duração are minutes, then one step
 * per penalty kick. An event shows up once the reveal reaches its step.
 */

type Placar = { pro: number; contra: number };

export type Evento =
  | { tipo: "inicio"; passo: number }
  | { tipo: "fim_primeiro_tempo"; passo: number; placar: Placar }
  | { tipo: "inicio_segundo_tempo"; passo: number }
  | { tipo: "fim_tempo_normal"; passo: number; placar: Placar }
  | { tipo: "inicio_prorrogacao"; passo: number }
  | { tipo: "intervalo_prorrogacao"; passo: number; placar: Placar }
  | { tipo: "fim_prorrogacao"; passo: number; placar: Placar }
  | { tipo: "inicio_penaltis"; passo: number }
  | { tipo: "gol"; passo: number; minuto: number; doSeuTime: boolean; jogadorNome: string; placar: Placar }
  | { tipo: "penalti"; passo: number; doSeuTime: boolean; jogadorNome: string; convertido: boolean; placar: Placar }
  | { tipo: "fim_de_jogo"; passo: number; placar: Placar; penaltis: Placar | null };

export const TITULO_EVENTO: Record<Exclude<Evento["tipo"], "gol" | "penalti">, string> = {
  inicio: "Partida iniciada",
  fim_primeiro_tempo: "Fim do 1º tempo",
  inicio_segundo_tempo: "Início do 2º tempo",
  fim_tempo_normal: "Fim do tempo normal",
  inicio_prorrogacao: "Início da prorrogação",
  intervalo_prorrogacao: "Intervalo da prorrogação",
  fim_prorrogacao: "Fim da prorrogação",
  inicio_penaltis: "Disputa de pênaltis",
  fim_de_jogo: "Fim de jogo",
};

/** Minute shown next to an event ("45'"), or null for the penalty shootout. */
export function minutoDoEvento(e: Evento, partida: Pick<PartidaCampanha, "prorrogacao">): string | null {
  switch (e.tipo) {
    case "gol":
      return `${e.minuto}'`;
    case "inicio":
      return "0'";
    case "inicio_segundo_tempo":
      return "46'";
    case "inicio_prorrogacao":
      return "91'";
    case "fim_primeiro_tempo":
    case "fim_tempo_normal":
    case "intervalo_prorrogacao":
    case "fim_prorrogacao":
      return `${e.passo}'`;
    case "fim_de_jogo":
      return e.penaltis ? null : `${partida.prorrogacao ? 120 : 90}'`;
    default:
      return null;
  }
}

/** Every event of a played match, in order. */
export function eventosDaPartida(partida: Pick<PartidaCampanha, "prorrogacao" | "gols" | "penaltis">): Evento[] {
  const duracao = partida.prorrogacao ? 120 : 90;
  const gols = [...partida.gols].sort((a, b) => a.minuto - b.minuto);
  const placar = { pro: 0, contra: 0 };
  const eventos: Evento[] = [{ tipo: "inicio", passo: 0 }];

  const golsAte = (minuto: number) => {
    while (gols.length > 0 && gols[0]!.minuto <= minuto) {
      const g = gols.shift()!;
      if (g.doSeuTime) placar.pro++;
      else placar.contra++;
      eventos.push({ tipo: "gol", passo: g.minuto, minuto: g.minuto, doSeuTime: g.doSeuTime, jogadorNome: g.jogadorNome, placar: { ...placar } });
    }
  };

  golsAte(45);
  eventos.push({ tipo: "fim_primeiro_tempo", passo: 45, placar: { ...placar } });
  eventos.push({ tipo: "inicio_segundo_tempo", passo: 46 });
  golsAte(90);
  if (partida.prorrogacao) {
    eventos.push({ tipo: "fim_tempo_normal", passo: 90, placar: { ...placar } });
    eventos.push({ tipo: "inicio_prorrogacao", passo: 91 });
    golsAte(105);
    eventos.push({ tipo: "intervalo_prorrogacao", passo: 105, placar: { ...placar } });
    golsAte(120);
    eventos.push({ tipo: "fim_prorrogacao", passo: 120, placar: { ...placar } });
  }
  golsAte(Infinity);

  const cobrancas = partida.penaltis ?? [];
  let penaltis: Placar | null = null;
  if (cobrancas.length > 0) {
    penaltis = { pro: 0, contra: 0 };
    eventos.push({ tipo: "inicio_penaltis", passo: duracao });
    cobrancas.forEach((c, i) => {
      if (c.convertido) {
        if (c.doSeuTime) penaltis!.pro++;
        else penaltis!.contra++;
      }
      eventos.push({ tipo: "penalti", passo: duracao + i + 1, doSeuTime: c.doSeuTime, jogadorNome: c.jogadorNome, convertido: c.convertido, placar: { ...penaltis! } });
    });
  }
  eventos.push({ tipo: "fim_de_jogo", passo: duracao + cobrancas.length, placar: { ...placar }, penaltis });
  return eventos;
}

/** Events already revealed at `passo` of the live match. */
export function eventosAte(partida: Pick<PartidaCampanha, "prorrogacao" | "gols" | "penaltis">, passo: number): Evento[] {
  return eventosDaPartida(partida).filter((e) => e.passo <= passo);
}
