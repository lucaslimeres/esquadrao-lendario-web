import { describe, expect, it } from "vitest";
import { decorridoAoVivo, naPerspectiva, relogioDoServidor } from "@/lib/grupo";
import { duracaoDaRevelacao, passoNoTempo, RITMO } from "@/lib/ritmo";
import { partidaGrupo } from "../fixtures/grupo";

describe("naPerspectiva", () => {
  it("lado B vira o 'seu time': placar, gols, pênaltis e resultado invertidos", () => {
    const p = naPerspectiva(partidaGrupo(), "b");
    expect(p).toMatchObject({ golsPro: 1, golsContra: 1, penaltisPro: 4, penaltisContra: 3, resultado: "V" });
    expect(p.adversario?.rotulo).toBe("Ana FC");
    expect(p.gols.map((g) => g.doSeuTime)).toEqual([false, true]);
    expect(p.penaltis?.[0]?.doSeuTime).toBe(false);
  });

  it("sem time (visão neutra) usa o lado A", () => {
    const p = naPerspectiva(partidaGrupo(), null);
    expect(p).toMatchObject({ resultado: "D", penaltisPro: 3 });
    expect(p.adversario?.rotulo).toBe("Beto United");
  });
});

describe("partida ao vivo sincronizada", () => {
  it("os dois entram no mesmo passo a partir do apito do servidor", () => {
    const p = naPerspectiva(partidaGrupo({ prorrogacao: false, penaltis: null, gols: [] }), null);
    expect(passoNoTempo(p, 0)).toEqual({ passo: 0, restante: RITMO.inicio });
    expect(passoNoTempo(p, RITMO.inicio + 50)).toEqual({ passo: 1, restante: RITMO.minuto - 50 });
    expect(passoNoTempo(p, duracaoDaRevelacao(p) + 1).passo).toBe(90);
  });

  it("decorridoAoVivo: só enquanto a revelação não acabou, pelo relógio do servidor", () => {
    const p = partidaGrupo();
    const apito = Date.parse(p.simuladaEm!);
    expect(decorridoAoVivo(p, apito + 2_000)).toBe(2_000);
    expect(decorridoAoVivo(p, apito + 10 * 60_000)).toBeNull();
    expect(decorridoAoVivo({ ...p, simulada: false, simuladaEm: null }, apito)).toBeNull();
  });

  it("relógio do servidor corrige o relógio do aparelho", () => {
    const recebidoEm = Date.now();
    const relogio = relogioDoServidor({ agora: new Date(recebidoEm + 5_000).toISOString() }, recebidoEm);
    expect(Math.abs(relogio() - (Date.now() + 5_000))).toBeLessThan(50);
  });
});
