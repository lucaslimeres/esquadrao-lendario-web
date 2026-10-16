import { expect, test, type Page } from "@playwright/test";
import { codigoEnviadoPara, LOG_API } from "./codigo-email";

test.skip(!LOG_API, "precisa de E2E_API_LOG (log da API com os códigos)");

async function criarConta(page: Page, nome: string, email: string) {
  await page.goto("/cadastro");
  await page.getByLabel("Nome").fill(nome);
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha").fill("senha-forte-123");
  await page.getByRole("button", { name: /Criar conta/ }).click();
  await page.getByLabel("Código").fill(await codigoEnviadoPara(email));
  await expect(page).toHaveURL(/\/minhas-campanhas/);
}

async function montarTimeDoGrupo(page: Page) {
  await page.getByRole("button", { name: /Começar a montar/ }).click();
  await expect(page.getByText("Campanha em grupo:")).toBeVisible();
  for (let i = 0; i < 11; i++) {
    await page.getByRole("button", { name: /Sorteia aí!/ }).click();
    await expect(page.getByText("Time sorteado")).toBeVisible();
    await page.locator("li[data-jogador] button:not([disabled])").first().click();
    await page.locator("li[data-jogador] .flex-wrap button").first().click();
    await expect(page.getByText(i < 10 ? "Que time vai cair?" : "Time fechado!")).toBeVisible();
  }
  // A group draft never starts on its own: it goes back to the group.
  await expect(page.getByRole("button", { name: /Começar campanha/ })).toHaveCount(0);
  await page.getByRole("link", { name: /Voltar ao grupo/ }).first().click();
}

/** Plays the member's next match: confirms (or kicks off) and watches it. */
async function jogarProximo(page: Page) {
  const botao = page.getByRole("button", { name: /Bola rolando!|Estou pronto para o jogo/ });
  await expect(botao).toBeVisible({ timeout: 15_000 });
  await botao.click();
}

test("campanha em grupo: convite pelo link, montagem de todos e torneio rolando", async ({ page, browser }, info) => {
  test.setTimeout(240_000);
  const sufixo = `${info.project.name}.${Date.now()}`;
  await criarConta(page, "Ana Moderadora", `ana.grupo.${sufixo}@exemplo.com`);

  await page.goto("/grupos");
  await page.getByLabel("Nome do grupo").fill(`Pelada ${info.project.name}`);
  await page.getByLabel("Competição", { exact: true }).selectOption({ label: "Libertadores" });
  await page.getByLabel("Nome do seu time (dá para mudar depois)").fill("Ana FC");
  await page.getByRole("button", { name: /Criar grupo/ }).click();
  await expect(page.getByRole("heading", { name: `Pelada ${info.project.name}` })).toBeVisible();
  const link = (await page.getByTestId("link-grupo").textContent())!.trim();
  expect(link).toMatch(/\/grupos\/[a-z0-9]{10}$/);

  // A guest joins by the link, names the team and gets ready.
  const visitante = await browser.newContext({ ...info.project.use });
  const outra = await visitante.newPage();
  await outra.goto(link);
  await expect(outra.getByText("Bora jogar junto?")).toBeVisible();
  await outra.getByRole("button", { name: /Entrar no grupo/ }).click();
  await outra.getByLabel("Nome do time", { exact: true }).fill("Visitantes");
  await outra.getByRole("button", { name: /Estou pronto/ }).click();
  await expect(outra.getByText("Você está pronto!")).toBeVisible();
  await expect(outra.getByText("Quem modera fecha as inscrições")).toBeVisible();

  // The moderator sees the new member, gets ready and closes sign-ups.
  await expect(page.getByText("Visitantes")).toBeVisible({ timeout: 10_000 });
  await page.getByRole("button", { name: /Estou pronto/ }).click();
  const fechar = page.getByRole("button", { name: /Fechar inscrições/ });
  await expect(fechar).toBeEnabled();
  await fechar.click();

  await montarTimeDoGrupo(page);
  await expect(page.getByText("Seu time está fechado!")).toBeVisible();
  await expect(outra.getByRole("button", { name: /Começar a montar/ })).toBeVisible({ timeout: 10_000 });
  await montarTimeDoGrupo(outra);

  // The last XI starts the 32-team tournament for everybody.
  for (const p of [page, outra]) {
    await expect(p.getByText(/Próximo · Fase de grupos/)).toBeVisible({ timeout: 15_000 });
    await expect(p.getByRole("region", { name: /^Grupo [A-H]$/ })).toHaveCount(1);
    await expect(p.getByRole("heading", { name: "Seus jogos e os do seu grupo" })).toBeVisible();
  }

  await jogarProximo(page);
  // Against the other member it waits for both; the guest's confirmation kicks it off.
  const aguardando = page.getByText("Aguardando o adversário…");
  await expect(page.getByRole("button", { name: /Pular/ }).or(aguardando)).toBeVisible({ timeout: 10_000 });
  if (await aguardando.isVisible()) {
    await expect(outra.getByText(/Ana FC já está pronto esperando você!/)).toBeVisible({ timeout: 10_000 });
    await jogarProximo(outra);
    await expect(outra.getByRole("button", { name: /Pular/ })).toBeVisible();
  }
  await expect(page.getByRole("button", { name: /Pular/ })).toBeVisible({ timeout: 10_000 });
  await page.getByRole("button", { name: /Pular/ }).click();
  await page.getByRole("button", { name: /Continuar/ }).click();
  await expect(page.getByRole("region", { name: /^Grupo [A-H]$/ }).getByRole("cell", { name: "Ana FC" })).toBeVisible();

  // The account keeps the group in its history.
  await page.goto("/minhas-campanhas");
  await expect(page.getByRole("heading", { name: "Em grupo" })).toBeVisible();
  await expect(page.getByText(`Pelada ${info.project.name}`)).toBeVisible();
  await visitante.close();
});
