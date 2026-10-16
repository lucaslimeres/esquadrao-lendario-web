import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, Check, Globe, Lock } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Erro } from "@/components/ui/estados";
import { Input, Label } from "@/components/ui/input";
import { BotaoCompartilhar } from "@/features/campanha/fim-de-campanha";
import { api, mensagemErro } from "@/lib/api";
import { linkDoGrupo } from "@/lib/grupo";
import type { Grupo } from "@/lib/tipos";
import { ListaMembros } from "./membros";
import { useAcaoGrupo } from "./use-grupo";

const NOME_TIME_MAX = 30;

/** Sign-ups: name your team, get ready; the moderator invites, removes and closes sign-ups. */
export function Saguao({ grupo }: { grupo: Grupo }) {
  const { codigo } = grupo;
  const eu = grupo.meuMembro!;
  const [nomeTime, setNomeTime] = useState(eu.nomeTime ?? "");
  const [email, setEmail] = useState("");
  const salvar = useAcaoGrupo(codigo, (pronto: boolean) => api.meuTimeNoGrupo(codigo, { nomeTime: nomeTime.trim() || null, pronto }));
  const adicionar = useAcaoGrupo(codigo, () => api.adicionarAoGrupo(codigo, email.trim()));
  const remover = useAcaoGrupo(codigo, (id: string) => api.removerDoGrupo(codigo, id));
  const visibilidade = useAcaoGrupo(codigo, () => api.configurarGrupo(codigo, { visibilidade: grupo.visibilidade === "publico" ? "privado" : "publico" }));
  const comecar = useAcaoGrupo(codigo, () => api.comecarMontagemDoGrupo(codigo));
  const faltam = grupo.membros.filter((m) => !m.pronto).length;
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const sair = useMutation({
    mutationFn: () => api.sairDoGrupo(codigo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meus-grupos"] });
      navigate({ to: "/grupos" });
    },
  });

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_minmax(0,400px)]">
      <div className="space-y-8">
        <section aria-labelledby="titulo-meu-time" className="border-2 border-tinta bg-white p-5">
          <h2 id="titulo-meu-time" className="rotulo mb-4">Seu time</h2>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (!salvar.isPending) salvar.mutate(true);
            }}
          >
            <div>
              <Label htmlFor="nome-time-grupo">Nome do time</Label>
              <Input
                id="nome-time-grupo"
                value={nomeTime}
                maxLength={NOME_TIME_MAX}
                autoComplete="off"
                disabled={eu.pronto}
                placeholder="Ex.: Os Lendários"
                onChange={(e) => setNomeTime(e.target.value)}
              />
              <p className="mt-2 text-sm text-neutro-700">É o nome que todo mundo do grupo vai ver na tabela e no placar.</p>
            </div>
            {salvar.isError && <Erro mensagem={mensagemErro(salvar.error, "Não deu para salvar.")} />}
            {eu.pronto ? (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <p className="flex items-center gap-2 font-semibold text-verde">
                  <Check className="size-5" aria-hidden /> Você está pronto!
                </p>
                <Button type="button" variant="link" onClick={() => salvar.mutate(false)} disabled={salvar.isPending}>
                  Mudar o nome
                </Button>
              </div>
            ) : (
              <Button type="submit" className="w-full sm:w-64" disabled={!nomeTime.trim() || salvar.isPending}>
                Estou pronto <Check aria-hidden />
              </Button>
            )}
          </form>
        </section>

        <section aria-labelledby="titulo-convite" className="border-2 border-neutro-400 bg-white p-5">
          <h2 id="titulo-convite" className="rotulo mb-2">Chame a galera</h2>
          <p className="mb-4 text-sm text-neutro-700">
            Quem tiver o link entra, até sem conta. {grupo.visibilidade === "publico" ? "O grupo também aparece na lista de grupos abertos." : "O grupo é privado: não aparece na lista."}
          </p>
          <p className="mb-4 break-all border-2 border-gramado bg-papel p-3 font-mono text-sm" data-testid="link-grupo">
            {linkDoGrupo(codigo)}
          </p>
          <BotaoCompartilhar titulo={`Entra no meu grupo “${grupo.nome}” no Esquadrão Lendário!`} url={linkDoGrupo(codigo)} rotulo="Compartilhar convite" />

          {grupo.souModerador && (
            <form
              className="mt-6 space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                if (email.trim()) adicionar.mutate(undefined, { onSuccess: () => setEmail("") });
              }}
            >
              <Label htmlFor="email-convidado">Adicionar quem já tem conta (e-mail)</Label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input id="email-convidado" type="email" value={email} autoComplete="off" onChange={(e) => setEmail(e.target.value)} />
                <Button type="submit" variant="tinta" className="sm:w-40" disabled={!email.trim() || adicionar.isPending}>
                  Adicionar
                </Button>
              </div>
              {adicionar.isError && <Erro mensagem={mensagemErro(adicionar.error, "Não deu para adicionar.")} />}
              {adicionar.isSuccess && <p className="text-sm text-verde">Adicionado! A pessoa recebe um e-mail com o link.</p>}
            </form>
          )}
        </section>

        {grupo.souModerador ? (
          <section aria-labelledby="titulo-moderar" className="border-2 border-tinta bg-tinta p-5 text-papel">
            <h2 id="titulo-moderar" className="rotulo mb-2 text-verde-claro">Você modera este grupo</h2>
            <p className="text-sm text-neutro-300">
              Quando todo mundo estiver pronto, feche as inscrições: cada um monta o time e o torneio começa quando o último fechar.
            </p>
            <Button
              variant="contorno"
              className="mt-4 w-full border-neutro-300 text-papel hover:border-papel sm:w-72"
              disabled={visibilidade.isPending}
              onClick={() => visibilidade.mutate()}
            >
              {grupo.visibilidade === "publico" ? (
                <>
                  Tornar privado <Lock aria-hidden />
                </>
              ) : (
                <>
                  Tornar público <Globe aria-hidden />
                </>
              )}
            </Button>
            {comecar.isError && (
              <div className="mt-4 text-tinta">
                <Erro mensagem={mensagemErro(comecar.error, "Não deu para fechar as inscrições.")} />
              </div>
            )}
            <Button tamanho="grande" className="mt-4 w-full sm:w-96" disabled={faltam > 0 || comecar.isPending} onClick={() => comecar.mutate()}>
              Fechar inscrições <ArrowRight aria-hidden />
            </Button>
            {faltam > 0 && (
              <p className="mt-2 text-sm text-neutro-300">
                {faltam === 1 ? "Falta 1 membro ficar pronto" : `Faltam ${faltam} membros ficarem prontos`} (ou ser removido).
              </p>
            )}
          </section>
        ) : (
          <div>
            <p className="mb-2 text-neutro-700">Quem modera fecha as inscrições quando todo mundo estiver pronto.</p>
            {sair.isError && <Erro mensagem={mensagemErro(sair.error, "Não deu para sair.")} />}
            <Button variant="link" disabled={sair.isPending} onClick={() => window.confirm("Sair do grupo?") && sair.mutate()}>
              Sair do grupo
            </Button>
          </div>
        )}
      </div>
      <aside>
        <ListaMembros grupo={grupo} onRemover={grupo.souModerador ? (id) => remover.mutate(id) : undefined} removendo={remover.isPending} />
        {remover.isError && <Erro mensagem={mensagemErro(remover.error, "Não deu para remover.")} />}
      </aside>
    </div>
  );
}
