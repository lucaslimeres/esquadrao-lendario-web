import { describe, expect, it } from "vitest";
import { atrasoDoPasso, etapaDoPasso, RITMO } from "@/lib/ritmo";
import type { PartidaCampanha } from "@/lib/tipos";

const gol = (minuto: number, doSeuTime: boolean) => ({ minuto, doSeuTime, jogadorId: "x", jogadorNome: "X" });
const partida = (extra: Partial<PartidaCampanha> = {}) =>
  ({ prorrogacao: false, penaltis: null, gols: [gol(30, true)], ...extra }) as Pick<PartidaCampanha, "prorrogacao" | "penaltis" | "gols">;

describe("ritmo da partida ao vivo", () => {
  it("pausa no início, no intervalo e em cada gol", () => {
    expect(atrasoDoPasso(0, partida())).toBe(RITMO.inicio);
    expect(atrasoDoPasso(30, partida())).toBe(RITMO.gol);
    expect(atrasoDoPasso(45, partida())).toBe(RITMO.intervalo);
    expect(atrasoDoPasso(20, partida())).toBe(RITMO.minuto);
  });

  it("final do jogo mais lento só quando o placar está apertado", () => {
    expect(atrasoDoPasso(85, partida())).toBe(RITMO.minutoTenso);
    expect(atrasoDoPasso(85, partida({ gols: [gol(10, true), gol(20, true), gol(30, true)] }))).toBe(RITMO.minuto);
  });

  it("prorrogação e pênaltis, um de cada vez", () => {
    const p = partida({ prorrogacao: true, penaltis: [{ doSeuTime: true, jogadorNome: "A", convertido: true }] });
    expect(atrasoDoPasso(90, p)).toBe(RITMO.antesDaProrrogacao);
    expect(atrasoDoPasso(120, p)).toBe(RITMO.antesDosPenaltis);
    expect(atrasoDoPasso(121, p)).toBe(RITMO.penalti);
    expect([0, 20, 45, 60, 100, 120, 121].map((n) => etapaDoPasso(n, p))).toEqual(["inicio", "primeiro_tempo", "intervalo", "segundo_tempo", "prorrogacao", "penaltis", "fim"]);
  });

  it("um jogo normal dura uns 12 a 18 segundos", () => {
    const p = partida({ gols: [gol(12, true), gol(70, false), gol(88, true)] });
    const total = Array.from({ length: 90 }, (_, i) => atrasoDoPasso(i, p)).reduce((a, b) => a + b, 0);
    expect(total).toBeGreaterThan(12_000);
    expect(total).toBeLessThan(18_000);
  });
});
