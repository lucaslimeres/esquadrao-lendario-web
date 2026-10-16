import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { EspacoPublicidade } from "@/components/anuncio";
import { Pagina, TituloPagina } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { GUIAS, type CaminhoGuia } from "@/lib/guias";
import { cn } from "@/lib/utils";

export { GUIAS };

interface Props {
  caminho: CaminhoGuia;
  rotulo: string;
  titulo: string;
  /** Short lead paragraph under the title. */
  intro: ReactNode;
  children: ReactNode;
}

/** Guide page: title, lead, sections, one ad strip after the text, related guides and a call to play. */
export function Artigo({ caminho, rotulo, titulo, intro, children }: Props) {
  useEffect(() => {
    document.title = `${titulo} — Esquadrão Lendário`;
  }, [titulo]);
  return (
    <Pagina>
      <TituloPagina rotulo={rotulo}>{titulo}</TituloPagina>
      <article className="space-y-10 text-neutro-800">
        <p className="text-lg">{intro}</p>
        {children}
      </article>
      <EspacoPublicidade posicao="conteudo" className="mt-12" />
      <OutrosGuias atual={caminho} />
      <div className="mt-10 flex flex-col gap-4 border-t-2 border-tinta pt-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-display text-3xl">Sorteia aí!</p>
        <Button asChild tamanho="grande" className="sm:w-72">
          <Link to="/jogar">
            Montar meu esquadrão <ArrowRight aria-hidden />
          </Link>
        </Button>
      </div>
    </Pagina>
  );
}

export function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-2xl font-bold text-tinta">{titulo}</h2>
      {children}
    </section>
  );
}

export function Lista({ itens, numerada }: { itens: ReactNode[]; numerada?: boolean }) {
  const Tag = numerada ? "ol" : "ul";
  return (
    <Tag className={cn("space-y-2 pl-5", numerada ? "list-decimal" : "list-disc")}>
      {itens.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </Tag>
  );
}

function OutrosGuias({ atual }: { atual: CaminhoGuia }) {
  return (
    <nav aria-labelledby="titulo-guias" className="mt-12">
      <h2 id="titulo-guias" className="rotulo mb-3">
        Leia também
      </h2>
      <ul className="divide-y-2 divide-gramado border-2 border-neutro-400 bg-white">
        {GUIAS.filter((g) => g.to !== atual).map((g) => (
          <li key={g.to}>
            <Link to={g.to} className="flex items-center gap-4 p-4 hover:bg-gramado">
              <span className="min-w-0 flex-1">
                <span className="block font-bold">{g.titulo}</span>
                <span className="text-sm text-neutro-700">{g.resumo}</span>
              </span>
              <ArrowRight className="size-5 shrink-0" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
