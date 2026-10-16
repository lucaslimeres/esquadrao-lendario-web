import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { KeyRound } from "lucide-react";
import { useState } from "react";
import { CampoForm } from "@/components/admin/form";
import { CabecalhoAdmin } from "@/components/admin/layout";
import { Button } from "@/components/ui/button";
import { Carregando, Erro } from "@/components/ui/estados";
import { Input, MensagemErro } from "@/components/ui/input";
import { adminApi } from "@/lib/admin-api";
import { mensagemErro } from "@/lib/api";

export const Route = createFileRoute("/admin/_painel/configuracoes")({
  component: Configuracoes,
});

/** Settings of the signed-in admin: who they are and their own password. */
function Configuracoes() {
  const eu = useQuery({ queryKey: ["admin", "me"], queryFn: adminApi.me });
  const [atual, setAtual] = useState("");
  const [nova, setNova] = useState("");
  const [repetir, setRepetir] = useState("");
  const [erroCampo, setErroCampo] = useState<string | undefined>();
  const trocar = useMutation({
    mutationFn: () => adminApi.trocarSenha(atual, nova),
    onSuccess: () => {
      setAtual("");
      setNova("");
      setRepetir("");
    },
  });

  return (
    <div className="max-w-xl space-y-8">
      <CabecalhoAdmin titulo="Configurações" rotulo="Sua conta no painel" />

      <section className="border-2 border-tinta bg-white p-4">
        <h2 className="rotulo mb-3">Conta</h2>
        {eu.isPending ? (
          <Carregando />
        ) : eu.data ? (
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
            <dt className="font-semibold">Nome</dt>
            <dd>{eu.data.nome}</dd>
            <dt className="font-semibold">E-mail</dt>
            <dd className="break-all">{eu.data.email}</dd>
          </dl>
        ) : (
          <Erro mensagem="Não deu para carregar sua conta." tentarDeNovo={() => eu.refetch()} />
        )}
      </section>

      <section className="border-2 border-tinta bg-white p-4">
        <h2 className="rotulo mb-1">Trocar senha</h2>
        <p className="mb-4 text-sm text-neutro-700">Para trocar, confirme a senha atual. Esqueceu? Saia e use “Esqueci minha senha” no login.</p>
        <form
          noValidate
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            trocar.reset();
            const problema = !atual
              ? "Informe a senha atual"
              : nova.length < 8
                ? "A nova senha precisa ter pelo menos 8 caracteres"
                : nova !== repetir
                  ? "As senhas novas não são iguais"
                  : nova === atual
                    ? "A nova senha precisa ser diferente da atual"
                    : undefined;
            setErroCampo(problema);
            if (!problema) trocar.mutate();
          }}
        >
          {trocar.isError && <Erro mensagem={mensagemErro(trocar.error, "Não deu para trocar a senha.")} />}
          {trocar.isSuccess && (
            <p role="status" className="border-l-4 border-verde bg-verde-100 p-3 text-sm font-semibold">
              Senha trocada. Use a nova no próximo login.
            </p>
          )}
          <CampoForm rotulo="Senha atual">{(id) => <Input id={id} type="password" autoComplete="current-password" value={atual} onChange={(e) => setAtual(e.target.value)} />}</CampoForm>
          <CampoForm rotulo="Nova senha" dica="Mínimo de 8 caracteres.">
            {(id) => <Input id={id} type="password" autoComplete="new-password" value={nova} onChange={(e) => setNova(e.target.value)} />}
          </CampoForm>
          <CampoForm rotulo="Repita a nova senha">
            {(id) => (
              <>
                <Input id={id} type="password" autoComplete="new-password" value={repetir} onChange={(e) => setRepetir(e.target.value)} aria-invalid={erroCampo ? true : undefined} />
                <MensagemErro>{erroCampo}</MensagemErro>
              </>
            )}
          </CampoForm>
          <Button type="submit" disabled={trocar.isPending}>
            {trocar.isPending ? "Salvando…" : "Trocar senha"} <KeyRound aria-hidden />
          </Button>
        </form>
      </section>
    </div>
  );
}
