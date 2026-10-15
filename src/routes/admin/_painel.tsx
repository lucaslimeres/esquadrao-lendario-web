import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/layout";
import { adminLogado } from "@/stores/admin-sessao";

/** Guard + layout for every /admin page except the login. */
export const Route = createFileRoute("/admin/_painel")({
  beforeLoad: ({ location }) => {
    if (!adminLogado()) throw redirect({ to: "/admin/login", search: { redirect: location.href } });
  },
  component: () => (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  ),
});
