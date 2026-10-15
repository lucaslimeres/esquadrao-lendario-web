import type { PartidaCampanha } from "./tipos";

/**
 * Pace of the live match reveal (the API already simulated it; this only builds suspense).
 * Roughly 12–18 s per match: a beat at kickoff and half-time, a pause on every goal,
 * the last minutes slower when the score is tight, and one penalty kick at a time.
 */
export const RITMO = {
  minuto: 100,
  minutoTenso: 220,
  inicio: 1_000,
  intervalo: 1_600,
  antesDaProrrogacao: 1_600,
  gol: 1_800,
  antesDosPenaltis: 1_800,
  penalti: 1_400,
} as const;

export type Etapa = "inicio" | "primeiro_tempo" | "intervalo" | "segundo_tempo" | "prorrogacao" | "penaltis" | "fim";

export const NOME_ETAPA: Record<Etapa, string> = {
  inicio: "Bola rolando!",
  primeiro_tempo: "1º tempo",
  intervalo: "Intervalo",
  segundo_tempo: "2º tempo",
  prorrogacao: "Prorrogação",
  penaltis: "Pênaltis",
  fim: "Fim de jogo",
};

/** Timeline step: 0…duração are minutes, then one step per penalty kick. */
export function etapaDoPasso(passo: number, partida: Pick<PartidaCampanha, "prorrogacao" | "penaltis">): Etapa {
  const duracao = partida.prorrogacao ? 120 : 90;
  const fim = duracao + (partida.penaltis?.length ?? 0);
  if (passo >= fim) return "fim";
  if (passo === 0) return "inicio";
  if (passo >= duracao && (partida.penaltis?.length ?? 0) > 0) return "penaltis";
  if (passo === 45) return "intervalo";
  if (passo > 90) return "prorrogacao";
  return passo < 45 ? "primeiro_tempo" : "segundo_tempo";
}

/** How long to stay on `passo` before showing the next one. */
export function atrasoDoPasso(passo: number, partida: Pick<PartidaCampanha, "prorrogacao" | "penaltis" | "gols">): number {
  const duracao = partida.prorrogacao ? 120 : 90;
  if (passo === 0) return RITMO.inicio;
  if (passo > duracao) return RITMO.penalti;
  if (passo === duracao && (partida.penaltis?.length ?? 0) > 0) return RITMO.antesDosPenaltis;
  if (partida.gols.some((g) => g.minuto === passo)) return RITMO.gol;
  if (passo === 45) return RITMO.intervalo;
  if (passo === 90 && partida.prorrogacao) return RITMO.antesDaProrrogacao;
  const fimDoTempo = (passo >= 80 && passo < 90) || passo >= 110;
  if (fimDoTempo) {
    const ate = partida.gols.filter((g) => g.minuto <= passo);
    const diferenca = Math.abs(ate.filter((g) => g.doSeuTime).length - ate.filter((g) => !g.doSeuTime).length);
    if (diferenca <= 1) return RITMO.minutoTenso;
  }
  return RITMO.minuto;
}
