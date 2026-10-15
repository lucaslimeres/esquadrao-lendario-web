import { Link } from "@tanstack/react-router";
import { Dices, RefreshCw } from "lucide-react";
import { useState } from "react";
import { Campo } from "@/components/jogo/campo";
import { Distintivo } from "@/components/jogo/distintivo";
import { Button } from "@/components/ui/button";
import { Erro } from "@/components/ui/estados";
import { ApiError } from "@/lib/api";
import { api } from "@/lib/api";
import { nomeVaga, raridade } from "@/lib/jogo";
import type { Campanha, JogadorSorteado } from "@/lib/tipos";
import { cn } from "@/lib/utils";
import { useAcaoCampanha } from "./use-campanha";

export function Montagem({ campanha }: { campanha: Campanha }) {
  const [selecionado, setSelecionado] = useState<string | null>(null);
  const sortear = useAcaoCampanha(campanha.id, () => api.sortear(campanha.id));
  const resortear = useAcaoCampanha(campanha.id, () => api.resortear(campanha.id));
  const escolher = useAcaoCampanha(campanha.id, (dados: { jogadorId: string; vaga: string }) => api.escolher(campanha.id, dados));

  const pendente = campanha.sorteioPendente;
  const jogador = pendente?.jogadores.find((j) => j.id === selecionado) ?? null;
  const contagem = contarPosicoes(campanha);
  const erro = [sortear.error, resortear.error, escolher.error].find(Boolean);
  const ocupado = sortear.isPending || resortear.isPending || escolher.isPending;

  const escalar = (jogadorId: string, vaga: string) => {
    escolher.mutate({ jogadorId, vaga }, { onSuccess: () => setSelecionado(null) });
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,420px)_1fr]">
      <div>
        <div className="mb-3 flex items-end justify-between">
          <p className="rotulo">
            Escalação · {campanha.vagasPreenchidas}/{campanha.formacao.vagas.length}
          </p>
          {campanha.overallTime !== null && (
            <p className="text-right">
              <span className="rotulo block text-neutro-700">Overall</span>
              <span className="font-display text-3xl">{campanha.overallTime.toFixed(1).replace(".", ",")}</span>
            </p>
          )}
        </div>
        <Campo
          vagas={campanha.formacao.vagas}
          destacadas={jogador?.vagasCompativeis ?? []}
          aoEscolherVaga={jogador && !ocupado ? (vaga) => escalar(jogador.id, vaga) : undefined}
        />
        {jogador && <p className="mt-2 text-sm text-neutro-700">Toque numa vaga verde para escalar {jogador.nome}.</p>}
      </div>

      <div>
        {erro && (
          <div className="mb-4">
            <Erro mensagem={erro instanceof ApiError ? erro.message : "Algo deu errado. Tente de novo."}>
              {erro instanceof ApiError && erro.codigo === "sem_time_compativel" && (
                // Small base: no squad left can fill the open slots. Don't leave the player stuck.
                <Button asChild variant="link" className="mt-2">
                  <Link to="/jogar">Começar outra campanha com outra formação</Link>
                </Button>
              )}
            </Erro>
          </div>
        )}
        {!pendente ? (
          <div className="flex flex-col items-start gap-6 bg-verde p-6 text-white sm:p-8">
            <p className="rotulo text-verde-nevoa">Rodada {campanha.vagasPreenchidas + 1} de {campanha.formacao.vagas.length}</p>
            <p className="font-display text-4xl sm:text-5xl">Que time vai cair?</p>
            <Button variant="tinta" tamanho="grande" className="w-full sm:w-72" disabled={ocupado} onClick={() => sortear.mutate()}>
              {sortear.isPending ? "Sorteando…" : "Sorteia aí!"} <Dices aria-hidden />
            </Button>
          </div>
        ) : (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-tinta pb-4">
              <div className="flex items-center gap-3">
                {pendente.elenco && <Distintivo equipe={pendente.elenco.equipe} className="size-12 text-xs" />}
                <div>
                  <p className="rotulo text-verde">Time sorteado</p>
                  <p className="text-2xl font-bold">{pendente.elenco?.rotulo ?? "—"}</p>
                </div>
              </div>
              <Button variant="contorno" tamanho="pequeno" disabled={ocupado || campanha.resorteiosRestantes === 0} onClick={() => { setSelecionado(null); resortear.mutate(); }}>
                Re-sortear ({campanha.resorteiosRestantes}) <RefreshCw aria-hidden />
              </Button>
            </div>
            <p className="my-4 text-neutro-700">Escolha um craque e a vaga dele. Fora da posição de origem ele rende um pouco menos.</p>
            <ul className="divide-y-2 divide-gramado border-2 border-neutro-400 bg-white">
              {pendente.jogadores.map((j) => (
                <LinhaJogador
                  key={j.id}
                  jogador={j}
                  selecionado={j.id === selecionado}
                  desabilitado={ocupado}
                  contagem={contagem}
                  onSelecionar={() => setSelecionado(j.id === selecionado ? null : j.id)}
                  onEscalar={(vaga) => escalar(j.id, vaga)}
                />
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function contarPosicoes(campanha: Campanha) {
  const contagem = new Map<string, number>();
  for (const v of campanha.formacao.vagas) contagem.set(v.posicao, (contagem.get(v.posicao) ?? 0) + 1);
  return contagem;
}

interface LinhaProps {
  jogador: JogadorSorteado;
  selecionado: boolean;
  desabilitado: boolean;
  contagem: Map<string, number>;
  onSelecionar: () => void;
  onEscalar: (vaga: string) => void;
}

function LinhaJogador({ jogador, selecionado, desabilitado, contagem, onSelecionar, onEscalar }: LinhaProps) {
  const disponivel = jogador.vagasCompativeis.length > 0;
  const r = raridade(jogador.overall);
  return (
    <li className={cn("p-3", selecionado && "bg-verde-100", !disponivel && "opacity-50")} data-jogador={jogador.id}>
      <button type="button" className="flex w-full items-center gap-3 text-left disabled:cursor-not-allowed" disabled={!disponivel || desabilitado} onClick={onSelecionar} aria-pressed={selecionado}>
        <span
          className={cn(
            "flex size-12 shrink-0 items-center justify-center font-display text-xl",
            r === "lendario" && "bg-verde text-white",
            r === "ouro" && "bg-tinta text-papel",
            r === "prata" && "bg-neutro-300",
            r === "bronze" && "border-2 border-neutro-500 bg-gramado",
          )}
          aria-label={`Overall ${jogador.overall}`}
        >
          {jogador.overall}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-bold">{jogador.nome}</span>
          <span className="rotulo text-[11px] text-neutro-700">
            {jogador.posicao}
            {jogador.posicoesSecundarias.length > 0 && ` · também ${jogador.posicoesSecundarias.join(", ")}`}
          </span>
        </span>
        {!disponivel && <span className="text-xs font-semibold">Sem vaga</span>}
      </button>
      {selecionado && disponivel && (
        <div className="mt-3 flex flex-wrap gap-2">
          {jogador.vagasCompativeis.map((vaga) => {
            const secundaria = !vaga.startsWith(`${jogador.posicao}_`);
            const posicao = vaga.split("_")[0]!;
            return (
              <Button key={vaga} tamanho="pequeno" variant={secundaria ? "contorno" : "primario"} disabled={desabilitado} onClick={() => onEscalar(vaga)}>
                {nomeVaga(vaga, (contagem.get(posicao) ?? 0) > 1)}
                {secundaria ? " (−7%)" : ""}
              </Button>
            );
          })}
        </div>
      )}
    </li>
  );
}
