import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Trophy } from "lucide-react";
import { EspacoPublicidade } from "@/components/anuncio";
import { Distintivo } from "@/components/jogo/distintivo";
import { Pagina, TituloPagina } from "@/components/layout";
import { Carregando, Erro } from "@/components/ui/estados";
import { useTituloDocumento } from "@/features/guia/titulo-documento";
import { api } from "@/lib/api";
import { CHAVES, formatar } from "@/lib/galeria";

export const Route = createFileRoute("/campeoes/")({
  component: GaleriaCampeoes,
});

function GaleriaCampeoes() {
  useTituloDocumento("Galeria de campeões");
  const { data, isPending, isError, refetch } = useQuery({ queryKey: CHAVES.galeria, queryFn: api.galeria });
  return (
    <Pagina larga>
      <TituloPagina rotulo="Galeria">Galeria de campeões</TituloPagina>
      <div className="max-w-3xl space-y-4 text-lg text-neutro-800">
        <p>
          Todo jogador do Esquadrão Lendário vem de um time campeão. Aqui estão todos os elencos campeões da base do jogo, competição por
          competição e ano a ano, com a escalação, o craque de cada time e o overall do melhor XI.
        </p>
        <p className="text-base">
          A base é montada e revisada pela nossa equipe a partir de fontes públicas, com a escalação das finais. Os números de uso (quantas vezes
          um elenco saiu no sorteio, quem é mais escalado) vêm das campanhas jogadas, e mudam todo dia. Veja também as{" "}
          <Link to="/estatisticas" className="font-semibold text-verde underline underline-offset-4">
            estatísticas das campanhas
          </Link>
          .
        </p>
      </div>

      {isPending && <Carregando texto="Carregando a galeria…" />}
      {isError && <Erro mensagem="Não deu para carregar a galeria agora." tentarDeNovo={() => refetch()} />}
      {data && (
        <>
          <dl className="my-10 grid grid-cols-3 border-2 border-neutro-400 bg-white">
            {(
              [
                ["Títulos", data.resumo.titulos],
                ["Clubes", data.resumo.equipes],
                ["Jogadores", data.resumo.jogadores],
              ] as const
            ).map(([rotulo, valor]) => (
              <div key={rotulo} className="border-neutro-400 p-4 not-last:border-r-2">
                <dt className="rotulo text-neutro-700">{rotulo}</dt>
                <dd className="font-display text-3xl sm:text-4xl">{formatar(valor)}</dd>
              </div>
            ))}
          </dl>

          <div className="space-y-12">
            {data.competicoes.map((c) => (
              <section key={c.slug} aria-labelledby={`titulo-${c.slug}`}>
                <div className="mb-4 flex flex-wrap items-end justify-between gap-3 border-b-2 border-tinta pb-3">
                  <h2 id={`titulo-${c.slug}`} className="flex items-center gap-2 text-2xl font-bold sm:text-3xl">
                    <Trophy className="size-6 text-verde" aria-hidden /> {c.nome}
                  </h2>
                  <Link to="/campeoes/$competicao" params={{ competicao: c.slug }} className="inline-flex min-h-11 items-center gap-2 font-semibold text-verde">
                    Todos os {c.titulos.length} campeões <ArrowRight className="size-4" aria-hidden />
                  </Link>
                </div>
                {c.descricao && <p className="mb-4 text-neutro-700">{c.descricao}</p>}
                <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {c.titulos.slice(0, 6).map((t) => (
                    <li key={t.temporada}>
                      <Link
                        to="/campeoes/$competicao/$temporada"
                        params={{ competicao: c.slug, temporada: String(t.temporada) }}
                        className="flex items-center gap-3 border-2 border-neutro-400 bg-white p-4 hover:border-tinta"
                      >
                        <Distintivo equipe={t.equipe} />
                        <span className="min-w-0 flex-1">
                          <span className="block font-bold">
                            {t.equipe.nome} <span className="font-normal text-neutro-700">{t.temporada}</span>
                          </span>
                          {t.craque && <span className="block truncate text-sm text-neutro-700">Craque: {t.craque.nome} ({t.craque.overall})</span>}
                        </span>
                        {t.overallTime !== null && <span className="font-display text-2xl tabular-nums">{Math.round(t.overallTime)}</span>}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
          <EspacoPublicidade posicao="conteudo" className="mt-12" />
        </>
      )}
    </Pagina>
  );
}
