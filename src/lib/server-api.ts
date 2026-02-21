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

/** Server-only: fetch category tree (top-level categories with children). Use in Server Components. */
export async function fetchCategoriesTree(): Promise<{ id: number; name: string; slug: string }[]> {
  try {
    const res = await fetch(`${API_BASE}/api/categories/tree/`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function getProductTopLevelSlug(p: Product): string | null {
  const parent = p.category?.parent_slug ?? null;
  const slug = p.category_slug ?? p.category?.slug ?? null;
  const raw = (parent ?? slug ?? "").toLowerCase();
  return raw || null;
}

export function computeHomepageDerived(
  data: HomepageData | null,
  categories: { id: number; name: string; slug: string }[]
): HomepageDerived {
  const empty: HomepageDerived = {
    newDropsFeatured: null,
    trendingFeatured: null,
    hotProducts: [],
    categorySections: [],
    error: data ? null : "Failed to load products",
  };
  if (!data) return empty;

  const { products, best_selling, hot } = data;
  const newDrops = [...products].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const categorySlugSet = new Set(categories.map((c) => c.slug.toLowerCase()));
  const productsBySlug = new Map<string, Product[]>();
  for (const cat of categories) {
    productsBySlug.set(cat.slug.toLowerCase(), []);
  }
  for (const p of products) {
    const topSlug = getProductTopLevelSlug(p);
    if (topSlug && categorySlugSet.has(topSlug)) {
      productsBySlug.get(topSlug)!.push(p);
    }
  }

  const categorySections = categories.map((category) => ({
    category: { id: category.id, name: category.name, slug: category.slug },
    products: productsBySlug.get(category.slug.toLowerCase()) ?? [],
  }));

  return {
    newDropsFeatured: newDrops[0] ?? null,
    trendingFeatured: best_selling?.[0]?.product ?? null,
    hotProducts: (hot || []).map((h) => h.product).filter(Boolean),
    categorySections,
    error: null,
  };
}
