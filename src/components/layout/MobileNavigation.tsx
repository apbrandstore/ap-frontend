'use client';

import { useState, useEffect, useRef } from 'react';
import { Phone, MessageCircle, X, MessagesSquare } from 'lucide-react';

const WHATSAPP_NUMBER = '8801862641734';
const PHONE_NUMBER = '+8801862641734';

export function MobileNavigation() {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const contactRef = useRef<HTMLDivElement>(null);

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

  return (
    <>
      {/* Contact Us Speed-Dial FAB - mobile only */}
      <div
        ref={contactRef}
        className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3 md:hidden"
      >
        {/* Sub-buttons — visible when open */}
        {isContactOpen && (
          <>
            {/* Call */}
            <a
              href={`tel:${PHONE_NUMBER}`}
              className="flex items-center gap-2 bg-black text-white pl-3 pr-4 py-2.5 rounded-full shadow-lg text-sm font-medium hover:bg-gray-800 transition-colors"
              aria-label="Call us"
              onClick={() => setIsContactOpen(false)}
            >
              <Phone className="w-4 h-4 flex-shrink-0" />
              Call
            </a>
            {/* WhatsApp */}
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#25D366] text-white pl-3 pr-4 py-2.5 rounded-full shadow-lg text-sm font-medium hover:bg-[#20bd5a] transition-colors"
              aria-label="Chat on WhatsApp"
              onClick={() => setIsContactOpen(false)}
            >
              <MessageCircle className="w-4 h-4 flex-shrink-0" />
              WhatsApp
            </a>
          </>
        )}

        {/* Main Contact Us toggle button */}
        <button
          onClick={() => setIsContactOpen((prev) => !prev)}
          className="w-14 h-14 rounded-full bg-black text-white shadow-lg flex items-center justify-center hover:bg-gray-800 transition-all"
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
