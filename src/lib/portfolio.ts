// Helpers for reading the JSON array fields stored on the portfolio models
// (TimelineYear, Experience). Kept tiny and defensive so a half-filled record
// never throws — missing data simply renders as empty/placeholder.

export function strArr(v: unknown): string[] {
  return Array.isArray(v)
    ? v.filter((x): x is string => typeof x === "string" && x.trim() !== "")
    : [];
}

export type Pair = { a: string; b: string };

/** Reads [{ [k0], [k1] }] rows (e.g. achievements title|description, stats label|value). */
export function pairArr(v: unknown, k0: string, k1: string): Pair[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((o) => {
      const obj = (o ?? {}) as Record<string, unknown>;
      return { a: String(obj[k0] ?? "").trim(), b: String(obj[k1] ?? "").trim() };
    })
    .filter((p) => p.a || p.b);
}

/** Up to two initials from a name, for image placeholders. */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

/** Pad/truncate a list to exactly n entries, filling gaps with a marked placeholder. */
export const ADD_DETAIL = "[ADD DETAIL]";
export function exactly(arr: string[], n: number): string[] {
  const out = arr.slice(0, n);
  while (out.length < n) out.push(ADD_DETAIL);
  return out;
}
