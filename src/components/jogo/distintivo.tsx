import { contraste } from "@/lib/jogo";
import type { ElencoResumo } from "@/lib/tipos";
import { cn } from "@/lib/utils";

/**
 * Generic club badge — the brand forbids real crests. Two club colours + initials,
 * square with a pointed base like the game's own shield shape.
 */
export function Distintivo({ equipe, className }: { equipe: ElencoResumo["equipe"]; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("inline-flex size-10 shrink-0 items-start justify-start p-1 text-[11px] font-extrabold leading-none", className)}
      style={{
        background: `linear-gradient(135deg, ${equipe.corPrimaria} 0 60%, ${equipe.corSecundaria} 60% 100%)`,
        color: contraste(equipe.corPrimaria),
        clipPath: "polygon(0 0, 100% 0, 100% 68%, 50% 100%, 0 68%)",
      }}
    >
      {equipe.sigla}
    </span>
  );
}

export function NomeElenco({ elenco }: { elenco: ElencoResumo | null }) {
  if (!elenco) return <span>—</span>;
  return (
    <span className="inline-flex items-center gap-2">
      <Distintivo equipe={elenco.equipe} className="size-7 text-[9px]" />
      <span className="font-semibold">{elenco.rotulo}</span>
    </span>
  );
}
