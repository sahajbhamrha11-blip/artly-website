"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { SmartImage } from "@/components/SmartImage";
import { slugify, cn } from "@/lib/utils";
import { deleteProductAction, saveProductAction, type ActionState } from "../../actions";
import { uploadImages } from "../upload-client";

type Spec = { label: string; value: string };
type Img = { url: string; alt: string };
type ProductData = {
  id?: string;
  name: string;
  slug: string;
  categoryId: string;
  shortDescription: string;
  description: string;
  specs: Spec[];
  features: string[];
  variations: string[];
  featured: boolean;
  published: boolean;
  sortOrder: number;
  seoTitle: string;
  seoDescription: string;
  images: Img[];
};

const SPEC_PRESETS = ["Fuel", "Finish", "Dimensions (W × D × H)", "Weight", "Flue diameter", "Material / thickness", "Heating capacity", "Door", "Warranty"];

export function ProductEditor({ categories, product }: { categories: { id: string; name: string }[]; product?: ProductData }) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<ActionState>(params.get("saved") ? { ok: true, message: "Product saved." } : null);
  const [slugTouched, setSlugTouched] = useState(Boolean(product?.slug));

  const [d, setD] = useState<ProductData>(
    product ?? {
      name: "",
      slug: "",
      categoryId: categories[0]?.id ?? "",
      shortDescription: "",
      description: "",
      specs: [
        { label: "Dimensions (W × D × H)", value: "" },
        { label: "Weight", value: "" },
        { label: "Fuel", value: "" },
        { label: "Finish", value: "" },
      ],
      features: [],
      variations: [],
      featured: false,
      published: true,
      sortOrder: 0,
      seoTitle: "",
      seoDescription: "",
      images: [],
    },
  );
  const [featuresText, setFeaturesText] = useState(d.features.join("\n"));
  const [variationsText, setVariationsText] = useState(d.variations.join("\n"));

  const set = <K extends keyof ProductData>(k: K, v: ProductData[K]) => setD((prev) => ({ ...prev, [k]: v }));
  const err = (k: string) => result?.errors?.[k];

  const lines = (t: string) => t.split("\n").map((l) => l.trim()).filter(Boolean);

  async function onUpload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setResult(null);
    try {
      const uploaded = await uploadImages(files);
      set("images", [...d.images, ...uploaded.map((u) => ({ ...u, alt: d.name }))]);
    } catch (e) {
      setResult({ ok: false, message: (e as Error).message });
    } finally {
      setUploading(false);
    }
  }

  function moveImage(i: number, dir: -1 | 1) {
    const imgs = [...d.images];
    const j = i + dir;
    if (j < 0 || j >= imgs.length) return;
    [imgs[i], imgs[j]] = [imgs[j], imgs[i]];
    set("images", imgs);
  }

  function save() {
    const payload = {
      ...d,
      specs: d.specs.filter((s) => s.label.trim()),
      features: lines(featuresText),
      variations: lines(variationsText),
    };
    startTransition(async () => {
      const res = await saveProductAction(product?.id ?? null, payload);
      setResult(res);
      if (res?.ok && !product?.id && res.id) router.push(`/admin/products/${res.id}?saved=1`);
      else if (res?.ok) router.refresh();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  function remove() {
    if (!product?.id) return;
    if (!confirm(`Delete “${product.name}”? This cannot be undone. Existing enquiries are kept.`)) return;
    startTransition(() => deleteProductAction(product.id!));
  }

  const Section = ({ title, children, hint }: { title: string; hint?: string; children: React.ReactNode }) => (
    <section className="bg-paper p-6 sm:p-8">
      <h2 className="text-2xl">{title}</h2>
      {hint && <p className="mt-1 text-[13px] text-metal">{hint}</p>}
      <div className="mt-6 space-y-5">{children}</div>
    </section>
  );
  const FieldError = ({ k }: { k: string }) => (err(k) ? <p className="mt-1.5 text-[13px] text-red">{err(k)}</p> : null);

  return (
    <form
      className="mt-8 space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      {result?.message && (
        <p role={result.ok ? "status" : "alert"} className={cn("border-l-2 bg-paper px-5 py-3 text-[14px]", result.ok ? "border-[#1f7a4d]" : "border-red text-red")}>
          {result.message}
        </p>
      )}

      {Section({
        title: "Basics",
        children: (
          <>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="field-label" htmlFor="name">Product name *</label>
                <input
                  id="name"
                  className="field"
                  value={d.name}
                  aria-invalid={err("name") ? "true" : undefined}
                  onChange={(e) => {
                    const name = e.target.value;
                    setD((prev) => ({ ...prev, name, slug: slugTouched ? prev.slug : slugify(name) }));
                  }}
                  required
                />
                <FieldError k="name" />
              </div>
              <div>
                <label className="field-label" htmlFor="slug">URL slug *</label>
                <div className="flex items-center border border-stone bg-linen focus-within:border-charcoal">
                  <span className="pl-3 text-[13px] text-metal">/products/</span>
                  <input
                    id="slug"
                    className="w-full bg-transparent px-1 py-3.5 text-[15px] outline-none"
                    value={d.slug}
                    onChange={(e) => {
                      setSlugTouched(true);
                      set("slug", slugify(e.target.value));
                    }}
                    required
                  />
                </div>
                <FieldError k="slug" />
              </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <label className="field-label" htmlFor="categoryId">Category *</label>
                <select id="categoryId" className="field" value={d.categoryId} onChange={(e) => set("categoryId", e.target.value)}>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <FieldError k="categoryId" />
              </div>
              <div>
                <label className="field-label" htmlFor="sortOrder">Display order</label>
                <input id="sortOrder" type="number" min={0} className="field" value={d.sortOrder} onChange={(e) => set("sortOrder", Number(e.target.value) || 0)} />
              </div>
            </div>
            <div className="flex flex-wrap gap-8">
              <label className="flex items-center gap-3 text-[15px]">
                <input type="checkbox" className="h-4 w-4 accent-red" checked={d.published} onChange={(e) => set("published", e.target.checked)} />
                Published (visible on website)
              </label>
              <label className="flex items-center gap-3 text-[15px]">
                <input type="checkbox" className="h-4 w-4 accent-red" checked={d.featured} onChange={(e) => set("featured", e.target.checked)} />
                Featured on home page
              </label>
            </div>
          </>
        ),
      })}

      {Section({
        title: "Photographs",
        hint: "The first image is the cover. JPG, PNG, WebP or AVIF up to 8 MB — images are optimised automatically.",
        children: (
          <>
            {d.images.length > 0 && (
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {d.images.map((img, i) => (
                  <li key={img.url + i} className="border border-stone bg-linen">
                    <div className="relative aspect-[4/5] bg-sand">
                      <SmartImage src={img.url} alt={img.alt} fill sizes="300px" className="object-cover" />
                      {i === 0 && <span className="absolute top-2 left-2 bg-charcoal px-2 py-1 text-[10px] font-semibold tracking-[0.15em] text-paper uppercase">Cover</span>}
                    </div>
                    <div className="space-y-2 p-3">
                      <input
                        aria-label={`Alt text for image ${i + 1}`}
                        placeholder="Describe the image (alt text)"
                        className="field !py-2 !text-[13px]"
                        value={img.alt}
                        onChange={(e) => set("images", d.images.map((x, j) => (j === i ? { ...x, alt: e.target.value } : x)))}
                      />
                      <div className="flex justify-between text-[12px] font-semibold uppercase">
                        <span className="flex gap-3">
                          <button type="button" onClick={() => moveImage(i, -1)} disabled={i === 0} className="disabled:opacity-30">← Left</button>
                          <button type="button" onClick={() => moveImage(i, 1)} disabled={i === d.images.length - 1} className="disabled:opacity-30">Right →</button>
                        </span>
                        <button type="button" className="text-red" onClick={() => set("images", d.images.filter((_, j) => j !== i))}>Remove</button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <label className={cn("flex cursor-pointer flex-col items-center justify-center border-2 border-dashed border-stone px-6 py-10 text-center transition-colors hover:border-charcoal", uploading && "pointer-events-none opacity-60")}>
              <span className="font-semibold">{uploading ? "Uploading…" : "Click to upload photographs"}</span>
              <span className="mt-1 text-[13px] text-metal">You can select several images at once</span>
              <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple className="sr-only" onChange={(e) => { onUpload(e.target.files); e.target.value = ""; }} />
            </label>
          </>
        ),
      })}

      {Section({
        title: "Descriptions",
        children: (
          <>
            <div>
              <label className="field-label" htmlFor="shortDescription">Short description <span className="normal-case tracking-normal">(cards & search results, max 300)</span></label>
              <textarea id="shortDescription" rows={2} maxLength={300} className="field" value={d.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} />
            </div>
            <div>
              <label className="field-label" htmlFor="description">Full description <span className="normal-case tracking-normal">(leave a blank line between paragraphs)</span></label>
              <textarea id="description" rows={8} className="field" value={d.description} onChange={(e) => set("description", e.target.value)} />
            </div>
          </>
        ),
      })}

      {Section({
        title: "Technical specifications",
        hint: "Leave a value empty to show “On request” on the website. Only enter verified information.",
        children: (
          <>
            <ul className="space-y-3">
              {d.specs.map((s, i) => (
                <li key={i} className="grid grid-cols-[1fr_1fr_auto] gap-3">
                  <input
                    aria-label="Specification name"
                    list="spec-presets"
                    placeholder="e.g. Weight"
                    className="field !py-2.5"
                    value={s.label}
                    onChange={(e) => set("specs", d.specs.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))}
                  />
                  <input
                    aria-label={`Value for ${s.label || "specification"}`}
                    placeholder="Value (or leave empty)"
                    className="field !py-2.5"
                    value={s.value}
                    onChange={(e) => set("specs", d.specs.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))}
                  />
                  <button type="button" aria-label="Remove specification" className="px-3 text-red" onClick={() => set("specs", d.specs.filter((_, j) => j !== i))}>✕</button>
                </li>
              ))}
            </ul>
            <datalist id="spec-presets">{SPEC_PRESETS.map((p) => <option key={p} value={p} />)}</datalist>
            <button type="button" className="btn-outline-dark !py-2.5" onClick={() => set("specs", [...d.specs, { label: "", value: "" }])}>+ Add specification</button>
          </>
        ),
      })}

      {Section({
        title: "Features & variations",
        children: (
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="field-label" htmlFor="features">Features <span className="normal-case tracking-normal">(one per line)</span></label>
              <textarea id="features" rows={7} className="field" value={featuresText} onChange={(e) => setFeaturesText(e.target.value)} />
            </div>
            <div>
              <label className="field-label" htmlFor="variations">Available variations <span className="normal-case tracking-normal">(one per line)</span></label>
              <textarea id="variations" rows={7} className="field" placeholder={"e.g. Matte black\nWith hearth tray"} value={variationsText} onChange={(e) => setVariationsText(e.target.value)} />
            </div>
          </div>
        ),
      })}

      {Section({
        title: "Search engine (optional)",
        hint: "Defaults to the product name and short description.",
        children: (
          <>
            <div>
              <label className="field-label" htmlFor="seoTitle">SEO title</label>
              <input id="seoTitle" maxLength={120} className="field" value={d.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} />
            </div>
            <div>
              <label className="field-label" htmlFor="seoDescription">Meta description</label>
              <textarea id="seoDescription" rows={2} maxLength={300} className="field" value={d.seoDescription} onChange={(e) => set("seoDescription", e.target.value)} />
            </div>
          </>
        ),
      })}

      <div className="sticky bottom-0 z-10 -mx-5 flex flex-wrap items-center justify-between gap-4 border-t border-stone bg-linen/95 px-5 py-4 backdrop-blur sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12">
        {product?.id ? (
          <button type="button" onClick={remove} disabled={pending} className="text-[12px] font-semibold tracking-[0.15em] text-red uppercase hover:text-red-bright">
            Delete product
          </button>
        ) : <span />}
        <button type="submit" disabled={pending || uploading} className="btn-primary">
          {pending ? "Saving…" : product?.id ? "Save changes" : "Create product"}
        </button>
      </div>
    </form>
  );
}
