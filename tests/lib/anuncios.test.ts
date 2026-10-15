import { describe, expect, it } from "vitest";
import { normalizarCliente } from "@/lib/anuncios";

describe("normalizarCliente", () => {
  it("aceita ca-pub e pub, e devolve sempre ca-pub", () => {
    expect(normalizarCliente("ca-pub-1234567890123456")).toBe("ca-pub-1234567890123456");
    expect(normalizarCliente(" pub-1234567890123456 ")).toBe("ca-pub-1234567890123456");
  });

  it("vazio ou fora do formato desliga os anúncios", () => {
    expect(normalizarCliente(undefined)).toBeNull();
    expect(normalizarCliente("")).toBeNull();
    expect(normalizarCliente("1234567890123456")).toBeNull();
    expect(normalizarCliente("ca-pub-abc")).toBeNull();
  });
});
