'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowUp } from 'lucide-react';

export function MobileNavigation() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Right side floating action buttons (mobile only) */}
      <div className="fixed right-4 bottom-32 flex flex-col gap-3 z-40 md:hidden">
        {/* Scroll to Top - only when visible */}
        {isVisible && (
          <button
            onClick={scrollToTop}
            className="w-11 h-11 rounded-full bg-black shadow-lg flex items-center justify-center text-white hover:bg-gray-800 transition-colors"
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
        )}
      </div>

    </>
  );
}

