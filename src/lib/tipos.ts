// Contratos da API (esquadrao-lendario-api). A API calcula tudo; aqui só tipamos o que ela devolve.

export type Posicao = "GOL" | "ZAG" | "LAT" | "VOL" | "MEI" | "PON" | "ATA";
export type Estilo = "defensivo" | "equilibrado" | "ofensivo";
export type Fase = "grupo" | "dezesseis_avos" | "oitavas" | "quartas" | "semifinal" | "final";
export type StatusCampanha = "montagem" | "pronta" | "em_andamento" | "campea" | "eliminada";

export interface Usuario {
  id: string;
  nome: string | null;
  email: string | null;
  convidado: boolean;
}

export interface Sessao {
  token: string;
  usuario: Usuario;
}

export interface Competicao {
  slug: string;
  nome: string;
  descricao: string | null;
  formato: "mata_mata" | "grupos_mata_mata";
  jogosAteTitulo: number;
  totalElencos: number;
  disponivel: boolean;
}

export interface Vaga {
  codigo: string;
  posicao: Posicao;
  x: number;
  y: number;
}

export interface Formacao {
  codigo: string;
  vagas: Vaga[];
}

export interface ElencoResumo {
  id: string;
  temporada: number;
  rotulo: string;
  equipe: { nome: string; sigla: string; pais: string | null; corPrimaria: string; corSecundaria: string };
}

export interface JogadorEscalado {
  id: string;
  nome: string;
  posicao: Posicao;
  overall: number;
  overallEfetivo: number;
  encaixe: "principal" | "secundaria" | "improvisado";
  elenco: ElencoResumo | null;
}

export interface VagaCampanha extends Vaga {
  jogador: JogadorEscalado | null;
}

export interface JogadorSorteado {
  id: string;
  nome: string;
  posicao: Posicao;
  posicoesSecundarias: Posicao[];
  overall: number;
  vagasCompativeis: string[];
}

export interface PartidaCampanha {
  id: string;
  fase: Fase;
  rodada: number;
  adversario: ElencoResumo | null;
  simulada: boolean;
  golsPro: number | null;
  golsContra: number | null;
  prorrogacao: boolean;
  penaltisPro: number | null;
  penaltisContra: number | null;
  resultado: "V" | "E" | "D" | null;
  gols: Array<{ minuto: number; doSeuTime: boolean; jogadorId: string; jogadorNome: string }>;
  penaltis: Array<{ doSeuTime: boolean; jogadorNome: string; convertido: boolean }> | null;
}

export interface LinhaGrupo {
  posicao: number;
  time: { seuTime: boolean; elenco: ElencoResumo | null };
  jogos: number;
  vitorias: number;
  empates: number;
  derrotas: number;
  golsPro: number;
  golsContra: number;
  saldo: number;
  pontos: number;
  classificado: boolean;
}

export interface ResultadoCampanha {
  jogos: number;
  vitorias: number;
  empates: number;
  derrotas: number;
  golsPro: number;
  golsContra: number;
  campeao: boolean;
  faseEliminacao: Fase | null;
  finalizada: boolean;
}

export interface Artilheiro {
  jogadorId: string;
  nome: string;
  gols: number;
}

export interface Campanha {
  id: string;
  codigo: string;
  status: StatusCampanha;
  estilo: Estilo;
  resorteiosRestantes: number;
  competicao: { slug: string; nome: string; formato: Competicao["formato"]; jogosAteTitulo: number };
  formacao: { codigo: string; vagas: VagaCampanha[] };
  vagasPreenchidas: number;
  overallTime: number | null;
  sorteioPendente: { elenco: ElencoResumo | null; jogadores: JogadorSorteado[] } | null;
  grupo: { encerrado: boolean; classificacao: LinhaGrupo[] } | null;
  partidas: PartidaCampanha[];
  proximaPartida: PartidaCampanha | null;
  resultado: ResultadoCampanha;
  artilheiros: Artilheiro[];
  criadaEm: string;
  finalizadaEm: string | null;
}

export interface CampanhaResumo {
  id: string;
  codigo: string;
  status: StatusCampanha;
  formacao: string;
  estilo: Estilo;
  competicao: { slug: string | null; nome: string | null };
  criadaEm: string;
  finalizadaEm: string | null;
}

export type CampanhaPublica = Pick<
  Campanha,
  "codigo" | "status" | "estilo" | "competicao" | "formacao" | "overallTime" | "resultado" | "grupo" | "partidas" | "artilheiros"
>;
