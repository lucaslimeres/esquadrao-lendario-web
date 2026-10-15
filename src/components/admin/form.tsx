import type { ComponentProps, ReactNode } from "react";
import { useId } from "react";
import { cn } from "@/lib/utils";

/** Label + control + hint, stacked (brand: labels in caps, left aligned). */
export function CampoForm({ rotulo, dica, children }: { rotulo: string; dica?: string; children: (id: string) => ReactNode }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="rotulo mb-1.5 block">
        {rotulo}
      </label>
      {children(id)}
      {dica && <p className="mt-1 text-xs text-neutro-700">{dica}</p>}
    </div>
  );
}

const controle = "h-11 w-full border-2 border-neutro-400 bg-white px-3 text-base focus:border-tinta focus:outline-none";

export function Select({ className, ...props }: ComponentProps<"select">) {
  return <select className={cn(controle, "pr-8", className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(controle, "h-auto min-h-40 py-2 font-mono text-sm", className)} {...props} />;
}

export function Checkbox({ rotulo, className, ...props }: ComponentProps<"input"> & { rotulo: string }) {
  return (
    <label className={cn("inline-flex min-h-11 cursor-pointer items-center gap-2 font-semibold", className)}>
      <input type="checkbox" className="size-5 accent-verde" {...props} />
      {rotulo}
    </label>
  );
}

export function Tabela({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("relative overflow-x-auto border-2 border-neutro-400 bg-white", className)}>
      <table className="w-full text-sm [&_td]:p-3 [&_th]:p-3 [&_th]:text-left [&_thead_tr]:border-b-2 [&_thead_tr]:border-tinta [&_tbody_tr]:border-b [&_tbody_tr]:border-gramado [&_tbody_tr:last-child]:border-b-0">
        {children}
      </table>
    </div>
  );
}

export function Numero({ rotulo, valor, detalhe, destaque }: { rotulo: string; valor: ReactNode; detalhe?: string; destaque?: boolean }) {
  return (
    <div className={cn("-mb-[2px] -mr-[2px] border-2 border-neutro-400 p-4", destaque ? "bg-verde text-white" : "bg-white")}>
      <p className={cn("rotulo text-[11px]", destaque ? "text-verde-nevoa" : "text-neutro-700")}>{rotulo}</p>
      <p className="mt-2 font-display text-4xl">{valor}</p>
      {detalhe && <p className={cn("mt-1 text-xs", destaque ? "text-verde-nevoa" : "text-neutro-700")}>{detalhe}</p>}
    </div>
  );
}
