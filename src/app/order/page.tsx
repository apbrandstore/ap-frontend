"use client";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

import {
  useState,
  useEffect,
  useLayoutEffect,
  Suspense,
  useMemo,
  useRef,
} from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  productApi,
  getImageUrl,
  orderApi,
  shippingApi,
  pricingApi,
  type StorefrontProductDetail,
  type OrderReceipt,
  type ShippingZone,
  type ShippingOption,
  type PricingBreakdownRequestItem,
} from "@/lib/api";
import { useCart } from "@/contexts/CartContext";
import type { CartLine, StorefrontProductVariant } from "@/types/api";
import {
  buildMatrixFromVariants,
  defaultSelectionsForProduct,
  defaultSelectionsFromVariant,
  findVariantForSelections,
  variantLabel,
} from "@/lib/variant-utils";
import { ArrowLeft, CheckCircle, Download, ShoppingBag } from "lucide-react";
import { generateOrderPDF, type OrderPDFData } from "@/lib/generateOrderPDF";
import { PlacementBanners } from "@/components/common/PlacementBanners";
import { galleryImageUrlsForProduct } from "@/lib/product-gallery-urls";
import axios from "axios";

interface CheckoutLine {
  product_public_id: string;
  variant_public_id: string | null;
  quantity: number;
  snapshot: CartLine["snapshot"];
}

function buildSnapshotFromDetail(
  detail: StorefrontProductDetail,
  variantPublicId: string | null
): CartLine["snapshot"] {
  const v = detail.variants?.find((x) => x.public_id === variantPublicId);
  const price = v?.price ?? detail.price;
  return {
    name: detail.name,
    slug: detail.slug,
    image_url: detail.image_url,
    price,
    original_price: detail.original_price,
    variant_label: v ? variantLabel(v) : undefined,
  };
}

function variantStockSummary(v: StorefrontProductVariant): string {
  if (v.stock_status === "out_of_stock" || v.available_quantity <= 0) {
    return "Out of stock";
  }
  if (v.stock_status === "low_stock" || v.stock_status === "low") {
    return `${v.available_quantity} left (low stock)`;
  }
  return `${v.available_quantity} available`;
}

function maxQuantityForLine(
  detail: StorefrontProductDetail | undefined,
  variantPublicId: string | null
): number {
  if (!detail?.stock_tracking) return 1000;
  if (variantPublicId) {
    const v = detail.variants?.find((x) => x.public_id === variantPublicId);
    if (v) return Math.max(0, v.available_quantity);
  }
  return Math.max(0, detail.available_quantity ?? 0);
}

interface OrderSummaryLineCardProps {
  line: CheckoutLine;
  index: number;
  detail: StorefrontProductDetail | undefined;
  galleryUrls: string[];
  selectVariantAttribute: (
    lineIndex: number,
    detail: StorefrontProductDetail,
    slug: string,
    valuePublicId: string
  ) => void;
  setLineQty: (index: number, qty: number) => void;
}

