"use client";

import { useCallback, useEffect, useState } from "react";
import { SmartImage } from "./SmartImage";
import { ArrowLeft, ArrowRight, Close } from "./Icons";
import { cn } from "@/lib/utils";

type Img = { url: string; alt: string };

export function ProductGallery({ images, name }: { images: Img[]; name: string }) {
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const count = images.length;
  const go = useCallback((d: number) => setIndex((i) => (i + d + count) % count), [count]);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [lightbox, go]);

  if (count === 0) {
    return <div className="flex aspect-[4/5] items-center justify-center bg-sand text-metal">Images coming soon</div>;
  }
  const current = images[index];

  return (
    <div>
      <div className="group relative aspect-[4/5] overflow-hidden bg-sand">
        {images.map((img, i) => (
          <SmartImage
            key={img.url + i}
            src={img.url}
            alt={img.alt || name}
            fill
            priority={i === 0}
            sizes="(min-width: 1024px) 55vw, 100vw"
            className={cn(
              "cursor-zoom-in object-cover transition-all duration-700 ease-out-soft group-hover:scale-[1.02]",
              i === index ? "opacity-100" : "pointer-events-none opacity-0",
            )}
            onClick={() => setLightbox(true)}
          />
        ))}
        <button
          type="button"
          onClick={() => setLightbox(true)}
          className="absolute right-4 bottom-4 bg-paper/90 px-4 py-2 text-[11px] font-semibold tracking-[0.2em] uppercase backdrop-blur transition-colors hover:bg-paper"
        >
          View full size
        </button>
        {count > 1 && (
          <>
            <button type="button" aria-label="Previous image" onClick={() => go(-1)} className="absolute top-1/2 left-4 flex h-11 w-11 -translate-y-1/2 items-center justify-center bg-paper/85 hover:bg-paper">
              <ArrowLeft />
            </button>
            <button type="button" aria-label="Next image" onClick={() => go(1)} className="absolute top-1/2 right-4 flex h-11 w-11 -translate-y-1/2 items-center justify-center bg-paper/85 hover:bg-paper">
              <ArrowRight />
            </button>
          </>
        )}
      </div>

      {count > 1 && (
        <ul className="mt-4 grid grid-cols-5 gap-3" aria-label="Product images">
          {images.map((img, i) => (
            <li key={img.url + i}>
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show image ${i + 1} of ${count}`}
                aria-current={i === index}
                className={cn(
                  "relative block aspect-square w-full overflow-hidden bg-sand transition-all duration-300",
                  i === index ? "ring-2 ring-charcoal ring-offset-2 ring-offset-paper" : "opacity-60 hover:opacity-100",
                )}
              >
                <SmartImage src={img.url} alt="" fill sizes="120px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${name} — image ${index + 1} of ${count}`}
          className="fixed inset-0 z-[90] flex items-center justify-center bg-coal/95 p-4 backdrop-blur-sm"
          onClick={() => setLightbox(false)}
        >
          <div className="relative h-full max-h-[90vh] w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <SmartImage src={current.url} alt={current.alt || name} fill sizes="100vw" className="object-contain" />
          </div>
          <button type="button" autoFocus aria-label="Close" onClick={() => setLightbox(false)} className="absolute top-5 right-5 flex h-12 w-12 items-center justify-center text-paper hover:text-ember">
            <Close className="h-7 w-7" />
          </button>
          {count > 1 && (
            <>
              <button type="button" aria-label="Previous image" onClick={(e) => { e.stopPropagation(); go(-1); }} className="absolute top-1/2 left-4 flex h-12 w-12 -translate-y-1/2 items-center justify-center text-paper hover:text-ember">
                <ArrowLeft className="h-7 w-7" />
              </button>
              <button type="button" aria-label="Next image" onClick={(e) => { e.stopPropagation(); go(1); }} className="absolute top-1/2 right-4 flex h-12 w-12 -translate-y-1/2 items-center justify-center text-paper hover:text-ember">
                <ArrowRight className="h-7 w-7" />
              </button>
              <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[12px] tracking-[0.3em] text-steel">{index + 1} / {count}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
