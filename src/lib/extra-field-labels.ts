/** Resolve `extra_data` keys to labels using `GET /store/public/` `extra_field_schema`. */
export function labelForExtraFieldKey(
  key: string,
  schema: unknown[]
): string {
  if (!Array.isArray(schema)) return humanizeKey(key);
  for (const entry of schema) {
    const o = entry as { id?: string; name?: string; entityType?: string };
    if (o?.id === key && typeof o.name === "string" && o.name.trim()) {
      if (o.entityType && o.entityType !== "product") continue;
      return o.name;
    }
  }
  return humanizeKey(key);
}

function humanizeKey(key: string): string {
  const s = key.replace(/[_-]+/g, " ").trim();
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : key;
}

export function entriesForExtraData(
  extraData: Record<string, unknown> | undefined,
  schema: unknown[]
): { key: string; label: string; value: string }[] {
  if (!extraData) return [];
  return Object.entries(extraData).map(([key, val]) => ({
    key,
    label: labelForExtraFieldKey(key, schema),
    value:
      val === null || val === undefined
        ? ""
        : typeof val === "object"
          ? JSON.stringify(val)
          : String(val),
  }));
}
