export async function uploadImages(files: FileList | File[]): Promise<{ url: string; alt: string }[]> {
  const fd = new FormData();
  for (const f of Array.from(files)) fd.append("files", f);
  const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string; files?: { url: string; alt: string }[] };
  if (!res.ok || !data.ok || !data.files) throw new Error(data.message || "Upload failed.");
  return data.files;
}
