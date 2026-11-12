/**
 * Generates close-up "detail" crops from the original product photographs
 * (no retouching — straight crops) for editorial sections of the site.
 * Usage: node scripts/make-details.mjs
 */
import sharp from "sharp";
import path from "path";
import { mkdirSync } from "fs";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const P = (f) => path.join(root, "public", "images", "products", f);
const outDir = path.join(root, "public", "images", "details");
mkdirSync(outDir, { recursive: true });

const crops = [
  { src: "heritage-compact-stove-front.jpg", out: "scrollwork.jpg", left: 590, top: 545, width: 250, height: 250 },
  { src: "tower-fireplace-front.jpg", out: "badge.jpg", left: 150, top: 340, width: 200, height: 120 },
  { src: "heritage-hearth-stove-front.jpg", out: "knob.jpg", left: 430, top: 540, width: 220, height: 220 },
  { src: "panorama-fireplace-front.jpg", out: "leg.jpg", left: 110, top: 1040, width: 230, height: 230 },
  { src: "tower-fireplace-front.jpg", out: "flue.jpg", left: 300, top: 130, width: 360, height: 360 },
  { src: "heritage-compact-stove-front.jpg", out: "door.jpg", left: 160, top: 520, width: 690, height: 500 },
];

for (const c of crops) {
  await sharp(P(c.src))
    .extract({ left: c.left, top: c.top, width: c.width, height: c.height })
    .resize({ width: Math.max(c.width * 3, 800), withoutEnlargement: false, kernel: "lanczos3" })
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(path.join(outDir, c.out));
  console.log("wrote", c.out);
}
