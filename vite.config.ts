/// <reference types="vitest/config" />
import { fileURLToPath, URL } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv, type Plugin } from "vite";

/**
 * Google AdSense, only when VITE_ADSENSE_CLIENT is set: the site-verification meta tag in
 * index.html (the crawler doesn't run the SPA), /ads.txt (Google warns without it) and
 * /app-ads.txt (AdMob verifies the app through the developer website).
 */
function adsense(valor: string | undefined): Plugin {
  const id = valor?.trim().replace(/^ca-/, "");
  const publisher = id && /^pub-\d{10,20}$/.test(id) ? id : null;
  return {
    name: "esquadrao-adsense",
    transformIndexHtml: (html) =>
      publisher ? html.replace("</head>", `  <meta name="google-adsense-account" content="ca-${publisher}" />\n  </head>`) : html,
    generateBundle() {
      if (!publisher) return;
      const linha = `google.com, ${publisher}, DIRECT, f08c47fec0942fa0\n`;
      this.emitFile({ type: "asset", fileName: "ads.txt", source: linha });
      // AdMob (app) checks app-ads.txt on the developer website listed in the stores: same publisher.
      this.emitFile({ type: "asset", fileName: "app-ads.txt", source: linha });
    },
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    react(),
    tailwindcss(),
    adsense(loadEnv(mode, process.cwd(), "VITE_").VITE_ADSENSE_CLIENT),
  ],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  server: { port: 5173 },
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.{ts,tsx}"],
    css: false,
  },
}));
