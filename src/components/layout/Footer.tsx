"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Mail, Phone, MapPin } from "lucide-react";
import Link from "next/link";
import { storeApi } from "@/lib/api";
import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Linkedin,
  Music2,
  Globe,
  Link as LinkIcon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { StorePublic } from "@/types/api";
import {
  normalizeExternalUrl,
  orderedSocialEntries,
  socialLabel,
} from "@/lib/store-public-footer";

const SOCIAL_ICONS: Record<string, LucideIcon> = {
  facebook: Facebook,
  instagram: Instagram,
  twitter: Twitter,
  youtube: Youtube,
  linkedin: Linkedin,
  tiktok: Music2,
  pinterest: LinkIcon,
  website: Globe,
};

function SocialIcon({ platform }: { platform: string }) {
  const Icon = SOCIAL_ICONS[platform.toLowerCase()] ?? LinkIcon;
  return <Icon className="w-5 h-5" aria-hidden />;
}

export function Footer({ storePublic }: { storePublic: StorePublic | null }) {
  const pathname = usePathname();
  const [data, setData] = useState<StorePublic | null>(storePublic);

  const refresh = useCallback(() => {
    storeApi
      .getPublic()
      .then((d) => setData(d))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setData(storePublic);
  }, [storePublic]);

  useEffect(() => {
    refresh();
  }, [refresh, pathname]);

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [refresh]);

  const address = data?.address?.trim() ?? "";
  const email = data?.support_email?.trim() ?? "";
  const phone = data?.phone?.trim() ?? "";
  const storeName = data?.store_name?.trim() ?? "AP Brand Store";
  const socialList = orderedSocialEntries(data?.social_links);

  return (
    <footer className="bg-white border-t-2 border-red-600 pb-8 md:pb-4">
      {/* Match Navbar: `container mx-auto px-4` for identical horizontal edges */}
      <div className="container mx-auto px-4 pt-12 pb-2 md:pb-4">
        <div
          className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-x-8 lg:gap-y-10 lg:items-start mb-10"
        >
          <div className="min-w-0 md:col-span-2 lg:col-span-1">
            <h3 className="text-lg font-bold uppercase mb-4 text-black">
              Contact
            </h3>
            <div className="space-y-3 text-sm text-black">
              {address ? (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">ADDRESS</span>
                    <p className="mt-1 whitespace-pre-wrap">{address}</p>
                  </div>
                </div>
              ) : null}
              {email ? (
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">EMAIL</span>
                    <p className="mt-1">
                      <a
                        href={`mailto:${email}`}
                        className="hover:text-red-600 transition-colors break-all"
                      >
                        {email}
                      </a>
                    </p>
                  </div>
                </div>
              ) : null}
              {phone ? (
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">PHONE</span>
                    <p className="mt-1">
                      <a
                        href={`tel:${phone.replace(/\s/g, "")}`}
                        className="hover:text-red-600 transition-colors"
                      >
                        {phone}
                      </a>
                    </p>
                  </div>
                </div>
              ) : null}
              {!data && (
                <p className="text-gray-500 text-sm">
                  Store contact details could not be loaded.
                </p>
              )}
              {data && !address && !email && !phone && (
                <p className="text-gray-500 text-sm">
                  No address, email, or phone configured for this store.
                </p>
              )}
            </div>
          </div>

          <div className="min-w-0">
            <h3 className="text-lg font-bold uppercase mb-4 text-black">
              Customer
            </h3>
            <nav className="space-y-2 text-sm" aria-label="Customer">
              <Link
                href="/account"
                className="block text-black hover:text-red-600 transition-colors"
              >
                Account
              </Link>
              <Link
                href="/cart"
                className="block text-black hover:text-red-600 transition-colors"
              >
                Cart
              </Link>
              <Link
                href="/wishlist"
                className="block text-black hover:text-red-600 transition-colors"
              >
                Wishlist
              </Link>
              <Link
                href="/blog"
                className="block text-black hover:text-red-600 transition-colors"
              >
                Blog
              </Link>
            </nav>
          </div>

          <div className="min-w-0">
            <h3 className="text-lg font-bold uppercase mb-4 text-black">
              Information
            </h3>
            <nav className="space-y-2 text-sm" aria-label="Information">
              <Link
                href="/about-us"
                className="block text-black hover:text-red-600 transition-colors"
              >
                About us
              </Link>
              <Link
                href="/contact-us"
                className="block text-black hover:text-red-600 transition-colors"
              >
                Contact Us
              </Link>
              {data?.policy_urls?.privacy ? (
                <a
                  href={normalizeExternalUrl(data.policy_urls.privacy)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-black hover:text-red-600 transition-colors"
                >
                  Privacy Policy
                </a>
              ) : (
                <Link
                  href="/privacy-policy"
                  className="block text-black hover:text-red-600 transition-colors"
                >
                  Privacy Policy
                </Link>
              )}
              {data?.policy_urls?.refund || data?.policy_urls?.returns ? (
                <a
                  href={normalizeExternalUrl(
                    data.policy_urls.refund || data.policy_urls.returns!
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-black hover:text-red-600 transition-colors"
                >
                  Return & Refund
                </a>
              ) : (
                <Link
                  href="/refund-policy"
                  className="block text-black hover:text-red-600 transition-colors"
                >
                  Return & Refund
                </Link>
              )}
              <Link
                href="/cancellation-policy"
                className="block text-black hover:text-red-600 transition-colors"
              >
                Cancellation Policy
              </Link>
            </nav>
          </div>

          <div className="min-w-0 md:col-span-2 lg:col-span-1">
            <h3 className="text-lg font-bold uppercase mb-4 text-black">
              Social links
            </h3>
            {socialList.length > 0 ? (
              <div className="flex flex-wrap items-center gap-3">
                {socialList.map(({ key, url }) => (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer-icon-btn inline-flex items-center justify-center w-11 h-11 rounded-full border border-gray-200 bg-gray-50 text-gray-700 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors"
                    aria-label={socialLabel(key)}
                    title={socialLabel(key)}
                  >
                    <SocialIcon platform={key} />
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                {data
                  ? "No social links configured."
                  : "Social links unavailable."}
              </p>
            )}
          </div>
        </div>

        <div className="pt-8">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} {storeName}. All rights reserved. |
            Developed by{" "}
            <a
              href="https://www.mushfikurahmaan.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-gray-700 hover:text-green-600 transition-colors"
            >
              Mushfikur Rahman
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
