import { NOME_RARIDADE, raridade, type Raridade } from "@/lib/jogo";
import type { Posicao } from "@/lib/tipos";
import { cn } from "@/lib/utils";

const ESTILO: Record<Raridade, { card: string; avatar: string; faixa: string; silhueta: string }> = {
  bronze: { card: "border-2 border-neutro-500 bg-gramado text-tinta", avatar: "bg-gramado", faixa: "bg-gramado", silhueta: "bg-neutro-400" },
  prata: { card: "border-2 border-neutro-300 bg-neutro-300 text-tinta", avatar: "bg-gramado", faixa: "bg-gramado", silhueta: "bg-neutro-500" },
  ouro: { card: "border-2 border-tinta bg-tinta text-papel", avatar: "bg-neutro-800", faixa: "bg-[#2d2b2b]", silhueta: "bg-neutro-600" },
  lendario: { card: "border-2 border-verde bg-verde text-white", avatar: "bg-verde-800", faixa: "bg-tinta", silhueta: "bg-verde-claro" },
};

interface Props {
  nome: string;
  posicao: Posicao;
  overall: number;
  legenda?: string;
  className?: string;
}

/** Player card from the brand guide: overall + position in the reading corner, silhouette, name strip. */
export function CardJogador({ nome, posicao, overall, legenda, className }: Props) {
  const r = raridade(overall);
  const e = ESTILO[r];
  return (
    <div className={cn("flex w-36 flex-col", e.card, className)} data-raridade={r}>
      <div className="flex items-start justify-between p-2.5">
        <div>
          <div className="font-display text-4xl">{overall}</div>
          <div className="rotulo mt-1 text-[11px]">{posicao}</div>
        </div>
        <span className="rotulo text-[10px]">{NOME_RARIDADE[r]}</span>
      </div>
      <div className={cn("mx-2.5 flex h-16 items-end justify-center", e.avatar)} aria-hidden>
        <div className="flex flex-col items-center">
          <span className={cn("size-6 rounded-[50%]", e.silhueta)} />
          <span className={cn("mt-1 h-5 w-14", e.silhueta)} />
        </div>
      </div>
      <div className={cn("mt-auto px-2.5 py-2", e.faixa)}>
        <div className="truncate text-sm font-bold">{nome}</div>
        {legenda && <div className="truncate text-[11px]">{legenda}</div>}
      </div>
    </div>
  );
}
