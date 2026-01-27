'use client';

import Image from 'next/image';
import Link from 'next/link';

export function Hero() {
  return (
    <section className="relative w-full bg-white overflow-hidden">
      <div className="container mx-auto px-4 py-8 md:py-12 lg:py-16">
        {/* Main Banner - Full Width */}
        <div className="relative h-[420px] md:h-[560px] lg:h-[680px] rounded-lg overflow-hidden bg-black">
          {/* Hero image */}
          <Image
            src="/media/hero.png"
            alt="AP Brand hero"
            fill
            priority
            quality={92}
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 100vw, 1200px"
            className="object-cover object-center scale-[1.06] md:scale-[1.08]"
          />

          {/* Dark/gradient overlays for contrast + 'cool' look */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-black/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

          {/* Subtle geometric pattern overlay */}
          <div className="absolute inset-0 opacity-[0.07]">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                backgroundSize: '40px 40px',
              }}
            />
          </div>
          
          {/* Content */}
          <div className="relative h-full flex items-center justify-center p-8 md:p-12">
            <div className="text-center z-10 max-w-4xl mx-auto">
              {/* Main Title with split styling */}
              <div className="mb-6 md:mb-8">
                <h1 
                  className="text-4xl md:text-5xl lg:text-7xl font-bold mb-3 md:mb-4 leading-tight"
                  style={{ fontFamily: 'var(--font-space-grotesk), "Space Grotesk", sans-serif' }}
                >
                  <span className="text-white block">Welcome to</span>
                  <span className="text-white block">
                    <span className="text-red-600">AP Brand</span> Store
                  </span>
                </h1>

                <div className="mt-6 flex justify-center">
                  <Link
                    href="/products"
                    className="inline-flex items-center justify-center px-7 py-3 rounded-md bg-red-600 text-white font-semibold tracking-wide hover:bg-red-700 transition-colors"
                    style={{ fontFamily: 'var(--font-space-grotesk), "Space Grotesk", sans-serif' }}
                  >
                    Shop Now
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          {/* Subtle corner accent */}
          <div className="absolute top-0 right-0 w-32 h-32 md:w-48 md:h-48">
            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-red-600/20 to-transparent"></div>
          </div>
          <div className="absolute bottom-0 left-0 w-32 h-32 md:w-48 md:h-48">
            <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-tr from-red-600/10 to-transparent"></div>
          </div>
        </div>
      </div>
    </section>
  );
}


