import { describe, expect, it } from "vitest";
import { contraste, fraseFinal, nomeVaga, raridade, textoEliminacao } from "@/lib/jogo";
import type { PartidaCampanha } from "@/lib/tipos";

const partida = (p: Partial<PartidaCampanha>): PartidaCampanha => ({
  id: "p", fase: "oitavas", rodada: 1, adversario: null, simulada: true, golsPro: 1, golsContra: 0,
  prorrogacao: false, penaltisPro: null, penaltisContra: null, resultado: "V", gols: [], penaltis: null, ...p,
});

describe("regras de exibição", () => {
  it("raridade segue as faixas do guia de marca", () => {
    expect([74, 75, 82, 83, 88, 89].map(raridade)).toEqual(["bronze", "prata", "prata", "ouro", "ouro", "lendario"]);
  });

  it("nome da vaga só numera posição repetida", () => {
    expect(nomeVaga("ZAG_2", true)).toBe("Zagueiro 2");
    expect(nomeVaga("GOL_1", false)).toBe("Goleiro");
  });

  it("texto de eliminação por fase", () => {
    expect(textoEliminacao("grupo")).toBe("Caiu na fase de grupos");
    expect(textoEliminacao("quartas")).toBe("Caiu nas quartas");
    expect(textoEliminacao("final")).toBe("Vice-campeão");
  });

  it("frase do fim de jogo", () => {
    expect(fraseFinal(partida({ golsPro: 4, golsContra: 0 }))).toBe("Chocolate!");
    expect(fraseFinal(partida({ golsPro: 1, golsContra: 1, penaltisPro: 4, penaltisContra: 3 }))).toBe("Classificado nos pênaltis!");
    expect(fraseFinal(partida({ resultado: "D", golsPro: 1, golsContra: 1, penaltisPro: 2, penaltisContra: 4 }))).toBe("Caiu nos pênaltis…");
    expect(fraseFinal(partida({ fase: "final" }))).toBe("É campeão!");
    expect(fraseFinal(partida({ fase: "grupo", resultado: "E", golsPro: 0, golsContra: 0 }))).toBe("Empate.");
  });

  it("contraste do distintivo genérico", () => {
    expect(contraste("#FFFFFF")).toBe("#201E1D");
    expect(contraste("#1F5F3F")).toBe("#FFFFFF");
  });
});
