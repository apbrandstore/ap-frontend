'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShoppingBag, 
  ChevronRight,
  ChevronDown,
  Tag
} from 'lucide-react';
import { categoryApi, Category } from '@/lib/api';

export function CategorySidebar() {
  const [expandedCategories, setExpandedCategories] = useState<{ [key: string]: boolean }>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const data = await categoryApi.getTree();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchCategories();
  }, []);

  const toggleCategoryExpansion = (category: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  if (isLoading) {
    return (
      <aside className="hidden lg:block w-64 bg-white border-r border-gray-200 sticky top-0 self-start h-screen overflow-y-auto scrollbar-hide" style={{ paddingTop: '80px' }}>
        <div className="p-4">
          <h2 className="text-lg font-bold text-red-600 mb-4 uppercase">Category</h2>
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="hidden lg:block w-64 bg-white border-r border-gray-200 sticky top-0 self-start h-screen overflow-y-auto scrollbar-hide" style={{ paddingTop: '80px' }}>
      <div className="p-4">
        <h2 className="text-lg font-bold text-red-600 mb-4 uppercase">Category</h2>
        <nav className="space-y-1">
          {categories.map((category) => (
            <div key={category.id}>
              {category.children.length > 0 ? (
                <>
                  <div className="flex items-center justify-between gap-3 px-3 py-2 text-sm hover:bg-gray-100 rounded transition-colors">
                    <Link
                      href={`/products?category=${category.slug}`}
                      className="flex items-center gap-3 flex-1"
                    >
                      <span className="text-gray-600 flex-shrink-0">
                        <Tag className="w-5 h-5" />
                      </span>
                      <span className="truncate text-black">{category.name}</span>
                    </Link>
                    <button
                      onClick={(e) => toggleCategoryExpansion(category.slug, e)}
                      className="p-1 hover:bg-gray-200 rounded flex-shrink-0"
                    >
                      {expandedCategories[category.slug] ? (
                        <ChevronDown className="w-4 h-4 text-gray-600" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-600" />
                      )}
                    </button>
                  </div>
                  {expandedCategories[category.slug] && (
                    <div className="pl-2 space-y-1">
                      {category.children.map((child) => (
                        <Link
                          key={child.id}
                          href={`/products?category=${child.slug}`}
                          className="flex items-center gap-3 px-3 py-2 pl-8 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors"
                        >
                          <span className="text-gray-600 flex-shrink-0">
                            <Tag className="w-5 h-5" />
                          </span>
                          <span className="truncate">{child.name}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={`/products?category=${category.slug}`}
                  className="flex items-center gap-3 px-3 py-2 text-sm text-black hover:bg-gray-100 rounded transition-colors"
                >
                  <span className="text-gray-600 flex-shrink-0">
                    <Tag className="w-5 h-5" />
                  </span>
                  <span className="truncate">{category.name}</span>
                </Link>
              )}
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
}

