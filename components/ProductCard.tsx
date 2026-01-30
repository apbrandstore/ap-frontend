'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Product, getImageUrl } from '@/lib/api';

interface ProductCardProps {
  product: Product;
}

// Get category display name from product
function getCategoryDisplayName(product: Product): string {
  // Use new nested category object if available
  if (product.category && typeof product.category === 'object') {
    if (product.category.parent_name) {
      return `${product.category.parent_name} - ${product.category.name}`;
    }
    return product.category.name;
  }
  // Fallback to category_slug for backward compatibility
  return product.category_slug || '';
}

export function ProductCard({ product }: ProductCardProps) {
  const isOutOfStock = product.stock === 0;
  const hasDiscount = product.has_offer && product.offer_price;
  const discountPercent = hasDiscount 
    ? Math.round(((parseFloat(product.regular_price) - parseFloat(product.offer_price!)) / parseFloat(product.regular_price)) * 100)
    : 0;

  return (
    <div className="group bg-white rounded-lg border border-gray-200 overflow-hidden transition-transform md:hover:scale-105 flex flex-col h-full">
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative aspect-[4/5] bg-gray-200 overflow-hidden">
          {getImageUrl(product.image) ? (
            <Image
              src={getImageUrl(product.image)!}
              alt={product.name}
              fill
              className="object-cover md:group-hover:scale-110 transition-transform duration-300"
              unoptimized
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
              <span className="text-gray-500 text-xs md:text-sm">No Image</span>
            </div>
          )}

          {/* Discount Badge */}
          {hasDiscount && discountPercent > 0 && (
            <div className="absolute top-1 left-1 md:top-2 md:left-2 bg-red-600 text-white px-1.5 py-0.5 md:px-2 md:py-1 rounded text-[10px] md:text-xs font-bold">
              {discountPercent}% OFF
            </div>
          )}

          {/* Sold Out Badge */}
          {isOutOfStock && (
            <div className="absolute top-2 right-2 md:top-4 md:right-4 bg-black text-white px-2 py-0.5 md:px-3 md:py-1 rounded text-[10px] md:text-xs font-bold uppercase">
              Sold Out
            </div>
          )}
        </div>
      </Link>

      <div className="p-2 md:p-3 flex flex-col flex-1">
        <Link href={`/products/${product.id}`} className="block">
          <div className="text-sm md:text-base font-normal text-black mb-1 md:mb-1.5 line-clamp-2 min-h-[2rem] md:min-h-[2.5rem] hover:underline">
            {product.name}
          </div>
          <div className="text-xs md:text-sm text-gray-500 mb-1 md:mb-1.5 capitalize">
            {getCategoryDisplayName(product)}
          </div>
        </Link>
        
        <div className="space-y-0.5 mb-1.5 md:mb-2">
          {hasDiscount && product.offer_price ? (
            <>
              <div className="text-[10px] md:text-xs text-gray-500 line-through font-mono">
                {parseFloat(product.regular_price).toFixed(0)}৳
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-sm md:text-base font-normal text-black font-mono">
                  {parseFloat(product.offer_price).toFixed(0)} ৳
                </span>
              </div>
            </>
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="text-sm md:text-base font-normal text-black font-mono">
                {parseFloat(product.regular_price).toFixed(0)} ৳
              </span>
            </div>
          )}
        </div>

        <Link
          href={`/order?productId=${product.id}`}
          className={`w-full py-1.5 px-2 md:py-2 md:px-4 rounded border-2 border-black text-xs md:text-sm font-medium transition-colors block text-center mt-auto ${
            isOutOfStock
              ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed pointer-events-none'
              : 'bg-black text-white hover:bg-gray-800'
          }`}
          onClick={(e) => {
            if (isOutOfStock) {
              e.preventDefault();
            }
          }}
        >
          {isOutOfStock ? 'Sold Out' : 'Order now'}
        </Link>
      </div>
    </div>
  );
}

