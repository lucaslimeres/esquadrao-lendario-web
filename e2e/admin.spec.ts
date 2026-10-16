import { expect, test, type Page } from "@playwright/test";

/**
 * Admin panel against the real API. Needs an admin created with `yarn admin:create` in the API:
 *   E2E_ADMIN_EMAIL=... E2E_ADMIN_SENHA=... yarn test:e2e
 */
const EMAIL = process.env.E2E_ADMIN_EMAIL;
const SENHA = process.env.E2E_ADMIN_SENHA;
test.skip(!EMAIL || !SENHA, "defina E2E_ADMIN_EMAIL e E2E_ADMIN_SENHA");
test.describe.configure({ mode: "serial" });

async function entrar(page: Page) {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login/);
  await page.getByLabel("E-mail").fill(EMAIL!);
  await page.getByLabel("Senha").fill(SENHA!);
  await page.getByRole("button", { name: /Entrar no painel/ }).click();
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
}

async function irPara(page: Page, item: RegExp) {
  const menu = page.getByRole("button", { name: "Abrir menu" });
  if (await menu.isVisible()) await menu.click();
  await page.getByRole("navigation", { name: "Painel" }).getByRole("link", { name: item }).click();
}

const sufixo = Date.now().toString(36);

test("login do painel é separado e recusa senha errada", async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByLabel("E-mail").fill(EMAIL!);
  await page.getByLabel("Senha").fill("senha-errada");
  await page.getByRole("button", { name: /Entrar no painel/ }).click();
  await expect(page.getByText("E-mail ou senha inválidos.")).toBeVisible();
  await entrar(page);
  await expect(page.getByText("Taxa de título")).toBeVisible();
  // The admin session doesn't log anyone into the game.
  expect(await page.evaluate(() => localStorage.getItem("esquadrao-auth"))).toBeNull();
});

test("monta campeonato, time, elenco e jogadores até ficar jogável", async ({ page }) => {
  await entrar(page);
  await irPara(page, /Campeonatos, times e jogadores/);
  await page.getByRole("button", { name: /Nova competição/ }).click();
  await page.getByLabel("Nome").fill(`Copa E2E ${sufixo}`);
  await page.getByLabel("Formato").selectOption("mata_mata");
  await page.getByLabel(/Ativa/).check();
  await page.getByRole("button", { name: "Salvar" }).click();
  await expect(page.getByRole("heading", { name: `Copa E2E ${sufixo}` })).toBeVisible();
  await expect(page.getByText("Incompleta")).toBeVisible();

  await page.getByRole("button", { name: /Novo elenco/ }).click();
  await page.getByLabel(/Temporada/).fill("1999");
  await page.getByRole("button", { name: /Cadastrar agora/ }).click();
  await page.getByLabel("Nome").fill(`Time E2E ${sufixo}`);
  await page.getByLabel("Sigla").fill("TE2");
  await page.getByRole("button", { name: "Salvar" }).click();
  await expect(page.getByRole("heading", { name: `Time E2E ${sufixo} 1999` })).toBeVisible();
  await expect(page.getByText(/Incompleto/)).toBeVisible();

  const elenco: Array<[string, string]> = [
    ["GK", "Goleiro"], ["LB", "Lateral A"], ["CB", "Zagueiro A"], ["CB", "Zagueiro B"], ["RB", "Lateral B"], ["CDM", "Volante A"],
    ["CDM", "Volante B"], ["CM", "Meia A"], ["CM", "Meia B"], ["ST", "Atacante A"], ["ST", "Atacante B"],
  ];
  const form = page.locator("form", { has: page.getByRole("heading", { name: "Adicionar jogador" }) });
  for (const [posicao, nome] of elenco) {
    await form.getByLabel("Nome").fill(nome);
    await form.getByLabel("Posição").selectOption(posicao);
    await form.getByLabel("Overall").fill("80");
    await form.getByRole("button", { name: /Adicionar ao elenco/ }).click();
    await expect(page.getByRole("cell", { name: nome, exact: true })).toBeVisible();
  }
  await expect(page.getByText("Completo: entra no sorteio")).toBeVisible();

  // Edit one player: secondary position + overall.
  await page.getByRole("button", { name: "Editar Meia A" }).click();
  await page.getByRole("dialog").getByLabel("Overall").fill("91");
  await page.getByRole("dialog").getByLabel("CAM", { exact: true }).check();
  await page.getByRole("dialog").getByRole("button", { name: "Salvar" }).click();
  await expect(page.getByRole("row", { name: /Meia A/ })).toContainText("91");
  await expect(page.getByRole("row", { name: /Meia A/ })).toContainText("CAM");

  // One complete squad is not enough: a campaign never draws the same squad twice (needs 14).
  await page.getByRole("link", { name: "Competição" }).click();
  await expect(page.getByText("Incompleta")).toBeVisible();
  await expect(page.getByText("Mínimo para jogar: 14")).toBeVisible();

  // Import a second squad by pasting JSON.
  await page.getByRole("button", { name: /Importar JSON/ }).click();
  const jogadores = elenco.map(([posicao, nome]) => ({ nome: `${nome} 2`, posicao, overall: 77 }));
  await page.getByLabel(/cole o conteúdo/).fill(JSON.stringify({ temporada: 2000, equipe: { nome: `Importado ${sufixo}`, sigla: "IMP", corPrimaria: "#201E1D", corSecundaria: "#F3F2F2" }, jogadores }));
  await page.getByRole("button", { name: /^Importar/ }).click();
  await expect(page.getByText(/Elenco criado: 11 jogadores novos/)).toBeVisible();
  await expect(page.getByRole("cell", { name: "2000" })).toBeVisible();

  // Still 2 of 14: in the public catalogue it shows up as "em breve", not playable.
  await page.goto("/jogar");
  await expect(page.getByRole("radio", { name: new RegExp(`Copa E2E ${sufixo}`) })).toBeDisabled();
});

