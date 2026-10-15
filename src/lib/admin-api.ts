import { useAdminSessao } from "@/stores/admin-sessao";
import { ApiError } from "./api";
import type {
  Admin,
  CompeticaoAdmin,
  CompeticaoDetalhe,
  Dashboard,
  ElencoAdmin,
  ElencoDetalhe,
  EquipeAdmin,
  JogadorAdmin,
  Pagina,
  ResultadoImportacao,
  UsuarioAdmin,
  UsuarioDetalhe,
} from "./admin-tipos";
import { config } from "./config";

type Metodo = "GET" | "POST" | "PATCH" | "DELETE";

/** Client for /admin/* — uses only the admin token (separate from lib/api.ts on purpose). */
async function adminRequest<T>(metodo: Metodo, caminho: string, body?: unknown): Promise<T> {
  const token = useAdminSessao.getState().sessao?.token;
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  let resposta: Response;
  try {
    resposta = await fetch(`${config.apiUrl}${caminho}`, { method: metodo, headers, body: body !== undefined ? JSON.stringify(body) : undefined });
  } catch {
    throw new ApiError(0, "Sem conexão com a API.", "sem_conexao");
  }
  const texto = await resposta.text();
  const corpo = texto ? JSON.parse(texto) : null;
  if (!resposta.ok) {
    if (resposta.status === 401 && token) useAdminSessao.getState().sair();
    throw new ApiError(resposta.status, corpo?.erro ?? "Algo deu errado.", corpo?.codigo ?? null);
  }
  return corpo as T;
}

const qs = (params: Record<string, string | number | boolean | undefined>) => {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== "") p.set(k, String(v));
  const s = p.toString();
  return s ? `?${s}` : "";
};

export const adminApi = {
  login: (email: string, senha: string) => adminRequest<{ token: string; admin: Admin }>("POST", "/admin/login", { email, senha }),
  me: () => adminRequest<Admin>("GET", "/admin/me"),
  dashboard: () => adminRequest<Dashboard>("GET", "/admin/dashboard"),

  admins: () => adminRequest<Admin[]>("GET", "/admin/administradores"),
  criarAdmin: (d: { nome: string; email: string; senha: string }) => adminRequest<Admin>("POST", "/admin/administradores", d),
  atualizarAdmin: (id: string, d: Partial<{ nome: string; email: string; senha: string; ativo: boolean }>) =>
    adminRequest<Admin>("PATCH", `/admin/administradores/${id}`, d),
  excluirAdmin: (id: string) => adminRequest<null>("DELETE", `/admin/administradores/${id}`),

  usuarios: (f: { busca?: string; tipo?: string; ativo?: string; pagina?: number; porPagina?: number }) =>
    adminRequest<Pagina<UsuarioAdmin>>("GET", `/admin/usuarios${qs(f)}`),
  usuario: (id: string) => adminRequest<UsuarioDetalhe>("GET", `/admin/usuarios/${id}`),
  criarUsuario: (d: { nome: string; email: string; senha: string }) => adminRequest<UsuarioAdmin>("POST", "/admin/usuarios", d),
  atualizarUsuario: (id: string, d: Partial<{ nome: string; email: string; senha: string; ativo: boolean }>) =>
    adminRequest<UsuarioAdmin>("PATCH", `/admin/usuarios/${id}`, d),
  excluirUsuario: (id: string) => adminRequest<null>("DELETE", `/admin/usuarios/${id}`),

  competicoes: () => adminRequest<CompeticaoAdmin[]>("GET", "/admin/competicoes"),
  competicao: (id: string) => adminRequest<CompeticaoDetalhe>("GET", `/admin/competicoes/${id}`),
  criarCompeticao: (d: Partial<CompeticaoAdmin>) => adminRequest<CompeticaoAdmin>("POST", "/admin/competicoes", d),
  atualizarCompeticao: (id: string, d: Partial<CompeticaoAdmin>) => adminRequest<CompeticaoAdmin>("PATCH", `/admin/competicoes/${id}`, d),
  excluirCompeticao: (id: string) => adminRequest<null>("DELETE", `/admin/competicoes/${id}`),

  equipes: (busca?: string) => adminRequest<EquipeAdmin[]>("GET", `/admin/equipes${qs({ busca })}`),
  criarEquipe: (d: Omit<EquipeAdmin, "id" | "totalElencos">) => adminRequest<EquipeAdmin>("POST", "/admin/equipes", d),
  atualizarEquipe: (id: string, d: Partial<Omit<EquipeAdmin, "id" | "totalElencos">>) => adminRequest<EquipeAdmin>("PATCH", `/admin/equipes/${id}`, d),
  excluirEquipe: (id: string) => adminRequest<null>("DELETE", `/admin/equipes/${id}`),

  elenco: (id: string) => adminRequest<ElencoDetalhe>("GET", `/admin/elencos/${id}`),
  criarElenco: (d: { competicaoId: string; equipeId: string; temporada: number }) => adminRequest<ElencoAdmin>("POST", "/admin/elencos", d),
  atualizarElenco: (id: string, d: Partial<{ equipeId: string; temporada: number }>) => adminRequest<ElencoAdmin>("PATCH", `/admin/elencos/${id}`, d),
  excluirElenco: (id: string) => adminRequest<null>("DELETE", `/admin/elencos/${id}`),
  importarElenco: (conteudo: unknown) => adminRequest<ResultadoImportacao>("POST", "/admin/elencos/importar", conteudo),

  criarJogador: (elencoId: string, d: Omit<JogadorAdmin, "id" | "elencoId">) => adminRequest<JogadorAdmin>("POST", `/admin/elencos/${elencoId}/jogadores`, d),
  atualizarJogador: (id: string, d: Partial<Omit<JogadorAdmin, "id" | "elencoId">>) => adminRequest<JogadorAdmin>("PATCH", `/admin/jogadores/${id}`, d),
  excluirJogador: (id: string) => adminRequest<null>("DELETE", `/admin/jogadores/${id}`),
};
