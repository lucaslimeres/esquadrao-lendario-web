import { createFileRoute } from "@tanstack/react-router";
import { Artigo, Lista, Secao } from "@/features/guia/artigo";

export const Route = createFileRoute("/posicoes-e-formacoes")({
  component: PosicoesEFormacoes,
});

const POSICOES: Array<[string, string, string]> = [
  ["GK", "Goleiro", "Defende o gol. Não marca gols na simulação, mas pesa muito na hora dos pênaltis."],
  ["CB", "Zagueiro", "O coração da defesa. Quanto mais forte a dupla (ou trio) de zaga, menos gols o time sofre."],
  ["LB / RB", "Lateral esquerdo / direito", "Defendem pelos lados e ajudam o meio e o ataque. Lateral tem lado: um LB só joga de RB se tiver essa posição secundária."],
  ["CDM", "Volante", "Protege a defesa e conta tanto para o meio-campo quanto para o setor defensivo."],
  ["CM", "Meio-campista", "Organiza o jogo. Soma principalmente no meio-campo, com um pouco de ataque e de defesa."],
  ["CAM", "Meia ofensivo", "O camisa 10: divide a força entre meio-campo e ataque e é um dos que mais aparecem na artilharia depois dos atacantes."],
  ["LW / RW", "Ponta esquerda / direita", "Atacantes de lado, com faro de gol. Também têm lado, como os laterais."],
  ["ST", "Atacante", "Quem mais marca. Na simulação, o centroavante tem o maior peso na hora de decidir o autor do gol."],
];

const FORMACOES: Array<[string, string]> = [
  ["4-4-2", "O clássico: dois zagueiros, dois laterais, quatro no meio e dois atacantes. Equilibrado e fácil de preencher, é também o esquema de todos os adversários."],
  ["4-3-3", "Três atacantes, com duas pontas. Ótimo para quem quer muitos gols, mas exige pontas dos dois lados, que nem todo elenco campeão tem."],
  ["4-2-3-1", "Dois volantes protegem a defesa e um meia ofensivo joga atrás do centroavante. Sólido e com bastante força no meio."],
  ["3-5-2", "Três zagueiros e cinco no meio, com dois atacantes. Domina o meio-campo, mas depende de bons zagueiros."],
  ["3-4-3", "O mais ofensivo: três atrás e três na frente. Pede um time forte nas pontas e aceita sofrer um pouco mais."],
  ["5-3-2", "Cinco defensores. Difícil de ser vazado, ideal com o estilo defensivo, mas cria menos chances."],
];

function PosicoesEFormacoes() {
  return (
    <Artigo
      caminho="/posicoes-e-formacoes"
      rotulo="Guia"
      titulo="Posições e formações"
      intro="No Esquadrão Lendário, onde você escala cada craque importa tanto quanto quem você escala. Este guia apresenta as dez posições do jogo, as seis formações disponíveis e como elas influenciam a força do seu time em campo."
    >
      <Secao titulo="As 10 posições">
        <p>
          O jogo usa as siglas em inglês que todo mundo conhece dos games de futebol. Laterais e pontas têm lado: um lateral esquerdo não
          vira lateral direito automaticamente.
        </p>
        <dl className="divide-y-2 divide-gramado border-2 border-neutro-400 bg-white">
          {POSICOES.map(([sigla, nome, texto]) => (
            <div key={sigla} className="grid gap-1 p-4 sm:grid-cols-[120px_1fr]">
              <dt className="font-display text-xl text-tinta">
                {sigla}
                <span className="block font-sans text-sm font-semibold text-neutro-700">{nome}</span>
              </dt>
              <dd>{texto}</dd>
            </div>
          ))}
        </dl>
      </Secao>

      <Secao titulo="Posição de origem e posição secundária">
        <p>
          Todo jogador tem uma posição principal e pode ter posições secundárias, de acordo com o que ele realmente fazia em campo. Na
          posição principal, ele joga com o overall cheio. Numa posição secundária, rende cerca de 7% menos. Fora dessas posições, ele não
          pode ser escalado. Na tela de escolha, as vagas da posição principal aparecem em destaque e as secundárias, com o botão em
          contorno.
        </p>
        <p>
          Por isso, às vezes vale mais escalar um craque fora da posição do que um jogador comum na posição certa: um lendário de 92 numa
          posição secundária ainda joga como 85, mais do que muito jogador ouro.
        </p>
      </Secao>

      <Secao titulo="As 6 formações">
        <dl className="divide-y-2 divide-gramado border-2 border-neutro-400 bg-white">
          {FORMACOES.map(([codigo, texto]) => (
            <div key={codigo} className="grid gap-1 p-4 sm:grid-cols-[120px_1fr]">
              <dt className="font-display text-2xl text-tinta">{codigo}</dt>
              <dd>{texto}</dd>
            </div>
          ))}
        </dl>
      </Secao>

      <Secao titulo="Como a formação vira força em campo">
        <p>A simulação não olha só para o overall médio. Ela calcula três forças, uma por setor, a partir de quem está em cada vaga:</p>
        <Lista
          itens={[
            <>
              <strong>Ataque:</strong> atacantes e pontas, metade da força do meia ofensivo e uma parte de laterais e meio-campistas.
            </>,
            <>
              <strong>Meio-campo:</strong> meio-campistas e volantes, a outra metade do meia ofensivo e uma parte de pontas e laterais.
            </>,
            <>
              <strong>Defesa:</strong> zagueiros, laterais, volantes e um pouco dos meio-campistas. O goleiro conta à parte.
            </>,
          ]}
        />
        <p>
          Um 3-4-3 cheio de pontas lendárias terá um ataque fortíssimo e uma defesa mais exposta; um 5-3-2 faz o contrário. Não existe
          formação melhor: existe a que combina com os craques que o sorteio te deu.
        </p>
      </Secao>

      <Secao titulo="Raridade das cartas">
        <Lista
          itens={["Bronze: overall até 74.", "Prata: de 75 a 82.", "Ouro: de 83 a 88.", "Lendário: 89 ou mais, para quem decidiu finais."]}
        />
      </Secao>
    </Artigo>
  );
}
