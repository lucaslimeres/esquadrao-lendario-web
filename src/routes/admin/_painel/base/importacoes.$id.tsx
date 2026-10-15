import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, ExternalLink, LoaderCircle, Pencil, RotateCcw, Upload, X } from "lucide-react";
import { useState } from "react";
import { Numero } from "@/components/admin/form";
import { CabecalhoAdmin } from "@/components/admin/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Carregando, Erro } from "@/components/ui/estados";
import { EditorRascunho, EquipeDoRascunho } from "@/features/admin/importacao";
import { adminApi } from "@/lib/admin-api";
import type { ItemImportacao } from "@/lib/admin-tipos";
import { mensagemErro } from "@/lib/api";
import { bloqueiaPublicacao, emAndamento, ROTULO_STATUS_IMPORTACAO, ROTULO_STATUS_ITEM } from "@/lib/importacao";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/_painel/base/importacoes/$id")({
  component: ImportacaoPage,
});

function ImportacaoPage() {
  const { id } = Route.useParams();
  const queryClient = useQueryClient();
  const [editando, setEditando] = useState<ItemImportacao | null>(null);
  const [resultado, setResultado] = useState<string | null>(null);
  const { data: imp, isPending, isError, refetch } = useQuery({
    queryKey: ["admin", "importacao", id],
    queryFn: () => adminApi.importacao(id),
    refetchInterval: (q) => (q.state.data && emAndamento(q.state.data.status) ? 2000 : false),
  });
  const atualizar = () => queryClient.invalidateQueries({ queryKey: ["admin"] });
  const publicarTodos = useMutation({
    mutationFn: () => adminApi.publicarImportacao(id),
    onSuccess: (r) => {
      atualizar();
      const falhas = r.falhas.map((f) => `${f.temporada} (${f.erro})`).join("; ");
      setResultado(`${r.publicados.length} elenco(s) publicado(s).${falhas ? ` Ficaram como rascunho: ${falhas}` : ""}`);
    },
  });

  if (isPending) return <Carregando />;
  if (isError) return <Erro mensagem="Importação não encontrada." tentarDeNovo={() => refetch()} />;

  const rascunhos = imp.itens.filter((i) => i.status === "rascunho").length;
  return (
    <>
      <CabecalhoAdmin
        rotulo={
          <span className="flex gap-2">
            <Link to="/admin/base" className="underline-offset-4 hover:underline">Campeonatos</Link>›
            <Link to="/admin/base/competicoes/$id" params={{ id: imp.competicaoId }} className="underline-offset-4 hover:underline">Competição</Link>
          </span>
        }
        titulo={`Importação ${imp.anoInicio}–${imp.anoFim}`}
        acoes={
          <Button tamanho="pequeno" disabled={rascunhos === 0 || publicarTodos.isPending} onClick={() => publicarTodos.mutate()}>
            {publicarTodos.isPending ? "Publicando…" : `Publicar todos (${rascunhos})`} <Upload aria-hidden />
          </Button>
        }
      />
      <div className="mb-6 grid grid-cols-2 lg:grid-cols-4">
        <Numero rotulo="Situação" valor={ROTULO_STATUS_IMPORTACAO[imp.status]} destaque={imp.status === "concluida"} detalhe={`Página: ${imp.paginaWikipedia}`} />
        <Numero rotulo="Temporadas" valor={imp.totalItens ? `${imp.itensProcessados}/${imp.totalItens}` : "—"} detalhe="processadas" />
        <Numero rotulo="Para revisar" valor={rascunhos} detalhe={`${imp.itensPorStatus.sem_dados ?? 0} sem elenco`} />
        <Numero rotulo="Publicados" valor={imp.itensPorStatus.publicado ?? 0} detalhe={`${imp.itensPorStatus.descartado ?? 0} descartados`} />
      </div>
      {emAndamento(imp.status) && (
        <p role="status" className="mb-4 flex items-center gap-2 text-sm text-neutro-700">
          <LoaderCircle className="size-4 animate-spin" aria-hidden /> Buscando nas fontes, uma temporada por vez. Pode sair da página: a importação continua.
        </p>
      )}
      {imp.erro && <Erro mensagem={imp.erro} />}
      {(resultado || publicarTodos.error) && (
        <p className="mb-4 border-l-4 border-verde bg-white p-3 text-sm" role="status">
          {resultado ?? mensagemErro(publicarTodos.error)}
        </p>
      )}

      <ul className="space-y-3">
        {imp.itens.map((item) => (
          <ItemCard key={item.id} item={item} aoEditar={() => setEditando(item)} aoMudar={atualizar} />
        ))}
      </ul>

      {editando && <EditorRascunho item={editando} aoFechar={() => setEditando(null)} aoSalvar={atualizar} />}
    </>
  );
}

