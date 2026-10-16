import { readFileSync } from "node:fs";
import { expect } from "@playwright/test";

/**
 * The API, without RESEND_API_KEY and outside production, logs each 6-digit code
 * ("Código de verificação", pino JSON). E2E_API_LOG points to that log file; without it,
 * the tests that need a code are skipped.
 */
export const LOG_API = process.env.E2E_API_LOG;

export async function codigoEnviadoPara(email: string, anterior?: string): Promise<string> {
  let codigo: string | undefined;
  await expect
    .poll(
      () => {
        const linhas = readFileSync(LOG_API!, "utf8").trim().split("\n").reverse();
        for (const linha of linhas) {
          if (!linha.includes("Código de verificação")) continue;
          const log = JSON.parse(linha) as { para?: string; codigo?: string };
          if (log.para === email) return (codigo = log.codigo) !== anterior ? codigo : undefined;
        }
        return undefined;
      },
      { message: `código enviado para ${email}`, timeout: 10_000 },
    )
    .toBeTruthy();
  return codigo!;
}