/** Gallery height tracks the details column; overflow scrolls (slider) without exceeding it. */
function OrderSummaryLineCard({
  line,
  index,
  detail,
  galleryUrls,
  selectVariantAttribute,
  setLineQty,
}: OrderSummaryLineCardProps) {
  const detailsRef = useRef<HTMLDivElement>(null);
  const [galleryMaxPx, setGalleryMaxPx] = useState<number | null>(null);

  useLayoutEffect(() => {
    const el = detailsRef.current;
    if (!el) return;
    const sync = () => {
      setGalleryMaxPx(el.getBoundingClientRect().height);
    };
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    sync();
    return () => ro.disconnect();
  }, []);

  const variants = detail?.variants ?? [];
  const hasVariants = variants.length > 0;
  const selectedVariant = variants.find(
    (v) => v.public_id === line.variant_public_id
  );
  const variantSelections = selectedVariant
    ? defaultSelectionsFromVariant(selectedVariant)
    : detail
      ? defaultSelectionsForProduct(detail)
      : {};
  const variantMatrix = detail ? buildMatrixFromVariants(detail) : {};
  const variantMatrixKeys = Object.keys(variantMatrix).sort();
  const maxQty = maxQuantityForLine(detail, line.variant_public_id);
  const atMax =
    Boolean(detail?.stock_tracking) && maxQty > 0 && line.quantity >= maxQty;

  return (
    <div className="border border-gray-200 rounded p-4">
      <div className="flex gap-4 items-start">
        <div
          className="flex min-h-0 w-20 shrink-0 flex-col gap-2 overflow-y-auto overflow-x-hidden overscroll-contain rounded-sm [scrollbar-width:thin] [scrollbar-color:rgba(0,0,0,0.35)_transparent] touch-pan-y"
          style={
            galleryMaxPx != null
              ? { maxHeight: galleryMaxPx }
              : { maxHeight: "min(55vh, 22rem)" }
          }
        >
          {galleryUrls.length > 0 ? (
            galleryUrls.map((rawUrl, imgIndex) => {
              const src = getImageUrl(rawUrl);
              if (!src) return null;
              return (
                <div
                  key={`${rawUrl}-${imgIndex}`}
                  className="relative w-20 shrink-0 aspect-[3/4] overflow-hidden rounded bg-gray-100"
                >
                  <Image
                    src={src}
                    alt={
                      imgIndex === 0
                        ? line.snapshot.name
                        : `${line.snapshot.name} — ${imgIndex + 1}`
                    }
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              );
            })
          ) : (
            <div className="flex aspect-[3/4] w-20 shrink-0 items-center justify-center rounded bg-gray-200 text-xs text-gray-500">
              No img
            </div>
          )}
        </div>

        <div ref={detailsRef} className="min-w-0 flex-1">
          <a
            href={`/products/${encodeURIComponent(line.snapshot.slug)}`}
            className="block truncate font-semibold text-black hover:underline"
          >
            {line.snapshot.name}
          </a>

          {!detail ? (
            <p className="mt-1 text-xs text-gray-500">Loading options…</p>
          ) : hasVariants ? (
            <div className="mt-3 space-y-4">
              {variantMatrixKeys.map((slug) => {
                const attr = variantMatrix[slug];
                return (
                  <div key={slug}>
                    <p className="mb-2 text-sm font-medium uppercase tracking-wider text-gray-700">
                      {attr.attribute_name}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {attr.values.map((val) => {
                        const active =
                          variantSelections[slug] === val.value_public_id;
                        return (
                          <button
                            key={val.value_public_id}
                            type="button"
                            onClick={() =>
                              selectVariantAttribute(
                                index,
                                detail,
                                slug,
                                val.value_public_id
                              )
                            }
                            className={`rounded border-2 px-3 py-1.5 text-sm transition-colors ${
                              active
                                ? "border-black bg-black text-white"
                                : "border-gray-200 hover:border-gray-400"
                            }`}
                          >
                            {val.value}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              {selectedVariant ? (
                <p className="text-xs text-gray-500">
                  Stock: {variantStockSummary(selectedVariant)}
                </p>
              ) : null}
            </div>
          ) : (
            line.snapshot.variant_label && (
              <p className="mt-1 text-xs text-gray-600">
                {line.snapshot.variant_label}
              </p>
            )
          )}

          <p className="mt-2 text-sm">
            ৳{parseFloat(line.snapshot.price).toFixed(0)} each
          </p>
          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              className="quantity-stepper-sm"
              onClick={() => setLineQty(index, line.quantity - 1)}
              disabled={line.quantity <= 1}
            >
              −
            </button>
            <span className="w-8 text-center">{line.quantity}</span>
            <button
              type="button"
              className="quantity-stepper-sm"
              onClick={() => setLineQty(index, line.quantity + 1)}
              disabled={line.quantity >= 1000 || atMax}
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function firePurchaseEvent(
  orderRef: string,
  totalPrice: number,
  productPublicIds: string[]
) {
  void orderRef;
  void totalPrice;
  void productPublicIds;
}

function OrderPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { lines: cartLines, clearCart, loading: cartLoading } = useCart();

  const fromCart = searchParams.get("fromCart") === "1";
  const productSlug = searchParams.get("product");
  const variantFromUrl = searchParams.get("variant");

  const [lines, setLines] = useState<CheckoutLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [receipt, setReceipt] = useState<OrderReceipt | null>(null);

  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [zoneId, setZoneId] = useState("");
  const [options, setOptions] = useState<ShippingOption[]>([]);
  /** Selected shipping rate (`rate_public_id`) — unique per row; maps to `method_public_id` for the API. */
  const [shippingRateId, setShippingRateId] = useState("");

  const [breakdown, setBreakdown] = useState<{
    base_subtotal: string;
    shipping_cost: string;
    final_total: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    customer_name: "",
    district: "",
    address: "",
    phone_number: "",
    email: "",
  });

  const checkoutInitSentRef = useRef(false);
  const loadedProductIdsRef = useRef<Set<string>>(new Set());
  const [productDetails, setProductDetails] = useState<
    Record<string, StorefrontProductDetail>
  >({});

  useEffect(() => {
    let cancelled = false;
    shippingApi.getZones().then((z) => {
      if (cancelled) return;
      const active = z.filter((x) => x.is_active);
      setZones(active);
      setZoneId((prev) => {
        if (active.length === 0) return "";
        if (prev && active.some((x) => x.zone_public_id === prev)) return prev;
        return active[0].zone_public_id;
      });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    async function init() {
      if (fromCart) {
        if (cartLoading) {
          setLoading(true);
          return;
        }
        if (cartLines.length === 0) {
          setError("কার্ট খালি");
          setLoading(false);
          return;
        }
        setLines(
          cartLines.map((l) => ({
            product_public_id: l.product_public_id,
            variant_public_id: l.variant_public_id,
            quantity: l.quantity,
            snapshot: l.snapshot,
          }))
        );
        setLoading(false);
        return;
      }

      if (!productSlug) {
        setError("পণ্য নির্বাচন করা হয়নি");
        setLoading(false);
        return;
      }

      try {
        const detail = await productApi.getByIdentifier(productSlug);
        const needsVariant = (detail.variants?.length ?? 0) > 0;
        let vId: string | null = variantFromUrl || null;
        if (needsVariant && vId) {
          const ok = detail.variants?.some((v) => v.public_id === vId);
          if (!ok) vId = detail.variants?.[0]?.public_id ?? null;
        } else if (!needsVariant) {
          vId = null;
        } else {
          vId = detail.variants?.[0]?.public_id ?? null;
        }
        loadedProductIdsRef.current.add(detail.public_id);
        setProductDetails((prev) => ({ ...prev, [detail.public_id]: detail }));
        setLines([
          {
            product_public_id: detail.public_id,
            variant_public_id: vId,
            quantity: 1,
            snapshot: buildSnapshotFromDetail(detail, vId),
          },
        ]);
      } catch {
        setError("পণ্য পাওয়া যায়নি");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [fromCart, productSlug, variantFromUrl, cartLines, cartLoading]);

  useEffect(() => {
    if (lines.length === 0) return;
    const ids = [...new Set(lines.map((l) => l.product_public_id))];
    const missing = ids.filter((id) => !loadedProductIdsRef.current.has(id));
    if (missing.length === 0) return;
    let cancelled = false;
    Promise.all(
      missing.map((id) =>
        productApi.getByIdentifier(id).then((d) => ({ id, d }))
      )
    )
      .then((results) => {
        if (cancelled) return;
        for (const { id } of results) loadedProductIdsRef.current.add(id);
        setProductDetails((prev) => {
          const next = { ...prev };
          for (const { id, d } of results) next[id] = d;
          return next;
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [lines]);

  useEffect(() => {
    setLines((prev) => {
      if (prev.length === 0) return prev;
      let dirty = false;
      const next = prev.map((line) => {
        const d = productDetails[line.product_public_id];
        if (!d) return line;

        let variantId = line.variant_public_id;
        if (d.variants && d.variants.length > 0) {
          const valid =
            variantId && d.variants.some((v) => v.public_id === variantId);
          if (!valid) {
            variantId = d.variants[0]?.public_id ?? null;
          }
        } else {
          variantId = null;
        }

        const max = maxQuantityForLine(d, variantId);
        let qty = line.quantity;
        if (d.stock_tracking && max > 0 && qty > max) {
          qty = max;
        }

        const variantChanged = variantId !== line.variant_public_id;
        if (variantChanged) {
          dirty = true;
          return {
            ...line,
            variant_public_id: variantId,
            snapshot: buildSnapshotFromDetail(d, variantId),
            quantity: Math.max(1, qty),
          };
        }

        if (qty !== line.quantity) {
          dirty = true;
          return { ...line, quantity: Math.max(1, qty) };
        }

        return line;
      });

      return dirty ? next : prev;
    });
  }, [productDetails]);

  const pricingItems: PricingBreakdownRequestItem[] = useMemo(
    () =>
      lines.map((l) => ({
        product_public_id: l.product_public_id,
        quantity: l.quantity,
        ...(l.variant_public_id
          ? { variant_public_id: l.variant_public_id }
          : {}),
      })),
    [lines]
  );

  const merchandiseSubtotal = useMemo(
    () =>
      lines.reduce(
        (s, l) => s + parseFloat(l.snapshot.price) * l.quantity,
        0
      ),
    [lines]
  );

  const selectedShippingOption = useMemo(
    () => options.find((o) => o.rate_public_id === shippingRateId),
    [options, shippingRateId]
  );

  const methodPublicId = selectedShippingOption?.method_public_id ?? "";

  useEffect(() => {
    if (!zoneId || pricingItems.length === 0) {
      setOptions([]);
      setShippingRateId("");
      return;
    }
    let cancelled = false;
    shippingApi
      .getOptions(zoneId, merchandiseSubtotal.toFixed(2))
      .then((o) => {
        if (!cancelled) {
          setOptions(o);
          if (o.length === 1) {
            setShippingRateId(o[0].rate_public_id);
          } else if (o.length === 0) {
            setShippingRateId("");
          } else {
            setShippingRateId((prev) =>
              prev && o.some((x) => x.rate_public_id === prev) ? prev : ""
            );
          }
        }
      });
    return () => {
      cancelled = true;
    };
  }, [zoneId, merchandiseSubtotal, pricingItems.length]);

  useEffect(() => {
    if (pricingItems.length === 0) {
      setBreakdown(null);
      return;
    }
    if (!zoneId) {
      setBreakdown(null);
      return;
    }
    let cancelled = false;
    pricingApi
      .breakdown({
        items: pricingItems,
        shipping_zone_public_id: zoneId,
        ...(methodPublicId
          ? { shipping_method_public_id: methodPublicId }
          : {}),
      })
      .then((b) => {
        if (!cancelled)
          setBreakdown({
            base_subtotal: b.base_subtotal,
            shipping_cost: b.shipping_cost,
            final_total: b.final_total,
          });
      })
      .catch(() => {
        if (!cancelled) setBreakdown(null);
      });
    return () => {
      cancelled = true;
    };
  }, [pricingItems, zoneId, methodPublicId]);

  useEffect(() => {
    if (loading || lines.length === 0) return;
    if (checkoutInitSentRef.current) return;
    checkoutInitSentRef.current = true;
    orderApi.initiateCheckout().catch(() => {});
  }, [loading, lines.length]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    if (name === "phone_number") {
      const digits = value.replace(/\D/g, "").slice(0, 11);
      setFormData((prev) => ({ ...prev, phone_number: digits }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const setLineVariant = (index: number, variantPublicId: string) => {
    setLines((prev) =>
      prev.map((l, i) => {
        if (i !== index) return l;
        const detail = productDetails[l.product_public_id];
        if (!detail) return l;
        const snap = buildSnapshotFromDetail(detail, variantPublicId);
        const max = maxQuantityForLine(detail, variantPublicId);
        const nextQty = max > 0 ? Math.min(l.quantity, max) : l.quantity;
        return {
          ...l,
          variant_public_id: variantPublicId,
          snapshot: snap,
          quantity: Math.max(1, nextQty),
        };
      })
    );
  };

  /** Same interaction model as the product detail page: matrix + attribute buttons. */
  const selectVariantAttribute = (
    lineIndex: number,
    detail: StorefrontProductDetail,
    slug: string,
    valuePublicId: string
  ) => {
    const variants = detail.variants || [];
    const line = lines[lineIndex];
    if (!line || variants.length === 0) return;
    const vCurrent = variants.find((x) => x.public_id === line.variant_public_id);
    const base = vCurrent
      ? defaultSelectionsFromVariant(vCurrent)
      : defaultSelectionsForProduct(detail);
    const next = { ...base, [slug]: valuePublicId };
    const matched = findVariantForSelections(variants, next);
    if (matched) {
      setLineVariant(lineIndex, matched.public_id);
      return;
    }
    const withVal = variants.filter((v) =>
      v.options?.some(
        (o) => o.attribute_slug === slug && o.value_public_id === valuePublicId
      )
    );
    const pick =
      withVal.find(
        (x) =>
          x.stock_status !== "out_of_stock" && x.available_quantity > 0
      ) ?? withVal[0];
    if (pick) setLineVariant(lineIndex, pick.public_id);
  };

  const setLineQty = (index: number, qty: number) => {
    setLines((prev) =>
      prev.map((l, i) => {
        if (i !== index) return l;
        const detail = productDetails[l.product_public_id];
        const max = maxQuantityForLine(detail, l.variant_public_id);
        const cap = max > 0 ? max : 1000;
        return { ...l, quantity: Math.max(1, Math.min(qty, cap)) };
      })
    );
  };

  const displaySubtotal = useMemo(() => {
    if (breakdown) return parseFloat(breakdown.base_subtotal);
    return merchandiseSubtotal;
  }, [breakdown, merchandiseSubtotal]);

  /** Prefer API shipping; if it is 0 or missing but a rate is selected, use the option price (quote fallback). */
  const displayShipping = useMemo(() => {
    const fromApi = breakdown ? parseFloat(breakdown.shipping_cost) : NaN;
    const fromOpt = selectedShippingOption
      ? parseFloat(selectedShippingOption.price)
      : NaN;

    if (Number.isFinite(fromApi) && fromApi > 0) return fromApi;

    if (shippingRateId && selectedShippingOption && Number.isFinite(fromOpt)) {
      return fromOpt;
    }

    if (Number.isFinite(fromApi)) return fromApi;
    return 0;
  }, [breakdown, shippingRateId, selectedShippingOption]);

  const displayTotal = useMemo(
    () => displaySubtotal + displayShipping,
    [displaySubtotal, displayShipping]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lines.length === 0) {
      setError("অনুগ্রহ করে অন্তত একটি পণ্য যোগ করুন");
      return;
    }
    if (!formData.customer_name.trim()) {
      setError("অনুগ্রহ করে আপনার নাম লিখুন");
      return;
    }
    if (!zoneId) {
      setError("অনুগ্রহ করে শিপিং জোন নির্বাচন করুন");
      return;
    }
    if (!formData.address.trim()) {
      setError("অনুগ্রহ করে আপনার ঠিকানা লিখুন");
      return;
    }
    if (!formData.phone_number.trim()) {
      setError("অনুগ্রহ করে আপনার মোবাইল নাম্বার লিখুন");
      return;
    }
    const phone = formData.phone_number;
    if (!/^01\d{9}$/.test(phone)) {
      setError(
        "মোবাইল নাম্বার ১১ সংখ্যার হতে হবে এবং ০১ দিয়ে শুরু হতে হবে (যেমন: 01XXXXXXXXX)"
      );
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const rec = await orderApi.create({
        shipping_zone_public_id: zoneId,
        ...(methodPublicId
          ? { shipping_method_public_id: methodPublicId }
          : {}),
        shipping_name: formData.customer_name.trim(),
        phone: phone.trim(),
        email: formData.email.trim() || undefined,
        shipping_address: formData.address.trim(),
        district: formData.district.trim() || undefined,
        products: lines.map((l) => ({
          product_public_id: l.product_public_id,
          quantity: l.quantity,
          ...(l.variant_public_id
            ? { variant_public_id: l.variant_public_id }
            : {}),
        })),
      });

      firePurchaseEvent(
        rec.public_id,
        parseFloat(rec.total),
        lines.map((l) => l.product_public_id)
      );

      if (fromCart) await clearCart();

      setReceipt(rec);
      setSuccess(true);
    } catch (err: unknown) {
      let msg =
        "অর্ডার তৈরি করতে ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।";
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const raw = err.response?.data;
        if (status === 429) {
          msg = "অনেক বেশি অর্ডার চেষ্টা। কিছুক্ষণ পর আবার চেষ্টা করুন।";
        } else if (raw && typeof raw === "object") {
          const data = raw as Record<string, unknown>;
          const parts: string[] = [];
          if (typeof data.detail === "string" && data.detail)
            parts.push(data.detail);
          if (Array.isArray(data.errors)) {
            for (const e of data.errors) {
              if (typeof e === "string") parts.push(e);
            }
          }
          for (const [key, val] of Object.entries(data)) {
            if (key === "detail" || key === "errors") continue;
            if (Array.isArray(val) && val.every((x) => typeof x === "string")) {
              parts.push(...(val as string[]));
            }
          }
          const merged = [...new Set(parts)].filter(Boolean);
          if (merged.length > 0) msg = merged.join(" ");
        }
      }
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (success) window.scrollTo({ top: 0, behavior: "smooth" });
  }, [success]);

  const handleDownloadPDF = () => {
    if (!receipt) return;
    const pdfData: OrderPDFData = {
      orderRef: receipt.order_number || receipt.public_id,
      orderDate: new Date().toISOString(),
      customerName: formData.customer_name,
      phoneNumber: formData.phone_number,
      address: formData.address,
      district: formData.district || "—",
      paymentMethod: "Cash on Delivery (COD)",
      items: receipt.items.map((it) => ({
        name: it.product_name,
        variantDetails: it.variant_details || "",
        quantity: it.quantity,
        unitPrice: parseFloat(it.unit_price),
        total: parseFloat(it.total_price),
      })),
      productTotal: parseFloat(receipt.subtotal),
      deliveryCharge: parseFloat(receipt.shipping_cost),
      totalAmount: parseFloat(receipt.total),
    };
    generateOrderPDF(pdfData);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center text-lg text-gray-600">লোড হচ্ছে...</div>
      </div>
    );
  }

  if (error && lines.length === 0 && !loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center text-lg text-red-600 mb-4">{error}</div>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="mx-auto block btn-outline"
        >
          হোম পেজে ফিরে যান
        </button>
      </div>
    );
  }

  if (success && receipt) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8 md:py-16">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <div className="success-icon-wrap">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                অর্ডার সফল হয়েছে!
              </h1>
              <p className="text-gray-600">
                আপনার অর্ডারের জন্য ধন্যবাদ, {formData.customer_name}!
              </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
              <div className="bg-gradient-to-r from-green-600 to-green-500 px-6 py-4 text-white">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <div>
                    <p className="text-green-100 text-sm">অর্ডার নম্বর</p>
                    <p className="font-bold text-lg">#{receipt.order_number}</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    গ্রাহকের তথ্য
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">নাম:</span>
                      <span className="font-medium">{receipt.customer_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">মোবাইল:</span>
                      <span className="font-medium">{receipt.phone}</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-gray-600">ঠিকানা:</span>
                      <span className="font-medium text-right max-w-[200px]">
                        {receipt.shipping_address}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">পণ্য</h3>
                  <div className="space-y-3">
                    {receipt.items.map((it, index) => (
                      <div
                        key={`${it.product_name}-${index}`}
                        className="flex justify-between text-sm bg-gray-50 rounded-lg p-3"
                      >
                        <div>
                          <p className="font-medium">{it.product_name}</p>
                          {it.variant_details && (
                            <p className="text-gray-600 text-xs">
                              {it.variant_details}
                            </p>
                          )}
                          <p className="text-gray-500">× {it.quantity}</p>
                        </div>
                        <p className="font-semibold">
                          ৳{parseFloat(it.total_price).toFixed(0)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>পণ্যের মোট</span>
                    <span>৳{parseFloat(receipt.subtotal).toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>শিপিং</span>
                    <span>৳{parseFloat(receipt.shipping_cost).toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-green-600">
                    <span>সর্বমোট</span>
                    <span>৳{parseFloat(receipt.total).toFixed(0)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                onClick={handleDownloadPDF}
                className="btn-outline-secondary"
              >
                <Download className="w-5 h-5" />
                রিসিট ডাউনলোড করুন
              </button>
              <button
                type="button"
                onClick={() => router.push("/products")}
                className="btn-green-solid"
              >
                <ShoppingBag className="w-5 h-5" />
                আরও কেনাকাটা করুন
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (lines.length === 0) return null;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-2 text-black hover:underline mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-black mb-8">
            অর্ডার করতে নিচের তথ্যগুলি দিন
          </h1>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-black mb-4">
                Order Summary
              </h2>
              <div className="space-y-4 mb-4">
                {lines.map((line, index) => {
                  const detail = productDetails[line.product_public_id];
                  const galleryUrls = detail
                    ? galleryImageUrlsForProduct(detail)
                    : line.snapshot.image_url
                      ? [line.snapshot.image_url]
                      : [];
                  return (
                    <OrderSummaryLineCard
                      key={`${line.product_public_id}-${index}`}
                      line={line}
                      index={index}
                      detail={detail}
                      galleryUrls={galleryUrls}
                      selectVariantAttribute={selectVariantAttribute}
                      setLineQty={setLineQty}
                    />
                  );
                })}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-black mb-2">
                  শিপিং জোন <span className="text-red-500">*</span>
                </label>
                <select
                  name="zone"
                  value={zoneId}
                  onChange={(e) => {
                    setZoneId(e.target.value);
                    setShippingRateId("");
                  }}
                  className="input-textarea w-full"
                  required
                >
                  <option value="">নির্বাচন করুন</option>
                  {zones.map((z) => (
                    <option key={z.zone_public_id} value={z.zone_public_id}>
                      {z.name}
                    </option>
                  ))}
                </select>
              </div>

              {options.length > 0 && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-black mb-2">
                    শিপিং মেথড
                  </label>
                  <select
                    name="method"
                    value={shippingRateId}
                    onChange={(e) => setShippingRateId(e.target.value)}
                    className="input-textarea w-full"
                  >
                    <option value="">ডিফল্ট / যেকোনো</option>
                    {options.map((o) => (
                      <option
                        key={o.rate_public_id}
                        value={o.rate_public_id}
                      >
                        {o.method_name} — ৳{parseFloat(o.price).toFixed(0)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="border-t border-gray-200 pt-3 mt-3 space-y-1 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>পণ্যের মোট:</span>
                  <span>৳{displaySubtotal.toFixed(0)}.00</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>শিপিং:</span>
                  <span>৳{displayShipping.toFixed(0)}.00</span>
                </div>
                <div className="order-summary-row">
                  <span>মোট:</span>
                  <span>৳{displayTotal.toFixed(0)}.00</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-black mb-6">
                গ্রাহকের তথ্য
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="customer_name"
                    className="block text-sm font-medium text-black mb-2"
                  >
                    নাম <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="customer_name"
                    name="customer_name"
                    value={formData.customer_name}
                    onChange={handleInputChange}
                    required
                    className="input-textarea"
                    placeholder="আপনার নাম"
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone_number"
                    className="block text-sm font-medium text-black mb-2"
                  >
                    মোবাইল নাম্বার <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone_number"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    required
                    className="input-textarea"
                    placeholder="01XXXXXXXXX"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-black mb-2"
                  >
                    ইমেইল <span className="text-gray-500">(ঐচ্ছিক)</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="input-textarea"
                  />
                </div>

                <div>
                  <label
                    htmlFor="district"
                    className="block text-sm font-medium text-black mb-2"
                  >
                    জেলা / এলাকা <span className="text-gray-500">(ঐচ্ছিক)</span>
                  </label>
                  <input
                    type="text"
                    id="district"
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                    className="input-textarea"
                  />
                </div>

                <div>
                  <label
                    htmlFor="address"
                    className="block text-sm font-medium text-black mb-2"
                  >
                    ঠিকানা <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="input-textarea"
                    placeholder="আপনার ঠিকানা"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded p-3 text-red-700 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting || !zoneId}
                  className={`w-full py-3 px-6 rounded border-2 border-black text-base font-medium transition-colors ${
                    submitting || !zoneId
                      ? "bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed"
                      : "bg-white text-black hover:bg-black hover:text-white"
                  }`}
                >
                  {submitting ? "অর্ডার দেওয়া হচ্ছে..." : "অর্ডার করুন"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-16">
          <div className="text-center text-lg text-gray-600">লোড হচ্ছে...</div>
        </div>
      }
    >
      <OrderPageContent />
    </Suspense>
  );
}
