"use client";

import Script from "next/script";

const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_PUBLISHABLE_KEY?.trim() ?? "";

export function MetaPixel() {
  if (!PUBLISHABLE_KEY) {
    return null;
  }

  return (
    <>
      <Script
        id="paperbase-publishable-key"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `window.__PAPERBASE_API_KEY__ = ${JSON.stringify(PUBLISHABLE_KEY)};`,
        }}
      />
      <Script
        id="paperbase-tracker"
        src="https://storage.paperbase.me/static/tracker.js"
        strategy="beforeInteractive"
      />
    </>
  );
}
