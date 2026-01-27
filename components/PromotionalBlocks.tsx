'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface PromoBlock {
  title: string;
  emoji: string;
  image: string;
  href: string;
}

const promotionalBlocks: PromoBlock[] = [
  {
    title: 'New Drops',
    emoji: '🔥',
    image: '/api/placeholder/400/500',
    href: '/products?filter=new',
  },
  {
    title: 'Premium Stone Wash',
    emoji: '✨',
    image: '/api/placeholder/400/500',
    href: '/products?filter=stone-wash',
  },
  {
    title: 'Flash Sale',
    emoji: '⚡',
    image: '/api/placeholder/400/500',
    href: '/products?filter=sale',
  },
];

export function PromotionalBlocks() {
  return (
    <section className="bg-gray-100 py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {promotionalBlocks.map((block, index) => (
            <Link
              key={index}
              href={block.href}
              className="group relative overflow-hidden bg-white rounded-lg transition-transform hover:scale-105"
            >
              <div className="aspect-[4/5] bg-gray-200 relative overflow-hidden">
                {/* Placeholder for product image */}
                <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                  <span className="text-gray-500 text-sm">Product Image</span>
                </div>
              </div>
              <div className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 text-black font-medium text-lg group-hover:gap-4 transition-all">
                  <span>{block.title}</span>
                  <span>{block.emoji}</span>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

