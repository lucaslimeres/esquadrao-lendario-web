import { config } from "./config";
import type { Campanha, CampanhaPublica, CampanhaResumo, Competicao, Estilo, Formacao, Sessao, Usuario } from "./tipos";

/** Error coming from the API: `{ erro, codigo }` with a pt-BR message ready for the UI. */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly codigo: string | null,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** Message to show for any error: the API's pt-BR text, or a fallback. */
export function mensagemErro(erro: unknown, padrao = "Algo deu errado."): string {
  return erro instanceof ApiError ? erro.message : padrao;
}

type TokenProvider = () => string | null;
type UnauthorizedHandler = () => void;

let tokenAtual: TokenProvider = () => null;
let aoPerderSessao: UnauthorizedHandler = () => {};

/** Wired by the session store, so the client never imports it (no cycles). */
export function configurarAuth(token: TokenProvider, onUnauthorized: UnauthorizedHandler) {
  tokenAtual = token;
  aoPerderSessao = onUnauthorized;
}

interface Opcoes {
  method?: "GET" | "POST";
  body?: unknown;
  /** Override the session token (e.g. guest token during sign-up). */
  token?: string | null;
  autenticado?: boolean;
}

export async function request<T>(caminho: string, opcoes: Opcoes = {}): Promise<T> {
  const token = opcoes.token !== undefined ? opcoes.token : opcoes.autenticado === false ? null : tokenAtual();
  const headers: Record<string, string> = {};
  if (opcoes.body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  let resposta: Response;
  try {
    resposta = await fetch(`${config.apiUrl}${caminho}`, {
      method: opcoes.method ?? "GET",
      headers,
      body: opcoes.body !== undefined ? JSON.stringify(opcoes.body) : undefined,
    });
  } catch {
    throw new ApiError(0, "Sem conexão com o servidor. Confira sua internet e tente de novo.", "sem_conexao");
  }

  const corpo = resposta.status === 204 ? null : await resposta.json().catch(() => null);
  if (!resposta.ok) {
    if (resposta.status === 401 && token) aoPerderSessao();
    const mensagem = (corpo as { erro?: string } | null)?.erro ?? "Algo deu errado. Tente de novo.";
    throw new ApiError(resposta.status, mensagem, (corpo as { codigo?: string } | null)?.codigo ?? null);
  }
  return corpo as T;
}

export const api = {
  competicoes: () => request<Competicao[]>("/competicoes", { autenticado: false }),
  formacoes: () => request<Formacao[]>("/formacoes", { autenticado: false }),

  convidado: () => request<Sessao>("/auth/convidado", { method: "POST", autenticado: false }),
  login: (dados: { email: string; senha: string }) => request<Sessao>("/auth/login", { method: "POST", body: dados, autenticado: false }),
  /** With a guest token, the API turns that guest into the new account (keeps its campaigns). */
  cadastro: (dados: { nome: string; email: string; senha: string }, tokenConvidado: string | null) =>
    request<Sessao>("/auth/cadastro", { method: "POST", body: dados, token: tokenConvidado }),
  me: () => request<Usuario>("/me"),

  criarCampanha: (dados: { competicao: string; formacao: string; estilo: Estilo }) =>
    request<Campanha>("/campanhas", { method: "POST", body: dados }),
  campanhas: () => request<CampanhaResumo[]>("/campanhas"),
  campanha: (id: string) => request<Campanha>(`/campanhas/${id}`),
  sortear: (id: string) => request<Campanha>(`/campanhas/${id}/sorteio`, { method: "POST" }),
  resortear: (id: string) => request<Campanha>(`/campanhas/${id}/resorteio`, { method: "POST" }),
  escolher: (id: string, dados: { jogadorId: string; vaga: string }) =>
    request<Campanha>(`/campanhas/${id}/escolhas`, { method: "POST", body: dados }),
  iniciar: (id: string) => request<Campanha>(`/campanhas/${id}/iniciar`, { method: "POST" }),
  proximaPartida: (id: string) =>
    request<{ partida: Campanha["partidas"][number]; campanha: Campanha }>(`/campanhas/${id}/proxima-partida`, { method: "POST" }),
  compartilhada: (codigo: string) => request<CampanhaPublica>(`/compartilhar/${codigo}`, { autenticado: false }),
};
