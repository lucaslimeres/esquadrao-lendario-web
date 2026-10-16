/** The editorial guide pages: also listed in the footer, the sitemap and the prerender. */
export const GUIAS = [
  { to: "/como-jogar", titulo: "Como jogar", resumo: "Do sorteio do primeiro craque ao apito final da decisão, passo a passo." },
  { to: "/posicoes-e-formacoes", titulo: "Posições e formações", resumo: "As 10 posições do jogo, as 6 formações e como escolher a vaga certa." },
  { to: "/como-funciona-a-simulacao", titulo: "Como a partida é simulada", resumo: "Força por setor, gols esperados, zebras, prorrogação e pênaltis." },
  { to: "/perguntas-frequentes", titulo: "Perguntas frequentes", resumo: "Conta, campanhas, campanha em grupo, base de campeões e mais." },
  { to: "/sobre", titulo: "Sobre o Esquadrão Lendário", resumo: "De onde veio a ideia, como a base de campeões é montada e quem faz." },
] as const;

export type CaminhoGuia = (typeof GUIAS)[number]["to"];