function ItemCard({ item, aoEditar, aoMudar }: { item: ItemImportacao; aoEditar: () => void; aoMudar: () => void }) {
  const acao = useMutation({ mutationFn: (a: "publicar" | "descartar" | "reabrir") => adminApi.acaoItemImportacao(item.id, a), onSuccess: aoMudar });
  const bloqueios = item.avisos.filter(bloqueiaPublicacao);
  const outros = item.avisos.filter((a) => !bloqueiaPublicacao(a));
  const editavel = item.status === "rascunho" || item.status === "sem_dados";
  const goleiros = item.dados.jogadores.filter((j) => j.posicao === "GK").length;

  return (
    <li className={cn("border-2 border-neutro-400 bg-white p-4", item.status === "descartado" && "opacity-60")}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="font-display text-3xl">{item.temporada}</span>
          <div>
            <EquipeDoRascunho dados={item.dados} />
            <p className="mt-1 text-xs text-neutro-700">
              {item.dados.jogadores.length} jogadores · {goleiros} goleiro(s)
            </p>
          </div>
        </div>
        <Badge variant={item.status === "publicado" ? "avancou" : item.status === "rascunho" ? "contorno" : "eliminado"}>{ROTULO_STATUS_ITEM[item.status]}</Badge>
      </div>

      {acao.error && <div className="mt-3"><Erro mensagem={mensagemErro(acao.error)} /></div>}
      {bloqueios.length > 0 && editavel && (
        <ul className="mt-3 space-y-1 border-l-4 border-tinta pl-3 text-sm font-semibold">
          {bloqueios.map((a) => <li key={a}>{a}</li>)}
        </ul>
      )}
      {outros.length > 0 && (
        <details className="mt-3 text-sm">
          <summary className="min-h-11 cursor-pointer content-center font-semibold">{outros.length} aviso(s) para conferir</summary>
          <ul className="list-disc space-y-1 pl-5 text-neutro-800">
            {outros.map((a) => <li key={a}>{a}</li>)}
          </ul>
        </details>
      )}
      {item.dados.jogadores.length > 0 && (
        <details className="mt-1 text-sm">
          <summary className="min-h-11 cursor-pointer content-center font-semibold">Ver jogadores</summary>
          <ol className="grid gap-x-6 sm:grid-cols-2">
            {item.dados.jogadores.map((j) => (
              <li key={j.nome} className="flex justify-between gap-2 border-b border-gramado py-1">
                <span>
                  <span className="rotulo mr-2 text-[11px]">{j.posicao}</span>
                  {j.nome}
                </span>
                <span className="font-display">{j.overall}</span>
              </li>
            ))}
          </ol>
        </details>
      )}
      <p className="mt-2 flex flex-wrap gap-x-4 text-xs text-neutro-700">
        Fontes:
        {item.referencias.map((r) => (
          <a key={r.url} href={r.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 underline underline-offset-2">
            {r.fonte} <ExternalLink className="size-3" aria-hidden />
          </a>
        ))}
      </p>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        {editavel && (
          <>
            <Button tamanho="pequeno" disabled={bloqueios.length > 0 || acao.isPending} onClick={() => acao.mutate("publicar")}>
              Publicar <Check aria-hidden />
            </Button>
            <Button variant="contorno" tamanho="pequeno" onClick={aoEditar}>
              Revisar <Pencil aria-hidden />
            </Button>
            <Button variant="contorno" tamanho="pequeno" disabled={acao.isPending} onClick={() => acao.mutate("descartar")}>
              Descartar <X aria-hidden />
            </Button>
          </>
        )}
        {item.status === "descartado" && (
          <Button variant="contorno" tamanho="pequeno" disabled={acao.isPending} onClick={() => acao.mutate("reabrir")}>
            Reabrir <RotateCcw aria-hidden />
          </Button>
        )}
        {item.status === "publicado" && item.elencoId && (
          <Button asChild variant="contorno" tamanho="pequeno">
            <Link to="/admin/base/elencos/$id" params={{ id: item.elencoId }}>
              Ver elenco publicado
            </Link>
          </Button>
        )}
      </div>
    </li>
  );
}
