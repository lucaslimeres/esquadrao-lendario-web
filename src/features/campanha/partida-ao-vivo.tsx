import { ArrowRight, FastForward } from "lucide-react";
import { useEffect, useState } from "react";
import { Placar } from "@/components/jogo/placar";
import { Button } from "@/components/ui/button";
import { eventosAte } from "@/lib/eventos";
import { fraseFinal } from "@/lib/jogo";
import { atrasoDoPasso, etapaDoPasso, NOME_ETAPA } from "@/lib/ritmo";
import type { PartidaCampanha } from "@/lib/tipos";
import { cn } from "@/lib/utils";
import { LinhaDoTempo } from "./linha-do-tempo";

function prefereSemAnimacao() {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

/** Minute-by-minute reveal of a match that the API already simulated. */
export function PartidaAoVivo({ partida, onFim }: { partida: PartidaCampanha; onFim: () => void }) {
  const duracao = partida.prorrogacao ? 120 : 90;
  const totalPenaltis = partida.penaltis?.length ?? 0;
  // Timeline: minutes 0…duracao, then one step per penalty kick.
  const fim = duracao + totalPenaltis;
  const [passo, setPasso] = useState(() => (prefereSemAnimacao() ? fim : 0));

  useEffect(() => {
    if (passo >= fim) return;
    const t = window.setTimeout(() => setPasso((p) => p + 1), atrasoDoPasso(passo, partida));
    return () => window.clearTimeout(t);
  }, [passo, fim, partida]);

  const minuto = Math.min(passo, duracao);
  const gols = partida.gols.filter((g) => g.minuto <= minuto);
  const terminou = passo >= fim;
  const etapa = etapaDoPasso(passo, partida);
  // The goal just scored stays highlighted while the reveal pauses on it.
  const golAgora = !terminou && passo <= duracao ? gols.filter((g) => g.minuto === passo) : [];

  return (
    <section aria-live="polite" className="mx-auto max-w-2xl">
      <Placar
        partida={partida}
        golsPro={gols.filter((g) => g.doSeuTime).length}
        golsContra={gols.filter((g) => !g.doSeuTime).length}
        minuto={terminou ? null : minuto}
      />
      {!terminou && (
        <p className="rotulo mt-3 flex items-center gap-2 text-neutro-700" data-etapa={etapa}>
          {golAgora.length > 0 ? (
            <span className={cn("px-2 py-0.5 text-sm", golAgora.some((g) => g.doSeuTime) ? "bg-verde text-white" : "bg-tinta text-papel")}>Gol!</span>
          ) : (
            NOME_ETAPA[etapa]
          )}
        </p>
      )}
      <div className="mt-4">
        <LinhaDoTempo
          eventos={eventosAte(partida, passo)}
          partida={partida}
          maisRecentePrimeiro
          destaque={(e) => e.tipo === "gol" && golAgora.some((g) => g.minuto === e.minuto && g.jogadorNome === e.jogadorNome)}
        />
      </div>
      <div className="mt-6">
        {terminou ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-display text-3xl">{fraseFinal(partida)}</p>
            <Button onClick={onFim} className="sm:w-56">
              Continuar <ArrowRight aria-hidden />
            </Button>
          </div>
        ) : (
          <Button variant="link" onClick={() => setPasso(fim)}>
            Pular <FastForward aria-hidden />
          </Button>
        )}
      </div>
    </section>
  );
}
