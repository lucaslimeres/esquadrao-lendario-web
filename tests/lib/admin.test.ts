import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { adminApi } from "@/lib/admin-api";
import { CHAVE_ADMIN, useAdminSessao } from "@/stores/admin-sessao";
import { CHAVE_CONTA, useSessao } from "@/stores/sessao";

const admin = { id: "a1", nome: "Admin", email: "a@x.com", ativo: true, ultimoLoginEm: null, criadoEm: "2026-10-15T00:00:00Z" };

beforeEach(() => {
  useAdminSessao.setState({ sessao: null });
  useSessao.setState({ sessao: null, modo: null });
});
afterEach(() => vi.unstubAllGlobals());

describe("sessão de admin", () => {
  it("fica numa chave própria, separada da sessão do jogador", () => {
    useSessao.getState().entrar({ token: "t-jogador", usuario: { id: "u1", nome: "J", email: "j@x.com", convidado: false, emailConfirmado: true } });
    useAdminSessao.getState().entrar({ token: "t-admin", admin });
    expect(localStorage.getItem(CHAVE_ADMIN)).toContain("t-admin");
    expect(localStorage.getItem(CHAVE_CONTA)).toContain("t-jogador");
    useAdminSessao.getState().sair();
    expect(localStorage.getItem(CHAVE_ADMIN)).toBeNull();
    expect(localStorage.getItem(CHAVE_CONTA)).toContain("t-jogador");
  });

  it("o cliente admin manda só o token de admin e sai em 401", async () => {
    useSessao.getState().entrar({ token: "t-jogador", usuario: { id: "u1", nome: "J", email: "j@x.com", convidado: false, emailConfirmado: true } });
    useAdminSessao.getState().entrar({ token: "t-admin", admin });
    const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ erro: "Sessão de administrador inválida", codigo: "unauthorized" }), { status: 401 }));
    vi.stubGlobal("fetch", fetch);
    await expect(adminApi.dashboard()).rejects.toMatchObject({ status: 401 });
    expect(fetch.mock.calls[0]![1].headers.Authorization).toBe("Bearer t-admin");
    expect(useAdminSessao.getState().sessao).toBeNull();
    expect(useSessao.getState().sessao?.token).toBe("t-jogador");
  });

  it("DELETE com 204 não quebra a leitura da resposta", async () => {
    useAdminSessao.getState().entrar({ token: "t-admin", admin });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 204 })));
    await expect(adminApi.excluirJogador("j1")).resolves.toBeNull();
  });
});
