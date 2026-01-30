'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Product, BestSelling, productApi, bestSellingApi } from '@/lib/api';
import { ProductCard } from '@/components/ProductCard';

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const category = searchParams.get('category');
  const search = searchParams.get('search');
  const bestSellingParam = searchParams.get('best_selling');
  const isBestSelling = bestSellingParam === 'true';
  const newDropsParam = searchParams.get('new_drops');
  const isNewDrops = newDropsParam === 'true';
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        if (isBestSelling) {
          // Fetch best selling products
          const bestSellingData = await bestSellingApi.getAll();
          const bestSellingProducts = bestSellingData.map(item => item.product);
          setProducts(bestSellingProducts);
        } else {
          // Fetch regular products with optional category filter and search
          const data = await productApi.getAll(search || undefined, category || undefined);
          if (isNewDrops) {
            const cutoff = Date.now() - 3 * 24 * 60 * 60 * 1000;
            const filtered = data
              .filter((p) => {
                const t = new Date(p.created_at).getTime();
                return Number.isFinite(t) && t >= cutoff;
              })
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            setProducts(filtered);
          } else {
            setProducts(data);
          }
        }
      } catch (err) {
        setError('Failed to load products');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [category, search, isBestSelling, isNewDrops]);

  const getCategoryTitle = () => {
    if (isNewDrops) return 'New Drops';
    if (isBestSelling) return 'Trending Products';
    if (search) return `Search Results for "${search}"`;
    if (!category) return 'All Products';
    const normalizedCategory = category.toLowerCase().trim();
    const categoryMap: Record<string, string> = {
      men: 'Men\'s Products',
      men_shirt: 'Men\'s Shirts',
      men_panjabi: 'Men\'s Panjabi',
      womens: 'Women\'s Products',
      women: 'Women\'s Products', // Support both singular and plural
      combo: 'Combo Products',
      couple: 'Couple Products',
    };
    return categoryMap[normalizedCategory] || 'Products';
  };

  const getCategoryDescription = () => {
    if (isNewDrops) return 'Newly Droped Prodcuts Just For You!';
    if (isBestSelling) return 'Discover Our Most Popular Items';
    if (!category) return 'Explore Our Complete Collection of Premium Apparel';
    
    const normalizedCategory = category.toLowerCase().trim();
    const descriptionMap: Record<string, string> = {
      men: 'Discover our premium men\'s collection',
      men_shirt: 'Discover our premium men\'s shirts collection',
      men_panjabi: 'Discover our premium men\'s panjabi collection',
      womens: 'Discover our premium women\'s collection',
      women: 'Discover our premium women\'s collection', // Support both singular and plural
      combo: 'Discover our premium combo collection',
      couple: 'Discover our premium couple collection',
    };
    
    return descriptionMap[normalizedCategory] || `Discover our premium ${category} collection`;
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-black">
            {getCategoryTitle()}
          </h1>
          {!search && (
            <p className="text-lg text-gray-700">
              {getCategoryDescription()}
            </p>
          )}
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="text-lg text-gray-600">Loading products...</div>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="text-lg text-red-600">{error}</div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-lg text-gray-600">
              {search
                ? `No products found matching "${search}". Try a different search term.`
                : isBestSelling 
                  ? 'No best selling products available'
                  : category 
                    ? `No ${category} products available` 
                    : 'No products available'
              }
            </div>
            {search && (
              <Link
                href="/products"
                className="mt-4 inline-block px-6 py-2 border-2 border-black text-black hover:bg-black hover:text-white transition-colors rounded"
              >
                View All Products
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center py-16">
            <div className="text-lg text-gray-600">Loading products...</div>
          </div>
        </div>
      </div>
    }>
      <ProductsPageContent />
    </Suspense>
  );
}

