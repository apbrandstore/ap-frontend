"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { bannerApi, getImageUrl } from "@/lib/api";
import type { BannerPlacementSlot, PublicBanner } from "@/types/api";
import { bannersForSlot, sortBannersByOrder } from "@/lib/banner-utils";

/**
 * Renders active banners for a single placement slot (e.g. `home_mid`, `home_bottom`).
 */
export function PlacementBanners({
  slot,
  className = "",
}: {
  slot: BannerPlacementSlot;
  className?: string;
}) {
  const [banners, setBanners] = useState<PublicBanner[]>([]);
  const isHomeSlot = slot === "home_top" || slot === "home_mid" || slot === "home_bottom";

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        let list = await bannerApi.getForSlot(slot);
        if (list.length === 0) {
          const all = await bannerApi.getAll();
          list = bannersForSlot(all, slot);
        }
        if (!cancelled) setBanners(sortBannersByOrder(list));
      } catch {
        if (!cancelled) setBanners([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slot]);

  if (banners.length === 0) return null;

  if (isHomeSlot) {
    return (
      <section className={`relative w-full bg-white overflow-hidden ${className}`}>
        {banners.map((b) => {
          const img = getImageUrl(b.image_url);
          if (!img) return null;

          const objectPositionClass =
            slot === "home_bottom" ? "object-bottom" : "object-top";

          const block = (
            <div className="relative w-full min-h-[120px] sm:min-h-[160px] aspect-[21/9] md:min-h-[200px] md:aspect-[21/9] lg:aspect-[3/1]">
              <Image
                src={img}
                alt={b.title || "Promotion"}
                fill
                priority={slot === "home_top"}
                sizes="100vw"
                className={`object-contain ${objectPositionClass}`}
                unoptimized
              />
            </div>
          );

          return (
            <div key={b.public_id}>
              {b.cta_url ? (
                <Link href={b.cta_url} className="block">
                  {block}
                </Link>
              ) : (
                block
              )}
            </div>
          );
        })}
      </section>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {banners.map((b) => {
        const img = getImageUrl(b.image_url);
        const imageBlock = img ? (
          <div className="relative w-full aspect-[5/1] max-h-40 bg-gray-100 rounded-lg overflow-hidden">
            <Image
              src={img}
              alt={b.title || "Promotion"}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        ) : null;
        const meta = (
          <div className="flex flex-wrap items-center justify-between gap-2 px-1 py-2">
            {b.title ? (
              <span className="text-sm font-medium text-gray-900">{b.title}</span>
            ) : null}
            {b.cta_url && b.cta_text ? (
              <Link
                href={b.cta_url}
                className="text-sm text-primary font-medium underline"
              >
                {b.cta_text}
              </Link>
            ) : null}
          </div>
        );
        return (
          <div
            key={b.public_id}
            className="rounded-lg border border-gray-100 overflow-hidden bg-white shadow-sm"
          >
            {b.cta_url && !b.cta_text && imageBlock ? (
              <Link href={b.cta_url} className="block">
                {imageBlock}
              </Link>
            ) : (
              imageBlock
            )}
            {meta}
          </div>
        );
      })}
    </div>
  );
}
