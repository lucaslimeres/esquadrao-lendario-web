import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { Pagina, TituloPagina } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Erro } from "@/components/ui/estados";
import { Input, Label, MensagemErro } from "@/components/ui/input";
import { CampoCodigo, DIGITOS_CODIGO, ReenviarCodigo } from "@/features/codigo";
import { destinoSeguro } from "@/features/sessao";
import { api, mensagemErro } from "@/lib/api";
import { useSessao } from "@/stores/sessao";

export const Route = createFileRoute("/esqueci-senha")({
  validateSearch: z.object({ email: z.string().optional(), redirect: z.string().optional() }),
  component: EsqueciSenha,
});

const emailSchema = z.email("Digite um e-mail válido").trim().toLowerCase();
const senhaSchema = z.string().min(8, "A senha precisa ter pelo menos 8 caracteres").max(72);

type Passo = "email" | "codigo" | "senha";

/** Three steps on one page: e-mail → 6-digit code → new password (then already signed in). */
function EsqueciSenha() {
  const busca = Route.useSearch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const entrar = useSessao((s) => s.entrar);
  const [passo, setPasso] = useState<Passo>("email");
  const [email, setEmail] = useState(busca.email ?? "");
  const [codigo, setCodigo] = useState("");
  const [senha, setSenha] = useState("");
  const [repetir, setRepetir] = useState("");
  const [erroCampo, setErroCampo] = useState<string | undefined>();

  const pedir = useMutation({ mutationFn: (e: string) => api.esqueciSenha(e), onSuccess: () => setPasso("codigo") });
  const conferir = useMutation({ mutationFn: (c: string) => api.verificarCodigo({ email, codigo: c }), onSuccess: () => setPasso("senha") });
  const salvar = useMutation({
    mutationFn: () => api.redefinirSenha({ email, codigo, senha }),
    onSuccess: async (sessao) => {
      entrar(sessao);
      queryClient.clear();
      await navigate({ to: destinoSeguro(busca.redirect) });
    },
  });

  const titulos: Record<Passo, string> = { email: "Esqueci a senha", codigo: "Digite o código", senha: "Crie a nova senha" };

  return (
    <Pagina>
      <div className="mx-auto max-w-md">
        <TituloPagina rotulo={`Nova senha · passo ${passo === "email" ? 1 : passo === "codigo" ? 2 : 3} de 3`}>{titulos[passo]}</TituloPagina>

        {passo === "email" && (
          <form
            noValidate
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              const r = emailSchema.safeParse(email);
              setErroCampo(r.success ? undefined : r.error.issues[0]!.message);
              if (r.success) {
                setEmail(r.data);
                pedir.mutate(r.data);
              }
            }}
          >
            <p>Digite o e-mail da sua conta. Se ele estiver cadastrado, chega um código de 6 números.</p>
            {pedir.isError && <Erro mensagem={mensagemErro(pedir.error, "Não deu para enviar. Tente de novo.")} />}
            <div>
              <Label htmlFor="esqueci-email">E-mail</Label>
              <Input id="esqueci-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={erroCampo ? true : undefined} aria-describedby={erroCampo ? "esqueci-email-erro" : undefined} />
              <MensagemErro id="esqueci-email-erro">{erroCampo}</MensagemErro>
            </div>
            <Button type="submit" className="w-full" disabled={pedir.isPending}>
              {pedir.isPending ? "Enviando…" : "Enviar código"} <ArrowRight aria-hidden />
            </Button>
          </form>
        )}

        {passo === "codigo" && (
          <form
            noValidate
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              if (codigo.length === DIGITOS_CODIGO) conferir.mutate(codigo);
            }}
          >
            <p>
              Se <strong className="break-all">{email}</strong> tem conta, o código já está a caminho. Ele vale por 15 minutos.
            </p>
            {conferir.isError && <Erro mensagem={mensagemErro(conferir.error, "Não deu para conferir. Tente de novo.")} />}
            <CampoCodigo valor={codigo} onChange={setCodigo} onCompleto={(c) => !conferir.isPending && conferir.mutate(c)} />
            <Button type="submit" className="w-full" disabled={codigo.length !== DIGITOS_CODIGO || conferir.isPending}>
              {conferir.isPending ? "Conferindo…" : "Continuar"} <ArrowRight aria-hidden />
            </Button>
            <ReenviarCodigo pedir={() => api.reenviarCodigo({ email, finalidade: "redefinir_senha" })} />
            <Button variant="link" type="button" onClick={() => setPasso("email")}>
              Usar outro e-mail
            </Button>
          </form>
        )}

        {passo === "senha" && (
          <form
            noValidate
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              const r = senhaSchema.safeParse(senha);
              const erro = !r.success ? r.error.issues[0]!.message : senha !== repetir ? "As senhas não são iguais" : undefined;
              setErroCampo(erro);
              if (!erro) salvar.mutate();
            }}
          >
            {salvar.isError && <Erro mensagem={mensagemErro(salvar.error, "Não deu para salvar. Tente de novo.")} />}
            <div>
              <Label htmlFor="nova-senha">Nova senha</Label>
              <Input id="nova-senha" type="password" autoComplete="new-password" value={senha} onChange={(e) => setSenha(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="repetir-senha">Repita a nova senha</Label>
              <Input id="repetir-senha" type="password" autoComplete="new-password" value={repetir} onChange={(e) => setRepetir(e.target.value)} aria-invalid={erroCampo ? true : undefined} aria-describedby={erroCampo ? "senha-erro" : undefined} />
              <MensagemErro id="senha-erro">{erroCampo}</MensagemErro>
            </div>
            <Button type="submit" className="w-full" disabled={salvar.isPending}>
              {salvar.isPending ? "Salvando…" : "Salvar e entrar"} <ArrowRight aria-hidden />
            </Button>
          </form>
        )}

        <p className="mt-6 text-sm">
          Lembrou?{" "}
          <Link to="/entrar" search={{ redirect: busca.redirect }} className="font-semibold text-verde underline">
            Voltar para o login
          </Link>
        </p>
      </div>
    </Pagina>
  );
}
