import { minutoDoEvento, TITULO_EVENTO, type Evento } from "@/lib/eventos";
import { NOME_TIME_PADRAO, type PartidaCampanha } from "@/lib/tipos";
import { cn } from "@/lib/utils";

interface Props {
  eventos: Evento[];
  partida: Pick<PartidaCampanha, "prorrogacao" | "adversario">;
  /** The player's squad name. */
  nomeTime?: string;
  /** Live match: newest on top, so the last thing that happened is always in view. */
  maisRecentePrimeiro?: boolean;
  /** Goal just scored (live): highlighted while the reveal pauses on it. */
  destaque?: (e: Evento) => boolean;
}

const placarTexto = (p: { pro: number; contra: number }) => `${p.pro}–${p.contra}`;

/** Lance a lance: kickoff, goals, half-time, extra time, penalties and full time. */
export function LinhaDoTempo({ eventos, partida, nomeTime = NOME_TIME_PADRAO, maisRecentePrimeiro, destaque }: Props) {
  const lista = maisRecentePrimeiro ? [...eventos].reverse() : eventos;
  const rival = partida.adversario?.rotulo ?? "Adversário";
  return (
    <ol className="space-y-1.5" aria-label="Lances da partida">
      {lista.map((e) => {
        const minuto = minutoDoEvento(e, partida);
        const chave = `${e.tipo}-${e.passo}-${"jogadorNome" in e ? e.jogadorNome : ""}`;
        if (e.tipo === "gol") {
          const agora = destaque?.(e);
          return (
            <li
              key={chave}
              data-evento="gol"
              data-novo={agora || undefined}
              className={cn(
                "flex items-center gap-3 border-l-4 bg-white p-3 transition-colors",
                e.doSeuTime ? "border-verde" : "border-tinta",
                agora && (e.doSeuTime ? "bg-verde-100" : "bg-gramado"),
              )}
            >
              <span className="w-12 shrink-0 font-display text-lg tabular-nums">{minuto}</span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">
                  Gol! <span className="font-normal">{e.jogadorNome}</span>
                </span>
                <span className="block text-sm text-neutro-700">{e.doSeuTime ? nomeTime : rival}</span>
              </span>
              <span className="font-display text-lg tabular-nums">{placarTexto(e.placar)}</span>
            </li>
          );
        }
        if (e.tipo === "penalti") {
          return (
            <li key={chave} data-evento="penalti" className={cn("flex items-center gap-3 border-l-4 bg-white px-3 py-2 text-sm", e.doSeuTime ? "border-verde" : "border-tinta")}>
              <span className="w-12 shrink-0 rotulo text-[11px] text-neutro-700">Pên.</span>
              <span className="min-w-0 flex-1 truncate">
                <span className="font-semibold">{e.convertido ? "Converteu" : "Perdeu"}</span> · {e.jogadorNome}
                <span className="text-neutro-700"> ({e.doSeuTime ? nomeTime : rival})</span>
              </span>
              <span className="font-bold tabular-nums">{placarTexto(e.placar)}</span>
            </li>
          );
        }
        const placar = "placar" in e ? e.placar : null;
        return (
          <li key={chave} data-evento={e.tipo} className={cn("flex items-center gap-3 px-3 py-2", e.tipo === "fim_de_jogo" ? "bg-tinta text-papel" : "bg-gramado")}>
            <span className="w-12 shrink-0 text-sm tabular-nums">{minuto}</span>
            <span className="rotulo flex-1 text-[12px]">{TITULO_EVENTO[e.tipo]}</span>
            {placar && (
              <span className="text-sm font-bold tabular-nums">
                {placarTexto(placar)}
                {e.tipo === "fim_de_jogo" && e.penaltis && ` (pên. ${placarTexto(e.penaltis)})`}
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
