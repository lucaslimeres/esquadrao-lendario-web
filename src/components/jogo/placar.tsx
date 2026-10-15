import { NOME_FASE } from "@/lib/jogo";
import type { PartidaCampanha } from "@/lib/tipos";
import { cn } from "@/lib/utils";

interface Props {
  partida: PartidaCampanha;
  /** Goals shown so far (minute-by-minute reveal); defaults to the final score. */
  golsPro?: number;
  golsContra?: number;
  minuto?: number | null;
  className?: string;
}

/** Dark scoreboard from the brand guide. */
export function Placar({ partida, golsPro, golsContra, minuto, className }: Props) {
  const pro = golsPro ?? partida.golsPro;
  const contra = golsContra ?? partida.golsContra;
  return (
    <div className={cn("bg-tinta p-4 text-papel sm:p-5", className)}>
      <div className="flex items-center justify-between">
        <span className="rotulo text-[11px]">
          {NOME_FASE[partida.fase]}
          {partida.fase === "grupo" ? ` · rodada ${partida.rodada}` : ""}
        </span>
        {minuto !== undefined && minuto !== null && <span className="rotulo text-[11px] text-verde-claro">{minuto}'</span>}
      </div>
      <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <span className="text-sm font-bold sm:text-base">Seu esquadrão</span>
        <span className="font-display text-5xl tabular-nums sm:text-7xl" aria-label={`${pro ?? 0} a ${contra ?? 0}`}>
          {pro ?? 0}–{contra ?? 0}
        </span>
        <span className="text-right text-sm font-bold sm:text-base">{partida.adversario?.rotulo ?? "Adversário"}</span>
      </div>
      {partida.penaltisPro !== null && partida.penaltisContra !== null && (minuto === undefined || minuto === null) && (
        <p className="mt-2 text-sm text-neutro-300">
          Pênaltis: {partida.penaltisPro}–{partida.penaltisContra}
        </p>
      )}
    </div>
  );
}

/** V/E/D always with the letter (brand guide): V green, E grey, D outline only. */
export function SeloResultado({ resultado }: { resultado: PartidaCampanha["resultado"] }) {
  if (!resultado) return <span className="inline-flex size-7 items-center justify-center border-2 border-dashed border-neutro-400 text-xs">–</span>;
  const estilo = { V: "bg-verde text-white", E: "bg-neutro-300 text-tinta", D: "border-2 border-tinta text-tinta" }[resultado];
  const nome = { V: "Vitória", E: "Empate", D: "Derrota" }[resultado];
  return (
    <span title={nome} aria-label={nome} className={cn("inline-flex size-7 items-center justify-center text-xs font-extrabold", estilo)}>
      {resultado}
    </span>
  );
}
