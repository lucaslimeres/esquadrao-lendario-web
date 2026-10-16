import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Lock } from "lucide-react";
import { Pagina, TituloPagina } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Carregando, Erro } from "@/components/ui/estados";
import { MontagemGrupo } from "@/features/grupo/montagem-grupo";
import { ListaMembros } from "@/features/grupo/membros";
import { Saguao } from "@/features/grupo/saguao";
import { TorneioGrupo } from "@/features/grupo/torneio";
import { useAcaoGrupo, useGrupo } from "@/features/grupo/use-grupo";
import { garantirSessao } from "@/features/sessao";
import { api, ApiError, mensagemErro } from "@/lib/api";
import { NOME_STATUS_GRUPO } from "@/lib/grupo";
import type { Grupo } from "@/lib/tipos";
import { useSessao } from "@/stores/sessao";

export const Route = createFileRoute("/grupos/$codigo")({
  component: TelaGrupo,
});

function TelaGrupo() {
  const { codigo } = Route.useParams();
  const { data: grupo, isPending, error, refetch, dataUpdatedAt } = useGrupo(codigo);

  if (isPending) return <Pagina><Carregando texto="Carregando o grupo…" /></Pagina>;
  if (error || !grupo) {
    const naoExiste = error instanceof ApiError && error.status === 404;
    return (
      <Pagina>
        <TituloPagina rotulo="Campanha em grupo">{naoExiste ? "Grupo não encontrado" : "Deu ruim"}</TituloPagina>
        {naoExiste ? <p className="mb-6">Confira o link ou o código com quem te convidou.</p> : <div className="mb-6"><Erro mensagem="Não deu para carregar o grupo." tentarDeNovo={() => refetch()} /></div>}
        <Button asChild>
          <Link to="/grupos">Ver grupos abertos <ArrowRight aria-hidden /></Link>
        </Button>
      </Pagina>
    );
  }

  return (
    <Pagina larga>
      <TituloPagina rotulo={`${grupo.competicao.nome} · Campanha em grupo · ${NOME_STATUS_GRUPO[grupo.status]}`}>{grupo.nome}</TituloPagina>
      {grupo.souMembro && grupo.status === "inscricoes" && <Saguao grupo={grupo} />}
      {grupo.souMembro && grupo.status === "montagem" && <MontagemGrupo grupo={grupo} />}
      {(grupo.souMembro || grupo.status === "encerrado") && (grupo.status === "em_andamento" || grupo.status === "encerrado") && (
        <TorneioGrupo grupo={grupo} recebidoEm={dataUpdatedAt} />
      )}
      {!grupo.souMembro && grupo.status !== "encerrado" && <ForaDoGrupo grupo={grupo} />}
    </Pagina>
  );
}

function ForaDoGrupo({ grupo }: { grupo: Grupo }) {
  const modo = useSessao((s) => s.modo);
  const entrar = useAcaoGrupo(grupo.codigo, async () => {
    await garantirSessao();
    return api.entrarNoGrupo(grupo.codigo);
  });
  const aberto = grupo.status === "inscricoes";
  const lotado = grupo.vagas.ocupadas >= grupo.vagas.total;
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_minmax(0,400px)]">
      <section className="border-2 border-tinta bg-white p-5">
        {aberto ? (
          <>
            <h2 className="text-xl font-bold">Bora jogar junto?</h2>
            <p className="mt-2">
              Entre no grupo, dê um nome ao seu time e fique pronto. Quando todo mundo estiver pronto, cada um monta o seu esquadrão e o torneio de 32 times começa.
            </p>
            {modo !== "conta" && (
              <p className="mt-3 text-sm text-neutro-700">
                Sem conta, o grupo fica só nesta aba do navegador.{" "}
                <Link to="/entrar" search={{ redirect: `/grupos/${grupo.codigo}` }} className="font-semibold text-verde underline">
                  Entre na sua conta
                </Link>{" "}
                para não perder nada.
              </p>
            )}
            {entrar.isError && (
              <div className="mt-4">
                <Erro mensagem={mensagemErro(entrar.error, "Não deu para entrar no grupo.")} />
              </div>
            )}
            <Button tamanho="grande" className="mt-5 w-full sm:w-72" disabled={lotado || entrar.isPending} onClick={() => entrar.mutate()}>
              {lotado ? "Grupo lotado" : entrar.isPending ? "Entrando…" : "Entrar no grupo"} <ArrowRight aria-hidden />
            </Button>
          </>
        ) : (
          <>
            <h2 className="flex items-center gap-2 text-xl font-bold">
              <Lock className="size-5" aria-hidden /> Esse grupo já começou
            </h2>
            <p className="mt-2">As inscrições fecharam. Quando o torneio acabar, qualquer pessoa com o link vê como foi.</p>
            <Button asChild variant="contorno" className="mt-5 w-full sm:w-72">
              <Link to="/grupos">Ver outros grupos <ArrowRight aria-hidden /></Link>
            </Button>
          </>
        )}
      </section>
      <aside>
        <ListaMembros grupo={grupo} />
      </aside>
    </div>
  );
}
