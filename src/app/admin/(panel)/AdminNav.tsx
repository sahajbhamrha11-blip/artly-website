"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/enquiries", label: "Enquiries" },
  { href: "/admin/settings", label: "Website settings" },
];

export function AdminNav({ newCount }: { newCount: number }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin" className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:px-3 lg:pb-0">
      {ITEMS.map((item) => {
        const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex shrink-0 items-center justify-between gap-3 px-4 py-3 text-[14px] font-medium transition-colors",
              active ? "bg-charcoal text-paper" : "text-charcoal hover:bg-sand",
            )}
          >
            {item.label}
            {item.href === "/admin/enquiries" && newCount > 0 && (
              <span className="rounded-full bg-red px-2 py-0.5 text-[11px] font-semibold text-paper">{newCount}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
