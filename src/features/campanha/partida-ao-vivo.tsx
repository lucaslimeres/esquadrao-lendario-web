import { ArrowRight, FastForward } from "lucide-react";
import { useEffect, useState } from "react";
import { Placar } from "@/components/jogo/placar";
import { Button } from "@/components/ui/button";
import { fraseFinal } from "@/lib/jogo";
import { atrasoDoPasso, etapaDoPasso, NOME_ETAPA } from "@/lib/ritmo";
import type { PartidaCampanha } from "@/lib/tipos";
import { cn } from "@/lib/utils";

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
  const penaltis = (partida.penaltis ?? []).slice(0, Math.max(0, passo - duracao));
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
      <ol className="mt-4 space-y-2">
        {gols.map((g, i) => (
          <li
            key={i}
            data-novo={golAgora.includes(g) || undefined}
            className={cn(
              "flex items-center gap-3 border-l-4 bg-white p-3 transition-colors",
              g.doSeuTime ? "border-verde" : "border-tinta",
              golAgora.includes(g) && (g.doSeuTime ? "bg-verde-100" : "bg-gramado"),
            )}
          >
            <span className="w-10 font-display text-lg">{g.minuto}'</span>
            <span className="font-semibold">{g.jogadorNome}</span>
            <span className="ml-auto text-sm text-neutro-700">{g.doSeuTime ? "Seu esquadrão" : (partida.adversario?.rotulo ?? "Adversário")}</span>
          </li>
        ))}
      </ol>
      {penaltis.length > 0 && (
        <div className="mt-6">
          <p className="rotulo mb-2">Pênaltis</p>
          <ol className="grid grid-cols-2 gap-2 text-sm">
            {penaltis.map((c, i) => (
              <li key={i} className={cn("flex justify-between bg-white p-2", !c.doSeuTime && "col-start-2")}>
                <span className="truncate">{c.jogadorNome}</span>
                <span className="font-bold">{c.convertido ? "Gol" : "Perdeu"}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
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
