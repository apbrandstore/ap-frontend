"use client";

import type { Product } from "@/types/api";
import type { HomepageDerived } from "@/types/api";
import { Hero } from "@/components/common/Hero";
import { ProductCard } from "@/components/common/ProductCard";
import { PlacementBanners } from "@/components/common/PlacementBanners";
import Link from "next/link";

const SECTION_GRID_CLASS =
  "grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-6";

const MAX_PRODUCTS_PER_CATEGORY_SECTION = 8;

interface HomePageContentProps {
  data: HomepageDerived;
  initialHeroUrl?: string | null;
}

export function HomePageContent({ data, initialHeroUrl }: HomePageContentProps) {
  const { categorySections, error: homeError } = data;

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

      {/* Category sections (dynamic from backend) */}
      {categorySections.map(({ category, products }, idx) => {
        const desc = (category.description ?? "").trim();
        const visibleProducts = products.slice(0, MAX_PRODUCTS_PER_CATEGORY_SECTION);
        const showViewMore = !homeError && products.length > MAX_PRODUCTS_PER_CATEGORY_SECTION;
        return (
          <section
            key={category.public_id}
            className={`container mx-auto px-4 ${
              idx === 0 ? "pt-2 pb-12 md:py-16" : "py-16"
            }`}
          >
            <div className="mb-5 md:mb-12 text-center">
              <h2 className="section-heading">{category.name}</h2>
              {desc ? <p className="section-subtitle">{desc}</p> : null}
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
                  {visibleProducts.map((product: Product) => (
                    <ProductCard key={product.public_id} product={product} />
                  ))}
                </div>
                {showViewMore ? (
                  <div className="mt-8 text-center">
                    <Link
                      href={`/products?category=${encodeURIComponent(category.slug)}`}
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-7 py-3 text-sm font-semibold text-gray-900 shadow-sm transition-all hover:-translate-y-0.5 hover:border-gray-900 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
                    >
                      View more
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="h-4 w-4"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.21 14.77a.75.75 0 0 1 .02-1.06L10.94 10 7.23 6.29a.75.75 0 1 1 1.06-1.06l4.24 4.24a.75.75 0 0 1 0 1.06l-4.24 4.24a.75.75 0 0 1-1.06.02Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </Link>
                  </div>
                ) : null}
              </>
            )}
          </section>
        );
      })}

      <PlacementBanners slot="home_bottom" />
    </div>
  );
}
