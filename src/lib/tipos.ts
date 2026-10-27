// Contratos da API (esquadrao-lendario-api). A API calcula tudo; aqui só tipamos o que ela devolve.

export type Posicao = "GK" | "CB" | "LB" | "RB" | "CDM" | "CM" | "CAM" | "LW" | "RW" | "ST";
export type Estilo = "defensivo" | "equilibrado" | "ofensivo";
export type Fase = "grupo" | "dezesseis_avos" | "oitavas" | "quartas" | "semifinal" | "final";
export type StatusCampanha = "montagem" | "pronta" | "em_andamento" | "campea" | "eliminada";

export interface Usuario {
  id: string;
  nome: string | null;
  email: string | null;
  convidado: boolean;
  emailConfirmado: boolean;
}

/** 6-digit code by e-mail: sign-up confirmation or password reset. */
export type FinalidadeCodigo = "confirmar_email" | "redefinir_senha";

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
  /** Null for a group member's team (it has no champion season). */
  temporada: number | null;
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

/** Shown when the player didn't name the squad (the API already applies it; kept for older responses). */
export const NOME_TIME_PADRAO = "Seu esquadrão";

export interface Campanha {
  id: string;
  codigo: string;
  status: StatusCampanha;
  estilo: Estilo;
  /** Squad name chosen when the campaign started ("Seu esquadrão" when none). */
  nomeTime: string;
  /** Campanha em grupo: this is a member's draft for that group (null = solo campaign). */
  torneio?: { codigo: string; nome: string } | null;
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
  /** Squad name chosen when the campaign started ("Seu esquadrão" when none). */
  nomeTime: string;
  competicao: { slug: string | null; nome: string | null };
  criadaEm: string;
  finalizadaEm: string | null;
}

export type CampanhaPublica = Pick<
  Campanha,
  "codigo" | "status" | "estilo" | "nomeTime" | "competicao" | "formacao" | "overallTime" | "resultado" | "grupo" | "partidas" | "artilheiros"
>;

// ───────────────────────── Campanha em grupo ─────────────────────────

export type StatusGrupo = "inscricoes" | "montagem" | "em_andamento" | "encerrado";
export type Visibilidade = "publico" | "privado";

/** A slot of the 32-team bracket: a member's team or a champion squad (same badge shape). */
export interface TimeGrupo {
  id: string;
  grupo: string | null;
  eliminado: boolean;
  seuTime: boolean;
  membro: boolean;
  nome: string;
  elenco: ElencoResumo | null;
}

/** A group match from a neutral point of view (A × B). `naPerspectiva` turns it into the player's. */
export interface PartidaGrupo {
  id: string;
  fase: Fase;
  rodada: number;
  grupo: string | null;
  timeA: TimeGrupo | null;
  timeB: TimeGrupo | null;
  prontoA: boolean;
  prontoB: boolean;
  simulada: boolean;
  simuladaEm: string | null;
  golsA: number | null;
  golsB: number | null;
  prorrogacao: boolean;
  penaltisA: number | null;
  penaltisB: number | null;
  vencedor: "a" | "b" | "empate" | null;
  gols: Array<{ minuto: number; lado: "a" | "b"; jogadorId: string; jogadorNome: string }>;
  penaltis: Array<{ lado: "a" | "b"; jogadorNome: string; convertido: boolean }> | null;
}

export interface LinhaGrupoTorneio extends Omit<LinhaGrupo, "time"> {
  time: TimeGrupo | null;
}

export interface MembroGrupo {
  id: string;
  nomeTime: string | null;
  pronto: boolean;
  convidado: boolean;
  moderador: boolean;
  seuTime: boolean;
  montagem: "nao_comecou" | "montando" | "pronto" | null;
}

