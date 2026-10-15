import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Plus } from "lucide-react";
import { useState } from "react";
import { BotaoExcluir } from "@/components/admin/confirmar";
import { mensagemErro } from "@/lib/api";
import { CampoForm, Checkbox, Tabela } from "@/components/admin/form";
import { CabecalhoAdmin } from "@/components/admin/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialogo } from "@/components/ui/dialog";
import { Carregando, Erro } from "@/components/ui/estados";
import { Input } from "@/components/ui/input";
import { adminApi } from "@/lib/admin-api";
import type { Admin } from "@/lib/admin-tipos";
import { useAdminSessao } from "@/stores/admin-sessao";

export const Route = createFileRoute("/admin/_painel/administradores")({
  component: Administradores,
});

const dataHora = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" });

function Administradores() {
  const queryClient = useQueryClient();
  const euId = useAdminSessao((s) => s.sessao?.admin.id);
  const { data, isPending, isError, refetch } = useQuery({ queryKey: ["admin", "admins"], queryFn: adminApi.admins });
  const [editando, setEditando] = useState<Admin | "novo" | null>(null);
  const atualizar = () => queryClient.invalidateQueries({ queryKey: ["admin", "admins"] });

  return (
    <>
      <CabecalhoAdmin
        rotulo="Acesso ao painel"
        titulo="Administradores"
        acoes={
          <Button onClick={() => setEditando("novo")} className="w-full sm:w-64">
            Novo administrador <Plus aria-hidden />
          </Button>
        }
      />
      <p className="mb-4 max-w-2xl text-neutro-700">Todo administrador tem acesso total ao painel. O painel nunca fica sem pelo menos um administrador ativo.</p>
      {isPending && <Carregando />}
      {isError && <Erro mensagem="Não deu para carregar." tentarDeNovo={() => refetch()} />}
      {data && (
        <Tabela>
          <thead>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Situação</th>
              <th>Último acesso</th>
              <th className="sr-only">Ações</th>
            </tr>
          </thead>
          <tbody>
            {data.map((a) => (
              <tr key={a.id}>
                <td className="font-semibold">
                  {a.nome} {a.id === euId && <span className="text-xs font-normal text-neutro-700">(você)</span>}
                </td>
                <td>{a.email}</td>
                <td>{a.ativo ? <Badge variant="avancou">Ativo</Badge> : <Badge variant="eliminado">Desativado</Badge>}</td>
                <td>{a.ultimoLoginEm ? dataHora.format(new Date(a.ultimoLoginEm)) : "Nunca"}</td>
                <td>
                  <div className="flex justify-end gap-2">
                    <Button variant="contorno" tamanho="pequeno" onClick={() => setEditando(a)} aria-label={`Editar ${a.nome}`}>
                      Editar <Pencil aria-hidden />
                    </Button>
                    <BotaoExcluir
                      titulo={`Excluir ${a.nome}?`}
                      mensagem="O administrador perde o acesso ao painel na hora. Isso não pode ser desfeito."
                      aoConfirmar={() => adminApi.excluirAdmin(a.id)}
                      aoConcluir={atualizar}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Tabela>
      )}
      {editando && <FormAdmin admin={editando === "novo" ? null : editando} aoFechar={() => setEditando(null)} aoSalvar={atualizar} />}
    </>
  );
}

function FormAdmin({ admin, aoFechar, aoSalvar }: { admin: Admin | null; aoFechar: () => void; aoSalvar: () => void }) {
  const [nome, setNome] = useState(admin?.nome ?? "");
  const [email, setEmail] = useState(admin?.email ?? "");
  const [senha, setSenha] = useState("");
  const [ativo, setAtivo] = useState(admin?.ativo ?? true);
  const salvar = useMutation({
    mutationFn: () =>
      admin
        ? adminApi.atualizarAdmin(admin.id, { nome, email, ativo, ...(senha ? { senha } : {}) })
        : adminApi.criarAdmin({ nome, email, senha }),
    onSuccess: () => {
      aoSalvar();
      aoFechar();
    },
  });

  return (
    <Dialogo aberto aoMudar={(v) => !v && aoFechar()} titulo={admin ? "Editar administrador" : "Novo administrador"}>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          salvar.mutate();
        }}
      >
        {salvar.error && <Erro mensagem={mensagemErro(salvar.error)} />}
        <CampoForm rotulo="Nome">{(id) => <Input id={id} required minLength={2} value={nome} onChange={(e) => setNome(e.target.value)} />}</CampoForm>
        <CampoForm rotulo="E-mail">{(id) => <Input id={id} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />}</CampoForm>
        <CampoForm rotulo={admin ? "Nova senha" : "Senha"} dica={admin ? "Deixe em branco para manter a atual." : "Mínimo de 8 caracteres. Passe a senha para a pessoa por um canal seguro."}>
          {(id) => <Input id={id} type="password" autoComplete="new-password" required={!admin} minLength={8} value={senha} onChange={(e) => setSenha(e.target.value)} />}
        </CampoForm>
        {admin && <Checkbox rotulo="Ativo" checked={ativo} onChange={(e) => setAtivo(e.target.checked)} />}
        <Button type="submit" className="w-full" disabled={salvar.isPending}>
          {salvar.isPending ? "Salvando…" : "Salvar"}
        </Button>
      </form>
    </Dialogo>
  );
}
