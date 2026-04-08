import type {
  HomepageDerived,
  StorefrontProductListItem,
  StorefrontCategory,
  PublicBanner,
  StorePublic,
  BannerPlacementSlot,
} from "@/types/api";
import {
  storefrontAuthHeaders,
  storefrontV1Url,
} from "@/lib/storefront-config";
import {
  firstBannerImageUrl as firstBannerImageUrlFromList,
  firstHeroImageUrlForSlot,
  bannersForSlot,
} from "@/lib/banner-utils";

async function storefrontFetchJson<T>(
  path: string,
  init?: RequestInit & { next?: { revalidate?: number } }
): Promise<T | null> {
  try {
    const res = await fetch(storefrontV1Url(path), {
      ...init,
      headers: {
        ...storefrontAuthHeaders(),
        ...(init?.headers as Record<string, string>),
      },
    });
    if (!res.ok) return null;
    return res.json() as Promise<T>;
  } catch {
    return null;
  }
}

/** Used for footer / layout — avoid Data Cache so dashboard edits show up on refresh. */
export async function fetchStorePublic(): Promise<StorePublic | null> {
  return storefrontFetchJson<StorePublic>("/store/public/", {
    cache: "no-store",
  });
}

export async function fetchBanners(): Promise<PublicBanner[]> {
  const data = await storefrontFetchJson<PublicBanner[]>("/banners/", {
    next: { revalidate: 60 },
  });
  return Array.isArray(data) ? data : [];
}

export async function fetchBannersForSlot(
  slot: BannerPlacementSlot
): Promise<PublicBanner[]> {
  const data = await storefrontFetchJson<PublicBanner[]>(
    `/banners/?slot=${encodeURIComponent(slot)}`,
    { next: { revalidate: 60 } }
  );
  return Array.isArray(data) ? data : [];
}

/** Prefer API `?slot=`; fall back to full list + client-side filter for older backends. */
export async function fetchBannersResolvedForSlot(
  slot: BannerPlacementSlot
): Promise<PublicBanner[]> {
  const slotted = await fetchBannersForSlot(slot);
  if (slotted.length > 0) return slotted;
  const all = await fetchBanners();
  return bannersForSlot(all, slot);
}

/** @deprecated Prefer `firstHeroImageUrlForSlot` from `@/lib/banner-utils` for slot-aware heroes */
export function firstBannerImageUrl(banners: PublicBanner[]): string | null {
  return firstBannerImageUrlFromList(banners);
}

/** Home hero: prefer `home_top`, then any banner with an image. */
export function homeHeroBannerImageUrl(banners: PublicBanner[]): string | null {
  return firstHeroImageUrlForSlot(banners, "home_top");
}

export async function fetchProductsPage(
  params: Record<string, string>
): Promise<{
  count: number;
  results: StorefrontProductListItem[];
} | null> {
  const qs = new URLSearchParams(params).toString();
  const path = qs ? `/products/?${qs}` : "/products/";
  return storefrontFetchJson<{
    count: number;
    results: StorefrontProductListItem[];
  }>(path, { next: { revalidate: 60 } });
}

async function fetchAllProductsForCategorySlug(
  slug: string
): Promise<StorefrontProductListItem[]> {
  const out: StorefrontProductListItem[] = [];
  let page = 1;
  let expectedCount: number | null = null;

  while (true) {
    const data = await fetchProductsPage({ category: slug, page: String(page) });
    const results = data?.results ?? [];
    if (expectedCount === null) expectedCount = data?.count ?? null;

    out.push(...results);

    const doneByCount =
      expectedCount !== null && expectedCount >= 0 ? out.length >= expectedCount : false;
    const doneByEmpty = results.length === 0;

    if (doneByCount || doneByEmpty) break;
    page += 1;
  }

  return out;
}

export async function fetchCategoriesTree(): Promise<StorefrontCategory[]> {
  const data = await storefrontFetchJson<StorefrontCategory[]>(
    "/categories/?tree=1",
    { next: { revalidate: 120 } }
  );
  return Array.isArray(data) ? data : [];
}

export async function fetchHomepageBundle(): Promise<HomepageDerived> {
  const cats = await fetchCategoriesTree();

  const categorySections = await Promise.all(
    cats.map(async (category) => ({
      category: {
        public_id: category.public_id,
        name: category.name,
        slug: category.slug,
        description: category.description ?? "",
      },
      products: await fetchAllProductsForCategorySlug(category.slug),
    }))
  );

  const error =
    cats.length > 0 && categorySections.every((s) => s.products.length === 0)
      ? "Failed to load products"
      : null;

  return {
    categorySections,
    error,
  };
}
