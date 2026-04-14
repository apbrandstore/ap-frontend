'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { Search, X, ChevronRight, ChevronDown, ShoppingBag, User, Phone, Plus, Minus, Mail, Menu } from 'lucide-react';
import { notificationApi, categoryApi, type StorefrontNotification, type Category } from '@/lib/api';
import { SearchDropdown } from '@/components/common/SearchDropdown';
import { useCart } from '@/contexts/CartContext';

const placeholders = [
  'SEARCH BY NAME',
  'SEARCH BY CATEGORY',
];

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { itemCount } = useCart();
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [notification, setNotification] = useState<StorefrontNotification | null>(null);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [expandedCategories, setExpandedCategories] = useState<{ [key: string]: boolean }>({});
  const [categories, setCategories] = useState<Category[]>([]);
  
  useEffect(() => {
    async function fetchNotification() {
      const activeNotification = await notificationApi.getFirstActive();
      setNotification(activeNotification);
    }
    fetchNotification();
  }, []);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const data = await categoryApi.getTree();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3000); // Change placeholder every 3 seconds

    return () => clearInterval(interval);
  }, []);

  const toggleCategoryExpansion = (category: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const MAX_CATEGORY_DEPTH = 5;

  const renderMobileCategory = (category: Category, depth: number) => {
    if (depth > MAX_CATEGORY_DEPTH) return null;
    const hasChildren = (category.children ?? []).length > 0;
    const isExpanded = Boolean(expandedCategories[category.slug]);
    const paddingLeft = 16 + depth * 12; // px

    return (
      <div key={category.public_id}>
        <div className="flex items-center justify-between py-3 text-sm" style={{ paddingLeft, paddingRight: 16 }}>
          <Link
            href={`/products?category=${category.slug}`}
            className={`flex-1 ${depth === 0 ? "font-medium" : ""} text-black/80 hover:text-black`}
            onClick={closeHamburger}
          >
            {category.name}
          </Link>
          {hasChildren ? (
            <button
              type="button"
              onClick={(e) => toggleCategoryExpansion(category.slug, e)}
              className="p-2 -m-2 text-gray-500 hover:bg-gray-100 rounded"
              aria-expanded={isExpanded}
              aria-label={isExpanded ? `Collapse ${category.name}` : `Expand ${category.name}`}
            >
              {isExpanded ? (
                <Minus className="w-4 h-4" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
            </button>
          ) : null}
        </div>

        {hasChildren && isExpanded ? (
          <div className="bg-gray-50 py-1 space-y-0.5">
            {(category.children ?? []).map((child) =>
              renderMobileCategory(child as Category, depth + 1)
            )}
          </div>
        ) : null}
      </div>
    );
  };

  const renderDesktopCategory = (category: Category, depth: number) => {
    if (depth > MAX_CATEGORY_DEPTH) return null;
    const hasChildren = (category.children ?? []).length > 0;
    const isExpanded = Boolean(expandedCategories[category.slug]);
    const paddingLeft = 16 + depth * 12; // px

    return (
      <div key={category.public_id}>
        <div className="dropdown-item" style={{ paddingLeft }}>
          <Link
            href={`/products?category=${category.slug}`}
            className={`flex-1 ${depth === 0 ? "text-black" : "text-gray-700"} hover:text-black`}
          >
            {category.name}
          </Link>
          {hasChildren ? (
            <button
              onClick={(e) => toggleCategoryExpansion(category.slug, e)}
              className="p-1 hover:bg-gray-200 rounded"
              aria-expanded={isExpanded}
              aria-label={isExpanded ? `Collapse ${category.name}` : `Expand ${category.name}`}
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          ) : null}
        </div>
        {hasChildren && isExpanded ? (
          <div className="py-0.5">
            {(category.children ?? []).map((child) =>
              renderDesktopCategory(child as Category, depth + 1)
            )}
          </div>
        ) : null}
      </div>
    );
  };

  const openTrackingModal = () => {
    setIsTrackingModalOpen(true);
  };

  const closeTrackingModal = () => {
    setIsTrackingModalOpen(false);
    setOrderId('');
  };

  const openSearchModal = () => {
    setIsSearchModalOpen(true);
  };

  const closeSearchModal = () => {
    setIsSearchModalOpen(false);
  };

  const toggleHamburger = () => {
    setIsHamburgerOpen((prev) => !prev);
  };

  const closeHamburger = () => {
    setIsHamburgerOpen(false);
  };

  const handleTrackOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderId.trim()) {
      // For now, redirect URL is blank as requested
      // This will be updated later with the actual Steadfast tracking URL
      const trackingUrl = ''; // Placeholder for Steadfast tracking URL
      
      if (trackingUrl) {
        window.location.href = trackingUrl;
      } else {
        // For now, just close the modal since URL is blank
        closeTrackingModal();
      }
    }
  };


  return (
    <nav className="bg-white sticky top-0 z-50 border-b border-gray-200 overflow-visible">
      {/* Top info bar - CTA notification (mobile + desktop) */}
      {notification && (
        <div className="bg-black text-white py-2 overflow-hidden relative w-full z-10 border-b border-black">
          <div className="flex animate-marquee whitespace-nowrap">
            <div className="flex items-center flex-shrink-0">
              {Array.from({ length: 100 }).map((_, i) => (
                <span
                  key={`first-${i}`}
                  className="text-xs md:text-sm uppercase font-medium mx-6 inline-block flex-shrink-0"
                >
                  {notification.cta_url ? (
                    <a
                      href={notification.cta_url}
                      className="underline-offset-2 hover:underline"
                    >
                      {notification.cta_text}
                    </a>
                  ) : (
                    notification.cta_text
                  )}
                </span>
              ))}
            </div>
            <div className="flex items-center flex-shrink-0" aria-hidden="true">
              {Array.from({ length: 100 }).map((_, i) => (
                <span
                  key={`second-${i}`}
                  className="text-xs md:text-sm uppercase font-medium mx-6 inline-block flex-shrink-0"
                >
                  {notification.cta_text}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Header - Hamburger, Logo, Search */}
      <div className="md:hidden relative overflow-visible">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-3 relative">
          {/* Left: Hamburger button */}
          <button
            onClick={toggleHamburger}
            className="p-2 flex-shrink-0 z-10"
            aria-label={isHamburgerOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isHamburgerOpen}
          >
            {isHamburgerOpen ? (
              <X className="w-6 h-6 text-black" />
            ) : (
              <Menu className="w-6 h-6 text-black" />
            )}
          </button>

          {/* Center: Logo - Bigger size with absolute positioning to allow overflow */}
          <Link 
            href="/" 
            className="center-absolute"
          >
            <Image
              src="/media/apb-logo.svg"
              alt="AP Brand Store Logo"
              width={280}
              height={140}
              priority
              className="h-24 w-auto"
            />
          </Link>

          {/* Right: Search Icon */}
          <button
            onClick={openSearchModal}
            className="p-2 flex-shrink-0 z-10"
            aria-label="Search"
          >
            <Search className="w-6 h-6 text-black" />
          </button>
        </div>
      </div>

      {/* Mobile Hamburger Drawer */}
      {isHamburgerOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-[60] md:hidden"
            onClick={closeHamburger}
            aria-hidden
          />
          {/* Drawer */}
          <div
            className="hamburger-drawer"
            role="dialog"
            aria-label="Navigation menu"
          >
            <div className="drawer-header">
              <h2 className="text-lg font-semibold text-black">Menu</h2>
              <button
                onClick={closeHamburger}
                className="p-2 -m-2 text-gray-500 hover:text-black"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 py-2">
              <Link
                href="/products"
                className={`block px-4 py-3 text-sm font-medium hover:bg-gray-100 transition-colors ${pathname.startsWith('/products') ? 'text-black' : 'text-black/80'}`}
                onClick={closeHamburger}
              >
                All Products
              </Link>
              {categories.map((category) => renderMobileCategory(category, 0))}
            </div>
          </div>
        </>
      )}

      {/* Desktop Top Bar with Search Icon, Logo, and Icons */}
      <div className="hidden md:block relative overflow-visible">
        <div className="container mx-auto px-4 py-4 min-h-18 flex items-center justify-between relative">
          {/* Left: Search Icon */}
          <button
            onClick={openSearchModal}
            className="p-2 hover:bg-gray-100 rounded transition-colors z-10"
            aria-label="Search"
          >
            <Search className="w-5 h-5 text-black" />
          </button>

          {/* Center: Logo - Positioned absolutely to allow overflow */}
          <Link 
            href="/" 
            className="center-absolute"
          >
            <Image
              src="/media/apb-logo.svg"
              alt="AP Brand Store Logo"
              width={260}
              height={120}
              priority
              className="h-40 w-auto"
            />
          </Link>

          {/* Right: Account and Cart Icons */}
          <div className="flex items-center gap-3 z-10">
            <div className="relative p-2 opacity-30 cursor-not-allowed pointer-events-none">
              <User className="w-5 h-5 text-black" />
            </div>
            <Link href="/cart" className="relative p-2 hover:bg-gray-100 rounded transition-colors" aria-label="Cart">
              <ShoppingBag className="w-5 h-5 text-black" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 text-[10px] font-bold bg-black text-white rounded-full flex items-center justify-center">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Desktop Navigation Bar - Added padding-top to give space for logo overflow */}
      <div className="hidden md:block bg-white relative z-30 overflow-visible pt-8">
        <div className="container mx-auto px-4 pb-4">
          <div className="flex items-center justify-center gap-8">
            <Link href="/" className="text-sm font-medium text-black hover:underline">
              Home
            </Link>
            <div className="relative group z-[200]">
              <button className="text-sm font-medium text-black hover:underline relative z-[200]">
                Categories
              </button>
              {/* Dropdown Menu */}
              <div className="dropdown-panel">
                <div className="py-2">
                  {categories.map((category) => renderDesktopCategory(category, 0))}
                </div>
              </div>
            </div>
            <Link href="/customer-reviews" className="text-sm font-medium text-black hover:underline">
              Customer Reviews
            </Link>
          </div>
        </div>
      </div>

      {/* Search Modal */}
      {isSearchModalOpen && (
        <div 
          className="fixed inset-0 z-50"
          onClick={closeSearchModal}
        >
          {/* Overlay with blur effect */}
          <div 
            className="fixed inset-0 backdrop-blur-sm bg-black/20"
          />
          {/* Search Input - No background container */}
          <div className="fixed inset-0 flex items-start justify-center p-4 pt-20 pointer-events-none">
            <div 
              className="max-w-2xl w-full pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <SearchDropdown
                isMobile={false}
                autoFocus
                placeholder={placeholders[placeholderIndex]}
                onClose={closeSearchModal}
              />
            </div>
          </div>
        </div>
      )}

      {/* Tracking Modal */}
      {isTrackingModalOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 backdrop-blur-sm z-50"
            onClick={closeTrackingModal}
          />
          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div 
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-black">Track Your Parcel</h2>
                <button
                  onClick={closeTrackingModal}
                  className="text-gray-500 hover:text-black"
                  aria-label="Close modal"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleTrackOrder}>
                <div className="mb-4">
                  <label htmlFor="orderId" className="block text-sm font-medium text-gray-700 mb-2">
                    Enter Order ID
                  </label>
                  <input
                    type="text"
                    id="orderId"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="Enter your order ID"
                    className="input-search"
                    autoFocus
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 btn-primary"
                  >
                    Track
                  </button>
                  <button
                    type="button"
                    onClick={closeTrackingModal}
                    className="flex-1 btn-muted"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </nav>
  );
}

