import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, configurarAuth, request } from "@/lib/api";

function respostaFetch(status: number, corpo: unknown) {
  return vi.fn().mockResolvedValue(new Response(JSON.stringify(corpo), { status, headers: { "Content-Type": "application/json" } }));
}

afterEach(() => {
  vi.unstubAllGlobals();
  configurarAuth(() => null, () => {});
});

describe("cliente da API", () => {
  it("envia o token da sessão e devolve o JSON", async () => {
    const fetch = respostaFetch(200, { ok: true });
    vi.stubGlobal("fetch", fetch);
    configurarAuth(() => "tok-123", () => {});
    expect(await request("/me")).toEqual({ ok: true });
    expect(fetch.mock.calls[0]![1].headers.Authorization).toBe("Bearer tok-123");
  });

  it("rotas públicas não mandam token", async () => {
    const fetch = respostaFetch(200, []);
    vi.stubGlobal("fetch", fetch);
    configurarAuth(() => "tok-123", () => {});
    await request("/competicoes", { autenticado: false });
    expect(fetch.mock.calls[0]![1].headers.Authorization).toBeUndefined();
  });

  it("erro da API vira ApiError com a mensagem em pt-BR", async () => {
    vi.stubGlobal("fetch", respostaFetch(409, { erro: "Seus re-sorteios acabaram.", codigo: "resorteios_esgotados" }));
    await expect(request("/x", { method: "POST" })).rejects.toMatchObject({ status: 409, message: "Seus re-sorteios acabaram.", codigo: "resorteios_esgotados" });
  });

  it("401 com token derruba a sessão", async () => {
    const perdeu = vi.fn();
    vi.stubGlobal("fetch", respostaFetch(401, { erro: "Sessão inválida", codigo: "unauthorized" }));
    configurarAuth(() => "expirado", perdeu);
    await expect(request("/me")).rejects.toBeInstanceOf(ApiError);
    expect(perdeu).toHaveBeenCalledOnce();
  });

  it("falha de rede vira mensagem amigável", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    await expect(request("/competicoes")).rejects.toMatchObject({ status: 0, codigo: "sem_conexao" });
  });
});
