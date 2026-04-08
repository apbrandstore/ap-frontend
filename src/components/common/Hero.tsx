"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { bannerApi, getImageUrl } from "@/lib/api";
import { firstHeroImageUrlForSlot } from "@/lib/banner-utils";

export function Hero({ initialHeroSrc }: { initialHeroSrc?: string }) {
  const [heroSrc, setHeroSrc] = useState<string | null>(() =>
    getImageUrl(initialHeroSrc ?? null)
  );

  useEffect(() => {
    (async () => {
      let banners = await bannerApi.getForSlot("home_top");
      if (banners.length === 0) banners = await bannerApi.getAll();
      const raw = firstHeroImageUrlForSlot(banners, "home_top");
      const url = raw ? getImageUrl(raw) : null;
      if (url) setHeroSrc(url);
    })().catch(() => {});
  }, []);

  return (
    <section className="relative w-full bg-white overflow-hidden">
      <div className="relative w-full min-h-[200px] aspect-[16/9] md:aspect-[21/9] lg:aspect-[3/1]">
        {heroSrc ? (
          <Image
            src={heroSrc}
            alt="Store hero"
            fill
            priority
            sizes="100vw"
            className="object-contain object-top"
            unoptimized
          />
        ) : null}
      </div>
    </section>
  );
}
