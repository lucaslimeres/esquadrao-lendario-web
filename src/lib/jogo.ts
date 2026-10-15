import type { Fase, PartidaCampanha, Posicao, StatusCampanha } from "./tipos";

export type Raridade = "bronze" | "prata" | "ouro" | "lendario";

/** Card rarity by overall (brand guide): bronze ≤74 · prata 75–82 · ouro 83–88 · lendário 89+. */
export function raridade(overall: number): Raridade {
  if (overall >= 89) return "lendario";
  if (overall >= 83) return "ouro";
  if (overall >= 75) return "prata";
  return "bronze";
}

export const NOME_RARIDADE: Record<Raridade, string> = { bronze: "Bronze", prata: "Prata", ouro: "Ouro", lendario: "Lendário" };

export const NOME_POSICAO: Record<Posicao, string> = {
  GOL: "Goleiro",
  ZAG: "Zagueiro",
  LAT: "Lateral",
  VOL: "Volante",
  MEI: "Meia",
  PON: "Ponta",
  ATA: "Atacante",
};

export const NOME_FASE: Record<Fase, string> = {
  grupo: "Fase de grupos",
  dezesseis_avos: "Dezesseis-avos",
  oitavas: "Oitavas",
  quartas: "Quartas",
  semifinal: "Semifinal",
  final: "Final",
};

/** "Caiu nas quartas" / "Caiu na fase de grupos" / "na final". */
export function textoEliminacao(fase: Fase | null): string {
  if (!fase) return "Fim da linha";
  if (fase === "grupo") return "Caiu na fase de grupos";
  if (fase === "final") return "Vice-campeão";
  if (fase === "semifinal") return "Caiu na semifinal";
  return `Caiu nas ${NOME_FASE[fase].toLowerCase()}`;
}

export const NOME_STATUS: Record<StatusCampanha, string> = {
  montagem: "Montando o time",
  pronta: "Time pronto",
  em_andamento: "Em andamento",
  campea: "Campeão",
  eliminada: "Eliminado",
};

/** Slot label as the player reads it: "ZAG_2" → "Zagueiro 2" (number only when repeated). */
export function nomeVaga(codigo: string, repetida: boolean): string {
  const [posicao, numero] = codigo.split("_") as [Posicao, string];
  const nome = NOME_POSICAO[posicao] ?? posicao;
  return repetida ? `${nome} ${numero}` : nome;
}

export function placar(pro: number | null, contra: number | null): string {
  return pro === null || contra === null ? "–" : `${pro}–${contra}`;
}

/** Black or white text depending on the background luminance. */
export function contraste(hex: string): string {
  const n = Number.parseInt(hex.replace("#", ""), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return 0.299 * r + 0.587 * g + 0.114 * b > 150 ? "#201E1D" : "#FFFFFF";
}

export function fraseFinal(p: PartidaCampanha): string {
  if (p.resultado === "V") {
    if (p.fase === "final") return "É campeão!";
    if (p.penaltisPro !== null) return "Classificado nos pênaltis!";
    if ((p.golsPro ?? 0) - (p.golsContra ?? 0) >= 3) return "Chocolate!";
    return "Vitória!";
  }
  if (p.resultado === "E") return "Empate.";
  if (p.penaltisPro !== null) return "Caiu nos pênaltis…";
  return "Derrota.";
}

export function linkCompartilhamento(codigo: string): string {
  return `${window.location.origin}/c/${codigo}`;
}
