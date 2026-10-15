import { useMutation, useQuery } from "@tanstack/react-query";
import { Upload } from "lucide-react";
import { useState } from "react";
import { mensagemErro } from "@/lib/api";
import { CampoForm, Checkbox, Select, Textarea } from "@/components/admin/form";
import { Distintivo } from "@/components/jogo/distintivo";
import { Button } from "@/components/ui/button";
import { Dialogo } from "@/components/ui/dialog";
import { Erro } from "@/components/ui/estados";
import { Input } from "@/components/ui/input";
import { adminApi } from "@/lib/admin-api";
import { POSICOES, type DadosJogador } from "@/lib/admin-base";
import type { CompeticaoAdmin, ElencoAdmin, EquipeAdmin, Formato, JogadorAdmin, ResultadoImportacao } from "@/lib/admin-tipos";
import { NOME_POSICAO } from "@/lib/jogo";
import type { Posicao } from "@/lib/tipos";


interface DialogoForm<T> {
  aoFechar: () => void;
  aoSalvar: (resultado: T) => void;
}

// ───────── Competição ─────────
export function FormCompeticao({ competicao, aoFechar, aoSalvar }: DialogoForm<CompeticaoAdmin> & { competicao?: CompeticaoAdmin }) {
  const [nome, setNome] = useState(competicao?.nome ?? "");
  const [slug, setSlug] = useState(competicao?.slug ?? "");
  const [descricao, setDescricao] = useState(competicao?.descricao ?? "");
  const [formato, setFormato] = useState<Formato>(competicao?.formato ?? "grupos_mata_mata");
  const [ativa, setAtiva] = useState(competicao?.ativa ?? false);
  const [ordem, setOrdem] = useState(String(competicao?.ordem ?? 0));
  const salvar = useMutation({
    mutationFn: () => {
      const dados = { nome, slug, descricao: descricao.trim() || null, formato, ativa, ordem: Number(ordem) };
      return competicao ? adminApi.atualizarCompeticao(competicao.id, dados) : adminApi.criarCompeticao(dados);
    },
    onSuccess: (c) => {
      aoSalvar(c);
      aoFechar();
    },
  });
  const sugerirSlug = (texto: string) =>
    texto.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  return (
    <Dialogo aberto aoMudar={(v) => !v && aoFechar()} titulo={competicao ? "Editar competição" : "Nova competição"}>
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); salvar.mutate(); }}>
        {salvar.error && <Erro mensagem={mensagemErro(salvar.error)} />}
        <CampoForm rotulo="Nome">
          {(id) => (
            <Input id={id} required value={nome} onChange={(e) => { setNome(e.target.value); if (!competicao) setSlug(sugerirSlug(e.target.value)); }} />
          )}
        </CampoForm>
        <CampoForm rotulo="Slug" dica="Usado na URL e no JSON de importação. Ex.: copa-do-brasil">
          {(id) => <Input id={id} required pattern="[a-z0-9]+(-[a-z0-9]+)*" value={slug} onChange={(e) => setSlug(e.target.value)} />}
        </CampoForm>
        <CampoForm rotulo="Descrição">{(id) => <Input id={id} maxLength={255} value={descricao} onChange={(e) => setDescricao(e.target.value)} />}</CampoForm>
        <CampoForm rotulo="Formato" dica={competicao && competicao.totalCampanhas > 0 ? "Bloqueado: já existem campanhas." : undefined}>
          {(id) => (
            <Select id={id} value={formato} disabled={!!competicao && competicao.totalCampanhas > 0} onChange={(e) => setFormato(e.target.value as Formato)}>
              <option value="grupos_mata_mata">Grupos + mata-mata (7 jogos, mínimo 3 elencos)</option>
              <option value="mata_mata">Mata-mata puro (5 jogos, mínimo 1 elenco)</option>
            </Select>
          )}
        </CampoForm>
        <CampoForm rotulo="Ordem no catálogo">{(id) => <Input id={id} type="number" min={0} value={ordem} onChange={(e) => setOrdem(e.target.value)} />}</CampoForm>
        <Checkbox rotulo="Ativa (aparece para os jogadores quando tiver elencos suficientes)" checked={ativa} onChange={(e) => setAtiva(e.target.checked)} />
        <Button type="submit" className="w-full" disabled={salvar.isPending}>{salvar.isPending ? "Salvando…" : "Salvar"}</Button>
      </form>
    </Dialogo>
  );
}

