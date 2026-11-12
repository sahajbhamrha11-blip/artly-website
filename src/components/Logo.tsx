import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Official ARTLY logo (background removed, original colours and
 * proportions preserved: 593 × 169). Always place on a light surface.
 */
export const LOGO_RATIO = 593 / 169;

export function Logo({
  className,
  height = 40,
  priority,
  href = "/",
}: {
  className?: string;
  height?: number;
  priority?: boolean;
  href?: string | null;
}) {
  const img = (
    <Image
      src="/images/brand/artly-logo.png"
      alt="ARTLY — Deliver Comfort"
      width={Math.round(height * LOGO_RATIO)}
      height={height}
      priority={priority}
      className="h-auto w-full"
      sizes={`${Math.round(height * LOGO_RATIO)}px`}
    />
  );
  const style = { width: Math.round(height * LOGO_RATIO) };
  if (!href) return <span className={cn("block", className)} style={style}>{img}</span>;
  return (
    <Link href={href} aria-label="ARTLY home" className={cn("block", className)} style={style}>
      {img}
    </Link>
  );
}
