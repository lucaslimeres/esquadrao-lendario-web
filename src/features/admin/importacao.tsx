import { useMutation, useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowDown, ArrowRight, ArrowUp, CloudDownload, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { CampoForm, Checkbox, Select, Tabela } from "@/components/admin/form";
import { Distintivo } from "@/components/jogo/distintivo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialogo } from "@/components/ui/dialog";
import { Erro } from "@/components/ui/estados";
import { Input } from "@/components/ui/input";
import { adminApi } from "@/lib/admin-api";
import { POSICOES } from "@/lib/admin-base";
import type { CompeticaoAdmin, DadosRascunho, FonteImportacao, Importacao, ItemImportacao } from "@/lib/admin-tipos";
import { mensagemErro } from "@/lib/api";
import { alternarFonte, emAndamento, moverFonte, ROTULO_STATUS_IMPORTACAO } from "@/lib/importacao";
import { NOME_POSICAO } from "@/lib/jogo";
import type { Posicao } from "@/lib/tipos";
import { CamposEquipe } from "./forms-base";

// ───────── Fontes escolhidas, em ordem de prioridade ─────────
function EscolherFontes({ legenda, dica, fontes, escolhidas, mudar }: { legenda: string; dica: string; fontes: FonteImportacao[]; escolhidas: string[]; mudar: (v: string[]) => void }) {
  const ordenadas = [...escolhidas.map((id) => fontes.find((f) => f.id === id)!).filter(Boolean), ...fontes.filter((f) => !escolhidas.includes(f.id))];
  return (
    <fieldset>
      <legend className="rotulo mb-1.5">{legenda}</legend>
      <p className="mb-2 text-xs text-neutro-700">{dica}</p>
      <ol className="border-2 border-neutro-400 bg-white">
        {ordenadas.map((f) => {
          const posicao = escolhidas.indexOf(f.id);
          if (f.indisponivel) {
            return (
              <li key={f.id} className="border-b border-gramado px-3 py-2 last:border-b-0">
                <Checkbox rotulo={f.nome} checked={false} disabled className="cursor-not-allowed opacity-60" />
                <p className="pb-1 text-xs text-neutro-700">{f.indisponivel}</p>
              </li>
            );
          }
          return (
            <li key={f.id} className="flex items-center justify-between gap-2 border-b border-gramado px-3 last:border-b-0">
              <Checkbox rotulo={posicao >= 0 ? `${posicao + 1}º · ${f.nome}` : f.nome} checked={posicao >= 0} onChange={() => mudar(alternarFonte(escolhidas, f.id))} />
              {posicao >= 0 && escolhidas.length > 1 && (
                <span className="flex">
                  <button type="button" className="inline-flex size-11 items-center justify-center hover:bg-gramado disabled:opacity-30" disabled={posicao === 0} aria-label={`Subir ${f.nome}`} onClick={() => mudar(moverFonte(escolhidas, f.id, -1))}>
                    <ArrowUp className="size-5" aria-hidden />
                  </button>
                  <button type="button" className="inline-flex size-11 items-center justify-center hover:bg-gramado disabled:opacity-30" disabled={posicao === escolhidas.length - 1} aria-label={`Descer ${f.nome}`} onClick={() => mudar(moverFonte(escolhidas, f.id, 1))}>
                    <ArrowDown className="size-5" aria-hidden />
                  </button>
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </fieldset>
  );
}

// ───────── Nova importação ─────────
export function NovaImportacaoDialogo({ competicao, aoFechar, aoCriar }: { competicao: CompeticaoAdmin; aoFechar: () => void; aoCriar: (i: Importacao) => void }) {
  const fontes = useQuery({ queryKey: ["admin", "importacoes", "fontes"], queryFn: adminApi.fontesImportacao });
  const ultimoAno = new Date().getFullYear() - 1;
  const [anoInicio, setAnoInicio] = useState(String(ultimoAno - 49));
  const [anoFim, setAnoFim] = useState(String(ultimoAno));
  const [campeoes, setCampeoes] = useState<string[] | null>(null);
  const [elencos, setElencos] = useState<string[] | null>(null);
  const [pagina, setPagina] = useState("");
  const [liga, setLiga] = useState("");
  const disponiveis = (lista?: FonteImportacao[]) => lista?.filter((f) => !f.indisponivel).map((f) => f.id) ?? [];
  const escolhidasCampeoes = campeoes ?? disponiveis(fontes.data?.campeoes);
  const escolhidasElencos = elencos ?? disponiveis(fontes.data?.elencos);
  const usaWikipedia = escolhidasCampeoes.includes("wikidata") || escolhidasElencos.includes("wikipedia-en");
  const usaHighlightly = escolhidasCampeoes.includes("highlightly") || escolhidasElencos.includes("highlightly");

  const criar = useMutation({
    mutationFn: () =>
      adminApi.criarImportacao({
        competicaoId: competicao.id,
        anoInicio: Number(anoInicio),
        anoFim: Number(anoFim),
        fontesCampeoes: escolhidasCampeoes,
        fontesElencos: escolhidasElencos,
        paginaWikipedia: pagina.trim() || undefined,
        ligaHighlightly: liga.trim() || undefined,
      }),
    onSuccess: aoCriar,
  });

  return (
    <Dialogo
      aberto
      aoMudar={(v) => !v && aoFechar()}
      titulo="Importar de fontes externas"
      descricao="Busca os campeões e os elencos nas fontes escolhidas e gera rascunhos para você revisar. Nada entra no jogo antes de você publicar."
    >
      <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); criar.mutate(); }}>
        {(fontes.error || criar.error) && <Erro mensagem={mensagemErro(fontes.error ?? criar.error)} />}
        <div className="grid grid-cols-2 gap-3">
          <CampoForm rotulo="De (ano do título)">{(id) => <Input id={id} type="number" required min={1900} max={ultimoAno + 1} value={anoInicio} onChange={(e) => setAnoInicio(e.target.value)} />}</CampoForm>
          <CampoForm rotulo="Até">{(id) => <Input id={id} type="number" required min={1900} max={ultimoAno + 1} value={anoFim} onChange={(e) => setAnoFim(e.target.value)} />}</CampoForm>
        </div>
        {fontes.data && (
          <>
            <EscolherFontes legenda="Lista de campeões" dica="Quem foi campeão em cada ano." fontes={fontes.data.campeoes} escolhidas={escolhidasCampeoes} mudar={setCampeoes} />
            <EscolherFontes
              legenda="Elencos"
              dica="As fontes se somam. Quando discordam (ex.: posição), vale a de cima."
              fontes={fontes.data.elencos}
              escolhidas={escolhidasElencos}
              mudar={setElencos}
            />
          </>
        )}
        {usaWikipedia && (
          <CampoForm rotulo="Página na Wikipedia em inglês (opcional)" dica="Artigo da competição, usado para achar campeões e finais. Em branco = padrão da competição.">
            {(id) => <Input id={id} placeholder="Ex.: Copa Libertadores" maxLength={190} value={pagina} onChange={(e) => setPagina(e.target.value)} />}
          </CampoForm>
        )}
        {usaHighlightly && (
          <CampoForm
            rotulo="Nome da liga na Highlightly (opcional)"
            dica="Em branco = padrão da competição. A Highlightly tem cota diária de requisições (o plano grátis permite poucas temporadas por dia) e cobre só os anos mais recentes."
          >
            {(id) => <Input id={id} placeholder="Ex.: CONMEBOL Libertadores" maxLength={120} value={liga} onChange={(e) => setLiga(e.target.value)} />}
          </CampoForm>
        )}
        <p className="text-xs text-neutro-700">
          Nenhuma fonte tem overall: o rascunho sugere um (75–97): titular da final começa em 86, e gol e braçadeira na final somam pontos. Revise antes de publicar. O link de
          cada fonte fica guardado no rascunho (os dados da Wikipedia são CC BY-SA).
        </p>
        <Button type="submit" className="w-full" disabled={criar.isPending || !fontes.data || escolhidasCampeoes.length === 0 || escolhidasElencos.length === 0}>
          {criar.isPending ? "Enviando…" : "Começar importação"} <CloudDownload aria-hidden />
        </Button>
      </form>
    </Dialogo>
  );
}

// ───────── Importações da competição ─────────
export function ImportacoesDaCompeticao({ competicaoId }: { competicaoId: string }) {
  const { data } = useQuery({
    queryKey: ["admin", "importacoes", competicaoId],
    queryFn: () => adminApi.importacoes(competicaoId),
    refetchInterval: (q) => (q.state.data?.some((i) => emAndamento(i.status)) ? 3000 : false),
  });
  if (!data || data.length === 0) return null;
  return (
    <section className="mt-10">
      <h2 className="rotulo mb-3">Importações</h2>
      <Tabela>
        <thead>
          <tr>
            <th>Quando</th>
            <th>Anos</th>
            <th>Situação</th>
            <th>Rascunhos</th>
            <th className="sr-only">Abrir</th>
          </tr>
        </thead>
        <tbody>
          {data.map((i) => (
            <tr key={i.id}>
              <td>{new Date(i.createdAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}</td>
              <td>
                {i.anoInicio}–{i.anoFim}
              </td>
              <td>
                <Badge variant={i.status === "concluida" ? "avancou" : i.status === "falhou" ? "eliminado" : "contorno"}>{ROTULO_STATUS_IMPORTACAO[i.status]}</Badge>
                {emAndamento(i.status) && i.totalItens > 0 && <span className="ml-2 text-xs text-neutro-700">{i.itensProcessados}/{i.totalItens}</span>}
              </td>
              <td className="text-xs text-neutro-700">
                {i.itensPorStatus.rascunho ?? 0} para revisar · {i.itensPorStatus.publicado ?? 0} publicados
              </td>
              <td>
                <Button asChild variant="contorno" tamanho="pequeno">
                  <Link to="/admin/base/importacoes/$id" params={{ id: i.id }}>
                    Revisar <ArrowRight aria-hidden />
                  </Link>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Tabela>
    </section>
  );
}

// ───────── Editor de rascunho ─────────
type JogadorRascunho = DadosRascunho["jogadores"][number];

export function EditorRascunho({ item, aoFechar, aoSalvar }: { item: ItemImportacao; aoFechar: () => void; aoSalvar: (i: ItemImportacao) => void }) {
  const [dados, setDados] = useState<DadosRascunho>(item.dados);
  const salvar = useMutation({
    mutationFn: () => adminApi.editarItemImportacao(item.id, dados),
    onSuccess: (i) => {
      aoSalvar(i);
      aoFechar();
    },
  });
  const setJogador = (indice: number, patch: Partial<JogadorRascunho>) =>
    setDados((d) => ({ ...d, jogadores: d.jogadores.map((j, i) => (i === indice ? { ...j, ...patch } : j)) }));
  const goleiros = dados.jogadores.filter((j) => j.posicao === "GK").length;

  return (
    <Dialogo aberto aoMudar={(v) => !v && aoFechar()} titulo={`Rascunho ${item.temporada}`} descricao="Ajuste o time, os jogadores, as posições e o overall. Publicar depois de salvar.">
      <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); salvar.mutate(); }}>
        {salvar.error && <Erro mensagem={mensagemErro(salvar.error)} />}
        <CamposEquipe valor={dados.equipe} mudar={(equipe) => setDados((d) => ({ ...d, equipe }))} />
        <div>
          <p className="rotulo mb-2">
            Jogadores ({dados.jogadores.length} · {goleiros} goleiro{goleiros === 1 ? "" : "s"})
          </p>
          <ul className="space-y-2">
            {dados.jogadores.map((j, i) => (
              <li key={i} className="grid grid-cols-[1fr_auto] gap-2 border-2 border-neutro-400 bg-white p-2 sm:grid-cols-[1fr_120px_76px_auto]">
                <Input aria-label={`Nome do jogador ${i + 1}`} required value={j.nome} onChange={(e) => setJogador(i, { nome: e.target.value })} className="col-span-2 sm:col-span-1" />
                <Select
                  aria-label={`Posição de ${j.nome || `jogador ${i + 1}`}`}
                  value={j.posicao}
                  onChange={(e) => {
                    const posicao = e.target.value as Posicao;
                    setJogador(i, { posicao, secundarias: j.secundarias.filter((p) => p !== posicao) });
                  }}
                >
                  {POSICOES.map((p) => (
                    <option key={p} value={p} title={NOME_POSICAO[p]}>
                      {p}
                    </option>
                  ))}
                </Select>
                <Input aria-label={`Overall de ${j.nome || `jogador ${i + 1}`}`} type="number" required min={1} max={99} value={j.overall} onChange={(e) => setJogador(i, { overall: Number(e.target.value) })} />
                <button
                  type="button"
                  className="inline-flex size-11 items-center justify-center hover:bg-gramado"
                  aria-label={`Remover ${j.nome || `jogador ${i + 1}`}`}
                  onClick={() => setDados((d) => ({ ...d, jogadores: d.jogadores.filter((_, k) => k !== i) }))}
                >
                  <Trash2 className="size-5" aria-hidden />
                </button>
                {j.secundarias.length > 0 && <p className="col-span-full text-xs text-neutro-700">Também joga de: {j.secundarias.join(", ")}</p>}
              </li>
            ))}
          </ul>
          <Button type="button" variant="link" className="mt-2" onClick={() => setDados((d) => ({ ...d, jogadores: [...d.jogadores, { nome: "", posicao: "ST", secundarias: [], overall: 70 }] }))}>
            <Plus aria-hidden /> Adicionar jogador
          </Button>
        </div>
        <Button type="submit" className="w-full" disabled={salvar.isPending}>
          {salvar.isPending ? "Salvando…" : "Salvar rascunho"}
        </Button>
      </form>
    </Dialogo>
  );
}

export function EquipeDoRascunho({ dados }: { dados: DadosRascunho }) {
  return (
    <span className="flex items-center gap-2 font-semibold">
      <Distintivo equipe={dados.equipe} className="size-8 text-[9px]" /> {dados.equipe.nome}
    </span>
  );
}
