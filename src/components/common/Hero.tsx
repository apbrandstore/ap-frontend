'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { siteSettingsApi, getImageUrl } from '@/lib/api';

const DEFAULT_HERO_SRC = '/media/apb-hero.png';

export function Hero() {
  const [heroSrc, setHeroSrc] = useState<string>(DEFAULT_HERO_SRC);

  useEffect(() => {
    siteSettingsApi.get().then((settings) => {
      const url = settings.hero_image ? getImageUrl(settings.hero_image) : null;
      if (url) setHeroSrc(url);
    }).catch(() => {});
  }, []);

  return (
    <section className="relative w-full bg-white overflow-hidden">
      {/* Main Banner - full image visible, no cropping; container matches typical hero aspect */}
      <div className="relative w-full min-h-[200px] aspect-[16/9] md:aspect-[21/9] lg:aspect-[3/1]">
        {/* Hero image - fully visible, no crop; any letterboxing is white (section bg) */}
        <Image
          src={heroSrc}
          alt="AP Brand hero"
          fill
          priority
          quality={92}
          sizes="100vw"
          className="object-contain"
        />
        
        {/* Shop Now Button - Center Bottom - Mobile Only */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 md:hidden">
          <Link
            href="/products"
            className="btn-primary font-heading tracking-wide hover:opacity-90"
          >
            Shop Now
          </Link>
        </div>
      </div>
    </section>
  );
}


