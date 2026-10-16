import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { EspacoPublicidade } from "@/components/anuncio";
import { Campo } from "@/components/jogo/campo";
import { Pagina, TituloPagina } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Carregando, Erro } from "@/components/ui/estados";
import { Artilharia, ListaPartidas, TabelaGrupo } from "@/features/campanha/andamento";
import { Resumo } from "@/features/campanha/fim-de-campanha";
import { api, ApiError } from "@/lib/api";
import { NOME_STATUS, textoEliminacao } from "@/lib/jogo";
import { cn } from "@/lib/utils";

/** Public page behind a shared link: someone's squad and campaign + "build yours". */
export const Route = createFileRoute("/c/$codigo")({
  component: CampanhaCompartilhada,
});

function CampanhaCompartilhada() {
  const { codigo } = Route.useParams();
  const { data, isPending, error, refetch } = useQuery({ queryKey: ["compartilhada", codigo], queryFn: () => api.compartilhada(codigo) });

  if (isPending) return <Pagina><Carregando /></Pagina>;
  if (error || !data) {
    const naoExiste = error instanceof ApiError && error.status === 404;
    return (
      <Pagina>
        <TituloPagina rotulo="Esquadrão compartilhado">{naoExiste ? "Link inválido" : "Deu ruim"}</TituloPagina>
        {naoExiste ? <p className="mb-6">Esse esquadrão não existe (ou o link veio cortado).</p> : <div className="mb-6"><Erro mensagem="Não deu para carregar." tentarDeNovo={() => refetch()} /></div>}
        <Button asChild><Link to="/jogar">Montar o meu <ArrowRight aria-hidden /></Link></Button>
      </Pagina>
    );
  }

  const terminou = data.resultado.finalizada;
  const titulo = data.resultado.campeao ? "É CAMPEÃO!" : terminou ? textoEliminacao(data.resultado.faseEliminacao) : NOME_STATUS[data.status];

  return (
    <Pagina larga>
      <div className={cn("mb-8 p-6 sm:p-10", data.resultado.campeao ? "bg-verde text-white" : "bg-tinta text-papel")}>
        <p className={cn("rotulo", data.resultado.campeao ? "text-verde-nevoa" : "text-verde-claro")}>
          {data.nomeTime} · {data.competicao.nome} · {data.formacao.codigo}
        </p>
        <p className="mt-3 font-display text-5xl sm:text-7xl">{titulo}</p>
      </div>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,420px)_1fr]">
        <Campo vagas={data.formacao.vagas} />
        <div className="space-y-8">
          <Resumo campanha={data} />
          {data.grupo && <TabelaGrupo grupo={data.grupo} nomeTime={data.nomeTime} />}
          <ListaPartidas partidas={data.partidas} nomeTime={data.nomeTime} />
          <Artilharia campanha={data} />
          <div className="border-t-2 border-tinta pt-6">
            <p className="font-display text-3xl">Monta o teu?</p>
            <Button asChild tamanho="grande" className="mt-4 w-full sm:w-80">
              <Link to="/jogar">Montar meu esquadrão <ArrowRight aria-hidden /></Link>
            </Button>
          </div>
        </div>
      </div>
      <EspacoPublicidade posicao="compartilhada" className="mt-12" />
    </Pagina>
  );
}
