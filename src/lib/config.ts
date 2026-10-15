import { normalizarCliente, type PosicaoAnuncio } from "./anuncios";

const env = import.meta.env;

export const config = {
  apiUrl: (env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") || "http://localhost:3333",
  appStoreUrl: (env.VITE_APP_STORE_URL as string | undefined) || null,
  playStoreUrl: (env.VITE_PLAY_STORE_URL as string | undefined) || null,
  /** Google AdSense. Without a client id (or a placement's slot) nothing is rendered or loaded. */
  anuncios: {
    cliente: normalizarCliente(env.VITE_ADSENSE_CLIENT as string | undefined),
    slots: {
      landing: (env.VITE_ADSENSE_SLOT_LANDING as string | undefined) || null,
      fimDeCampanha: (env.VITE_ADSENSE_SLOT_FIM_CAMPANHA as string | undefined) || null,
      compartilhada: (env.VITE_ADSENSE_SLOT_COMPARTILHADA as string | undefined) || null,
      minhasCampanhas: (env.VITE_ADSENSE_SLOT_MINHAS_CAMPANHAS as string | undefined) || null,
    } satisfies Record<PosicaoAnuncio, string | null>,
    /** Local layout check without an AdSense account: grey placeholder where ads go. */
    previa: env.VITE_ADSENSE_PREVIA === "1",
  },
};
