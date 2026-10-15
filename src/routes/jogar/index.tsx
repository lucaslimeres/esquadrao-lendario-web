import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { Campo } from "@/components/jogo/campo";
import { Pagina, TituloPagina } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Carregando, Erro } from "@/components/ui/estados";
import { AvisoConvidado } from "@/features/aviso-convidado";
import { garantirSessao } from "@/features/sessao";
import { api, ApiError } from "@/lib/api";
import type { Estilo } from "@/lib/tipos";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/jogar/")({
  validateSearch: z.object({ competicao: z.string().optional() }),
  component: NovaCampanha,
});

const ESTILOS: Array<{ valor: Estilo; nome: string; texto: string }> = [
  { valor: "defensivo", nome: "Defensivo", texto: "Fecha a casinha. Sofre menos, marca menos." },
  { valor: "equilibrado", nome: "Equilibrado", texto: "Nem retranca, nem abafa." },
  { valor: "ofensivo", nome: "Ofensivo", texto: "Pra cima! Marca mais, mas deixa espaço." },
];

function Opcao({ selecionada, desabilitada, onClick, children }: { selecionada: boolean; desabilitada?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selecionada}
      disabled={desabilitada}
      onClick={onClick}
      className={cn(
        "relative flex w-full flex-col items-start border-2 p-4 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60",
        selecionada ? "border-verde bg-verde-100" : "border-neutro-400 bg-white hover:border-tinta",
      )}
    >
      {selecionada && <Check className="absolute right-3 top-3 size-5 text-verde" aria-hidden />}
      {children}
    </button>
  );
}

function NovaCampanha() {
  const { competicao: competicaoInicial } = Route.useSearch();
  const navigate = useNavigate();
  const competicoes = useQuery({ queryKey: ["competicoes"], queryFn: api.competicoes });
  const formacoes = useQuery({ queryKey: ["formacoes"], queryFn: api.formacoes, staleTime: Infinity });

  const [competicaoEscolhida, setCompeticao] = useState<string | null>(competicaoInicial ?? null);
  const [formacao, setFormacao] = useState("4-3-3");
  const [estilo, setEstilo] = useState<Estilo>("equilibrado");

  const disponiveis = competicoes.data?.filter((c) => c.disponivel) ?? [];
  const competicao = disponiveis.some((c) => c.slug === competicaoEscolhida) ? competicaoEscolhida : (disponiveis[0]?.slug ?? null);
  const formacaoAtual = formacoes.data?.find((f) => f.codigo === formacao);

  const comecar = useMutation({
    mutationFn: async () => {
      await garantirSessao();
      return api.criarCampanha({ competicao: competicao!, formacao, estilo });
    },
    onSuccess: (campanha) => navigate({ to: "/jogar/$id", params: { id: campanha.id } }),
  });

  if (competicoes.isPending || formacoes.isPending) return <Pagina><Carregando /></Pagina>;
  if (competicoes.isError || formacoes.isError) {
    return (
      <Pagina>
        <Erro mensagem="Não deu para carregar o jogo agora." tentarDeNovo={() => { competicoes.refetch(); formacoes.refetch(); }} />
      </Pagina>
    );
  }

  return (
    <Pagina larga>
      <TituloPagina rotulo="Nova campanha">Qual o esquema?</TituloPagina>
      <AvisoConvidado />

      <section aria-labelledby="titulo-competicao" className="mb-10">
        <h2 id="titulo-competicao" className="rotulo mb-3">1 · Competição</h2>
        <div role="radiogroup" aria-labelledby="titulo-competicao" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {competicoes.data.map((c) => (
            <Opcao key={c.slug} selecionada={c.slug === competicao} desabilitada={!c.disponivel} onClick={() => setCompeticao(c.slug)}>
              <span className="text-lg font-bold">{c.nome}</span>
              <span className="mt-1 text-sm text-neutro-700">{c.jogosAteTitulo} jogos até o título</span>
              {!c.disponivel && <Badge className="mt-2">Em breve</Badge>}
            </Opcao>
          ))}
        </div>
        {disponiveis.length === 0 && <p className="mt-3">Nenhuma competição liberada ainda. Volte em breve!</p>}
      </section>

      <section aria-labelledby="titulo-formacao" className="mb-10 grid gap-6 md:grid-cols-[1fr_280px]">
        <div>
          <h2 id="titulo-formacao" className="rotulo mb-3">2 · Formação</h2>
          <div role="radiogroup" aria-labelledby="titulo-formacao" className="grid grid-cols-3 gap-3">
            {formacoes.data.map((f) => (
              <Opcao key={f.codigo} selecionada={f.codigo === formacao} onClick={() => setFormacao(f.codigo)}>
                <span className="font-display text-xl sm:text-2xl">{f.codigo}</span>
              </Opcao>
            ))}
          </div>
        </div>
        {formacaoAtual && <Campo vagas={formacaoAtual.vagas.map((v) => ({ ...v, jogador: null }))} mostrarNomes={false} className="max-w-[280px]" />}
      </section>

      <section aria-labelledby="titulo-estilo" className="mb-10">
        <h2 id="titulo-estilo" className="rotulo mb-3">3 · Estilo de jogo</h2>
        <div role="radiogroup" aria-labelledby="titulo-estilo" className="grid gap-3 sm:grid-cols-3">
          {ESTILOS.map((e) => (
            <Opcao key={e.valor} selecionada={e.valor === estilo} onClick={() => setEstilo(e.valor)}>
              <span className="text-lg font-bold">{e.nome}</span>
              <span className="mt-1 text-sm text-neutro-700">{e.texto}</span>
            </Opcao>
          ))}
        </div>
      </section>

      {comecar.isError && (
        <div className="mb-4">
          <Erro mensagem={comecar.error instanceof ApiError ? comecar.error.message : "Não deu para começar. Tente de novo."} />
        </div>
      )}
      <Button tamanho="grande" className="w-full sm:w-80" disabled={!competicao || comecar.isPending} onClick={() => comecar.mutate()}>
        {comecar.isPending ? "Preparando o vestiário…" : "Começar a montar o time"} <ArrowRight aria-hidden />
      </Button>
    </Pagina>
  );
}
