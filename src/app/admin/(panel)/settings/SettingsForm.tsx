"use client";

import { useState, useTransition } from "react";
import { saveSettingsAction, type ActionState } from "../../actions";
import { ImageField } from "../ImageField";
import { cn } from "@/lib/utils";

type Field = { key: string; label: string; type?: "text" | "textarea" | "email" | "tel" | "url"; rows?: number; hint?: string; placeholder?: string };

const GROUPS: { title: string; hint?: string; fields: Field[] }[] = [
  {
    title: "Business details",
    fields: [
      { key: "contactPhone", label: "Business phone", type: "tel", placeholder: "+91 00000 00000" },
      { key: "contactEmail", label: "Business email", type: "email", placeholder: "hello@yourdomain.com" },
      { key: "whatsappNumber", label: "WhatsApp number", type: "tel", hint: "International format with country code. Enables WhatsApp buttons across the site.", placeholder: "+91 00000 00000" },
      { key: "address", label: "Business address", type: "textarea", rows: 3 },
      { key: "businessHours", label: "Business hours", type: "textarea", rows: 2, placeholder: "Mon–Sat, 10:00–19:00" },
      { key: "mapEmbedUrl", label: "Google Maps embed link", type: "url", hint: "Google Maps → Share → Embed a map → copy only the src=\"…\" link.", placeholder: "https://www.google.com/maps/embed?pb=…" },
    ],
  },
  {
    title: "Social media",
    hint: "Full links, e.g. https://instagram.com/yourpage. Empty links are hidden.",
    fields: [
      { key: "instagramUrl", label: "Instagram", type: "url" },
      { key: "facebookUrl", label: "Facebook", type: "url" },
      { key: "youtubeUrl", label: "YouTube", type: "url" },
      { key: "linkedinUrl", label: "LinkedIn", type: "url" },
    ],
  },
  {
    title: "Home page",
    fields: [
      { key: "heroHeadline", label: "Hero headline", hint: "Text after the first full stop is shown on a second line in the accent colour." },
      { key: "heroSubtext", label: "Hero supporting text", type: "textarea", rows: 2 },
      { key: "introHeading", label: "Introduction heading" },
      { key: "introText", label: "Introduction text", type: "textarea", rows: 4 },
      { key: "ctaHeadline", label: "Call-to-action headline" },
    ],
  },
  {
    title: "About page",
    fields: [
      { key: "aboutWhoWeAre", label: "Who we are", type: "textarea", rows: 6, hint: "Leave a blank line between paragraphs." },
      { key: "aboutVision", label: "Our vision", type: "textarea", rows: 2 },
      { key: "aboutMission", label: "Our mission", type: "textarea", rows: 2 },
    ],
  },
  {
    title: "Footer",
    fields: [{ key: "footerDescription", label: "Short brand description", type: "textarea", rows: 2 }],
  },
];

const IMAGES = [
  { key: "heroImage", label: "Home hero image" },
  { key: "lifestyleImage1", label: "Lifestyle — Living rooms (large)" },
  { key: "lifestyleImage2", label: "Lifestyle — Kitchens & dining" },
  { key: "lifestyleImage3", label: "Lifestyle — Lounges & retreats" },
];

export function SettingsForm({ values }: { values: Record<string, string> }) {
  const [state, setState] = useState<ActionState>(null);
  const [pending, start] = useTransition();
  const err = (k: string) => state?.errors?.[k];

  return (
    <form
      className="mt-10 space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        start(async () => {
          const res = await saveSettingsAction(null, fd);
          setState(res);
          if (!res?.ok) {
            const first = Object.keys(res?.errors ?? {})[0];
            if (first) document.getElementById(`s-${first}`)?.focus();
          }
        });
      }}
    >
      {GROUPS.map((g) => (
        <section key={g.title} className="bg-paper p-6 sm:p-8">
          <h2 className="text-2xl">{g.title}</h2>
          {g.hint && <p className="mt-1 text-[13px] text-metal">{g.hint}</p>}
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {g.fields.map((f) => (
              <div key={f.key} className={cn(f.type === "textarea" && "sm:col-span-2", f.key === "mapEmbedUrl" && "sm:col-span-2")}>
                <label htmlFor={`s-${f.key}`} className="field-label">{f.label}</label>
                {f.type === "textarea" ? (
                  <textarea id={`s-${f.key}`} name={f.key} rows={f.rows ?? 3} defaultValue={values[f.key]} placeholder={f.placeholder} className="field" aria-invalid={err(f.key) ? "true" : undefined} />
                ) : (
                  <input id={`s-${f.key}`} name={f.key} type={f.type === "url" ? "text" : f.type ?? "text"} defaultValue={values[f.key]} placeholder={f.placeholder} className="field" aria-invalid={err(f.key) ? "true" : undefined} />
                )}
                {f.hint && <p className="mt-1.5 text-[12px] text-metal">{f.hint}</p>}
                {err(f.key) && <p className="mt-1.5 text-[13px] text-red">{err(f.key)}</p>}
              </div>
            ))}
          </div>
        </section>
      ))}

      <section className="bg-paper p-6 sm:p-8">
        <h2 className="text-2xl">Imagery</h2>
        <p className="mt-1 text-[13px] text-metal">Replace with interior / lifestyle photography when available. Clear an image to return to the default product photo.</p>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {IMAGES.map((i) => <ImageField key={i.key} name={i.key} label={i.label} defaultValue={values[i.key]} />)}
        </div>
      </section>

      <div className="sticky bottom-0 z-10 -mx-5 flex flex-wrap items-center justify-end gap-4 border-t border-stone bg-linen/95 px-5 py-4 backdrop-blur sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12">
        {state?.message && <p role="status" className={cn("text-[14px]", state.ok ? "text-[#1f7a4d]" : "text-red")}>{state.message}</p>}
        <button type="submit" disabled={pending} className="btn-primary">{pending ? "Saving…" : "Save settings"}</button>
      </div>
    </form>
  );
}
