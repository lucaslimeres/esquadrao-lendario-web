import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { EspacoPublicidade } from "@/components/anuncio";
import { Distintivo } from "@/components/jogo/distintivo";
import { Pagina, TituloPagina } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Carregando, Erro } from "@/components/ui/estados";
import { useTituloDocumento } from "@/features/guia/titulo-documento";
import { api } from "@/lib/api";
import { CHAVES, formatar, textoDaCompeticao, vezes } from "@/lib/galeria";
import { NOME_POSICAO } from "@/lib/jogo";

export const Route = createFileRoute("/campeoes/$competicao/")({
  component: CampeoesDaCompeticao,
});

function CampeoesDaCompeticao() {
  const { competicao: slug } = Route.useParams();
  const { data, isPending, isError, refetch } = useQuery({ queryKey: CHAVES.galeria, queryFn: api.galeria });
  const c = data?.competicoes.find((x) => x.slug === slug);
  useTituloDocumento(c ? `Campeões da ${c.nome}` : null);

  if (isPending) return <Pagina><Carregando texto="Carregando os campeões…" /></Pagina>;
  if (isError) return <Pagina><Erro mensagem="Não deu para carregar a galeria agora." tentarDeNovo={() => refetch()} /></Pagina>;
  if (!c) {
    return (
      <Pagina>
        <TituloPagina rotulo="Galeria">Competição não encontrada</TituloPagina>
        <Button asChild>
          <Link to="/campeoes">Ver todas as competições <ArrowRight aria-hidden /></Link>
        </Button>
      </Pagina>
    );
  }
  const porForca = [...c.titulos].filter((t) => t.overallTime !== null).sort((a, b) => b.overallTime! - a.overallTime!).slice(0, 5);

  return (
    <Pagina larga>
      <Link to="/campeoes" className="mb-4 inline-flex min-h-11 items-center gap-2 font-semibold text-verde">
        <ArrowLeft className="size-4" aria-hidden /> Galeria de campeões
      </Link>
      <TituloPagina rotulo="Galeria de campeões">Campeões da {c.nome}</TituloPagina>
      <div className="max-w-3xl space-y-3 text-lg text-neutro-800">
        {c.descricao && <p>{c.descricao}</p>}
        <p>{textoDaCompeticao(c)}</p>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_minmax(0,340px)]">
        <section aria-labelledby="titulo-lista" className="min-w-0">
          <h2 id="titulo-lista" className="rotulo mb-3">Todos os títulos, do mais recente</h2>
          <ul className="divide-y-2 divide-gramado border-2 border-neutro-400 bg-white">
            {c.titulos.map((t) => (
              <li key={t.temporada}>
                <Link
                  to="/campeoes/$competicao/$temporada"
                  params={{ competicao: c.slug, temporada: String(t.temporada) }}
                  className="flex items-center gap-3 p-3 hover:bg-papel"
                >
                  <span className="w-14 shrink-0 font-display text-xl tabular-nums">{t.temporada}</span>
                  <Distintivo equipe={t.equipe} className="size-8 text-[10px]" />
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold">{t.equipe.nome}</span>
                    {t.craque && (
                      <span className="block truncate text-sm text-neutro-700">
                        {t.craque.nome} · {NOME_POSICAO[t.craque.posicao].toLowerCase()} · {t.craque.overall}
                      </span>
                    )}
                  </span>
                  {t.overallTime !== null && <span className="font-display text-xl tabular-nums">{formatar(t.overallTime)}</span>}
                  <ArrowRight className="size-4 shrink-0" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <aside className="min-w-0 space-y-8">
          {porForca.length > 0 && (
            <section aria-labelledby="titulo-fortes">
              <h2 id="titulo-fortes" className="rotulo mb-3">Os elencos mais fortes</h2>
              <ol className="border-2 border-neutro-400 bg-white">
                {porForca.map((t, i) => (
                  <li key={t.temporada} className="flex justify-between gap-3 border-b border-gramado p-3 last:border-b-0">
                    <span>
                      <span className="mr-2 text-neutro-700">{i + 1}.</span>
                      {t.equipe.nome} {t.temporada}
                    </span>
                    <span className="font-bold tabular-nums">{formatar(t.overallTime!)}</span>
                  </li>
                ))}
              </ol>
              <p className="mt-2 text-sm text-neutro-700">Overall médio do melhor XI no 4-4-2.</p>
            </section>
          )}
          <section aria-labelledby="titulo-sorteados">
            <h2 id="titulo-sorteados" className="rotulo mb-3">Mais sorteados nas campanhas</h2>
            <ol className="border-2 border-neutro-400 bg-white">
              {[...c.titulos]
                .sort((a, b) => b.vezesSorteado - a.vezesSorteado)
                .slice(0, 5)
                .map((t, i) => (
                  <li key={t.temporada} className="flex justify-between gap-3 border-b border-gramado p-3 last:border-b-0">
                    <span>
                      <span className="mr-2 text-neutro-700">{i + 1}.</span>
                      {t.equipe.nome} {t.temporada}
                    </span>
                    <span className="text-sm">{vezes(t.vezesSorteado)}</span>
                  </li>
                ))}
            </ol>
          </section>
        </aside>
      </div>
      <EspacoPublicidade posicao="conteudo" className="mt-12" />
    </Pagina>
  );
}
