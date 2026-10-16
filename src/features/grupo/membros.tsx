import { Crown, UserMinus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Grupo, MembroGrupo } from "@/lib/tipos";
import { cn } from "@/lib/utils";

const NOME_MONTAGEM: Record<NonNullable<MembroGrupo["montagem"]>, string> = {
  nao_comecou: "Não começou",
  montando: "Montando",
  pronto: "Time fechado",
};

/** Who is in the group: team names only (never e-mails or account names). */
export function ListaMembros({ grupo, onRemover, removendo }: { grupo: Grupo; onRemover?: (id: string) => void; removendo?: boolean }) {
  return (
    <section aria-labelledby="titulo-membros">
      <h2 id="titulo-membros" className="rotulo mb-3">
        No grupo · {grupo.vagas.ocupadas} de {grupo.vagas.total}
      </h2>
      <ul className="divide-y-2 divide-gramado border-2 border-neutro-400 bg-white">
        {grupo.membros.map((m) => (
          <li key={m.id} className={cn("flex min-h-14 items-center gap-3 px-3 py-2", m.seuTime && "bg-verde-100")}>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2 font-semibold">
                {m.nomeTime ?? <span className="font-normal italic text-neutro-700">Sem nome ainda</span>}
                {m.moderador && <Crown className="size-4 text-verde" aria-label="Moderador" />}
                {m.seuTime && <span className="text-sm font-normal text-neutro-700">(você)</span>}
              </span>
            </span>
            {grupo.status === "inscricoes" &&
              (m.pronto ? <Badge variant="lendario">Pronto</Badge> : <Badge variant="eliminado">Aguardando</Badge>)}
            {grupo.status === "montagem" && m.montagem && (
              <Badge variant={m.montagem === "pronto" ? "lendario" : "eliminado"}>{NOME_MONTAGEM[m.montagem]}</Badge>
            )}
            {onRemover && !m.moderador && grupo.status !== "encerrado" && (
              <button
                type="button"
                className="inline-flex size-11 items-center justify-center text-neutro-700 hover:text-tinta disabled:opacity-50"
                aria-label={`Remover ${m.nomeTime ?? "membro"}`}
                disabled={removendo}
                onClick={() => {
                  const aviso =
                    grupo.status === "em_andamento"
                      ? `Remover ${m.nomeTime ?? "esse membro"}? O time continua na chave, jogando sozinho.`
                      : `Remover ${m.nomeTime ?? "esse membro"} do grupo?`;
                  if (window.confirm(aviso)) onRemover(m.id);
                }}
              >
                <UserMinus className="size-5" aria-hidden />
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
