import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { safeJsonArray } from "@/lib/utils";
import type { Spec } from "@/lib/products";
import { ProductEditor } from "../ProductEditor";

export const metadata = { title: "Edit product" };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [p, categories] = await Promise.all([
    db.product.findUnique({ where: { id }, include: { images: { orderBy: { sortOrder: "asc" } } } }),
    db.category.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!p) notFound();

  return (
    <div className="max-w-5xl">
      <Link href="/admin/products" className="text-[12px] font-semibold tracking-[0.15em] text-metal uppercase hover:text-charcoal">← Products</Link>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-5xl">{p.name}</h1>
        {p.published && <Link href={`/products/${p.slug}`} target="_blank" className="btn-outline-dark !py-3">View on site ↗</Link>}
      </div>
      <ProductEditor
        categories={categories}
        product={{
          id: p.id,
          name: p.name,
          slug: p.slug,
          categoryId: p.categoryId,
          shortDescription: p.shortDescription,
          description: p.description,
          specs: safeJsonArray<Spec>(p.specs),
          features: safeJsonArray<string>(p.features),
          variations: safeJsonArray<string>(p.variations),
          featured: p.featured,
          published: p.published,
          sortOrder: p.sortOrder,
          seoTitle: p.seoTitle,
          seoDescription: p.seoDescription,
          images: p.images.map((i) => ({ url: i.url, alt: i.alt })),
        }}
      />
    </div>
  );
}
