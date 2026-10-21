import { expect, test, type Page } from "@playwright/test";
import { codigoEnviadoPara, LOG_API } from "./codigo-email";

test.skip(!LOG_API, "precisa de E2E_API_LOG (log da API com os códigos)");

async function sair(page: Page) {
  const menu = page.getByRole("button", { name: "Abrir menu" });
  if (await menu.isVisible()) await menu.click();
  await page.getByRole("button", { name: /Sair/ }).click();
  await expect.poll(() => page.evaluate(() => localStorage.getItem("esquadrao-auth"))).toBeNull();
}

async function entrar(page: Page, email: string, senha: string) {
  await page.goto("/entrar");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha").fill(senha);
  await page.getByRole("button", { name: /^Entrar/ }).click();
}

test("cadastro confirma o e-mail por código; esqueci a senha troca a senha por código", async ({ page }, info) => {
  const email = `conta.${info.project.name}.${Date.now()}@exemplo.com`;

  await page.goto("/cadastro");
  await page.getByLabel("Nome").fill("Torcedora E2E");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha").fill("senha-forte-123");
  await page.getByRole("button", { name: /Criar conta/ }).click();
  await expect(page.getByRole("heading", { name: "Confirme seu e-mail" })).toBeVisible();
  await expect(page.getByText(email)).toBeVisible();
  await expect(page.getByRole("button", { name: /Reenviar código em \d+s/ })).toBeDisabled();
  const primeiro = await codigoEnviadoPara(email);

  // Leaving before confirming: logging in sends to the code screen again.
  await entrar(page, email, "senha-forte-123");
  await expect(page.getByRole("heading", { name: "Confirme seu e-mail" })).toBeVisible();

  await page.getByLabel("Código").fill(primeiro === "000000" ? "111111" : "000000");
  await expect(page.getByText("Código errado. Você ainda tem 4 tentativas.")).toBeVisible();
  await page.getByLabel("Código").fill(primeiro);
  await expect(page).toHaveURL(/\/minhas-campanhas/);

  await sair(page);
  await page.goto("/entrar");
  await page.getByRole("link", { name: "Esqueci minha senha" }).click();
  await expect(page.getByRole("heading", { name: "Esqueci a senha" })).toBeVisible();
  await page.getByLabel("E-mail").fill(email);
  await page.getByRole("button", { name: /Enviar código/ }).click();
  await expect(page.getByRole("heading", { name: "Digite o código" })).toBeVisible();
  await page.getByLabel("Código").fill(await codigoEnviadoPara(email, primeiro));
  await expect(page.getByRole("heading", { name: "Crie a nova senha" })).toBeVisible();
  await page.getByLabel("Nova senha", { exact: true }).fill("nova-senha-123");
  await page.getByLabel("Repita a nova senha").fill("outra-coisa-1");
  await page.getByRole("button", { name: /Salvar e entrar/ }).click();
  await expect(page.getByText("As senhas não são iguais")).toBeVisible();
  await page.getByLabel("Repita a nova senha").fill("nova-senha-123");
  await page.getByRole("button", { name: /Salvar e entrar/ }).click();
  await expect(page).toHaveURL(/\/minhas-campanhas/);

  await sair(page);
  await entrar(page, email, "senha-forte-123");
  await expect(page.getByText("E-mail ou senha inválidos.")).toBeVisible();
  await page.getByLabel("Senha").fill("nova-senha-123");
  await page.getByRole("button", { name: /^Entrar/ }).click();
  await expect(page).toHaveURL(/\/minhas-campanhas/);
});

test("excluir conta pelo site: pede a senha e apaga de vez", async ({ page }, info) => {
  const email = `excluir.${info.project.name}.${Date.now()}@exemplo.com`;
  await page.goto("/cadastro");
  await page.getByLabel("Nome").fill("Quem vai embora");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha").fill("senha-forte-123");
  await page.getByRole("button", { name: /Criar conta/ }).click();
  await page.getByLabel("Código").fill(await codigoEnviadoPara(email));
  await expect(page).toHaveURL(/\/minhas-campanhas/);

  await page.goto("/excluir-conta");
  await expect(page.getByText(email)).toBeVisible();
  page.on("dialog", (d) => d.accept());
  await page.getByLabel("Sua senha").fill("errada-123");
  await page.getByRole("button", { name: /Excluir minha conta/ }).click();
  await expect(page.getByText("Senha incorreta.")).toBeVisible();
  await page.getByLabel("Sua senha").fill("senha-forte-123");
  await page.getByRole("button", { name: /Excluir minha conta/ }).click();
  await expect(page.getByText("Conta excluída.")).toBeVisible();

  await entrar(page, email, "senha-forte-123");
  await expect(page.getByText(/E-mail ou senha/)).toBeVisible();
});
