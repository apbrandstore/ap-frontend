"use client";

import Script from "next/script";

const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_PUBLISHABLE_KEY?.trim() ?? "";
const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() ?? "";

export function MetaPixel({
  trackerScriptSrc,
}: {
  trackerScriptSrc?: string | null;
}) {
  if (!PUBLISHABLE_KEY) {
    return null;
  }

  const src = trackerScriptSrc?.trim() || "";
  if (!src) return null;

  return (
    <>
      <Script
        id="paperbase-publishable-key"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: [
            `window.__PAPERBASE_API_KEY__ = ${JSON.stringify(PUBLISHABLE_KEY)};`,
            `window.PAPERBASE_PUBLISHABLE_KEY = ${JSON.stringify(PUBLISHABLE_KEY)};`,
            ...(PIXEL_ID
              ? [`window.__PAPERBASE_PIXEL_ID__ = ${JSON.stringify(PIXEL_ID)};`]
              : []),
          ].join("\n"),
        }}
      />
      <Script
        id="paperbase-tracker"
        src={src}
        strategy="beforeInteractive"
      />
    </>
  );
}
