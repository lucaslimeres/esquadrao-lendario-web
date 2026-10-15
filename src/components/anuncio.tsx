import { useEffect, useRef } from "react";
import { carregarScriptAdsense, pedirAnuncio, type PosicaoAnuncio } from "@/lib/anuncios";
import { config } from "@/lib/config";
import { cn } from "@/lib/utils";

/**
 * A quiet, labelled strip in the page flow: fixed height (no layout jump), never over the
 * content, and it disappears when Google has no ad to fill it (see `.anuncio` in styles.css).
 */
export function EspacoPublicidade({ posicao, className }: { posicao: PosicaoAnuncio; className?: string }) {
  const { cliente, slots, previa } = config.anuncios;
  const slot = slots[posicao];
  const ref = useRef<HTMLModElement>(null);
  const ativo = Boolean(cliente && slot);

  useEffect(() => {
    if (!ativo || !cliente || !ref.current) return;
    carregarScriptAdsense(cliente);
    pedirAnuncio(ref.current);
  }, [ativo, cliente]);

  if (!ativo && !previa) return null;
  return (
    <aside aria-label="Publicidade" className={cn("anuncio border-t-2 border-gramado pt-3", className)}>
      <p className="rotulo mb-2 text-neutro-700">Publicidade</p>
      {ativo ? (
        <ins
          ref={ref}
          className="adsbygoogle anuncio-unidade"
          data-ad-client={cliente!}
          data-ad-slot={slot!}
          data-adtest={import.meta.env.DEV ? "on" : undefined}
        />
      ) : (
        <div className="anuncio-unidade flex items-center justify-center bg-gramado text-sm text-neutro-700">Espaço do anúncio</div>
      )}
    </aside>
  );
}
