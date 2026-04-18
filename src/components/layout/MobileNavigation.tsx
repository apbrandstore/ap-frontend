'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { Phone, X, MessagesSquare } from 'lucide-react';
import { storeApi } from '@/lib/api';
import type { StorePublic } from '@/types/api';
import { storeWhatsappAction, storeTelHref } from '@/lib/store-public-footer';
import { WhatsappBrandIcon } from '@/components/common/WhatsappBrandIcon';
import { cn } from '@/lib/utils';

export function MobileNavigation({ storePublic }: { storePublic: StorePublic | null }) {
  const pathname = usePathname();
  const [publicStore, setPublicStore] = useState<StorePublic | null>(storePublic);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const contactRef = useRef<HTMLDivElement>(null);

  const refreshStorePublic = useCallback(() => {
    storeApi
      .getPublic()
      .then((d) => setPublicStore(d))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setPublicStore(storePublic);
  }, [storePublic]);

  useEffect(() => {
    refreshStorePublic();
  }, [refreshStorePublic, pathname]);

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === 'visible') refreshStorePublic();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [refreshStorePublic]);

  const whatsapp = storeWhatsappAction(publicStore);
  const telHref = storeTelHref(publicStore);
  const hasContact = Boolean(whatsapp || telHref);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (contactRef.current && !contactRef.current.contains(e.target as Node)) {
        setIsContactOpen(false);
      }
    };

    if (isContactOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isContactOpen]);

  if (!hasContact) {
    return null;
  }

  return (
    <>
      {/* Contact Us speed-dial FAB — mobile only; numbers from GET /store/public/ */}
      <div
        ref={contactRef}
        className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3 md:hidden"
      >
        {isContactOpen && (
          <>
            {telHref ? (
              <a
                href={telHref}
                className="flex items-center gap-2 bg-black text-white pl-3 pr-4 py-2.5 rounded-full shadow-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                aria-label="Call us"
                onClick={() => setIsContactOpen(false)}
              >
                <Phone className="w-4 h-4 flex-shrink-0" />
                Call
              </a>
            ) : null}
            {whatsapp ? (
              <a
                href={whatsapp.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-whatsapp text-white pl-3 pr-4 py-2.5 rounded-full shadow-lg text-sm font-medium hover:bg-whatsapp-hover transition-colors"
                aria-label="Chat on WhatsApp"
                onClick={() => setIsContactOpen(false)}
              >
                <WhatsappBrandIcon className="h-4 w-4 flex-shrink-0" />
                WhatsApp
              </a>
            ) : null}
          </>
        )}

        <button
          type="button"
          onClick={() => setIsContactOpen((prev) => !prev)}
          className={cn(
            'w-14 h-14 rounded-full bg-black text-white shadow-lg flex items-center justify-center hover:bg-gray-800 transition-all',
            !isContactOpen && 'animate-fab-message-pulse'
          )}
          aria-label={isContactOpen ? 'Close contact options' : 'Contact us'}
          aria-expanded={isContactOpen}
        >
          {isContactOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <MessagesSquare className="w-5 h-5" />
          )}
        </button>
      </div>
    </>
  );
}
