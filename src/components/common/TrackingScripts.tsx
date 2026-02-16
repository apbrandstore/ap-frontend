'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { trackingCodeApi, TrackingCode } from '@/lib/api';

export function TrackingScripts() {
  const [trackingCodes, setTrackingCodes] = useState<TrackingCode[]>([]);

  useEffect(() => {
    async function fetchTrackingCodes() {
      const codes = await trackingCodeApi.getActive();
      setTrackingCodes(codes);
    }
    fetchTrackingCodes();
  }, []);

  if (trackingCodes.length === 0) {
    return null;
  }

  return (
    <>
      {trackingCodes.map((trackingCode) => (
        <Script
          key={trackingCode.id}
          id={`tracking-code-${trackingCode.id}`}
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: trackingCode.code,
          }}
        />
      ))}
    </>
  );
}
