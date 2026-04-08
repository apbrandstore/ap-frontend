"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useCart } from "@/contexts/CartContext";
import { getImageUrl, pricingApi } from "@/lib/api";
import type { PricingBreakdownResponse } from "@/types/api";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";

export default function CartPage() {
  const router = useRouter();
  const { lines, loading, updateCartItem, removeCartItem, clearCart } =
    useCart();
  const [updating, setUpdating] = useState<string | null>(null);
  const [breakdown, setBreakdown] = useState<PricingBreakdownResponse | null>(
    null
  );

  useEffect(() => {
    if (lines.length === 0) {
      setBreakdown(null);
      return;
    }
    let cancelled = false;
    pricingApi
      .breakdown({
        items: lines.map((l) => ({
          product_public_id: l.product_public_id,
          quantity: l.quantity,
          ...(l.variant_public_id
            ? { variant_public_id: l.variant_public_id }
            : {}),
        })),
      })
      .then((b) => {
        if (!cancelled) setBreakdown(b);
      })
      .catch(() => {
        if (!cancelled) setBreakdown(null);
      });
    return () => {
      cancelled = true;
    };
  }, [lines]);

  const fallbackSubtotal = lines.reduce(
    (sum, l) => sum + parseFloat(l.snapshot.price) * l.quantity,
    0
  );

  const displaySubtotal = breakdown
    ? parseFloat(breakdown.base_subtotal)
    : fallbackSubtotal;
  const displayTotal = breakdown
    ? parseFloat(breakdown.final_total)
    : fallbackSubtotal;

  const handleQuantityChange = async (lineId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setUpdating(lineId);
    try {
      await updateCartItem(lineId, newQuantity);
    } finally {
      setUpdating(null);
    }
  };

  const handleRemoveItem = async (lineId: string) => {
    if (confirm("Remove this item from cart?")) {
      await removeCartItem(lineId);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center text-lg text-gray-600">Loading cart...</div>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
          <p className="text-gray-600 mb-8">Add some products to get started!</p>
          <button
            type="button"
            onClick={() => router.push("/products")}
            className="px-8 py-3 bg-black text-white rounded hover:bg-gray-800 transition-colors"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {lines.map((item) => {
            const img = getImageUrl(item.snapshot.image_url);
            const price = parseFloat(item.snapshot.price);
            const lineTotal = price * item.quantity;
            return (
              <div key={item.lineId} className="card-cart-item">
                <Link
                  href={`/products/${encodeURIComponent(item.snapshot.slug)}`}
                  className="relative w-full md:w-32 h-48 md:h-32 bg-gray-200 rounded overflow-hidden flex-shrink-0"
                >
                  {img ? (
                    <Image
                      src={img}
                      alt={item.snapshot.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="img-placeholder">
                      <span className="text-gray-500 text-sm">No Image</span>
                    </div>
                  )}
                </Link>

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <Link
                      href={`/products/${encodeURIComponent(item.snapshot.slug)}`}
                      className="text-lg font-semibold text-black hover:underline mb-2 block"
                    >
                      {item.snapshot.name}
                    </Link>
                    {item.snapshot.variant_label && (
                      <p className="text-xs text-gray-500 mb-1">
                        {item.snapshot.variant_label}
                      </p>
                    )}
                    <div className="text-sm text-gray-600 mb-2">
                      <span className="font-normal text-black">
                        ৳{price.toFixed(0)}.00
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          handleQuantityChange(item.lineId, item.quantity - 1)
                        }
                        disabled={updating === item.lineId || item.quantity <= 1}
                        className="quantity-stepper-sm"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-12 text-center font-medium">
                        {updating === item.lineId ? "..." : item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handleQuantityChange(item.lineId, item.quantity + 1)
                        }
                        disabled={updating === item.lineId}
                        className="quantity-stepper-sm"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="text-right">
                      <div className="font-normal text-lg">
                        ৳{lineTotal.toFixed(0)}.00
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.lineId)}
                        className="mt-2 text-red-600 hover:text-red-800 text-sm flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="pt-4">
            <button
              type="button"
              onClick={() => {
                if (confirm("Clear entire cart?")) clearCart();
              }}
              className="text-red-600 hover:text-red-800 text-sm"
            >
              Clear Cart
            </button>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-4">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Items</span>
                <span className="font-medium">
                  ৳{displaySubtotal.toFixed(0)}.00
                </span>
              </div>
              {breakdown && parseFloat(breakdown.shipping_cost) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping (est.)</span>
                  <span className="font-medium">
                    ৳{parseFloat(breakdown.shipping_cost).toFixed(0)}.00
                  </span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between text-lg font-normal">
                  <span>Total</span>
                  <span>৳{displayTotal.toFixed(0)}.00</span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => router.push("/order?fromCart=1")}
              className="checkout-btn w-full mb-3"
            >
              Checkout
            </button>
            <button
              type="button"
              onClick={() => router.push("/products")}
              className="checkout-btn border border-gray-300 bg-white text-black hover:bg-gray-50"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
