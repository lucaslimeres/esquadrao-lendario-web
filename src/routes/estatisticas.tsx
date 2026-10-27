import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { EspacoPublicidade } from "@/components/anuncio";
import { Pagina, TituloPagina } from "@/components/layout";
import { Carregando, Erro } from "@/components/ui/estados";
import { useTituloDocumento } from "@/features/guia/titulo-documento";
import { api } from "@/lib/api";
import { CHAVES, formatar } from "@/lib/galeria";
import { NOME_POSICAO } from "@/lib/jogo";
import type { JogadorDestaque, LinhaEstatistica } from "@/lib/tipos";

export const Route = createFileRoute("/estatisticas")({
  component: Estatisticas,
});

const NOME_ESTILO: Record<string, string> = { defensivo: "Defensivo", equilibrado: "Equilibrado", ofensivo: "Ofensivo" };
const quando = new Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeStyle: "short", timeZone: "America/Sao_Paulo" });
const taxa = (l: Pick<LinhaEstatistica, "taxaDeTitulo">) => (l.taxaDeTitulo === null ? "—" : `${formatar(l.taxaDeTitulo)}%`);

function Estatisticas() {
  useTituloDocumento("Estatísticas das campanhas");
  const { data, isPending, isError, refetch } = useQuery({ queryKey: CHAVES.estatisticas, queryFn: api.estatisticas });
  const competicoes = data?.porCompeticao.filter((c) => c.campanhas > 0) ?? [];
  const formacaoCampea = data ? [...data.porFormacao].filter((f) => f.campanhas >= 5).sort((a, b) => (b.taxaDeTitulo ?? 0) - (a.taxaDeTitulo ?? 0))[0] : undefined;

  return (
    <Pagina larga>
      <TituloPagina rotulo="Números do jogo">Estatísticas das campanhas</TituloPagina>
      <div className="max-w-3xl space-y-3 text-lg text-neutro-800">
        <p>
          O que acontece quando os esquadrões montados pelos jogadores entram em campo? Aqui estão os números de todas as campanhas jogadas no Esquadrão Lendário:
          quantas terminam com a taça, quais formações e estilos vencem mais, os craques mais escalados e os maiores artilheiros dos esquadrões.
        </p>
        {data && (
          <p>
            Até agora foram {formatar(data.campanhas.finalizadas)} campanhas completas e {formatar(data.campanhas.titulos)} títulos
            {data.campanhas.taxaDeTitulo !== null && `: só ${formatar(data.campanhas.taxaDeTitulo)}% dos esquadrões levantam a taça`}.
            {formacaoCampea &&
              ` A formação com a melhor taxa de título é o ${formacaoCampea.chave} (${taxa(formacaoCampea)}, em ${formatar(formacaoCampea.campanhas)} campanhas).`}
          </p>
        )}
      </div>

      {isPending && <Carregando texto="Carregando as estatísticas…" />}
      {isError && <Erro mensagem="Não deu para carregar as estatísticas agora." tentarDeNovo={() => refetch()} />}
      {data && (
        <>
          <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-2">
            {competicoes.length > 0 && (
              <Tabela titulo="Por competição" linhas={competicoes.map((c) => ({ ...c, rotulo: c.nome }))} />
            )}
            <Tabela titulo="Por formação" linhas={data.porFormacao.filter((f) => f.campanhas > 0).map((f) => ({ ...f, rotulo: f.chave }))} />
            <Tabela titulo="Por estilo de jogo" linhas={data.porEstilo.filter((f) => f.campanhas > 0).map((f) => ({ ...f, rotulo: NOME_ESTILO[f.chave] ?? f.chave }))} />
          </div>
          <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-2">
            <Ranking titulo="Craques mais escalados" unidade="escalações" jogadores={data.maisEscalados} />
            <Ranking titulo="Artilheiros dos esquadrões" unidade="gols" jogadores={data.artilheiros} />
          </div>
          <p className="mt-6 text-sm text-neutro-700">
            Atualizado em {quando.format(new Date(data.atualizadoEm))}. Só números agregados: nenhuma informação de quem jogou. Campanhas em grupo
            não entram na taxa de título.
          </p>
          <EspacoPublicidade posicao="conteudo" className="mt-12" />
        </>
      )}
    </Pagina>
  );
}

function Tabela({ titulo, linhas }: { titulo: string; linhas: Array<LinhaEstatistica & { rotulo: string }> }) {
  if (linhas.length === 0) return null;
  return (
    <section aria-label={titulo}>
      <h2 className="rotulo mb-3">{titulo}</h2>
      <div className="relative overflow-x-auto">
        <table className="w-full border-2 border-neutro-400 bg-white text-sm">
          <thead>
            <tr className="border-b-2 border-tinta text-left">
              <th className="p-2" />
              <th className="p-2 text-right">Campanhas</th>
              <th className="p-2 text-right">Títulos</th>
              <th className="p-2 text-right">Taxa</th>
            </tr>
          </thead>
          <tbody>
            {linhas.map((l) => (
              <tr key={l.chave} className="border-b border-gramado">
                <th scope="row" className="p-2 text-left font-semibold">{l.rotulo}</th>
                <td className="p-2 text-right tabular-nums">{formatar(l.campanhas)}</td>
                <td className="p-2 text-right tabular-nums">{formatar(l.titulos)}</td>
                <td className="p-2 text-right font-bold tabular-nums">{taxa(l)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Ranking({ titulo, unidade, jogadores }: { titulo: string; unidade: string; jogadores: JogadorDestaque[] }) {
  if (jogadores.length === 0) return null;
  return (
    <section aria-label={titulo}>
      <h2 className="rotulo mb-3">{titulo}</h2>
      <ol className="border-2 border-neutro-400 bg-white">
        {jogadores.map((j, i) => (
          <li key={`${j.nome}-${j.titulo.competicao.slug}-${j.titulo.temporada}`} className="flex items-center gap-3 border-b border-gramado p-3 last:border-b-0">
            <span className="w-6 text-neutro-700">{i + 1}.</span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold">{j.nome}</span>
              <Link
                to="/campeoes/$competicao/$temporada"
                params={{ competicao: j.titulo.competicao.slug, temporada: String(j.titulo.temporada) }}
                className="text-sm text-neutro-700 underline-offset-4 hover:underline"
              >
                {NOME_POSICAO[j.posicao]} · {j.titulo.equipe} {j.titulo.temporada}
              </Link>
            </span>
            <span className="text-right">
              <span className="block font-display text-xl tabular-nums">{formatar(j.total)}</span>
              <span className="text-xs text-neutro-700">{unidade}</span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
