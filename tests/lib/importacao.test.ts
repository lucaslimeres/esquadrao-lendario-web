import { describe, expect, it } from "vitest";
import { alternarFonte, bloqueiaPublicacao, emAndamento, moverFonte } from "@/lib/importacao";

describe("ordem das fontes", () => {
  it("marca no fim da fila e desmarca mantendo a ordem", () => {
    expect(alternarFonte(["wikipedia-en"], "wikidata")).toEqual(["wikipedia-en", "wikidata"]);
    expect(alternarFonte(["wikipedia-en", "wikidata"], "wikipedia-en")).toEqual(["wikidata"]);
  });

  it("sobe e desce sem sair da lista", () => {
    expect(moverFonte(["a", "b", "c"], "c", -1)).toEqual(["a", "c", "b"]);
    expect(moverFonte(["a", "b"], "a", -1)).toEqual(["a", "b"]);
    expect(moverFonte(["a", "b"], "b", 1)).toEqual(["a", "b"]);
    expect(moverFonte(["a", "b"], "x", 1)).toEqual(["a", "b"]);
  });

  it("status e avisos", () => {
    expect(emAndamento("processando")).toBe(true);
    expect(emAndamento("concluida")).toBe(false);
    expect(bloqueiaPublicacao("Para publicar: O elenco precisa de pelo menos um goleiro (GOL)")).toBe(true);
    expect(bloqueiaPublicacao("Wikidata: lista ampla")).toBe(false);
  });
});
