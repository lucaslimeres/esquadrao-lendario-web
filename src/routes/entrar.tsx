import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { Pagina, TituloPagina } from "@/components/layout";
import { FormularioAuth } from "@/features/auth-form";
import { destinoSeguro } from "@/features/sessao";
import { api, ApiError } from "@/lib/api";
import { useSessao } from "@/stores/sessao";

const schema = z.object({
  email: z.email("Digite um e-mail válido").trim().toLowerCase(),
  senha: z.string().min(1, "Digite sua senha"),
});

export const Route = createFileRoute("/entrar")({
  validateSearch: z.object({ redirect: z.string().optional() }),
  component: Entrar,
});

function Entrar() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const entrar = useSessao((s) => s.entrar);
  const convidado = useSessao((s) => s.modo === "convidado");

  return (
    <Pagina>
      <div className="mx-auto max-w-md">
        <TituloPagina rotulo="Conta">Entrar</TituloPagina>
        {convidado && (
          <p className="mb-6 border-l-4 border-verde bg-white p-3 text-sm">
            Você tem uma partida sem conta aberta. Ao entrar numa conta que já existe, ela não é transferida. Para levá-la junto,{" "}
            <Link to="/cadastro" search={{ redirect }} className="font-semibold text-verde underline">
              crie uma conta
            </Link>
            .
          </p>
        )}
        <FormularioAuth
          schema={schema}
          textoBotao="Entrar"
          campos={[
            { nome: "email", rotulo: "E-mail", tipo: "email", autoComplete: "email" },
            { nome: "senha", rotulo: "Senha", tipo: "password", autoComplete: "current-password" },
          ]}
          aoEnviar={async (dados) => {
            try {
              entrar(await api.login(dados));
            } catch (erro) {
              // Right password, address never confirmed: the API just sent a code.
              if (erro instanceof ApiError && erro.codigo === "email_nao_confirmado") {
                await navigate({ to: "/confirmar-email", search: { email: dados.email, redirect } });
                return;
              }
              throw erro;
            }
            queryClient.clear();
            await navigate({ to: destinoSeguro(redirect) });
          }}
        />
        <p className="mt-4">
          <Link to="/esqueci-senha" search={{ redirect }} className="font-semibold text-verde underline">
            Esqueci minha senha
          </Link>
        </p>
        <p className="mt-4">
          Ainda não tem conta?{" "}
          <Link to="/cadastro" search={{ redirect }} className="font-semibold text-verde underline">
            Crie grátis
          </Link>
        </p>
      </div>
    </Pagina>
  );
}
