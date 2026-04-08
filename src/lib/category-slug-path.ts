import type { StorefrontCategory } from "@/types/api";

export type CategorySlugPathMap = Record<string, string[]>;

export function buildCategorySlugPathMap(
  roots: StorefrontCategory[],
  maxDepth = 5
): CategorySlugPathMap {
  const out: CategorySlugPathMap = {};

  const visit = (node: StorefrontCategory, path: string[], depth: number) => {
    if (!node?.slug) return;
    if (depth > maxDepth) return;

    const nextPath = [...path, node.slug];
    out[node.slug] = nextPath;

    for (const ch of node.children ?? []) {
      visit(ch, nextPath, depth + 1);
    }
  };

  for (const r of roots) visit(r, [], 1);
  return out;
}

export function productHrefFromPath(
  categorySlugs: string[] | undefined,
  productSlug: string
): string {
  const safeSegs = (categorySlugs ?? [])
    .map((s) => (typeof s === "string" ? s.trim() : ""))
    .filter(Boolean);

  const segs = [...safeSegs, productSlug].map((s) => encodeURIComponent(s));
  return `/products/${segs.join("/")}`;
}

