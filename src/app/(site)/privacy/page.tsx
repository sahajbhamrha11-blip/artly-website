import type { Metadata } from "next";
import Link from "next/link";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Privacy & Cookies",
  description: "How ARTLY handles your personal information and the cookies used on this website.",
  alternates: { canonical: "/privacy" },
};

export default async function PrivacyPage() {
  const s = await getSettings();
  return (
    <section className="bg-paper py-20 lg:py-28">
      <article className="container-x max-w-3xl">
        <p className="eyebrow text-red">Legal</p>
        <h1 className="mt-5 text-5xl sm:text-6xl">Privacy &amp; cookies</h1>
        <div className="mt-12 space-y-10 text-[16px] leading-[1.85] text-charcoal/85 [&_h2]:mb-3 [&_h2]:text-3xl [&_h2]:text-charcoal">
          <div>
            <h2>Information we collect</h2>
            <p>
              When you send an enquiry we collect the details you provide: your name, company name (optional), phone number,
              email address, the product or category you are interested in and your message. We use this information only to
              respond to your enquiry and to provide the products or information you request.
            </p>
          </div>
          <div>
            <h2>How we store it</h2>
            <p>
              Enquiries are stored securely in our website database and may be forwarded to our team by email. We do not sell
              or share your information with third parties for marketing. To protect against spam we store a one-way,
              anonymised fingerprint of the network address used to send the form — never the address itself.
            </p>
          </div>
          <div>
            <h2>Cookies</h2>
            <p>
              This website uses only essential storage: a note in your browser that you have seen our cookie notice and, for
              site administrators only, a secure login cookie. We do not use analytics, advertising or tracking cookies. If a
              location map is shown on the contact page, it is provided by Google Maps and subject to Google&apos;s own policies.
            </p>
          </div>
          <div>
            <h2>Your rights</h2>
            <p>
              You may ask us to access, correct or delete the personal information you have sent us.{" "}
              {s.contactEmail ? (
                <>Email us at <a className="text-red underline underline-offset-4" href={`mailto:${s.contactEmail}`}>{s.contactEmail}</a>.</>
              ) : (
                <>Please <Link className="text-red underline underline-offset-4" href="/contact">contact us</Link>.</>
              )}
            </p>
          </div>
          <p className="text-[13px] text-metal">
            This policy is a general template. Please review it with a legal adviser to make sure it meets the requirements that apply to your business.
          </p>
        </div>
      </article>
    </section>
  );
}