// ───────── Equipe ─────────
type DadosEquipe = Omit<EquipeAdmin, "id" | "totalElencos">;

function CamposEquipe({ valor, mudar }: { valor: DadosEquipe; mudar: (v: DadosEquipe) => void }) {
  const set = (patch: Partial<DadosEquipe>) => mudar({ ...valor, ...patch });
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Distintivo equipe={{ ...valor, sigla: valor.sigla || "?" }} className="size-14 text-sm" />
        <p className="text-sm text-neutro-700">Distintivo genérico: só sigla e cores. Nunca o escudo real.</p>
      </div>
      <CampoForm rotulo="Nome">{(id) => <Input id={id} required value={valor.nome} onChange={(e) => set({ nome: e.target.value })} />}</CampoForm>
      <div className="grid grid-cols-2 gap-3">
        <CampoForm rotulo="Sigla">{(id) => <Input id={id} required minLength={2} maxLength={4} value={valor.sigla} onChange={(e) => set({ sigla: e.target.value.toUpperCase() })} />}</CampoForm>
        <CampoForm rotulo="País (ISO)">{(id) => <Input id={id} maxLength={2} placeholder="BR" value={valor.pais ?? ""} onChange={(e) => set({ pais: e.target.value.toUpperCase() || null })} />}</CampoForm>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {(["corPrimaria", "corSecundaria"] as const).map((campo) => (
          <CampoForm key={campo} rotulo={campo === "corPrimaria" ? "Cor principal" : "Cor secundária"}>
            {(id) => (
              <div className="flex gap-2">
                <input type="color" aria-label={`${campo === "corPrimaria" ? "Cor principal" : "Cor secundária"} (seletor)`} className="h-11 w-12 shrink-0 cursor-pointer border-2 border-neutro-400 bg-white" value={valor[campo]} onChange={(e) => set({ [campo]: e.target.value.toUpperCase() })} />
                <Input id={id} required pattern="#[0-9A-Fa-f]{6}" value={valor[campo]} onChange={(e) => set({ [campo]: e.target.value.toUpperCase() })} />
              </div>
            )}
          </CampoForm>
        ))}
      </div>
    </div>
  );
}

const equipeVazia: DadosEquipe = { nome: "", sigla: "", pais: "BR", corPrimaria: "#1F5F3F", corSecundaria: "#FFFFFF" };

export function FormEquipe({ equipe, aoFechar, aoSalvar }: DialogoForm<EquipeAdmin> & { equipe?: EquipeAdmin }) {
  const [valor, setValor] = useState<DadosEquipe>(equipe ? { nome: equipe.nome, sigla: equipe.sigla, pais: equipe.pais, corPrimaria: equipe.corPrimaria, corSecundaria: equipe.corSecundaria } : equipeVazia);
  const salvar = useMutation({
    mutationFn: () => (equipe ? adminApi.atualizarEquipe(equipe.id, valor) : adminApi.criarEquipe(valor)),
    onSuccess: (e) => {
      aoSalvar(e);
      aoFechar();
    },
  });
  return (
    <Dialogo aberto aoMudar={(v) => !v && aoFechar()} titulo={equipe ? "Editar time" : "Novo time"}>
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); salvar.mutate(); }}>
        {salvar.error && <Erro mensagem={mensagemErro(salvar.error)} />}
        <CamposEquipe valor={valor} mudar={setValor} />
        <Button type="submit" className="w-full" disabled={salvar.isPending}>{salvar.isPending ? "Salvando…" : "Salvar"}</Button>
      </form>
    </Dialogo>
  );
}

