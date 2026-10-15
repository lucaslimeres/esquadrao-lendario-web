import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Link, Outlet } from "@tanstack/react-router";
import { Cabecalho, Pagina, Rodape, TituloPagina } from "@/components/layout";
import { Button } from "@/components/ui/button";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: () => (
    <div className="flex min-h-dvh flex-col">
      <Cabecalho />
      <div className="flex-1">
        <Outlet />
      </div>
      <Rodape />
    </div>
  ),
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
