// Build-time prerender of the public content pages (scripts/prerender.mjs): the HTML that
// crawlers (and the AdSense review) read already has the text, instead of an empty SPA shell.
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createMemoryHistory, createRouter, RouterProvider } from "@tanstack/react-router";
import { prerenderToNodeStream } from "react-dom/static";
import { api } from "./lib/api";
import { GUIAS } from "./lib/guias";
import { routeTree } from "./routeTree.gen";

const DESCRICAO_PADRAO =
  "Monte o esquadrão dos sonhos com craques de times campeões da história e leve-o ao título. Jogue no navegador ou baixe o app.";

/** Pages with editorial content: prerendered, listed in the sitemap, and the only ones with ads. */
export const PAGINAS: Array<{ caminho: string; titulo: string; descricao: string }> = [
  { caminho: "/", titulo: "Esquadrão Lendário — monte o esquadrão dos sonhos", descricao: DESCRICAO_PADRAO },
  ...GUIAS.map((g) => ({ caminho: g.to, titulo: `${g.titulo} — Esquadrão Lendário`, descricao: g.resumo })),
  {
    caminho: "/privacidade",
    titulo: "Política de privacidade — Esquadrão Lendário",
    descricao: "O que o Esquadrão Lendário guarda, para quê, cookies e anúncios do Google, e como pedir para apagar seus dados (LGPD).",
  },
];

async function textoDoStream(stream: NodeJS.ReadableStream): Promise<string> {
  let html = "";
  for await (const parte of stream) html += typeof parte === "string" ? parte : Buffer.from(parte as Uint8Array).toString("utf8");
  return html;
}

export async function renderizar(caminho: string): Promise<string> {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
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
