import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Campanha } from "@/lib/tipos";

export const chaveCampanha = (id: string) => ["campanha", id] as const;

export function useCampanha(id: string) {
  return useQuery({ queryKey: chaveCampanha(id), queryFn: () => api.campanha(id) });
}

/** Every game action returns the full campaign state; it replaces the cache directly. */
export function useAcaoCampanha<T = void>(id: string, acao: (variaveis: T) => Promise<Campanha>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: acao,
    onSuccess: (campanha) => {
      queryClient.setQueryData(chaveCampanha(id), campanha);
      queryClient.invalidateQueries({ queryKey: ["campanhas"] });
    },
  });
}
