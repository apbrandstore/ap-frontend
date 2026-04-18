/** Helpers for footer contact + social_links from GET /api/v1/store/public/ */

const SOCIAL_ORDER = [
  "facebook",
  "instagram",
  "twitter",
  "youtube",
  "linkedin",
  "tiktok",
  "pinterest",
  "website",
] as const;

export function normalizeExternalUrl(raw: string): string {
  const u = raw.trim();
  if (!u) return "";
  if (/^https?:\/\//i.test(u)) return u;
  if (u.startsWith("//")) return `https:${u}`;
  if (u.startsWith("mailto:") || u.startsWith("tel:")) return u;
  return `https://${u}`;
}

export function orderedSocialEntries(
  socialLinks: Record<string, string> | undefined
): { key: string; url: string }[] {
  if (!socialLinks || typeof socialLinks !== "object") return [];
  const entries = Object.entries(socialLinks)
    .map(([key, url]) => ({
      key: key.toLowerCase(),
      url: normalizeExternalUrl(String(url ?? "")),
    }))
    .filter((e) => e.url.length > 0);

  entries.sort((a, b) => {
    const ia = SOCIAL_ORDER.indexOf(a.key as (typeof SOCIAL_ORDER)[number]);
    const ib = SOCIAL_ORDER.indexOf(b.key as (typeof SOCIAL_ORDER)[number]);
    if (ia === -1 && ib === -1) return a.key.localeCompare(b.key);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });

  return entries;
}

export function socialLabel(key: string): string {
  const k = key.toLowerCase();
  const map: Record<string, string> = {
    facebook: "Facebook",
    instagram: "Instagram",
    twitter: "Twitter",
    youtube: "YouTube",
    linkedin: "LinkedIn",
    tiktok: "TikTok",
    pinterest: "Pinterest",
    website: "Website",
  };
  return map[k] ?? key.charAt(0).toUpperCase() + key.slice(1);
}

function socialLinkValue(
  socialLinks: Record<string, string> | undefined,
  key: string
): string {
  if (!socialLinks || typeof socialLinks !== "object") return "";
  const want = key.toLowerCase();
  for (const [k, v] of Object.entries(socialLinks)) {
    if (k.toLowerCase() === want) return String(v ?? "").trim();
  }
  return "";
}

function digitsForWhatsApp(s: string): string {
  const d = s.replace(/\D/g, "");
  if (d.startsWith("00")) return d.slice(2);
  return d;
}

function waDisplayLabel(
  phone: string,
  href: string,
  fallback: string
): string {
  const p = phone.trim();
  if (p) return p;
  const m = href.match(/wa\.me\/(\d+)/i);
  if (m?.[1]) return m[1];
  const d = digitsForWhatsApp(fallback);
  return d.length >= 8 ? d : "WhatsApp";
}

/** `wa.me` URL + label from GET /store/public/ (whatsapp social link or `phone`). */
export function storeWhatsappAction(
  store: { phone: string; social_links: Record<string, string> } | null | undefined
): { href: string; label: string } | null {
  if (!store) return null;

  const fromSocial = socialLinkValue(store.social_links, "whatsapp");
  if (fromSocial) {
    const lower = fromSocial.toLowerCase();
    if (
      lower.startsWith("http://") ||
      lower.startsWith("https://") ||
      lower.startsWith("whatsapp:")
    ) {
      const href = normalizeExternalUrl(fromSocial);
      return {
        href,
        label: waDisplayLabel(store.phone ?? "", href, fromSocial),
      };
    }
    const digits = digitsForWhatsApp(fromSocial);
    if (digits.length >= 8) {
      const href = `https://wa.me/${digits}`;
      return {
        href,
        label: waDisplayLabel(store.phone ?? "", href, fromSocial),
      };
    }
  }

  const phone = store.phone?.trim() ?? "";
  const digits = digitsForWhatsApp(phone);
  if (digits.length < 8) return null;
  const href = `https://wa.me/${digits}`;
  return { href, label: waDisplayLabel(phone, href, phone) };
}

/** `tel:` href from `phone` on GET /store/public/ (digits required). */
export function storeTelHref(
  store: { phone: string } | null | undefined
): string | null {
  const p = store?.phone?.trim() ?? "";
  if (!p || !/\d/.test(p)) return null;
  return `tel:${p.replace(/\s/g, "")}`;
}
