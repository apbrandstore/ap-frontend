'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { Search, X, ChevronRight, ChevronDown, ShoppingBag, User, MessageCircle, Phone, Grid2X2, Plus, Minus, Mail, Heart, Home } from 'lucide-react';
import { notificationApi, categoryApi, Notification, Category } from '@/lib/api';
import { SearchDropdown } from './SearchDropdown';

const placeholders = [
  'SEARCH BY NAME',
  'SEARCH BY CATEGORY',
];

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isMobileCategoriesOpen, setIsMobileCategoriesOpen] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [notification, setNotification] = useState<Notification | null>(null);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [expandedCategories, setExpandedCategories] = useState<{ [key: string]: boolean }>({});
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Check if we're on the home page
  const isHomePage = pathname === '/';

  useEffect(() => {
    async function fetchNotification() {
      const activeNotification = await notificationApi.getActive();
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

  const toggleMobileCategories = () => {
    setIsMobileCategoriesOpen((prev) => !prev);
  };

  const closeMobileCategories = () => {
    setIsMobileCategoriesOpen(false);
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
      {/* Top info bar - Phone & Email (mobile + desktop) */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-2 flex items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-gray-500">
          <a
            href="tel:+8801862641734"
            className="flex items-center gap-2 hover:text-black transition-colors"
          >
            <Phone className="w-4 h-4 flex-shrink-0" />
            <span>+8801862641734</span>
          </a>
          <a
            href="mailto:apbrandstore09@gmail.com"
            className="flex items-center gap-2 hover:text-black transition-colors"
          >
            <Mail className="w-4 h-4 flex-shrink-0" />
            <span>apbrandstore09@gmail.com</span>
          </a>
        </div>
      </div>

      {/* Mobile Header - Logo, Search (no hamburger; nav moved to bottom bar) */}
      <div className="md:hidden relative overflow-visible">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-3 relative">
          {/* Left: Spacer for balance */}
          <div className="w-10 h-10 flex-shrink-0" aria-hidden />

          {/* Center: Logo - Bigger size with absolute positioning to allow overflow */}
          <Link 
            href="/" 
            className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center z-30 pointer-events-auto"
          >
            <Image
              src="/media/apb-logo.svg"
              alt="AP Brand Store Logo"
              width={280}
              height={140}
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

      {/* Mobile Categories Panel - slides up from bottom (same tree as desktop) */}
      {isMobileCategoriesOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-[60] md:hidden"
            onClick={closeMobileCategories}
            aria-hidden
          />
          <div
            className="fixed left-0 right-0 bottom-0 z-[70] md:hidden bg-white rounded-t-2xl shadow-2xl max-h-[85vh] flex flex-col pb-[env(safe-area-inset-bottom,0)]"
            role="dialog"
            aria-label="Categories"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 flex-shrink-0">
              <h2 className="text-lg font-semibold text-black">Categories</h2>
              <button
                onClick={closeMobileCategories}
                className="p-2 -m-2 text-gray-500 hover:text-black"
                aria-label="Close categories"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 py-2">
              <Link
                href="/products"
                className="block px-4 py-3 text-sm font-medium text-black hover:bg-gray-100"
                onClick={closeMobileCategories}
              >
                All Products
              </Link>
              {categories.map((category) => (
                <div key={category.id} className="border-t border-gray-100">
                  {category.children.length > 0 ? (
                    <>
                      <div className="flex items-center justify-between px-4 py-3 text-sm group">
                        <Link
                          href={`/products?category=${category.slug}`}
                          className="flex-1 font-medium text-black hover:underline"
                          onClick={closeMobileCategories}
                        >
                          {category.name}
                        </Link>
                        <button
                          type="button"
                          onClick={(e) => toggleCategoryExpansion(category.slug, e)}
                          className="p-2 -m-2 text-gray-500 hover:bg-gray-100 rounded"
                          aria-expanded={expandedCategories[category.slug]}
                          aria-label={expandedCategories[category.slug] ? `Collapse ${category.name}` : `Expand ${category.name}`}
                        >
                          {expandedCategories[category.slug] ? (
                            <ChevronDown className="w-5 h-5" />
                          ) : (
                            <ChevronRight className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      {expandedCategories[category.slug] && (
                        <div className="bg-gray-50 pl-4 pr-2 py-2 space-y-0.5">
                          {category.children.map((child) => (
                            <Link
                              key={child.id}
                              href={`/products?category=${child.slug}`}
                              className="block py-2.5 px-2 text-sm text-gray-700 hover:text-black hover:bg-gray-100 rounded"
                              onClick={closeMobileCategories}
                            >
                              {child.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      href={`/products?category=${category.slug}`}
                      className="block px-4 py-3 text-sm font-medium text-black hover:bg-gray-100"
                      onClick={closeMobileCategories}
                    >
                      {category.name}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Mobile Bottom Navigation Bar - white bg, black icons */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white text-black border-t border-gray-200 pb-[env(safe-area-inset-bottom,0)]">
        <nav className="flex items-center justify-around py-2 px-2" aria-label="Mobile navigation">
          <button
            type="button"
            onClick={toggleMobileCategories}
            className={`flex flex-col items-center justify-center gap-0.5 py-1.5 min-w-0 flex-1 transition-colors ${isMobileCategoriesOpen || pathname.startsWith('/products') ? 'text-black' : 'text-black/80 hover:text-black'}`}
            aria-label="Category"
            aria-expanded={isMobileCategoriesOpen}
          >
            <Grid2X2 className="w-6 h-6 flex-shrink-0" strokeWidth={1.5} />
            <span className="text-[10px] font-medium uppercase tracking-wide">Category</span>
          </button>
          <Link
            href="/wishlist"
            className={`flex flex-col items-center justify-center gap-0.5 py-1.5 min-w-0 flex-1 transition-colors ${pathname === '/wishlist' ? 'text-black' : 'text-black/80 hover:text-black'}`}
            aria-label="Wishlist"
          >
            <Heart className="w-6 h-6 flex-shrink-0" strokeWidth={1.5} />
            <span className="text-[10px] font-medium uppercase tracking-wide">Wishlist</span>
          </Link>
          <Link
            href="/"
            className={`flex flex-col items-center justify-center gap-0.5 py-1.5 min-w-0 flex-1 transition-colors ${pathname === '/' ? 'text-black' : 'text-black/80 hover:text-black'}`}
            aria-label="Home"
          >
            <Home className="w-6 h-6 flex-shrink-0" strokeWidth={1.5} />
            <span className="text-[10px] font-medium uppercase tracking-wide">Home</span>
          </Link>
          <a
            href="https://wa.me/8801862641734"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center gap-0.5 py-1.5 min-w-0 flex-1 text-black/80 hover:text-black transition-colors"
            aria-label="Chat"
          >
            <MessageCircle className="w-6 h-6 flex-shrink-0" strokeWidth={1.5} />
            <span className="text-[10px] font-medium uppercase tracking-wide">Chat</span>
          </a>
          <a
            href="tel:+8801862641734"
            className="flex flex-col items-center justify-center gap-0.5 py-1.5 min-w-0 flex-1 text-black/80 hover:text-black transition-colors"
            aria-label="Call"
          >
            <Phone className="w-6 h-6 flex-shrink-0" strokeWidth={1.5} />
            <span className="text-[10px] font-medium uppercase tracking-wide">Call</span>
          </a>
        </nav>
      </div>

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
            className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center z-30 pointer-events-auto"
          >
            <Image
              src="/media/apb-logo.svg"
              alt="AP Brand Store Logo"
              width={260}
              height={120}
              className="h-40 w-auto"
            />
          </Link>

          {/* Right: Account and Cart Icons */}
          <div className="flex items-center gap-3 z-10">
            <div className="relative p-2 opacity-30 cursor-not-allowed pointer-events-none">
              <User className="w-5 h-5 text-black" />
            </div>
            <div className="relative p-2 opacity-30 cursor-not-allowed pointer-events-none">
              <ShoppingBag className="w-5 h-5 text-black" />
            </div>
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
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[200]">
                <div className="py-2">
                  {categories.map((category) => (
                    <div key={category.id}>
                      {category.children.length > 0 ? (
                        <>
                          <div className="flex items-center justify-between px-4 py-2 text-sm hover:bg-gray-100 group/item">
                            <Link
                              href={`/products?category=${category.slug}`}
                              className="flex-1 text-black"
                            >
                              {category.name}
                            </Link>
                            <button
                              onClick={(e) => toggleCategoryExpansion(category.slug, e)}
                              className="p-1 hover:bg-gray-200 rounded"
                            >
                              {expandedCategories[category.slug] ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                          {expandedCategories[category.slug] && (
                            <div className="pl-2">
                              {category.children.map((child) => (
                                <Link
                                  key={child.id}
                                  href={`/products?category=${child.slug}`}
                                  className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 pl-6"
                                >
                                  {child.name}
                                </Link>
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        <Link
                          href={`/products?category=${category.slug}`}
                          className="block px-4 py-2 text-sm text-black hover:bg-gray-100"
                        >
                          {category.name}
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <Link href="/customer-reviews" className="text-sm font-medium text-black hover:underline">
              Customer Reviews
            </Link>
          </div>
        </div>
      </div>

      {/* Notification Bar - Only show on home page */}
      {notification && isHomePage && (
        <div className="bg-black text-white py-2 overflow-hidden relative w-full z-10">
          <div className="flex animate-marquee whitespace-nowrap">
            {/* First set of marquee items */}
            <div className="flex items-center flex-shrink-0">
              {Array.from({ length: 100 }).map((_, i) => (
                <span key={`first-${i}`} className="text-xs md:text-sm uppercase font-medium mx-6 inline-block flex-shrink-0">
                  {notification.message}
                </span>
              ))}
            </div>
            {/* Duplicate set for seamless loop */}
            <div className="flex items-center flex-shrink-0" aria-hidden="true">
              {Array.from({ length: 100 }).map((_, i) => (
                <span key={`second-${i}`} className="text-xs md:text-sm uppercase font-medium mx-6 inline-block flex-shrink-0">
                  {notification.message}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

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
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-black"
                    autoFocus
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
                  >
                    Track
                  </button>
                  <button
                    type="button"
                    onClick={closeTrackingModal}
                    className="flex-1 bg-gray-200 text-black px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
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

