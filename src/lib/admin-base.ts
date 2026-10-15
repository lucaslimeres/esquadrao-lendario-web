import type { JogadorAdmin } from "./admin-tipos";
import { NOME_POSICAO } from "./jogo";
import type { Posicao } from "./tipos";

export const POSICOES = Object.keys(NOME_POSICAO) as Posicao[];

export type DadosJogador = Omit<JogadorAdmin, "id" | "elencoId">;
export const jogadorVazio: DadosJogador = { nome: "", posicao: "ATA", posicoesSecundarias: [], overall: 75, ativo: true };
