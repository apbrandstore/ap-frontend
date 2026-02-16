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
    comboProducts,
    coupleProducts,
    mensProducts,
    womensProducts,
    error: homeError,
  } = data;

  const displayedHot = hotExpanded ? hotProducts : hotProducts.slice(0, 4);
  const hasMoreHot = hotProducts.length > 4;
  const displayedCombo = comboProducts.slice(0, 8);
  const displayedCouple = coupleProducts.slice(0, 8);
  const displayedMens = mensProducts.slice(0, 8);
  const displayedWomens = womensProducts.slice(0, 8);
  const hasMoreCombo = comboProducts.length > 8;
  const hasMoreCouple = coupleProducts.length > 8;
  const hasMoreMens = mensProducts.length > 8;
  const hasMoreWomens = womensProducts.length > 8;
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

      {/* Combo Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="mb-12 text-center">
          <h2 className="section-heading">Combo</h2>
          <p className="section-subtitle">Special combo offers for you</p>
        </div>
        {homeError ? (
          <div className={SECTION_GRID_CLASS}>
            <ProductCardSkeletons count={8} />
          </div>
        ) : comboProducts.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">No combo products available</div>
        ) : (
          <>
            <div className={SECTION_GRID_CLASS}>
              {displayedCombo.map((product: Product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            {hasMoreCombo && (
              <div className="text-center mt-6 md:mt-8">
                <Link href="/products?category=combo" className="btn-outline-primary">
                  View More
                </Link>
              </div>
            )}
          </>
        )}
      </section>

      {/* Couple Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="mb-12 text-center">
          <h2 className="section-heading">Couple</h2>
          <p className="section-subtitle">Perfect matching outfits for couples</p>
        </div>
        {homeError ? (
          <div className={SECTION_GRID_CLASS}>
            <ProductCardSkeletons count={8} />
          </div>
        ) : coupleProducts.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">No couple products available</div>
        ) : (
          <>
            <div className={SECTION_GRID_CLASS}>
              {displayedCouple.map((product: Product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            {hasMoreCouple && (
              <div className="text-center mt-6 md:mt-8">
                <Link href="/products?category=couple" className="btn-outline-primary">
                  View More
                </Link>
              </div>
            )}
          </>
        )}
      </section>

      {/* Men's Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="mb-12 text-center">
          <h2 className="section-heading">Men's</h2>
          <p className="section-subtitle">Premium men's apparel collection</p>
        </div>
        {homeError ? (
          <div className={SECTION_GRID_CLASS}>
            <ProductCardSkeletons count={8} />
          </div>
        ) : mensProducts.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">No men's products available</div>
        ) : (
          <>
            <div className={SECTION_GRID_CLASS}>
              {displayedMens.map((product: Product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            {hasMoreMens && (
              <div className="text-center mt-6 md:mt-8">
                <Link href="/products?category=men" className="btn-outline-primary">
                  View More
                </Link>
              </div>
            )}
          </>
        )}
      </section>

      {/* Women's Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="mb-12 text-center">
          <h2 className="section-heading">Women's</h2>
          <p className="section-subtitle">Elegant women's fashion collection</p>
        </div>
        {homeError ? (
          <div className={SECTION_GRID_CLASS}>
            <ProductCardSkeletons count={8} />
          </div>
        ) : womensProducts.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">No women's products available</div>
        ) : (
          <>
            <div className={SECTION_GRID_CLASS}>
              {displayedWomens.map((product: Product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            {hasMoreWomens && (
              <div className="text-center mt-6 md:mt-8">
                <Link href="/products?category=womens" className="btn-outline-primary">
                  View More
                </Link>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
