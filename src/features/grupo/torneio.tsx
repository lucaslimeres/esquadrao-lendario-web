import { Link } from "@tanstack/react-router";
import { ChevronDown, Hourglass, Play, Trophy, Zap } from "lucide-react";
import { useMemo, useState } from "react";
import { EspacoPublicidade } from "@/components/anuncio";
import { Distintivo } from "@/components/jogo/distintivo";
import { Button } from "@/components/ui/button";
import { Erro } from "@/components/ui/estados";
import { BotaoCompartilhar } from "@/features/campanha/fim-de-campanha";
import { LinhaDoTempo } from "@/features/campanha/linha-do-tempo";
import { PartidaAoVivo } from "@/features/campanha/partida-ao-vivo";
import { api, mensagemErro } from "@/lib/api";
import { eventosDaPartida } from "@/lib/eventos";
import { decorridoAoVivo, linkDoGrupo, meuLado, naPerspectiva, relogioDoServidor } from "@/lib/grupo";
import { NOME_FASE } from "@/lib/jogo";
import type { Fase, Grupo, LinhaGrupoTorneio, PartidaCampanha, PartidaGrupo, TimeGrupo } from "@/lib/tipos";
import { cn } from "@/lib/utils";
import { ListaMembros } from "./membros";
import { useAcaoGrupo } from "./use-grupo";

const ORDEM_FASES: Fase[] = ["grupo", "dezesseis_avos", "oitavas", "quartas", "semifinal", "final"];
const CHAVE_VISTOS = "esquadrao-grupo-vistos";

/** Matches already watched live in this tab (so reloading doesn't replay them). */
function lerVistos(): Set<string> {
  try {
    return new Set(JSON.parse(window.sessionStorage.getItem(CHAVE_VISTOS) ?? "[]") as string[]);
  } catch {
    return new Set();
  }
}
function marcarVisto(id: string) {
  try {
    const vistos = [...lerVistos(), id].slice(-200);
    window.sessionStorage.setItem(CHAVE_VISTOS, JSON.stringify(vistos));
  } catch {
    // Blocked storage: the match may replay after a reload, nothing else.
  }
}

interface AoVivo {
  id: string;
  partida: PartidaCampanha;
  nomeTime: string;
  decorrido: number;
}

/** My match that is still being revealed (started by me, by the opponent or by the moderator). */
function acharAoVivo(grupo: Grupo, agora: number, vistos: Set<string>): AoVivo | null {
  const meuId = grupo.meuTime?.id ?? null;
  if (!meuId) return null;
  for (const p of grupo.partidas) {
    if (p.timeA?.id !== meuId && p.timeB?.id !== meuId) continue;
    if (vistos.has(p.id)) continue;
    const decorrido = decorridoAoVivo(p, agora);
    if (decorrido !== null) return { id: p.id, partida: naPerspectiva(p, meuId), nomeTime: meuLado(p, meuId)?.nome ?? "", decorrido };
  }
  return null;
}

