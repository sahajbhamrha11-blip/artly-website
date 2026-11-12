import Link from "next/link";
import type { Metadata } from "next";
import { SmartImage } from "@/components/SmartImage";
import { Reveal } from "@/components/Reveal";
import { ProductCard } from "@/components/ProductCard";
import { JsonLd } from "@/components/JsonLd";
import { ArrowRight } from "@/components/Icons";
import { getCategories, getProducts } from "@/lib/products";
import { getSettings, SOCIAL_KEYS } from "@/lib/settings";
import { siteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: { absolute: "ARTLY — Fireplaces, Wood Burning & Cooking Stoves | Deliver Comfort" },
  description:
    "Thoughtfully designed wood-burning fireplaces, heating stoves and wood oven cooking stoves from ARTLY — warmth, functionality and elegance for every space.",
  alternates: { canonical: "/" },
};

const WHY = [
  { title: "Quality Construction", text: "Sturdy metal bodies, richly detailed door frames and robust fittings — made to be used season after season." },
  { title: "Functional Design", text: "Viewing glass, controllable airflow and practical layouts that make everyday use simple and satisfying." },
  { title: "Reliable Performance", text: "Products designed to deliver steady, dependable warmth — and, on our cooking stoves, a working oven too." },
  { title: "Attention to Detail", text: "Embossed scrollwork, brushed metal knobs and a refined matte finish. The details are what make it ARTLY." },
  { title: "Customer-Focused Solutions", text: "We listen to your space and your needs, and offer customisation of our models to suit your requirements." },
];

