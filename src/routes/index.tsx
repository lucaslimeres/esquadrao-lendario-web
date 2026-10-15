import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Smartphone, Trophy } from "lucide-react";
import { CardJogador } from "@/components/jogo/card-jogador";
import { Campo } from "@/components/jogo/campo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Carregando, Erro } from "@/components/ui/estados";
import { FormFaleConosco } from "@/features/fale-conosco";
import { api } from "@/lib/api";
import { config } from "@/lib/config";
import type { Posicao, VagaCampanha } from "@/lib/tipos";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  return (
    <main>
      <Hero />
      <ComoFunciona />
      <Cards />
      <Competicoes />
      <Regras />
      <App />
      <ComOuSemConta />
      <FaleConosco />
      <ChamadaFinal />
    </main>
  );
}

function Secao({ id, rotulo, titulo, children, className }: { id?: string; rotulo: string; titulo: string; children: React.ReactNode; className?: string }) {
  return (
    <section id={id} className={cn("mx-auto max-w-6xl scroll-mt-4 px-4 py-14", className)}>
      <p className="rotulo mb-2 text-verde">{rotulo}</p>
      <h2 className="mb-8 border-b-2 border-tinta pb-4 text-3xl font-bold sm:text-4xl">{titulo}</h2>
      {children}
    </section>
  );
}

function Hero() {
  return (
    <section className="border-b-2 border-tinta">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-[1.15fr_1fr] md:items-center md:py-16">
        <div>
          <p className="rotulo mb-4 text-verde">Jogo de futebol · grátis</p>
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl">
            Escala aí o teu <span className="text-verde">esquadrão</span>.
          </h1>
          <p className="mt-6 max-w-xl text-lg">
            Monte o time dos sonhos com craques de times campeões da história — um sorteio por vaga — e leve-o ao título da
            Libertadores, da Copa do Brasil e de outras competições.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild tamanho="grande" className="sm:w-72">
              <Link to="/jogar">
                Jogar no navegador <ArrowRight aria-hidden />
              </Link>
            </Button>
            <Button asChild variant="contorno" tamanho="grande" className="sm:w-56">
              <a href="#app">
                Baixar o app <Smartphone aria-hidden />
              </a>
            </Button>
          </div>
          <p className="mt-4 text-sm text-neutro-700">Sem cadastro. Entre só se quiser guardar suas campanhas.</p>
        </div>
        <div className="mx-auto w-full max-w-sm">
          <Campo vagas={CAMPO_EXEMPLO} mostrarNomes={false} />
        </div>
      </div>
    </section>
  );
}

// Decorative 4-3-3 for the hero: positions and overalls only.
const CAMPO_EXEMPLO: VagaCampanha[] = (
  [
    ["GK_1", "GK", 50, 92, 88],
    ["LB_1", "LB", 20, 75, 89],
    ["CB_1", "CB", 40, 75, 86],
    ["CB_2", "CB", 60, 75, null],
    ["RB_1", "RB", 80, 75, 93],
    ["CDM_1", "CDM", 50, 58, 84],
    ["CM_1", "CM", 33, 44, 94],
    ["CM_2", "CM", 67, 44, null],
    ["LW_1", "LW", 25, 20, 93],
    ["ST_1", "ST", 50, 20, 87],
    ["RW_1", "RW", 75, 20, null],
  ] as Array<[string, Posicao, number, number, number | null]>
).map(([codigo, posicao, x, y, overall]) => ({
  codigo,
  posicao,
  x,
  y,
  jogador: overall
    ? { id: codigo, nome: "", posicao, overall, overallEfetivo: overall, encaixe: "principal" as const, elenco: null }
    : null,
}));

const PASSOS = [
  { titulo: "Escolha a competição e o esquema", texto: "Libertadores, Copa do Brasil e mais. 4-4-2, 4-3-3, 3-5-2… e o estilo: defensivo, equilibrado ou ofensivo." },
  { titulo: "Sorteia aí!", texto: "A cada rodada cai um time campeão — tipo São Paulo 2005. Você pega um craque dele e coloca na vaga certa." },
  { titulo: "Bola rolando", texto: "Com os 11 escalados, a campanha começa: fase de grupos, mata-mata, prorrogação e pênaltis. Gol a gol." },
];

