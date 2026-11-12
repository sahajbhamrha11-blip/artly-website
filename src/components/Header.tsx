"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { ArrowRight } from "./Icons";
import { cn } from "@/lib/utils";

export const NAV = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/products", label: "Products" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:bg-charcoal focus:px-4 focus:py-2 focus:text-paper">
        Skip to content
      </a>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-out-soft",
          scrolled ? "bg-paper/92 shadow-[0_1px_0_rgba(22,21,20,0.08)] backdrop-blur-md" : "bg-paper",
        )}
      >
        <div className={cn("container-x flex items-center justify-between transition-all duration-500", scrolled ? "h-[68px]" : "h-[84px]")}>
          <Logo height={scrolled ? 34 : 40} priority className="transition-all duration-500" />

          <nav aria-label="Main" className="hidden items-center gap-10 md:flex">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={cn(
                  "link-underline text-[12px] font-semibold tracking-[0.22em] uppercase transition-colors",
                  isActive(item.href) ? "text-red" : "text-charcoal hover:text-red",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/contact#enquiry" className="btn-dark hidden !px-5 !py-3 sm:inline-flex">
              Enquire
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <button
              type="button"
              className="relative z-[60] flex h-11 w-11 items-center justify-center md:hidden"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen((v) => !v)}
            >
              <span className="relative block h-3 w-6">
                <span className={cn("absolute left-0 h-px w-6 transition-all duration-500", open ? "top-1.5 rotate-45 bg-charcoal" : "top-0 bg-charcoal")} />
                <span className={cn("absolute left-0 h-px w-6 transition-all duration-500", open ? "top-1.5 -rotate-45 bg-charcoal" : "top-3 bg-charcoal")} />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile navigation */}
      <div
        id="mobile-menu"
        className={cn(
          "fixed inset-0 z-40 flex flex-col bg-coal text-paper transition-[clip-path] duration-700 ease-out-soft md:hidden",
          open ? "[clip-path:inset(0_0_0_0)]" : "pointer-events-none [clip-path:inset(0_0_100%_0)]",
        )}
        aria-hidden={!open}
      >
        <div className="ember-glow pointer-events-none absolute -bottom-40 left-1/2 h-[420px] w-[420px] -translate-x-1/2 animate-flicker" />
        <nav aria-label="Mobile" className="container-x relative mt-32 flex flex-col gap-2">
          {NAV.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              tabIndex={open ? 0 : -1}
              className={cn(
                "flex items-baseline gap-5 border-b border-paper/10 py-5 font-display text-5xl transition-all duration-700 ease-out-soft",
                open ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
                isActive(item.href) && "text-ember",
              )}
              style={{ transitionDelay: open ? `${150 + i * 70}ms` : "0ms" }}
            >
              <span className="font-sans text-xs tracking-[0.3em] text-steel">0{i + 1}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="container-x relative mt-auto pb-10">
          <Link href="/contact#enquiry" tabIndex={open ? 0 : -1} className="btn-primary w-full">
            Send an enquiry <ArrowRight />
          </Link>
          <p className="mt-6 text-center text-[11px] tracking-[0.3em] text-steel uppercase">Deliver Comfort</p>
        </div>
      </div>
      <div aria-hidden className="h-[84px]" />
    </>
  );
}
