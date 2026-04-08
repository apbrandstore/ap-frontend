"use client";

import { useCallback, useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Product, productApi, categoryApi } from "@/lib/api";
import type { StorefrontCategory } from "@/types/api";
import { ProductCard } from "@/components/common/ProductCard";
import { ProductCardSkeleton } from "@/components/common/ProductCardSkeleton";

type FilterOption = { slug: string; name: string };

const PAGE_SIZE = 24;

function parsePositiveInt(s: string | null, fallback: number): number {
  if (!s) return fallback;
  const n = parseInt(s, 10);
  return Number.isFinite(n) && n >= 1 ? n : fallback;
}

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const bestSellingParam = searchParams.get("best_selling");
  const isBestSelling = bestSellingParam === "true";
  const newDropsParam = searchParams.get("new_drops");
  const isNewDrops = newDropsParam === "true";
  const page = parsePositiveInt(searchParams.get("page"), 1);

  const [products, setProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryInfo, setCategoryInfo] = useState<StorefrontCategory | null>(
    null
  );
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOption[]>([]);

  const isCategoryView = Boolean(
    category && !search && !isBestSelling && !isNewDrops
  );

  const ordering = isBestSelling
    ? "popularity"
    : isNewDrops
      ? "newest"
      : undefined;

  useEffect(() => {
    let cancelled = false;
    async function fetchProducts() {
      try {
        setLoading(true);
        setError(null);
        const data = await productApi.getPage({
          page,
          ...(search ? { search } : {}),
          ...(category ? { category } : {}),
          ...(ordering ? { ordering, sort: ordering } : {}),
        });
        if (!cancelled) {
          setProducts(data?.results ?? []);
          setTotalCount(data?.count ?? 0);
        }
      } catch (err) {
        if (!cancelled) {
          setError("Failed to load products");
          console.error(err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchProducts();
    return () => {
      cancelled = true;
    };
  }, [category, search, isBestSelling, isNewDrops, page, ordering]);

  useEffect(() => {
    if (!isCategoryView || !category) {
      setCategoryInfo(null);
      setFilterOptions([]);
      return;
    }
    let cancelled = false;
    setCategoryLoading(true);
    setCategoryInfo(null);
    setFilterOptions([]);

    async function load() {
      try {
        const tree = await categoryApi.getTree();
        if (cancelled) return;

        const slug = category!;
        let categoryInfoRes: StorefrontCategory | null = null;
        let parentSlugForAll: string | null = null;
        let children: StorefrontCategory[] = [];

        for (const parent of tree) {
          if (parent.slug === slug) {
            categoryInfoRes = parent;
            parentSlugForAll = parent.slug;
            children = parent.children ?? [];
            break;
          }
          const child = parent.children?.find((c) => c.slug === slug);
          if (child) {
            categoryInfoRes = { ...child, children: [] };
            parentSlugForAll = parent.slug;
            children = parent.children ?? [];
            break;
          }
        }

        if (categoryInfoRes) setCategoryInfo(categoryInfoRes);

        if (children.length > 1 && parentSlugForAll) {
          const options: FilterOption[] = [
            { slug: parentSlugForAll, name: "All" },
            ...children.map((c) => ({ slug: c.slug, name: c.name })),
          ];
          setFilterOptions(options);
        }
      } catch {
        if (!cancelled) {
          setCategoryInfo(null);
          setFilterOptions([]);
        }
      } finally {
        if (!cancelled) setCategoryLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [isCategoryView, category]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const hrefWithPage = useCallback(
    (n: number) => {
      const p = new URLSearchParams(searchParams.toString());
      p.set("page", String(Math.max(1, Math.min(n, totalPages))));
      return `/products?${p.toString()}`;
    },
    [searchParams, totalPages]
  );

  const buildFilterUrl = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("category", slug);
    params.set("page", "1");
    return `/products?${params.toString()}`;
  };

  const getCategoryTitle = (): string => {
    if (isNewDrops) return "New Drops";
    if (isBestSelling) return "Trending Products";
    if (search) return `Search Results for "${search}"`;
    if (!category) return "All Products";
    if (categoryInfo?.name) return categoryInfo.name;
    return category || "Products";
  };

  const getCategoryDescription = (): string => {
    if (isNewDrops) return "Newly Droped Prodcuts Just For You!";
    if (isBestSelling) return "Discover Our Most Popular Items";
    if (!category) return "Explore Our Complete Collection of Premium Apparel";
    return `Discover our premium ${categoryInfo?.name ?? category} collection`;
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-black">
            {categoryLoading && isCategoryView ? (
              <span className="inline-block h-9 md:h-10 bg-gray-200 rounded w-48 md:w-64 animate-pulse" />
            ) : (
              getCategoryTitle()
            )}
          </h1>
          {!search && (
            <p className="text-lg text-gray-700">{getCategoryDescription()}</p>
          )}
          {!loading && totalCount > 0 && (
            <p className="text-sm text-gray-500 mt-2">
              Showing {(page - 1) * PAGE_SIZE + 1}–
              {Math.min(page * PAGE_SIZE, totalCount)} of {totalCount} products
            </p>
          )}
        </div>

        {filterOptions.length > 1 && (
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {filterOptions.map((opt) => {
              const isActive = category === opt.slug;
              return (
                <Link
                  key={opt.slug}
                  href={buildFilterUrl(opt.slug)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-black text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {opt.name}
                </Link>
              );
            })}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
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
                  ? "No best selling products available"
                  : category
                    ? `No ${category} products available`
                    : "No products available"}
            </div>
            {search && (
              <Link href="/products" className="btn-outline mt-4 inline-block">
                View All Products
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-6">
              {products.map((product) => (
                <ProductCard key={product.public_id} product={product} />
              ))}
            </div>

            {totalPages > 1 && (
              <nav
                className="flex flex-wrap items-center justify-center gap-4 mt-12"
                aria-label="Pagination"
              >
                {page > 1 ? (
                  <Link
                    href={hrefWithPage(page - 1)}
                    className="px-4 py-2 rounded border border-gray-300 text-sm font-medium hover:bg-gray-50"
                  >
                    Previous
                  </Link>
                ) : (
                  <span className="px-4 py-2 rounded border border-gray-100 text-sm text-gray-400 cursor-not-allowed">
                    Previous
                  </span>
                )}
                <span className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </span>
                {page < totalPages ? (
                  <Link
                    href={hrefWithPage(page + 1)}
                    className="px-4 py-2 rounded border border-gray-300 text-sm font-medium hover:bg-gray-50"
                  >
                    Next
                  </Link>
                ) : (
                  <span className="px-4 py-2 rounded border border-gray-100 text-sm text-gray-400 cursor-not-allowed">
                    Next
                  </span>
                )}
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white">
          <div className="container mx-auto px-4 py-16">
            <div className="text-center mb-12">
              <div className="h-9 md:h-10 bg-gray-200 rounded w-48 md:w-64 mx-auto mb-4 animate-pulse" />
              <div className="h-5 md:h-6 bg-gray-100 rounded w-72 md:w-96 mx-auto animate-pulse" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      }
    >
      <ProductsPageContent />
    </Suspense>
  );
}
