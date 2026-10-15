import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Pencil, Plus, Search } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { BotaoExcluir } from "@/components/admin/confirmar";
import { Tabela } from "@/components/admin/form";
import { CabecalhoAdmin } from "@/components/admin/layout";
import { Distintivo } from "@/components/jogo/distintivo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Carregando, Erro } from "@/components/ui/estados";
import { Input } from "@/components/ui/input";
import { FormCompeticao, FormEquipe } from "@/features/admin/forms-base";
import { adminApi } from "@/lib/admin-api";
import type { EquipeAdmin } from "@/lib/admin-tipos";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/_painel/base/")({
  validateSearch: z.object({ aba: z.enum(["campeonatos", "times"]).optional() }),
  component: Base,
});

function Base() {
  const { aba = "campeonatos" } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  return (
    <>
      <CabecalhoAdmin rotulo="Base de campeões" titulo="Campeonatos, times e jogadores" />
      <p className="mb-4 max-w-3xl text-neutro-700">
        Cada campeonato tem um elenco por título (o campeão daquela temporada). Os jogadores ficam dentro do elenco. Um elenco só entra no sorteio
        quando tem 11 jogadores ativos com pelo menos um goleiro.
      </p>
      <div role="tablist" className="mb-6 flex border-b-2 border-tinta">
        {(["campeonatos", "times"] as const).map((a) => (
          <button
            key={a}
            role="tab"
            aria-selected={aba === a}
            className={cn("min-h-11 px-4 font-semibold", aba === a ? "bg-tinta text-papel" : "hover:bg-gramado")}
            onClick={() => navigate({ search: { aba: a } })}
          >
            {a === "campeonatos" ? "Campeonatos" : "Times"}
          </button>
        ))}
      </div>
      {aba === "campeonatos" ? <Campeonatos /> : <Times />}
    </>
  );
}

function Campeonatos() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [novo, setNovo] = useState(false);
  const { data, isPending, isError, refetch } = useQuery({ queryKey: ["admin", "competicoes"], queryFn: adminApi.competicoes });
  return (
    <section>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setNovo(true)} className="w-full sm:w-60">
          Nova competição <Plus aria-hidden />
        </Button>
      </div>
      {isPending && <Carregando />}
      {isError && <Erro mensagem="Não deu para carregar." tentarDeNovo={() => refetch()} />}
      {data && (
        <Tabela>
          <thead>
            <tr>
              <th>Competição</th>
              <th>Formato</th>
              <th>Situação</th>
              <th className="text-right">Elencos completos</th>
              <th className="text-right">Jogadores</th>
              <th className="text-right">Campanhas</th>
              <th className="sr-only">Abrir</th>
            </tr>
          </thead>
          <tbody>
            {data.map((c) => (
              <tr key={c.id}>
                <td>
                  <span className="font-semibold">{c.nome}</span>
                  <span className="block text-xs text-neutro-700">{c.slug}</span>
                </td>
                <td>{c.formato === "mata_mata" ? "Mata-mata" : "Grupos + mata-mata"}</td>
                <td>{c.disponivel ? <Badge variant="avancou">Jogável</Badge> : c.ativa ? <Badge variant="contorno">Faltam elencos</Badge> : <Badge>Inativa</Badge>}</td>
                <td className="text-right">
                  {c.elencosCompletos} de {c.totalElencos}
                  <span className="block text-xs text-neutro-700">mín. {c.minimoElencos}</span>
                </td>
                <td className="text-right">{c.totalJogadores}</td>
                <td className="text-right">{c.totalCampanhas}</td>
                <td>
                  <Button asChild variant="contorno" tamanho="pequeno">
                    <Link to="/admin/base/competicoes/$id" params={{ id: c.id }}>
                      Abrir <ArrowRight aria-hidden />
                    </Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Tabela>
      )}
      {novo && (
        <FormCompeticao
          aoFechar={() => setNovo(false)}
          aoSalvar={(c) => {
            queryClient.invalidateQueries({ queryKey: ["admin"] });
            navigate({ to: "/admin/base/competicoes/$id", params: { id: c.id } });
          }}
        />
      )}
    </section>
  );
}

function Times() {
  const queryClient = useQueryClient();
  const [termo, setTermo] = useState("");
  const [busca, setBusca] = useState("");
  const [editando, setEditando] = useState<EquipeAdmin | "nova" | null>(null);
  const { data, isPending, isError, refetch } = useQuery({ queryKey: ["admin", "equipes", busca], queryFn: () => adminApi.equipes(busca || undefined) });
  const atualizar = () => queryClient.invalidateQueries({ queryKey: ["admin", "equipes"] });
  return (
    <section>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:justify-between">
        <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); setBusca(termo.trim()); }}>
          <Input placeholder="Buscar por nome ou sigla" value={termo} onChange={(e) => setTermo(e.target.value)} aria-label="Buscar time" className="sm:w-72" />
          <Button type="submit" variant="tinta" tamanho="pequeno" aria-label="Buscar"><Search aria-hidden /></Button>
        </form>
        <Button onClick={() => setEditando("nova")} className="w-full sm:w-52">
          Novo time <Plus aria-hidden />
        </Button>
      </div>
      {isPending && <Carregando />}
      {isError && <Erro mensagem="Não deu para carregar." tentarDeNovo={() => refetch()} />}
      {data && (
        <Tabela>
          <thead>
            <tr>
              <th>Time</th>
              <th>Sigla</th>
              <th>País</th>
              <th>Cores</th>
              <th className="text-right">Elencos</th>
              <th className="sr-only">Ações</th>
            </tr>
          </thead>
          <tbody>
            {data.map((q) => (
              <tr key={q.id}>
                <td>
                  <span className="flex items-center gap-2 font-semibold">
                    <Distintivo equipe={q} className="size-8 text-[9px]" /> {q.nome}
                  </span>
                </td>
                <td>{q.sigla}</td>
                <td>{q.pais ?? "—"}</td>
                <td>
                  <span className="flex gap-1">
                    {[q.corPrimaria, q.corSecundaria].map((c) => (
                      <span key={c} title={c} className="inline-block size-5 border border-neutro-400" style={{ background: c }} />
                    ))}
                  </span>
                </td>
                <td className="text-right">{q.totalElencos}</td>
                <td>
                  <div className="flex justify-end gap-2">
                    <Button variant="contorno" tamanho="pequeno" onClick={() => setEditando(q)} aria-label={`Editar ${q.nome}`}>
                      Editar <Pencil aria-hidden />
                    </Button>
                    <BotaoExcluir titulo={`Excluir ${q.nome}?`} mensagem="Só dá para excluir times sem elencos cadastrados." aoConfirmar={() => adminApi.excluirEquipe(q.id)} aoConcluir={atualizar} />
                  </div>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={6} className="text-neutro-700">Nenhum time{busca ? " com essa busca" : " cadastrado ainda"}.</td>
              </tr>
            )}
          </tbody>
        </Tabela>
      )}
      {editando && <FormEquipe equipe={editando === "nova" ? undefined : editando} aoFechar={() => setEditando(null)} aoSalvar={atualizar} />}
    </section>
  );
}
