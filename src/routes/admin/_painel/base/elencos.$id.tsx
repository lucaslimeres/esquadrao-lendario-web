import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Pencil, Plus } from "lucide-react";
import { useRef, useState } from "react";
import { BotaoExcluir } from "@/components/admin/confirmar";
import { mensagemErro } from "@/lib/api";
import { Tabela } from "@/components/admin/form";
import { CabecalhoAdmin } from "@/components/admin/layout";
import { Distintivo } from "@/components/jogo/distintivo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Carregando, Erro } from "@/components/ui/estados";
import { CamposJogador, FormElenco, FormJogador } from "@/features/admin/forms-base";
import { jogadorVazio, type DadosJogador } from "@/lib/admin-base";
import { adminApi } from "@/lib/admin-api";
import type { JogadorAdmin } from "@/lib/admin-tipos";
import { raridade } from "@/lib/jogo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/_painel/base/elencos/$id")({
  component: Elenco,
});

function Elenco() {
  const { id } = Route.useParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [editandoElenco, setEditandoElenco] = useState(false);
  const [editando, setEditando] = useState<JogadorAdmin | null>(null);
  const { data: e, isPending, isError, refetch } = useQuery({ queryKey: ["admin", "elenco", id], queryFn: () => adminApi.elenco(id) });
  const atualizar = () => queryClient.invalidateQueries({ queryKey: ["admin"] });
  const alternarAtivo = useMutation({ mutationFn: (j: JogadorAdmin) => adminApi.atualizarJogador(j.id, { ativo: !j.ativo }), onSuccess: atualizar });

  if (isPending) return <Carregando />;
  if (isError) return <Erro mensagem="Elenco não encontrado." tentarDeNovo={() => refetch()} />;

  return (
    <>
      <CabecalhoAdmin
        rotulo={
          <span className="flex gap-2">
            <Link to="/admin/base" className="underline-offset-4 hover:underline">Campeonatos</Link>›
            <Link to="/admin/base/competicoes/$id" params={{ id: e.competicaoId }} className="underline-offset-4 hover:underline">Competição</Link>
          </span>
        }
        titulo={e.rotulo}
        acoes={
          <>
            <Button variant="contorno" tamanho="pequeno" onClick={() => setEditandoElenco(true)}>
              Editar elenco <Pencil aria-hidden />
            </Button>
            <BotaoExcluir
              rotulo="Excluir elenco"
              titulo={`Excluir ${e.rotulo}?`}
              mensagem={`Apaga o elenco e os ${e.totalJogadores} jogadores dele. Só é possível se o elenco nunca apareceu em campanhas.`}
              aoConfirmar={() => adminApi.excluirElenco(e.id)}
              aoConcluir={() => {
                atualizar();
                navigate({ to: "/admin/base/competicoes/$id", params: { id: e.competicaoId } });
              }}
            />
          </>
        }
      />
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <Distintivo equipe={e.equipe} className="size-12 text-xs" />
        {e.completo ? <Badge variant="avancou">Completo: entra no sorteio</Badge> : <Badge variant="contorno">Incompleto: precisa de 11 ativos com goleiro</Badge>}
        <span className="text-sm text-neutro-700">
          {e.jogadoresAtivos} ativos de {e.totalJogadores} · {e.goleirosAtivos} goleiro(s) · usado em {e.usadoEmCampanhas} registro(s) de campanha
        </span>
      </div>

      <NovoJogador elencoId={e.id} aoSalvar={atualizar} />

      <h2 className="rotulo mb-3 mt-8">Jogadores</h2>
      <Tabela>
        <thead>
          <tr>
            <th className="w-16">OVR</th>
            <th>Nome</th>
            <th>Posição</th>
            <th>Também joga de</th>
            <th>Situação</th>
            <th className="sr-only">Ações</th>
          </tr>
        </thead>
        <tbody>
          {e.jogadores.map((j) => {
            const r = raridade(j.overall);
            return (
              <tr key={j.id} className={cn(!j.ativo && "opacity-60")}>
                <td>
                  <span
                    className={cn(
                      "inline-flex size-10 items-center justify-center font-display text-lg",
                      r === "lendario" && "bg-verde text-white",
                      r === "ouro" && "bg-tinta text-papel",
                      r === "prata" && "bg-neutro-300",
                      r === "bronze" && "border-2 border-neutro-500 bg-gramado",
                    )}
                  >
                    {j.overall}
                  </span>
                </td>
                <td className="font-semibold">{j.nome}</td>
                <td>{j.posicao}</td>
                <td>{j.posicoesSecundarias.join(", ") || "—"}</td>
                <td>
                  <button type="button" className="min-h-11 text-left" onClick={() => alternarAtivo.mutate(j)} disabled={alternarAtivo.isPending} title="Clique para alternar">
                    {j.ativo ? <Badge variant="avancou">Ativo</Badge> : <Badge variant="eliminado">Desativado</Badge>}
                  </button>
                </td>
                <td>
                  <div className="flex justify-end gap-2">
                    <Button variant="contorno" tamanho="pequeno" onClick={() => setEditando(j)} aria-label={`Editar ${j.nome}`}>
                      Editar <Pencil aria-hidden />
                    </Button>
                    <BotaoExcluir
                      titulo={`Excluir ${j.nome}?`}
                      mensagem="Jogador que já foi escalado em alguma campanha não pode ser excluído; desative-o em vez disso."
                      aoConfirmar={() => adminApi.excluirJogador(j.id)}
                      aoConcluir={atualizar}
                    />
                  </div>
                </td>
              </tr>
            );
          })}
          {e.jogadores.length === 0 && (
            <tr>
              <td colSpan={6} className="text-neutro-700">Nenhum jogador ainda.</td>
            </tr>
          )}
        </tbody>
      </Tabela>
      {alternarAtivo.error && <div className="mt-3"><Erro mensagem={mensagemErro(alternarAtivo.error)} /></div>}

      {editandoElenco && <FormElenco competicaoId={e.competicaoId} elenco={e} aoFechar={() => setEditandoElenco(false)} aoSalvar={atualizar} />}
      {editando && <FormJogador jogador={editando} aoFechar={() => setEditando(null)} aoSalvar={atualizar} />}
    </>
  );
}

/** Inline quick-entry form: stays open and refocuses the name for typing a whole squad. */
function NovoJogador({ elencoId, aoSalvar }: { elencoId: string; aoSalvar: () => void }) {
  const [valor, setValor] = useState<DadosJogador>(jogadorVazio);
  const form = useRef<HTMLFormElement>(null);
  const criar = useMutation({
    mutationFn: () => adminApi.criarJogador(elencoId, valor),
    onSuccess: () => {
      aoSalvar();
      setValor({ ...jogadorVazio, posicao: valor.posicao, overall: valor.overall });
      form.current?.querySelector("input")?.focus();
    },
  });
  return (
    <form ref={form} className="border-2 border-neutro-400 bg-white p-4" onSubmit={(ev) => { ev.preventDefault(); criar.mutate(); }}>
      <h2 className="rotulo mb-3">Adicionar jogador</h2>
      {criar.error && <div className="mb-3"><Erro mensagem={mensagemErro(criar.error)} /></div>}
      <CamposJogador valor={valor} mudar={setValor} compacto />
      <Button type="submit" tamanho="pequeno" className="mt-3 w-full sm:w-56" disabled={criar.isPending}>
        {criar.isPending ? "Adicionando…" : "Adicionar ao elenco"} <Plus aria-hidden />
      </Button>
    </form>
  );
}
