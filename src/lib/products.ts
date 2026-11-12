import { cache } from "react";
import type { Prisma } from "@prisma/client";
import { db } from "./db";
import { safeJsonArray } from "./utils";

export type Spec = { label: string; value: string };

const productInclude = {
  category: true,
  images: { orderBy: { sortOrder: "asc" } },
} satisfies Prisma.ProductInclude;

export type ProductWithRelations = Prisma.ProductGetPayload<{ include: typeof productInclude }>;

export function parseProduct(p: ProductWithRelations) {
  return {
    ...p,
    specList: safeJsonArray<Spec>(p.specs).filter((s) => s && s.label),
    featureList: safeJsonArray<string>(p.features).filter(Boolean),
    variationList: safeJsonArray<string>(p.variations).filter(Boolean),
    coverImage: p.images[0] ?? null,
  };
}

export type Product = ReturnType<typeof parseProduct>;

export const getCategories = cache(async () =>
  db.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { products: { where: { published: true } } } } },
  }),
);

export async function getProducts(opts: { category?: string; q?: string; featured?: boolean; take?: number } = {}) {
  const where: Prisma.ProductWhereInput = { published: true };
  if (opts.category) where.category = { slug: opts.category };
  if (opts.featured) where.featured = true;
  if (opts.q) {
    const q = opts.q.trim();
    where.OR = [
      { name: { contains: q } },
      { shortDescription: { contains: q } },
      { description: { contains: q } },
      { features: { contains: q } },
      { category: { name: { contains: q } } },
    ];
  }
  const rows = await db.product.findMany({
    where,
    include: productInclude,
    orderBy: [{ category: { sortOrder: "asc" } }, { sortOrder: "asc" }, { createdAt: "desc" }],
    take: opts.take,
  });
  return rows.map(parseProduct);
}

export const getProductBySlug = cache(async (slug: string) => {
  const p = await db.product.findFirst({ where: { slug, published: true }, include: productInclude });
  return p ? parseProduct(p) : null;
});

export async function getRelatedProducts(product: Product, take = 3) {
  const same = await db.product.findMany({
    where: { published: true, categoryId: product.categoryId, NOT: { id: product.id } },
    include: productInclude,
    orderBy: [{ featured: "desc" }, { sortOrder: "asc" }],
    take,
  });
  let rows = same;
  if (rows.length < take) {
    const others = await db.product.findMany({
      where: { published: true, NOT: { id: { in: [product.id, ...rows.map((r) => r.id)] } } },
      include: productInclude,
      orderBy: [{ featured: "desc" }, { sortOrder: "asc" }],
      take: take - rows.length,
    });
    rows = [...rows, ...others];
  }
  return rows.map(parseProduct);
}