// ───────── Elenco ─────────
export function FormElenco({ competicaoId, elenco, aoFechar, aoSalvar }: DialogoForm<ElencoAdmin> & { competicaoId: string; elenco?: ElencoAdmin }) {
  const equipes = useQuery({ queryKey: ["admin", "equipes", ""], queryFn: () => adminApi.equipes() });
  const [temporada, setTemporada] = useState(String(elenco?.temporada ?? new Date().getFullYear() - 1));
  const [equipeId, setEquipeId] = useState(elenco?.equipe.id ?? "");
  const [novoTime, setNovoTime] = useState(false);
  const [equipeNova, setEquipeNova] = useState<DadosEquipe>(equipeVazia);
  const salvar = useMutation({
    mutationFn: async () => {
      const id = novoTime ? (await adminApi.criarEquipe(equipeNova)).id : equipeId;
      const dados = { equipeId: id, temporada: Number(temporada) };
      return elenco ? adminApi.atualizarElenco(elenco.id, dados) : adminApi.criarElenco({ competicaoId, ...dados });
    },
    onSuccess: (e) => {
      aoSalvar(e);
      aoFechar();
    },
  });
  return (
    <Dialogo aberto aoMudar={(v) => !v && aoFechar()} titulo={elenco ? "Editar elenco" : "Novo elenco campeão"} descricao="Um elenco por título: o campeão daquela temporada.">
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); salvar.mutate(); }}>
        {salvar.error && <Erro mensagem={mensagemErro(salvar.error)} />}
        <CampoForm rotulo="Temporada (ano do título)">{(id) => <Input id={id} type="number" required min={1900} max={2100} value={temporada} onChange={(e) => setTemporada(e.target.value)} />}</CampoForm>
        {!novoTime ? (
          <CampoForm rotulo="Time campeão">
            {(id) => (
              <Select id={id} required value={equipeId} onChange={(e) => setEquipeId(e.target.value)}>
                <option value="">Escolha o time…</option>
                {equipes.data?.map((q) => (
                  <option key={q.id} value={q.id}>
                    {q.nome} ({q.sigla})
                  </option>
                ))}
              </Select>
            )}
          </CampoForm>
        ) : (
          <div className="border-2 border-neutro-400 p-3">
            <CamposEquipe valor={equipeNova} mudar={setEquipeNova} />
          </div>
        )}
        <Button type="button" variant="link" onClick={() => setNovoTime((v) => !v)}>
          {novoTime ? "Escolher um time já cadastrado" : "O time não está na lista? Cadastrar agora"}
        </Button>
        <Button type="submit" className="w-full" disabled={salvar.isPending}>{salvar.isPending ? "Salvando…" : "Salvar"}</Button>
      </form>
    </Dialogo>
  );
}

// ───────── Jogador ─────────

export function CamposJogador({ valor, mudar, compacto }: { valor: DadosJogador; mudar: (v: DadosJogador) => void; compacto?: boolean }) {
  const set = (patch: Partial<DadosJogador>) => mudar({ ...valor, ...patch });
  const alternar = (p: Posicao) =>
    set({ posicoesSecundarias: valor.posicoesSecundarias.includes(p) ? valor.posicoesSecundarias.filter((x) => x !== p) : [...valor.posicoesSecundarias, p] });
  return (
    <div className={compacto ? "grid gap-3 md:grid-cols-[2fr_1fr_100px]" : "space-y-4"}>
      <CampoForm rotulo="Nome">{(id) => <Input id={id} required value={valor.nome} onChange={(e) => set({ nome: e.target.value })} />}</CampoForm>
      <CampoForm rotulo="Posição">
        {(id) => (
          <Select id={id} value={valor.posicao} onChange={(e) => set({ posicao: e.target.value as Posicao, posicoesSecundarias: valor.posicoesSecundarias.filter((p) => p !== e.target.value) })}>
            {POSICOES.map((p) => (
              <option key={p} value={p}>
                {p} · {NOME_POSICAO[p]}
              </option>
            ))}
          </Select>
        )}
      </CampoForm>
      <CampoForm rotulo="Overall">{(id) => <Input id={id} type="number" required min={1} max={99} value={valor.overall} onChange={(e) => set({ overall: Number(e.target.value) })} />}</CampoForm>
      <fieldset className={compacto ? "md:col-span-3" : ""}>
        <legend className="rotulo mb-1.5">Também joga de</legend>
        <div className="flex flex-wrap gap-x-4">
          {POSICOES.filter((p) => p !== valor.posicao).map((p) => (
            <Checkbox key={p} rotulo={p} checked={valor.posicoesSecundarias.includes(p)} onChange={() => alternar(p)} />
          ))}
        </div>
      </fieldset>
    </div>
  );
}

