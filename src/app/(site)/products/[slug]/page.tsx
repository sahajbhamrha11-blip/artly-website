import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductCard } from "@/components/ProductCard";
import { EnquiryForm } from "@/components/EnquiryForm";
import { JsonLd } from "@/components/JsonLd";
import { Reveal } from "@/components/Reveal";
import { ArrowRight, Check, Phone, WhatsApp } from "@/components/Icons";
import { getProductBySlug, getRelatedProducts } from "@/lib/products";
import { getSettings } from "@/lib/settings";
import { siteUrl, telHref, whatsappHref } from "@/lib/utils";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  if (!p) return { title: "Product not found", robots: { index: false } };
  const title = p.seoTitle || `${p.name} — ${p.category.name.replace(/s$/, "")}`;
  const description = p.seoDescription || p.shortDescription;
  const image = p.coverImage?.url;
  return {
    title,
    description,
    alternates: { canonical: `/products/${p.slug}` },
    openGraph: {
      title: `${p.name} | ARTLY`,
      description,
      url: `/products/${p.slug}`,
      images: image ? [{ url: image, alt: p.coverImage?.alt || p.name }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [related, s] = await Promise.all([getRelatedProducts(product), getSettings()]);
  const wa = whatsappHref(
    s.whatsappNumber,
    `Hello ARTLY, I'm interested in the ${product.name}. ${siteUrl(`/products/${product.slug}`)}`,
  );
  const interest = product.category.slug === "cooking-stoves" ? "Cooking Stove" : product.category.slug === "fireplaces" ? "Fireplace" : "Other";
  const paragraphs = product.description.split(/\n\s*\n/).filter(Boolean);

  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      description: product.shortDescription || product.description.slice(0, 300),
      image: product.images.map((i) => siteUrl(i.url)),
      brand: { "@type": "Brand", name: "ARTLY" },
      category: product.category.name,
      url: siteUrl(`/products/${product.slug}`),
      additionalProperty: product.specList
        .filter((sp) => sp.value)
        .map((sp) => ({ "@type": "PropertyValue", name: sp.label, value: sp.value })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: siteUrl("/") },
        { "@type": "ListItem", position: 2, name: "Products", item: siteUrl("/products") },
        { "@type": "ListItem", position: 3, name: product.category.name, item: siteUrl(`/products?category=${product.category.slug}`) },
        { "@type": "ListItem", position: 4, name: product.name, item: siteUrl(`/products/${product.slug}`) },
      ],
    },
  ];

  return (
    <>
      <JsonLd data={ld} />

      <nav aria-label="Breadcrumb" className="border-b border-stone bg-paper">
        <ol className="container-x flex flex-wrap items-center gap-2 py-4 text-[12px] tracking-[0.12em] text-metal uppercase">
          <li><Link href="/" className="hover:text-charcoal">Home</Link></li>
          <li aria-hidden>/</li>
          <li><Link href="/products" className="hover:text-charcoal">Products</Link></li>
          <li aria-hidden>/</li>
          <li><Link href={`/products?category=${product.category.slug}`} className="hover:text-charcoal">{product.category.name}</Link></li>
          <li aria-hidden>/</li>
          <li aria-current="page" className="text-charcoal">{product.name}</li>
        </ol>
      </nav>

      <section className="bg-paper py-12 lg:py-20">
        <div className="container-x grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <div className="lg:sticky lg:top-28">
              <ProductGallery images={product.images.map((i) => ({ url: i.url, alt: i.alt }))} name={product.name} />
            </div>
          </div>

          <div className="lg:col-span-5">
            <p className="eyebrow animate-fade-up text-red">{product.category.name}</p>
            <h1 className="mt-5 animate-fade-up text-5xl leading-[1.02] sm:text-6xl [animation-delay:100ms]">{product.name}</h1>
            <p className="mt-6 animate-fade-up text-[18px] leading-relaxed text-metal [animation-delay:200ms]">{product.shortDescription}</p>

            <div className="mt-9 flex animate-fade-up flex-col gap-3 sm:flex-row [animation-delay:300ms]">
              <a href="#enquire" className="btn-primary flex-1">
                Enquire now <ArrowRight />
              </a>
              {wa ? (
                <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-whatsapp flex-1">
                  <WhatsApp /> WhatsApp
                </a>
              ) : s.contactPhone ? (
                <a href={telHref(s.contactPhone)} className="btn-outline-dark flex-1">
                  <Phone className="h-4 w-4" /> Call us
                </a>
              ) : (
                <Link href={`/contact?product=${product.slug}#enquiry`} className="btn-outline-dark flex-1">
                  Contact us
                </Link>
              )}
            </div>

            {product.featureList.length > 0 && (
              <div className="mt-12 border-t border-stone pt-8">
                <h2 className="text-[12px] font-semibold tracking-[0.22em] text-charcoal uppercase font-sans">Key features</h2>
                <ul className="mt-5 space-y-3">
                  {product.featureList.map((f) => (
                    <li key={f} className="flex gap-3 text-[15px] leading-relaxed text-charcoal/85">
                      <Check className="mt-1 h-4 w-4 shrink-0 text-red" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {product.variationList.length > 0 && (
              <div className="mt-10 border-t border-stone pt-8">
                <h2 className="text-[12px] font-semibold tracking-[0.22em] text-charcoal uppercase font-sans">Available variations</h2>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {product.variationList.map((v) => (
                    <li key={v} className="border border-stone px-4 py-2 text-[14px]">{v}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-10 border-t border-stone pt-8">
              <h2 className="text-[12px] font-semibold tracking-[0.22em] text-charcoal uppercase font-sans">About this product</h2>
              <div className="mt-5 space-y-5 text-[16px] leading-[1.8] text-metal">
                {paragraphs.map((para, i) => <p key={i}>{para}</p>)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {product.specList.length > 0 && (
        <section className="bg-linen py-20 lg:py-28" aria-labelledby="specs-heading">
          <div className="container-x grid gap-12 lg:grid-cols-12">
            <Reveal className="lg:col-span-4">
              <p className="eyebrow text-red">Specifications</p>
              <h2 id="specs-heading" className="mt-5 text-5xl">Technical details</h2>
              <p className="mt-5 text-[15px] leading-relaxed text-metal">
                Details marked “On request” are available from our team. Contact us for exact measurements and requirements.
              </p>
            </Reveal>
            <Reveal delay={100} className="lg:col-span-7 lg:col-start-6">
              <dl className="divide-y divide-stone border-y border-stone">
                {product.specList.map((sp) => (
                  <div key={sp.label} className="grid grid-cols-2 gap-6 py-5">
                    <dt className="text-[13px] font-semibold tracking-[0.12em] text-metal uppercase">{sp.label}</dt>
                    <dd className={sp.value ? "text-[15px] text-charcoal" : "text-[15px] text-steel italic"}>{sp.value || "On request"}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </section>
      )}

      <section id="enquire" className="grain relative scroll-mt-24 overflow-hidden bg-charcoal py-20 text-paper lg:py-28">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="eyebrow text-ember">Enquire</p>
            <h2 className="mt-5 text-5xl">Interested in the {product.name}?</h2>
            <p className="mt-5 text-[15px] leading-relaxed text-steel">
              Send us your details and requirements. We&apos;ll get back to you with availability, specifications and customisation options.
            </p>
          </div>
          <div className="lg:col-span-7 lg:col-start-6">
            <EnquiryForm tone="dark" product={{ slug: product.slug, name: product.name }} defaultInterest={interest} />
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="bg-paper py-20 lg:py-28" aria-labelledby="related-heading">
          <div className="container-x">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <h2 id="related-heading" className="text-5xl">You may also like</h2>
              <Link href="/products" className="link-underline text-[12px] font-semibold tracking-[0.2em] uppercase">
                View all products <ArrowRight />
              </Link>
            </div>
            <div className="mt-12 grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p, i) => (
                <Reveal key={p.id} delay={i * 100}>
                  <ProductCard product={p} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
