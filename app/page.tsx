'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { Product, productApi, bestSellingApi, hotApi, getImageUrl } from '@/lib/api';
import { Hero } from '@/components/Hero';
import { ProductCard } from '@/components/ProductCard';
import { ProductCardSkeleton } from '@/components/ProductCardSkeleton';
import { NewDropTrendingTileSkeleton } from '@/components/NewDropTrendingTileSkeleton';

export default function Home() {
  const [newDropsFeatured, setNewDropsFeatured] = useState<Product | null>(null);
  const [trendingFeatured, setTrendingFeatured] = useState<Product | null>(null);
  const [hotProducts, setHotProducts] = useState<Product[]>([]);
  const [comboProducts, setComboProducts] = useState<Product[]>([]);
  const [coupleProducts, setCoupleProducts] = useState<Product[]>([]);
  const [mensProducts, setMensProducts] = useState<Product[]>([]);
  const [womensProducts, setWomensProducts] = useState<Product[]>([]);
  
  const [tilesLoading, setTilesLoading] = useState(true);
  const [hotLoading, setHotLoading] = useState(true);
  const [comboLoading, setComboLoading] = useState(true);
  const [coupleLoading, setCoupleLoading] = useState(true);
  const [mensLoading, setMensLoading] = useState(true);
  const [womensLoading, setWomensLoading] = useState(true);
  
  const [homeError, setHomeError] = useState<string | null>(null);

  // Helper: product belongs to a category (slug) or its parent (for men/womens)
  function productInCategory(p: Product, slug: string): boolean {
    const s = (p.category_slug || p.category?.slug || '').toLowerCase();
    const parent = (p.category?.parent_slug || '').toLowerCase();
    return s === slug || parent === slug;
  }

  useEffect(() => {
    async function fetchHomepageData() {
      try {
        setTilesLoading(true);
        setHotLoading(true);
        setComboLoading(true);
        setCoupleLoading(true);
        setMensLoading(true);
        setWomensLoading(true);
        setHomeError(null);

        const [products, bestSelling, hotList] = await Promise.all([
          productApi.getAll(),
          bestSellingApi.getAll(),
          hotApi.getAll(),
        ]);

        // New drops featured: newest product within last 3 days
        const cutoff = Date.now() - 3 * 24 * 60 * 60 * 1000;
        const newDrops = products
          .filter((p) => {
            const t = new Date(p.created_at).getTime();
            return Number.isFinite(t) && t >= cutoff;
          })
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setNewDropsFeatured(newDrops[0] || null);

        // Trending featured: first best-selling item (if available)
        setTrendingFeatured(bestSelling?.[0]?.product || null);

        // Hot section: products marked as hot (ordered)
        setHotProducts((hotList || []).map((h) => h.product).filter(Boolean));

        // Derive category sections from the same product list (no extra API calls)
        setComboProducts(products.filter((p) => productInCategory(p, 'combo')));
        setCoupleProducts(products.filter((p) => productInCategory(p, 'couple')));
        setMensProducts(products.filter((p) => productInCategory(p, 'men')));
        setWomensProducts(products.filter((p) => productInCategory(p, 'womens')));
      } catch (err) {
        console.error(err);
        setHomeError('Failed to load products');
      } finally {
        setTilesLoading(false);
        setHotLoading(false);
        setComboLoading(false);
        setCoupleLoading(false);
        setMensLoading(false);
        setWomensLoading(false);
      }
    }
    fetchHomepageData();
  }, []);

  // Hot section: show up to 4 products (4 on desktop, 2x2 on mobile)
  const displayedHot = hotProducts.slice(0, 4);

  // Limit products for display (max 8 per section)
  const displayedCombo = comboProducts.slice(0, 8);
  const displayedCouple = coupleProducts.slice(0, 8);
  const displayedMens = mensProducts.slice(0, 8);
  const displayedWomens = womensProducts.slice(0, 8);
  
  const hasMoreCombo = comboProducts.length > 8;
  const hasMoreCouple = coupleProducts.length > 8;
  const hasMoreMens = mensProducts.length > 8;
  const hasMoreWomens = womensProducts.length > 8;
  const showTrendingTile = Boolean(trendingFeatured);

  return (
    <div className="min-h-screen bg-white">
      <Hero />

      {/* Hot Section - only show when there are hot products (4 on desktop, 2x2 on mobile) */}
      {(hotLoading || displayedHot.length > 0) ? (
        <section className="container mx-auto px-4 py-16">
          <div className="mb-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-2 text-black" style={{ fontFamily: 'var(--font-space-grotesk), "Space Grotesk", sans-serif' }}>Hot</h2>
            <p className="text-sm text-gray-600">Handpicked favorites for you</p>
          </div>
          {hotLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : homeError ? (
            <div className="text-center py-16">
              <div className="text-lg text-red-600">{homeError}</div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-6">
              {displayedHot.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      ) : null}

      {/* New Drops + Trending Tiles */}
      <section className="container mx-auto px-4 pt-8 pb-12">
        <div className="grid grid-cols-2 gap-3 md:gap-6">
          {tilesLoading ? (
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
                      alt={newDropsFeatured?.name || 'New Drops'}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300" />
                  )}
                </div>
                <div className="flex items-center justify-between pl-0 pr-2 py-3">
                  <span className="text-sm md:text-base font-medium text-black">
                    New Drops
                  </span>
                  <ArrowRight className="w-4 h-4 text-black transition-transform group-hover:translate-x-1 flex-shrink-0" />
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
                      alt={trendingFeatured!.name || 'Trending Products'}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="flex items-center justify-between pl-0 pr-2 py-3">
                    <span className="text-sm md:text-base font-medium text-black">
                      Trending Products
                    </span>
                    <ArrowRight className="w-4 h-4 text-black transition-transform group-hover:translate-x-1 flex-shrink-0" />
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
      <section className="container mx-auto px-4 py-16 bg-gray-50">
        <div className="mb-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 text-black" style={{ fontFamily: 'var(--font-space-grotesk), "Space Grotesk", sans-serif' }}>Combo</h2>
          <p className="text-sm text-gray-600">Special combo offers for you</p>
        </div>
        {comboLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : homeError ? (
          <div className="text-center py-16">
            <div className="text-lg text-red-600">{homeError}</div>
          </div>
        ) : comboProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-lg text-gray-600">No combo products available</div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-6">
              {displayedCombo.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            {hasMoreCombo && (
              <div className="text-center mt-6 md:mt-8">
                <Link
                  href="/products?category=combo"
                  className="inline-block px-6 md:px-8 py-2 md:py-3 border-2 border-black text-black hover:bg-black hover:text-white transition-colors rounded font-medium text-sm md:text-base"
                >
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
          <h2 className="text-2xl md:text-3xl font-bold mb-2 text-black" style={{ fontFamily: 'var(--font-space-grotesk), "Space Grotesk", sans-serif' }}>Couple</h2>
          <p className="text-sm text-gray-600">Perfect matching outfits for couples</p>
        </div>
        {coupleLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : homeError ? (
          <div className="text-center py-16">
            <div className="text-lg text-red-600">{homeError}</div>
          </div>
        ) : coupleProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-lg text-gray-600">No couple products available</div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-6">
              {displayedCouple.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            {hasMoreCouple && (
              <div className="text-center mt-6 md:mt-8">
                <Link
                  href="/products?category=couple"
                  className="inline-block px-6 md:px-8 py-2 md:py-3 border-2 border-black text-black hover:bg-black hover:text-white transition-colors rounded font-medium text-sm md:text-base"
                >
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
          <h2 className="text-2xl md:text-3xl font-bold mb-2 text-black" style={{ fontFamily: 'var(--font-space-grotesk), "Space Grotesk", sans-serif' }}>Men's</h2>
          <p className="text-sm text-gray-600">Premium men's apparel collection</p>
        </div>
        {mensLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : homeError ? (
          <div className="text-center py-16">
            <div className="text-lg text-red-600">{homeError}</div>
          </div>
        ) : mensProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-lg text-gray-600">No men's products available</div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-6">
              {displayedMens.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            {hasMoreMens && (
              <div className="text-center mt-6 md:mt-8">
                <Link
                  href="/products?category=men"
                  className="inline-block px-6 md:px-8 py-2 md:py-3 border-2 border-black text-black hover:bg-black hover:text-white transition-colors rounded font-medium text-sm md:text-base"
                >
                  View More
                </Link>
              </div>
            )}
          </>
        )}
      </section>

      {/* Women's Section */}
      <section className="container mx-auto px-4 py-16 bg-gray-50">
        <div className="mb-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 text-black" style={{ fontFamily: 'var(--font-space-grotesk), "Space Grotesk", sans-serif' }}>Women's</h2>
          <p className="text-sm text-gray-600">Elegant women's fashion collection</p>
        </div>
        {womensLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : homeError ? (
          <div className="text-center py-16">
            <div className="text-lg text-red-600">{homeError}</div>
          </div>
        ) : womensProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-lg text-gray-600">No women's products available</div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-6">
              {displayedWomens.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            {hasMoreWomens && (
              <div className="text-center mt-6 md:mt-8">
                <Link
                  href="/products?category=womens"
                  className="inline-block px-6 md:px-8 py-2 md:py-3 border-2 border-black text-black hover:bg-black hover:text-white transition-colors rounded font-medium text-sm md:text-base"
                >
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
