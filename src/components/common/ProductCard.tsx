"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Product, getImageUrl } from "@/lib/api";
import { productHrefFromPath } from "@/lib/category-slug-path";

interface ProductCardProps {
  product: Product;
}

function getCategoryDisplayName(product: Product): string {
  if (product.category_name) return product.category_name;
  return product.category_slug || "";
}

function isOutOfStock(product: Product): boolean {
  return (
    product.stock_status === "out_of_stock" || product.available_quantity <= 0
  );
}

/** Frame matches image aspect so object-contain fills without letterboxing or side crop. */
function ProductCardImage({ src, alt }: { src: string; alt: string }) {
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);

  return (
    <div
      className="relative w-full overflow-hidden bg-gray-200"
      style={{
        aspectRatio: natural ? `${natural.w} / ${natural.h}` : "4 / 5",
      }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-contain object-center md:group-hover:scale-105 transition-transform duration-300"
        unoptimized
        onLoad={(e) => {
          const img = e.currentTarget;
          if (img.naturalWidth > 0 && img.naturalHeight > 0) {
            setNatural({ w: img.naturalWidth, h: img.naturalHeight });
          }
        }}
      />
    </div>
  );
}

export function ProductCard({ product }: ProductCardProps) {
  const out = isOutOfStock(product);
  const price = parseFloat(product.price);
  const original = product.original_price
    ? parseFloat(product.original_price)
    : null;
  const hasDiscount =
    original !== null && !Number.isNaN(original) && original > price;
  const href = productHrefFromPath(product.category_path_slugs, product.slug);

  return (
    <div className="group card-product">
      <Link href={href} className="block">
        <div className="relative">
          {getImageUrl(product.image_url) ? (
            <ProductCardImage
              src={getImageUrl(product.image_url)!}
              alt={product.name}
            />
          ) : (
            <div className="flex aspect-[4/5] w-full items-center justify-center bg-gradient-to-br from-gray-300 to-gray-400">
              <span className="text-gray-500 text-xs md:text-sm">No Image</span>
            </div>
          )}

          {hasDiscount && (
            <div className="badge-sale">
              {Math.round((1 - price / original!) * 100)}% OFF
            </div>
          )}

          {out && (
            <div className="badge-new">Sold Out</div>
          )}
        </div>
      </Link>

      <div className="p-2 md:p-3 flex flex-col flex-1">
        <Link
          href={href}
          className="block"
        >
          <div className="product-title-link">{product.name}</div>
          <div className="text-xs md:text-sm text-gray-500 mb-1 md:mb-1.5 capitalize">
            {getCategoryDisplayName(product)}
          </div>
        </Link>

        <div className="space-y-0.5 mb-1.5 md:mb-2">
          {hasDiscount ? (
            <>
              <div className="text-sm md:text-base text-gray-500 line-through font-mono">
                {original!.toFixed(0)}৳
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl md:text-2xl font-bold font-mono text-success">
                  {price.toFixed(0)} ৳
                </span>
              </div>
            </>
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="text-xl md:text-2xl font-bold font-mono text-black">
                {price.toFixed(0)} ৳
              </span>
            </div>
          )}
        </div>

        <Link
          href={`/order?product=${encodeURIComponent(product.slug)}`}
          className={out ? "btn-order-product-disabled" : "btn-order-product"}
          onClick={(e) => {
            if (out) e.preventDefault();
          }}
        >
          {out ? "Sold Out" : "অর্ডার করুন"}
        </Link>
      </div>
    </div>
  );
}
