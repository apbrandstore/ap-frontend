import axios from "axios";
import {
  STOREFRONT_API_ORIGIN,
  storefrontPublishableKeyPublic,
  storefrontV1Url,
} from "@/lib/storefront-config";
import { normalizeStorefrontProductDetail } from "@/lib/product-detail-normalize";
import { normalizePricingBreakdownResponse } from "@/lib/pricing-normalize";
import type {
  StorePublic,
  StorefrontProductListItem,
  StorefrontProductDetail,
  StorefrontCategory,
  PublicBanner,
  BannerPlacementSlot,
  StorefrontNotification,
  UnifiedSearchResponse,
  CatalogFiltersPayload,
  ShippingZone,
  ShippingOption,
  PricingBreakdownResponse,
  PricingBreakdownRequestItem,
  PricingPreviewRequest,
  PricingPreviewResponse,
  ShippingPreviewRequest,
  ShippingPreviewResponse,
  OrderCreatePayload,
  OrderReceipt,
  InitiateCheckoutResponse,
} from "@/types/api";

export type {
  StorePublic,
  StorefrontProductListItem,
  StorefrontProductDetail,
  StorefrontCategory,
  PublicBanner,
  StorefrontNotification,
  UnifiedSearchResponse,
  CatalogFiltersPayload,
  ShippingZone,
  ShippingOption,
  PricingBreakdownResponse,
  PricingBreakdownRequestItem,
  PricingPreviewRequest,
  PricingPreviewResponse,
  ShippingPreviewRequest,
  ShippingPreviewResponse,
  OrderCreatePayload,
  OrderReceipt,
  InitiateCheckoutResponse,
  Product,
  Category,
  CategoryChild,
  HomepageDerived,
  CartLine,
} from "@/types/api";

/**
 * Browser: call same-origin `/api/v1/…` so the server can attach Authorization
 * (proxy adds auth via NEXT_PUBLIC_PUBLISHABLE_KEY).
 * Non-browser (rare): direct to backend with public key if set.
 */
const useStorefrontProxy =
  typeof window !== "undefined" && typeof STOREFRONT_API_ORIGIN === "string"
    ? STOREFRONT_API_ORIGIN.length > 0
    : false;

/**
 * Full request URL for the storefront API. Uses `baseURL: ""` on the axios instance
 * so we never rely on axios `combineURLs`, which can drop the final `/` before `?`
 * (Django APPEND_SLASH / POST body issues).
 *
 * @param fragment Path under `/api/v1` (e.g. `/products/` or `/products/foo/`)
 */
function v1RequestUrl(fragment: string): string {
  let p = fragment.trim();
  if (!p.startsWith("/")) p = `/${p}`;
  if (p.length > 1 && !p.endsWith("/")) p = `${p}/`;
  const rel = `/api/v1${p}`;
  if (useStorefrontProxy || !STOREFRONT_API_ORIGIN) return rel;
  return `${STOREFRONT_API_ORIGIN}${rel}`;
}

const api = axios.create({
  baseURL: "",
  headers: {
    "Content-Type": "application/json",
    ...(!useStorefrontProxy && storefrontPublishableKeyPublic()
      ? { Authorization: `Bearer ${storefrontPublishableKeyPublic()}` }
      : {}),
  },
});

