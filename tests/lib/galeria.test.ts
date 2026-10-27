import { describe, expect, it } from "vitest";
import { caminhoTitulo, textoDaCompeticao, textoDoTitulo, vezes } from "@/lib/galeria";
import type { Galeria, TituloGaleria } from "@/lib/tipos";

const equipe = (nome: string) => ({ nome, sigla: nome.slice(0, 3).toUpperCase(), pais: "Brasil", corPrimaria: "#1F5F3F", corSecundaria: "#F3F2F2" });

const titulo: TituloGaleria = {
  competicao: { slug: "libertadores", nome: "Libertadores", descricao: null, formato: "grupos_mata_mata" },
  temporada: 2005,
  equipe: equipe("São Paulo"),
  jogadores: [
    { nome: "Rogério Ceni", posicao: "GK", posicoesSecundarias: [], overall: 90, vezesEscalado: 4 },
    { nome: "Lugano", posicao: "CB", posicoesSecundarias: [], overall: 88, vezesEscalado: 1 },
  ],
  melhorXI: { formacao: "4-4-2", overall: 84.5, escalacao: [] },
  ranking: { posicao: 2, total: 30, mediaOverall: 82 },
  uso: { vezesSorteado: 1, vezesEscalados: 5, maisEscolhidos: [{ nome: "Rogério Ceni", posicao: "GK", overall: 90, vezesEscalado: 4 }] },
  anterior: null,
  proximo: null,
  outrosTitulos: [],
};

describe("galeria de campeões", () => {
  it("escreve o texto do título a partir dos dados, sem artigo antes do nome do time", () => {
    const [abertura, forca, uso] = textoDoTitulo(titulo);
    expect(abertura).toBe(
      "São Paulo conquistou a Libertadores de 2005. No Esquadrão Lendário, esse elenco campeão tem 2 jogadores, e o destaque é Rogério Ceni (goleiro, overall 90).",
    );
    expect(forca).toContain("overall 84,5, acima da média dos campeões da competição (82)");
    expect(forca).toContain("É o 2º elenco mais forte entre os 30 campeões da Libertadores");
    expect(uso).toBe("Nas campanhas dos jogadores, o elenco já saiu no sorteio 1 vez, e Rogério Ceni é o craque mais levado para os esquadrões (4 vezes).");
  });

  it("deixa de fora força e uso quando não há dados", () => {
    const texto = textoDoTitulo({ ...titulo, melhorXI: { ...titulo.melhorXI, overall: null }, uso: { vezesSorteado: 0, vezesEscalados: 0, maisEscolhidos: [] } });
    expect(texto).toHaveLength(1);
  });

  it("resume a competição: anos, clubes, maior campeão e elenco mais forte", () => {
    const resumo = (temporada: number, nome: string, overallTime: number | null) => ({ temporada, equipe: equipe(nome), overallTime, totalJogadores: 20, craque: null, vezesSorteado: 0 });
    const c: Galeria["competicoes"][number] = {
      slug: "libertadores",
      nome: "Libertadores",
      descricao: null,
      formato: "grupos_mata_mata",
      titulos: [resumo(2005, "São Paulo", 84), resumo(1993, "São Paulo", 83), resumo(1981, "Flamengo", 86)],
    };
    expect(textoDaCompeticao(c)).toBe(
      "A galeria reúne 3 elencos campeões da Libertadores, de 1981 a 2005, de 2 clubes diferentes. São Paulo é o clube com mais títulos na base: 2. O elenco mais forte é Flamengo 1981, com overall 86 no melhor XI.",
    );
    expect(textoDaCompeticao({ ...c, titulos: [c.titulos[0]!] })).toBe(
      "A galeria tem 1 elenco campeão da Libertadores, de 2005. O elenco mais forte é São Paulo 2005, com overall 84 no melhor XI.",
    );
    expect(textoDaCompeticao({ ...c, titulos: [c.titulos[0]!, c.titulos[1]!] })).toContain("de 1993 a 2005, todos do mesmo clube.");
    expect(textoDaCompeticao({ ...c, titulos: [] })).toBe("");
  });

  it("helpers", () => {
    expect(caminhoTitulo("libertadores", 2005)).toBe("/campeoes/libertadores/2005");
    expect(vezes(1)).toBe("1 vez");
    expect(vezes(1200)).toBe("1.200 vezes");
  });
});