export interface Grupo {
  codigo: string;
  nome: string;
  visibilidade: Visibilidade;
  status: StatusGrupo;
  faseAtual: Fase | null;
  competicao: Campanha["competicao"];
  /** Server clock, to line up the live match with `simuladaEm`. */
  agora: string;
  souMembro: boolean;
  souModerador: boolean;
  meuMembro: { id: string; nomeTime: string | null; pronto: boolean; campanha: { id: string; status: StatusCampanha } | null } | null;
  membros: MembroGrupo[];
  vagas: { total: number; ocupadas: number };
  visaoCompleta: boolean;
  meuTime: TimeGrupo | null;
  campeao: TimeGrupo | null;
  proximaPartida: (PartidaGrupo & { situacao: "jogar" | "aguardando_adversario" | "adversario_pronto" }) | null;
  aguardandoFase: boolean;
  progressoFase: { jogos: number; jogados: number } | null;
  grupos: Array<{ letra: string; encerrado: boolean; classificacao: LinhaGrupoTorneio[] }>;
  partidas: PartidaGrupo[];
  pendentes: Array<{ id: string; fase: Fase; timeA: string; timeB: string; prontoA: boolean; prontoB: boolean }>;
  criadoEm: string;
  iniciadoEm: string | null;
  encerradoEm: string | null;
}

export interface GrupoAberto {
  codigo: string;
  nome: string;
  competicao: { slug: string | null; nome: string | null };
  membros: number;
  vagas: number;
  criadoEm: string;
}

export interface MeuGrupo {
  codigo: string;
  nome: string;
  status: StatusGrupo;
  nomeTime: string | null;
  moderador: boolean;
  competicao: { slug: string | null; nome: string | null };
  resultado: "campeao" | "eliminado" | null;
  criadoEm: string;
  encerradoEm: string | null;
}

// ───────────────────────── Galeria de campeões e estatísticas ─────────────────────────

export type EquipeGaleria = ElencoResumo["equipe"];

export interface TituloResumo {
  temporada: number;
  equipe: EquipeGaleria;
  overallTime: number | null;
  totalJogadores: number;
  craque: { nome: string; posicao: Posicao; overall: number } | null;
  vezesSorteado: number;
}

export interface Galeria {
  resumo: { titulos: number; equipes: number; jogadores: number; maioresCampeoes: Array<{ nome: string; titulos: number }> };
  competicoes: Array<{ slug: string; nome: string; descricao: string | null; formato: Competicao["formato"]; titulos: TituloResumo[] }>;
}

export interface TituloGaleria {
  competicao: { slug: string; nome: string; descricao: string | null; formato: Competicao["formato"] };
  temporada: number;
  equipe: EquipeGaleria;
  jogadores: Array<{ nome: string; posicao: Posicao; posicoesSecundarias: Posicao[]; overall: number; vezesEscalado: number }>;
  melhorXI: { formacao: string; overall: number | null; escalacao: Array<{ vaga: string; posicao: Posicao; nome: string; overall: number; overallEfetivo: number }> };
  ranking: { posicao: number; total: number; mediaOverall: number };
  uso: { vezesSorteado: number; vezesEscalados: number; maisEscolhidos: Array<{ nome: string; posicao: Posicao; overall: number; vezesEscalado: number }> };
  anterior: { temporada: number; equipe: string } | null;
  proximo: { temporada: number; equipe: string } | null;
  outrosTitulos: Array<{ competicao: { slug: string; nome: string }; temporada: number }>;
}

export interface LinhaEstatistica {
  chave: string;
  campanhas: number;
  titulos: number;
  /** Percent, one decimal (null without finished campaigns). */
  taxaDeTitulo: number | null;
}

export interface JogadorDestaque {
  nome: string;
  posicao: Posicao;
  overall: number;
  total: number;
  titulo: { competicao: { slug: string; nome: string }; temporada: number; equipe: string };
}

export interface Estatisticas {
  atualizadoEm: string;
  campanhas: { total: number; finalizadas: number; titulos: number; taxaDeTitulo: number | null };
  porCompeticao: Array<LinhaEstatistica & { nome: string }>;
  porFormacao: LinhaEstatistica[];
  porEstilo: LinhaEstatistica[];
  maisEscalados: JogadorDestaque[];
  artilheiros: JogadorDestaque[];
}
