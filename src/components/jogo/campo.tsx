import { Plus } from "lucide-react";
import type { VagaCampanha } from "@/lib/tipos";
import { cn } from "@/lib/utils";

interface Props {
  vagas: VagaCampanha[];
  /** Slots that can receive the player being chosen (highlighted, clickable). */
  destacadas?: string[];
  aoEscolherVaga?: (codigo: string) => void;
  mostrarNomes?: boolean;
  className?: string;
}

/**
 * The pitch as a tactical board (brand guide): gramado background, 2px rule lines, square
 * slots placed by the API's x/y coordinates. Filled = ink; legend (89+) = green.
 */
export function Campo({ vagas, destacadas = [], aoEscolherVaga, mostrarNomes = true, className }: Props) {
  return (
    <div className={cn("relative aspect-[4/5] w-full regua bg-gramado", className)} aria-label="Campo com as vagas do seu time">
      <LinhasDoCampo />
      {vagas.map((vaga) => {
        const destacada = destacadas.includes(vaga.codigo);
        return (
          <div
            key={vaga.codigo}
            className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
            style={{ left: `${vaga.x}%`, top: `${vaga.y}%` }}
          >
            <BlocoVaga vaga={vaga} destacada={destacada} onClick={destacada && aoEscolherVaga ? () => aoEscolherVaga(vaga.codigo) : undefined} />
            {mostrarNomes && vaga.jogador && (
              <span className="mt-1 max-w-20 truncate bg-papel px-1 text-[11px] font-semibold leading-tight sm:max-w-24 sm:text-xs">
                {sobrenome(vaga.jogador.nome)}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function BlocoVaga({ vaga, destacada, onClick }: { vaga: VagaCampanha; destacada: boolean; onClick?: () => void }) {
  const jogador = vaga.jogador;
  const base = "flex size-12 flex-col items-start justify-between p-1 text-left sm:size-14";
  const rotulo = <span className="rotulo text-[9px] leading-none sm:text-[10px]">{vaga.posicao}</span>;

  if (destacada) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={`Escalar na vaga ${vaga.posicao}`}
        className={cn(base, "bg-verde text-white outline-4 outline-verde-nevoa hover:bg-verde-800")}
        data-vaga={vaga.codigo}
        data-estado="destacada"
      >
        {rotulo}
        <Plus className="size-4" aria-hidden />
      </button>
    );
  }
  if (!jogador) {
    return (
      <div className={cn(base, "border-2 border-dashed border-neutro-600 bg-papel/60 text-tinta")} data-vaga={vaga.codigo} data-estado="vazia">
        {rotulo}
        <Plus className="size-4" aria-hidden />
      </div>
    );
  }
  const lenda = jogador.overallEfetivo >= 89;
  return (
    <div
      className={cn(base, lenda ? "bg-verde text-white" : "bg-tinta text-papel")}
      data-vaga={vaga.codigo}
      data-estado="preenchida"
      title={`${jogador.nome} · ${jogador.elenco?.rotulo ?? ""}`}
    >
      {rotulo}
      <span className="font-display text-xl sm:text-2xl">{Math.round(jogador.overallEfetivo)}</span>
    </div>
  );
}

function sobrenome(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  return partes.length > 1 && partes.at(-1)!.length > 2 ? partes.at(-1)! : nome;
}

function LinhasDoCampo() {
  const linha = "absolute border-neutro-400";
  return (
    <div aria-hidden className="pointer-events-none absolute inset-3">
      <div className={cn(linha, "inset-0 border-2")} />
      <div className={cn(linha, "inset-x-0 top-1/2 border-t-2")} />
      <div className={cn(linha, "left-1/2 top-1/2 size-20 -translate-x-1/2 -translate-y-1/2 border-2")} />
      <div className={cn(linha, "left-1/2 top-0 h-[16%] w-[50%] -translate-x-1/2 border-2 border-t-0")} />
      <div className={cn(linha, "left-1/2 top-0 h-[6%] w-[24%] -translate-x-1/2 border-2 border-t-0")} />
      <div className={cn(linha, "bottom-0 left-1/2 h-[16%] w-[50%] -translate-x-1/2 border-2 border-b-0")} />
      <div className={cn(linha, "bottom-0 left-1/2 h-[6%] w-[24%] -translate-x-1/2 border-2 border-b-0")} />
    </div>
  );
}
