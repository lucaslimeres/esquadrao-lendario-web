import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Pagina, TituloPagina } from "@/components/layout";

export const Route = createFileRoute("/privacidade")({
  component: Privacidade,
});

function Bloco({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-bold">{titulo}</h2>
      {children}
    </section>
  );
}

const linkExterno = "font-semibold underline underline-offset-4 hover:text-verde";

/** Covers the website and the iOS/Android app (the stores link here). */
function Privacidade() {
  return (
    <Pagina>
      <TituloPagina rotulo="Política de privacidade">Seus dados no Esquadrão Lendário</TituloPagina>
      <div className="space-y-8 text-neutro-800">
        <p>
          Atualizada em 21 de outubro de 2026. Vale para o site www.esquadraolendario.com.br e para o aplicativo Esquadrão Lendário para iPhone e
          Android. Aqui explicamos, sem juridiquês, o que guardamos, para quê e como apagar.
        </p>

        <Bloco titulo="O que guardamos">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>Conta:</strong> nome, e-mail e a senha em formato irreversível (hash). Nunca vemos a sua senha. O e-mail é confirmado por um
              código de 6 números.
            </li>
            <li>
              <strong>Campanhas e grupos:</strong> o esquadrão montado, os jogos, os resultados e, na campanha em grupo, o nome que você deu ao seu
              time. Os outros membros do grupo veem só esse nome, nunca o seu e-mail. No site, partidas sem conta ficam ligadas só a um código
              aleatório guardado na aba do navegador, sem nome nem e-mail.
            </li>
            <li>
              <strong>Fale conosco:</strong> nome, e-mail, assunto e mensagem, para podermos responder.
            </li>
            <li>
              <strong>Compra de “Remover anúncios” (app):</strong> o pagamento é feito pela App Store ou pelo Google Play. Não recebemos dados de
              cartão; sabemos só se a sua conta tem a compra ativa, por meio do RevenueCat.
            </li>
          </ul>
          <p>Não coletamos localização, contatos, fotos nem dados de saúde, e o jogo não usa ferramentas de análise de comportamento.</p>
        </Bloco>

        <Bloco titulo="Para que usamos">
          <p>
            Para o jogo funcionar (login, histórico, campanha em grupo e link de compartilhar), para responder quem fala com a gente, para liberar a
            compra de “Remover anúncios” e para manter o serviço no ar com segurança. Não vendemos seus dados.
          </p>
        </Bloco>

        <Bloco titulo="Publicidade">
          <p>
            <strong>No site</strong>, mostramos anúncios do Google AdSense em espaços identificados como “Publicidade”. Fornecedores terceiros,
            incluindo o Google, usam cookies para exibir anúncios com base em visitas anteriores a este e a outros sites. Os cookies de publicidade
            permitem que o Google e seus parceiros mostrem anúncios com base nessas visitas.
          </p>
          <p>
            <strong>No aplicativo</strong>, os anúncios vêm do Google AdMob. Para isso, o Google pode usar o identificador de publicidade do aparelho
            (no iPhone, só se você permitir o rastreamento quando o app perguntar), dados do aparelho e a sua interação com os anúncios. Quando a lei
            exige, o app pede o seu consentimento antes de carregar anúncios, e você pode mudar a escolha em “Privacidade dos anúncios”, na aba
            Conta. Quem compra “Remover anúncios” não vê nenhum anúncio.
          </p>
          <p>
            Você pode desativar a publicidade personalizada nas{" "}
            <a className={linkExterno} href="https://adssettings.google.com" target="_blank" rel="noreferrer">
              Configurações de anúncios do Google
            </a>
            , redefinir o identificador de publicidade nas configurações do celular e saber mais em{" "}
            <a className={linkExterno} href="https://policies.google.com/technologies/ads?hl=pt-BR" target="_blank" rel="noreferrer">
              Como o Google usa cookies em publicidade
            </a>
            .
          </p>
        </Bloco>

        <Bloco titulo="Com quem compartilhamos">
          <p>
            Só com os serviços que fazem o jogo funcionar: a hospedagem do site e da API, o envio de e-mails (Resend), o Google (anúncios do site e do
            app), o RevenueCat e as lojas da Apple e do Google (compra de “Remover anúncios”). Cada um trata os dados conforme a própria política de
            privacidade.
          </p>
        </Bloco>

        <Bloco titulo="Por quanto tempo guardamos">
          <p>
            Enquanto a conta existir. Ao excluir a conta, ela e as suas campanhas são apagadas na hora. A única exceção é a campanha em grupo que já
            começou: o seu time continua no torneio dos outros membros, sem nenhum dado da sua conta.
          </p>
        </Bloco>

        <Bloco titulo="Excluir a conta">
          <p>
            No app, vá em Conta → “Excluir minha conta”. No site, use a página{" "}
            <Link to="/excluir-conta" className={linkExterno}>
              Excluir conta
            </Link>
            . Nos dois casos pedimos a sua senha de novo, para ninguém apagar a sua conta por engano.
          </p>
        </Bloco>

        <Bloco titulo="Crianças">
          <p>O Esquadrão Lendário não é direcionado a menores de 13 anos e não coleta dados deles de propósito.</p>
        </Bloco>

        <Bloco titulo="Seus direitos (LGPD)">
          <p>
            Você pode pedir para ver, corrigir ou apagar seus dados, inclusive a conta e todas as campanhas, e tirar dúvidas sobre esta política. É só
            mandar uma mensagem pelo{" "}
            <Link to="/" hash="fale-conosco" className={linkExterno}>
              Fale conosco
            </Link>
            .
          </p>
        </Bloco>
      </div>
    </Pagina>
  );
}
