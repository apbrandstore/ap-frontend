/** Paperbase storefront API shapes */

export interface StorePublic {
  store_name: string;
  logo_url: string | null;
  currency: string;
  currency_symbol: string;
  country: string;
  support_email: string;
  phone: string;
  address: string;
  extra_field_schema: unknown[];
  modules_enabled: Record<string, boolean>;
  theme_settings: { primary_color: string };
  seo: { default_title: string; default_description: string };
  policy_urls: {
    returns?: string;
    refund?: string;
    privacy?: string;
  };
  social_links: Record<string, string>;
}

/** API may return legacy `"low"`; prefer `"low_stock"` (Paperbase storefront spec). */
export type StorefrontStockStatus =
  | "in_stock"
  | "low_stock"
  | "out_of_stock"
  | "low";

export interface StorefrontProductListItem {
  public_id: string;
  name: string;
  brand: string | null;
  sku?: string;
  price: string;
  original_price: string | null;
  image_url: string | null;
  category_public_id: string;
  category_slug: string;
  category_name: string;
  /** Frontend-only: derived from `/categories/?tree=1` (ancestor slugs, root→leaf). */
  category_path_slugs?: string[];
  slug: string;
  stock_status: StorefrontStockStatus;
  available_quantity: number;
  variant_count: number;
  extra_data?: Record<string, unknown>;
}

export interface ProductImage {
  public_id: string;
  image_url: string | null;
  alt: string;
  order: number;
}

export interface VariantOption {
  attribute_public_id: string;
  attribute_slug: string;
  attribute_name: string;
  value_public_id: string;
  value: string;
}

export interface StorefrontProductVariant {
  public_id: string;
  sku: string;
  available_quantity: number;
  stock_status: string;
  price: string;
  options: VariantOption[];
}

export interface VariantMatrixValue {
  value_public_id: string;
  value: string;
}

export interface VariantMatrixAttr {
  slug: string;
  attribute_public_id: string;
  attribute_name: string;
  values: VariantMatrixValue[];
}

export type VariantMatrix = Record<string, VariantMatrixAttr>;

export interface StorefrontProductDetail extends StorefrontProductListItem {
  stock_tracking: boolean;
  description: string;
  images: ProductImage[];
  variants: StorefrontProductVariant[];
  breadcrumbs?: string[];
  related_products?: StorefrontProductListItem[];
  variant_matrix?: VariantMatrix;
}

export interface StorefrontCategory {
  public_id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string | null;
  parent_public_id: string | null;
  order: number;
  children?: StorefrontCategory[];
}

/** List/card product (alias for clarity in components) */
export type Product = StorefrontProductListItem;

export type Category = StorefrontCategory;

export type CategoryChild = Pick<StorefrontCategory, "public_id" | "name" | "slug">;

export interface PublicBanner {
  public_id: string;
  title: string;
  image_url: string | null;
  cta_text: string;
  cta_url: string;
  order: number;
  placement_slots?: BannerPlacementSlot[];
  start_at: string | null;
  end_at: string | null;
}

export type BannerPlacementSlot =
  | "home_top"
  | "home_mid"
  | "home_bottom";

export interface StorefrontNotification {
  public_id: string;
  cta_text: string;
  notification_type: string;
  cta_url: string;
  cta_label: string;
  order: number;
  is_active: boolean;
  is_currently_active: boolean;
  start_at: string | null;
  end_at: string | null;
}

export interface UnifiedSearchResponse {
  products: StorefrontProductListItem[];
  categories: StorefrontCategory[];
  suggestions: string[];
  trending: boolean;
}

export interface CatalogFiltersPayload {
  categories: { public_id: string; name: string; slug: string }[];
  attributes: Record<string, { public_id: string; value: string }[]>;
  brands: string[];
  price_range: { min: number; max: number };
}

export interface ShippingZone {
  zone_public_id: string;
  name: string;
  estimated_days: string;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
  cost_rules: {
    min_order_total: number;
    shipping_cost: number;
    max_order_total?: number;
  }[];
}

export interface ShippingOption {
  rate_public_id: string;
  method_public_id: string;
  method_name: string;
  method_type: string;
  method_order: number;
  zone_public_id: string;
  zone_name: string;
  price: string;
  rate_type: string;
  min_order_total?: string;
  max_order_total?: string;
}

export interface PricingBreakdownLine {
  product_public_id: string;
  quantity: number;
  unit_price: string;
  line_subtotal: string;
}

export interface PricingBreakdownResponse {
  base_subtotal: string;
  shipping_cost: string;
  final_total: string;
  lines: PricingBreakdownLine[];
}

/** Same envelope as pricing breakdown (Paperbase `POST /pricing/preview/`). */
export type PricingPreviewResponse = PricingBreakdownResponse;

export interface PricingPreviewRequest {
  product_public_id: string;
  variant_public_id?: string;
  quantity?: number;
  shipping_zone_public_id?: string;
  shipping_method_public_id?: string;
}

export interface ShippingPreviewRequestItem {
  product_public_id: string;
  variant_public_id?: string;
  quantity: number;
}

export interface ShippingPreviewRequest {
  zone_public_id: string;
  items: ShippingPreviewRequestItem[];
}

export interface ShippingPreviewResponse {
  shipping_cost: string;
  estimated_days: string;
  currency: string;
}

export interface PricingBreakdownRequestItem {
  product_public_id: string;
  quantity: number;
  variant_public_id?: string;
}

export interface OrderCreateLine {
  product_public_id: string;
  quantity: number;
  variant_public_id?: string;
}

export interface OrderCreatePayload {
  shipping_zone_public_id: string;
  shipping_method_public_id?: string;
  shipping_name: string;
  phone: string;
  email?: string;
  shipping_address: string;
  district?: string;
  products: OrderCreateLine[];
}

export interface OrderReceiptItem {
  product_name: string;
  quantity: number;
  unit_price: string;
  total_price: string;
  variant_details: string | null;
}

/** Response from POST /orders/initiate-checkout/ */
export interface InitiateCheckoutResponse {
  status: string;
}

export interface OrderReceipt {
  public_id: string;
  order_number: string;
  status: string;
  customer_name: string;
  phone: string;
  shipping_address: string;
  items: OrderReceiptItem[];
  subtotal: string;
  shipping_cost: string;
  total: string;
}

export interface HomepageDerived {
  categorySections: {
    category: {
      public_id: string;
      name: string;
      slug: string;
      description: string;
    };
    products: StorefrontProductListItem[];
  }[];
  error: string | null;
}

export interface CartLine {
  lineId: string;
  product_public_id: string;
  variant_public_id: string | null;
  quantity: number;
  snapshot: {
    name: string;
    slug: string;
    image_url: string | null;
    price: string;
    original_price: string | null;
    variant_label?: string;
  };
}
