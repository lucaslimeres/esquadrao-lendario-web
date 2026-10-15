import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { destinoSeguro, garantirSessao } from "@/features/sessao";
import type { Sessao } from "@/lib/tipos";
import { CHAVE_CONTA, CHAVE_CONVIDADO, useSessao } from "@/stores/sessao";

const conta: Sessao = { token: "t-conta", usuario: { id: "u1", nome: "Lucas", email: "l@x.com", convidado: false, emailConfirmado: true } };
const convidado: Sessao = { token: "t-conv", usuario: { id: "u2", nome: null, email: null, convidado: true, emailConfirmado: false } };

beforeEach(() => useSessao.setState({ sessao: null, modo: null }));
afterEach(() => vi.unstubAllGlobals());

describe("sessão", () => {
  it("convidado fica só no sessionStorage (some ao fechar a aba)", () => {
    useSessao.getState().jogarComoConvidado(convidado);
    expect(sessionStorage.getItem(CHAVE_CONVIDADO)).toContain("t-conv");
    expect(localStorage.getItem(CHAVE_CONTA)).toBeNull();
    expect(useSessao.getState().modo).toBe("convidado");
  });

  it("entrar com conta grava no localStorage e descarta o convidado", () => {
    useSessao.getState().jogarComoConvidado(convidado);
    useSessao.getState().entrar(conta);
    expect(localStorage.getItem(CHAVE_CONTA)).toContain("t-conta");
    expect(sessionStorage.getItem(CHAVE_CONVIDADO)).toBeNull();
    expect(useSessao.getState().modo).toBe("conta");
  });

  it("sair limpa tudo", () => {
    useSessao.getState().entrar(conta);
    useSessao.getState().sair();
    expect(localStorage.getItem(CHAVE_CONTA)).toBeNull();
    expect(useSessao.getState().sessao).toBeNull();
  });

  it("garantirSessao cria convidado só quando não há sessão", async () => {
    const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify(convidado), { status: 201 }));
    vi.stubGlobal("fetch", fetch);
    await garantirSessao();
    expect(useSessao.getState().modo).toBe("convidado");
    await garantirSessao();
    expect(fetch).toHaveBeenCalledOnce();
  });

  it("redirecionamento só para caminhos do próprio site", () => {
    expect(destinoSeguro("/jogar/abc")).toBe("/jogar/abc");
    expect(destinoSeguro("//evil.com")).toBe("/minhas-campanhas");
    expect(destinoSeguro("https://evil.com")).toBe("/minhas-campanhas");
    expect(destinoSeguro(undefined)).toBe("/minhas-campanhas");
  });
});
