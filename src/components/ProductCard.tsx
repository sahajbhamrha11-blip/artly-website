import Link from "next/link";
import { SmartImage } from "./SmartImage";
import { ArrowRight } from "./Icons";
import type { Product } from "@/lib/products";
import { cn } from "@/lib/utils";

export function ProductCard({ product, priority, tone = "light" }: { product: Product; priority?: boolean; tone?: "light" | "dark" }) {
  const href = `/products/${product.slug}`;
  const dark = tone === "dark";
  return (
    <article className="group flex h-full flex-col">
      <Link
        href={href}
        className={cn("relative block aspect-[4/5] overflow-hidden", dark ? "bg-graphite" : "bg-sand")}
        aria-label={`View ${product.name}`}
      >
        {product.coverImage ? (
          <SmartImage
            src={product.coverImage.url}
            alt={product.coverImage.alt || product.name}
            fill
            priority={priority}
            sizes="(min-width: 1280px) 30vw, (min-width: 768px) 45vw, 92vw"
            className="object-cover transition-transform duration-[1400ms] ease-out-soft group-hover:scale-[1.045]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-metal">Image coming soon</div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-coal/45 via-transparent to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
        <span className="absolute top-4 left-4 bg-paper/90 px-3 py-1.5 text-[10px] font-semibold tracking-[0.24em] text-charcoal uppercase backdrop-blur">
          {product.category.name}
        </span>
      </Link>

      <div className="flex flex-1 flex-col pt-6">
        <h3 className={cn("text-[28px] leading-tight", dark ? "text-paper" : "text-charcoal")}>
          <Link href={href} className="transition-colors hover:text-red">
            {product.name}
          </Link>
        </h3>
        <p className={cn("mt-3 line-clamp-3 text-[15px] leading-relaxed", dark ? "text-steel" : "text-metal")}>
          {product.shortDescription}
        </p>
        <div className="mt-auto flex flex-wrap items-center gap-x-6 gap-y-3 pt-6">
          <Link href={href} className={cn("btn !px-0 !py-2", dark ? "text-paper" : "text-charcoal")}>
            <span className="link-underline">View details</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-1" />
          </Link>
          <Link
            href={`/contact?product=${product.slug}#enquiry`}
            className="btn !px-0 !py-2 text-red hover:text-red-bright"
          >
            <span className="link-underline">Enquire now</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
