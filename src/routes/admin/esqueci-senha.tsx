import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useState, type ReactNode } from "react";
import { z } from "zod";
import { CampoForm } from "@/components/admin/form";
import { Button } from "@/components/ui/button";
import { Erro } from "@/components/ui/estados";
import { Input, MensagemErro } from "@/components/ui/input";
import { CampoCodigo, DIGITOS_CODIGO, ReenviarCodigo } from "@/features/codigo";
import { adminApi } from "@/lib/admin-api";
import { mensagemErro } from "@/lib/api";
import { useAdminSessao } from "@/stores/admin-sessao";

export const Route = createFileRoute("/admin/esqueci-senha")({
  validateSearch: z.object({ email: z.string().optional() }),
  component: EsqueciSenhaAdmin,
});

type Passo = "email" | "codigo" | "senha";
const TITULOS: Record<Passo, string> = { email: "Esqueci a senha", codigo: "Digite o código", senha: "Crie a nova senha" };

/** Panel version of "esqueci a senha": same 3 steps, but only `adminApi` and the admin session. */
function EsqueciSenhaAdmin() {
  const busca = Route.useSearch();
  const navigate = useNavigate();
  const entrar = useAdminSessao((s) => s.entrar);
  const [passo, setPasso] = useState<Passo>("email");
  const [email, setEmail] = useState(busca.email ?? "");
  const [codigo, setCodigo] = useState("");
  const [senha, setSenha] = useState("");
  const [repetir, setRepetir] = useState("");
  const [erroCampo, setErroCampo] = useState<string | undefined>();
  const emailLimpo = email.trim().toLowerCase();

  const pedir = useMutation({ mutationFn: () => adminApi.esqueciSenha(emailLimpo), onSuccess: () => setPasso("codigo") });
  const conferir = useMutation({ mutationFn: (c: string) => adminApi.verificarCodigo(emailLimpo, c), onSuccess: () => setPasso("senha") });
  const salvar = useMutation({
    mutationFn: () => adminApi.redefinirSenha(emailLimpo, codigo, senha),
    onSuccess: async (sessao) => {
      entrar(sessao);
      await navigate({ to: "/admin" });
    },
  });
  const erroApi = { email: pedir.error, codigo: conferir.error, senha: salvar.error }[passo];

  return (
    <Moldura titulo={TITULOS[passo]} passo={passo === "email" ? 1 : passo === "codigo" ? 2 : 3}>
      {erroApi && <Erro mensagem={mensagemErro(erroApi)} />}

      {passo === "email" && (
        <form
          noValidate
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            const ok = z.email().safeParse(emailLimpo).success;
            setErroCampo(ok ? undefined : "Digite um e-mail válido");
            if (ok) pedir.mutate();
          }}
        >
          <p className="text-sm">Digite o e-mail de administrador. Se ele estiver cadastrado e ativo, chega um código de 6 números.</p>
          <CampoForm rotulo="E-mail">
            {(id) => (
              <>
                <Input id={id} type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={erroCampo ? true : undefined} />
                <MensagemErro>{erroCampo}</MensagemErro>
              </>
            )}
          </CampoForm>
          <Button type="submit" className="w-full" disabled={pedir.isPending}>
            {pedir.isPending ? "Enviando…" : "Enviar código"} <ArrowRight aria-hidden />
          </Button>
        </form>
      )}

      {passo === "codigo" && (
        <form
          noValidate
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (codigo.length === DIGITOS_CODIGO) conferir.mutate(codigo);
          }}
        >
          <p className="text-sm">
            Se <strong className="break-all">{emailLimpo}</strong> é de um administrador, o código já está a caminho. Ele vale por 15 minutos.
          </p>
          <CampoCodigo valor={codigo} onChange={setCodigo} onCompleto={(c) => !conferir.isPending && conferir.mutate(c)} />
          <Button type="submit" className="w-full" disabled={codigo.length !== DIGITOS_CODIGO || conferir.isPending}>
            {conferir.isPending ? "Conferindo…" : "Continuar"} <ArrowRight aria-hidden />
          </Button>
          <ReenviarCodigo pedir={() => adminApi.reenviarCodigo(emailLimpo)} />
          <Button variant="link" type="button" onClick={() => setPasso("email")}>
            Usar outro e-mail
          </Button>
        </form>
      )}

      {passo === "senha" && (
        <form
          noValidate
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            const problema = senha.length < 8 ? "A senha precisa ter pelo menos 8 caracteres" : senha !== repetir ? "As senhas não são iguais" : undefined;
            setErroCampo(problema);
            if (!problema) salvar.mutate();
          }}
        >
          <CampoForm rotulo="Nova senha">{(id) => <Input id={id} type="password" autoComplete="new-password" value={senha} onChange={(e) => setSenha(e.target.value)} />}</CampoForm>
          <CampoForm rotulo="Repita a nova senha">
            {(id) => (
              <>
                <Input id={id} type="password" autoComplete="new-password" value={repetir} onChange={(e) => setRepetir(e.target.value)} aria-invalid={erroCampo ? true : undefined} />
                <MensagemErro>{erroCampo}</MensagemErro>
              </>
            )}
          </CampoForm>
          <Button type="submit" className="w-full" disabled={salvar.isPending}>
            {salvar.isPending ? "Salvando…" : "Salvar e entrar no painel"} <ArrowRight aria-hidden />
          </Button>
        </form>
      )}
    </Moldura>
  );
}

/** Same frame as /admin/login: dark page, paper card, "Admin" seal. */
function Moldura({ titulo, passo, children }: { titulo: string; passo: number; children: ReactNode }) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-tinta px-4">
      <div className="w-full max-w-sm border-2 border-papel bg-papel p-6">
        <div className="mb-6 flex items-center gap-3 border-b-2 border-tinta pb-4">
          <img src="/marca/horizontal-cor.svg" alt="Esquadrão Lendário" className="h-8 w-auto" />
          <span className="rotulo bg-tinta px-1.5 py-0.5 text-[10px] text-papel">Admin</span>
        </div>
        <p className="rotulo mb-1 text-verde">Nova senha · passo {passo} de 3</p>
        <h1 className="mb-6 text-2xl font-bold">{titulo}</h1>
        <div className="space-y-4">{children}</div>
        <p className="mt-6 text-sm">
          <Link to="/admin/login" className="font-semibold text-verde underline">
            Voltar para o login
          </Link>
        </p>
      </div>
    </div>
  );
}
