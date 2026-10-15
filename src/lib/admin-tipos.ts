// Contratos das rotas /admin/* da API.
import type { Posicao } from "./tipos";

export interface Admin {
  id: string;
  nome: string;
  email: string;
  ativo: boolean;
  ultimoLoginEm: string | null;
  criadoEm: string;
}

export interface Dashboard {
  usuarios: { contas: number; inativos: number; contasNovas7d: number };
  campanhas: {
    total: number;
    emAndamento: number;
    campeas: number;
    eliminadas: number;
    ultimos7d: number;
    /** Played without an account (guests are not stored as users). */
    semConta: number;
    taxaTitulo: number | null;
    porFormacao: Array<{ formacao: string; total: number }>;
  };
  base: { equipes: number; elencos: number; jogadoresAtivos: number };
  admins: { ativos: number };
  competicoes: Array<{
    id: string;
    slug: string;
    nome: string;
    ativa: boolean;
    disponivel: boolean;
    elencos: number;
    elencosCompletos: number;
    minimoElencos: number;
    jogadores: number;
    campanhas: number;
  }>;
}

export interface UsuarioAdmin {
  id: string;
  nome: string | null;
  email: string | null;
  ativo: boolean;
  createdAt: string;
  totalCampanhas: number;
  ultimaCampanhaEm: string | null;
}

export interface UsuarioDetalhe extends UsuarioAdmin {
  campanhas: Array<{ id: string; codigo: string; competicao: string | null; formacao: string; status: string; criadaEm: string; finalizadaEm: string | null }>;
}

export interface Pagina<T> {
  itens: T[];
  total: number;
  pagina: number;
  porPagina: number;
  paginas: number;
}

export type Formato = "mata_mata" | "grupos_mata_mata";

export interface CompeticaoAdmin {
  id: string;
  slug: string;
  nome: string;
  descricao: string | null;
  formato: Formato;
  ativa: boolean;
  ordem: number;
  totalElencos: number;
  elencosCompletos: number;
  totalJogadores: number;
  totalCampanhas: number;
  jogosAteTitulo: number;
  minimoElencos: number;
  disponivel: boolean;
}

export interface EquipeAdmin {
  id: string;
  nome: string;
  sigla: string;
  pais: string | null;
  corPrimaria: string;
  corSecundaria: string;
  totalElencos: number;
}

export interface ElencoAdmin {
  id: string;
  competicaoId: string;
  temporada: number;
  rotulo: string;
  equipe: Omit<EquipeAdmin, "totalElencos">;
  totalJogadores: number;
  jogadoresAtivos: number;
  goleirosAtivos: number;
  completo: boolean;
}

export interface JogadorAdmin {
  id: string;
  elencoId: string;
  nome: string;
  posicao: Posicao;
  posicoesSecundarias: Posicao[];
  overall: number;
  ativo: boolean;
}

export interface CompeticaoDetalhe extends CompeticaoAdmin {
  elencos: ElencoAdmin[];
}

export interface ElencoDetalhe extends ElencoAdmin {
  usadoEmCampanhas: number;
  jogadores: JogadorAdmin[];
}

export interface ResultadoImportacao {
  elencoId: string;
  criado: boolean;
  jogadoresInseridos: number;
  jogadoresAtualizados: number;
  jogadoresDesativados: number;
}

// ── Importação automática (fontes gratuitas) ──
export interface FonteImportacao {
  id: string;
  nome: string;
  /** Why it can't be used now (e.g. Highlightly without a key); null = available. */
  indisponivel: string | null;
}

export type StatusImportacao = "pendente" | "processando" | "concluida" | "falhou";
export type StatusItemImportacao = "rascunho" | "sem_dados" | "publicado" | "descartado";

export interface Importacao {
  id: string;
  competicaoId: string;
  fontesCampeoes: string[];
  fontesElencos: string[];
  paginaWikipedia: string;
  ligaHighlightly: string | null;
  anoInicio: number;
  anoFim: number;
  status: StatusImportacao;
  totalItens: number;
  itensProcessados: number;
  erro: string | null;
  concluidaEm: string | null;
  createdAt: string;
  itensPorStatus: Partial<Record<StatusItemImportacao, number>>;
}

/** Same format as the JSON in data/elencos/ (without the competition). */
export interface DadosRascunho {
  temporada: number;
  equipe: { nome: string; sigla: string; pais: string | null; corPrimaria: string; corSecundaria: string };
  jogadores: Array<{ nome: string; posicao: Posicao; secundarias: Posicao[]; overall: number }>;
}

export interface ItemImportacao {
  id: string;
  importacaoId: string;
  temporada: number;
  status: StatusItemImportacao;
  dados: DadosRascunho;
  avisos: string[];
  referencias: Array<{ fonte: string; url: string }>;
  elencoId: string | null;
}

export interface ImportacaoDetalhe extends Importacao {
  itens: ItemImportacao[];
}

export interface NovaImportacao {
  competicaoId: string;
  anoInicio: number;
  anoFim: number;
  fontesCampeoes: string[];
  fontesElencos: string[];
  paginaWikipedia?: string;
  ligaHighlightly?: string;
}