export function TorneioGrupo({ grupo, recebidoEm }: { grupo: Grupo; recebidoEm: number }) {
  const relogio = useMemo(() => relogioDoServidor(grupo, recebidoEm), [grupo, recebidoEm]);
  const [assistindo, setAssistindo] = useState<AoVivo | null>(null);
  // Decided during render (not in an effect) so the score never flashes before the reveal.
  const candidato = assistindo ? null : acharAoVivo(grupo, relogio(), lerVistos());
  if (candidato) setAssistindo(candidato);
  const aoVivo = assistindo ?? candidato;

  if (aoVivo) {
    return (
      <PartidaAoVivo
        key={aoVivo.id}
        partida={aoVivo.partida}
        nomeTime={aoVivo.nomeTime}
        decorrido={aoVivo.decorrido}
        onFim={() => {
          marcarVisto(aoVivo.id);
          setAssistindo(null);
        }}
      />
    );
  }

  const eliminado = !!grupo.meuTime?.eliminado;
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_minmax(0,380px)]">
      <div className="space-y-8">
        {grupo.status === "encerrado" && <Campeao grupo={grupo} />}
        {grupo.status === "em_andamento" && eliminado && (
          <div className="border-2 border-tinta bg-white p-5">
            <p className="text-lg font-bold">Seu time caiu.</p>
            <p className="mt-1">Agora você acompanha o torneio inteiro: todos os grupos e todos os jogos.</p>
          </div>
        )}
        {grupo.proximaPartida && <ProximoJogo grupo={grupo} partida={grupo.proximaPartida} />}
        {grupo.aguardandoFase && (
          <div className="flex gap-3 border-2 border-neutro-400 bg-white p-5" aria-live="polite">
            <Hourglass className="mt-1 size-5 shrink-0" aria-hidden />
            <div>
              <p className="font-bold">Você já jogou tudo desta fase.</p>
              <p className="mt-1 text-neutro-700">
                A próxima fase sai quando todo mundo do grupo jogar
                {grupo.progressoFase ? ` (${grupo.progressoFase.jogados} de ${grupo.progressoFase.jogos} jogos dos membros)` : ""}.
              </p>
            </div>
          </div>
        )}
        {grupo.souModerador && grupo.pendentes.length > 0 && <Pendentes grupo={grupo} />}
        {grupo.grupos.map((g) => (
          <TabelaDoGrupo key={g.letra} letra={g.letra} encerrado={g.encerrado} linhas={g.classificacao} />
        ))}
        <JogosPorFase grupo={grupo} />
        {grupo.status === "encerrado" && <EspacoPublicidade posicao="fimDeCampanha" />}
      </div>
      <aside className="space-y-6">
        {grupo.meuTime && (
          <div className="border-2 border-neutro-400 bg-white p-4">
            <p className="rotulo mb-2">Seu time</p>
            <NomeTime time={grupo.meuTime} />
            {grupo.meuMembro?.campanha && (
              <Button asChild variant="link" className="mt-2">
                <Link to="/jogar/$id" params={{ id: grupo.meuMembro.campanha.id }}>
                  Ver escalação
                </Link>
              </Button>
            )}
          </div>
        )}
        {(grupo.visaoCompleta || grupo.status === "encerrado") && (
          <BotaoCompartilhar titulo={`Veja como foi o torneio “${grupo.nome}” no Esquadrão Lendário`} url={linkDoGrupo(grupo.codigo)} />
        )}
        <ListaMembros grupo={grupo} />
      </aside>
    </div>
  );
}

function NomeTime({ time, className }: { time: TimeGrupo | null; className?: string }) {
  if (!time) return <span>—</span>;
  return (
    <span className={cn("inline-flex min-w-0 items-center gap-2", className)}>
      {time.elenco && <Distintivo equipe={time.elenco.equipe} className="size-7 text-[9px]" />}
      <span className={cn("truncate", time.seuTime ? "font-bold" : "font-semibold")}>{time.nome}</span>
    </span>
  );
}

function Campeao({ grupo }: { grupo: Grupo }) {
  const fuiEu = !!grupo.campeao?.seuTime;
  return (
    <div className={cn("p-5 sm:p-6", fuiEu ? "bg-verde text-white" : "bg-tinta text-papel")}>
      <p className="rotulo flex items-center gap-2">
        <Trophy className="size-4" aria-hidden /> {fuiEu ? "É campeão!" : "Campeão"}
      </p>
      <p className="mt-2 font-display text-3xl sm:text-4xl">{grupo.campeao?.nome ?? "—"}</p>
      {!fuiEu && grupo.meuTime && <p className="mt-2 text-sm text-neutro-300">Seu time: {grupo.meuTime.nome}</p>}
    </div>
  );
}

