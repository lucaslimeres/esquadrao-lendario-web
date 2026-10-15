import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Pencil, Plus, Search } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { BotaoExcluir } from "@/components/admin/confirmar";
import { mensagemErro } from "@/lib/api";
import { CampoForm, Checkbox, Select, Tabela } from "@/components/admin/form";
import { CabecalhoAdmin } from "@/components/admin/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialogo } from "@/components/ui/dialog";
import { Carregando, Erro } from "@/components/ui/estados";
import { Input } from "@/components/ui/input";
import { adminApi } from "@/lib/admin-api";
import type { UsuarioAdmin } from "@/lib/admin-tipos";
import { NOME_STATUS } from "@/lib/jogo";
import type { StatusCampanha } from "@/lib/tipos";

const filtros = z.object({
  busca: z.string().optional(),
  tipo: z.enum(["todos", "contas", "convidados"]).optional(),
  ativo: z.enum(["true", "false"]).optional(),
  pagina: z.number().int().min(1).optional(),
});

export const Route = createFileRoute("/admin/_painel/usuarios")({
  validateSearch: filtros,
  component: Usuarios,
});

const data = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeZone: "America/Sao_Paulo" });

function Usuarios() {
  const busca = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const queryClient = useQueryClient();
  const [termo, setTermo] = useState(busca.busca ?? "");
  const [editando, setEditando] = useState<UsuarioAdmin | "novo" | null>(null);
  const pagina = busca.pagina ?? 1;
  const { data: lista, isPending, isError, refetch, isFetching } = useQuery({
    queryKey: ["admin", "usuarios", busca],
    queryFn: () => adminApi.usuarios({ busca: busca.busca, tipo: busca.tipo, ativo: busca.ativo, pagina, porPagina: 20 }),
    placeholderData: keepPreviousData,
  });
  const filtrar = (patch: Partial<z.infer<typeof filtros>>) => navigate({ search: (s) => ({ ...s, ...patch, pagina: patch.pagina ?? 1 }) });
  const atualizar = () => queryClient.invalidateQueries({ queryKey: ["admin", "usuarios"] });

  return (
    <>
      <CabecalhoAdmin
        rotulo="Jogadores do app"
        titulo="Usuários"
        acoes={
          <Button onClick={() => setEditando("novo")} className="w-full sm:w-56">
            Novo usuário <Plus aria-hidden />
          </Button>
        }
      />
      <form
        className="mb-4 grid gap-3 sm:grid-cols-[1fr_180px_160px_auto]"
        onSubmit={(e) => {
          e.preventDefault();
          filtrar({ busca: termo.trim() || undefined });
        }}
      >
        <Input placeholder="Buscar por nome, e-mail ou id" value={termo} onChange={(e) => setTermo(e.target.value)} aria-label="Buscar" />
        <Select aria-label="Tipo" value={busca.tipo ?? "todos"} onChange={(e) => filtrar({ tipo: e.target.value as "todos" })}>
          <option value="todos">Todos</option>
          <option value="contas">Só contas</option>
          <option value="convidados">Só convidados</option>
        </Select>
        <Select aria-label="Situação" value={busca.ativo ?? ""} onChange={(e) => filtrar({ ativo: (e.target.value || undefined) as "true" | undefined })}>
          <option value="">Qualquer situação</option>
          <option value="true">Ativos</option>
          <option value="false">Desativados</option>
        </Select>
        <Button type="submit" variant="tinta" tamanho="pequeno" className="h-11">
          Buscar <Search aria-hidden />
        </Button>
      </form>

      {isPending && <Carregando />}
      {isError && <Erro mensagem="Não deu para carregar." tentarDeNovo={() => refetch()} />}
      {lista && (
        <>
          <p className="mb-2 text-sm text-neutro-700">
            {lista.total} usuário{lista.total === 1 ? "" : "s"}
            {isFetching ? " · atualizando…" : ""}
          </p>
          <Tabela>
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Tipo</th>
                <th>Situação</th>
                <th className="text-right">Campanhas</th>
                <th>Desde</th>
                <th className="sr-only">Ações</th>
              </tr>
            </thead>
            <tbody>
              {lista.itens.map((u) => (
                <tr key={u.id}>
                  <td className="font-semibold">{u.nome ?? <span className="font-normal text-neutro-700">Convidado</span>}</td>
                  <td>{u.email ?? "—"}</td>
                  <td>{u.convidado ? <Badge>Convidado</Badge> : <Badge variant="tinta">Conta</Badge>}</td>
                  <td>{u.ativo ? <Badge variant="avancou">Ativo</Badge> : <Badge variant="eliminado">Desativado</Badge>}</td>
                  <td className="text-right">{u.totalCampanhas}</td>
                  <td>{data.format(new Date(u.createdAt))}</td>
                  <td>
                    <Button variant="contorno" tamanho="pequeno" onClick={() => setEditando(u)} aria-label={`Abrir ${u.nome ?? u.id}`}>
                      Abrir <Pencil aria-hidden />
                    </Button>
                  </td>
                </tr>
              ))}
              {lista.itens.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-neutro-700">
                    Nenhum usuário com esses filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </Tabela>
          <div className="mt-4 flex items-center gap-3">
            <Button variant="contorno" tamanho="pequeno" disabled={pagina <= 1} onClick={() => filtrar({ pagina: pagina - 1 })} aria-label="Página anterior">
              <ChevronLeft aria-hidden />
            </Button>
            <span className="text-sm">
              Página {lista.pagina} de {lista.paginas}
            </span>
            <Button variant="contorno" tamanho="pequeno" disabled={pagina >= lista.paginas} onClick={() => filtrar({ pagina: pagina + 1 })} aria-label="Próxima página">
              <ChevronRight aria-hidden />
            </Button>
          </div>
        </>
      )}
      {editando === "novo" && <NovoUsuario aoFechar={() => setEditando(null)} aoSalvar={atualizar} />}
      {editando && editando !== "novo" && <EditarUsuario id={editando.id} aoFechar={() => setEditando(null)} aoSalvar={atualizar} />}
    </>
  );
}

function NovoUsuario({ aoFechar, aoSalvar }: { aoFechar: () => void; aoSalvar: () => void }) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const criar = useMutation({
    mutationFn: () => adminApi.criarUsuario({ nome, email, senha }),
    onSuccess: () => {
      aoSalvar();
      aoFechar();
    },
  });
  return (
    <Dialogo aberto aoMudar={(v) => !v && aoFechar()} titulo="Novo usuário" descricao="Cria uma conta de jogador já com senha.">
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); criar.mutate(); }}>
        {criar.error && <Erro mensagem={mensagemErro(criar.error)} />}
        <CampoForm rotulo="Nome">{(id) => <Input id={id} required minLength={2} value={nome} onChange={(e) => setNome(e.target.value)} />}</CampoForm>
        <CampoForm rotulo="E-mail">{(id) => <Input id={id} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />}</CampoForm>
        <CampoForm rotulo="Senha" dica="Mínimo de 8 caracteres.">{(id) => <Input id={id} type="password" autoComplete="new-password" required minLength={8} value={senha} onChange={(e) => setSenha(e.target.value)} />}</CampoForm>
        <Button type="submit" className="w-full" disabled={criar.isPending}>{criar.isPending ? "Criando…" : "Criar usuário"}</Button>
      </form>
    </Dialogo>
  );
}

