import { config } from "./config";
import type { Campanha, CampanhaPublica, CampanhaResumo, Competicao, Estilo, FinalidadeCodigo, Formacao, Grupo, GrupoAberto, MeuGrupo, Sessao, Usuario, Visibilidade } from "./tipos";

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
  method?: "GET" | "POST" | "PATCH" | "DELETE";
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
  /** Creates the account and e-mails a 6-digit code; the session only comes with `confirmarEmail`. */
  cadastro: (dados: { nome: string; email: string; senha: string }) =>
    request<{ email: string; confirmacaoPendente: true }>("/auth/cadastro", { method: "POST", body: dados, autenticado: false }),
  /** With a guest token, the API moves that guest's campaigns to the account. */
  confirmarEmail: (dados: { email: string; codigo: string }, tokenConvidado: string | null) =>
    request<Sessao>("/auth/confirmar-email", { method: "POST", body: dados, token: tokenConvidado }),
  reenviarCodigo: (dados: { email: string; finalidade: FinalidadeCodigo }) =>
    request<{ enviado: true }>("/auth/reenviar-codigo", { method: "POST", body: dados, autenticado: false }),
  esqueciSenha: (email: string) => request<{ enviado: true }>("/auth/esqueci-senha", { method: "POST", body: { email }, autenticado: false }),
  verificarCodigo: (dados: { email: string; codigo: string }) =>
    request<{ valido: true }>("/auth/verificar-codigo", { method: "POST", body: dados, autenticado: false }),
  redefinirSenha: (dados: { email: string; codigo: string; senha: string }) =>
    request<Sessao>("/auth/redefinir-senha", { method: "POST", body: dados, autenticado: false }),
  me: () => request<Usuario>("/me"),
  /** Deletes the account for good (asks for the password again). */
  excluirConta: (senha: string) => request<{ excluida: true }>("/me/excluir", { method: "POST", body: { senha } }),

  criarCampanha: (dados: { competicao: string; formacao: string; estilo: Estilo }) =>
    request<Campanha>("/campanhas", { method: "POST", body: dados }),
  campanhas: () => request<CampanhaResumo[]>("/campanhas"),
  campanha: (id: string) => request<Campanha>(`/campanhas/${id}`),
  sortear: (id: string) => request<Campanha>(`/campanhas/${id}/sorteio`, { method: "POST" }),
  resortear: (id: string) => request<Campanha>(`/campanhas/${id}/resorteio`, { method: "POST" }),
  escolher: (id: string, dados: { jogadorId: string; vaga: string }) =>
    request<Campanha>(`/campanhas/${id}/escolhas`, { method: "POST", body: dados }),
  /** Blank name keeps "Seu esquadrão". */
  iniciar: (id: string, nomeTime?: string) => request<Campanha>(`/campanhas/${id}/iniciar`, { method: "POST", body: { nomeTime: nomeTime?.trim() || null } }),
  proximaPartida: (id: string) =>
    request<{ partida: Campanha["partidas"][number]; campanha: Campanha }>(`/campanhas/${id}/proxima-partida`, { method: "POST" }),
  compartilhada: (codigo: string) => request<CampanhaPublica>(`/compartilhar/${codigo}`, { autenticado: false }),
  // Campanha em grupo
  gruposAbertos: (competicao?: string) =>
    request<GrupoAberto[]>(`/grupos/abertos${competicao ? `?competicao=${encodeURIComponent(competicao)}` : ""}`, { autenticado: false }),
  meusGrupos: () => request<MeuGrupo[]>("/grupos"),
  /** Token optional: without it (or not a member) it is just the lobby. */
  grupo: (codigo: string) => request<Grupo>(`/grupos/${encodeURIComponent(codigo)}`),
  criarGrupo: (dados: { nome: string; competicao: string; visibilidade: Visibilidade; nomeTime?: string | null }) =>
    request<Grupo>("/grupos", { method: "POST", body: dados }),
  configurarGrupo: (codigo: string, dados: { nome?: string; visibilidade?: Visibilidade }) =>
    request<Grupo>(`/grupos/${codigo}`, { method: "PATCH", body: dados }),
  entrarNoGrupo: (codigo: string) => request<Grupo>(`/grupos/${encodeURIComponent(codigo)}/entrar`, { method: "POST" }),
  sairDoGrupo: (codigo: string) => request<{ saiu: true }>(`/grupos/${codigo}/sair`, { method: "POST" }),
  adicionarAoGrupo: (codigo: string, email: string) => request<Grupo>(`/grupos/${codigo}/membros`, { method: "POST", body: { email } }),
  removerDoGrupo: (codigo: string, membroId: string) => request<Grupo>(`/grupos/${codigo}/membros/${membroId}`, { method: "DELETE" }),
  meuTimeNoGrupo: (codigo: string, dados: { nomeTime?: string | null; pronto?: boolean }) =>
    request<Grupo>(`/grupos/${codigo}/meu-time`, { method: "PATCH", body: dados }),
  comecarMontagemDoGrupo: (codigo: string) => request<Grupo>(`/grupos/${codigo}/montagem`, { method: "POST" }),
  montarTimeDoGrupo: (codigo: string, dados: { formacao: string; estilo: Estilo }) =>
    request<{ campanhaId: string }>(`/grupos/${codigo}/meu-time/montar`, { method: "POST", body: dados }),
  jogarNoGrupo: (codigo: string) => request<Grupo>(`/grupos/${codigo}/jogar`, { method: "POST" }),
  forcarJogo: (codigo: string, partidaId: string) => request<Grupo>(`/grupos/${codigo}/partidas/${partidaId}/forcar`, { method: "POST" }),
  /** "Fale conosco". `site` is the hidden honeypot field (bots fill it, people don't). */
  enviarContato: (dados: { nome: string; email: string; assunto: string; mensagem: string; site?: string }) =>
    request<{ recebida: true }>("/contato", { method: "POST", body: dados, autenticado: false }),
};
