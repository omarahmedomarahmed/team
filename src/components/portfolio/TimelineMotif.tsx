/**
 * The "timeline motif" (spec 4.9): a thin olive rail that runs down the career
 * timeline and visually thickens as it progresses — drawn as a tapered shape so
 * it grows from a hairline at the top to a few px at the bottom. Year-block
 * nodes sit on top of it; the open arrow at the end lives in Timeline.tsx.
 * Purely decorative — no motion, so it is inherently reduced-motion safe.
 */
export function TimelineMotif() {
  return (
    <div aria-hidden className="pointer-events-none absolute left-0 top-1 bottom-8 w-10">
      <svg className="h-full w-full" viewBox="0 0 40 1000" preserveAspectRatio="none">
        <polygon points="19.6,0 20.4,0 22.7,1000 17.3,1000" fill="var(--brand)" opacity="0.85" />
      </svg>
    </div>
  );
}
