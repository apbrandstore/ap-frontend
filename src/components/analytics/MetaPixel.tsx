"use client";

import Script from "next/script";
import { useRef } from "react";

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() ?? "";

let globalInitDone = false;

function runInitOnce(pixelId: string) {
  if (globalInitDone) return;
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;
  globalInitDone = true;
  window.fbq("init", pixelId);
  window.fbq("track", "PageView");
}

export function MetaPixel() {
  const initRef = useRef(false);

  if (!PIXEL_ID) {
    return null;
  }

  const handleLoad = () => {
    if (initRef.current) return;
    initRef.current = true;
    runInitOnce(PIXEL_ID);
  };

  return (
    <Script
      id="meta-pixel-fbevents"
      src="https://connect.facebook.net/en_US/fbevents.js"
      strategy="afterInteractive"
      onLoad={handleLoad}
    />
  );
}
