// Build-time prerender of the public content pages (scripts/prerender.mjs): the HTML that
// crawlers (and the AdSense review) read already has the text, instead of an empty SPA shell.
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createMemoryHistory, createRouter, RouterProvider } from "@tanstack/react-router";
import { prerenderToNodeStream } from "react-dom/static";
import { api } from "./lib/api";
import { CHAVES, caminhoTitulo, formatar } from "./lib/galeria";
import { GUIAS } from "./lib/guias";
import type { Galeria } from "./lib/tipos";
import { routeTree } from "./routeTree.gen";

const DESCRICAO_PADRAO =
  "Monte o esquadrão dos sonhos com craques de times campeões da história e leve-o ao título. Jogue no navegador ou baixe o app.";

interface Pagina {
  caminho: string;
  titulo: string;
  descricao: string;
  /** API data the page needs: fetched before rendering; if it fails, the page is skipped. */
  dados?: Array<{ queryKey: readonly unknown[]; queryFn: () => Promise<unknown> }>;
}

/** Pages with editorial content: prerendered, listed in the sitemap, and the only ones with ads. */
export const PAGINAS: Pagina[] = [
  { caminho: "/", titulo: "Esquadrão Lendário — monte o esquadrão dos sonhos", descricao: DESCRICAO_PADRAO },
  ...GUIAS.map((g) => ({ caminho: g.to, titulo: `${g.titulo} — Esquadrão Lendário`, descricao: g.resumo })),
  {
    caminho: "/excluir-conta",
    titulo: "Excluir conta — Esquadrão Lendário",
    descricao: "Como excluir a sua conta do Esquadrão Lendário e as suas campanhas, pelo site ou pelo app.",
  },
  {
    caminho: "/privacidade",
    titulo: "Política de privacidade — Esquadrão Lendário",
    descricao: "O que o Esquadrão Lendário guarda, para quê, cookies e anúncios do Google, e como pedir para apagar seus dados (LGPD).",
  },
];

const LIMITE_API_MS = 10_000;

function comLimite<T>(promessa: Promise<T>): Promise<T> {
  return Promise.race([promessa, new Promise<T>((_, falha) => setTimeout(() => falha(new Error("tempo esgotado")), LIMITE_API_MS))]);
}

/**
 * Every page to prerender: the fixed ones plus the champions gallery (one page per competition
 * and per title, listed from the API at build time) and the statistics. Without the API, the
 * gallery pages are left out and fall back to the SPA shell, which fetches the data live.
 */
export async function listarPaginas(): Promise<Pagina[]> {
  let galeria: Galeria;
  try {
    galeria = await comLimite(api.galeria());
  } catch (erro) {
    console.warn(`prerender: galeria indisponível (${(erro as Error).message}); páginas de campeões ficam de fora`);
    return PAGINAS;
  }
  const dadosGaleria = { queryKey: CHAVES.galeria, queryFn: async () => galeria };
  const { resumo } = galeria;
  return [
    ...PAGINAS,
    {
      caminho: "/campeoes",
      titulo: "Galeria de campeões — Esquadrão Lendário",
      descricao: `Os ${resumo.titulos} elencos campeões da base do Esquadrão Lendário: ${resumo.equipes} clubes, ${resumo.jogadores} jogadores, overall de cada time e os craques de cada título.`,
      dados: [dadosGaleria],
    },
    ...galeria.competicoes.flatMap((c) => [
      {
        caminho: `/campeoes/${c.slug}`,
        titulo: `Campeões da ${c.nome} — Esquadrão Lendário`,
        descricao: `Todos os ${c.titulos.length} campeões da ${c.nome} no Esquadrão Lendário, com o overall de cada elenco, o craque do time e os mais sorteados.`,
        dados: [dadosGaleria],
      },
      ...c.titulos.map((t) => ({
        caminho: caminhoTitulo(c.slug, t.temporada),
        titulo: `${t.equipe.nome} ${t.temporada}, campeão da ${c.nome} — Esquadrão Lendário`,
        descricao: `${t.equipe.nome}, campeão da ${c.nome} de ${t.temporada}: ${t.totalJogadores} jogadores${t.overallTime !== null ? `, melhor escalação com overall ${formatar(t.overallTime)}` : ""}${
          t.craque ? ` e o craque ${t.craque.nome}` : ""
        }.`,
        dados: [
          { queryKey: CHAVES.titulo(c.slug, t.temporada), queryFn: () => api.tituloGaleria(c.slug, t.temporada) },
          { queryKey: ["formacoes"], queryFn: api.formacoes },
        ],
      })),
    ]),
    {
      caminho: "/estatisticas",
      titulo: "Estatísticas das campanhas — Esquadrão Lendário",
      descricao: "Taxa de título por competição, formação e estilo, os craques mais escalados e os artilheiros dos esquadrões montados pelos jogadores.",
      dados: [{ queryKey: CHAVES.estatisticas, queryFn: api.estatisticas }],
    },
  ];
}

async function textoDoStream(stream: NodeJS.ReadableStream): Promise<string> {
  let html = "";
  for await (const parte of stream) html += typeof parte === "string" ? parte : Buffer.from(parte as Uint8Array).toString("utf8");
  return html;
}

/** The page's HTML, or null when the data it needs could not be fetched. */
export async function renderizar({ caminho, dados = [] }: Pagina): Promise<string | null> {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  try {
    for (const d of dados) queryClient.setQueryData(d.queryKey, await comLimite(d.queryFn()));
  } catch (erro) {
    console.warn(`prerender: ${caminho} sem dados (${(erro as Error).message}); fica de fora`);
    return null;
  }
  // The competitions on the landing come from the API: best effort, a few seconds at most.
  await Promise.race([queryClient.prefetchQuery({ queryKey: ["competicoes"], queryFn: api.competicoes }), new Promise((ok) => setTimeout(ok, 5_000))]).catch(
    () => undefined,
  );
  const router = createRouter({ routeTree, context: { queryClient }, history: createMemoryHistory({ initialEntries: [caminho] }), isServer: true });
  await router.load();
  const { prelude } = await prerenderToNodeStream(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
  return textoDoStream(prelude);
}
