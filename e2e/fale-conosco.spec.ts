import { expect, test } from "@playwright/test";

/**
 * Landing "Fale conosco" → admin panel. The panel part needs E2E_ADMIN_EMAIL/E2E_ADMIN_SENHA.
 * Without RESEND_API_KEY in the API, replying must say e-mail isn't configured (and not mark
 * the message as answered).
 */
const EMAIL = process.env.E2E_ADMIN_EMAIL;
const SENHA = process.env.E2E_ADMIN_SENHA;

test("visitante manda mensagem pela landing e o admin vê, tenta responder e arquiva", async ({ page }, info) => {
  test.skip(!EMAIL || !SENHA, "defina E2E_ADMIN_EMAIL e E2E_ADMIN_SENHA");
  const assunto = `E2E ${info.project.name} ${Date.now().toString(36)}`;

  await page.goto("/");
  await page.getByRole("contentinfo").getByRole("link", { name: "Fale conosco" }).click();
  const secao = page.locator("#fale-conosco");
  await secao.getByLabel("Nome").fill("Visitante E2E");
  await secao.getByLabel("E-mail").fill("visitante.e2e@exemplo.com");
  await secao.getByLabel("Assunto").fill(assunto);
  await secao.getByLabel("Mensagem").fill("Mensagem de teste automático do Fale conosco.");
  await secao.getByRole("button", { name: /Enviar mensagem/ }).click();
  await expect(secao.getByText("Mensagem enviada!")).toBeVisible();

  await page.goto("/admin");
  await page.getByLabel("E-mail").fill(EMAIL!);
  await page.getByLabel("Senha").fill(SENHA!);
  await page.getByRole("button", { name: /Entrar no painel/ }).click();
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  const menu = page.getByRole("button", { name: "Abrir menu" });
  if (await menu.isVisible()) await menu.click();
  await page.getByRole("navigation", { name: "Painel" }).getByRole("link", { name: /Mensagens/ }).click();

  await page.getByLabel("Buscar").fill(assunto);
  await page.getByRole("button", { name: /Buscar/ }).click();
  const linha = page.getByRole("row", { name: new RegExp(assunto) });
  await expect(linha).toContainText("Nova");
  await linha.getByRole("button", { name: /Abrir/ }).click();

  const dialogo = page.getByRole("dialog");
  await expect(dialogo.getByText("Mensagem de teste automático do Fale conosco.")).toBeVisible();
  await expect(dialogo.getByText("Lida", { exact: true })).toBeVisible();
  await dialogo.getByLabel(/Responder para/).fill("Resposta de teste.");
  await dialogo.getByRole("button", { name: /Enviar resposta/ }).click();
  // Either Resend is configured (answered) or the panel says why it couldn't send.
  await expect(dialogo.getByText(/Resposta enviada|não está configurado|Não deu para enviar/)).toBeVisible();

  await dialogo.getByRole("button", { name: /Arquivar/ }).click();
  await expect(dialogo.getByText("Arquivada", { exact: true })).toBeVisible();
});
