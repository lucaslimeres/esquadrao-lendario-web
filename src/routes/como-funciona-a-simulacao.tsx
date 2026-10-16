import { createFileRoute } from "@tanstack/react-router";
import { Artigo, Lista, Secao } from "@/features/guia/artigo";

export const Route = createFileRoute("/como-funciona-a-simulacao")({
  component: Simulacao,
});

function Simulacao() {
  return (
    <Artigo
      caminho="/como-funciona-a-simulacao"
      rotulo="Guia"
      titulo="Como a partida é simulada"
      intro="Cada jogo do Esquadrão Lendário é decidido por uma simulação baseada no overall dos jogadores, com uma dose de sorte. O time mais forte vence mais vezes, mas a zebra existe, como no futebol de verdade. Aqui explicamos, sem segredos, como o placar é calculado."
    >
      <Secao titulo="Tudo acontece no servidor">
        <p>
          A partida é simulada no servidor do jogo, não no seu celular ou navegador. Assim o resultado é oficial: ninguém consegue alterar um
          placar, e o mesmo resultado aparece para todo mundo, inclusive no link compartilhado e na campanha em grupo. O que você vê minuto
          a minuto é só a revelação de um jogo que já aconteceu, feita com calma para dar suspense.
        </p>
      </Secao>

      <Secao titulo="1. A força de cada setor">
        <p>
          Primeiro, o jogo calcula o overall efetivo de cada jogador: o overall cheio na posição de origem, um pouco menos numa posição
          secundária. Com isso, monta três forças por time: ataque, meio-campo e defesa, cada uma somando a contribuição das posições que
          atuam naquele setor. O goleiro entra à parte. O estilo também conta: o ofensivo multiplica o ataque por 1,05 e a defesa por 0,95,
          e o defensivo faz o inverso.
        </p>
      </Secao>

      <Secao titulo="2. Gols esperados">
        <p>
          O ataque de um time, apoiado pelo meio-campo, é comparado com a proteção do adversário (defesa, meio e goleiro). Dessa diferença
          sai o número de gols esperados de cada lado. A base é de cerca de 1,35 gol por jogo para times iguais, e a vantagem cresce de forma
          exponencial: com dez pontos de diferença, o time mais forte espera marcar cerca de duas vezes mais gols que o outro.
        </p>
      </Secao>

      <Secao titulo="3. O placar">
        <p>
          Os gols esperados não viram o placar diretamente. O número de gols de cada time é sorteado por uma distribuição de Poisson, a
          mesma usada por estatísticos para modelar placares de futebol. Por isso um time que espera 1,8 gol pode marcar zero, um, dois ou
          quatro, com probabilidades diferentes. É daí que vêm as zebras.
        </p>
      </Secao>

      <Secao titulo="4. Quem marca">
        <p>
          Para cada gol, o autor é sorteado entre os jogadores de linha, com pesos por posição: centroavantes têm o maior peso, seguidos
          das pontas, do meia ofensivo, dos meio-campistas, dos volantes, dos laterais e, por último, dos zagueiros. O peso ainda é
          multiplicado pelo overall do jogador, então um atacante lendário marca bem mais do que um atacante bronze. Goleiro não marca. Cada
          gol recebe um minuto sorteado entre 1 e 90 (ou entre 91 e 120, na prorrogação).
        </p>
      </Secao>

      <Secao titulo="5. Prorrogação e pênaltis">
        <Lista
          itens={[
            "Na fase de grupos, empate é empate: um ponto para cada lado.",
            "No mata-mata, empate leva a 30 minutos de prorrogação, com um terço dos gols esperados de um jogo normal.",
            "Se continuar empatado, vêm os pênaltis: cinco cobranças alternadas, com fim antecipado quando um lado não tem mais como alcançar, e depois cobranças alternadas até alguém errar.",
            "A chance de cada cobrança é de 76%, ajustada pela diferença entre o batedor e o goleiro, sempre entre 55% e 92%.",
          ]}
        />
      </Secao>

      <Secao titulo="O que isso significa na prática">
        <p>
          Montar um time forte aumenta muito as chances de título, mas não garante. Um esquadrão de overall 88 vence a maioria dos jogos
          contra um de 80, e mesmo assim pode cair numa disputa de pênaltis. É essa mistura de estratégia na montagem e emoção na partida
          que faz cada campanha ser diferente.
        </p>
      </Secao>
    </Artigo>
  );
}
