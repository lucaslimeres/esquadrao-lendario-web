import type { PartidaGrupo, TimeGrupo } from "@/lib/tipos";

export const time = (id: string, nome: string, seuTime = false): TimeGrupo => ({
  id,
  grupo: "A",
  eliminado: false,
  seuTime,
  membro: true,
  nome,
  elenco: { id, temporada: null, rotulo: nome, equipe: { nome, sigla: nome.slice(0, 3).toUpperCase(), pais: null, corPrimaria: "#201E1D", corSecundaria: "#F3F2F2" } },
});

export function partidaGrupo(extra: Partial<PartidaGrupo> = {}): PartidaGrupo {
  return {
    id: "p1",
    fase: "oitavas",
    rodada: 1,
    grupo: null,
    timeA: time("a", "Ana FC"),
    timeB: time("b", "Beto United"),
    prontoA: true,
    prontoB: true,
    simulada: true,
    simuladaEm: "2026-10-16T12:00:00.000Z",
    golsA: 1,
    golsB: 1,
    prorrogacao: true,
    penaltisA: 3,
    penaltisB: 4,
    vencedor: "b",
    gols: [
      { minuto: 10, lado: "a", jogadorId: "j1", jogadorNome: "Zico" },
      { minuto: 70, lado: "b", jogadorId: "j2", jogadorNome: "Raí" },
    ],
    penaltis: [{ lado: "a", jogadorNome: "Zico", convertido: true }],
    ...extra,
  };
}
