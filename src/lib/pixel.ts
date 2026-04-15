declare global {
  interface Window {
    fbq?: (
      action: string,
      eventOrId?: string,
      data?: Record<string, unknown>,
      options?: { eventID?: string }
    ) => void;
  }
}

const firedEvents = new Set<string>();

const STORAGE_PREFIX = "mp_evt:";

function sessionKey(eventId: string): string {
  return `${STORAGE_PREFIX}${eventId}`;
}

function clearClaim(eventId: string): void {
  firedEvents.delete(eventId);
  try {
    sessionStorage.removeItem(sessionKey(eventId));
  } catch {
    // ignore
  }
}

/**
 * Meta Pixel standard event with CAPI `eventID` deduplication.
 * sessionStorage (refresh-safe) + in-memory Set (runtime); claim-before-fire;
 * invalid IDs and missing fbq are skipped (dev-only warnings).
 */
export function trackEvent(
  eventName: string,
  data?: Record<string, unknown>,
  eventId?: string
): void {
  if (typeof window === "undefined") return;

  if (typeof eventId !== "string" || eventId.length === 0) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[Meta Pixel] trackEvent skipped: invalid or missing eventId",
        { eventName }
      );
    }
    return;
  }

  try {
    if (sessionStorage.getItem(sessionKey(eventId))) return;
  } catch {
    // sessionStorage unavailable — continue with Set-only dedupe
  }

  if (firedEvents.has(eventId)) return;

  const fbq = window.fbq;
  if (typeof fbq !== "function") {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[Meta Pixel] trackEvent skipped: fbq not ready",
        { eventName, eventID: eventId }
      );
    }
    return;
  }

  firedEvents.add(eventId);
  try {
    sessionStorage.setItem(sessionKey(eventId), "1");
  } catch {
    // ignore — Set still prevents duplicate fires this runtime
  }

  try {
    fbq("track", eventName, data ?? {}, { eventID: eventId });
  } catch {
    clearClaim(eventId);
    return;
  }

  if (process.env.NODE_ENV === "development") {
    console.debug("[Meta Pixel]", eventName, { eventID: eventId, data });
  }
}
