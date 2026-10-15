import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Archive, ArrowRight, Inbox, Mail, Search, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";
import { BotaoExcluir } from "@/components/admin/confirmar";
import { CampoForm, Tabela, Textarea } from "@/components/admin/form";
import { CabecalhoAdmin } from "@/components/admin/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialogo } from "@/components/ui/dialog";
import { Carregando, Erro } from "@/components/ui/estados";
import { Input } from "@/components/ui/input";
import { adminApi } from "@/lib/admin-api";
import type { MensagemContato, StatusMensagem } from "@/lib/admin-tipos";
import { mensagemErro } from "@/lib/api";
import { cn } from "@/lib/utils";

const filtros = z.object({
  status: z.enum(["nova", "lida", "respondida", "arquivada"]).optional(),
  busca: z.string().optional(),
  pagina: z.number().int().min(1).optional(),
  /** Opens one message (the team e-mail links here with ?id=). */
  id: z.string().optional(),
});

export const Route = createFileRoute("/admin/_painel/mensagens")({
  validateSearch: filtros,
  component: Mensagens,
});

export const ROTULO_STATUS: Record<StatusMensagem, string> = { nova: "Nova", lida: "Lida", respondida: "Respondida", arquivada: "Arquivada" };
const quando = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" });

function SeloStatus({ status }: { status: StatusMensagem }) {
  const variante = { nova: "contorno", lida: "embreve", respondida: "avancou", arquivada: "eliminado" } as const;
  return <Badge variant={variante[status]}>{ROTULO_STATUS[status]}</Badge>;
}

