import { expect, test } from "@playwright/test";
import { codigoEnviadoPara, LOG_API } from "./codigo-email";

/**
 * "Esqueci a senha" of the panel. Uses the same admin as admin.spec.ts and sets the new password
 * to the same E2E_ADMIN_SENHA, so the other panel tests keep logging in.
 */
const EMAIL = process.env.E2E_ADMIN_EMAIL;
const SENHA = process.env.E2E_ADMIN_SENHA;

test("painel: esqueci a senha com código e já entra", async ({ page }, info) => {
  test.skip(!EMAIL || !SENHA || !LOG_API, "defina E2E_ADMIN_EMAIL, E2E_ADMIN_SENHA e E2E_API_LOG");
  // One project only: both would share the admin's code and the 1-minute wait between codes.
  test.skip(info.project.name !== "desktop", "roda só no desktop");
  let anterior: string | undefined;
  try {
    anterior = await codigoEnviadoPara(EMAIL!);
  } catch {
    anterior = undefined;
  }

  await page.goto("/admin/login");
  await page.getByLabel("E-mail").fill(EMAIL!);
  await page.getByRole("link", { name: "Esqueci minha senha" }).click();
  await expect(page.getByRole("heading", { name: "Esqueci a senha" })).toBeVisible();
  await expect(page.getByLabel("E-mail")).toHaveValue(EMAIL!);
  await page.getByRole("button", { name: /Enviar código/ }).click();
  await expect(page.getByRole("heading", { name: "Digite o código" })).toBeVisible();
  await page.getByLabel("Código").fill(await codigoEnviadoPara(EMAIL!, anterior));
  await expect(page.getByRole("heading", { name: "Crie a nova senha" })).toBeVisible();
  await page.getByLabel("Nova senha", { exact: true }).fill(SENHA!);
  await page.getByLabel("Repita a nova senha").fill(SENHA!);
  await page.getByRole("button", { name: /Salvar e entrar no painel/ }).click();
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  // The panel session only: the player session stays untouched.
  expect(await page.evaluate(() => [localStorage.getItem("esquadrao-admin-auth") !== null, localStorage.getItem("esquadrao-auth")])).toEqual([true, null]);
});

test("painel: configurações troca a própria senha (e volta para a original)", async ({ page }, info) => {
  test.skip(!EMAIL || !SENHA, "defina E2E_ADMIN_EMAIL e E2E_ADMIN_SENHA");
  test.skip(info.project.name !== "desktop", "roda só no desktop");
  const temporaria = `${SENHA}-tmp`;
  const trocar = async (de: string, para: string) => {
    await page.getByLabel("Senha atual").fill(de);
    await page.getByLabel("Nova senha", { exact: true }).fill(para);
    await page.getByLabel("Repita a nova senha").fill(para);
    await page.getByRole("button", { name: /Trocar senha/ }).click();
  };

  await page.goto("/admin/login");
  await page.getByLabel("E-mail").fill(EMAIL!);
  await page.getByLabel("Senha").fill(SENHA!);
  await page.getByRole("button", { name: /Entrar no painel/ }).click();
  await page.getByRole("navigation", { name: "Painel" }).getByRole("link", { name: /Configurações/ }).click();
  await expect(page.getByRole("heading", { name: "Configurações" })).toBeVisible();
  await expect(page.locator("dd", { hasText: EMAIL! })).toBeVisible();

  await trocar("errada-123", temporaria);
  await expect(page.getByText("Senha atual incorreta.")).toBeVisible();
  await trocar(SENHA!, temporaria);
  await expect(page.getByText("Senha trocada. Use a nova no próximo login.")).toBeVisible();
  // Back to the original, so the other panel tests keep logging in.
  await trocar(temporaria, SENHA!);
  await expect(page.getByText("Senha trocada. Use a nova no próximo login.")).toBeVisible();
});
