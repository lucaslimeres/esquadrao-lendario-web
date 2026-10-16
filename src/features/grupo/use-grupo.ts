import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Grupo } from "@/lib/tipos";

export const chaveGrupo = (codigo: string) => ["grupo", codigo] as const;

/** Polls while something can change (others joining, drafting, playing). */
export function useGrupo(codigo: string) {
  return useQuery({
    queryKey: chaveGrupo(codigo),
    queryFn: () => api.grupo(codigo),
    refetchInterval: (q) => (q.state.data && q.state.data.status !== "encerrado" ? 3_000 : false),
  });
}

/** Every group action answers with the whole group: it replaces the cache directly. */
export function useAcaoGrupo<T = void>(codigo: string, acao: (variaveis: T) => Promise<Grupo>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: acao,
    onSuccess: (grupo) => {
      queryClient.setQueryData(chaveGrupo(codigo), grupo);
      queryClient.invalidateQueries({ queryKey: ["meus-grupos"] });
    },
  });
}
