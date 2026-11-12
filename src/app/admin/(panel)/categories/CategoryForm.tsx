"use client";

import { useRef, useState, useTransition } from "react";
import { deleteCategoryAction, saveCategoryAction, type ActionState } from "../../actions";
import { ImageField } from "../ImageField";
import { slugify, cn } from "@/lib/utils";

type Cat = { id: string; name: string; slug: string; tagline: string; description: string; image: string; sortOrder: number };

export function CategoryForm({ category, productCount = 0 }: { category?: Cat; productCount?: number }) {
  const [state, setState] = useState<ActionState>(null);
  const [pending, startSave] = useTransition();
  const [delState, setDelState] = useState<ActionState>(null);
  const [deleting, startDelete] = useTransition();
  const [slug, setSlug] = useState(category?.slug ?? "");
  const slugTouched = useRef(Boolean(category));

  const msg = delState ?? state;
  const err = (k: string) => state?.errors?.[k];

  return (
    <form
      className="bg-paper p-6 sm:p-8"
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const fd = new FormData(form);
        setDelState(null);
        startSave(async () => {
          const res = await saveCategoryAction(null, fd);
          setState(res);
          if (res?.ok && !category) {
            form.reset();
            setSlug("");
            slugTouched.current = false;
          }
        });
      }}
    >
      {category && <input type="hidden" name="id" value={category.id} />}
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-2xl">{category ? category.name : "New category"}</h3>
        {category && <span className="text-[12px] text-metal">{productCount} product{productCount === 1 ? "" : "s"}</span>}
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div>
          <label className="field-label" htmlFor={`name-${category?.id ?? "new"}`}>Name *</label>
          <input
            id={`name-${category?.id ?? "new"}`}
            name="name"
            className="field"
            defaultValue={category?.name}
            required
            onChange={(e) => !slugTouched.current && setSlug(slugify(e.target.value))}
          />
          {err("name") && <p className="mt-1 text-[13px] text-red">{err("name")}</p>}
        </div>
        <div>
          <label className="field-label" htmlFor={`slug-${category?.id ?? "new"}`}>Slug *</label>
          <input
            id={`slug-${category?.id ?? "new"}`}
            name="slug"
            className="field"
            value={slug}
            required
            onChange={(e) => {
              slugTouched.current = true;
              setSlug(slugify(e.target.value));
            }}
          />
          {err("slug") && <p className="mt-1 text-[13px] text-red">{err("slug")}</p>}
        </div>
        <div>
          <label className="field-label" htmlFor={`tagline-${category?.id ?? "new"}`}>Tagline</label>
          <input id={`tagline-${category?.id ?? "new"}`} name="tagline" className="field" defaultValue={category?.tagline} maxLength={120} />
        </div>
        <div>
          <label className="field-label" htmlFor={`sort-${category?.id ?? "new"}`}>Display order</label>
          <input id={`sort-${category?.id ?? "new"}`} name="sortOrder" type="number" min={0} className="field" defaultValue={category?.sortOrder ?? 0} />
        </div>
        <div className="sm:col-span-2">
          <label className="field-label" htmlFor={`desc-${category?.id ?? "new"}`}>Description</label>
          <textarea id={`desc-${category?.id ?? "new"}`} name="description" rows={3} className="field" defaultValue={category?.description} maxLength={1000} />
        </div>
        <div className="sm:col-span-2">
          <ImageField name="image" label="Category image" defaultValue={category?.image ?? ""} />
        </div>
      </div>

      {msg?.message && (
        <p role={msg.ok ? "status" : "alert"} className={cn("mt-5 text-[14px]", msg.ok ? "text-[#1f7a4d]" : "text-red")}>{msg.message}</p>
      )}

      <div className="mt-6 flex items-center justify-between gap-4">
        {category ? (
          <button
            type="button"
            disabled={deleting}
            className="text-[12px] font-semibold tracking-[0.15em] text-red uppercase disabled:opacity-50"
            onClick={() => {
              if (!confirm(`Delete category “${category.name}”?`)) return;
              startDelete(async () => setDelState(await deleteCategoryAction(category.id)));
            }}
          >
            Delete
          </button>
        ) : <span />}
        <button type="submit" disabled={pending} className="btn-dark !py-3">{pending ? "Saving…" : category ? "Save" : "Create category"}</button>
      </div>
    </form>
  );
}
