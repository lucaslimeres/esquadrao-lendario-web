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

function Privacidade() {
  return (
    <Pagina>
      <TituloPagina rotulo="Política de privacidade">Seus dados no Esquadrão Lendário</TituloPagina>
      <div className="space-y-8 text-neutro-800">
        <p>Atualizada em 16 de outubro de 2026. Aqui explicamos, sem juridiquês, o que guardamos, para quê e como pedir para apagar.</p>

        <Bloco titulo="O que guardamos">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>Conta:</strong> nome, e-mail e a senha em formato irreversível (hash). Nunca vemos a sua senha.
            </li>
            <li>
              <strong>Campanhas:</strong> o esquadrão montado, os jogos e o resultado. Partidas sem conta ficam ligadas só a um código aleatório
              guardado na aba do navegador, sem nome nem e-mail.
            </li>
            <li>
              <strong>Fale conosco:</strong> nome, e-mail, assunto e mensagem, para podermos responder.
            </li>
          </ul>
        </Bloco>

        <Bloco titulo="Para que usamos">
          <p>
            Para o jogo funcionar (login, histórico e link de compartilhar), para responder quem fala com a gente e para manter o serviço no ar
            com segurança. Não vendemos seus dados.
          </p>
        </Bloco>

        <Bloco titulo="Publicidade e cookies">
          <p>
            O site mostra anúncios do Google AdSense em espaços identificados como “Publicidade”. Fornecedores terceiros, incluindo o Google,
            usam cookies para exibir anúncios com base em visitas anteriores a este e a outros sites. Os cookies de publicidade permitem que o
            Google e seus parceiros mostrem anúncios com base nessas visitas.
          </p>
          <p>
            Você pode desativar a publicidade personalizada nas{" "}
            <a className={linkExterno} href="https://adssettings.google.com" target="_blank" rel="noreferrer">
              Configurações de anúncios do Google
            </a>{" "}
            e saber mais em{" "}
            <a className={linkExterno} href="https://policies.google.com/technologies/ads?hl=pt-BR" target="_blank" rel="noreferrer">
              Como o Google usa cookies em publicidade
            </a>
            .
          </p>
        </Bloco>

        <Bloco titulo="Com quem compartilhamos">
          <p>
            Só com os serviços que fazem o site funcionar: hospedagem do site e da API, o envio de e-mails (Resend) e o Google, nos anúncios.
          </p>
        </Bloco>

        <Bloco titulo="Seus direitos (LGPD)">
          <p>
            Você pode pedir para ver, corrigir ou apagar seus dados, inclusive a conta e todas as campanhas. É só mandar uma mensagem pelo{" "}
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
