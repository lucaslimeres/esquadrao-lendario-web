import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { Campo } from "@/components/jogo/campo";
import { Pagina, TituloPagina } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Carregando, Erro } from "@/components/ui/estados";
import { AvisoConvidado } from "@/features/aviso-convidado";
import { Andamento } from "@/features/campanha/andamento";
import { FimDeCampanha } from "@/features/campanha/fim-de-campanha";
import { Montagem } from "@/features/campanha/montagem";
import { PartidaAoVivo } from "@/features/campanha/partida-ao-vivo";
import { chaveCampanha, useAcaoCampanha, useCampanha } from "@/features/campanha/use-campanha";
import { api, ApiError } from "@/lib/api";
import { NOME_STATUS } from "@/lib/jogo";
import type { Campanha, PartidaCampanha } from "@/lib/tipos";

export const Route = createFileRoute("/jogar/$id")({
  component: TelaCampanha,
});

function TelaCampanha() {
  const { id } = Route.useParams();
  const queryClient = useQueryClient();
  const { data: campanha, isPending, error, refetch } = useCampanha(id);
  // The match result is revealed minute by minute; the new campaign state (table, next
  // opponent) is only applied afterwards so nothing spoils the score.
  const [aoVivo, setAoVivo] = useState<{ partida: PartidaCampanha; depois: Campanha } | null>(null);

  const iniciar = useAcaoCampanha(id, () => api.iniciar(id));
  const jogar = useMutation({
    mutationFn: () => api.proximaPartida(id),
    onSuccess: ({ partida, campanha: depois }) => setAoVivo({ partida, depois }),
  });

  if (isPending) return <Pagina><Carregando texto="Carregando a campanha…" /></Pagina>;
  if (error || !campanha) {
    const naoEncontrada = error instanceof ApiError && (error.status === 404 || error.status === 401);
    return (
      <Pagina>
        <TituloPagina rotulo="Campanha">{naoEncontrada ? "Campanha não encontrada" : "Deu ruim"}</TituloPagina>
        {naoEncontrada ? (
          <p className="mb-6">Ela não existe ou é de outra sessão. Partidas sem conta ficam só na aba em que foram jogadas.</p>
        ) : (
          <div className="mb-6"><Erro mensagem="Não deu para carregar a campanha." tentarDeNovo={() => refetch()} /></div>
        )}
        <Button asChild>
          <Link to="/jogar">Começar outra <ArrowRight aria-hidden /></Link>
        </Button>
      </Pagina>
    );
  }

  const fimDoAoVivo = () => {
    if (aoVivo) queryClient.setQueryData(chaveCampanha(id), aoVivo.depois);
    queryClient.invalidateQueries({ queryKey: ["campanhas"] });
    setAoVivo(null);
  };

  return (
    <Pagina larga>
      <TituloPagina rotulo={`${campanha.competicao.nome} · ${campanha.formacao.codigo} · ${NOME_STATUS[campanha.status]}`}>
        {aoVivo ? "Bola rolando" : titulo(campanha.status)}
      </TituloPagina>

      {aoVivo ? (
        <PartidaAoVivo partida={aoVivo.partida} onFim={fimDoAoVivo} />
      ) : (
        <>
          {campanha.status !== "campea" && campanha.status !== "eliminada" && <AvisoConvidado />}
          {campanha.status === "montagem" && <Montagem campanha={campanha} />}
          {campanha.status === "pronta" && (
            <div className="grid gap-8 lg:grid-cols-[minmax(0,420px)_1fr]">
              <Campo vagas={campanha.formacao.vagas} />
              <div className="space-y-6">
                <p className="text-lg">
                  Time completo! Overall do esquadrão:{" "}
                  <strong className="font-display text-3xl">{campanha.overallTime?.toFixed(1).replace(".", ",")}</strong>
                </p>
                <p>
                  {campanha.competicao.formato === "grupos_mata_mata"
                    ? "Fase de grupos com 3 jogos; os 2 primeiros vão para o mata-mata."
                    : "Mata-mata do início ao fim: perdeu, tá fora."}{" "}
                  São {campanha.competicao.jogosAteTitulo} jogos até o título.
                </p>
                {iniciar.error && <Erro mensagem={iniciar.error instanceof ApiError ? iniciar.error.message : "Não deu para começar."} />}
                <Button tamanho="grande" className="w-full sm:w-80" disabled={iniciar.isPending} onClick={() => iniciar.mutate()}>
                  {iniciar.isPending ? "Sorteando os adversários…" : "Começar campanha"} <ArrowRight aria-hidden />
                </Button>
              </div>
            </div>
          )}
          {campanha.status === "em_andamento" && (
            <Andamento campanha={campanha} jogando={jogar.isPending} erro={jogar.error} onJogar={() => jogar.mutate()} />
          )}
          {(campanha.status === "campea" || campanha.status === "eliminada") && <FimDeCampanha campanha={campanha} />}
        </>
      )}
    </Pagina>
  );
}

function titulo(status: string): string {
  switch (status) {
    case "montagem":
      return "Monte o esquadrão";
    case "pronta":
      return "Escalação fechada";
    case "em_andamento":
      return "A campanha";
    default:
      return "Fim de campanha";
  }
}
