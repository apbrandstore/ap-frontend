'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { trackingCodeApi } from '@/lib/api';

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
  );
}
