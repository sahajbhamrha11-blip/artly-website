// Builds a look-only single-page snapshot of the running ARTLY site.
// Usage: node export-preview.mjs <baseUrl> <projectDir> <outDir>
import fs from "fs";
import path from "path";

const [base, projectDir, outDir] = process.argv.slice(2);
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(path.join(outDir, "images"), { recursive: true });

const get = async (p) => {
  const r = await fetch(base + p);
  if (!r.ok) throw new Error(`${p} → ${r.status}`);
  return r.text();
};

// Resolve React streaming boundaries (Suspense) into final HTML.
function resolveStreaming(html) {
  const re = /<div hidden id="S:(\d+)">([\s\S]*?)<\/div><script>\$RC\("B:\1","S:\1"\)<\/script>/g;
  let m;
  const segs = {};
  while ((m = re.exec(html))) segs[m[1]] = m[2];
  for (const [n, content] of Object.entries(segs)) {
    html = html.replace(new RegExp(`<!--\\$\\?--><template id="B:${n}"></template>[\\s\\S]*?<!--/\\$-->`), content);
  }
  return html;
}

const usedImages = new Set();
function clean(html) {
  html = html.replace(/<script[\s\S]*?<\/script>/g, "");
  html = html.replace(/\s(srcset|sizes)="[^"]*"/gi, "");
  html = html.replace(/\/_next\/image\?url=([^&"]+)[^"]*/g, (_, u) => decodeURIComponent(u));
  html = html.replace(/(src|href)="\/images\/([^"]+)"/g, (_, a, p) => {
    usedImages.add(p);
    return `${a}="images/${p}"`;
  });
  // Internal links → hash routes
  html = html.replace(/href="([^"]*)"/g, (full, h) => {
    if (h.startsWith("images/") || h.startsWith("http") || h.startsWith("mailto:") || h.startsWith("tel:")) return full;
    if (h.startsWith("#")) return full;
    const [p, frag] = h.split("#");
    const [pathname, qs] = p.split("?");
    const params = new URLSearchParams(qs || "");
    let target = "#home";
    if (pathname === "/" || pathname === "") target = "#home";
    else if (pathname === "/about") target = "#about";
    else if (pathname === "/privacy") target = "#privacy";
    else if (pathname === "/contact") target = "#contact";
    else if (pathname === "/products") target = params.get("category") ? `#products-${params.get("category")}` : "#products";
    else if (pathname.startsWith("/products/")) target = `#product-${pathname.split("/")[2]}`;
    else if (frag) target = `#${frag}`;
    return `href="${target}"`;
  });
  return html;
}

const mainOf = (html) => {
  const s = html.indexOf("<main");
  const e = html.lastIndexOf("</main>");
  return html.slice(html.indexOf(">", s) + 1, e);
};

const home = resolveStreaming(await get("/"));
const bodyStart = home.indexOf(">", home.indexOf("<body")) + 1;
const chrome = clean(home.slice(bodyStart, home.indexOf("<main")));
const footer = clean(home.match(/<footer[\s\S]*?<\/footer>/)[0]);

const cssLinks = [...home.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map((m) => m[1]);
let css = "";
for (const l of cssLinks) css += await get(l);
css = css.replace(/url\((["']?)\/_next\/[^)]+\)/g, "url(about:blank)");

const productsHtml = resolveStreaming(await get("/products"));
const slugs = [...new Set([...productsHtml.matchAll(/href="\/products\/([a-z0-9-]+)"/g)].map((m) => m[1]))];

const views = [
  ["home", home],
  ["about", await get("/about")],
  ["products", productsHtml],
  ["contact", await get("/contact")],
  ["privacy", await get("/privacy")],
];
for (const s of slugs) views.push([`product-${s}`, await get(`/products/${s}`)]);

const sections = views
  .map(([id, html]) => `<div class="view" data-view="${id}" hidden>${clean(mainOf(resolveStreaming(html)))}</div>`)
  .join("\n");

for (const p of usedImages) {
  const src = path.join(projectDir, "public", "images", p);
  const dst = path.join(outDir, "images", p);
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.copyFileSync(src, dst);
}

const js = fs.readFileSync(new URL("./preview-runtime.js", import.meta.url), "utf8");
const page = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>ARTLY — Fireplaces & Cooking Stoves (Preview)</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Manrope:wght@300;400;500;600;700&display=swap">
<style>${css}</style>
<style>
html{--font-cormorant:'Cormorant Garamond',serif !important;--font-manrope:'Manrope',sans-serif !important}
.preview-note{position:fixed;left:12px;bottom:12px;z-index:80;background:#161514;color:#fbf8f3;font:600 11px/1 Manrope,sans-serif;letter-spacing:.18em;text-transform:uppercase;padding:10px 14px;border:1px solid rgba(251,248,243,.15)}
.preview-toast{margin-top:16px;border-left:2px solid #9a0f1c;background:rgba(154,15,28,.06);padding:12px 16px;font-size:14px}
</style>
</head>
<body>
${chrome}
<main id="main">
${sections}
</main>
${footer}
<div class="preview-note">Design preview</div>
<script>${js}</script>
</body>
</html>`;
fs.writeFileSync(path.join(outDir, "index.html"), page);
console.log("views:", views.map((v) => v[0]).join(", "));
console.log("images:", usedImages.size, "html KB:", Math.round(page.length / 1024));
