import { Icon } from "@/components/ui/Icon";

// Deterministic branded "cover art" for image slots that haven't been uploaded
// yet — no stock photos. The look is seeded from a key (slug/title) so the SAME
// item renders the SAME art on the timeline, its case study, and its portfolio
// item. Colors use the theme tokens, so it follows the branding settings.
function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function Placeholder({ label, initials, seed }: { label?: string; initials?: string; seed?: string }) {
  const h = hash(seed || initials || label || "x");
  const angle = 90 + (h % 120) - 60;
  const x1 = 12 + (h % 46);
  const y1 = 8 + ((h >> 3) % 40);
  const x2 = 58 + ((h >> 5) % 34);
  const y2 = 52 + ((h >> 7) % 36);
  const background =
    `radial-gradient(60% 70% at ${x1}% ${y1}%, color-mix(in oklab, var(--brand) 42%, transparent), transparent 70%),` +
    `radial-gradient(55% 65% at ${x2}% ${y2}%, color-mix(in oklab, var(--accent) 52%, transparent), transparent 72%),` +
    `linear-gradient(${angle}deg, color-mix(in oklab, var(--brand) 20%, var(--bg)), color-mix(in oklab, var(--accent) 24%, var(--bg)))`;

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden" style={{ background }}>
      <div
        aria-hidden
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "linear-gradient(color-mix(in oklab, var(--fg) 9%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in oklab, var(--fg) 9%, transparent) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      {initials ? (
        <span className="relative text-4xl font-bold tracking-wide" style={{ color: "color-mix(in oklab, var(--fg) 55%, transparent)" }}>
          {initials}
        </span>
      ) : (
        <span className="relative inline-flex items-center gap-2 rounded-[var(--radius)] border border-line bg-[var(--card)] px-3 py-1.5 text-xs font-medium text-fg">
          <Icon name="layers" size={14} className="text-brand" /> {label || "Visual"}
        </span>
      )}
    </div>
  );
}
