'use client';

import Image from 'next/image';
import Link from 'next/link';

export function Hero() {
  return (
    <section className="relative w-full bg-white overflow-hidden">
      {/* Main Banner - Full Width */}
      <div className="relative w-full h-[180px] md:h-[220px] lg:h-[820px] overflow-hidden bg-black">
        {/* Hero image */}
        <Image
          src="/media/apb-hero.png"
          alt="AP Brand hero"
          fill
          priority
          quality={92}
          sizes="100vw"
          className="object-cover object-center"
        />
        
        {/* Shop Now Button - Center Bottom - Mobile Only */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 md:hidden">
          <Link
            href="/products"
            className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-black text-white text-sm font-medium tracking-wide hover:bg-gray-900 transition-colors"
            style={{ fontFamily: 'var(--font-space-grotesk), "Space Grotesk", sans-serif' }}
          >
            Shop Now
          </Link>
        </div>
      </div>
    </section>
  );
}


