/** Shared storefront API origin and auth (browser + server). */

export const STOREFRONT_API_ORIGIN =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "";

/** Publishable key (`ak_pk_…`) — must be `NEXT_PUBLIC_*` for browser usage. */
export function storefrontPublishableKeyPublic(): string {
  return process.env.NEXT_PUBLIC_PUBLISHABLE_KEY || "";
}

/**
 * Django uses trailing slashes on routes (APPEND_SLASH). Ensures `pathname` ends with `/`.
 * Use for full URL pathnames (e.g. from `NextRequest.nextUrl.pathname`), not query strings.
 */
export function ensurePathnameTrailingSlash(pathname: string): string {
  if (pathname.endsWith("/")) return pathname;
  return `${pathname}/`;
}

/**
 * Path relative to `/api/v1` (e.g. `/banners/` or `/search/?trending=1`).
 * Ensures a trailing `/` on the path segment before `?` so list endpoints match Django.
 */
function v1SubpathWithTrailingSlash(path: string): string {
  const raw = path.startsWith("/") ? path : `/${path}`;
  const qi = raw.indexOf("?");
  const pathPart = qi >= 0 ? raw.slice(0, qi) : raw;
  const query = qi >= 0 ? raw.slice(qi) : "";
  if (pathPart.length === 0) return query;
  const fixed = pathPart.endsWith("/") ? pathPart : `${pathPart}/`;
  return `${fixed}${query}`;
}

export function storefrontV1Url(path: string): string {
  return `${STOREFRONT_API_ORIGIN}/api/v1${v1SubpathWithTrailingSlash(path)}`;
}

export function storefrontAuthHeaders(): Record<string, string> {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  const key = storefrontPublishableKeyPublic();
  if (key) {
    h.Authorization = `Bearer ${key}`;
  }
  return h;
}
