import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { mensagemErro } from "@/lib/api";
import { CampoForm } from "@/components/admin/form";
import { Button } from "@/components/ui/button";
import { Erro } from "@/components/ui/estados";
import { Input } from "@/components/ui/input";
import { adminApi } from "@/lib/admin-api";
import { useAdminSessao } from "@/stores/admin-sessao";

export const Route = createFileRoute("/admin/login")({
  validateSearch: z.object({ redirect: z.string().optional() }),
  component: LoginAdmin,
});

function LoginAdmin() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const entrar = useAdminSessao((s) => s.entrar);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      entrar(await adminApi.login(email.trim().toLowerCase(), senha));
      await navigate({ to: redirect?.startsWith("/admin") ? redirect : "/admin" });
    } catch (err) {
      setErro(mensagemErro(err));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-tinta px-4">
      <form onSubmit={enviar} className="w-full max-w-sm border-2 border-papel bg-papel p-6">
        <div className="mb-6 flex items-center gap-3 border-b-2 border-tinta pb-4">
          <img src="/marca/horizontal-cor.svg" alt="Esquadrão Lendário" className="h-8 w-auto" />
          <span className="rotulo bg-tinta px-1.5 py-0.5 text-[10px] text-papel">Admin</span>
        </div>
        <h1 className="mb-6 text-2xl font-bold">Painel administrativo</h1>
        <div className="space-y-4">
          {erro && <Erro mensagem={erro} />}
          <CampoForm rotulo="E-mail">{(id) => <Input id={id} type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />}</CampoForm>
          <CampoForm rotulo="Senha">{(id) => <Input id={id} type="password" autoComplete="current-password" required value={senha} onChange={(e) => setSenha(e.target.value)} />}</CampoForm>
          <Button type="submit" className="w-full" disabled={enviando}>
            {enviando ? "Entrando…" : "Entrar no painel"} <ArrowRight aria-hidden />
          </Button>
        </div>
        <p className="mt-4 text-sm">
          <Link to="/admin/esqueci-senha" search={{ email: email.trim().toLowerCase() || undefined }} className="font-semibold text-verde underline">
            Esqueci minha senha
          </Link>
        </p>
        <p className="mt-6 text-xs text-neutro-700">Acesso exclusivo de administradores. Contas de jogador não entram aqui.</p>
      </form>
    </div>
  );
}
