import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Pagina, TituloPagina } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Erro } from "@/components/ui/estados";
import { Input, Label } from "@/components/ui/input";
import { api, mensagemErro } from "@/lib/api";
import { useSessao } from "@/stores/sessao";

export const Route = createFileRoute("/excluir-conta")({
  component: ExcluirConta,
});

/**
 * Account deletion on the web. Google Play asks for a public URL where players can delete
 * the account; the app has the same option in Conta.
 */
function ExcluirConta() {
  const { modo, sessao, sair } = useSessao();
  const navigate = useNavigate();
  const [senha, setSenha] = useState("");
  const [excluida, setExcluida] = useState(false);
  const excluir = useMutation({
    mutationFn: () => api.excluirConta(senha),
    onSuccess: () => {
      sair();
      setExcluida(true);
    },
  });
  useEffect(() => {
    document.title = "Excluir conta — Esquadrão Lendário";
  }, []);

  return (
    <Pagina>
      <TituloPagina rotulo="Conta">Excluir conta</TituloPagina>
      <div className="space-y-6 text-neutro-800">
        {excluida ? (
          <div className="border-2 border-tinta bg-white p-5" role="status">
            <p className="text-lg font-bold">Conta excluída.</p>
            <p className="mt-2">A conta e as campanhas foram apagadas. Obrigado por ter jogado!</p>
            <Button className="mt-4 w-full sm:w-64" onClick={() => navigate({ to: "/" })}>
              Voltar para o início
            </Button>
          </div>
        ) : (
          <>
            <section className="space-y-2 border-2 border-neutro-400 bg-white p-5">
              <h2 className="font-bold">O que acontece</h2>
              <ul className="list-disc space-y-1 pl-5">
                <li>A conta (nome, e-mail e senha) é apagada na hora, e você sai do site e do app.</li>
                <li>Todas as suas campanhas e o histórico somem para sempre.</li>
                <li>Em campanha em grupo que já começou, o seu time continua no torneio dos outros, sem nenhum dado da sua conta.</li>
                <li>A compra de “Remover anúncios” fica na sua conta da App Store ou do Google Play.</li>
              </ul>
              <p className="pt-2 text-sm">No app, o mesmo fica em Conta → “Excluir minha conta”.</p>
            </section>

            {modo === "conta" ? (
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!excluir.isPending && window.confirm("Excluir a conta? Isso não tem volta.")) excluir.mutate();
                }}
              >
                <p>
                  Conta: <strong>{sessao?.usuario.email}</strong>
                </p>
                <div>
                  <Label htmlFor="senha-excluir">Sua senha</Label>
                  <Input id="senha-excluir" type="password" autoComplete="current-password" value={senha} onChange={(e) => setSenha(e.target.value)} />
                </div>
                {excluir.isError && <Erro mensagem={mensagemErro(excluir.error, "Não deu para excluir agora. Tente de novo.")} />}
                <Button type="submit" variant="tinta" className="w-full sm:w-72" disabled={!senha || excluir.isPending}>
                  {excluir.isPending ? "Excluindo…" : "Excluir minha conta"} <Trash2 aria-hidden />
                </Button>
              </form>
            ) : (
              <div className="space-y-3">
                <p>Para excluir, entre com a conta que você quer apagar (a mesma do app).</p>
                <Button asChild className="w-full sm:w-72">
                  <Link to="/entrar" search={{ redirect: "/excluir-conta" }}>
                    Entrar para excluir
                  </Link>
                </Button>
                <p className="text-sm">
                  Esqueceu a senha? Use “Esqueci minha senha” na tela de entrar. Sem acesso ao e-mail? Fale com a gente pelo{" "}
                  <Link to="/" hash="fale-conosco" className="font-semibold underline">
                    Fale conosco
                  </Link>
                  .
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </Pagina>
  );
}
