"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  productApi,
  storeApi,
  getImageUrl,
  type StorefrontProductDetail,
  type StorefrontProductListItem,
} from "@/lib/api";
import { entriesForExtraData } from "@/lib/extra-field-labels";
import { galleryImageUrlsForProduct } from "@/lib/product-gallery-urls";
import { trackEvent } from "@/lib/pixel";
import { useCart } from "@/contexts/CartContext";
import {
  buildMatrixFromVariants,
  findVariantForSelections,
  variantLabel,
  type VariantSelections,
} from "@/lib/variant-utils";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Share2,
} from "lucide-react";
import Image from "next/image";
import { ProductCard } from "@/components/common/ProductCard";
import type { StorefrontProductVariant } from "@/types/api";

function ProductImageGallery({
  imageUrls,
  productName,
  lowStock,
}: {
  imageUrls: string[];
  productName: string;
  lowStock: boolean;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [mainNatural, setMainNatural] = useState<{
    w: number;
    h: number;
  } | null>(null);

  useEffect(() => {
    setActiveIndex(0);
  }, [imageUrls.join("|")]);

  useEffect(() => {
    setMainNatural(null);
  }, [activeIndex, imageUrls.join("|")]);

  if (imageUrls.length === 0) {
    return (
      <div className="w-full aspect-[3/4] bg-gray-100 flex items-center justify-center">
        <span className="text-gray-400 text-lg">No Image</span>
      </div>
    );
  }

  const handlePrevious = () => {
    setActiveIndex((i) => (i === 0 ? imageUrls.length - 1 : i - 1));
  };

  const handleNext = () => {
    setActiveIndex((i) => (i === imageUrls.length - 1 ? 0 : i + 1));
  };

  const mainSrc = getImageUrl(imageUrls[activeIndex])!;

  return (
    <div className="flex gap-3">
      {imageUrls.length > 1 && (
        <div className="hidden md:flex flex-col gap-2 w-16 flex-shrink-0">
          {imageUrls.map((url, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`relative aspect-[3/4] overflow-hidden transition-all ${
                activeIndex === index ? "ring-2 ring-black" : "hover:opacity-75"
              }`}
            >
              <Image
                src={getImageUrl(url)!}
                alt={`View ${index + 1}`}
                fill
                className="object-cover"
                unoptimized
              />
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 relative">
        <div
          className="relative w-full overflow-hidden bg-gray-50"
          style={{
            aspectRatio: mainNatural
              ? `${mainNatural.w} / ${mainNatural.h}`
              : "3 / 4",
          }}
        >
          <Image
            key={mainSrc}
            src={mainSrc}
            alt={productName}
            fill
            className="object-contain object-center"
            unoptimized
            priority
            onLoad={(e) => {
              const img = e.currentTarget;
              if (img.naturalWidth > 0 && img.naturalHeight > 0) {
                setMainNatural({ w: img.naturalWidth, h: img.naturalHeight });
              }
            }}
          />

          {lowStock && <div className="badge-stock">SELLING FAST</div>}

          {imageUrls.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrevious}
                className="carousel-btn-prev"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5 text-gray-700" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="carousel-btn-next"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5 text-gray-700" />
              </button>
            </>
          )}
        </div>

        {imageUrls.length > 1 && (
          <div className="flex md:hidden gap-2 mt-3 justify-center px-4">
            {imageUrls.map((url, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`relative w-16 h-16 overflow-hidden flex-shrink-0 transition-all ${
                  activeIndex === index
                    ? "ring-2 ring-black ring-offset-1"
                    : "opacity-70 hover:opacity-100"
                }`}
              >
                <Image
                  src={getImageUrl(url)!}
                  alt={`View ${index + 1}`}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-t border-gray-200">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="accordion-row"
      >
        <span className="font-semibold text-sm tracking-wide">{title}</span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>
      {isOpen && (
        <div className="pb-4 text-sm text-gray-600 leading-relaxed">
          {children}
        </div>
      )}
    </div>
  );
}

export function ProductDetailClient({ identifier }: { identifier: string }) {
  const router = useRouter();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<StorefrontProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [related, setRelated] = useState<StorefrontProductListItem[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [selections, setSelections] = useState<VariantSelections>({});
  const [selectionError, setSelectionError] = useState<string | null>(null);
  const selectionErrorRef = useRef<HTMLDivElement>(null);
  const [shareCopied, setShareCopied] = useState(false);

  useEffect(() => {
    if (!selectionError) return;
    const el = selectionErrorRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }, [selectionError]);
  const [extraFieldSchema, setExtraFieldSchema] = useState<unknown[]>([]);
  const [storeCurrency, setStoreCurrency] = useState("BDT");

  const handleShare = async () => {
    const url =
      typeof window !== "undefined" ? window.location.href : String(identifier);
    try {
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      window.setTimeout(() => setShareCopied(false), 1500);
    } catch {
      // Fallback for older browsers / clipboard permission issues
      try {
        const el = document.createElement("textarea");
        el.value = url;
        el.setAttribute("readonly", "");
        el.style.position = "absolute";
        el.style.left = "-9999px";
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
        setShareCopied(true);
        window.setTimeout(() => setShareCopied(false), 1500);
      } catch {
        // If copy fails silently, at least don't crash UI
      }
    }
  };

  useEffect(() => {
    let cancelled = false;
    storeApi
      .getPublic()
      .then((s) => {
        if (!cancelled) {
          setExtraFieldSchema(s.extra_field_schema ?? []);
          if (s.currency?.trim()) setStoreCurrency(s.currency.trim());
        }
      })
      .catch(() => {
        if (!cancelled) setExtraFieldSchema([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    async function fetchProduct() {
      if (!identifier) {
        setError("Product not found");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await productApi.getByIdentifier(identifier);
        setProduct(data);
        setSelections({});
        setSelectionError(null);
      } catch (err) {
        setError("Product not found");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [identifier]);

  const matrix = useMemo(
    () => (product ? buildMatrixFromVariants(product) : {}),
    [product]
  );

  const matrixKeys = useMemo(() => Object.keys(matrix).sort(), [matrix]);

  const selectedVariant: StorefrontProductVariant | null = useMemo(() => {
    if (!product) return null;
    const variants = product.variants || [];
    if (variants.length === 0) return null;
    return findVariantForSelections(variants, selections);
  }, [product, selections]);

  useEffect(() => {
    if (!product) return;
    const fromDetail = product.related_products;
    if (fromDetail && fromDetail.length > 0) {
      setRelated(fromDetail);
      return;
    }
    let cancelled = false;
    setLoadingRelated(true);
    productApi
      .getRelated(product.slug)
      .then((list) => {
        if (!cancelled) setRelated(list);
      })
      .catch(() => {
        if (!cancelled) setRelated([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingRelated(false);
      });
    return () => {
      cancelled = true;
    };
  }, [product]);

  const imageUrls = useMemo(
    () => (product ? galleryImageUrlsForProduct(product) : []),
    [product]
  );

  const extraFieldRows = useMemo(
    () => entriesForExtraData(product?.extra_data, extraFieldSchema),
    [product?.extra_data, extraFieldSchema]
  );

  const needsVariant = (product?.variants?.length ?? 0) > 0;
  const variantReady = !needsVariant || selectedVariant !== null;

  const displayPrice = selectedVariant
    ? parseFloat(selectedVariant.price)
    : product
      ? parseFloat(product.price)
      : 0;

  useEffect(() => {
    const p = product;
    if (!p?.public_id) return;
    const eventId = `view_${p.public_id}`;
    trackEvent(
      "ViewContent",
      {
        content_ids: [p.public_id],
        content_type: "product",
        value: parseFloat(p.price),
        currency: storeCurrency,
      },
      eventId
    );
    // Intentionally once per product public_id; currency is snapshot at first fire (trackEvent dedupes by eventId).
    // eslint-disable-next-line react-hooks/exhaustive-deps -- stable ViewContent per product view
  }, [product?.public_id]);

  const displayOriginal = product?.original_price
    ? parseFloat(product.original_price)
    : null;
  const hasOffer =
    displayOriginal !== null &&
    !Number.isNaN(displayOriginal) &&
    displayOriginal > displayPrice;

  const availableQty = selectedVariant
    ? selectedVariant.available_quantity
    : product?.available_quantity ?? 0;
  const stockStatus = selectedVariant
    ? selectedVariant.stock_status
    : product?.stock_status;
  const isOut = stockStatus === "out_of_stock" || availableQty <= 0;
  const isLow =
    !isOut &&
    (stockStatus === "low_stock" ||
      stockStatus === "low" ||
      (availableQty > 0 && availableQty <= 5));

  const setSelection = (attrSlug: string, valuePublicId: string) => {
    setSelectionError(null);
    setSelections((prev) => ({ ...prev, [attrSlug]: valuePublicId }));
  };

  const variantSelectionMessage =
    matrixKeys.length > 1
      ? "Please select all options first."
      : "Please select a size first.";

  const handleOrder = () => {
    if (!product || isOut) return;
    if (needsVariant && !selectedVariant) {
      setSelectionError(variantSelectionMessage);
      return;
    }
    const q = new URLSearchParams({ product: product.slug });
    if (selectedVariant) q.set("variant", selectedVariant.public_id);
    router.push(`/order?${q.toString()}`);
  };

  const handleAddToCart = async () => {
    if (!product || isOut) return;
    if (needsVariant && !selectedVariant) {
      setSelectionError(variantSelectionMessage);
      return;
    }
    const snapPrice = selectedVariant?.price ?? product.price;
    const snapOriginal = product.original_price;
    await addToCart(
      product.public_id,
      1,
      selectedVariant?.public_id ?? null,
      {
        name: product.name,
        slug: product.slug,
        image_url: product.image_url,
        price: snapPrice,
        original_price: snapOriginal,
        variant_label: selectedVariant ? variantLabel(selectedVariant) : undefined,
      }
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-gray-600">{error || "Product not found"}</p>
        <button
          type="button"
          onClick={() => router.push("/products")}
          className="text-sm underline hover:no-underline"
        >
          Continue shopping
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <nav className="text-xs text-gray-500 mb-6 flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="hover:text-black transition-colors"
          >
            Home
          </button>
          <span>/</span>
          <button
            type="button"
            onClick={() => router.push("/products")}
            className="hover:text-black transition-colors"
          >
            Products
          </button>
          <span>/</span>
          <span className="text-gray-400 truncate max-w-[200px]">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          <div>
            <ProductImageGallery
              imageUrls={imageUrls}
              productName={product.name}
              lowStock={isLow}
            />
          </div>

          <div className="lg:max-w-md">
            <p className="text-sm text-gray-500 mb-1 uppercase tracking-wider">
              {product.category_name || product.brand || "STORE"}
            </p>

            <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-4 leading-tight">
              {product.name}
            </h1>

            <div className="mb-4">
              {hasOffer ? (
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-2xl md:text-3xl font-bold text-success">
                    Now ৳{displayPrice.toFixed(0)}
                  </span>
                  <span className="text-lg text-gray-500 line-through">
                    Was ৳{displayOriginal!.toFixed(0)}
                  </span>
                  <span className="text-lg font-medium text-success">
                    (-{Math.round((1 - displayPrice / displayOriginal!) * 100)}%)
                  </span>
                </div>
              ) : (
                <span className="text-2xl md:text-3xl font-bold text-gray-900">
                  ৳{displayPrice.toFixed(0)}
                </span>
              )}
            </div>

            {needsVariant && matrixKeys.length > 0 && (
              <div className="space-y-4 mb-5">
                {matrixKeys.map((slug) => {
                  const attr = matrix[slug];
                  return (
                    <div key={slug}>
                      <p className="text-sm font-medium text-gray-700 mb-2 uppercase tracking-wider">
                        {attr.attribute_name}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {attr.values.map((v) => {
                          const active = selections[slug] === v.value_public_id;
                          return (
                            <button
                              key={v.value_public_id}
                              type="button"
                              onClick={() => setSelection(slug, v.value_public_id)}
                              className={`px-3 py-1.5 text-sm border-2 rounded transition-colors ${
                                active
                                  ? "border-black bg-black text-white"
                                  : "border-gray-200 hover:border-gray-400"
                              }`}
                            >
                              {v.value}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
                {needsVariant && !variantReady && (
                  <p className="text-sm text-gray-600">
                    Choose your options above before ordering.
                  </p>
                )}
              </div>
            )}

            <div className="mb-6 flex flex-col gap-3">
              {selectionError && (
                <div
                  ref={selectionErrorRef}
                  role="alert"
                  aria-live="assertive"
                  className="flex gap-3 rounded-lg border-2 border-amber-500 bg-amber-50 px-4 py-3.5 shadow-md ring-2 ring-amber-200/80"
                >
                  <AlertCircle
                    className="h-6 w-6 shrink-0 text-amber-600"
                    strokeWidth={2.25}
                    aria-hidden
                  />
                  <p className="text-base font-semibold leading-snug text-amber-950">
                    {selectionError}
                  </p>
                </div>
              )}
              <button
                type="button"
                onClick={handleOrder}
                disabled={isOut}
                className="btn-success w-full"
              >
                {isOut ? "OUT OF STOCK" : "ORDER NOW"}
              </button>
              <div className="flex flex-row items-stretch gap-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isOut}
                  className="btn-outline-primary flex min-h-[52px] min-w-0 flex-1 items-center justify-center text-center"
                >
                  Add to cart
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  className="inline-flex w-14 shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-900 shadow-sm transition-all hover:-translate-y-0.5 hover:border-gray-900 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
                  aria-label={shareCopied ? "Link copied" : "Share product"}
                >
                  {shareCopied ? (
                    <span className="px-0.5 text-center text-[10px] font-semibold leading-tight sm:text-[11px]">
                      Copied
                    </span>
                  ) : (
                    <Share2
                      className="h-6 w-6 shrink-0"
                      strokeWidth={2}
                      aria-hidden
                    />
                  )}
                </button>
              </div>
            </div>

            {availableQty > 0 && availableQty <= 10 && !isOut && (
              <p className="text-sm text-orange-600 mb-4">
                Only {availableQty} left in stock - order soon
              </p>
            )}

            <div className="border-b border-gray-200">
              <CollapsibleSection title="PRODUCT DETAILS" defaultOpen>
                <p className="mb-3 whitespace-pre-wrap">{product.description}</p>
              </CollapsibleSection>

              {extraFieldRows.length > 0 && (
                <CollapsibleSection title="ADDITIONAL INFORMATION" defaultOpen>
                  <dl className="space-y-2">
                    {extraFieldRows.map((row) => (
                      <div key={row.key}>
                        <dt className="font-medium text-gray-800">{row.label}</dt>
                        <dd className="text-gray-600 mt-0.5 whitespace-pre-wrap">
                          {row.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </CollapsibleSection>
              )}

              <CollapsibleSection title="CARE INSTRUCTIONS">
                <ul className="space-y-1.5">
                  <li>• Machine wash at 30°C</li>
                  <li>• Do not tumble dry</li>
                  <li>• Iron on low heat</li>
                </ul>
              </CollapsibleSection>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-16 lg:mt-24">
            <h2 className="section-heading text-center mb-8">
              You Might Also Like
            </h2>

            <div className="overflow-x-auto pb-4 -mx-4 px-4 lg:hidden">
              <div className="flex gap-4 min-w-max">
                {related.map((p) => (
                  <div key={p.public_id} className="w-[160px] flex-shrink-0">
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>
            </div>

            <div className="hidden lg:grid lg:grid-cols-4 gap-6">
              {related.slice(0, 4).map((p) => (
                <ProductCard key={p.public_id} product={p} />
              ))}
            </div>
          </div>
        )}

        {loadingRelated && related.length === 0 && (
          <div className="mt-16 flex justify-center">
            <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}

