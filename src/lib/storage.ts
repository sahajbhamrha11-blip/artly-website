import "server-only";
import path from "path";

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8 MB
export const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

export function uploadDir() {
  return path.resolve(process.cwd(), process.env.UPLOAD_DIR || "./storage/uploads");
}

/** Resolves a requested file name inside the upload dir, refusing path traversal. */
export function resolveUpload(fileName: string) {
  const dir = uploadDir();
  const full = path.resolve(dir, fileName);
  if (!full.startsWith(dir + path.sep)) return null;
  return full;
}
