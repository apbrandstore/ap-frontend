export type TrackerCurrency = string;

type TrackerItem = {
  id: string;
  quantity?: number;
  item_price?: number;
};

/** Optional customer PII — SHA-256 hashed server-side before reaching Meta. Never logged or stored. */
type TrackerCustomer = {
  email?: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  external_id?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
};

type TrackerApi = {
  viewContent?: (payload: {
    id: string;
    value?: number;
    currency?: TrackerCurrency;
    customer?: TrackerCustomer;
  }) => void;
  addToCart?: (payload: {
    id: string;
    value?: number;
    currency?: TrackerCurrency;
    customer?: TrackerCustomer;
  }) => void;
  initiateCheckout?: (payload: {
    items?: TrackerItem[];
    value?: number;
    currency?: TrackerCurrency;
    customer?: TrackerCustomer;
  }) => void;
  purchase?: (payload: {
    order_id?: string;
    items?: TrackerItem[];
    value?: number;
    currency?: TrackerCurrency;
    customer?: TrackerCustomer;
  }) => void;
};

function getTracker(): TrackerApi | null {
  if (typeof window === "undefined") return null;
  const t = (window as unknown as { tracker?: TrackerApi }).tracker;
  return t && typeof t === "object" ? t : null;
}

export function trackerViewContent(payload: {
  id: string;
  value?: number;
  currency?: TrackerCurrency;
  customer?: TrackerCustomer;
}) {
  getTracker()?.viewContent?.(payload);
}

export function trackerAddToCart(payload: {
  id: string;
  value?: number;
  currency?: TrackerCurrency;
  customer?: TrackerCustomer;
}) {
  getTracker()?.addToCart?.(payload);
}

export function trackerInitiateCheckout(payload: {
  items?: TrackerItem[];
  value?: number;
  currency?: TrackerCurrency;
  customer?: TrackerCustomer;
}) {
  getTracker()?.initiateCheckout?.(payload);
}

export function trackerPurchase(payload: {
  order_id?: string;
  items?: TrackerItem[];
  value?: number;
  currency?: TrackerCurrency;
  customer?: TrackerCustomer;
}) {
  getTracker()?.purchase?.(payload);
}
