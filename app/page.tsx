'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { Product, productApi, bestSellingApi, getImageUrl } from '@/lib/api';
import { Hero } from '@/components/Hero';
import { ProductCard } from '@/components/ProductCard';

export default function Home() {
  const [newDropsFeatured, setNewDropsFeatured] = useState<Product | null>(null);
  const [trendingFeatured, setTrendingFeatured] = useState<Product | null>(null);
  const [comboProducts, setComboProducts] = useState<Product[]>([]);
  const [coupleProducts, setCoupleProducts] = useState<Product[]>([]);
  const [mensProducts, setMensProducts] = useState<Product[]>([]);
  const [womensProducts, setWomensProducts] = useState<Product[]>([]);
  
  const [comboLoading, setComboLoading] = useState(true);
  const [coupleLoading, setCoupleLoading] = useState(true);
  const [mensLoading, setMensLoading] = useState(true);
  const [womensLoading, setWomensLoading] = useState(true);
  
  const [comboError, setComboError] = useState<string | null>(null);
  const [coupleError, setCoupleError] = useState<string | null>(null);
  const [mensError, setMensError] = useState<string | null>(null);
  const [womensError, setWomensError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHomepageTiles() {
      try {
        const [products, bestSelling] = await Promise.all([
          productApi.getAll(),
          bestSellingApi.getAll(),
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
      } catch (err) {
        console.error(err);
      }
    }
    fetchHomepageTiles();
  }, []);

  useEffect(() => {
    async function fetchComboProducts() {
      try {
        setComboLoading(true);
        const data = await productApi.getAll(undefined, 'combo');
        setComboProducts(data);
      } catch (err) {
        setComboError('Failed to load combo products');
        console.error(err);
      } finally {
        setComboLoading(false);
      }
    }
    fetchComboProducts();
  }, []);

  useEffect(() => {
    async function fetchCoupleProducts() {
      try {
        setCoupleLoading(true);
        const data = await productApi.getAll(undefined, 'couple');
        setCoupleProducts(data);
      } catch (err) {
        setCoupleError('Failed to load couple products');
        console.error(err);
      } finally {
        setCoupleLoading(false);
      }
    }
    fetchCoupleProducts();
  }, []);

  useEffect(() => {
    async function fetchMensProducts() {
      try {
        setMensLoading(true);
        const data = await productApi.getAll(undefined, 'men');
        setMensProducts(data);
      } catch (err) {
        setMensError('Failed to load men\'s products');
        console.error(err);
      } finally {
        setMensLoading(false);
      }
    }
    fetchMensProducts();
  }, []);

  useEffect(() => {
    async function fetchWomensProducts() {
      try {
        setWomensLoading(true);
        const data = await productApi.getAll(undefined, 'womens');
        setWomensProducts(data);
      } catch (err) {
        setWomensError('Failed to load women\'s products');
        console.error(err);
      } finally {
        setWomensLoading(false);
      }
    }
    fetchWomensProducts();
  }, []);

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
      {/* New Drops + Trending Tiles */}
      <section className="container mx-auto px-4 pt-8 pb-12">
        <div className="grid grid-cols-2 gap-3 md:gap-6">
          <Link
            href="/products?new_drops=true"
            className="group block overflow-hidden"
            aria-label="New Drops"
          >
            <div className="relative aspect-[5/4] bg-gray-100">
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
            <div className="flex items-center justify-between px-3 py-3">
              <span className="text-sm md:text-base font-medium text-black">
                New Drops
              </span>
              <ArrowRight className="w-4 h-4 text-black transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {showTrendingTile && (
            <Link
              href="/products?best_selling=true"
              className="group block overflow-hidden"
              aria-label="Trending Products"
            >
              <div className="relative aspect-[5/4] bg-gray-100">
                <Image
                  src={getImageUrl(trendingFeatured!.image)!}
                  alt={trendingFeatured!.name || 'Trending Products'}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="flex items-center justify-between px-3 py-3">
                <span className="text-sm md:text-base font-medium text-black">
                  Trending Products
                </span>
                <ArrowRight className="w-4 h-4 text-black transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          )}
          {!showTrendingTile && <div className="opacity-0 pointer-events-none" aria-hidden="true" />}
        </div>
      </section>

      {/* Combo Section */}
      <section className="container mx-auto px-4 py-16 bg-gray-50">
        <div className="mb-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 text-black" style={{ fontFamily: 'var(--font-space-grotesk), "Space Grotesk", sans-serif' }}>Combo</h2>
          <p className="text-sm text-gray-600">Special combo offers for you</p>
        </div>
        {comboLoading ? (
          <div className="text-center py-16">
            <div className="text-lg text-gray-600">Loading combo products...</div>
          </div>
        ) : comboError ? (
          <div className="text-center py-16">
            <div className="text-lg text-red-600">{comboError}</div>
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
          <div className="text-center py-16">
            <div className="text-lg text-gray-600">Loading couple products...</div>
          </div>
        ) : coupleError ? (
          <div className="text-center py-16">
            <div className="text-lg text-red-600">{coupleError}</div>
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
          <div className="text-center py-16">
            <div className="text-lg text-gray-600">Loading men's products...</div>
          </div>
        ) : mensError ? (
          <div className="text-center py-16">
            <div className="text-lg text-red-600">{mensError}</div>
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
          <div className="text-center py-16">
            <div className="text-lg text-gray-600">Loading women's products...</div>
          </div>
        ) : womensError ? (
          <div className="text-center py-16">
            <div className="text-lg text-red-600">{womensError}</div>
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
