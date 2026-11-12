import Image, { type ImageProps } from "next/image";
import { isUploadedImage } from "@/lib/utils";

/**
 * next/image wrapper. Bundled images are optimised (AVIF/WebP, responsive
 * sizes, lazy loading). Images uploaded through the admin panel are served
 * directly from storage by /uploads/* and skip the optimiser.
 */
export function SmartImage(props: ImageProps) {
  const src = typeof props.src === "string" ? props.src : "";
  return <Image {...props} unoptimized={props.unoptimized ?? isUploadedImage(src)} />;
}
