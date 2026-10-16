import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Lock, Users } from "lucide-react";
import { useState } from "react";
import { Pagina, TituloPagina } from "@/components/layout";
import { MeusGrupos } from "@/features/grupo/meus-grupos";
import { Button } from "@/components/ui/button";
import { Carregando, Erro } from "@/components/ui/estados";
import { Input, Label } from "@/components/ui/input";
import { api, mensagemErro } from "@/lib/api";
import type { Visibilidade } from "@/lib/tipos";
import { cn } from "@/lib/utils";
import { useSessao } from "@/stores/sessao";

export const Route = createFileRoute("/grupos/")({
  component: Grupos,
});

const NOME_GRUPO_MAX = 40;
const NOME_TIME_MAX = 30;

/** Code typed or a pasted link (".../grupos/<codigo>"). */
function extrairCodigo(texto: string): string {
  const limpo = texto.trim();
  const doLink = limpo.match(/grupos\/([a-z0-9]+)/i);
  return (doLink ? doLink[1]! : limpo).toLowerCase();
}

function Grupos() {
  const logado = useSessao((s) => s.modo === "conta");
  return (
    <Pagina larga>
      <TituloPagina rotulo="Campanha em grupo">Jogue com a galera</TituloPagina>
      <ol className="mb-10 grid gap-3 sm:grid-cols-3">
        {[
          ["1", "Monte o grupo", "Chame a galera pelo link ou pelo e-mail. Cada um dá nome ao time e fica pronto."],
          ["2", "Cada um monta o seu", "Todo mundo monta o time no sorteio de sempre, ao mesmo tempo."],
          ["3", "Torneio de 32", "Os times do grupo e campeões sorteados disputam a chave. Jogo entre amigos é ao vivo para os dois."],
        ].map(([n, titulo, texto]) => (
          <li key={n} className="border-2 border-neutro-400 bg-white p-4">
            <span className="font-display text-3xl text-verde">{n}</span>
            <p className="mt-1 font-bold">{titulo}</p>
            <p className="mt-1 text-sm text-neutro-700">{texto}</p>
          </li>
        ))}
      </ol>

      <div className="grid gap-8 lg:grid-cols-2">
        {logado ? <CriarGrupo /> : <ConvitePraCriar />}
        <EntrarComCodigo />
      </div>

      {logado && <MeusGrupos />}
      <GruposAbertos />
    </Pagina>
  );
}

function ConvitePraCriar() {
  return (
    <section className="border-2 border-tinta bg-white p-5">
      <h2 className="rotulo mb-3">Criar um grupo</h2>
      <p>Para criar e moderar um grupo, entre na sua conta. Para entrar no grupo de alguém, basta o link.</p>
      <Button asChild className="mt-4 w-full sm:w-64">
        <Link to="/entrar" search={{ redirect: "/grupos" }}>
          Entrar para criar <ArrowRight aria-hidden />
        </Link>
      </Button>
    </section>
  );
}

function CriarGrupo() {
  const navigate = useNavigate();
  const competicoes = useQuery({ queryKey: ["competicoes"], queryFn: api.competicoes });
  const disponiveis = competicoes.data?.filter((c) => c.disponivel) ?? [];
  const [nome, setNome] = useState("");
  const [competicao, setCompeticao] = useState<string | null>(null);
  const [visibilidade, setVisibilidade] = useState<Visibilidade>("privado");
  const [nomeTime, setNomeTime] = useState("");
  const escolhida = competicao ?? disponiveis[0]?.slug ?? null;

  const criar = useMutation({
    mutationFn: () => api.criarGrupo({ nome, competicao: escolhida!, visibilidade, nomeTime: nomeTime.trim() || null }),
    onSuccess: (g) => navigate({ to: "/grupos/$codigo", params: { codigo: g.codigo } }),
  });

  return (
    <section aria-labelledby="titulo-criar" className="border-2 border-tinta bg-white p-5">
      <h2 id="titulo-criar" className="rotulo mb-4">Criar um grupo</h2>
      {competicoes.isPending ? (
        <Carregando />
      ) : (
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!criar.isPending) criar.mutate();
          }}
        >
          <div>
            <Label htmlFor="nome-grupo">Nome do grupo</Label>
            <Input id="nome-grupo" value={nome} maxLength={NOME_GRUPO_MAX} required minLength={3} placeholder="Ex.: Pelada de sexta" onChange={(e) => setNome(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="competicao-grupo">Competição</Label>
            <select
              id="competicao-grupo"
              className="h-11 w-full border-2 border-neutro-400 bg-white px-3 focus:border-tinta focus:outline-none"
              value={escolhida ?? ""}
              onChange={(e) => setCompeticao(e.target.value)}
            >
              {disponiveis.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.nome}
                </option>
              ))}
            </select>
          </div>
          <fieldset>
            <legend className="mb-2 text-sm font-semibold">Quem pode entrar</legend>
            <div role="radiogroup" className="grid gap-2 sm:grid-cols-2">
              {(
                [
                  ["privado", "Privado", "Só quem tiver o link ou for adicionado."],
                  ["publico", "Público", "Aparece na lista de grupos abertos."],
                ] as const
              ).map(([valor, titulo, texto]) => (
                <button
                  key={valor}
                  type="button"
                  role="radio"
                  aria-checked={visibilidade === valor}
                  onClick={() => setVisibilidade(valor)}
                  className={cn("border-2 p-3 text-left", visibilidade === valor ? "border-verde bg-verde-100" : "border-neutro-400 bg-white hover:border-tinta")}
                >
                  <span className="font-bold">{titulo}</span>
                  <span className="block text-sm text-neutro-700">{texto}</span>
                </button>
              ))}
            </div>
          </fieldset>
          <div>
            <Label htmlFor="nome-meu-time">Nome do seu time (dá para mudar depois)</Label>
            <Input id="nome-meu-time" value={nomeTime} maxLength={NOME_TIME_MAX} autoComplete="off" onChange={(e) => setNomeTime(e.target.value)} />
          </div>
          {criar.isError && <Erro mensagem={mensagemErro(criar.error, "Não deu para criar o grupo.")} />}
          {disponiveis.length === 0 && <p>Nenhuma competição liberada ainda.</p>}
          <Button type="submit" className="w-full sm:w-64" disabled={!escolhida || criar.isPending}>
            {criar.isPending ? "Criando…" : "Criar grupo"} <ArrowRight aria-hidden />
          </Button>
        </form>
      )}
    </section>
  );
}

