import Link from "next/link";
import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHero } from "@/components/PageHero";
import { ProductCard } from "@/components/ProductCard";
import { ProductFilters } from "@/components/ProductFilters";
import { Reveal } from "@/components/Reveal";
import { ArrowRight } from "@/components/Icons";
import { getCategories, getProducts } from "@/lib/products";

type SP = Promise<{ category?: string; q?: string }>;

export async function generateMetadata({ searchParams }: { searchParams: SP }): Promise<Metadata> {
  const { category } = await searchParams;
  const cats = await getCategories();
  const cat = cats.find((c) => c.slug === category);
  if (cat) {
    return {
      title: `${cat.name} — ARTLY Collection`,
      description: cat.description || `Explore ARTLY ${cat.name.toLowerCase()}.`,
      alternates: { canonical: `/products?category=${cat.slug}` },
    };
  }
  return {
    title: "Products — Fireplaces, Wood Burning & Cooking Stoves",
    description:
      "Browse the ARTLY collection of wood-burning fireplaces, heating stoves and wood oven cooking stoves. Search and filter by category.",
    alternates: { canonical: "/products" },
  };
}

function ResultsSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading products" className="grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-[4/5] bg-sand" />
          <div className="mt-6 h-7 w-2/3 bg-sand" />
          <div className="mt-4 h-4 w-full bg-sand/70" />
          <div className="mt-2 h-4 w-4/5 bg-sand/70" />
        </div>
      ))}
    </div>
  );
}

async function Results({ category, query, categoryName }: { category: string; query: string; categoryName?: string }) {
  const products = await getProducts({ category: category || undefined, q: query || undefined });
  return (
    <>
      <p className="mb-10 text-[13px] tracking-[0.16em] text-metal uppercase" aria-live="polite">
        {products.length} {products.length === 1 ? "product" : "products"}
        {query && <> matching “{query}”</>}
        {categoryName && <> in {categoryName}</>}
      </p>

      {products.length > 0 ? (
        <div className="grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p, i) => (
            <Reveal key={p.id} delay={(i % 3) * 100}>
              <ProductCard product={p} priority={i < 3} />
            </Reveal>
          ))}
        </div>
      ) : (
        <div className="mx-auto max-w-lg py-20 text-center">
          <h2 className="text-4xl">No products found</h2>
          <p className="mt-4 text-metal">
            We couldn&apos;t find anything matching your search. Try a different term, or ask us — we also offer customisation.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/products" className="btn-dark">View all products</Link>
            <Link href="/contact#enquiry" className="btn-outline-dark">Ask ARTLY <ArrowRight /></Link>
          </div>
        </div>
      )}
    </>
  );
}

export default async function ProductsPage({ searchParams }: { searchParams: SP }) {
  const { category = "", q = "" } = await searchParams;
  const query = q.slice(0, 80);
  const categories = await getCategories();
  const activeCat = categories.find((c) => c.slug === category);

  return (
    <>
      <PageHero
        eyebrow="The collection"
        title={activeCat ? activeCat.name : <>Fireplaces &amp; <span className="text-ember italic">cooking stoves</span></>}
        intro={
          activeCat?.description ||
          "Every ARTLY piece pairs a matte black body with our signature embossed detailing. Filter by category or search to find yours."
        }
        image={activeCat?.image || "/images/products/panorama-fireplace-front.jpg"}
        imageAlt={activeCat ? `ARTLY ${activeCat.name}` : "ARTLY Panorama Fireplace"}
      />

      <Suspense>
        <ProductFilters categories={categories.map((c) => ({ slug: c.slug, name: c.name, count: c._count.products }))} />
      </Suspense>

      <section className="bg-paper py-16 lg:py-24">
        <div className="container-x">
          <Suspense key={`${category}|${query}`} fallback={<ResultsSkeleton />}>
            <Results category={category} query={query} categoryName={activeCat?.name} />
          </Suspense>
        </div>
      </section>
    </>
  );
}