test("times: busca e proteção de exclusão", async ({ page }) => {
  await entrar(page);
  await irPara(page, /Campeonatos, times e jogadores/);
  await page.getByRole("tab", { name: "Times" }).click();
  await page.getByLabel("Buscar time").fill(sufixo);
  await page.getByRole("button", { name: "Buscar" }).click();
  await expect(page.getByText(`Time E2E ${sufixo}`)).toBeVisible();
  await page.getByRole("row", { name: new RegExp(`Time E2E ${sufixo}`) }).getByRole("button", { name: /Excluir/ }).click();
  await page.getByRole("button", { name: "Sim, excluir" }).click();
  await expect(page.getByText(/tem elencos cadastrados/)).toBeVisible();
});

test("usuários: cria, busca, desativa e exclui", async ({ page }) => {
  await entrar(page);
  await irPara(page, /Usuários/);
  const email = `e2e.${sufixo}@exemplo.com`;
  await page.getByRole("button", { name: /Novo usuário/ }).click();
  await page.getByLabel("Nome").fill("Jogador do Painel");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha").fill("senha-forte-123");
  await page.getByRole("button", { name: "Criar usuário" }).click();

  await page.getByLabel("Buscar", { exact: true }).fill(email);
  await page.getByRole("button", { name: /^Buscar/ }).click();
  await expect(page.getByText("1 usuário")).toBeVisible();
  await page.getByRole("button", { name: "Abrir Jogador do Painel" }).click();
  await page.getByRole("dialog").getByLabel(/Ativo/).uncheck();
  await page.getByRole("dialog").getByRole("button", { name: "Salvar" }).click();
  await expect(page.getByRole("row", { name: /Jogador do Painel/ })).toContainText("Desativado");

  await page.getByRole("button", { name: "Abrir Jogador do Painel" }).click();
  await page.getByRole("button", { name: /Excluir usuário/ }).click();
  await page.getByRole("button", { name: "Sim, excluir" }).click();
  await expect(page.getByText("0 usuários")).toBeVisible();
});

test("administradores: cria, edita e exclui", async ({ page }) => {
  await entrar(page);
  await irPara(page, /Administradores/);
  await page.getByRole("button", { name: /Novo administrador/ }).click();
  await page.getByLabel("Nome").fill(`Admin E2E ${sufixo}`);
  await page.getByLabel("E-mail").fill(`admin.${sufixo}@exemplo.com`);
  await page.getByLabel("Senha").fill("senha-forte-123");
  await page.getByRole("button", { name: "Salvar" }).click();
  await expect(page.getByRole("cell", { name: `Admin E2E ${sufixo}`, exact: true })).toBeVisible();

  await page.getByRole("button", { name: `Editar Admin E2E ${sufixo}` }).click();
  await page.getByRole("dialog").getByLabel("Nome").fill(`Admin E2E ${sufixo} editado`);
  await page.getByRole("dialog").getByRole("button", { name: "Salvar" }).click();
  await expect(page.getByRole("cell", { name: `Admin E2E ${sufixo} editado`, exact: true })).toBeVisible();

  await page.getByRole("row", { name: new RegExp(`Admin E2E ${sufixo} editado`) }).getByRole("button", { name: /Excluir/ }).click();
  await page.getByRole("button", { name: "Sim, excluir" }).click();
  await expect(page.getByRole("cell", { name: `Admin E2E ${sufixo} editado`, exact: true })).toHaveCount(0);
});
