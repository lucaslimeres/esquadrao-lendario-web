import { Link } from "@tanstack/react-router";
import { ArrowRight, Share2 } from "lucide-react";
import { useState } from "react";
import { Campo } from "@/components/jogo/campo";
import { Button } from "@/components/ui/button";
import { linkCompartilhamento, textoEliminacao } from "@/lib/jogo";
import { NOME_TIME_PADRAO, type Campanha } from "@/lib/tipos";
import { cn } from "@/lib/utils";
import { useSessao } from "@/stores/sessao";
import { AvisoConvidado } from "../aviso-convidado";
import { Artilharia, ListaPartidas, TabelaGrupo } from "./andamento";

export function BotaoCompartilhar({ codigo, titulo, url: urlFixa, rotulo = "Compartilhar" }: { codigo?: string; titulo: string; url?: string; rotulo?: string }) {
  const [copiado, setCopiado] = useState(false);
  const compartilhar = async () => {
    const url = urlFixa ?? linkCompartilhamento(codigo!);
    if (navigator.share) {
      try {
        await navigator.share({ title: "Esquadrão Lendário", text: titulo, url });
        return;
      } catch {
        // Cancelled or unsupported: fall back to copying.
      }
    }
    await navigator.clipboard?.writeText(url);
    setCopiado(true);
    window.setTimeout(() => setCopiado(false), 2500);
  };
  return (
    <Button variant="contorno" onClick={compartilhar} className="w-full sm:w-64">
      {copiado ? "Link copiado!" : rotulo} <Share2 aria-hidden />
    </Button>
  );
}

export function Resumo({ campanha }: { campanha: Pick<Campanha, "resultado" | "competicao" | "overallTime"> }) {
  const r = campanha.resultado;
  const itens = [
    ["Jogos", r.jogos],
    ["V · E · D", `${r.vitorias} · ${r.empates} · ${r.derrotas}`],
    ["Gols", `${r.golsPro} pró · ${r.golsContra} contra`],
    ["Overall", campanha.overallTime?.toFixed(1).replace(".", ",") ?? "—"],
  ] as const;
  return (
    <dl className="grid grid-cols-2 border-2 border-neutro-400 bg-white sm:grid-cols-4">
      {itens.map(([rotulo, valor]) => (
        <div key={rotulo} className="-mb-[2px] -mr-[2px] border-2 border-neutro-400 p-3">
          <dt className="rotulo text-[11px] text-neutro-700">{rotulo}</dt>
          <dd className="mt-1 text-lg font-bold">{valor}</dd>
        </div>
      ))}
    </dl>
  );
}

export function FimDeCampanha({ campanha }: { campanha: Campanha }) {
  const campeao = campanha.resultado.campeao;
  const logado = useSessao((s) => s.modo === "conta");
  const titulo = campeao ? "É CAMPEÃO!" : textoEliminacao(campanha.resultado.faseEliminacao);
  return (
    <div className="space-y-8">
      {!logado && <AvisoConvidado />}
      <div className={cn("p-6 sm:p-10", campeao ? "bg-verde text-white" : "bg-tinta text-papel")}>
        <p className={cn("rotulo", campeao ? "text-verde-nevoa" : "text-verde-claro")}>
          {campanha.nomeTime} · {campanha.competicao.nome}
        </p>
        <p className="mt-3 font-display text-5xl sm:text-7xl">{titulo}</p>
        {campanha.artilheiros[0] && (
          <p className="mt-4 text-lg">
            Artilheiro: <strong>{campanha.artilheiros[0].nome}</strong> ({campanha.artilheiros[0].gols} gol{campanha.artilheiros[0].gols > 1 ? "s" : ""})
          </p>
        )}
      </div>
      <Resumo campanha={campanha} />
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button asChild className="w-full sm:w-64">
          <Link to="/jogar">
            Jogar de novo <ArrowRight aria-hidden />
          </Link>
        </Button>
        <BotaoCompartilhar codigo={campanha.codigo} titulo={`${campanha.nomeTime === NOME_TIME_PADRAO ? "Meu esquadrão" : campanha.nomeTime} na ${campanha.competicao.nome}: ${titulo}`} />
        {logado && (
          <Button asChild variant="link">
            <Link to="/minhas-campanhas">Minhas campanhas</Link>
          </Button>
        )}
      </div>
      <div className="grid gap-8 lg:grid-cols-[1fr_minmax(0,380px)]">
        <div className="space-y-8">
          {campanha.grupo && <TabelaGrupo grupo={campanha.grupo} nomeTime={campanha.nomeTime} />}
          <ListaPartidas partidas={campanha.partidas} nomeTime={campanha.nomeTime} />
        </div>
        <aside className="space-y-6">
          <Campo vagas={campanha.formacao.vagas} />
          <Artilharia campanha={campanha} />
        </aside>
      </div>
    </div>
  );
}
