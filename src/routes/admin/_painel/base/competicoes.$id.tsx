import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, FileJson, Pencil, Plus } from "lucide-react";
import { useState } from "react";
import { BotaoExcluir } from "@/components/admin/confirmar";
import { Numero, Tabela } from "@/components/admin/form";
import { CabecalhoAdmin } from "@/components/admin/layout";
import { Distintivo } from "@/components/jogo/distintivo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Carregando, Erro } from "@/components/ui/estados";
import { FormCompeticao, FormElenco, ImportarJson } from "@/features/admin/forms-base";
import { adminApi } from "@/lib/admin-api";

export const Route = createFileRoute("/admin/_painel/base/competicoes/$id")({
  component: Competicao,
});

function Competicao() {
  const { id } = Route.useParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [dialogo, setDialogo] = useState<"editar" | "elenco" | "importar" | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const { data: c, isPending, isError, refetch } = useQuery({ queryKey: ["admin", "competicao", id], queryFn: () => adminApi.competicao(id) });
  const atualizar = () => queryClient.invalidateQueries({ queryKey: ["admin"] });

  if (isPending) return <Carregando />;
  if (isError) return <Erro mensagem="Competição não encontrada." tentarDeNovo={() => refetch()} />;

  return (
    <>
      <CabecalhoAdmin
        rotulo={
          <Link to="/admin/base" className="underline-offset-4 hover:underline">
            Campeonatos
          </Link>
        }
        titulo={c.nome}
        acoes={
          <>
            <Button variant="contorno" tamanho="pequeno" onClick={() => setDialogo("editar")}>
              Editar <Pencil aria-hidden />
            </Button>
            <BotaoExcluir
              titulo={`Excluir ${c.nome}?`}
              mensagem="Só dá para excluir competição sem elencos e sem campanhas. Se ela já foi jogada, desative em vez de excluir."
              aoConfirmar={() => adminApi.excluirCompeticao(c.id)}
              aoConcluir={() => {
                atualizar();
                navigate({ to: "/admin/base" });
              }}
            />
          </>
        }
      />
      <div className="mb-6 grid grid-cols-2 lg:grid-cols-4">
        <Numero rotulo="Situação" valor={c.disponivel ? "Jogável" : c.ativa ? "Incompleta" : "Inativa"} destaque={c.disponivel} detalhe={c.ativa ? "Ativa no catálogo" : "Desativada"} />
        <Numero rotulo="Elencos completos" valor={`${c.elencosCompletos}/${c.totalElencos}`} detalhe={`Mínimo para jogar: ${c.minimoElencos}`} />
        <Numero rotulo="Jogadores ativos" valor={c.totalJogadores} />
        <Numero rotulo="Campanhas" valor={c.totalCampanhas} detalhe={`${c.formato === "mata_mata" ? "Mata-mata" : "Grupos + mata-mata"} · ${c.jogosAteTitulo} jogos`} />
      </div>

      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <h2 className="rotulo">Elencos campeões</h2>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="contorno" tamanho="pequeno" onClick={() => setDialogo("importar")}>
            Importar JSON <FileJson aria-hidden />
          </Button>
          <Button tamanho="pequeno" onClick={() => setDialogo("elenco")}>
            Novo elenco <Plus aria-hidden />
          </Button>
        </div>
      </div>
      {aviso && <p className="mb-3 border-l-4 border-verde bg-white p-3 text-sm" role="status">{aviso}</p>}
      <Tabela>
        <thead>
          <tr>
            <th>Temporada</th>
            <th>Time</th>
            <th className="text-right">Ativos / total</th>
            <th>Situação</th>
            <th className="sr-only">Abrir</th>
          </tr>
        </thead>
        <tbody>
          {c.elencos.map((e) => (
            <tr key={e.id}>
              <td className="font-display text-xl">{e.temporada}</td>
              <td>
                <span className="flex items-center gap-2 font-semibold">
                  <Distintivo equipe={e.equipe} className="size-8 text-[9px]" /> {e.equipe.nome}
                </span>
              </td>
              <td className="text-right">
                {e.jogadoresAtivos} / {e.totalJogadores}
              </td>
              <td>
                {e.completo ? (
                  <Badge variant="avancou">Completo</Badge>
                ) : (
                  <Badge variant="contorno">{e.goleirosAtivos === 0 ? "Sem goleiro" : `Faltam ${Math.max(0, 11 - e.jogadoresAtivos)}`}</Badge>
                )}
              </td>
              <td>
                <Button asChild variant="contorno" tamanho="pequeno">
                  <Link to="/admin/base/elencos/$id" params={{ id: e.id }}>
                    Jogadores <ArrowRight aria-hidden />
                  </Link>
                </Button>
              </td>
            </tr>
          ))}
          {c.elencos.length === 0 && (
            <tr>
              <td colSpan={5} className="text-neutro-700">Nenhum elenco ainda. Cadastre o primeiro campeão ou importe um JSON.</td>
            </tr>
          )}
        </tbody>
      </Tabela>

      {dialogo === "editar" && <FormCompeticao competicao={c} aoFechar={() => setDialogo(null)} aoSalvar={atualizar} />}
      {dialogo === "elenco" && (
        <FormElenco competicaoId={c.id} aoFechar={() => setDialogo(null)} aoSalvar={(e) => { atualizar(); navigate({ to: "/admin/base/elencos/$id", params: { id: e.id } }); }} />
      )}
      {dialogo === "importar" && (
        <ImportarJson
          slugCompeticao={c.slug}
          aoFechar={() => setDialogo(null)}
          aoSalvar={(r) => {
            atualizar();
            setAviso(`Elenco ${r.criado ? "criado" : "atualizado"}: ${r.jogadoresInseridos} jogadores novos, ${r.jogadoresAtualizados} atualizados, ${r.jogadoresDesativados} desativados.`);
          }}
        />
      )}
    </>
  );
}