function EntrarComCodigo() {
  const navigate = useNavigate();
  const [codigo, setCodigo] = useState("");
  return (
    <section aria-labelledby="titulo-codigo" className="border-2 border-neutro-400 bg-white p-5">
      <h2 id="titulo-codigo" className="rotulo mb-4">Tenho um convite</h2>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          const c = extrairCodigo(codigo);
          if (c) navigate({ to: "/grupos/$codigo", params: { codigo: c } });
        }}
      >
        <div>
          <Label htmlFor="codigo-grupo">Código ou link do grupo</Label>
          <Input id="codigo-grupo" value={codigo} autoComplete="off" placeholder="Ex.: k3m9x2p7qa" onChange={(e) => setCodigo(e.target.value)} />
        </div>
        <Button type="submit" variant="contorno" className="w-full sm:w-64" disabled={!codigo.trim()}>
          Abrir grupo <ArrowRight aria-hidden />
        </Button>
      </form>
    </section>
  );
}

function GruposAbertos() {
  const competicoes = useQuery({ queryKey: ["competicoes"], queryFn: api.competicoes });
  const [filtro, setFiltro] = useState("");
  const abertos = useQuery({ queryKey: ["grupos-abertos", filtro], queryFn: () => api.gruposAbertos(filtro || undefined), refetchInterval: 15_000 });
  return (
    <section aria-labelledby="titulo-abertos" className="mt-10">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <h2 id="titulo-abertos" className="rotulo">Grupos abertos</h2>
        <div className="w-full sm:w-64">
          <Label htmlFor="filtro-competicao" className="sr-only">
            Filtrar por competição
          </Label>
          <select
            id="filtro-competicao"
            className="h-11 w-full border-2 border-neutro-400 bg-white px-3 focus:border-tinta focus:outline-none"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          >
            <option value="">Todas as competições</option>
            {competicoes.data
              ?.filter((c) => c.disponivel)
              .map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.nome}
                </option>
              ))}
          </select>
        </div>
      </div>
      {abertos.isPending && <Carregando />}
      {abertos.isError && <Erro mensagem="Não deu para carregar os grupos." tentarDeNovo={() => abertos.refetch()} />}
      {abertos.data?.length === 0 && (
        <p className="flex items-center gap-2 text-neutro-700">
          <Lock className="size-4" aria-hidden /> Nenhum grupo público com vaga agora. Que tal criar um?
        </p>
      )}
      {!!abertos.data?.length && (
        <ul className="divide-y-2 divide-gramado border-2 border-neutro-400 bg-white">
          {abertos.data.map((g) => (
            <li key={g.codigo}>
              <Link to="/grupos/$codigo" params={{ codigo: g.codigo }} className="flex items-center gap-4 p-4 hover:bg-gramado">
                <span className="min-w-0 flex-1">
                  <span className="block font-bold">{g.nome}</span>
                  <span className="text-sm text-neutro-700">{g.competicao.nome}</span>
                </span>
                <span className="inline-flex items-center gap-1 text-sm font-semibold">
                  <Users className="size-4" aria-hidden /> {g.membros}/{g.vagas}
                </span>
                <ArrowRight className="size-5 shrink-0" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
