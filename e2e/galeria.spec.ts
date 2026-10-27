import { expect, test } from "@playwright/test";

/** Champions gallery and statistics: public content pages fed by GET /galeria and /estatisticas. */
test("galeria: da lista de competições ao elenco campeão e às estatísticas", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("contentinfo").getByRole("link", { name: "Galeria de campeões" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Galeria de campeões" })).toBeVisible();
  await expect(page).toHaveTitle("Galeria de campeões — Esquadrão Lendário");

  const libertadores = page.getByRole("region", { name: "Libertadores" });
  await libertadores.getByRole("link", { name: /Todos os \d+ campeões/ }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Campeões da Libertadores" })).toBeVisible();
  await expect(page.getByText(/A galeria (reúne|tem) \d+ elencos? campe/)).toBeVisible();

  await page.getByRole("region", { name: /Todos os títulos/ }).getByRole("link").first().click();
  await expect(page).toHaveURL(/\/campeoes\/libertadores\/\d{4}$/);
  await expect(page.getByText(/conquistou a Libertadores de \d{4}/)).toBeVisible();
  await expect(page.getByRole("heading", { name: /Elenco no jogo/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Jogar a Libertadores/ })).toBeVisible();

  await page.getByRole("contentinfo").getByRole("link", { name: "Estatísticas" }).click();
  await expect(page.getByRole("heading", { level: 1, name: /Estatísticas/ })).toBeVisible();
  await expect(page.getByText(/Atualizado em/)).toBeVisible();
});

test("galeria: título inexistente avisa e leva de volta", async ({ page }) => {
  await page.goto("/campeoes/libertadores/1800");
  await expect(page.getByRole("heading", { level: 1, name: "Título não encontrado" })).toBeVisible();
  await page.getByRole("link", { name: /Ver a galeria/ }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Galeria de campeões" })).toBeVisible();
});
