import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { Pagina, TituloPagina } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Erro } from "@/components/ui/estados";
import { CampoCodigo, DIGITOS_CODIGO, ReenviarCodigo } from "@/features/codigo";
import { destinoSeguro } from "@/features/sessao";
import { api, mensagemErro } from "@/lib/api";
import { useSessao } from "@/stores/sessao";

export const Route = createFileRoute("/confirmar-email")({
  validateSearch: z.object({ email: z.string().catch(""), redirect: z.string().optional() }),
  component: ConfirmarEmail,
});

function ConfirmarEmail() {
  const { email, redirect } = Route.useSearch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { modo, sessao, entrar } = useSessao();
  const [codigo, setCodigo] = useState("");

  const confirmar = useMutation({
    // A guest token carries this tab's campaign to the account.
    mutationFn: (digitado: string) => api.confirmarEmail({ email, codigo: digitado }, modo === "convidado" ? (sessao?.token ?? null) : null),
    onSuccess: async (nova) => {
      entrar(nova);
      queryClient.clear();
      await navigate({ to: destinoSeguro(redirect) });
    },
  });

  if (!email) {
    return (
      <Pagina>
        <div className="mx-auto max-w-md space-y-6">
          <TituloPagina rotulo="Conta">Confirme seu e-mail</TituloPagina>
          <p>Faltou o e-mail. Comece pelo cadastro.</p>
          <Button asChild>
            <Link to="/cadastro">Criar conta</Link>
          </Button>
        </div>
      </Pagina>
    );
  }

  const enviar = (digitado = codigo) => {
    if (digitado.length === DIGITOS_CODIGO && !confirmar.isPending) confirmar.mutate(digitado);
  };

  return (
    <Pagina>
      <div className="mx-auto max-w-md">
        <TituloPagina rotulo="Conta">Confirme seu e-mail</TituloPagina>
        <p className="mb-6">
          Mandamos um código de 6 números para <strong className="break-all">{email}</strong>. Ele vale por 15 minutos.
        </p>
        <form
          noValidate
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            enviar();
          }}
        >
          {confirmar.isError && <Erro mensagem={mensagemErro(confirmar.error, "Não deu para confirmar. Tente de novo.")} />}
          <CampoCodigo valor={codigo} onChange={setCodigo} onCompleto={enviar} />
          <Button type="submit" className="w-full" disabled={codigo.length !== DIGITOS_CODIGO || confirmar.isPending}>
            {confirmar.isPending ? "Confirmando…" : "Confirmar e entrar"} <ArrowRight aria-hidden />
          </Button>
        </form>
        <div className="mt-6 space-y-2">
          <ReenviarCodigo email={email} finalidade="confirmar_email" />
          <p className="text-sm">
            E-mail errado?{" "}
            <Link to="/cadastro" search={{ redirect }} className="font-semibold text-verde underline">
              Cadastrar de novo
            </Link>
          </p>
        </div>
      </div>
    </Pagina>
  );
}
