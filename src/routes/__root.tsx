import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Cabecalho, Pagina, Rodape, TituloPagina } from "@/components/layout";
import { Button } from "@/components/ui/button";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: Raiz,
  notFoundComponent: () => (
    <Pagina>
      <TituloPagina rotulo="404">Bola fora!</TituloPagina>
      <p className="mb-6">Essa página não existe.</p>
      <Button asChild>
        <Link to="/">Voltar para o início</Link>
      </Button>
    </Pagina>
  ),
});

/** The admin panel (/admin/*) has its own layout; everything else gets the public header/footer. */
function Raiz() {
  const painel = useRouterState({ select: (s) => s.location.pathname.startsWith("/admin") });
  if (painel) return <Outlet />;
  return (
    <div className="flex min-h-dvh flex-col">
      <Cabecalho />
      <div className="flex-1">
        <Outlet />
      </div>
      <Rodape />
    </div>
  );
}
