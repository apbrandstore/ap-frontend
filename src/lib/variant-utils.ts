import type {
  StorefrontProductDetail,
  StorefrontProductVariant,
  VariantMatrix,
  VariantMatrixValue,
} from "@/types/api";

/** Map attribute_slug → value_public_id */
export type VariantSelections = Record<string, string>;

export function findVariantForSelections(
  variants: StorefrontProductVariant[],
  selections: VariantSelections
): StorefrontProductVariant | null {
  for (const v of variants) {
    if (!v.options?.length) continue;
    const match = v.options.every(
      (o) =>
        o.attribute_slug &&
        selections[o.attribute_slug] === o.value_public_id
    );
    if (match) return v;
  }
  return null;
}

export function defaultSelectionsFromVariant(
  v: StorefrontProductVariant
): VariantSelections {
  const s: VariantSelections = {};
  for (const o of v.options || []) {
    if (!o.attribute_slug?.trim()) continue;
    s[o.attribute_slug] = o.value_public_id;
  }
  return s;
}

export function defaultSelectionsForProduct(
  detail: StorefrontProductDetail
): VariantSelections {
  const variants = detail.variants || [];
  if (variants.length === 0) return {};
  return defaultSelectionsFromVariant(variants[0]);
}

export function variantLabel(v: StorefrontProductVariant): string {
  return (v.options || []).map((o) => o.value).join(" / ");
}

export function buildMatrixFromVariants(
  detail: StorefrontProductDetail
): VariantMatrix {
  if (
    detail.variant_matrix &&
    Object.keys(detail.variant_matrix).length > 0
  ) {
    return detail.variant_matrix;
  }
  const map = new Map<
    string,
    {
      slug: string;
      attribute_public_id: string;
      attribute_name: string;
      values: Map<string, VariantMatrixValue>;
    }
  >();
  for (const v of detail.variants || []) {
    for (const o of v.options || []) {
      if (!o.attribute_slug?.trim()) continue;
      if (!map.has(o.attribute_slug)) {
        map.set(o.attribute_slug, {
          slug: o.attribute_slug,
          attribute_public_id: o.attribute_public_id,
          attribute_name: o.attribute_name,
          values: new Map(),
        });
      }
      const entry = map.get(o.attribute_slug)!;
      entry.values.set(o.value_public_id, {
        value_public_id: o.value_public_id,
        value: o.value,
      });
    }
  }
  const out: VariantMatrix = {};
  for (const [slug, entry] of map) {
    out[slug] = {
      slug: entry.slug,
      attribute_public_id: entry.attribute_public_id,
      attribute_name: entry.attribute_name,
      values: Array.from(entry.values.values()),
    };
  }
  return out;
}