function Mensagens() {
  const busca = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const [termo, setTermo] = useState(busca.busca ?? "");
  const pagina = busca.pagina ?? 1;
  const { data, isPending, isError, refetch, isFetching } = useQuery({
    queryKey: ["admin", "mensagens", { status: busca.status, busca: busca.busca, pagina }],
    queryFn: () => adminApi.mensagens({ status: busca.status, busca: busca.busca, pagina, porPagina: 20 }),
    placeholderData: keepPreviousData,
  });
  const filtrar = (patch: Partial<z.infer<typeof filtros>>) => navigate({ search: (s) => ({ ...s, ...patch, pagina: patch.pagina ?? 1 }) });
  const abrir = (id: string | undefined) => navigate({ search: (s) => ({ ...s, id }) });

  return (
    <>
      <CabecalhoAdmin rotulo="Fale conosco da landing page" titulo="Mensagens" />
      {data && (
        <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Filtrar por situação">
          {([undefined, "nova", "lida", "respondida", "arquivada"] as const).map((s) => (
            <button
              key={s ?? "todas"}
              type="button"
              aria-pressed={busca.status === s}
              onClick={() => filtrar({ status: s })}
              className={cn(
                "min-h-11 border-2 px-3 text-sm font-semibold",
                busca.status === s ? "border-tinta bg-tinta text-papel" : "border-neutro-400 bg-white hover:border-tinta",
              )}
            >
              {s ? ROTULO_STATUS[s] : "Todas"}
              {s && ` (${data.porStatus[s]})`}
            </button>
          ))}
        </div>
      )}
      <form
        className="mb-4 grid gap-3 sm:grid-cols-[1fr_auto]"
        onSubmit={(e) => {
          e.preventDefault();
          filtrar({ busca: termo.trim() || undefined });
        }}
      >
        <Input placeholder="Buscar por nome, e-mail ou assunto" value={termo} onChange={(e) => setTermo(e.target.value)} aria-label="Buscar" />
        <Button type="submit" variant="tinta" tamanho="pequeno" className="h-11">
          Buscar <Search aria-hidden />
        </Button>
      </form>

      {isPending && <Carregando />}
      {isError && <Erro mensagem="Não deu para carregar as mensagens." tentarDeNovo={() => refetch()} />}
      {data && (
        <>
          <p className="mb-2 text-sm text-neutro-700">
            {data.total} mensage{data.total === 1 ? "m" : "ns"}
            {isFetching ? " · atualizando…" : ""}
          </p>
          <Tabela>
            <thead>
              <tr>
                <th>Assunto</th>
                <th>De</th>
                <th>Situação</th>
                <th>Recebida</th>
                <th className="sr-only">Abrir</th>
              </tr>
            </thead>
            <tbody>
              {data.itens.map((m) => (
                <tr key={m.id} className={cn(m.status === "nova" && "font-semibold")}>
                  <td>
                    <span className="flex items-center gap-2">
                      {m.status === "nova" && <span className="size-2 shrink-0 bg-verde" aria-hidden />}
                      {m.assunto}
                    </span>
                  </td>
                  <td>
                    {m.nome}
                    <span className="block text-xs font-normal text-neutro-700">{m.email}</span>
                  </td>
                  <td>
                    <SeloStatus status={m.status} />
                  </td>
                  <td className="whitespace-nowrap font-normal">{quando.format(new Date(m.createdAt))}</td>
                  <td>
                    <Button variant="contorno" tamanho="pequeno" onClick={() => abrir(m.id)} aria-label={`Abrir mensagem: ${m.assunto}`}>
                      Abrir <ArrowRight aria-hidden />
                    </Button>
                  </td>
                </tr>
              ))}
              {data.itens.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-neutro-700">
                    <span className="flex items-center gap-2">
                      <Inbox className="size-5" aria-hidden /> Nenhuma mensagem por aqui.
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </Tabela>
          {data.paginas > 1 && (
            <div className="mt-4 flex items-center justify-between gap-3">
              <Button variant="contorno" tamanho="pequeno" disabled={pagina <= 1} onClick={() => filtrar({ pagina: pagina - 1 })}>
                Anterior
              </Button>
              <span className="text-sm">
                Página {pagina} de {data.paginas}
              </span>
              <Button variant="contorno" tamanho="pequeno" disabled={pagina >= data.paginas} onClick={() => filtrar({ pagina: pagina + 1 })}>
                Próxima
              </Button>
            </div>
          )}
        </>
      )}
      {busca.id && <DetalheMensagem id={busca.id} aoFechar={() => abrir(undefined)} />}
    </>
  );
}

function DetalheMensagem({ id, aoFechar }: { id: string; aoFechar: () => void }) {
  const queryClient = useQueryClient();
  const { data: m, isPending, isError } = useQuery({ queryKey: ["admin", "mensagem", id], queryFn: () => adminApi.mensagem(id) });
  const atualizar = (nova?: MensagemContato) => {
    if (nova) queryClient.setQueryData(["admin", "mensagem", id], nova);
    queryClient.invalidateQueries({ queryKey: ["admin", "mensagens"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
  };
  // The API marks a new message as read when it is opened: refresh list, counters and sidebar badge.
  const carregada = m?.id;
  useEffect(() => {
    if (!carregada) return;
    queryClient.invalidateQueries({ queryKey: ["admin", "mensagens"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
  }, [carregada, queryClient]);
  const [resposta, setResposta] = useState("");
  const responder = useMutation({ mutationFn: () => adminApi.responderMensagem(id, resposta), onSuccess: (r) => (setResposta(""), atualizar(r)) });
  const status = useMutation({ mutationFn: (s: "lida" | "arquivada" | "nova") => adminApi.statusMensagem(id, s), onSuccess: atualizar });

  return (
    <Dialogo aberto aoMudar={(v) => !v && aoFechar()} titulo={m?.assunto ?? "Mensagem"} descricao={m ? `${m.nome} · ${m.email}` : undefined}>
      {isPending && <Carregando />}
      {isError && <Erro mensagem="Mensagem não encontrada." />}
      {m && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2 text-sm text-neutro-700">
              <SeloStatus status={m.status} /> Recebida em {quando.format(new Date(m.createdAt))}
            </div>
            <p className="whitespace-pre-wrap border-l-4 border-verde bg-white p-3">{m.mensagem}</p>

            {m.resposta ? (
              <section>
                <p className="rotulo mb-1">
                  Resposta enviada{m.respondidaPor ? ` por ${m.respondidaPor.nome}` : ""}
                  {m.respondidaEm ? ` em ${quando.format(new Date(m.respondidaEm))}` : ""}
                </p>
                <p className="whitespace-pre-wrap border-l-4 border-tinta bg-white p-3">{m.resposta}</p>
              </section>
            ) : (
              <form
                className="space-y-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  responder.mutate();
                }}
              >
                {responder.error && <Erro mensagem={mensagemErro(responder.error)} />}
                <CampoForm rotulo={`Responder para ${m.email}`} dica="Vai por e-mail (Resend), com a mensagem original citada.">
                  {(campo) => <Textarea id={campo} required minLength={2} className="font-sans" value={resposta} onChange={(e) => setResposta(e.target.value)} />}
                </CampoForm>
                <Button type="submit" className="w-full" disabled={responder.isPending || resposta.trim().length < 2}>
                  {responder.isPending ? "Enviando…" : "Enviar resposta"} <Send aria-hidden />
                </Button>
              </form>
            )}

            <div className="flex flex-col gap-2 border-t-2 border-gramado pt-4 sm:flex-row sm:flex-wrap">
              {m.status !== "arquivada" ? (
                <Button variant="contorno" tamanho="pequeno" disabled={status.isPending} onClick={() => status.mutate("arquivada")}>
                  Arquivar <Archive aria-hidden />
                </Button>
              ) : (
                <Button variant="contorno" tamanho="pequeno" disabled={status.isPending} onClick={() => status.mutate("lida")}>
                  Desarquivar <Inbox aria-hidden />
                </Button>
              )}
              {m.status === "lida" && (
                <Button variant="contorno" tamanho="pequeno" disabled={status.isPending} onClick={() => status.mutate("nova")}>
                  Marcar como nova <Mail aria-hidden />
                </Button>
              )}
              <BotaoExcluir
                titulo="Excluir esta mensagem?"
                mensagem="Some do painel para sempre. Se for só para tirar da frente, arquive."
                aoConfirmar={() => adminApi.excluirMensagem(m.id)}
                aoConcluir={() => {
                  atualizar();
                  aoFechar();
                }}
              />
            </div>
          </div>
      )}
    </Dialogo>
  );
}
