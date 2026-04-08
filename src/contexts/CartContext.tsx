"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CartLine } from "@/types/api";

const STORAGE_KEY = "akkho-storefront-cart-v1";

interface CartContextType {
  lines: CartLine[];
  loading: boolean;
  itemCount: number;
  addToCart: (
    productPublicId: string,
    quantity: number,
    variantPublicId: string | null,
    snapshot: CartLine["snapshot"]
  ) => Promise<void>;
  updateCartItem: (lineId: string, quantity: number) => Promise<void>;
  removeCartItem: (lineId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function loadLines(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartLine[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLines(lines: CartLine[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLines(loadLines());
    setLoading(false);
  }, []);

  const itemCount = useMemo(
    () => lines.reduce((n, l) => n + l.quantity, 0),
    [lines]
  );

  const persist = useCallback((next: CartLine[]) => {
    setLines(next);
    saveLines(next);
  }, []);

  const refreshCart = useCallback(() => {
    setLines(loadLines());
  }, []);

  const addToCart = useCallback(
    async (
      productPublicId: string,
      quantity: number,
      variantPublicId: string | null,
      snapshot: CartLine["snapshot"]
    ) => {
      const existing = lines.find(
        (l) =>
          l.product_public_id === productPublicId &&
          l.variant_public_id === variantPublicId
      );
      if (existing) {
        persist(
          lines.map((l) =>
            l.lineId === existing.lineId
              ? { ...l, quantity: l.quantity + quantity }
              : l
          )
        );
        return;
      }
      const line: CartLine = {
        lineId:
          typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : `${productPublicId}-${variantPublicId ?? ""}-${Date.now()}`,
        product_public_id: productPublicId,
        variant_public_id: variantPublicId,
        quantity,
        snapshot,
      };
      persist([...lines, line]);
    },
    [lines, persist]
  );

  const updateCartItem = useCallback(
    async (lineId: string, quantity: number) => {
      if (quantity < 1) return;
      persist(
        lines.map((l) =>
          l.lineId === lineId ? { ...l, quantity } : l
        )
      );
    },
    [lines, persist]
  );

  const removeCartItem = useCallback(
    async (lineId: string) => {
      persist(lines.filter((l) => l.lineId !== lineId));
    },
    [lines, persist]
  );

  const clearCart = useCallback(async () => {
    persist([]);
  }, [persist]);

  return (
    <CartContext.Provider
      value={{
        lines,
        loading,
        itemCount,
        addToCart,
        updateCartItem,
        removeCartItem,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
