export type TrackerCurrency = string;

type TrackerItem = {
  id: string;
  quantity?: number;
  item_price?: number;
};

type TrackerApi = {
  viewContent?: (payload: { id: string; value?: number; currency?: TrackerCurrency }) => void;
  addToCart?: (payload: { id: string; value?: number; currency?: TrackerCurrency }) => void;
  initiateCheckout?: (payload: {
    items?: TrackerItem[];
    value?: number;
    currency?: TrackerCurrency;
  }) => void;
  purchase?: (payload: {
    items?: TrackerItem[];
    value?: number;
    currency?: TrackerCurrency;
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
}) {
  getTracker()?.viewContent?.(payload);
}

export function trackerAddToCart(payload: {
  id: string;
  value?: number;
  currency?: TrackerCurrency;
}) {
  getTracker()?.addToCart?.(payload);
}

export function trackerInitiateCheckout(payload: {
  items?: TrackerItem[];
  value?: number;
  currency?: TrackerCurrency;
}) {
  getTracker()?.initiateCheckout?.(payload);
}

export function trackerPurchase(payload: {
  items?: TrackerItem[];
  value?: number;
  currency?: TrackerCurrency;
}) {
  getTracker()?.purchase?.(payload);
}

