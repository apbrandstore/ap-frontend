import type { HomepageData, HomepageDerived, Product, SiteSettings } from "@/types/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

/** Server-only: fetch site settings (e.g. hero image). Use in Server Components. */
export async function fetchSiteSettings(): Promise<SiteSettings | null> {
  try {
    const res = await fetch(`${API_BASE}/api/site-settings/`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

/** Build absolute hero image URL for server-rendered first paint. */
export function buildHeroUrl(heroImage: string | null): string | null {
  if (!heroImage) return null;
  if (heroImage.startsWith("http://") || heroImage.startsWith("https://")) return heroImage;
  const clean = heroImage.startsWith("/") ? heroImage : `/${heroImage}`;
  return `${API_BASE}${clean}`;
}

/** Server-only: fetch homepage data. Use in Server Components. */
export async function fetchHomepageData(): Promise<HomepageData | null> {
  try {
    const res = await fetch(`${API_BASE}/api/homepage/`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

function productInCategory(p: Product, slug: string): boolean {
  const s = (p.category_slug || p.category?.slug || "").toLowerCase();
  const parent = (p.category?.parent_slug || "").toLowerCase();
  return s === slug || parent === slug;
}

export function computeHomepageDerived(data: HomepageData | null): HomepageDerived {
  const empty: HomepageDerived = {
    newDropsFeatured: null,
    trendingFeatured: null,
    hotProducts: [],
    comboProducts: [],
    coupleProducts: [],
    mensProducts: [],
    womensProducts: [],
    error: data ? null : "Failed to load products",
  };
  if (!data) return empty;

  const { products, best_selling, hot } = data;
  const cutoff = Date.now() - 3 * 24 * 60 * 60 * 1000;
  const newDrops = products
    .filter((p) => {
      const t = new Date(p.created_at).getTime();
      return Number.isFinite(t) && t >= cutoff;
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return {
    newDropsFeatured: newDrops[0] ?? null,
    trendingFeatured: best_selling?.[0]?.product ?? null,
    hotProducts: (hot || []).map((h) => h.product).filter(Boolean),
    comboProducts: products.filter((p) => productInCategory(p, "combo")),
    coupleProducts: products.filter((p) => productInCategory(p, "couple")),
    mensProducts: products.filter((p) => productInCategory(p, "men")),
    womensProducts: products.filter((p) => productInCategory(p, "womens")),
    error: null,
  };
}
