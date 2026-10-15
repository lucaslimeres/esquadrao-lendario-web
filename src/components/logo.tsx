import { cn } from "@/lib/utils";

type Versao = "cor" | "negativo" | "branco";

/** Official horizontal logo (marca/logo/svg). Minimum width 120px. */
export function Logo({ versao = "cor", className }: { versao?: Versao; className?: string }) {
  return <img src={`/marca/horizontal-${versao}.svg`} alt="Esquadrão Lendário" className={cn("h-9 w-auto min-w-[120px]", className)} />;
}

export function Simbolo({ versao = "cor", className }: { versao?: "cor" | "branco"; className?: string }) {
  return <img src={`/marca/simbolo-${versao}.svg`} alt="" aria-hidden className={cn("h-12 w-auto", className)} />;
}
