import { duracaoDaRevelacao } from "./ritmo";
import type { Grupo, PartidaCampanha, PartidaGrupo, StatusGrupo, TimeGrupo } from "./tipos";

/** Campanha em grupo: helpers to show the API's neutral (A × B) data from the player's side. */

export const NOME_STATUS_GRUPO: Record<StatusGrupo, string> = {
  inscricoes: "Inscrições abertas",
  montagem: "Montando os times",
  em_andamento: "Torneio rolando",
  encerrado: "Encerrado",
};

export const linkDoGrupo = (codigo: string) => `${window.location.origin}/grupos/${codigo}`;

/** The match as the solo screens expect it: "pro" is `meuTimeId`'s side (side A when neither). */
export function naPerspectiva(p: PartidaGrupo, meuTimeId: string | null): PartidaCampanha {
  const souB = meuTimeId !== null && p.timeB?.id === meuTimeId;
  const eu: "a" | "b" = souB ? "b" : "a";
  const pro = souB ? p.golsB : p.golsA;
  const contra = souB ? p.golsA : p.golsB;
  const resultado = !p.vencedor ? null : p.vencedor === "empate" ? "E" : p.vencedor === eu ? "V" : "D";
  return {
    id: p.id,
    fase: p.fase,
    rodada: p.rodada,
    adversario: (souB ? p.timeA : p.timeB)?.elenco ?? null,
    simulada: p.simulada,
    golsPro: pro,
    golsContra: contra,
    prorrogacao: p.prorrogacao,
    penaltisPro: souB ? p.penaltisB : p.penaltisA,
    penaltisContra: souB ? p.penaltisA : p.penaltisB,
    resultado,
    gols: p.gols.map((g) => ({ minuto: g.minuto, doSeuTime: g.lado === eu, jogadorId: g.jogadorId, jogadorNome: g.jogadorNome })),
    penaltis: p.penaltis?.map((c) => ({ doSeuTime: c.lado === eu, jogadorNome: c.jogadorNome, convertido: c.convertido })) ?? null,
  };
}

/** My side's name in a match (the team on the left of the scoreboard). */
export function meuLado(p: PartidaGrupo, meuTimeId: string | null): TimeGrupo | null {
  return meuTimeId !== null && p.timeB?.id === meuTimeId ? p.timeB : p.timeA;
}

/** Server time now, from the `agora` the API sent and when the response arrived. */
export function relogioDoServidor(grupo: Pick<Grupo, "agora">, recebidoEm: number): () => number {
  const diferenca = Date.parse(grupo.agora) - recebidoEm;
  return () => Date.now() + diferenca;
}

/**
 * How far into the live reveal a match is (ms), or null when it already ended. Both players of
 * a match start from the same kick-off (`simuladaEm`), so they watch the same minute together.
 */
export function decorridoAoVivo(p: PartidaGrupo, agoraServidor: number): number | null {
  if (!p.simulada || !p.simuladaEm) return null;
  const decorrido = Math.max(0, agoraServidor - Date.parse(p.simuladaEm));
  return decorrido < duracaoDaRevelacao(naPerspectiva(p, null)) ? decorrido : null;
}