function EditarUsuario({ id, aoFechar, aoSalvar }: { id: string; aoFechar: () => void; aoSalvar: () => void }) {
  const { data: u, isPending, isError } = useQuery({ queryKey: ["admin", "usuario", id], queryFn: () => adminApi.usuario(id) });
  return (
    <Dialogo aberto aoMudar={(v) => !v && aoFechar()} titulo={u ? (u.nome ?? "Convidado") : "Usuário"} descricao={u ? `id ${u.id}` : undefined}>
      {isPending && <Carregando />}
      {isError && <Erro mensagem="Não deu para carregar o usuário." />}
      {u && <FormUsuario usuario={u} aoFechar={aoFechar} aoSalvar={aoSalvar} />}
    </Dialogo>
  );
}

function FormUsuario({ usuario: u, aoFechar, aoSalvar }: { usuario: Awaited<ReturnType<typeof adminApi.usuario>>; aoFechar: () => void; aoSalvar: () => void }) {
  const [nome, setNome] = useState(u.nome ?? "");
  const [email, setEmail] = useState(u.email ?? "");
  const [senha, setSenha] = useState("");
  const [ativo, setAtivo] = useState(u.ativo);
  const salvar = useMutation({
    mutationFn: () => adminApi.atualizarUsuario(u.id, u.convidado ? { ativo } : { nome, email, ativo, ...(senha ? { senha } : {}) }),
    onSuccess: () => {
      aoSalvar();
      aoFechar();
    },
  });
  return (
    <div className="space-y-6">
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); salvar.mutate(); }}>
        {salvar.error && <Erro mensagem={mensagemErro(salvar.error)} />}
        {u.convidado ? (
          <p className="text-sm text-neutro-700">Convidado: não tem nome, e-mail nem senha. Dá só para ativar ou desativar.</p>
        ) : (
          <>
            <CampoForm rotulo="Nome">{(id) => <Input id={id} required minLength={2} value={nome} onChange={(e) => setNome(e.target.value)} />}</CampoForm>
            <CampoForm rotulo="E-mail">{(id) => <Input id={id} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />}</CampoForm>
            <CampoForm rotulo="Nova senha" dica="Deixe em branco para manter a atual.">
              {(id) => <Input id={id} type="password" autoComplete="new-password" minLength={8} value={senha} onChange={(e) => setSenha(e.target.value)} />}
            </CampoForm>
          </>
        )}
        <Checkbox rotulo="Ativo (pode entrar e jogar)" checked={ativo} onChange={(e) => setAtivo(e.target.checked)} />
        <Button type="submit" className="w-full" disabled={salvar.isPending}>{salvar.isPending ? "Salvando…" : "Salvar"}</Button>
      </form>

      <section>
        <h3 className="rotulo mb-2">Campanhas ({u.campanhas.length})</h3>
        {u.campanhas.length === 0 ? (
          <p className="text-sm text-neutro-700">Nenhuma campanha.</p>
        ) : (
          <ul className="max-h-48 divide-y divide-gramado overflow-y-auto border-2 border-neutro-400 bg-white text-sm">
            {u.campanhas.map((c) => (
              <li key={c.id} className="flex justify-between gap-2 p-2">
                <span>
                  {c.competicao ?? "—"} · {c.formacao}
                </span>
                <span className="font-semibold">{NOME_STATUS[c.status as StatusCampanha] ?? c.status}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="border-t-2 border-tinta pt-4">
        <BotaoExcluir
          rotulo="Excluir usuário"
          titulo="Excluir este usuário?"
          mensagem={`Apaga a conta e as ${u.campanhas.length} campanha(s) dela, inclusive links compartilhados. Isso não pode ser desfeito.`}
          aoConfirmar={() => adminApi.excluirUsuario(u.id)}
          aoConcluir={() => {
            aoSalvar();
            aoFechar();
          }}
        />
      </div>
    </div>
  );
}