export default async function HomePage() {
  const [settings, categories, featured] = await Promise.all([
    getSettings(),
    getCategories(),
    getProducts({ featured: true, take: 6 }),
  ]);
  const heroProduct = featured.find((p) => p.coverImage?.url === settings.heroImage) ?? featured[0];
  const [h1a, ...h1rest] = settings.heroHeadline.split(". ");
  const h1b = h1rest.join(". ");

  const orgLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "ARTLY",
    slogan: "Deliver Comfort",
    url: siteUrl("/"),
    logo: siteUrl("/images/brand/artly-logo.png"),
    ...(settings.contactEmail && { email: settings.contactEmail }),
    ...(settings.contactPhone && { telephone: settings.contactPhone }),
    sameAs: SOCIAL_KEYS.map(({ key }) => settings[key]).filter(Boolean),
  };

  return (
    <>
      <JsonLd data={orgLd} />

      {/* ── 1. HERO ─────────────────────────────────────── */}
      <section className="grain relative overflow-hidden bg-coal text-paper">
        <div className="ember-glow pointer-events-none absolute top-1/3 right-[12%] h-[620px] w-[620px] animate-flicker" />
        <div className="container-x relative grid min-h-[calc(100svh-84px)] items-center gap-12 py-16 lg:grid-cols-12 lg:py-0">
          <div className="lg:col-span-6 xl:col-span-6">
            <p className="eyebrow animate-fade-up text-ember">Fireplaces · Cooking Stoves</p>
            <h1 className="mt-7 text-[52px] leading-[0.98] sm:text-7xl xl:text-[96px]">
              <span className="block animate-fade-up [animation-delay:120ms]">{h1b ? `${h1a}.` : h1a}</span>
              {h1b && <span className="block animate-fade-up text-ember italic [animation-delay:260ms]">{h1b}</span>}
            </h1>
            <p className="mt-8 max-w-lg animate-fade-up text-[17px] leading-relaxed text-steel [animation-delay:400ms]">
              {settings.heroSubtext}
            </p>
            <div className="mt-11 flex animate-fade-up flex-wrap gap-4 [animation-delay:520ms]">
              <Link href="/products" className="btn-primary">
                Explore our products <ArrowRight />
              </Link>
              <Link href="/contact" className="btn-outline-light">
                Contact us
              </Link>
            </div>
          </div>

          <div className="relative lg:col-span-6 lg:col-start-7 lg:h-[calc(100svh-84px)] lg:py-12">
            <div className="relative mx-auto aspect-[4/5] w-full max-w-[560px] overflow-hidden lg:h-full lg:max-w-none lg:aspect-auto">
              <SmartImage
                src={settings.heroImage}
                alt={heroProduct?.coverImage?.alt || "ARTLY wood-burning stove"}
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 92vw"
                className="animate-kenburns object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-coal/80 via-coal/5 to-coal/20" />
              <div className="absolute inset-0 shadow-[inset_0_0_120px_rgba(13,12,11,0.65)]" />
              {heroProduct && (
                <Link
                  href={`/products/${heroProduct.slug}`}
                  className="group absolute right-5 bottom-5 left-5 flex items-center justify-between border border-paper/15 bg-coal/55 px-5 py-4 backdrop-blur-md transition-colors hover:bg-coal/75 sm:left-auto sm:min-w-[300px]"
                >
                  <span>
                    <span className="block text-[10px] tracking-[0.3em] text-steel uppercase">Featured</span>
                    <span className="font-display text-2xl">{heroProduct.name}</span>
                  </span>
                  <ArrowRight className="h-5 w-5 transition-transform duration-500 group-hover:translate-x-1" />
                </Link>
              )}
            </div>
          </div>
        </div>
        <div className="border-t border-paper/10">
          <div className="container-x grid grid-cols-1 divide-y divide-paper/10 text-[11px] tracking-[0.26em] text-steel uppercase sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {["Wood-burning fireplaces", "Wood oven cooking stoves", "Customisation on request"].map((t) => (
              <p key={t} className="py-5 sm:px-6 sm:first:pl-0">{t}</p>
            ))}
          </div>
        </div>
      </section>

      {/* ── 2. INTRODUCTION ─────────────────────────────── */}
      <section className="bg-paper py-24 lg:py-36">
        <div className="container-x grid items-center gap-14 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <p className="eyebrow text-red">About ARTLY</p>
            <h2 className="mt-6 text-5xl leading-[1.04] sm:text-6xl">{settings.introHeading}</h2>
            <p className="mt-8 text-[17px] leading-[1.8] text-metal">{settings.introText}</p>
            <Link href="/about" className="btn-outline-dark mt-10">
              Discover our story <ArrowRight />
            </Link>
          </Reveal>
          <Reveal delay={150} className="lg:col-span-6 lg:col-start-7">
            <div className="grid grid-cols-5 gap-4">
              <div className="relative col-span-3 aspect-[3/4] overflow-hidden bg-sand">
                <SmartImage
                  src="/images/details/scrollwork.jpg"
                  alt="Embossed scrollwork detail on an ARTLY stove door"
                  fill
                  sizes="(min-width: 1024px) 28vw, 60vw"
                  className="object-cover"
                />
              </div>
              <div className="col-span-2 flex flex-col gap-4">
                <div className="relative aspect-square overflow-hidden bg-sand">
                  <SmartImage
                    src="/images/details/knob.jpg"
                    alt="Brushed metal door knob on an ARTLY stove"
                    fill
                    sizes="(min-width: 1024px) 18vw, 40vw"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col justify-end bg-charcoal p-6 text-paper">
                  <p className="font-display text-4xl leading-none italic">Deliver</p>
                  <p className="font-display text-4xl leading-none text-ember italic">Comfort.</p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── 3. CATEGORIES ───────────────────────────────── */}
      <section className="bg-linen pb-24 lg:pb-36" aria-labelledby="categories-heading">
        <div className="container-x">
          <Reveal className="flex flex-col justify-between gap-6 border-t border-stone pt-14 md:flex-row md:items-end">
            <div>
              <p className="eyebrow text-red">Our collections</p>
              <h2 id="categories-heading" className="mt-5 text-5xl sm:text-6xl">Two ways to bring warmth home</h2>
            </div>
            <Link href="/products" className="link-underline text-[12px] font-semibold tracking-[0.2em] uppercase">
              View all products <ArrowRight />
            </Link>
          </Reveal>
          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {categories.map((c, i) => (
              <Reveal key={c.id} delay={i * 140}>
                <Link href={`/products?category=${c.slug}`} className="group relative block aspect-[4/5] overflow-hidden bg-coal text-paper sm:aspect-[5/6]">
                  {c.image && (
                    <SmartImage
                      src={c.image}
                      alt={`ARTLY ${c.name}`}
                      fill
                      sizes="(min-width: 768px) 48vw, 92vw"
                      className="object-cover opacity-85 transition-transform duration-[1600ms] ease-out-soft group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-coal via-coal/30 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-8 sm:p-10">
                    <p className="text-[11px] tracking-[0.3em] text-ember uppercase">
                      0{i + 1} — {c._count.products} {c._count.products === 1 ? "model" : "models"}
                    </p>
                    <h3 className="mt-3 text-5xl sm:text-6xl">{c.name}</h3>
                    {c.tagline && <p className="mt-2 font-display text-2xl text-paper/80 italic">{c.tagline}</p>}
                    <p className="mt-5 max-w-md text-[15px] leading-relaxed text-paper/75">{c.description}</p>
                    <span className="btn-outline-light mt-8 group-hover:border-paper group-hover:bg-paper group-hover:text-charcoal">
                      Explore products <ArrowRight />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. FEATURED PRODUCTS ────────────────────────── */}
      {featured.length > 0 && (
        <section className="bg-paper py-24 lg:py-36" aria-labelledby="featured-heading">
          <div className="container-x">
            <Reveal className="max-w-2xl">
              <p className="eyebrow text-red">Featured</p>
              <h2 id="featured-heading" className="mt-5 text-5xl sm:text-6xl">Signature pieces</h2>
              <p className="mt-6 text-[17px] leading-relaxed text-metal">
                A selection from the ARTLY collection — each one finished in matte black with our signature embossed detailing.
              </p>
            </Reveal>
            <div className="mt-16 grid gap-x-8 gap-y-16 sm:grid-cols-2 xl:grid-cols-4">
              {featured.slice(0, 4).map((p, i) => (
                <Reveal key={p.id} delay={i * 110}>
                  <ProductCard product={p} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 5. WHY ARTLY ────────────────────────────────── */}
      <section className="grain relative overflow-hidden bg-charcoal py-24 text-paper lg:py-36" aria-labelledby="why-heading">
        <div className="container-x grid gap-16 lg:grid-cols-12">
          <Reveal className="lg:col-span-4">
            <p className="eyebrow text-ember">Why choose ARTLY</p>
            <h2 id="why-heading" className="mt-6 text-5xl leading-[1.04] sm:text-6xl">Made to be lived with.</h2>
            <p className="mt-7 text-[17px] leading-relaxed text-steel">
              A fireplace or stove is something you use every day. We design ours to earn that place in your home.
            </p>
            <div className="relative mt-10 hidden aspect-[4/5] overflow-hidden lg:block">
              <SmartImage
                src="/images/details/leg.jpg"
                alt="Decorative scrollwork leg of the ARTLY Panorama Fireplace"
                fill
                sizes="30vw"
                className="object-cover opacity-90"
              />
            </div>
          </Reveal>
          <ol className="lg:col-span-7 lg:col-start-6">
            {WHY.map((w, i) => (
              <Reveal as="li" key={w.title} delay={i * 90} className="group grid grid-cols-[64px_1fr] gap-6 border-t border-paper/12 py-9 last:border-b sm:grid-cols-[96px_1fr]">
                <span className="font-display text-3xl text-ember/80 italic sm:text-4xl">0{i + 1}</span>
                <div>
                  <h3 className="text-3xl transition-colors duration-500 group-hover:text-ember sm:text-4xl">{w.title}</h3>
                  <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-steel">{w.text}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ── 6. LIFESTYLE SHOWCASE ───────────────────────── */}
      <section className="bg-linen py-24 lg:py-36" aria-labelledby="lifestyle-heading">
        <div className="container-x">
          <Reveal className="mx-auto max-w-3xl text-center">
            <p className="eyebrow justify-center text-red">In your space</p>
            <h2 id="lifestyle-heading" className="mt-5 text-5xl sm:text-6xl">The heart of every room</h2>
            <p className="mt-6 text-[17px] leading-relaxed text-metal">
              From open-plan living rooms to kitchens and lounges, an ARTLY piece becomes the place everyone gathers.
            </p>
          </Reveal>
          <div className="mt-16 grid gap-5 md:grid-cols-12 md:grid-rows-2">
            {[
              { src: settings.lifestyleImage1, label: "Living rooms", cls: "md:col-span-7 md:row-span-2 aspect-[4/5] md:aspect-auto md:min-h-[720px]" },
              { src: settings.lifestyleImage2, label: "Kitchens & dining", cls: "md:col-span-5 aspect-[4/3] md:aspect-auto" },
              { src: settings.lifestyleImage3, label: "Lounges & retreats", cls: "md:col-span-5 aspect-[4/3] md:aspect-auto" },
            ].map((tile, i) => (
              <Reveal key={tile.label} delay={i * 120} className={`group relative overflow-hidden bg-coal ${tile.cls}`}>
                <SmartImage
                  src={tile.src}
                  alt={`ARTLY product for ${tile.label.toLowerCase()}`}
                  fill
                  sizes={i === 0 ? "(min-width: 768px) 58vw, 92vw" : "(min-width: 768px) 40vw, 92vw"}
                  className="object-cover transition-transform duration-[1800ms] ease-out-soft group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-coal/85 via-[rgba(107,74,54,0.15)] to-transparent mix-blend-multiply" />
                <div className="absolute inset-0 bg-gradient-to-t from-coal/70 via-transparent to-transparent" />
                <p className="absolute bottom-6 left-6 font-display text-3xl text-paper sm:text-4xl">{tile.label}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. CALL TO ACTION ───────────────────────────── */}
      <section className="grain relative overflow-hidden bg-coal py-28 text-center text-paper lg:py-40">
        <div className="ember-glow pointer-events-none absolute -bottom-72 left-1/2 h-[640px] w-[900px] -translate-x-1/2 animate-flicker" />
        <Reveal className="container-x relative">
          <p className="eyebrow justify-center text-ember">Deliver comfort</p>
          <h2 className="mx-auto mt-7 max-w-4xl text-5xl leading-[1.02] sm:text-7xl">{settings.ctaHeadline}</h2>
          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <Link href="/products" className="btn-primary">
              Explore our collection <ArrowRight />
            </Link>
            <Link href="/contact#enquiry" className="btn-outline-light">
              Talk to us
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
