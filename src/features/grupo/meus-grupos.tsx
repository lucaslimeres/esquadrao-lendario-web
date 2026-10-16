import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Erro } from "@/components/ui/estados";
import { api } from "@/lib/api";
import { NOME_STATUS_GRUPO } from "@/lib/grupo";

/** The account's groups (Campanha em grupo), on the groups page and in "Minhas campanhas". */
export function MeusGrupos({ className = "mt-10", titulo = "Meus grupos" }: { className?: string; titulo?: string }) {
  const { data, isError, refetch } = useQuery({ queryKey: ["meus-grupos"], queryFn: api.meusGrupos });
  if (!data?.length && !isError) return null;
  return (
    <section aria-labelledby="titulo-meus" className={className}>
      <h2 id="titulo-meus" className="rotulo mb-3">{titulo}</h2>
      {isError && <Erro mensagem="Não deu para carregar seus grupos." tentarDeNovo={() => refetch()} />}
      <ul className="divide-y-2 divide-gramado border-2 border-neutro-400 bg-white">
        {data?.map((g) => (
          <li key={g.codigo}>
            <Link to="/grupos/$codigo" params={{ codigo: g.codigo }} className="flex items-center gap-4 p-4 hover:bg-gramado">
              <span className="min-w-0 flex-1">
                <span className="block font-bold">{g.nome}</span>
                <span className="text-sm text-neutro-700">
                  {g.competicao.nome}
                  {g.nomeTime ? ` · ${g.nomeTime}` : ""}
                </span>
              </span>
              {g.resultado === "campeao" ? (
                <Badge variant="lendario">Campeão</Badge>
              ) : g.resultado === "eliminado" ? (
                <Badge variant="eliminado">Eliminado</Badge>
              ) : (
                <Badge variant="contorno">{NOME_STATUS_GRUPO[g.status]}</Badge>
              )}
              <ArrowRight className="size-5 shrink-0" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

