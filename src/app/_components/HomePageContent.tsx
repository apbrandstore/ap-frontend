"use client";

import type { Product } from "@/types/api";
import type { HomepageDerived } from "@/types/api";
import { Hero } from "@/components/common/Hero";
import { ProductCard } from "@/components/common/ProductCard";
import { PlacementBanners } from "@/components/common/PlacementBanners";

const SECTION_GRID_CLASS =
  "grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-6";

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
      {categorySections.map(({ category, products }) => {
        const desc = (category.description ?? "").trim();
        return (
          <section key={category.public_id} className="container mx-auto px-4 py-16">
            <div className="mb-12 text-center">
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
              <div className={SECTION_GRID_CLASS}>
                {products.map((product: Product) => (
                  <ProductCard key={product.public_id} product={product} />
                ))}
              </div>
            )}
          </section>
        );
      })}

      <PlacementBanners slot="home_bottom" />
    </div>
  );
}
