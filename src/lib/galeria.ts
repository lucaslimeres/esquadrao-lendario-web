import { NOME_POSICAO } from "./jogo";
import type { Galeria, TituloGaleria } from "./tipos";

/** Query keys shared by the pages and the build-time prerender. */
export const CHAVES = {
  galeria: ["galeria"] as const,
  titulo: (competicao: string, temporada: number) => ["galeria", competicao, temporada] as const,
  estatisticas: ["estatisticas"] as const,
};

export const caminhoTitulo = (competicao: string, temporada: number) => `/campeoes/${competicao}/${temporada}`;

const numero = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });
export const formatar = (n: number) => numero.format(n);

const ordinal = (n: number) => `${n}º`;

/** "1 vez" / "3 vezes". */
export const vezes = (n: number) => `${formatar(n)} ${n === 1 ? "vez" : "vezes"}`;

/**
 * The squad page's lead paragraphs, written from the data (title, star, best XI, how it ranks
 * among the competition's champions and how players use it in the game).
 */
export function textoDoTitulo(t: TituloGaleria): string[] {
  const craque = [...t.jogadores].sort((a, b) => b.overall - a.overall)[0];
  const paragrafos = [
    `${t.equipe.nome} conquistou a ${t.competicao.nome} de ${t.temporada}. No Esquadrão Lendário, esse elenco campeão tem ${t.jogadores.length} jogadores${
      craque ? `, e o destaque é ${craque.nome} (${NOME_POSICAO[craque.posicao].toLowerCase()}, overall ${craque.overall})` : ""
    }.`,
  ];
  if (t.melhorXI.overall !== null) {
    const comparacao =
      t.melhorXI.overall > t.ranking.mediaOverall ? "acima" : t.melhorXI.overall < t.ranking.mediaOverall ? "abaixo" : "na";
    paragrafos.push(
      `Escalado no ${t.melhorXI.formacao} com o melhor jogador disponível em cada vaga, o time chega a overall ${formatar(t.melhorXI.overall)}, ${
        comparacao === "na" ? "exatamente na" : `${comparacao} da`
      } média dos campeões da competição (${formatar(t.ranking.mediaOverall)}). É o ${ordinal(t.ranking.posicao)} elenco mais forte entre os ${t.ranking.total} campeões da ${t.competicao.nome} na base do jogo.`,
    );
  }
  if (t.uso.vezesSorteado > 0) {
    const preferido = t.uso.maisEscolhidos[0];
    paragrafos.push(
      `Nas campanhas dos jogadores, o elenco já saiu no sorteio ${vezes(t.uso.vezesSorteado)}${
        preferido ? `, e ${preferido.nome} é o craque mais levado para os esquadrões (${vezes(preferido.vezesEscalado)})` : ""
      }.`,
    );
  }
  return paragrafos;
}

/** The competition page's lead: span of titles, number of clubs, the strongest squad. */
export function textoDaCompeticao(c: Galeria["competicoes"][number]): string {
  if (c.titulos.length === 0) return "";
  const anos = c.titulos.map((t) => t.temporada);
  const clubes = new Map<string, number>();
  for (const t of c.titulos) clubes.set(t.equipe.nome, (clubes.get(t.equipe.nome) ?? 0) + 1);
  const [maior, vezesMaior] = [...clubes.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0]!;
  const forte = [...c.titulos].sort((a, b) => (b.overallTime ?? 0) - (a.overallTime ?? 0))[0]!;
  const partes = [
    c.titulos.length === 1
      ? `A galeria tem 1 elenco campeão da ${c.nome}, de ${anos[0]}.`
      : `A galeria reúne ${c.titulos.length} elencos campeões da ${c.nome}, de ${Math.min(...anos)} a ${Math.max(...anos)}, ${
          clubes.size === 1 ? "todos do mesmo clube" : `de ${clubes.size} clubes diferentes`
        }.`,
  ];
  if (vezesMaior > 1) partes.push(`${maior} é o clube com mais títulos na base: ${vezesMaior}.`);
  if (forte.overallTime !== null) partes.push(`O elenco mais forte é ${forte.equipe.nome} ${forte.temporada}, com overall ${formatar(forte.overallTime)} no melhor XI.`);
  return partes.join(" ");
}
