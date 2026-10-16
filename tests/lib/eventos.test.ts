import { describe, expect, it } from "vitest";
import { eventosAte, eventosDaPartida, minutoDoEvento } from "@/lib/eventos";

const gol = (minuto: number, doSeuTime: boolean, jogadorNome = "Fulano") => ({ minuto, doSeuTime, jogadorId: jogadorNome, jogadorNome });

describe("eventosDaPartida", () => {
  it("tempo normal: início, gols no lugar certo, intervalo e fim com o placar", () => {
    const eventos = eventosDaPartida({ prorrogacao: false, penaltis: null, gols: [gol(70, false, "Rival"), gol(12, true, "Amoroso"), gol(45, true, "Grafite")] });
    expect(eventos.map((e) => e.tipo)).toEqual(["inicio", "gol", "gol", "fim_primeiro_tempo", "inicio_segundo_tempo", "gol", "fim_de_jogo"]);
    expect(eventos[2]).toMatchObject({ jogadorNome: "Grafite", placar: { pro: 2, contra: 0 } });
    expect(eventos[3]).toMatchObject({ placar: { pro: 2, contra: 0 } });
    expect(eventos.at(-1)).toMatchObject({ placar: { pro: 2, contra: 1 }, penaltis: null });
    expect(eventos.map((e) => minutoDoEvento(e, { prorrogacao: false }))).toEqual(["0'", "12'", "45'", "45'", "46'", "70'", "90'"]);
  });

  it("prorrogação e pênaltis: cada cobrança com o placar da disputa", () => {
    const partida = {
      prorrogacao: true,
      gols: [gol(30, true), gol(80, false), gol(110, true), gol(118, false)],
      penaltis: [
        { doSeuTime: true, jogadorNome: "A", convertido: true },
        { doSeuTime: false, jogadorNome: "B", convertido: false },
        { doSeuTime: true, jogadorNome: "C", convertido: true },
      ],
    };
    const eventos = eventosDaPartida(partida);
    expect(eventos.map((e) => e.tipo)).toEqual([
      "inicio",
      "gol",
      "fim_primeiro_tempo",
      "inicio_segundo_tempo",
      "gol",
      "fim_tempo_normal",
      "inicio_prorrogacao",
      "intervalo_prorrogacao",
      "gol",
      "gol",
      "fim_prorrogacao",
      "inicio_penaltis",
      "penalti",
      "penalti",
      "penalti",
      "fim_de_jogo",
    ]);
    expect(eventos.at(-2)).toMatchObject({ placar: { pro: 2, contra: 0 } });
    expect(eventos.at(-1)).toMatchObject({ placar: { pro: 2, contra: 2 }, penaltis: { pro: 2, contra: 0 }, passo: 123 });
    expect(minutoDoEvento(eventos.at(-1)!, partida)).toBeNull();
  });

  it("ao vivo: só o que já aconteceu até o passo", () => {
    const partida = { prorrogacao: false, penaltis: null, gols: [gol(50, true)] };
    expect(eventosAte(partida, 0).map((e) => e.tipo)).toEqual(["inicio"]);
    expect(eventosAte(partida, 45).map((e) => e.tipo)).toEqual(["inicio", "fim_primeiro_tempo"]);
    expect(eventosAte(partida, 50).map((e) => e.tipo)).toEqual(["inicio", "fim_primeiro_tempo", "inicio_segundo_tempo", "gol"]);
    expect(eventosAte(partida, 90).at(-1)!.tipo).toBe("fim_de_jogo");
  });
});
