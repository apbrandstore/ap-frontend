import type { BannerPlacementSlot, PublicBanner } from "@/types/api";

export function sortBannersByOrder(banners: PublicBanner[]): PublicBanner[] {
  return [...banners].sort((a, b) => a.order - b.order);
}

/** Banners that explicitly include this slot in `placement_slots`. */
export function bannersForSlot(
  banners: PublicBanner[],
  slot: BannerPlacementSlot
): PublicBanner[] {
  return sortBannersByOrder(banners).filter((b) =>
    Array.isArray(b.placement_slots) ? b.placement_slots.includes(slot) : false
  );
}

/** First image URL in display order; ignores slot filtering. */
export function firstBannerImageUrl(banners: PublicBanner[]): string | null {
  const sorted = sortBannersByOrder(banners);
  const withImage = sorted.find((b) => b.image_url);
  return withImage?.image_url ?? null;
}

/**
 * Prefer `slot` when present; otherwise fall back to any banner with an image
 * (for stores without slot metadata).
 */
export function firstHeroImageUrlForSlot(
  banners: PublicBanner[],
  slot: BannerPlacementSlot
): string | null {
  const slotted = bannersForSlot(banners, slot);
  const pool = slotted.length > 0 ? slotted : sortBannersByOrder(banners);
  return firstBannerImageUrl(pool);
}
