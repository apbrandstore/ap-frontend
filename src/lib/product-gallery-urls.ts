import type { StorefrontProductDetail } from "@/types/api";

/**
 * Ordered unique image URLs for a product: main first, then gallery by `order`.
 * Matches product detail / storefront API shape.
 */
export function galleryImageUrlsForProduct(
  detail: StorefrontProductDetail | undefined | null
): string[] {
  if (!detail) return [];
  const sorted = [...(detail.images || [])].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0)
  );
  const fromGallery = sorted
    .map((i) => i.image_url)
    .filter((u): u is string => Boolean(u));
  const seen = new Set<string>();
  const out: string[] = [];
  const main = detail.image_url;
  if (main) {
    seen.add(main);
    out.push(main);
  }
  for (const u of fromGallery) {
    if (seen.has(u)) continue;
    seen.add(u);
    out.push(u);
  }
  if (out.length === 0 && main) out.push(main);
  return out;
}