export function getImageUrl(imageUrl: string | null): string | null {
  if (!imageUrl) return null;
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }
  const cleanUrl = imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`;
  return `${STOREFRONT_API_ORIGIN}${cleanUrl}`;
}

export function productDetailPath(identifier: string): string {
  return `/products/${encodeURIComponent(identifier)}/`;
}

export const productApi = {
  getPage: async (params?: Record<string, string | number | undefined>) => {
    const response = await api.get<{
      count: number;
      next: string | null;
      previous: string | null;
      results: StorefrontProductListItem[];
    }>(v1RequestUrl("/products/"), {
      params: Object.fromEntries(
        Object.entries(params || {}).filter(([, v]) => v !== undefined && v !== "")
      ) as Record<string, string>,
    });
    return response.data;
  },

  getAll: async (
    search?: string,
    category?: string,
    ordering?: string
  ): Promise<StorefrontProductListItem[]> => {
    const data = await productApi.getPage({
      search: search || undefined,
      category: category || undefined,
      ordering: ordering || undefined,
      sort: ordering || undefined,
      page: 1,
    });
    return data.results ?? [];
  },

  getByIdentifier: async (
    identifier: string
  ): Promise<StorefrontProductDetail> => {
    const response = await api.get<unknown>(
      v1RequestUrl(`/products/${encodeURIComponent(identifier)}/`)
    );
    return normalizeStorefrontProductDetail(response.data);
  },

  getRelated: async (
    identifier: string
  ): Promise<StorefrontProductListItem[]> => {
    const response = await api.get<StorefrontProductListItem[]>(
      v1RequestUrl(`/products/${encodeURIComponent(identifier)}/related/`)
    );
    return Array.isArray(response.data) ? response.data : [];
  },

  searchByQuery: async (q: string): Promise<StorefrontProductListItem[]> => {
    if (!q.trim() || q.trim().length < 2) return [];
    const response = await api.get<{ results?: StorefrontProductListItem[] }>(
      v1RequestUrl("/products/search/"),
      { params: { q: q.trim() } }
    );
    const d = response.data;
    return d.results ?? (Array.isArray(d) ? d : []);
  },
};

/** In-memory tree for the SPA session; avoids hammering `/categories/` (rate limits + Strict Mode double-mount). */
let categoryTreeCache: StorefrontCategory[] | undefined;
let categoryTreeInflight: Promise<StorefrontCategory[]> | null = null;

export const categoryApi = {
  getTree: async (): Promise<StorefrontCategory[]> => {
    if (categoryTreeCache !== undefined) return categoryTreeCache;
    if (categoryTreeInflight) return categoryTreeInflight;

    categoryTreeInflight = (async () => {
      try {
        const response = await api.get<StorefrontCategory[]>(v1RequestUrl("/categories/"), {
          params: { tree: 1 },
        });
        const data = Array.isArray(response.data) ? response.data : [];
        categoryTreeCache = data;
        return data;
      } finally {
        categoryTreeInflight = null;
      }
    })();

    return categoryTreeInflight;
  },

  getBySlug: async (slug: string): Promise<StorefrontCategory> => {
    const response = await api.get<StorefrontCategory>(
      v1RequestUrl(`/categories/${encodeURIComponent(slug)}/`)
    );
    return response.data;
  },
};

export const storeApi = {
  getPublic: async (): Promise<StorePublic> => {
    const response = await api.get<StorePublic>(v1RequestUrl("/store/public/"));
    return response.data;
  },
};

export const bannerApi = {
  getAll: async (): Promise<PublicBanner[]> => {
    const response = await api.get<PublicBanner[] | { results?: PublicBanner[] }>(
      v1RequestUrl("/banners/")
    );
    const d = response.data;
    if (Array.isArray(d)) return d;
    return d?.results ?? [];
  },

  /** Optional `slot` filter per `GET /banners/?slot=` */
  getForSlot: async (slot: BannerPlacementSlot): Promise<PublicBanner[]> => {
    const response = await api.get<PublicBanner[] | { results?: PublicBanner[] }>(
      v1RequestUrl("/banners/"),
      { params: { slot } }
    );
    const d = response.data;
    if (Array.isArray(d)) return d;
    return d?.results ?? [];
  },
};

export const searchApi = {
  unified: async (q?: string, trending?: boolean): Promise<UnifiedSearchResponse> => {
    const params: Record<string, string> = {};
    if (trending) params.trending = "1";
    else if (q?.trim()) params.q = q.trim();
    const response = await api.get<UnifiedSearchResponse>(v1RequestUrl("/search/"), {
      params,
    });
    return response.data;
  },
};

export const catalogApi = {
  getFilters: async (): Promise<CatalogFiltersPayload> => {
    const response = await api.get<CatalogFiltersPayload>(v1RequestUrl("/catalog/filters/"));
    return response.data;
  },
};

export const notificationApi = {
  getActive: async (): Promise<StorefrontNotification[]> => {
    try {
      const response = await api.get<
        | StorefrontNotification[]
        | { results?: StorefrontNotification[] }
        | StorefrontNotification
      >(v1RequestUrl("/notifications/active/"));
      const d = response.data;
      let list: StorefrontNotification[] = [];
      if (Array.isArray(d)) list = d;
      else if (d && typeof d === "object" && "results" in d && Array.isArray(d.results))
        list = d.results;
      else if (d && typeof d === "object" && "public_id" in d)
        list = [d as StorefrontNotification];
      return list
        .filter((n) => n.is_currently_active === true)
        .sort((a, b) => a.order - b.order);
    } catch {
      return [];
    }
  },

  getFirstActive: async (): Promise<StorefrontNotification | null> => {
    const list = await notificationApi.getActive();
    return list[0] ?? null;
  },
};

let shippingZonesCache: ShippingZone[] | undefined;
let shippingZonesInflight: Promise<ShippingZone[]> | null = null;

export const shippingApi = {
  getZones: async (): Promise<ShippingZone[]> => {
    if (shippingZonesCache !== undefined) return shippingZonesCache;
    if (shippingZonesInflight) return shippingZonesInflight;

    shippingZonesInflight = (async () => {
      try {
        const response = await api.get<ShippingZone[]>(v1RequestUrl("/shipping/zones/"));
        const data = Array.isArray(response.data) ? response.data : [];
        shippingZonesCache = data;
        return data;
      } finally {
        shippingZonesInflight = null;
      }
    })();

    return shippingZonesInflight;
  },

  getOptions: async (
    zonePublicId: string,
    orderTotal?: string
  ): Promise<ShippingOption[]> => {
    const response = await api.get<ShippingOption[]>(v1RequestUrl("/shipping/options/"), {
      params: {
        zone_public_id: zonePublicId,
        ...(orderTotal !== undefined ? { order_total: orderTotal } : {}),
      },
    });
    return Array.isArray(response.data) ? response.data : [];
  },

  preview: async (
    body: ShippingPreviewRequest
  ): Promise<ShippingPreviewResponse> => {
    const response = await api.post<ShippingPreviewResponse>(
      v1RequestUrl("/shipping/preview/"),
      body
    );
    return response.data;
  },
};

export const pricingApi = {
  breakdown: async (body: {
    items: PricingBreakdownRequestItem[];
    shipping_zone_public_id?: string;
    shipping_method_public_id?: string;
  }): Promise<PricingBreakdownResponse> => {
    const response = await api.post<unknown>(v1RequestUrl("/pricing/breakdown/"), body);
    return normalizePricingBreakdownResponse(response.data);
  },

  preview: async (body: PricingPreviewRequest): Promise<PricingPreviewResponse> => {
    const response = await api.post<unknown>(v1RequestUrl("/pricing/preview/"), body);
    return normalizePricingBreakdownResponse(response.data);
  },
};

function normalizeInitiateCheckoutResponse(raw: unknown): InitiateCheckoutResponse {
  if (!raw || typeof raw !== "object") return { status: "ok" };
  const o = raw as Record<string, unknown>;
  const status = o.status;
  if (typeof status === "string" && status.trim()) return { status: status.trim() };
  return { status: "ok" };
}

export const orderApi = {
  initiateCheckout: async (): Promise<InitiateCheckoutResponse> => {
    const response = await api.post<unknown>(
      v1RequestUrl("/orders/initiate-checkout/"),
      {}
    );
    return normalizeInitiateCheckoutResponse(response.data);
  },

  create: async (data: OrderCreatePayload): Promise<OrderReceipt> => {
    const response = await api.post<OrderReceipt>(v1RequestUrl("/orders/"), data);
    return response.data;
  },
};

/** For modules that need raw URL (e.g. tests) */
export { storefrontV1Url };
