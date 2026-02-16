"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { getImageUrl } from "@/lib/api";
import type { Product } from "@/types/api";
import type { HomepageDerived } from "@/types/api";
import { Hero } from "@/components/common/Hero";
import { ProductCard } from "@/components/common/ProductCard";
import { NewDropTrendingTileSkeleton } from "@/components/common/NewDropTrendingTileSkeleton";

const SECTION_GRID_CLASS =
  "grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-6";
const SKELETON_GRID_CLASS = "grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-6";

interface HomePageContentProps {
  data: HomepageDerived;
  initialHeroUrl?: string | null;
}

export function HomePageContent({ data, initialHeroUrl }: HomePageContentProps) {
  const [hotExpanded, setHotExpanded] = useState(false);

  const {
    newDropsFeatured,
    trendingFeatured,
    hotProducts,
    categorySections,
    error: homeError,
  } = data;

  const displayedHot = hotExpanded ? hotProducts : hotProducts.slice(0, 4);
  const hasMoreHot = hotProducts.length > 4;
  const showTrendingTile = Boolean(trendingFeatured);

  const ProductCardSkeletons = ({ count }: { count: number }) => (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-lg border border-gray-200 bg-gray-100 aspect-[4/5]" />
      ))}
    </>
  );

  return (
    <div className="min-h-screen bg-white">
      <Hero initialHeroSrc={initialHeroUrl ?? undefined} />

      {/* Hot Section */}
      {(displayedHot.length > 0 || homeError) && (
        <section className="container mx-auto px-4 py-16">
          <div className="mb-12 text-center">
            <h2 className="section-heading">Special Offers</h2>
            <p className="section-subtitle">Handpicked favorites for you</p>
          </div>
          {homeError ? (
            <div className="text-center py-16">
              <div className="text-lg text-red-600">{homeError}</div>
            </div>
          ) : (
            <>
              <div className={SKELETON_GRID_CLASS}>
                {displayedHot.map((product: Product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              {hasMoreHot && (
                <div className="text-center mt-6 md:mt-8">
                  <button
                    type="button"
                    onClick={() => setHotExpanded((prev) => !prev)}
                    className="btn-outline-primary"
                  >
                    {hotExpanded ? "View less" : "View more"}
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      )}

      {/* New Drops + Trending Tiles */}
      <section className="container mx-auto px-4 pt-8 pb-12">
        <div className="grid grid-cols-2 gap-3 md:gap-6">
          {homeError ? (
            <>
              <NewDropTrendingTileSkeleton />
              <NewDropTrendingTileSkeleton />
            </>
          ) : (
            <>
              <Link
                href="/products?new_drops=true"
                className="group block overflow-hidden"
                aria-label="New Drops"
              >
                <div className="relative aspect-[4/5] bg-gray-100">
                  {getImageUrl(newDropsFeatured?.image ?? null) ? (
                    <Image
                      src={getImageUrl(newDropsFeatured?.image ?? null)!}
                      alt={newDropsFeatured?.name || "New Drops"}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300" />
                  )}
                </div>
                <div className="flex items-center justify-between pl-0 pr-2 py-3">
                  <span className="text-sm md:text-base font-medium text-primary">
                    New Drops
                  </span>
                  <ArrowRight className="w-4 h-4 text-primary transition-transform group-hover:translate-x-1 flex-shrink-0" />
                </div>
              </Link>

              {showTrendingTile ? (
                <Link
                  href="/products?best_selling=true"
                  className="group block overflow-hidden"
                  aria-label="Trending Products"
                >
                  <div className="relative aspect-[4/5] bg-gray-100">
                    <Image
                      src={getImageUrl(trendingFeatured!.image)!}
                      alt={trendingFeatured!.name || "Trending Products"}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="flex items-center justify-between pl-0 pr-2 py-3">
                    <span className="text-sm md:text-base font-medium text-primary">
                      Trending Products
                    </span>
                    <ArrowRight className="w-4 h-4 text-primary transition-transform group-hover:translate-x-1 flex-shrink-0" />
                  </div>
                </Link>
              ) : (
                <div className="opacity-0 pointer-events-none" aria-hidden="true" />
              )}
            </>
          )}
        </div>
      </section>

      {/* Category sections (dynamic from backend) */}
      {categorySections.map(({ category, products }) => {
        const displayed = products.slice(0, 8);
        const hasMore = products.length > 8;
        return (
          <section key={category.id} className="container mx-auto px-4 py-16">
            <div className="mb-12 text-center">
              <h2 className="section-heading">{category.name}</h2>
              <p className="section-subtitle">Explore our {category.name} collection</p>
            </div>
            {homeError ? (
              <div className={SECTION_GRID_CLASS}>
                <ProductCardSkeletons count={8} />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                No {category.name} products available
              </div>
            ) : (
              <>
                <div className={SECTION_GRID_CLASS}>
                  {displayed.map((product: Product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                {hasMore && (
                  <div className="text-center mt-6 md:mt-8">
                    <Link
                      href={`/products?category=${encodeURIComponent(category.slug)}`}
                      className="btn-outline-primary"
                    >
                      View More
                    </Link>
                  </div>
                )}
              </>
            )}
          </section>
        );
      })}
    </div>
  );
}