function ComoFunciona() {
  return (
    <Secao id="como-funciona" rotulo="Como funciona" titulo="Três passos até a taça">
      <ol className="grid border-2 border-neutro-400 md:grid-cols-3">
        {PASSOS.map((passo, i) => (
          <li key={passo.titulo} className="border-neutro-400 p-5 not-last:border-b-2 md:not-last:border-r-2 md:not-last:border-b-0">
            <span className="font-display text-4xl text-verde">{String(i + 1).padStart(2, "0")}</span>
            <h3 className="mt-3 text-xl font-bold">{passo.titulo}</h3>
            <p className="mt-2">{passo.texto}</p>
          </li>
        ))}
      </ol>
    </Secao>
  );
}

function Cards() {
  return (
    <Secao rotulo="Craques de verdade" titulo="Cada carta, um campeão">
      <div className="flex gap-3 overflow-x-auto pb-2">
        <CardJogador nome="Arruabarrena" posicao="LB" overall={72} legenda="Boca Juniors 2000" />
        <CardJogador nome="Battaglia" posicao="CDM" overall={81} legenda="Boca Juniors 2000" />
        <CardJogador nome="Lugano" posicao="CB" overall={86} legenda="São Paulo 2005" />
        <CardJogador nome="Zico" posicao="CAM" overall={94} legenda="Flamengo 1981" />
      </div>
      <p className="mt-4 max-w-2xl text-neutro-700">
        O overall define a raridade: bronze, prata, ouro e lendário. Jogador fora da posição de origem rende menos — escolha
        bem a vaga.
      </p>
    </Secao>
  );
}

