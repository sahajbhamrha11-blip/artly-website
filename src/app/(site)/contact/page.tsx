import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { EnquiryForm } from "@/components/EnquiryForm";
import { Clock, Mail, MapPin, Phone, SOCIAL_ICONS, WhatsApp } from "@/components/Icons";
import { getSettings, SOCIAL_KEYS } from "@/lib/settings";
import { db } from "@/lib/db";
import { INTEREST_OPTIONS } from "@/lib/validation";
import { telHref, whatsappHref } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Contact Us — Enquire About Fireplaces & Cooking Stoves",
  description:
    "Contact ARTLY to enquire about wood-burning fireplaces, heating stoves and cooking stoves, or to discuss customisation for your space.",
  alternates: { canonical: "/contact" },
};

type SP = Promise<{ product?: string; interest?: string }>;

export default async function ContactPage({ searchParams }: { searchParams: SP }) {
  const { product: productSlug, interest } = await searchParams;
  const [s, product] = await Promise.all([
    getSettings(),
    productSlug
      ? db.product.findFirst({ where: { slug: productSlug, published: true }, select: { slug: true, name: true, category: { select: { slug: true } } } })
      : null,
  ]);

  const defaultInterest =
    (INTEREST_OPTIONS as readonly string[]).includes(interest ?? "")
      ? (interest as (typeof INTEREST_OPTIONS)[number])
      : product?.category.slug === "cooking-stoves"
        ? "Cooking Stove"
        : product?.category.slug === "fireplaces"
          ? "Fireplace"
          : undefined;

  const wa = whatsappHref(s.whatsappNumber, "Hello ARTLY, I would like to know more about your products.");
  const socials = SOCIAL_KEYS.filter(({ key }) => s[key]);
  const mapOk = /^https:\/\/(www\.)?google\.[a-z.]+\/maps\/embed/.test(s.mapEmbedUrl);

  const Pending = () => <span className="text-steel italic">Details coming soon</span>;

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title={<>Let&apos;s bring warmth <span className="text-ember italic">to your space.</span></>}
        intro="Questions about a product, a custom requirement or a bulk order? Send us a message and our team will get back to you."
      />

      <section className="bg-paper py-20 lg:py-28">
        <div className="container-x grid gap-16 lg:grid-cols-12">
          <aside className="lg:col-span-4">
            <h2 className="text-4xl">Get in touch</h2>
            <ul className="mt-10 divide-y divide-stone border-y border-stone">
              <li className="flex gap-5 py-6">
                <Phone className="mt-1 h-5 w-5 shrink-0 text-red" />
                <div>
                  <p className="field-label !mb-1">Phone</p>
                  {s.contactPhone ? <a href={telHref(s.contactPhone)} className="text-[17px] hover:text-red">{s.contactPhone}</a> : <Pending />}
                </div>
              </li>
              <li className="flex gap-5 py-6">
                <Mail className="mt-1 h-5 w-5 shrink-0 text-red" />
                <div className="min-w-0">
                  <p className="field-label !mb-1">Email</p>
                  {s.contactEmail ? <a href={`mailto:${s.contactEmail}`} className="text-[17px] break-all hover:text-red">{s.contactEmail}</a> : <Pending />}
                </div>
              </li>
              <li className="flex gap-5 py-6">
                <MapPin className="mt-1 h-5 w-5 shrink-0 text-red" />
                <div>
                  <p className="field-label !mb-1">Address</p>
                  {s.address ? <p className="text-[17px] whitespace-pre-line">{s.address}</p> : <Pending />}
                </div>
              </li>
              {s.businessHours && (
                <li className="flex gap-5 py-6">
                  <Clock className="mt-1 h-5 w-5 shrink-0 text-red" />
                  <div>
                    <p className="field-label !mb-1">Hours</p>
                    <p className="text-[17px] whitespace-pre-line">{s.businessHours}</p>
                  </div>
                </li>
              )}
            </ul>

            {wa && (
              <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-whatsapp mt-8 w-full">
                <WhatsApp /> Chat on WhatsApp
              </a>
            )}

            {socials.length > 0 && (
              <div className="mt-10">
                <p className="field-label">Follow ARTLY</p>
                <ul className="mt-3 flex gap-3">
                  {socials.map(({ key, label }) => {
                    const Icon = SOCIAL_ICONS[key];
                    return (
                      <li key={key}>
                        <a href={s[key]} target="_blank" rel="noopener noreferrer" aria-label={`ARTLY on ${label}`} className="flex h-11 w-11 items-center justify-center border border-stone transition-colors hover:border-charcoal hover:bg-charcoal hover:text-paper">
                          <Icon />
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </aside>

          <div id="enquiry" className="scroll-mt-28 lg:col-span-7 lg:col-start-6">
            <p className="eyebrow text-red">Enquiry form</p>
            <h2 className="mt-5 mb-10 text-4xl sm:text-5xl">Send us a message</h2>
            <EnquiryForm product={product ? { slug: product.slug, name: product.name } : null} defaultInterest={defaultInterest} sourcePage="/contact" />
          </div>
        </div>
      </section>

      <section aria-label="Location map" className="bg-linen">
        {mapOk ? (
          <iframe
            src={s.mapEmbedUrl}
            title="ARTLY location on Google Maps"
            className="block h-[460px] w-full grayscale-[60%] contrast-[1.05]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        ) : (
          <div className="grain relative flex h-[360px] items-center justify-center overflow-hidden bg-graphite text-center text-paper">
            <div
              aria-hidden
              className="absolute inset-0 opacity-[0.08]"
              style={{ backgroundImage: "linear-gradient(var(--color-paper) 1px, transparent 1px), linear-gradient(90deg, var(--color-paper) 1px, transparent 1px)", backgroundSize: "48px 48px" }}
            />
            <div className="relative">
              <MapPin className="mx-auto h-8 w-8 text-ember" />
              <p className="mt-4 font-display text-3xl">Location map coming soon</p>
              <p className="mt-2 text-[14px] text-steel">Please use the enquiry form to reach us in the meantime.</p>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
