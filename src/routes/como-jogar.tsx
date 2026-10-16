import { createFileRoute, Link } from "@tanstack/react-router";
import { Artigo, Lista, Secao } from "@/features/guia/artigo";

export const Route = createFileRoute("/como-jogar")({
  component: ComoJogar,
});

const link = "font-semibold text-verde underline underline-offset-4";

function ComoJogar() {
  return (
    <Artigo
      caminho="/como-jogar"
      rotulo="Guia"
      titulo="Como jogar"
      intro="O Esquadrão Lendário é um jogo de futebol de poucos minutos: você monta um time de 11 com craques de times campeões da história, um sorteio por vaga, e depois leva esse time para disputar uma competição inteira, com fase de grupos, mata-mata, prorrogação e pênaltis. Este guia explica cada etapa, do primeiro sorteio ao apito final."
    >
      <Secao titulo="1. Escolha a competição">
        <p>
          Tudo começa pela competição. Ela define três coisas: de quais times campeões saem os jogadores que você vai sortear, quem
          serão os adversários e qual é o formato da disputa. Na Libertadores, por exemplo, o sorteio só traz elencos que ganharam a
          Libertadores, e todos os adversários também são campeões do torneio. Na Copa do Brasil, vale o mesmo para os campeões da
          copa nacional.
        </p>
        <p>
          Cada competição usa um de dois formatos. Na <strong>fase de grupos + mata-mata</strong>, o seu time entra num grupo de quatro,
          joga três partidas e precisa terminar entre os dois primeiros para chegar às oitavas; depois vêm quartas, semifinal e final,
          sete jogos no total. No <strong>mata-mata puro</strong>, são cinco jogos eliminatórios, dos dezesseis-avos à final: perdeu,
          está fora.
        </p>
      </Secao>

      <Secao titulo="2. Defina a formação e o estilo">
        <p>
          A formação decide as 11 vagas do seu campo: quantos zagueiros, laterais, volantes, meias, pontas e atacantes o time terá. São
          seis opções (4-4-2, 4-3-3, 4-2-3-1, 3-5-2, 3-4-3 e 5-3-2). Cada uma muda o tipo de jogador que você vai procurar nos sorteios e
          o equilíbrio entre ataque, meio e defesa. O guia de{" "}
          <Link to="/posicoes-e-formacoes" className={link}>
            posições e formações
          </Link>{" "}
          detalha cada uma.
        </p>
        <p>
          O estilo de jogo é um ajuste fino. O <strong>ofensivo</strong> aumenta um pouco a força do ataque e diminui a da defesa; o{" "}
          <strong>defensivo</strong> faz o contrário; o <strong>equilibrado</strong> não mexe em nada. É uma escolha que combina com o elenco
          que você pretende montar: um time cheio de atacantes lendários tende a aproveitar melhor o estilo ofensivo.
        </p>
      </Secao>

      <Secao titulo="3. Sorteie e escolha os craques">
        <p>
          A montagem tem 11 rodadas, uma por vaga. Em cada rodada o jogo sorteia um elenco campeão, como o São Paulo de 2005 ou o Boca
          Juniors de 2000, e mostra os jogadores dele, do goleiro ao atacante. Você escolhe um jogador e a vaga onde ele vai jogar. O jogo
          só deixa escalar quem cabe naquela vaga: um zagueiro não vira centroavante.
        </p>
        <Lista
          itens={[
            <>
              <strong>Posição de origem:</strong> o jogador entra com o overall cheio.
            </>,
            <>
              <strong>Posição secundária:</strong> ele também pode jogar, mas rende um pouco menos (o overall cai cerca de 7%).
            </>,
            <>
              <strong>Re-sorteios:</strong> não gostou do time que caiu? Você tem três trocas por campanha. Use com cuidado: a vaga mais
              difícil de preencher costuma ser a última.
            </>,
            <>
              <strong>Sem repetição:</strong> o mesmo elenco nunca sai duas vezes na mesma montagem, nem o que você descartou num
              re-sorteio. E se cair um time sem ninguém para as vagas que faltam, o jogo sorteia outro sozinho, sem gastar re-sorteio.
            </>,
          ]}
        />
        <p>
          Cada jogador tem um overall de 1 a 99, que também define a raridade da carta: bronze até 74, prata de 75 a 82, ouro de 83 a 88 e
          lendário a partir de 89. O overall do time é a média dos 11 escalados.
        </p>
      </Secao>

      <Secao titulo="4. Dê um nome ao time e comece a campanha">
        <p>
          Com o time completo, você pode dar um nome a ele (até 30 caracteres). Em branco, ele se chama “Seu esquadrão”. O nome aparece no
          placar, na tabela do grupo e no link que você compartilha no final. Ao começar, o jogo sorteia os adversários entre os outros
          campeões da competição. Eles jogam sempre no 4-4-2, com o melhor jogador disponível para cada vaga.
        </p>
      </Secao>

      <Secao titulo="5. Jogue partida por partida">
        <p>
          Cada jogo é simulado no servidor e revelado minuto a minuto, em cerca de quinze segundos: apito inicial, gols com o autor e o
          minuto, intervalo, segundo tempo e fim de jogo. Se quiser, toque em “Pular” para ver o resultado na hora. Na fase de grupos, a
          tabela é atualizada a cada rodada; o critério de desempate é pontos, saldo de gols, gols marcados, confronto direto e, por fim,
          sorteio.
        </p>
        <p>
          No mata-mata o jogo é único. Empate leva a 30 minutos de prorrogação e, se continuar empatado, à disputa de pênaltis, cobrança a
          cobrança. Quer entender como os placares são calculados? Leia{" "}
          <Link to="/como-funciona-a-simulacao" className={link}>
            como a partida é simulada
          </Link>
          .
        </p>
      </Secao>

      <Secao titulo="6. Fim da campanha">
        <p>
          A campanha termina com o título ou com a eliminação. No fim aparecem a sua campanha jogo a jogo, os artilheiros do time e um link
          para compartilhar o resultado com quem quiser, sem precisar instalar nada. Tocando em qualquer jogo, você revê os lances.
        </p>
      </Secao>

      <Secao titulo="Jogar com os amigos">
        <p>
          Na <Link to="/grupos" className={link}>campanha em grupo</Link>, cada pessoa monta o próprio time e todos disputam o mesmo
          torneio de 32 times, completado com campeões sorteados. Quando dois amigos se enfrentam, o jogo só começa quando os dois
          confirmam, e os dois assistem ao mesmo tempo, minuto a minuto.
        </p>
      </Secao>

      <Secao titulo="Dicas rápidas">
        <Lista
          itens={[
            "Comece pelas vagas mais raras na base, como laterais e pontas: atacantes e meias aparecem em quase todo elenco.",
            "Um jogador lendário numa posição secundária ainda pode valer mais do que um jogador prata na posição de origem.",
            "Guarde pelo menos um re-sorteio para as últimas vagas.",
            "Sem conta, a campanha vale só na aba aberta. Crie uma conta grátis para guardar o histórico.",
          ]}
        />
      </Secao>
    </Artigo>
  );
}
