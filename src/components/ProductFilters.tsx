"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Close, Search } from "./Icons";
import { cn } from "@/lib/utils";

type Cat = { slug: string; name: string; count: number };

export function ProductFilters({ categories }: { categories: Cat[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const active = params.get("category") ?? "";
  const [q, setQ] = useState(params.get("q") ?? "");
  const first = useRef(true);

  const push = (next: { category?: string; q?: string }) => {
    const sp = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(next)) {
      if (v) sp.set(k, v);
      else sp.delete(k);
    }
    const qs = sp.toString();
    startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  };

  // Debounced live search
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const t = setTimeout(() => push({ q: q.trim() }), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const allCount = categories.reduce((n, c) => n + c.count, 0);
  const tabs = [{ slug: "", name: "All", count: allCount }, ...categories];

  return (
    <div className="sticky top-[68px] z-30 border-b border-stone bg-paper/95 backdrop-blur-md">
      <div className="container-x flex flex-col gap-4 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div role="tablist" aria-label="Filter by category" className="-mx-1 flex gap-1 overflow-x-auto pb-1 lg:pb-0">
          {tabs.map((t) => {
            const isActive = active === t.slug;
            return (
              <button
                key={t.slug || "all"}
                role="tab"
                aria-selected={isActive}
                onClick={() => push({ category: t.slug })}
                className={cn(
                  "shrink-0 px-5 py-3 text-[12px] font-semibold tracking-[0.18em] whitespace-nowrap uppercase transition-colors duration-300",
                  isActive ? "bg-charcoal text-paper" : "text-charcoal hover:bg-sand",
                )}
              >
                {t.name} <span className={cn("ml-1.5", isActive ? "text-steel" : "text-metal")}>({t.count})</span>
              </button>
            );
          })}
        </div>

        <form
          role="search"
          className="relative w-full lg:w-[360px]"
          onSubmit={(e) => {
            e.preventDefault();
            push({ q: q.trim() });
          }}
        >
          <label htmlFor="product-search" className="sr-only">Search products</label>
          <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-metal" />
          <input
            id="product-search"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search fireplaces, stoves, features…"
            className="field !py-3 !pr-10 !pl-11"
            maxLength={80}
          />
          {q && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setQ("")}
              className="absolute top-1/2 right-3 -translate-y-1/2 p-1 text-metal hover:text-charcoal"
            >
              <Close className="h-4 w-4" />
            </button>
          )}
        </form>
      </div>
      <div className={cn("h-0.5 origin-left bg-red transition-transform duration-500", pending ? "scale-x-100 animate-pulse" : "scale-x-0")} aria-hidden />
    </div>
  );
}
