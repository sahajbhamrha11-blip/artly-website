"use client";

import { useState } from "react";
import { SmartImage } from "@/components/SmartImage";
import { uploadImages } from "./upload-client";

/** Single image picker that uploads and stores the resulting path in a hidden input. */
export function ImageField({ name, label, defaultValue, hint }: { name: string; label: string; defaultValue: string; hint?: string }) {
  const [value, setValue] = useState(defaultValue);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  return (
    <div>
      <p className="field-label">{label}</p>
      <div className="flex items-start gap-4">
        <div className="relative h-28 w-24 shrink-0 overflow-hidden bg-sand">
          {value && <SmartImage src={value} alt="" fill sizes="96px" className="object-cover" />}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <input type="hidden" name={name} value={value} />
          <p className="truncate text-[12px] text-metal">{value || "No image (default will be used)"}</p>
          <div className="flex flex-wrap gap-3">
            <label className="btn-outline-dark cursor-pointer !px-4 !py-2">
              {busy ? "Uploading…" : "Upload image"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                className="sr-only"
                disabled={busy}
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  e.target.value = "";
                  if (!f) return;
                  setBusy(true);
                  setError("");
                  try {
                    const [img] = await uploadImages([f]);
                    setValue(img.url);
                  } catch (err) {
                    setError((err as Error).message);
                  } finally {
                    setBusy(false);
                  }
                }}
              />
            </label>
            {value && (
              <button type="button" className="text-[12px] font-semibold text-red uppercase" onClick={() => setValue("")}>
                Clear
              </button>
            )}
          </div>
          {hint && <p className="text-[12px] text-metal">{hint}</p>}
          {error && <p className="text-[13px] text-red">{error}</p>}
        </div>
      </div>
    </div>
  );
}
