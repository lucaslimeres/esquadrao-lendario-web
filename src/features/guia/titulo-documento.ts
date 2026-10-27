import { useEffect } from "react";

/** Browser tab title for content pages (the prerender writes the same one into the HTML). */
export function useTituloDocumento(titulo: string | null) {
  useEffect(() => {
    if (titulo) document.title = `${titulo} — Esquadrão Lendário`;
  }, [titulo]);
}
