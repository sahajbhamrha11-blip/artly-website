import Link from "next/link";
import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ArrowRight } from "@/components/Icons";

export const metadata: Metadata = { title: "Page not found", robots: { index: false } };

export default function NotFound() {
  return (
    <>
      <Header />
      <main id="main" className="grain relative flex min-h-[78vh] items-center overflow-hidden bg-coal text-paper">
        <div className="ember-glow pointer-events-none absolute -bottom-60 left-1/2 h-[600px] w-[800px] -translate-x-1/2 animate-flicker" />
        <div className="container-x relative py-24 text-center">
          <p className="font-display text-[120px] leading-none text-ember/80 italic sm:text-[180px]">404</p>
          <h1 className="mt-4 text-4xl sm:text-5xl">This page has gone cold.</h1>
          <p className="mx-auto mt-5 max-w-md text-steel">
            The page you&apos;re looking for doesn&apos;t exist or may have moved. Let&apos;s get you back to the warmth.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/" className="btn-primary">Back to home <ArrowRight /></Link>
            <Link href="/products" className="btn-outline-light">Browse products</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
