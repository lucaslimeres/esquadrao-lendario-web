import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { EspacoPublicidade } from "@/components/anuncio";
import { Campo } from "@/components/jogo/campo";
import { Distintivo } from "@/components/jogo/distintivo";
import { Pagina, TituloPagina } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Carregando, Erro } from "@/components/ui/estados";
import { useTituloDocumento } from "@/features/guia/titulo-documento";
import { api, ApiError } from "@/lib/api";
import { CHAVES, formatar, textoDoTitulo, vezes } from "@/lib/galeria";
import { NOME_POSICAO, NOME_RARIDADE, raridade } from "@/lib/jogo";
import type { TituloGaleria, VagaCampanha } from "@/lib/tipos";

export const Route = createFileRoute("/campeoes/$competicao/$temporada")({
  component: TituloCampeao,
});

function TituloCampeao() {
  const { competicao, temporada } = Route.useParams();
  const ano = Number(temporada);
  const { data: t, isPending, error, refetch } = useQuery({ queryKey: CHAVES.titulo(competicao, ano), queryFn: () => api.tituloGaleria(competicao, ano) });
  const formacoes = useQuery({ queryKey: ["formacoes"], queryFn: api.formacoes, staleTime: Infinity });
  useTituloDocumento(t ? `${t.equipe.nome} ${t.temporada}, campeão da ${t.competicao.nome}` : null);

  if (isPending) return <Pagina><Carregando texto="Carregando o elenco…" /></Pagina>;
  if (error || !t) {
    const naoExiste = error instanceof ApiError && (error.status === 404 || error.status === 400);
    return (
      <Pagina>
        <TituloPagina rotulo="Galeria">{naoExiste ? "Título não encontrado" : "Deu ruim"}</TituloPagina>
        {!naoExiste && <div className="mb-6"><Erro mensagem="Não deu para carregar o elenco agora." tentarDeNovo={() => refetch()} /></div>}
        <Button asChild>
          <Link to="/campeoes">Ver a galeria <ArrowRight aria-hidden /></Link>
        </Button>
      </Pagina>
    );
  }

  const formacao = formacoes.data?.find((f) => f.codigo === t.melhorXI.formacao);
  const vagas: VagaCampanha[] | null = formacao
    ? formacao.vagas.map((v) => {
        const j = t.melhorXI.escalacao.find((e) => e.vaga === v.codigo);
        return {
          ...v,
          jogador: j ? { id: v.codigo, nome: j.nome, posicao: j.posicao, overall: j.overall, overallEfetivo: j.overallEfetivo, encaixe: "principal" as const, elenco: null } : null,
        };
      })
    : null;

  return (
    <Pagina larga>
      <Link to="/campeoes/$competicao" params={{ competicao: t.competicao.slug }} className="mb-4 inline-flex min-h-11 items-center gap-2 font-semibold text-verde">
        <ArrowLeft className="size-4" aria-hidden /> Campeões da {t.competicao.nome}
      </Link>
      <div className="mb-8 flex items-center gap-4 border-b-2 border-tinta pb-4">
        <Distintivo equipe={t.equipe} className="size-14 text-sm" />
        <div>
          <p className="rotulo text-verde">Campeão da {t.competicao.nome}</p>
          <h1 className="font-display text-4xl sm:text-5xl">
            {t.equipe.nome} {t.temporada}
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_minmax(0,380px)]">
        <div className="space-y-10">
          <div className="max-w-3xl space-y-3 text-lg text-neutro-800">
            {textoDoTitulo(t).map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <Elenco t={t} />
          {t.uso.maisEscolhidos.length > 0 && (
            <section aria-labelledby="titulo-escolhidos">
              <h2 id="titulo-escolhidos" className="rotulo mb-3">Os mais escalados pelos jogadores</h2>
              <ol className="border-2 border-neutro-400 bg-white">
                {t.uso.maisEscolhidos.map((j, i) => (
                  <li key={j.nome} className="flex justify-between gap-3 border-b border-gramado p-3 last:border-b-0">
                    <span>
                      <span className="mr-2 text-neutro-700">{i + 1}.</span>
                      {j.nome} <span className="text-sm text-neutro-700">· {NOME_POSICAO[j.posicao].toLowerCase()}</span>
                    </span>
                    <span className="text-sm">{vezes(j.vezesEscalado)}</span>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>
        <aside className="space-y-8">
          <section aria-labelledby="titulo-xi">
            <h2 id="titulo-xi" className="rotulo mb-3">
              Melhor XI · {t.melhorXI.formacao}
              {t.melhorXI.overall !== null && ` · overall ${formatar(t.melhorXI.overall)}`}
            </h2>
            {vagas ? (
              <Campo vagas={vagas} />
            ) : (
              <ul className="border-2 border-neutro-400 bg-white text-sm">
                {t.melhorXI.escalacao.map((e) => (
                  <li key={e.vaga} className="flex justify-between border-b border-gramado p-2 last:border-b-0">
                    <span>{e.nome}</span>
                    <span className="text-neutro-700">{e.posicao}</span>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-2 text-sm text-neutro-700">
              {t.ranking.posicao}º mais forte entre os {t.ranking.total} campeões da competição.
            </p>
          </section>
          <nav aria-label="Outros títulos" className="space-y-3">
            {t.anterior && (
              <Link
                to="/campeoes/$competicao/$temporada"
                params={{ competicao: t.competicao.slug, temporada: String(t.anterior.temporada) }}
                className="flex min-h-11 items-center gap-2 border-2 border-neutro-400 bg-white p-3 hover:border-tinta"
              >
                <ArrowLeft className="size-4" aria-hidden /> {t.anterior.equipe} {t.anterior.temporada}
              </Link>
            )}
            {t.proximo && (
              <Link
                to="/campeoes/$competicao/$temporada"
                params={{ competicao: t.competicao.slug, temporada: String(t.proximo.temporada) }}
                className="flex min-h-11 items-center justify-between gap-2 border-2 border-neutro-400 bg-white p-3 hover:border-tinta"
              >
                {t.proximo.equipe} {t.proximo.temporada} <ArrowRight className="size-4" aria-hidden />
              </Link>
            )}
            {t.outrosTitulos.length > 0 && (
              <div>
                <p className="rotulo mb-2">Outros títulos de {t.equipe.nome}</p>
                <ul className="space-y-1">
                  {t.outrosTitulos.map((o) => (
                    <li key={`${o.competicao.slug}-${o.temporada}`}>
                      <Link
                        to="/campeoes/$competicao/$temporada"
                        params={{ competicao: o.competicao.slug, temporada: String(o.temporada) }}
                        className="font-semibold text-verde underline underline-offset-4"
                      >
                        {o.competicao.nome} {o.temporada}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </nav>
          <Button asChild className="w-full">
            <Link to="/jogar" search={{ competicao: t.competicao.slug }}>
              Jogar a {t.competicao.nome} <ArrowRight aria-hidden />
            </Link>
          </Button>
        </aside>
      </div>
      <EspacoPublicidade posicao="conteudo" className="mt-12" />
    </Pagina>
  );
}

function Elenco({ t }: { t: TituloGaleria }) {
  return (
    <section aria-labelledby="titulo-elenco">
      <h2 id="titulo-elenco" className="rotulo mb-3">Elenco no jogo ({t.jogadores.length} jogadores)</h2>
      <div className="relative overflow-x-auto">
        <table className="w-full border-2 border-neutro-400 bg-white text-sm">
          <thead>
            <tr className="border-b-2 border-tinta text-left">
              <th className="p-2">Jogador</th>
              <th className="p-2">Posição</th>
              <th className="p-2">Também joga de</th>
              <th className="p-2 text-right">Overall</th>
            </tr>
          </thead>
          <tbody>
            {t.jogadores.map((j) => (
              <tr key={j.nome} className="border-b border-gramado">
                <td className="p-2 font-semibold">{j.nome}</td>
                <td className="p-2">{NOME_POSICAO[j.posicao]}</td>
                <td className="p-2 text-neutro-700">{j.posicoesSecundarias.map((p) => NOME_POSICAO[p]).join(", ") || "—"}</td>
                <td className="p-2 text-right">
                  <span className="font-bold tabular-nums">{j.overall}</span>{" "}
                  <span className="text-xs text-neutro-700">{NOME_RARIDADE[raridade(j.overall)]}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
