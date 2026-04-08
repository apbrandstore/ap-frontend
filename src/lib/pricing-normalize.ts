import type { PricingBreakdownResponse } from "@/types/api";

/** Normalize `POST /pricing/breakdown/` JSON (snake_case or camelCase). */
export function normalizePricingBreakdownResponse(
  raw: unknown
): PricingBreakdownResponse {
  if (!raw || typeof raw !== "object") {
    return {
      base_subtotal: "0",
      shipping_cost: "0",
      final_total: "0",
      lines: [],
    };
  }
  const r = raw as Record<string, unknown>;
  return {
    base_subtotal: String(r.base_subtotal ?? r.baseSubtotal ?? "0"),
    shipping_cost: String(r.shipping_cost ?? r.shippingCost ?? "0"),
    final_total: String(r.final_total ?? r.finalTotal ?? "0"),
    lines: Array.isArray(r.lines) ? (r.lines as PricingBreakdownResponse["lines"]) : [],
  };
}
