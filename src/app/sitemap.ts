import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { siteUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: siteUrl("/products"), lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: siteUrl("/about"), lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: siteUrl("/contact"), lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: siteUrl("/privacy"), lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];
  try {
    const [products, categories] = await Promise.all([
      db.product.findMany({ where: { published: true }, select: { slug: true, updatedAt: true, images: { select: { url: true }, orderBy: { sortOrder: "asc" } } } }),
      db.category.findMany({ select: { slug: true, updatedAt: true } }),
    ]);
    return [
      ...staticPages,
      ...categories.map((c) => ({ url: siteUrl(`/products?category=${c.slug}`), lastModified: c.updatedAt, changeFrequency: "weekly" as const, priority: 0.8 })),
      ...products.map((p) => ({
        url: siteUrl(`/products/${p.slug}`),
        lastModified: p.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.8,
        images: p.images.map((i) => siteUrl(i.url)),
      })),
    ];
  } catch {
    return staticPages;
  }
}
