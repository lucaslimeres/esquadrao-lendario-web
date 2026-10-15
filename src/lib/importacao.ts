import type { StatusImportacao, StatusItemImportacao } from "./admin-tipos";

/** Chosen sources, in priority order (the first one wins when sources disagree). */
export function alternarFonte(escolhidas: string[], id: string): string[] {
  return escolhidas.includes(id) ? escolhidas.filter((x) => x !== id) : [...escolhidas, id];
}

export function moverFonte(escolhidas: string[], id: string, delta: -1 | 1): string[] {
  const i = escolhidas.indexOf(id);
  const j = i + delta;
  if (i === -1 || j < 0 || j >= escolhidas.length) return escolhidas;
  const copia = [...escolhidas];
  [copia[i], copia[j]] = [copia[j]!, copia[i]!];
  return copia;
}

export const ROTULO_STATUS_IMPORTACAO: Record<StatusImportacao, string> = {
  pendente: "Na fila",
  processando: "Buscando",
  concluida: "Concluída",
  falhou: "Falhou",
};

export const ROTULO_STATUS_ITEM: Record<StatusItemImportacao, string> = {
  rascunho: "Rascunho",
  sem_dados: "Sem elenco",
  publicado: "Publicado",
  descartado: "Descartado",
};

export const emAndamento = (status: StatusImportacao) => status === "pendente" || status === "processando";

/** Draft warnings that block publishing (prefixed by the API). */
export const bloqueiaPublicacao = (aviso: string) => aviso.startsWith("Para publicar");
