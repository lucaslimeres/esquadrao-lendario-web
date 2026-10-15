import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CabecalhoAdmin } from "@/components/admin/layout";
import { Numero, Tabela } from "@/components/admin/form";
import { Badge } from "@/components/ui/badge";
import { Carregando, Erro } from "@/components/ui/estados";
import { adminApi } from "@/lib/admin-api";

export const Route = createFileRoute("/admin/_painel/")({
  component: Dashboard,
});

const fmt = new Intl.NumberFormat("pt-BR");

function Dashboard() {
  const { data, isPending, isError, refetch } = useQuery({ queryKey: ["admin", "dashboard"], queryFn: adminApi.dashboard });
  if (isPending) return <Carregando />;
  if (isError) return <Erro mensagem="Não deu para carregar o resumo." tentarDeNovo={() => refetch()} />;
  const { usuarios, campanhas, base } = data;

  return (
    <>
      <CabecalhoAdmin rotulo="Painel" titulo="Dashboard" />

      <section className="mb-8">
        <h2 className="rotulo mb-3">Jogadores</h2>
        <div className="grid grid-cols-2 lg:grid-cols-3">
          <Numero rotulo="Contas" valor={fmt.format(usuarios.contas)} detalhe={`+${usuarios.contasNovas7d} nos últimos 7 dias`} />
          <Numero rotulo="Desativados" valor={fmt.format(usuarios.inativos)} />
          <Numero rotulo="Admins ativos" valor={data.admins.ativos} />
        </div>
      </section>

      <section className="mb-8">
        <h2 className="rotulo mb-3">Campanhas</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4">
          <Numero rotulo="Total" valor={fmt.format(campanhas.total)} detalhe={`${campanhas.ultimos7d} nos últimos 7 dias · ${fmt.format(campanhas.semConta)} sem conta`} />
          <Numero rotulo="Em andamento" valor={fmt.format(campanhas.emAndamento)} />
          <Numero rotulo="Títulos" valor={fmt.format(campanhas.campeas)} detalhe={`${campanhas.eliminadas} eliminadas`} />
          <Numero rotulo="Taxa de título" valor={campanhas.taxaTitulo === null ? "—" : `${String(campanhas.taxaTitulo).replace(".", ",")}%`} detalhe="Das campanhas finalizadas" destaque />
        </div>
      </section>

      <section className="mb-8">
        <h2 className="rotulo mb-3">Base</h2>
        <div className="grid grid-cols-3">
          <Numero rotulo="Times" valor={fmt.format(base.equipes)} />
          <Numero rotulo="Elencos" valor={fmt.format(base.elencos)} />
          <Numero rotulo="Jogadores ativos" valor={fmt.format(base.jogadoresAtivos)} />
        </div>
      </section>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[2fr_1fr]">
        <section>
          <h2 className="rotulo mb-3">Competições</h2>
          <Tabela>
            <thead>
              <tr>
                <th>Competição</th>
                <th>Situação</th>
                <th className="text-right">Elencos</th>
                <th className="text-right">Jogadores</th>
                <th className="text-right">Campanhas</th>
              </tr>
            </thead>
            <tbody>
              {data.competicoes.map((c) => (
                <tr key={c.id}>
                  <td>
                    <Link to="/admin/base/competicoes/$id" params={{ id: c.id }} className="font-semibold underline-offset-4 hover:underline">
                      {c.nome}
                    </Link>
                  </td>
                  <td>
                    {c.disponivel ? <Badge variant="avancou">Jogável</Badge> : c.ativa ? <Badge variant="contorno">Faltam elencos</Badge> : <Badge>Inativa</Badge>}
                  </td>
                  <td className="text-right">
                    {c.elencosCompletos}/{c.elencos}
                    <span className="block text-xs text-neutro-700">mín. {c.minimoElencos}</span>
                  </td>
                  <td className="text-right">{fmt.format(c.jogadores)}</td>
                  <td className="text-right">{fmt.format(c.campanhas)}</td>
                </tr>
              ))}
            </tbody>
          </Tabela>
          <p className="mt-2 text-xs text-neutro-700">Elencos: completos/total. Só os completos (11 ativos com goleiro) entram no sorteio.</p>
        </section>
        <section>
          <h2 className="rotulo mb-3">Formações mais usadas</h2>
          {campanhas.porFormacao.length === 0 ? (
            <p className="text-neutro-700">Nenhuma campanha ainda.</p>
          ) : (
            <Tabela>
              <thead>
                <tr>
                  <th>Formação</th>
                  <th className="text-right">Campanhas</th>
                </tr>
              </thead>
              <tbody>
                {campanhas.porFormacao.map((f) => (
                  <tr key={f.formacao}>
                    <td className="font-display text-lg">{f.formacao}</td>
                    <td className="text-right">{fmt.format(f.total)}</td>
                  </tr>
                ))}
              </tbody>
            </Tabela>
          )}
        </section>
      </div>
    </>
  );
}
