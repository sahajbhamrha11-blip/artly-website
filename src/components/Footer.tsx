import Link from "next/link";
import { Logo } from "./Logo";
import { Mail, MapPin, Phone, SOCIAL_ICONS, WhatsApp } from "./Icons";
import { getSettings, SOCIAL_KEYS } from "@/lib/settings";
import { getCategories } from "@/lib/products";
import { telHref, whatsappHref } from "@/lib/utils";

export async function Footer() {
  const [s, categories] = await Promise.all([getSettings(), getCategories().catch(() => [])]);
  const wa = whatsappHref(s.whatsappNumber, "Hello ARTLY, I would like to know more about your products.");
  const socials = SOCIAL_KEYS.filter(({ key }) => s[key]);
  const year = new Date().getFullYear();

  return (
    <footer className="grain relative overflow-hidden bg-coal text-paper">
      <div className="container-x relative grid gap-14 py-20 lg:grid-cols-12 lg:gap-10 lg:py-24">
        <div className="lg:col-span-4">
          <div className="inline-block bg-linen px-6 py-5">
            <Logo height={44} />
          </div>
          <p className="mt-8 max-w-sm text-[15px] leading-relaxed text-steel">{s.footerDescription}</p>
          {socials.length > 0 && (
            <ul className="mt-8 flex gap-3" aria-label="Social media">
              {socials.map(({ key, label }) => {
                const Icon = SOCIAL_ICONS[key];
                return (
                  <li key={key}>
                    <a
                      href={s[key]}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`ARTLY on ${label}`}
                      className="flex h-11 w-11 items-center justify-center border border-paper/15 text-paper/80 transition-colors hover:border-red hover:bg-red hover:text-paper"
                    >
                      <Icon />
                    </a>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="grid gap-10 sm:grid-cols-3 lg:col-span-8">
          <div>
            <h2 className="eyebrow text-ember">Explore</h2>
            <ul className="mt-6 space-y-3 text-[15px]">
              {[
                ["/", "Home"],
                ["/about", "About ARTLY"],
                ["/products", "All products"],
                ["/contact", "Contact us"],
                ["/privacy", "Privacy & cookies"],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="text-paper/75 transition-colors hover:text-paper">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="eyebrow text-ember">Collections</h2>
            <ul className="mt-6 space-y-3 text-[15px]">
              {categories.map((c) => (
                <li key={c.id}>
                  <Link href={`/products?category=${c.slug}`} className="text-paper/75 transition-colors hover:text-paper">
                    {c.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/contact?interest=Other#enquiry" className="text-paper/75 transition-colors hover:text-paper">
                  Custom requirements
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="eyebrow text-ember">Contact</h2>
            <ul className="mt-6 space-y-4 text-[15px] text-paper/75">
              {s.contactPhone && (
                <li>
                  <a href={telHref(s.contactPhone)} className="flex items-start gap-3 hover:text-paper">
                    <Phone className="mt-0.5 h-4 w-4 shrink-0" /> {s.contactPhone}
                  </a>
                </li>
              )}
              {s.contactEmail && (
                <li>
                  <a href={`mailto:${s.contactEmail}`} className="flex items-start gap-3 break-all hover:text-paper">
                    <Mail className="mt-0.5 h-4 w-4 shrink-0" /> {s.contactEmail}
                  </a>
                </li>
              )}
              {wa && (
                <li>
                  <a href={wa} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 hover:text-paper">
                    <WhatsApp className="mt-0.5 h-4 w-4 shrink-0" /> WhatsApp us
                  </a>
                </li>
              )}
              {s.address && (
                <li className="flex items-start gap-3 whitespace-pre-line">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" /> {s.address}
                </li>
              )}
              <li>
                <Link href="/contact#enquiry" className="link-underline text-paper">
                  Send an enquiry →
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-paper/10">
        <div className="container-x flex flex-col gap-3 py-7 text-[12px] tracking-wide text-steel sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} ARTLY. All rights reserved.</p>
          <p className="tracking-[0.3em] uppercase">Deliver <span className="text-red-bright">Comfort</span></p>
        </div>
      </div>
    </footer>
  );
}
