import { normalizarCliente, type PosicaoAnuncio } from "./anuncios";

const env = import.meta.env;

export const config = {
  apiUrl: (env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") || "http://localhost:3333",
  /** Still in Apple review: empty shows "Em breve na App Store" (disabled). */
  appStoreUrl: (env.VITE_APP_STORE_URL as string | undefined) || null,
  /** Published on Google Play; the env var still overrides it. */
  playStoreUrl: (env.VITE_PLAY_STORE_URL as string | undefined) || "https://play.google.com/store/apps/details?id=com.ubentechnology.esquadraolendario",
  /** Google AdSense. Without a client id (or a placement's slot) nothing is rendered or loaded. */
  anuncios: {
    cliente: normalizarCliente(env.VITE_ADSENSE_CLIENT as string | undefined),
    slots: {
      landing: (env.VITE_ADSENSE_SLOT_LANDING as string | undefined) || null,
      // Guide pages (como jogar, posições, simulação, perguntas). Falls back to the landing unit.
      conteudo: (env.VITE_ADSENSE_SLOT_CONTEUDO as string | undefined) || (env.VITE_ADSENSE_SLOT_LANDING as string | undefined) || null,
    } satisfies Record<PosicaoAnuncio, string | null>,
    /** Local layout check without an AdSense account: grey placeholder where ads go. */
    previa: env.VITE_ADSENSE_PREVIA === "1",
  },
};
