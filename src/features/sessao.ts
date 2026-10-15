import { api } from "@/lib/api";
import { useSessao } from "@/stores/sessao";

/** Playing needs a token: reuse the current session, or start a guest one (tab-only). */
export async function garantirSessao(): Promise<void> {
  if (useSessao.getState().sessao) return;
  const sessao = await api.convidado();
  useSessao.getState().jogarComoConvidado(sessao);
}

/** Only same-site paths are accepted as post-login destinations. */
export function destinoSeguro(redirect: unknown): string {
  return typeof redirect === "string" && redirect.startsWith("/") && !redirect.startsWith("//") ? redirect : "/minhas-campanhas";
}