export function FormJogador({ jogador, aoFechar, aoSalvar }: DialogoForm<JogadorAdmin> & { jogador: JogadorAdmin }) {
  const [valor, setValor] = useState<DadosJogador>({ nome: jogador.nome, posicao: jogador.posicao, posicoesSecundarias: jogador.posicoesSecundarias, overall: jogador.overall, ativo: jogador.ativo });
  const salvar = useMutation({
    mutationFn: () => adminApi.atualizarJogador(jogador.id, valor),
    onSuccess: (j) => {
      aoSalvar(j);
      aoFechar();
    },
  });
  return (
    <Dialogo aberto aoMudar={(v) => !v && aoFechar()} titulo="Editar jogador">
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); salvar.mutate(); }}>
        {salvar.error && <Erro mensagem={mensagemErro(salvar.error)} />}
        <CamposJogador valor={valor} mudar={setValor} />
        <Checkbox rotulo="Ativo (entra no sorteio)" checked={valor.ativo} onChange={(e) => setValor({ ...valor, ativo: e.target.checked })} />
        <Button type="submit" className="w-full" disabled={salvar.isPending}>{salvar.isPending ? "Salvando…" : "Salvar"}</Button>
      </form>
    </Dialogo>
  );
}

// ───────── Importação JSON ─────────
export function ImportarJson({ slugCompeticao, aoFechar, aoSalvar }: DialogoForm<ResultadoImportacao> & { slugCompeticao: string }) {
  const [texto, setTexto] = useState("");
  const [erroLocal, setErroLocal] = useState<string | null>(null);
  const importar = useMutation({
    mutationFn: (conteudo: unknown) => adminApi.importarElenco(conteudo),
    onSuccess: (r) => {
      aoSalvar(r);
      aoFechar();
    },
  });
  const enviar = () => {
    setErroLocal(null);
    try {
      const conteudo = JSON.parse(texto) as Record<string, unknown>;
      // Always imports into the competition being viewed.
      importar.mutate({ ...conteudo, competicao: slugCompeticao });
    } catch {
      setErroLocal("JSON inválido. Confira vírgulas, aspas e chaves.");
    }
  };
  return (
    <Dialogo aberto aoMudar={(v) => !v && aoFechar()} titulo="Importar elenco (JSON)" descricao="Mesmo formato de data/elencos/LEIAME.md da API. Reimportar o mesmo ano atualiza o elenco.">
      <div className="space-y-4">
        {(erroLocal || importar.error) && <Erro mensagem={erroLocal ?? mensagemErro(importar.error)} />}
        <CampoForm rotulo="Arquivo .json">
          {(id) => (
            <input
              id={id}
              type="file"
              accept="application/json,.json"
              className="block w-full text-sm file:mr-3 file:h-11 file:border-2 file:border-neutro-400 file:bg-white file:px-3 file:font-semibold"
              onChange={async (e) => {
                const arquivo = e.target.files?.[0];
                if (arquivo) setTexto(await arquivo.text());
              }}
            />
          )}
        </CampoForm>
        <CampoForm rotulo="…ou cole o conteúdo">{(id) => <Textarea id={id} value={texto} onChange={(e) => setTexto(e.target.value)} placeholder='{ "temporada": 2005, "equipe": { … }, "jogadores": [ … ] }' />}</CampoForm>
        <Button className="w-full" disabled={!texto.trim() || importar.isPending} onClick={enviar}>
          {importar.isPending ? "Importando…" : "Importar"} <Upload aria-hidden />
        </Button>
      </div>
    </Dialogo>
  );
}
