import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Artigo, Secao } from "@/features/guia/artigo";

export const Route = createFileRoute("/perguntas-frequentes")({
  component: Perguntas,
});

const PERGUNTAS: Array<[string, string, ReactNode]> = [
  ["jogo", "O Esquadrão Lendário é grátis?", "Sim. O jogo é gratuito no navegador e no app, com anúncios discretos que nunca aparecem durante a montagem do time ou das partidas."],
  ["jogo", "Preciso criar conta para jogar?", "No navegador, não: você joga na hora, e a campanha vale enquanto a aba estiver aberta. Com conta, todas as campanhas ficam guardadas em “Minhas campanhas”. Se criar a conta no meio do jogo, a campanha vai junto. No app, a conta é obrigatória."],
  ["jogo", "Quanto tempo dura uma campanha?", "Poucos minutos. A montagem tem 11 sorteios e cada partida é revelada em cerca de quinze segundos, que você pode pular."],
  ["jogo", "Posso trocar um jogador depois de escalado?", "Não. A escolha é definitiva, como num draft de verdade. Antes de escolher, você pode trocar o time sorteado usando um dos três re-sorteios."],
  ["jogo", "O mesmo time campeão pode sair duas vezes?", "Não na mesma montagem. Um elenco que já saiu, mesmo que você o tenha descartado num re-sorteio, não volta até o fim daquela campanha."],
  ["jogo", "Por que meu time perdeu para um time mais fraco?", "Porque futebol tem zebra. A simulação favorece o time mais forte, mas o placar é sorteado a partir dos gols esperados. O guia sobre a simulação explica em detalhes."],
  ["base", "De onde vêm os jogadores e os overalls?", "A base reúne os elencos campeões de cada competição, um elenco por título. Os overalls seguem uma escala de 1 a 99 e são revisados pela nossa equipe; quem foi titular e decidiu a final costuma ter os maiores."],
  ["base", "Achei um jogador com overall injusto ou um campeão faltando. O que faço?", "Mande pelo Fale conosco, na página inicial. A base é revisada continuamente e as sugestões ajudam muito."],
  ["base", "Por que não aparecem escudos nem fotos?", "Escudos, logos de competições e fotos de jogadores têm dono. Por isso o jogo usa só os nomes, as cores e uma sigla em distintivos genéricos."],
  ["grupo", "Como funciona a campanha em grupo?", "Alguém com conta cria o grupo e chama os amigos pelo link ou pelo e-mail. Cada um dá nome ao time, fica pronto e monta o esquadrão. Depois, todos disputam o mesmo torneio de 32 times, completado com campeões sorteados."],
  ["grupo", "Quantas pessoas cabem num grupo?", "Até 32, uma por vaga da chave. Não há mínimo: as vagas que sobram recebem times campeões."],
  ["grupo", "E se um amigo sumir no meio do torneio?", "A fase só avança quando todos jogam, mas quem modera o grupo pode forçar o jogo travado ou remover o membro. O time removido continua no torneio, jogando sozinho."],
  ["conta", "Esqueci minha senha. E agora?", "Na tela de entrar, toque em “Esqueci minha senha”. Enviamos um código de 6 números para o seu e-mail e você cria uma senha nova."],
  ["conta", "Como peço para apagar meus dados?", "Escreva pelo Fale conosco, com o e-mail da conta. Os detalhes estão na política de privacidade."],
];

const BLOCOS: Array<[string, string]> = [
  ["jogo", "O jogo"],
  ["base", "Base de campeões"],
  ["grupo", "Campanha em grupo"],
  ["conta", "Conta e dados"],
];

function Perguntas() {
  return (
    <Artigo
      caminho="/perguntas-frequentes"
      rotulo="Ajuda"
      titulo="Perguntas frequentes"
      intro="As dúvidas mais comuns sobre o Esquadrão Lendário: como jogar, de onde vêm os craques, como funciona a campanha em grupo e como cuidamos da sua conta."
    >
      {BLOCOS.map(([chave, titulo]) => (
        <Secao key={chave} titulo={titulo}>
          <dl className="space-y-5">
            {PERGUNTAS.filter(([bloco]) => bloco === chave).map(([, pergunta, resposta]) => (
              <div key={pergunta}>
                <dt className="font-bold text-tinta">{pergunta}</dt>
                <dd className="mt-1">{resposta}</dd>
              </div>
            ))}
          </dl>
        </Secao>
      ))}
    </Artigo>
  );
}
