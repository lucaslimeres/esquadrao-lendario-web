import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { EspacoPublicidade } from "@/components/anuncio";
import { Pagina, TituloPagina } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Carregando, Erro } from "@/components/ui/estados";
import { api } from "@/lib/api";
import { NOME_STATUS } from "@/lib/jogo";
import type { CampanhaResumo } from "@/lib/tipos";
import { estaLogado } from "@/stores/sessao";

export const Route = createFileRoute("/minhas-campanhas")({
  // Only accounts have a history: games without an account are never listed.
  beforeLoad: ({ location }) => {
    if (!estaLogado()) throw redirect({ to: "/entrar", search: { redirect: location.href } });
  },
  component: MinhasCampanhas,
});

const dataCurta = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric", timeZone: "America/Sao_Paulo" });

function SeloStatus({ status }: { status: CampanhaResumo["status"] }) {
  if (status === "campea") return <Badge variant="lendario">Campeão</Badge>;
  if (status === "eliminada") return <Badge variant="eliminado">Eliminado</Badge>;
  return <Badge variant="contorno">{NOME_STATUS[status]}</Badge>;
}

function MinhasCampanhas() {
  const { data, isPending, isError, refetch } = useQuery({ queryKey: ["campanhas"], queryFn: api.campanhas });
  const titulos = data?.filter((c) => c.status === "campea").length ?? 0;

  return (
    <Pagina>
      <TituloPagina rotulo="Histórico">Minhas campanhas</TituloPagina>
      {isPending && <Carregando />}
      {isError && <Erro mensagem="Não deu para carregar suas campanhas." tentarDeNovo={() => refetch()} />}
      {data && data.length === 0 && (
        <div className="space-y-4">
          <p>Nenhuma campanha ainda. Bora montar o primeiro esquadrão?</p>
          <Button asChild className="w-full sm:w-72">
            <Link to="/jogar">
              Jogar agora <ArrowRight aria-hidden />
            </Link>
          </Button>
        </div>
      )}
      {data && data.length > 0 && (
        <>
          <p className="mb-4">
            {data.length} campanha{data.length > 1 ? "s" : ""} · <strong>{titulos}</strong> título{titulos === 1 ? "" : "s"}
          </p>
          <ul className="divide-y-2 divide-gramado border-2 border-neutro-400 bg-white">
            {data.map((c) => (
              <li key={c.id}>
                <Link to="/jogar/$id" params={{ id: c.id }} className="flex items-center gap-4 p-4 hover:bg-gramado">
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold">{c.competicao.nome ?? "Competição"}</span>
                    <span className="text-sm text-neutro-700">
                      {c.formacao} · {dataCurta.format(new Date(c.criadaEm))}
                    </span>
                  </span>
                  <SeloStatus status={c.status} />
                  <ArrowRight className="size-5 shrink-0" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
          <EspacoPublicidade posicao="minhasCampanhas" className="mt-10" />
        </>
      )}
    </Pagina>
  );
}
