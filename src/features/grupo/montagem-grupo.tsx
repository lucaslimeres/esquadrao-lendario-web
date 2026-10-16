import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Check, Hourglass } from "lucide-react";
import { useState } from "react";
import { Campo } from "@/components/jogo/campo";
import { Button } from "@/components/ui/button";
import { Carregando, Erro } from "@/components/ui/estados";
import { api, mensagemErro } from "@/lib/api";
import type { Estilo, Grupo } from "@/lib/tipos";
import { cn } from "@/lib/utils";
import { ListaMembros } from "./membros";
import { useAcaoGrupo } from "./use-grupo";

const ESTILOS: Array<{ valor: Estilo; nome: string }> = [
  { valor: "defensivo", nome: "Defensivo" },
  { valor: "equilibrado", nome: "Equilibrado" },
  { valor: "ofensivo", nome: "Ofensivo" },
];

/** Everybody drafts at the same time, with the usual draw; the tournament starts with the last XI. */
export function MontagemGrupo({ grupo }: { grupo: Grupo }) {
  const { codigo } = grupo;
  const campanha = grupo.meuMembro?.campanha ?? null;
  const remover = useAcaoGrupo(codigo, (id: string) => api.removerDoGrupo(codigo, id));
  const prontos = grupo.membros.filter((m) => m.montagem === "pronto").length;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_minmax(0,400px)]">
      <div>
        {!campanha && <EscolherEsquema grupo={grupo} />}
        {campanha && campanha.status === "montagem" && (
          <section className="border-2 border-tinta bg-white p-5">
            <h2 className="rotulo mb-2">Seu time</h2>
            <p>Sua montagem está no meio. Bora terminar?</p>
            <Button asChild tamanho="grande" className="mt-4 w-full sm:w-80">
              <Link to="/jogar/$id" params={{ id: campanha.id }}>
                Continuar a montagem <ArrowRight aria-hidden />
              </Link>
            </Button>
          </section>
        )}
        {campanha && campanha.status !== "montagem" && (
          <section className="border-2 border-verde bg-verde-100 p-5" aria-live="polite">
            <p className="flex items-center gap-2 text-lg font-bold text-verde">
              <Check className="size-5" aria-hidden /> Seu time está fechado!
            </p>
            <p className="mt-2 flex items-center gap-2">
              <Hourglass className="size-4" aria-hidden /> Esperando os outros: {prontos} de {grupo.membros.length} times fechados. O torneio começa sozinho quando o último fechar.
            </p>
            <Button asChild variant="link" className="mt-2">
              <Link to="/jogar/$id" params={{ id: campanha.id }}>
                Ver meu time
              </Link>
            </Button>
          </section>
        )}
      </div>
      <aside>
        <ListaMembros grupo={grupo} onRemover={grupo.souModerador ? (id) => remover.mutate(id) : undefined} removendo={remover.isPending} />
        {grupo.souModerador && <p className="mt-2 text-sm text-neutro-700">Alguém sumiu? Remova para o torneio não ficar esperando.</p>}
        {remover.isError && <Erro mensagem={mensagemErro(remover.error, "Não deu para remover.")} />}
      </aside>
    </div>
  );
}

function EscolherEsquema({ grupo }: { grupo: Grupo }) {
  const navigate = useNavigate();
  const formacoes = useQuery({ queryKey: ["formacoes"], queryFn: api.formacoes, staleTime: Infinity });
  const [formacao, setFormacao] = useState("4-3-3");
  const [estilo, setEstilo] = useState<Estilo>("equilibrado");
  const montar = useMutation({
    mutationFn: () => api.montarTimeDoGrupo(grupo.codigo, { formacao, estilo }),
    onSuccess: ({ campanhaId }) => navigate({ to: "/jogar/$id", params: { id: campanhaId } }),
  });
  if (formacoes.isPending) return <Carregando />;
  if (formacoes.isError) return <Erro mensagem="Não deu para carregar as formações." tentarDeNovo={() => formacoes.refetch()} />;
  const atual = formacoes.data.find((f) => f.codigo === formacao);

  return (
    <section aria-labelledby="titulo-esquema" className="border-2 border-tinta bg-white p-5">
      <h2 id="titulo-esquema" className="rotulo mb-1">Hora de montar o time</h2>
      <p className="mb-5 text-sm text-neutro-700">Mesmo sorteio de sempre: 11 times campeões, um jogador de cada, 3 re-sorteios.</p>
      <div className="grid gap-6 md:grid-cols-[1fr_220px]">
        <div className="space-y-5">
          <div>
            <p id="titulo-formacao-grupo" className="mb-2 text-sm font-semibold">Formação</p>
            <div role="radiogroup" aria-labelledby="titulo-formacao-grupo" className="grid grid-cols-3 gap-2">
              {formacoes.data.map((f) => (
                <button
                  key={f.codigo}
                  type="button"
                  role="radio"
                  aria-checked={f.codigo === formacao}
                  onClick={() => setFormacao(f.codigo)}
                  className={cn("min-h-11 border-2 font-display text-lg", f.codigo === formacao ? "border-verde bg-verde-100" : "border-neutro-400 hover:border-tinta")}
                >
                  {f.codigo}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p id="titulo-estilo-grupo" className="mb-2 text-sm font-semibold">Estilo</p>
            <div role="radiogroup" aria-labelledby="titulo-estilo-grupo" className="grid grid-cols-3 gap-2">
              {ESTILOS.map((e) => (
                <button
                  key={e.valor}
                  type="button"
                  role="radio"
                  aria-checked={e.valor === estilo}
                  onClick={() => setEstilo(e.valor)}
                  className={cn("min-h-11 border-2 px-2 text-sm font-semibold", e.valor === estilo ? "border-verde bg-verde-100" : "border-neutro-400 hover:border-tinta")}
                >
                  {e.nome}
                </button>
              ))}
            </div>
          </div>
        </div>
        {atual && <Campo vagas={atual.vagas.map((v) => ({ ...v, jogador: null }))} mostrarNomes={false} className="max-w-[220px]" />}
      </div>
      {montar.isError && (
        <div className="mt-4">
          <Erro mensagem={mensagemErro(montar.error, "Não deu para começar.")} />
        </div>
      )}
      <Button tamanho="grande" className="mt-6 w-full sm:w-80" disabled={montar.isPending} onClick={() => montar.mutate()}>
        {montar.isPending ? "Preparando o vestiário…" : "Começar a montar"} <ArrowRight aria-hidden />
      </Button>
    </section>
  );
}
