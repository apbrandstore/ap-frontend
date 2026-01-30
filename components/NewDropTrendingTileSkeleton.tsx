'use client';

/**
 * Skeleton placeholder for New Drops and Trending tiles.
 * Matches exact dimensions: aspect-[4/5] image area + label row (pl-0 pr-2 py-3).
 */
export function NewDropTrendingTileSkeleton() {
  return (
    <div className="block overflow-hidden animate-pulse">
      <div className="relative aspect-[4/5] bg-gray-200" />
      <div className="flex items-center justify-between pl-0 pr-2 py-3">
        <div className="h-4 md:h-5 bg-gray-200 rounded w-24 md:w-28" />
        <div className="h-4 w-4 bg-gray-200 rounded flex-shrink-0" />
      </div>
    </div>
  );
}
