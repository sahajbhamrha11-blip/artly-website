import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CookieNotice } from "@/components/CookieNotice";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";

// Pages read live data (products, settings) from the database so admin
// changes appear immediately without a rebuild.
export const dynamic = "force-dynamic";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main id="main">{children}</main>
      <Footer />
      <WhatsAppFloat />
      <CookieNotice />
    </>
  );
}