function Competicoes() {
  const { data, isPending, isError, refetch } = useQuery({ queryKey: ["competicoes"], queryFn: api.competicoes });
  return (
    <Secao id="competicoes" rotulo="Competições" titulo="Onde o teu esquadrão vai jogar">
      {isPending && <Carregando texto="Carregando competições…" />}
      {isError && <Erro mensagem="Não deu para carregar as competições agora." tentarDeNovo={() => refetch()} />}
      {data && (
        <ul className="grid border-2 border-neutro-400 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((c) => (
            <li key={c.slug} className="-mb-[2px] -mr-[2px] flex flex-col border-2 border-neutro-400 p-5">
              <div className="flex items-start justify-between gap-3">
                <Trophy className={cn("size-7", c.disponivel ? "text-verde" : "text-neutro-500")} aria-hidden />
                {c.disponivel ? <Badge variant="avancou">Disponível</Badge> : <Badge>Em breve</Badge>}
              </div>
              <h3 className="mt-4 text-xl font-bold">{c.nome}</h3>
              {c.descricao && <p className="mt-1 text-neutro-700">{c.descricao}</p>}
              <p className="rotulo mt-4 text-neutro-700">
                {c.jogosAteTitulo} jogos até o título · {c.formato === "mata_mata" ? "mata-mata" : "grupos + mata-mata"}
              </p>
              {c.disponivel && (
                <Button asChild variant="link" className="mt-3">
                  <Link to="/jogar" search={{ competicao: c.slug }}>
                    Jogar a {c.nome} <ArrowRight aria-hidden />
                  </Link>
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </Secao>
  );
}

const REGRAS = [
  ["11 sorteios", "Um time campeão por rodada, um jogador por vaga."],
  ["3 re-sorteios", "Não gostou do time que caiu? Troque — mas só três vezes."],
  ["Posição importa", "Na posição de origem, overall cheio. Improvisou, rende menos."],
  ["Jogo único", "No mata-mata, empate vai pra prorrogação e pênaltis."],
] as const;

function Regras() {
  return (
    <Secao rotulo="Regras rápidas" titulo="O que você precisa saber">
      <dl className="grid border-2 border-neutro-400 sm:grid-cols-2">
        {REGRAS.map(([titulo, texto]) => (
          <div key={titulo} className="-mb-[2px] -mr-[2px] border-2 border-neutro-400 p-5">
            <dt className="text-lg font-bold">{titulo}</dt>
            <dd className="mt-1">{texto}</dd>
          </div>
        ))}
      </dl>
    </Secao>
  );
}

function BotaoLoja({ loja, url }: { loja: "App Store" | "Google Play"; url: string | null }) {
  const conteudo = (
    <>
      <span>
        <span className="rotulo block text-[10px] text-neutro-400">{url ? "Baixe na" : "Em breve na"}</span>
        <span className="text-lg font-bold">{loja}</span>
      </span>
      <Smartphone aria-hidden />
    </>
  );
  if (!url) {
    return (
      <span aria-disabled className="inline-flex h-16 w-full items-center justify-between border-2 border-neutro-600 px-4 text-neutro-400 sm:w-60">
        {conteudo}
      </span>
    );
  }
  return (
    <a href={url} target="_blank" rel="noreferrer" className="inline-flex h-16 w-full items-center justify-between border-2 border-papel px-4 hover:bg-papel hover:text-tinta sm:w-60">
      {conteudo}
    </a>
  );
}

function App() {
  return (
    <section id="app" className="scroll-mt-4 bg-tinta text-papel">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 md:grid-cols-2 md:items-center">
        <div>
          <p className="rotulo mb-2 text-verde-claro">App mobile</p>
          <h2 className="font-display text-4xl sm:text-5xl">Feito para o celular.</h2>
          <p className="mt-4 max-w-md text-lg text-neutro-300">
            O Esquadrão Lendário nasceu para jogar na fila, no intervalo ou na segunda tela do jogo. Baixe o app — ou jogue aqui
            mesmo, no navegador.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <BotaoLoja loja="App Store" url={config.appStoreUrl} />
          <BotaoLoja loja="Google Play" url={config.playStoreUrl} />
          <Button asChild variant="link" className="mt-2 text-verde-claro">
            <Link to="/jogar">
              Prefiro jogar no navegador <ArrowRight aria-hidden />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function ComOuSemConta() {
  return (
    <Secao rotulo="Conta" titulo="Jogue sem conta. Entre para guardar.">
      <div className="grid border-2 border-neutro-400 md:grid-cols-2">
        <div className="border-b-2 border-neutro-400 p-5 md:border-r-2 md:border-b-0">
          <h3 className="text-xl font-bold">Sem conta</h3>
          <ul className="mt-3 list-inside list-disc space-y-1">
            <li>Joga na hora, sem cadastro.</li>
            <li>A campanha vale só nesta aba: fechou, ela não fica no seu histórico.</li>
            <li>Dá para criar a conta no meio do caminho e levar a campanha junto.</li>
          </ul>
        </div>
        <div className="p-5">
          <h3 className="text-xl font-bold">Com conta</h3>
          <ul className="mt-3 list-inside list-disc space-y-1">
            <li>Todas as suas campanhas ficam salvas.</li>
            <li>Retome uma campanha em andamento quando quiser.</li>
            <li>Consulte placares, artilheiros e títulos depois.</li>
          </ul>
          <Button asChild variant="contorno" className="mt-5 w-full sm:w-64">
            <Link to="/cadastro">
              Criar conta grátis <ArrowRight aria-hidden />
            </Link>
          </Button>
        </div>
      </div>
    </Secao>
  );
}

function FaleConosco() {
  return (
    <Secao id="fale-conosco" rotulo="Fale conosco" titulo="Sugestão, dúvida ou time faltando?">
      <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
        <p className="text-lg text-neutro-800">
          Manda pra gente: competição que você quer ver, campeão que ficou de fora, jogador com overall injusto ou qualquer problema no jogo. A
          resposta chega no seu e-mail.
        </p>
        <FormFaleConosco />
      </div>
    </Secao>
  );
}

function ChamadaFinal() {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-6">
      <div className="flex flex-col gap-6 border-t-2 border-tinta pt-10 md:flex-row md:items-end md:justify-between">
        <p className="font-display text-5xl sm:text-6xl">Sorteia aí!</p>
        <Button asChild tamanho="grande" className="md:w-72">
          <Link to="/jogar">
            Montar meu esquadrão <ArrowRight aria-hidden />
          </Link>
        </Button>
      </div>
    </section>
  );
}