function ProximoJogo({ grupo, partida }: { grupo: Grupo; partida: NonNullable<Grupo["proximaPartida"]> }) {
  const jogar = useAcaoGrupo(grupo.codigo, () => api.jogarNoGrupo(grupo.codigo));
  const meuId = grupo.meuTime?.id ?? null;
  const adversario = partida.timeA?.id === meuId ? partida.timeB : partida.timeA;
  const contraMembro = !!adversario?.membro;
  const esperando = partida.situacao === "aguardando_adversario";
  return (
    <div className="bg-tinta p-5 text-papel sm:p-6" aria-live="polite">
      <p className="rotulo text-verde-claro">
        Próximo · {NOME_FASE[partida.fase]}
        {partida.fase === "grupo" ? ` · grupo ${partida.grupo} · rodada ${partida.rodada}` : ""}
      </p>
      <p className="mt-3 text-sm text-neutro-300">{grupo.meuTime?.nome} contra</p>
      <p className="text-3xl font-bold">{adversario?.nome ?? "—"}</p>
      {contraMembro && (
        <p className="mt-2 text-sm text-neutro-300">
          {esperando
            ? `Esperando ${adversario?.nome} confirmar. O jogo começa para os dois ao mesmo tempo.`
            : partida.situacao === "adversario_pronto"
              ? `${adversario?.nome} já está pronto esperando você!`
              : "Jogo entre membros: começa quando os dois confirmarem, e vocês assistem juntos, ao vivo."}
        </p>
      )}
      {jogar.isError && (
        <div className="mt-4 text-tinta">
          <Erro mensagem={mensagemErro(jogar.error, "Não deu para jogar agora. Tente de novo.")} />
        </div>
      )}
      {esperando ? (
        <p className="mt-5 inline-flex min-h-11 items-center gap-2 border-2 border-neutro-300 px-4 font-semibold">
          <Hourglass className="size-5" aria-hidden /> Aguardando o adversário…
        </p>
      ) : (
        <Button className="mt-5 w-full sm:w-72" tamanho="grande" disabled={jogar.isPending} onClick={() => jogar.mutate()}>
          {jogar.isPending ? "Entrando em campo…" : contraMembro && partida.situacao === "jogar" ? "Estou pronto para o jogo" : "Bola rolando!"} <Play aria-hidden />
        </Button>
      )}
    </div>
  );
}

