import { create } from "zustand";
import { configurarAuth } from "@/lib/api";
import type { Sessao } from "@/lib/tipos";

/*
 * Two kinds of session, kept apart on purpose:
 * - "conta": logged-in player → localStorage, campaigns saved in the history.
 * - "convidado": playing without an account → sessionStorage only. Closing the tab
 *   forgets it, so those games never show up in any history.
 */
export const CHAVE_CONTA = "esquadrao-auth";
export const CHAVE_CONVIDADO = "esquadrao-convidado";

type Modo = "conta" | "convidado";

interface EstadoSessao {
  sessao: Sessao | null;
  modo: Modo | null;
  entrar: (sessao: Sessao) => void;
  jogarComoConvidado: (sessao: Sessao) => void;
  sair: () => void;
}

function ler(storage: Storage | undefined, chave: string): Sessao | null {
  try {
    const bruto = storage?.getItem(chave);
    return bruto ? (JSON.parse(bruto) as Sessao) : null;
  } catch {
    return null;
  }
}

function gravar(storage: Storage | undefined, chave: string, sessao: Sessao | null) {
  try {
    if (sessao) storage?.setItem(chave, JSON.stringify(sessao));
    else storage?.removeItem(chave);
  } catch {
    // Private mode / blocked storage: the session lives only in memory.
  }
}

const local = typeof window !== "undefined" ? window.localStorage : undefined;
const sessionStore = typeof window !== "undefined" ? window.sessionStorage : undefined;

function estadoInicial(): Pick<EstadoSessao, "sessao" | "modo"> {
  const conta = ler(local, CHAVE_CONTA);
  if (conta) return { sessao: conta, modo: "conta" };
  const convidado = ler(sessionStore, CHAVE_CONVIDADO);
  if (convidado) return { sessao: convidado, modo: "convidado" };
  return { sessao: null, modo: null };
}

export const useSessao = create<EstadoSessao>((set) => ({
  ...estadoInicial(),
  entrar: (sessao) => {
    gravar(sessionStore, CHAVE_CONVIDADO, null);
    gravar(local, CHAVE_CONTA, sessao);
    set({ sessao, modo: "conta" });
  },
  jogarComoConvidado: (sessao) => {
    gravar(sessionStore, CHAVE_CONVIDADO, sessao);
    set({ sessao, modo: "convidado" });
  },
  sair: () => {
    gravar(local, CHAVE_CONTA, null);
    gravar(sessionStore, CHAVE_CONVIDADO, null);
    set({ sessao: null, modo: null });
  },
}));

configurarAuth(
  () => useSessao.getState().sessao?.token ?? null,
  () => useSessao.getState().sair(),
);

export const estaLogado = () => useSessao.getState().modo === "conta";
