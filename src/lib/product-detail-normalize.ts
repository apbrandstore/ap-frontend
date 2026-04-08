import type {
  ProductImage,
  StorefrontProductDetail,
  StorefrontProductVariant,
  VariantOption,
} from "@/types/api";

function asRecord(v: unknown): Record<string, unknown> | null {
  return v !== null && typeof v === "object" && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : null;
}

function normalizeVariantOption(raw: Record<string, unknown>): VariantOption {
  return {
    attribute_public_id: String(
      raw.attribute_public_id ?? raw.attributePublicId ?? ""
    ),
    attribute_slug: String(raw.attribute_slug ?? raw.attributeSlug ?? ""),
    attribute_name: String(raw.attribute_name ?? raw.attributeName ?? ""),
    value_public_id: String(raw.value_public_id ?? raw.valuePublicId ?? ""),
    value: String(raw.value ?? ""),
  };
}

function normalizeVariant(raw: Record<string, unknown>): StorefrontProductVariant {
  const optionsRaw = raw.options;
  const options: VariantOption[] = Array.isArray(optionsRaw)
    ? optionsRaw
        .map((o) => asRecord(o))
        .filter(Boolean)
        .map((o) => normalizeVariantOption(o!))
    : [];

  return {
    public_id: String(raw.public_id ?? raw.publicId ?? ""),
    sku: String(raw.sku ?? ""),
    available_quantity: Number(
      raw.available_quantity ?? raw.availableQuantity ?? 0
    ),
    stock_status: String(raw.stock_status ?? raw.stockStatus ?? ""),
    price: String(raw.price ?? "0"),
    options,
  };
}

function normalizeProductImage(raw: Record<string, unknown>): ProductImage {
  return {
    public_id: String(raw.public_id ?? raw.publicId ?? ""),
    image_url:
      raw.image_url === null || raw.image_url === undefined
        ? raw.imageUrl === null || raw.imageUrl === undefined
          ? null
          : String(raw.imageUrl)
        : String(raw.image_url),
    alt: String(raw.alt ?? ""),
    order: Number(raw.order ?? 0),
  };
}

/**
 * Maps API JSON (snake_case or camelCase) into the storefront detail shape used by the UI.
 */
export function normalizeStorefrontProductDetail(
  raw: unknown
): StorefrontProductDetail {
  const r = asRecord(raw);
  if (!r) {
    throw new Error("Invalid product detail payload");
  }

  const imagesRaw = r.images ?? r.product_images ?? r.gallery;
  const images: ProductImage[] = Array.isArray(imagesRaw)
    ? imagesRaw
        .map((item) => asRecord(item))
        .filter(Boolean)
        .map((item) => normalizeProductImage(item!))
    : [];

  const variantsRaw = r.variants;
  const variants: StorefrontProductVariant[] = Array.isArray(variantsRaw)
    ? variantsRaw
        .map((item) => asRecord(item))
        .filter(Boolean)
        .map((item) => normalizeVariant(item!))
    : [];

  const extra =
    r.extra_data ?? r.extraData ?? undefined;

  const base = { ...r } as unknown as StorefrontProductDetail;
  return {
    ...base,
    images,
    variants,
    extra_data:
      extra !== null && extra !== undefined && typeof extra === "object" && !Array.isArray(extra)
        ? (extra as Record<string, unknown>)
        : base.extra_data,
  };
}
