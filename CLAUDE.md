# Esquadrão Lendário Web — Contexto do repo

> Soma com o contexto do projeto em
> [esquadrao-lendario-contexto](https://github.com/UBEN-Technology/esquadrao-lendario-contexto)
> (regras do jogo em `docs/mecanica.md`; marca em `docs/identidade-visual.md` e `marca/`).
> Este repo fica na conta pessoal do GitHub de propósito, para o deploy na Vercel.

## Stack

Vite 7 + React 19 + TypeScript + TanStack Router (rotas por arquivo em `src/routes/`) +
TanStack Query, Tailwind v4 com os tokens da marca em `src/styles.css`, componentes no
estilo shadcn (`radix-ui` + `class-variance-authority`), React Hook Form + Zod e Zustand
(só para a sessão). Testes com Vitest + Testing Library e e2e com Playwright.

## Estrutura

- `src/routes/`: páginas. Inclui `index` (landing), `jogar/index` (nova campanha),
  `jogar/$id` (o jogo), `entrar`, `cadastro`, `minhas-campanhas` e `c/$codigo` (link
  público). `routeTree.gen.ts` é gerado pelo plugin do router; não editar.
- `src/features/`: telas de jogo (`campanha/`), formulário de auth e sessão.
- `src/components/jogo/`: campo, card de jogador, placar e distintivo genérico, seguindo o
  guia de marca.
- `src/components/ui/`: botão, badge, input e estados.
- `src/lib/`: `api.ts` (cliente), `tipos.ts` (contratos da API) e `jogo.ts` (textos e
  raridade).
- `src/stores/sessao.ts`: sessão do jogador.
- **Painel admin:**
  - Rotas em `src/routes/admin/`: `login` e o layout com guarda `_painel` (dashboard,
    `base/`, `usuarios`, `administradores`).
  - Cliente próprio em `src/lib/admin-api.ts`, sessão própria em
    `src/stores/admin-sessao.ts` (chave `esquadrao-admin-auth`) e layout em
    `src/components/admin/`.

## Regras específicas do web

- **A API é a fonte da verdade.** O web nunca calcula placar, overall do time,
  classificação ou se uma posição encaixa: só exibe o que a API devolve
  (`vagasCompativeis`, `overallTime`, `grupo`…).
- **Sessão:** o token de **conta** fica no `localStorage` (`esquadrao-auth`) e as
  campanhas ficam no histórico. **Sem conta**, o token de convidado fica só no
  `sessionStorage` (`esquadrao-convidado`): fechou a aba, acabou. Por isso
  `/minhas-campanhas` exige conta. Criar conta com sessão de convidado converte o
  convidado e leva a campanha junto (a API faz isso).
- **Marca:**
  - Só cores, fontes e tamanhos dos tokens (`styles.css`).
  - Raio zero, réguas de 2px, tudo alinhado à esquerda, alvo de toque mínimo de 44px.
  - Verde só na ação principal, nas lendas, na vitória e nas telas de sorteio e título.
  - Nunca usar vermelho, escudos, logos ou fotos reais.
- **Anúncios (AdSense):** só via `EspacoPublicidade` (`components/anuncio.tsx`), no fluxo
  da página, com o rótulo "Publicidade" e altura fixa. Nunca sobre o conteúdo, nunca na
  montagem, na campanha em andamento, na partida ao vivo ou no `/admin`, e nunca colado
  em botão. Sem `VITE_ADSENSE_CLIENT`, nada é renderizado. Auto ads fica desligado no
  painel do AdSense.
- **Painel admin** separado de verdade:
  - Nunca usar `lib/api.ts`, `useSessao` ou o token do jogador dentro de `/admin`, e
    vice-versa.
  - O `__root` não mostra o cabeçalho público em `/admin/*`; o painel usa o
    `AdminLayout`, escuro e com o selo "Admin".
  - Tabelas ficam sempre dentro de um contêiner `relative overflow-x-auto`. Sem o
    `relative`, as células `sr-only` vazam e criam rolagem horizontal no celular.
- Copy em pt-BR, no tom da marca ("Sorteia aí!", "Bola rolando!").

## Validar antes de subir

`yarn lint`, `yarn build` e `yarn test`. Os e2e de cadastro e nova senha leem o código de 6 números do log da API: rode a API sem
`RESEND_API_KEY`, gravando o log num arquivo, e passe o caminho em `E2E_API_LOG` (sem ela,
esses testes são pulados). Para `yarn test:e2e`, a API precisa estar rodando
em `VITE_API_URL` com pelo menos 3 elencos da Libertadores importados. O e2e do painel
precisa de `E2E_ADMIN_EMAIL` e `E2E_ADMIN_SENHA`, de um admin criado com
`yarn admin:create` na API; sem essas variáveis, ele é pulado.

## Fluxo de branches

`feat/<assunto>` ou `fix/<assunto>` a partir da `main`. Quando finalizado, merge em
`staging`. Vai para a `main` só depois que o Lucas aprovar os testes em staging.
