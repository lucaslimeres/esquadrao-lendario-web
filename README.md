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

## Páginas

| Rota | O quê |
|---|---|
| `/` | Landing: como funciona, cards, competições (da API), regras, app nas lojas, com/sem conta |
| `/jogar` | Nova campanha: competição, formação e estilo. Sem sessão, cria um convidado na hora |
| `/jogar/:id` | O jogo: montagem (sorteio e escolha no campo), campanha (grupo, jogo ao vivo minuto a minuto) e tela final com compartilhamento |
| `/entrar`, `/cadastro` | Conta. Cadastrar durante uma partida sem conta leva a partida junto |
| `/minhas-campanhas` | Histórico (só com conta) |
| `/c/:codigo` | Resumo público de uma campanha (link compartilhado) |
| `/admin/login` | Login do painel administrativo (só admins, tabela separada dos jogadores) |
| `/admin` | Dashboard: jogadores, campanhas, taxa de título, base e competições |
| `/admin/base` | Campeonatos e times (abas); dentro de cada campeonato ficam os elencos campeões, e dentro do elenco, os jogadores. Inclui importação de JSON |
| `/admin/usuarios` | CRUD de usuários do jogo: busca, filtros, ativar/desativar e excluir |
| `/admin/administradores` | CRUD de administradores do painel |

## Deploy (Vercel)

Projeto Vite padrão: build `yarn build`, saída `dist/`. O `vercel.json` reescreve todas as
rotas para o `index.html` (SPA). Configure `VITE_API_URL` no projeto da Vercel e libere o
domínio do site no `CORS_ORIGIN` da API.
