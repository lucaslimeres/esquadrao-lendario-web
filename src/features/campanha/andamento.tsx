import { ChevronDown, Play } from "lucide-react";
import { useState } from "react";
import { Campo } from "@/components/jogo/campo";
import { NomeElenco } from "@/components/jogo/distintivo";
import { SeloResultado } from "@/components/jogo/placar";
import { Button } from "@/components/ui/button";
import { Erro } from "@/components/ui/estados";
import { ApiError } from "@/lib/api";
import { NOME_FASE, placar } from "@/lib/jogo";
import type { Campanha, PartidaCampanha } from "@/lib/tipos";
import { eventosDaPartida } from "@/lib/eventos";
import { cn } from "@/lib/utils";
import { LinhaDoTempo } from "./linha-do-tempo";

interface Props {
  campanha: Campanha;
  jogando: boolean;
  erro: unknown;
  onJogar: () => void;
}

export function Andamento({ campanha, jogando, erro, onJogar }: Props) {
  const proxima = campanha.proximaPartida;
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_minmax(0,380px)]">
      <div className="space-y-8">
        {proxima && (
          <div className="bg-tinta p-5 text-papel sm:p-6">
            <p className="rotulo text-verde-claro">
              Próximo · {NOME_FASE[proxima.fase]}
              {proxima.fase === "grupo" ? ` · rodada ${proxima.rodada}` : ""}
            </p>
            <p className="mt-3 text-sm text-neutro-300">Seu esquadrão contra</p>
            <p className="text-3xl font-bold">{proxima.adversario?.rotulo ?? "—"}</p>
            {erro ? (
              <div className="mt-4 text-tinta">
                <Erro mensagem={erro instanceof ApiError ? erro.message : "Não deu para jogar agora. Tente de novo."} />
              </div>
            ) : null}
            <Button className="mt-5 w-full sm:w-72" tamanho="grande" disabled={jogando} onClick={onJogar}>
              {jogando ? "Entrando em campo…" : "Bola rolando!"} <Play aria-hidden />
            </Button>
          </div>
        )}
        {campanha.grupo && <TabelaGrupo grupo={campanha.grupo} />}
        <ListaPartidas partidas={campanha.partidas} />
      </div>
      <aside className="space-y-6">
        <div>
          <p className="rotulo mb-3">Seu esquadrão · {campanha.formacao.codigo}</p>
          <Campo vagas={campanha.formacao.vagas} />
        </div>
        <Artilharia campanha={campanha} />
      </aside>
    </div>
  );
}

export function TabelaGrupo({ grupo }: { grupo: NonNullable<Campanha["grupo"]> }) {
  return (
    <section>
      <h2 className="rotulo mb-3">Grupo {grupo.encerrado ? "· encerrado" : ""}</h2>
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
            {grupo.classificacao.map((l) => (
              <tr key={l.posicao} className={cn("border-b border-gramado", l.time.seuTime && "bg-verde-100 font-semibold")}>
                <td className="p-2">
                  <span className={cn("inline-flex size-6 items-center justify-center text-xs font-bold", l.classificado ? "bg-verde text-white" : "")}>{l.posicao}</span>
                </td>
                <td className="p-2">{l.time.seuTime ? "Seu esquadrão" : <NomeElenco elenco={l.time.elenco} />}</td>
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
      <p className="mt-2 text-xs text-neutro-700">Os 2 primeiros avançam ao mata-mata.</p>
    </section>
  );
}

/** Played matches; tapping one opens its history (goals with minute, half-time, penalties…). */
export function ListaPartidas({ partidas }: { partidas: PartidaCampanha[] }) {
  const [aberta, setAberta] = useState<string | null>(null);
  const jogadas = partidas.filter((p) => p.simulada);
  if (jogadas.length === 0) return null;
  return (
    <section>
      <h2 className="rotulo mb-3">Jogos</h2>
      <ul className="divide-y-2 divide-gramado border-2 border-neutro-400 bg-white">
        {jogadas.map((p) => {
          const aberto = aberta === p.id;
          return (
            <li key={p.id}>
              <button
                type="button"
                aria-expanded={aberto}
                aria-controls={`lances-${p.id}`}
                onClick={() => setAberta(aberto ? null : p.id)}
                className="flex w-full items-center gap-3 p-3 text-left hover:bg-papel"
              >
                <SeloResultado resultado={p.resultado} />
                <span className="min-w-0 flex-1">
                  <span className="rotulo block text-[11px] text-neutro-700">{NOME_FASE[p.fase]}</span>
                  <NomeElenco elenco={p.adversario} />
                </span>
                <span className="text-right">
                  <span className="font-display text-xl tabular-nums">{placar(p.golsPro, p.golsContra)}</span>
                  {p.penaltisPro !== null && (
                    <span className="block text-xs text-neutro-700">
                      pên. {p.penaltisPro}–{p.penaltisContra}
                    </span>
                  )}
                </span>
                <ChevronDown className={cn("size-5 shrink-0 transition-transform", aberto && "rotate-180")} aria-hidden />
                <span className="sr-only">{aberto ? "Esconder lances" : "Ver lances"}</span>
              </button>
              {aberto && (
                <div id={`lances-${p.id}`} className="border-t-2 border-gramado bg-papel p-3">
                  <LinhaDoTempo eventos={eventosDaPartida(p)} partida={p} />
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function Artilharia({ campanha }: { campanha: Pick<Campanha, "artilheiros"> }) {
  if (campanha.artilheiros.length === 0) return null;
  return (
    <section>
      <h2 className="rotulo mb-3">Artilharia</h2>
      <ol className="border-2 border-neutro-400 bg-white">
        {campanha.artilheiros.slice(0, 5).map((a, i) => (
          <li key={a.jogadorId} className="flex justify-between border-b border-gramado p-2 last:border-b-0">
            <span>
              <span className="mr-2 text-neutro-700">{i + 1}.</span>
              {a.nome}
            </span>
            <span className="font-bold">
              {a.gols} gol{a.gols > 1 ? "s" : ""}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
