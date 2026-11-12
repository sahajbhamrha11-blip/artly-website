import Link from "next/link";
import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { SmartImage } from "@/components/SmartImage";
import { ArrowRight } from "@/components/Icons";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "About Us — Fireplaces & Cooking Stoves Designed for Comfort",
  description:
    "Learn about ARTLY: our vision, mission and values in designing quality fireplaces, heating stoves and wood oven cooking stoves.",
  alternates: { canonical: "/about" },
};

const VALUES = [
  { title: "Quality", text: "Sound materials, careful construction and finishing we are proud to put our name on." },
  { title: "Innovation", text: "Always looking for better ways to combine heating, cooking and design in one piece." },
  { title: "Reliability", text: "Products that work as they should, day after day, season after season." },
  { title: "Customer satisfaction", text: "We listen first, and offer customisation so each piece suits its space." },
  { title: "Continuous improvement", text: "Every model, every detail, every process — open to being made better." },
];

export default async function AboutPage() {
  const s = await getSettings();
  return (
    <>
      <PageHero
        eyebrow="About ARTLY"
        title={<>Comfort is what <span className="text-ember italic">we deliver.</span></>}
        intro="We design fireplaces and cooking stoves that bring warmth, functionality and elegance to the heart of the home."
        image="/images/products/heritage-hearth-stove-front.jpg"
        imageAlt="ARTLY Heritage Hearth Stove"
      />

      {/* Who we are */}
      <section className="bg-paper py-24 lg:py-36">
        <div className="container-x grid items-start gap-14 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <div className="relative aspect-[4/5] overflow-hidden bg-sand">
              <SmartImage
                src="/images/products/twin-door-oven-stove-front.jpg"
                alt="ARTLY Twin Door Oven Stove"
                fill
                sizes="(min-width: 1024px) 40vw, 92vw"
                className="object-cover"
              />
            </div>
          </Reveal>
          <Reveal delay={120} className="lg:col-span-6 lg:col-start-7 lg:pt-10">
            <p className="eyebrow text-red">Who we are</p>
            <h2 className="mt-6 text-5xl leading-[1.05] sm:text-6xl">A brand built around warmth.</h2>
            <div className="mt-8 space-y-6 text-[17px] leading-[1.85] text-metal">
              {s.aboutWhoWeAre.split(/\n\s*\n/).map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
            <Link href="/products" className="btn-dark mt-10">
              See the collection <ArrowRight />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="grain relative overflow-hidden bg-charcoal text-paper">
        <div className="container-x grid md:grid-cols-2">
          {[
            { label: "Our vision", text: s.aboutVision },
            { label: "Our mission", text: s.aboutMission },
          ].map((b, i) => (
            <Reveal
              key={b.label}
              delay={i * 140}
              className={`py-20 md:py-28 ${i === 0 ? "md:border-r md:border-paper/10 md:pr-14" : "border-t border-paper/10 md:border-t-0 md:pl-14"}`}
            >
              <p className="eyebrow text-ember">{b.label}</p>
              <p className="mt-8 font-display text-4xl leading-[1.15] sm:text-5xl">{b.text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="bg-linen py-24 lg:py-36">
        <div className="container-x">
          <Reveal className="max-w-2xl">
            <p className="eyebrow text-red">Our values</p>
            <h2 className="mt-5 text-5xl sm:text-6xl">What guides every piece</h2>
          </Reveal>
          <div className="mt-16 grid gap-px bg-stone sm:grid-cols-2 lg:grid-cols-5">
            {VALUES.map((v, i) => (
              <Reveal key={v.title} delay={i * 90} className="group bg-linen p-8 transition-colors duration-500 hover:bg-paper lg:min-h-[300px]">
                <span className="font-display text-2xl text-red italic">0{i + 1}</span>
                <h3 className="mt-10 text-3xl">{v.title}</h3>
                <p className="mt-4 text-[15px] leading-relaxed text-metal">{v.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Craft strip */}
      <section className="bg-paper py-24 lg:py-32">
        <div className="container-x">
          <Reveal className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-xl">
              <p className="eyebrow text-red">Craftsmanship</p>
              <h2 className="mt-5 text-5xl sm:text-6xl">In the details</h2>
            </div>
            <p className="max-w-md text-[15px] leading-relaxed text-metal">
              Embossed scrollwork, brushed metal controls and a refined matte finish — the details that make each ARTLY piece recognisable.
            </p>
          </Reveal>
          <div className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { src: "/images/details/scrollwork.jpg", pos: "", alt: "Embossed scrollwork corner detail" },
              { src: "/images/details/knob.jpg", pos: "", alt: "Brushed metal door knob detail" },
              { src: "/images/details/badge.jpg", pos: "object-contain bg-[#2a2826]", alt: "ARTLY Deliver Comfort badge" },
              { src: "/images/details/leg.jpg", pos: "", alt: "Sculpted decorative leg" },
            ].map((d, i) => (
              <Reveal key={i} delay={i * 100} className="relative aspect-square overflow-hidden bg-sand">
                <SmartImage src={d.src} alt={d.alt} fill sizes="(min-width: 768px) 24vw, 46vw" className={d.pos || "object-cover"} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="grain relative overflow-hidden bg-coal py-24 text-center text-paper lg:py-32">
        <div className="ember-glow pointer-events-none absolute -bottom-72 left-1/2 h-[600px] w-[800px] -translate-x-1/2 animate-flicker" />
        <Reveal className="container-x relative">
          <h2 className="mx-auto max-w-3xl text-5xl leading-[1.05] sm:text-6xl">Have a space in mind? Let&apos;s talk.</h2>
          <p className="mx-auto mt-6 max-w-xl text-[17px] text-steel">Tell us about your room and requirements — we&apos;ll help you find, or customise, the right piece.</p>
          <Link href="/contact#enquiry" className="btn-primary mt-10">
            Contact ARTLY <ArrowRight />
          </Link>
        </Reveal>
      </section>
    </>
  );
}
