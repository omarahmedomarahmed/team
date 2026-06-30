/**
 * Subtle branded backdrop for hero sections — a soft aurora of the brand and
 * accent colors plus a faint blueprint grid (spec 4.8). Theme-following (uses
 * the CSS tokens), so it tracks the branding settings. Sits behind hero content
 * and is replaced when a real background image is uploaded.
 */
export function HeroBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(46rem 30rem at 86% -12%, color-mix(in oklab, var(--brand) 22%, transparent), transparent 60%)," +
            "radial-gradient(40rem 28rem at -6% 112%, color-mix(in oklab, var(--accent) 30%, transparent), transparent 60%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-60 hidden md:block"
        style={{
          backgroundImage:
            "linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
          WebkitMaskImage: "radial-gradient(72% 70% at 80% 8%, #000, transparent 76%)",
          maskImage: "radial-gradient(72% 70% at 80% 8%, #000, transparent 76%)",
        }}
      />
    </div>
  );
}
