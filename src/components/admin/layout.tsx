import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { LayoutDashboard, LogOut, Mail, Menu, Settings, ShieldCheck, Trophy, Users, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { adminApi } from "@/lib/admin-api";
import { cn } from "@/lib/utils";
import { useAdminSessao } from "@/stores/admin-sessao";

const ITENS = [
  { to: "/admin", rotulo: "Dashboard", icone: LayoutDashboard, exato: true },
  { to: "/admin/base", rotulo: "Campeonatos, times e jogadores", icone: Trophy, exato: false },
  { to: "/admin/usuarios", rotulo: "Usuários", icone: Users, exato: false },
  { to: "/admin/mensagens", rotulo: "Mensagens", icone: Mail, exato: false },
  { to: "/admin/administradores", rotulo: "Administradores", icone: ShieldCheck, exato: false },
  { to: "/admin/configuracoes", rotulo: "Configurações", icone: Settings, exato: false },
] as const;

/**
 * Admin area is visually its own thing: ink sidebar with the negative logo and an ADMIN tag,
 * so nobody confuses it with the player's app (both sessions can be open side by side).
 */
export function AdminLayout({ children }: { children: ReactNode }) {
  const { sessao, sair } = useAdminSessao();
  const navigate = useNavigate();
  const [aberto, setAberto] = useState(false);
  // New "Fale conosco" messages, shown as a counter in the sidebar (refreshed every minute).
  const { data: resumo } = useQuery({ queryKey: ["admin", "dashboard"], queryFn: adminApi.dashboard, enabled: !!sessao, refetchInterval: 60_000 });
  const novas = resumo?.mensagens.novas ?? 0;

  const nav = (
    <nav className="flex flex-col gap-1" aria-label="Painel">
      {ITENS.map(({ to, rotulo, icone: Icone, exato }) => (
        <Link
          key={to}
          to={to}
          activeOptions={{ exact: exato }}
          onClick={() => setAberto(false)}
          className="flex min-h-11 items-center gap-3 px-3 text-sm font-semibold text-neutro-300 hover:bg-neutro-800 hover:text-papel data-[status=active]:bg-verde data-[status=active]:text-white"
        >
          <Icone className="size-5 shrink-0" aria-hidden />
          {rotulo}
          {to === "/admin/mensagens" && novas > 0 && (
            <span className="ml-auto bg-verde-100 px-2 py-0.5 text-xs font-bold text-verde" aria-label={`${novas} nova${novas === 1 ? "" : "s"}`}>
              {novas}
            </span>
          )}
        </Link>
      ))}
    </nav>
  );

  const rodape = (
    <div className="border-t-2 border-neutro-800 pt-4 text-sm text-neutro-300">
      <p className="truncate font-semibold text-papel">{sessao?.admin.nome}</p>
      <p className="truncate">{sessao?.admin.email}</p>
      <button
        type="button"
        className="mt-3 inline-flex min-h-11 items-center gap-2 font-semibold hover:text-papel"
        onClick={() => {
          sair();
          navigate({ to: "/admin/login" });
        }}
      >
        <LogOut className="size-4" aria-hidden /> Sair do painel
      </button>
    </div>
  );

  const marca = (
    <Link to="/admin" className="flex items-center gap-3">
      <img src="/marca/horizontal-negativo.svg" alt="Esquadrão Lendário" className="h-8 w-auto" />
      <span className="rotulo bg-verde-claro px-1.5 py-0.5 text-[10px] text-tinta">Admin</span>
    </Link>
  );

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[264px_1fr]">
      <aside className="hidden flex-col justify-between gap-8 bg-tinta p-5 text-papel lg:flex lg:sticky lg:top-0 lg:h-dvh">
        <div className="space-y-8">
          {marca}
          {nav}
        </div>
        {rodape}
      </aside>
      <header className="flex items-center justify-between bg-tinta px-4 py-3 text-papel lg:hidden">
        {marca}
        <button type="button" className="inline-flex size-11 items-center justify-center" aria-label={aberto ? "Fechar menu" : "Abrir menu"} aria-expanded={aberto} onClick={() => setAberto((v) => !v)}>
          {aberto ? <X aria-hidden /> : <Menu aria-hidden />}
        </button>
      </header>
      {aberto && <div className="space-y-6 bg-tinta px-4 pb-5 text-papel lg:hidden">{nav}{rodape}</div>}
      <main className="min-w-0 px-4 py-6 sm:px-8 sm:py-8">{children}</main>
    </div>
  );
}

export function CabecalhoAdmin({ titulo, rotulo, acoes, className }: { titulo: string; rotulo?: ReactNode; acoes?: ReactNode; className?: string }) {
  return (
    <div className={cn("mb-6 flex flex-col gap-4 border-b-2 border-tinta pb-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div>
        {rotulo && <div className="rotulo mb-2 text-verde">{rotulo}</div>}
        <h1 className="text-3xl font-bold sm:text-4xl">{titulo}</h1>
      </div>
      {acoes && <div className="flex flex-wrap gap-2">{acoes}</div>}
    </div>
  );
}