function Pendentes({ grupo }: { grupo: Grupo }) {
  const forcar = useAcaoGrupo(grupo.codigo, (id: string) => api.forcarJogo(grupo.codigo, id));
  return (
    <section aria-labelledby="titulo-pendentes" className="border-2 border-tinta bg-white p-5">
      <h2 id="titulo-pendentes" className="rotulo mb-1">Moderação · jogos esperando</h2>
      <p className="mb-3 text-sm text-neutro-700">Alguém demorando? Você pode fazer o jogo acontecer agora, sem esperar a confirmação.</p>
      {forcar.isError && <Erro mensagem={mensagemErro(forcar.error, "Não deu para forçar o jogo.")} />}
      <ul className="divide-y-2 divide-gramado">
        {grupo.pendentes.map((p) => (
          <li key={p.id} className="flex flex-col gap-2 py-2 sm:flex-row sm:items-center">
            <span className="min-w-0 flex-1 text-sm">
              <span className="rotulo block text-[11px] text-neutro-700">{NOME_FASE[p.fase]}</span>
              {p.timeA} {p.prontoA ? "✓" : ""} × {p.timeB} {p.prontoB ? "✓" : ""}
            </span>
            <Button tamanho="pequeno" variant="tinta" disabled={forcar.isPending} onClick={() => forcar.mutate(p.id)}>
              Forçar jogo <Zap aria-hidden />
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function TabelaDoGrupo({ letra, encerrado, linhas }: { letra: string; encerrado: boolean; linhas: LinhaGrupoTorneio[] }) {
  return (
    <section aria-label={`Grupo ${letra}`}>
      <h2 className="rotulo mb-3">
        Grupo {letra} {encerrado ? "· encerrado" : ""}
      </h2>
      <div className="relative overflow-x-auto">
        <table className="w-full border-2 border-neutro-400 bg-white text-sm">
          <thead>
            <tr className="border-b-2 border-tinta text-left">
              <th className="p-2">#</th>
              <th className="p-2">Time</th>
              <th className="p-2 text-right" title="Pontos">P</th>
              <th className="p-2 text-right" title="Jogos">J</th>
              <th className="p-2 text-right" title="Vitórias">V</th>
              <th className="p-2 text-right" title="Empates">E</th>
              <th className="p-2 text-right" title="Derrotas">D</th>
              <th className="p-2 text-right" title="Saldo de gols">SG</th>
            </tr>
          </thead>
          <tbody>
            {linhas.map((l) => (
              <tr key={l.posicao} className={cn("border-b border-gramado", l.time?.seuTime && "bg-verde-100 font-semibold")}>
                <td className="p-2">
                  <span className={cn("inline-flex size-6 items-center justify-center text-xs font-bold", l.classificado ? "bg-verde text-white" : "")}>{l.posicao}</span>
                </td>
                <td className="max-w-48 p-2">
                  <NomeTime time={l.time} />
                </td>
                <td className="p-2 text-right font-bold">{l.pontos}</td>
                <td className="p-2 text-right">{l.jogos}</td>
                <td className="p-2 text-right">{l.vitorias}</td>
                <td className="p-2 text-right">{l.empates}</td>
                <td className="p-2 text-right">{l.derrotas}</td>
                <td className="p-2 text-right">{l.saldo > 0 ? `+${l.saldo}` : l.saldo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function JogosPorFase({ grupo }: { grupo: Grupo }) {
  const fases = ORDEM_FASES.filter((f) => grupo.partidas.some((p) => p.fase === f)).reverse();
  if (fases.length === 0) return null;
  return (
    <section aria-labelledby="titulo-jogos" className="space-y-6">
      <h2 id="titulo-jogos" className="rotulo">
        {grupo.visaoCompleta ? "Todos os jogos" : "Seus jogos e os do seu grupo"}
      </h2>
      {fases.map((fase) => (
        <div key={fase}>
          <h3 className="mb-2 font-bold">{fase === "grupo" ? "Fase de grupos" : NOME_FASE[fase]}</h3>
          <ListaJogos partidas={grupo.partidas.filter((p) => p.fase === fase)} />
        </div>
      ))}
    </section>
  );
}

/** Matches from a neutral point of view; tapping a played one opens its history. */
function ListaJogos({ partidas }: { partidas: PartidaGrupo[] }) {
  const [aberta, setAberta] = useState<string | null>(null);
  return (
    <ul className="divide-y-2 divide-gramado border-2 border-neutro-400 bg-white">
      {partidas.map((p) => {
        const aberto = aberta === p.id;
        const meu = !!(p.timeA?.seuTime || p.timeB?.seuTime);
        return (
          <li key={p.id} className={cn(meu && "bg-verde-100/60")}>
            <button
              type="button"
              aria-expanded={p.simulada ? aberto : undefined}
              disabled={!p.simulada}
              onClick={() => setAberta(aberto ? null : p.id)}
              className="grid w-full grid-cols-[1fr_auto_1fr_auto] items-center gap-2 p-3 text-left text-sm enabled:hover:bg-papel"
            >
              <NomeTime time={p.timeA} className={cn(p.vencedor === "a" && "underline decoration-verde decoration-2 underline-offset-4")} />
              <span className="text-center">
                <span className="font-display text-lg tabular-nums">{p.simulada ? `${p.golsA}–${p.golsB}` : "×"}</span>
                {p.penaltisA !== null && (
                  <span className="block text-xs text-neutro-700">
                    pên. {p.penaltisA}–{p.penaltisB}
                  </span>
                )}
              </span>
              <NomeTime time={p.timeB} className={cn("justify-self-end", p.vencedor === "b" && "underline decoration-verde decoration-2 underline-offset-4")} />
              {p.simulada ? (
                <ChevronDown className={cn("size-5 shrink-0 transition-transform", aberto && "rotate-180")} aria-hidden />
              ) : (
                <span className="size-5" aria-hidden />
              )}
              {p.simulada && <span className="sr-only">{aberto ? "Esconder lances" : "Ver lances"}</span>}
            </button>
            {aberto && (
              <div className="border-t-2 border-gramado bg-papel p-3">
                <LinhaDoTempo eventos={eventosDaPartida(naPerspectiva(p, null))} partida={naPerspectiva(p, null)} nomeTime={p.timeA?.nome} />
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
