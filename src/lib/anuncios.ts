// Google AdSense: manual display units only (Auto ads stays off in the AdSense panel,
// so Google never injects anchors, vignettes or anything over the content).

export type PosicaoAnuncio = "landing" | "fimDeCampanha" | "compartilhada" | "minhasCampanhas";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/** Accepts "ca-pub-123…" or "pub-123…"; anything else disables ads. */
export function normalizarCliente(valor: string | null | undefined): string | null {
  const id = valor?.trim().replace(/^ca-/, "");
  return id && /^pub-\d{10,20}$/.test(id) ? `ca-${id}` : null;
}

const SCRIPT_ID = "adsbygoogle-js";

/** Loaded lazily, only on pages that show an ad (never in the admin or mid-game). */
export function carregarScriptAdsense(cliente: string) {
  if (document.getElementById(SCRIPT_ID)) return;
  const script = document.createElement("script");
  script.id = SCRIPT_ID;
  script.async = true;
  script.crossOrigin = "anonymous";
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${cliente}`;
  document.head.appendChild(script);
}

// StrictMode re-runs effects on the same <ins>: pushing twice makes AdSense throw.
const preenchidos = new WeakSet<Element>();

export function pedirAnuncio(elemento: Element) {
  if (preenchidos.has(elemento)) return;
  preenchidos.add(elemento);
  try {
    (window.adsbygoogle = window.adsbygoogle ?? []).push({});
  } catch {
    // Ad blockers and network failures just leave the slot empty.
  }
}
