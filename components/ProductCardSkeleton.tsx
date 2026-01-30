'use client';

/**
 * Skeleton placeholder matching ProductCard dimensions exactly.
 * Used for lazy loading product grids (combo, couple, men's, women's).
 */
export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col h-full animate-pulse">
      {/* Image area - aspect-[4/5] to match ProductCard */}
      <div className="relative aspect-[4/5] bg-gray-200 overflow-hidden" />

      <div className="p-2 md:p-3 flex flex-col flex-1">
        {/* Title - min-h matches ProductCard line-clamp-2 */}
        <div className="h-4 md:h-5 bg-gray-200 rounded mb-1 md:mb-1.5 w-full max-w-full" />
        <div className="h-4 md:h-5 bg-gray-200 rounded mb-1 md:mb-1.5 w-3/4" />
        {/* Category */}
        <div className="h-3 md:h-3.5 bg-gray-100 rounded mb-1 md:mb-1.5 w-1/2" />
        {/* Price */}
        <div className="h-3 md:h-4 bg-gray-200 rounded mb-1 md:mb-1.5 w-16" />
        <div className="h-4 md:h-5 bg-gray-200 rounded mb-1.5 md:mb-2 w-20" />
        {/* Order now button */}
        <div className="h-8 md:h-10 bg-gray-200 rounded mt-auto w-full" />
      </div>
    </div>
  );
}
