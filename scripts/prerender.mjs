// After `vite build`: writes the prerendered content pages into dist/ (dist/<page>/index.html),
// keeps the empty SPA shell as dist/app.html (vercel.json rewrites every other route to it),
// and generates robots.txt + sitemap.xml.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { createServer } from "vite";

const DIST = "dist";
const SITE = (process.env.VITE_SITE_URL || "https://www.esquadraolendario.com.br").replace(/\/$/, "");
const escapar = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const casca = await readFile(join(DIST, "index.html"), "utf8");
await writeFile(join(DIST, "app.html"), casca);

const vite = await createServer({ server: { middlewareMode: true }, appType: "custom", logLevel: "error" });
try {
  const { renderizar, PAGINAS } = await vite.ssrLoadModule("/src/prerender.tsx");
  for (const pagina of PAGINAS) {
    const html = await renderizar(pagina.caminho);
    const final = casca
      .replace(/<title>.*?<\/title>/s, `<title>${escapar(pagina.titulo)}</title>`)
      .replace(/(<meta\s+name="description"\s+content=")[^"]*(")/s, `$1${escapar(pagina.descricao)}$2`)
      .replace("</head>", `  <link rel="canonical" href="${SITE}${pagina.caminho === "/" ? "/" : pagina.caminho}" />\n  </head>`)
      .replace('<div id="root"></div>', `<div id="root">${html}</div>`);
    const pasta = pagina.caminho === "/" ? DIST : join(DIST, pagina.caminho);
    await mkdir(pasta, { recursive: true });
    await writeFile(join(pasta, "index.html"), final);
    console.log(`prerender ${pagina.caminho} (${Math.round(html.length / 1024)} kB)`);
  }
  const hoje = new Date().toISOString().slice(0, 10);
  await writeFile(
    join(DIST, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${PAGINAS.map(
      (p) => `  <url><loc>${SITE}${p.caminho}</loc><lastmod>${hoje}</lastmod></url>`,
    ).join("\n")}\n</urlset>\n`,
  );
  await writeFile(
    join(DIST, "robots.txt"),
    `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /jogar/\nDisallow: /c/\nDisallow: /minhas-campanhas\n\nSitemap: ${SITE}/sitemap.xml\n`,
  );
} finally {
  await vite.close();
}
