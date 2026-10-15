import { create } from "zustand";
import type { Admin } from "@/lib/admin-tipos";

/**
 * Admin session — its own storage key, never `esquadrao-auth`. The admin client reads only
 * this, so a player session and an admin session can coexist in the same browser.
 */
export const CHAVE_ADMIN = "esquadrao-admin-auth";

interface SessaoAdmin {
  token: string;
  admin: Admin;
}

interface Estado {
  sessao: SessaoAdmin | null;
  entrar: (s: SessaoAdmin) => void;
  sair: () => void;
}

function ler(): SessaoAdmin | null {
  try {
    const bruto = typeof window !== "undefined" ? window.localStorage.getItem(CHAVE_ADMIN) : null;
    return bruto ? (JSON.parse(bruto) as SessaoAdmin) : null;
  } catch {
    return null;
  }
}

function gravar(s: SessaoAdmin | null) {
  try {
    if (s) window.localStorage.setItem(CHAVE_ADMIN, JSON.stringify(s));
    else window.localStorage.removeItem(CHAVE_ADMIN);
  } catch {
    // Storage blocked: session only in memory.
  }
}

export const useAdminSessao = create<Estado>((set) => ({
  sessao: ler(),
  entrar: (s) => {
    gravar(s);
    set({ sessao: s });
  },
  sair: () => {
    gravar(null);
    set({ sessao: null });
  },
}));

export const adminLogado = () => useAdminSessao.getState().sessao !== null;
