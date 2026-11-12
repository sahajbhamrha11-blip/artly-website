/**
 * Prepares web versions of the supplied ARTLY logo WITHOUT altering its
 * proportions, colours or typography:
 *  - removes the plain white JPEG background (colour-preserving un-matting)
 *  - trims empty margins
 *  - writes a transparent PNG for use on light backgrounds
 *  - writes favicon / apple icon from the logo's own red "A" mark
 *
 * Usage: npm run assets:logo
 */
import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = path.join(root, "assets-src", "artly-logo-original.jpg");
const outLogo = path.join(root, "public", "images", "brand", "artly-logo.png");

const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const px = Buffer.from(data);
for (let i = 0; i < px.length; i += 4) {
  const r = px[i], g = px[i + 1], b = px[i + 2];
  const darkness = 255 - Math.min(r, g, b); // 0 = white paper
  let a = Math.min(1, Math.max(0, (darkness - 12) / 120));
  if (a <= 0) { px[i + 3] = 0; continue; }
  // un-matte from white: observed = a*c + (1-a)*255  ->  c = (observed - (1-a)*255) / a
  const un = (v) => Math.max(0, Math.min(255, Math.round((v - (1 - a) * 255) / a)));
  px[i] = un(r); px[i + 1] = un(g); px[i + 2] = un(b);
  px[i + 3] = Math.round(a * 255);
}

const keyed = sharp(px, { raw: { width: info.width, height: info.height, channels: 4 } });
const trimmed = await keyed.png().toBuffer().then((b) => sharp(b).trim({ threshold: 1 }).png().toBuffer({ resolveWithObject: true }));
await sharp(trimmed.data).png({ compressionLevel: 9 }).toFile(outLogo);
console.log(`Logo: ${outLogo} (${trimmed.info.width}×${trimmed.info.height})`);

// Icon: crop the red "A" mark (left part of the wordmark, above the tagline).
const markW = Math.round(trimmed.info.width * 0.215);
const markH = Math.round(trimmed.info.height * 0.73);
const mark = await sharp(trimmed.data).extract({ left: 0, top: 0, width: markW, height: markH }).png().toBuffer();
for (const [file, size] of [["icon.png", 512], ["apple-icon.png", 180]]) {
  const inner = Math.round(size * 0.7);
  const markPng = await sharp(mark).resize({ width: inner, height: inner, fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background: { r: 245, g: 241, b: 234, alpha: 1 } } })
    .composite([{ input: markPng, gravity: "center" }])
    .png()
    .toFile(path.join(root, "src", "app", file));
  console.log(`Icon: src/app/${file}`);
}

// Open Graph fallback image (1200×630): logo on warm off-white.
const ogLogo = await sharp(outLogo).resize({ width: 820 }).toBuffer();
await sharp({ create: { width: 1200, height: 630, channels: 4, background: { r: 245, g: 241, b: 234, alpha: 1 } } })
  .composite([{ input: ogLogo, gravity: "center" }])
  .jpeg({ quality: 90 })
  .toFile(path.join(root, "public", "images", "brand", "og-default.jpg"));
console.log("OG image: public/images/brand/og-default.jpg");
