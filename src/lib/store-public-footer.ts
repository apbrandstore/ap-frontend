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

const BD_CC = "880";

function rawDigits(s: string): string {
  let d = s.replace(/\D/g, "");
  while (d.startsWith("00") && d.length > 2) d = d.slice(2);
  return d;
}

/**
 * Bangladesh store: `wa.me` / WhatsApp `phone` params must be E.164 without `+` (e.g. 8801…).
 * Accepts local `01…` or national `1…` and prefixes 880; leaves numbers that already start with 880.
 */
function normalizeWhatsappDigitsBD(s: string): string {
  let d = rawDigits(s);
  if (!d) return "";
  if (d.startsWith(BD_CC)) return d;
  if (d.startsWith("0") && d.length > 1) d = d.slice(1);
  if (!d) return "";
  if (d.startsWith(BD_CC)) return d;
  return `${BD_CC}${d}`;
}

function isAcceptableBDDigits(d: string): boolean {
  if (d.length < 8) return false;
  if (!d.startsWith(BD_CC) || d.length < BD_CC.length + 1) return false;
  return true;
}

function extractDigitsFromWhatsappHref(href: string): string | null {
  const wa = /wa\.me\/(\d+)/i.exec(href);
  if (wa?.[1]) return wa[1];
  const p = /[?&]phone=([^&\s#]+)/i.exec(href);
  if (p?.[1]) {
    const decoded = decodeURIComponent(p[1].replace(/\+/g, ""));
    const digits = rawDigits(decoded);
    if (digits.length) return digits;
  }
  return null;
}

/** Add/replace 880 in wa.me, api.whatsapp.com send, and whatsapp: send?phone= URLs. */
function withBangladeshWhatsappInHref(href: string): string {
  if (/^whatsapp:\/\//i.test(href)) {
    return href.replace(/([?&])phone=([^&\s#]+)/gi, (match, pre, v) => {
      const d = rawDigits(decodeURIComponent(String(v).replace(/\+/g, "")));
      if (!d) return match;
      return `${pre}phone=${encodeURIComponent(normalizeWhatsappDigitsBD(d))}`;
    });
  }
  try {
    const u = new URL(
      href.startsWith("http://") || href.startsWith("https://")
        ? href
        : `https://${href.replace(/^\/\//, "https://")}`,
    );
    const host = u.hostname.toLowerCase();
    if (host === "api.whatsapp.com" && (u.pathname === "/send" || u.pathname === "/message")) {
      const ph = u.searchParams.get("phone");
      if (ph) {
        u.searchParams.set("phone", normalizeWhatsappDigitsBD(rawDigits(ph)));
        return u.toString();
      }
    }
    if (host === "wa.me" || host.endsWith(".wa.me")) {
      const m = u.pathname.match(/^\/(\d+)/);
      if (m?.[1]) {
        const n = normalizeWhatsappDigitsBD(m[1]);
        u.pathname = u.pathname.replace(/^\d+/, n);
        return u.toString();
      }
    }
  } catch {
    // leave href unchanged
  }
  return href;
}

function waDisplayLabel(
  phone: string,
  href: string,
  fallback: string
): string {
  const p = phone.trim();
  if (p) {
    const n = normalizeWhatsappDigitsBD(p);
    if (isAcceptableBDDigits(n)) return n;
  }
  const fromHref = extractDigitsFromWhatsappHref(href);
  if (fromHref) {
    const n = normalizeWhatsappDigitsBD(fromHref);
    if (isAcceptableBDDigits(n)) return n;
  }
  const d = normalizeWhatsappDigitsBD(fallback);
  return isAcceptableBDDigits(d) ? d : "WhatsApp";
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
      lower.startsWith("whatsapp:") ||
      lower.startsWith("//")
    ) {
      const href = withBangladeshWhatsappInHref(
        normalizeExternalUrl(fromSocial),
      );
      return {
        href,
        label: waDisplayLabel(store.phone ?? "", href, fromSocial),
      };
    }
    const digits = normalizeWhatsappDigitsBD(fromSocial);
    if (isAcceptableBDDigits(digits)) {
      const href = `https://wa.me/${digits}`;
      return {
        href,
        label: waDisplayLabel(store.phone ?? "", href, fromSocial),
      };
    }
  }

  const phone = store.phone?.trim() ?? "";
  const digits = normalizeWhatsappDigitsBD(phone);
  if (!isAcceptableBDDigits(digits)) return null;
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
