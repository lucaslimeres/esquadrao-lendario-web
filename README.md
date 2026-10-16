# Esquadrão Lendário — Web

Landing page e versão web do jogo: monte o esquadrão com craques de times campeões e
dispute a campanha no navegador. Dá para jogar **sem conta** (a partida vale só na aba
aberta e não vai para o histórico) ou **com conta** (todas as campanhas ficam salvas em
"Minhas campanhas").

## Rodando local

```bash
cp .env.example .env    # VITE_API_URL aponta para a API
yarn install
yarn dev                # http://localhost:5173
```

Precisa da [API](https://github.com/UBEN-Technology/esquadrao-lendario-api) rodando, com
elencos importados.

## Scripts

| Script | O que faz |
|---|---|
| `yarn dev` | Servidor de desenvolvimento |
| `yarn build` | Checagem de tipos + build de produção em `dist/` |
| `yarn lint` | ESLint |
| `yarn test` | Testes unitários e de componentes (Vitest + Testing Library) |
| `yarn test:e2e` | Playwright em desktop e celular contra a API real (ver `playwright.config.ts`) |

## Variáveis de ambiente

| Variável | Uso |
|---|---|
| `VITE_API_URL` | URL da API |
| `VITE_APP_STORE_URL`, `VITE_PLAY_STORE_URL` | Links do app nas lojas. Vazio mostra "Em breve" na landing |
| `VITE_ADSENSE_CLIENT` | ID de editor do AdSense (`ca-pub-…`). Vazio = sem anúncios, sem script do Google |
| `VITE_ADSENSE_SLOT_LANDING`, `VITE_ADSENSE_SLOT_CONTEUDO` | Bloco de anúncios da landing e o das páginas de guia. Sem o de conteúdo, os guias usam o da landing |
| `VITE_SITE_URL` | URL pública do site para o sitemap, o robots.txt e o link canônico (padrão `https://www.esquadraolendario.com.br`) |
| `VITE_ADSENSE_PREVIA` | `1` mostra um bloco cinza onde os anúncios vão aparecer (conferir layout localmente) |

## Páginas

| Rota | O quê |
|---|---|
| `/` | Landing: como funciona, cards, competições (da API), regras, app nas lojas, com/sem conta |
| `/jogar` | Nova campanha: competição, formação e estilo. Sem sessão, cria um convidado na hora |
| `/jogar/:id` | O jogo: montagem (sorteio e escolha no campo), campanha (grupo, jogo ao vivo minuto a minuto) e tela final com compartilhamento |
| `/entrar`, `/cadastro` | Conta. O cadastro manda um código de 6 números por e-mail e só entra depois de confirmar. Cadastrar durante uma partida sem conta leva a partida junto (na confirmação) |
| `/confirmar-email` | Código de 6 números do cadastro (também aparece quando quem nunca confirmou tenta entrar). Reenviar a cada 60s |
| `/esqueci-senha` | E-mail → código de 6 números → nova senha, e já entra |
| `/minhas-campanhas` | Histórico (só com conta) |
| `/c/:codigo` | Resumo público de uma campanha (link compartilhado) |
| `/privacidade` | Política de privacidade (dados, cookies e anúncios do Google, LGPD) |
| `/como-jogar`, `/posicoes-e-formacoes`, `/como-funciona-a-simulacao`, `/perguntas-frequentes`, `/sobre` | Guias com conteúdo próprio (pré-renderizados no build, com anúncio) |
| `/grupos`, `/grupos/:codigo` | Campanha em grupo |
| `/admin/login` | Login do painel administrativo (só admins, tabela separada dos jogadores) |
| `/admin` | Dashboard: jogadores, campanhas, taxa de título, base e competições |
| `/admin/base` | Campeonatos e times (abas); dentro de cada campeonato ficam os elencos campeões, e dentro do elenco, os jogadores. Inclui importação de JSON |
| `/admin/usuarios` | CRUD de usuários do jogo: busca, filtros, ativar/desativar e excluir |
| `/admin/administradores` | CRUD de administradores do painel |

## Deploy (Vercel)

Build `yarn build`, saída `dist/`. Depois do `vite build`, `scripts/prerender.mjs` grava o
HTML já renderizado das páginas de conteúdo (landing, guias e privacidade) em
`dist/<rota>/index.html`, com título, descrição e link canônico de cada uma, e gera
`sitemap.xml` e `robots.txt`. O shell vazio da SPA fica em `dist/app.html`, e o
`vercel.json` reescreve para ele toda rota que não é arquivo (a Vercel serve os arquivos
pré-renderizados primeiro). Na landing, as competições vêm da API no build (até 5 s; sem
API, sai o "Carregando…" e o navegador busca depois). Configure `VITE_API_URL` no projeto da Vercel e libere o
domínio do site no `CORS_ORIGIN` da API.

## Anúncios (Google AdSense)

Só blocos manuais de display, nunca Auto ads (que colocam anúncio fixo no rodapé e tela
cheia por cima do conteúdo). Cada anúncio é uma faixa com o rótulo "Publicidade", no
fluxo da página, com altura fixa (100px no celular, 90px a partir de 768px) e que some
quando o Google não tem anúncio para ela. Posições:

| Posição | Onde |
|---|---|
| `landing` | Landing, entre "Regras" e "App mobile" |
| `conteudo` | Guias (`/como-jogar`, `/posicoes-e-formacoes`, `/como-funciona-a-simulacao`, `/perguntas-frequentes`, `/sobre`), depois do texto |

**Só em página com conteúdo editorial.** O AdSense recusa anúncio em tela sem conteúdo do
editor, em construção ou usada para navegação/ações (outubro de 2026: o site foi recusado
por anúncios no fim de campanha, no link compartilhado e em Minhas campanhas, e por o HTML
da SPA chegar vazio ao robô). Por isso não há anúncio em telas de jogo, listas, formulários,
login, grupos ou link compartilhado, e as páginas de conteúdo são pré-renderizadas.
Nunca durante a montagem, a campanha (em andamento ou no fim) ou a partida ao vivo, nem no
painel admin. O script do Google só carrega em página que tem anúncio. Com `VITE_ADSENSE_CLIENT`
definido, o build também gera `/ads.txt` e a meta `google-adsense-account` (verificação
do site). Em `yarn dev`, os blocos vão com `data-adtest="on"` (não contam impressão).
