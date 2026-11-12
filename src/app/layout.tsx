import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { siteUrl } from "@/lib/utils";
import "./globals.css";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const sans = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "ARTLY — Fireplaces & Cooking Stoves | Deliver Comfort",
    template: "%s | ARTLY",
  },
  description:
    "ARTLY designs wood-burning fireplaces, heating stoves and wood oven cooking stoves that bring warmth, functionality and elegance to every space.",
  applicationName: "ARTLY",
  keywords: [
    "fireplaces",
    "wood burning stoves",
    "heating stoves",
    "cooking stoves",
    "indoor fireplaces",
    "home heating solutions",
  ],
  openGraph: {
    type: "website",
    siteName: "ARTLY",
    locale: "en",
    images: [{ url: "/images/brand/og-default.jpg", width: 1200, height: 630, alt: "ARTLY — Deliver Comfort" }],
  },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#161514",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`} suppressHydrationWarning>
      <head>
        {/* Enables scroll-reveal animations only when JS runs, so content is never hidden without JS */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
