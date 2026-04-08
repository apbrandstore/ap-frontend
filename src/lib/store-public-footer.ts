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
