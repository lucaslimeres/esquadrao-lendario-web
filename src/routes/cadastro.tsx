import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { Pagina, TituloPagina } from "@/components/layout";
import { FormularioAuth } from "@/features/auth-form";
import { api } from "@/lib/api";
import { useSessao } from "@/stores/sessao";

const schema = z.object({
  nome: z.string().trim().min(2, "Digite seu nome").max(80),
  email: z.email("Digite um e-mail válido").trim().toLowerCase(),
  senha: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres").max(72),
});

export const Route = createFileRoute("/cadastro")({
  validateSearch: z.object({ redirect: z.string().optional() }),
  component: Cadastro,
});

function Cadastro() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const convidado = useSessao((s) => s.modo === "convidado");

  return (
    <Pagina>
      <div className="mx-auto max-w-md">
        <TituloPagina rotulo="Conta">Criar conta</TituloPagina>
        <p className="mb-6">
          {convidado
            ? "Sua partida sem conta vem junto: ela passa a ficar salva no seu histórico."
            : "Com conta, todas as suas campanhas ficam salvas para consultar depois."}
        </p>
        <FormularioAuth
          schema={schema}
          textoBotao="Criar conta"
          campos={[
            { nome: "nome", rotulo: "Nome", tipo: "text", autoComplete: "name" },
            { nome: "email", rotulo: "E-mail", tipo: "email", autoComplete: "email" },
            { nome: "senha", rotulo: "Senha", tipo: "password", autoComplete: "new-password" },
          ]}
          aoEnviar={async (dados) => {
            // No session yet: the account only logs in after the code sent by e-mail.
            const { email } = await api.cadastro(dados);
            await navigate({ to: "/confirmar-email", search: { email, redirect } });
          }}
        />
        <p className="mt-6">
          Já tem conta?{" "}
          <Link to="/entrar" search={{ redirect }} className="font-semibold text-verde underline">
            Entrar
          </Link>
        </p>
      </div>
    </Pagina>
  );
}
