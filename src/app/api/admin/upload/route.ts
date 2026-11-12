import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import { randomBytes } from "crypto";
import path from "path";
import sharp from "sharp";
import { getAdminOrNull } from "@/lib/auth";
import { ALLOWED_IMAGE_TYPES, MAX_UPLOAD_BYTES, uploadDir } from "@/lib/storage";
import { slugify } from "@/lib/utils";

export const runtime = "nodejs";

/**
 * Admin-only image upload. Images are re-encoded with sharp (which strips
 * metadata such as GPS location and rejects non-images), resized to a
 * sensible maximum and saved as high-quality WebP.
 */
export async function POST(req: Request) {
  const admin = await getAdminOrNull();
  if (!admin) return NextResponse.json({ ok: false, message: "Unauthorised" }, { status: 401 });

  const form = await req.formData().catch(() => null);
  const files = (form?.getAll("files") ?? []).filter((f): f is File => f instanceof File);
  if (files.length === 0) return NextResponse.json({ ok: false, message: "No files received." }, { status: 400 });
  if (files.length > 12) return NextResponse.json({ ok: false, message: "Upload at most 12 images at a time." }, { status: 400 });

  const dir = uploadDir();
  const sub = new Date().toISOString().slice(0, 7); // YYYY-MM
  await mkdir(path.join(dir, sub), { recursive: true });

  const results: { url: string; alt: string }[] = [];
  for (const file of files) {
    if (!ALLOWED_IMAGE_TYPES[file.type]) {
      return NextResponse.json({ ok: false, message: `${file.name}: only JPG, PNG, WebP or AVIF images are allowed.` }, { status: 400 });
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ ok: false, message: `${file.name}: images must be under 8 MB.` }, { status: 400 });
    }
    try {
      const input = Buffer.from(await file.arrayBuffer());
      const output = await sharp(input)
        .rotate()
        .resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 86 })
        .toBuffer();
      const base = slugify(file.name.replace(/\.[^.]+$/, "")) || "image";
      const name = `${base}-${randomBytes(4).toString("hex")}.webp`;
      await writeFile(path.join(dir, sub, name), output);
      results.push({ url: `/uploads/${sub}/${name}`, alt: "" });
    } catch (err) {
      console.error("[upload] failed:", err);
      return NextResponse.json({ ok: false, message: `${file.name}: could not be processed as an image.` }, { status: 400 });
    }
  }
  return NextResponse.json({ ok: true, files: results });
}
