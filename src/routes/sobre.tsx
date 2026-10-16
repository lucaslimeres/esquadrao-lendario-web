import { createFileRoute, Link } from "@tanstack/react-router";
import { Artigo, Secao } from "@/features/guia/artigo";

export const Route = createFileRoute("/sobre")({
  component: Sobre,
});

const link = "font-semibold text-verde underline underline-offset-4";

function Sobre() {
  return (
    <Artigo
      caminho="/sobre"
      rotulo="Sobre"
      titulo="Sobre o Esquadrão Lendário"
      intro="O Esquadrão Lendário nasceu de uma pergunta que todo torcedor já fez numa mesa de bar: e se desse para juntar no mesmo time os craques dos maiores campeões da história?"
    >
      <Secao titulo="A ideia">
        <p>
          O jogo transforma essa conversa num desafio rápido. Em vez de escolher qualquer jogador, você depende do sorteio: a cada rodada
          cai um time campeão, e é dele que sai o próximo reforço. A graça está em três momentos: a tensão de ver qual campeão vai cair, a
          estratégia de decidir quem escalar e em qual vaga, e a emoção da campanha, com os gols saindo minuto a minuto.
        </p>
        <p>
          A referência foi o 7a0, jogo de navegador que fez sucesso com as seleções das Copas do Mundo. O Esquadrão Lendário leva a mesma
          ideia para outras competições, como a Libertadores e a Copa do Brasil, e o catálogo cresce com o tempo.
        </p>
      </Secao>

      <Secao titulo="Só campeões">
        <p>
          Todo jogador do Esquadrão Lendário veio de um time campeão. O conjunto de times de cada competição é formado pelos campeões das
          últimas décadas, um elenco por título: o São Paulo campeão em 1992 e o de 2005 são elencos diferentes. Os adversários da campanha
          também saem desse grupo, então todo jogo é contra um campeão.
        </p>
      </Secao>

      <Secao titulo="Como a base é montada">
        <p>
          Os elencos são montados e revisados por pessoas. Partimos de fontes públicas, como a Wikipedia e o Wikidata, para saber quem
          estava em cada final, e revisamos posição por posição antes de qualquer elenco entrar no jogo. O overall, numa escala de 1 a 99,
          valoriza quem foi titular e quem decidiu a final. Encontrou algo errado? Conte pra gente pelo{" "}
          <Link to="/" hash="fale-conosco" className={link}>
            Fale conosco
          </Link>
          .
        </p>
        <p>
          Nomes de clubes e competições são marcas dos seus donos. Por isso o jogo não usa escudos, logos nem fotos: cada clube aparece só
          com o nome, a sigla e duas cores num distintivo genérico.
        </p>
      </Secao>

      <Secao titulo="Onde jogar">
        <p>
          O Esquadrão Lendário foi feito para o celular, no app, mas também roda completo no navegador, sem instalar nada. É por aqui que
          abrem os links compartilhados de campanhas e os convites de grupo.
        </p>
        <p>
          Quer saber mais? Veja{" "}
          <Link to="/como-jogar" className={link}>
            como jogar
          </Link>
          , as{" "}
          <Link to="/perguntas-frequentes" className={link}>
            perguntas frequentes
          </Link>{" "}
          e a{" "}
          <Link to="/privacidade" className={link}>
            política de privacidade
          </Link>
          .
        </p>
      </Secao>
    </Artigo>
  );
}
