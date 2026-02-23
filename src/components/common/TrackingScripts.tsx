'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { trackingCodeApi } from '@/lib/api';

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

function PageViewTracker({ pixelId }: { pixelId: string }) {
  const pathname = usePathname();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized) {
      // Skip the first render — the base code already fired PageView on mount
      setInitialized(true);
      return;
    }
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'PageView');
    }
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}

export function TrackingScripts() {
  const [pixelId, setPixelId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPixelId() {
      const codes = await trackingCodeApi.getActive();
      if (codes.length > 0 && codes[0].pixel_id) {
        setPixelId(codes[0].pixel_id);
      }
    }
    fetchPixelId();
  }, []);

  if (!pixelId) return null;

  return (
    <>
      <Script
        id="facebook-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s){
              if(f.fbq)return;n=f.fbq=function(){
                n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)
              };
              if(!f._fbq)f._fbq=n;
              n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)
            }(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
            fbq('init','${pixelId}');
            fbq('track','PageView');
          `,
        }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
      <PageViewTracker pixelId={pixelId} />
    </>
  );
}
