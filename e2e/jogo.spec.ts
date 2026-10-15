import { expect, test, type Page } from "@playwright/test";

async function montarTime(page: Page) {
  for (let i = 0; i < 11; i++) {
    await page.getByRole("button", { name: /Sorteia aí!/ }).click();
    await expect(page.getByText("Time sorteado")).toBeVisible();
    await page.locator("li[data-jogador] button:not([disabled])").first().click();
    await page.locator("li[data-jogador] .flex-wrap button").first().click();
    await expect(page.getByText(i < 10 ? "Que time vai cair?" : "Time completo!")).toBeVisible();
  }
}

async function jogarAteOFim(page: Page) {
  const bolaRolando = page.getByRole("button", { name: /Bola rolando!/ });
  const jogarDeNovo = page.getByRole("link", { name: /Jogar de novo/ });
  for (let jogos = 0; jogos <= 7; jogos++) {
    await expect(bolaRolando.or(jogarDeNovo)).toBeVisible();
    if (await jogarDeNovo.isVisible()) return jogos;
    await bolaRolando.click();
    await page.getByRole("button", { name: /Pular/ }).click();
    await page.getByRole("button", { name: /Continuar/ }).click();
  }
  throw new Error("a campanha passou de 7 jogos");
}

async function sair(page: Page) {
  const menu = page.getByRole("button", { name: "Abrir menu" });
  if (await menu.isVisible()) await menu.click();
  await page.getByRole("button", { name: /Sair/ }).click();
  await expect.poll(() => page.evaluate(() => localStorage.getItem("esquadrao-auth"))).toBeNull();
}

test("landing explica o jogo e aponta para o app e para o navegador", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("esquadrão");
  await expect(page.getByText("Três passos até a taça")).toBeVisible();
  await expect(page.getByText("Feito para o celular.")).toBeVisible();
  await expect(page.getByText(/App Store/)).toBeVisible();
  await expect(page.getByText("Libertadores").first()).toBeVisible();
  await page.getByRole("link", { name: /Jogar no navegador/ }).click();
  await expect(page).toHaveURL(/\/jogar$/);
});

test("sem conta: joga a campanha inteira e nada fica no histórico", async ({ page }) => {
  await page.goto("/jogar");
  await page.getByRole("button", { name: /Começar a montar o time/ }).click();
  await expect(page.getByText("Jogando sem conta.")).toBeVisible();
  await montarTime(page);
  await page.getByRole("button", { name: /Começar campanha/ }).click();
  const jogos = await jogarAteOFim(page);
  expect(jogos).toBeGreaterThanOrEqual(3);
  await expect(page.getByText(/É CAMPEÃO!|Caiu|Vice-campeão/)).toBeVisible();

  // Guest games have no history: the page asks to sign in.
  await page.goto("/minhas-campanhas");
  await expect(page).toHaveURL(/\/entrar/);
});

test("campanha sem conta não abre em outra aba", async ({ page, context }) => {
  await page.goto("/jogar");
  await page.getByRole("button", { name: /Começar a montar o time/ }).click();
  await expect(page.getByText("Que time vai cair?")).toBeVisible();
  // A new tab has its own sessionStorage: the guest session (and its game) doesn't follow.
  const outraAba = await context.newPage();
  await outraAba.goto(page.url());
  await expect(outraAba.getByText("Campanha não encontrada")).toBeVisible();
});

test("criar conta no meio da partida leva a campanha para o histórico", async ({ page }) => {
  await page.goto("/jogar");
  await page.getByRole("button", { name: /Começar a montar o time/ }).click();
  await page.getByRole("button", { name: /Sorteia aí!/ }).click();
  await page.locator("li[data-jogador] button:not([disabled])").first().click();
  await page.locator("li[data-jogador] .flex-wrap button").first().click();
  const campanhaUrl = page.url();

  await page.getByRole("link", { name: "Criar conta e salvar" }).click();
  await expect(page.getByText("Sua partida sem conta vem junto")).toBeVisible();
  const email = `e2e.${Date.now()}@exemplo.com`;
  await page.getByLabel("Nome").fill("Torcedor E2E");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha").fill("senha-forte-123");
  await page.getByRole("button", { name: /Criar conta/ }).click();

  // Back to the campaign, now as an account: no guest banner, same campaign.
  await expect(page).toHaveURL(campanhaUrl);
  await expect(page.getByText("Jogando sem conta.")).toHaveCount(0);
  await expect(page.getByText("Escalação · 1/11")).toBeVisible();

  await page.goto("/minhas-campanhas");
  await expect(page.getByText("1 campanha")).toBeVisible();

  // Log out and back in: the history is still there.
  await sair(page);
  await page.goto("/entrar");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha").fill("senha-forte-123");
  await page.getByRole("button", { name: /^Entrar/ }).click();
  await expect(page).toHaveURL(/\/minhas-campanhas/);
  await expect(page.getByText("Libertadores")).toBeVisible();
});

test("link compartilhado abre o resumo público", async ({ page }) => {
  await page.goto("/c/naoexiste0");
  await expect(page.getByText("Link inválido")).toBeVisible();
  await expect(page.getByRole("link", { name: /Montar o meu/ })).toBeVisible();
});
