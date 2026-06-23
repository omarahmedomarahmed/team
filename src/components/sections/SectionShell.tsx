/* eslint-disable @next/next/no-img-element */
import type { ReactNode } from "react";

export type SectionBg = {
  bgImageUrl?: string | null;
  bgVideoUrl?: string | null;
  bgPosterUrl?: string | null;
  bgOverlay?: number | null;
};

/**
 * Wraps a section with an optional background (image or muted autoplay video)
 * plus a readability overlay and brand glow. Video uses a poster for instant,
 * seamless paint while it loads. No background = no wrapper overhead.
 */
export function SectionShell({
  bg,
  children,
  className = "",
}: {
  bg: SectionBg;
  children: ReactNode;
  className?: string;
}) {
  const hasBg = Boolean(bg.bgImageUrl || bg.bgVideoUrl);
  if (!hasBg) return <div className={className}>{children}</div>;

  const o = Math.max(0, Math.min(100, bg.bgOverlay ?? 72)) / 100;

  return (
    <div className={`relative isolate overflow-hidden ${className}`}>
      {bg.bgVideoUrl ? (
        <video
          className="absolute inset-0 -z-20 h-full w-full object-cover bg-video"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={bg.bgPosterUrl ?? undefined}
        >
          <source src={bg.bgVideoUrl} />
        </video>
      ) : (
        <img
          src={bg.bgImageUrl ?? ""}
          alt=""
          className="absolute inset-0 -z-20 h-full w-full object-cover"
        />
      )}

      {/* darken for legibility */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: `linear-gradient(180deg, rgba(8,7,17,${o}) 0%, rgba(8,7,17,${Math.min(
            1,
            o + 0.14,
          )}) 100%)`,
        }}
      />
      {/* brand glow */}
      <div
        className="absolute inset-0 -z-10 opacity-70"
        style={{
          background:
            "radial-gradient(55rem 38rem at 82% -5%, color-mix(in oklab, var(--brand) 30%, transparent), transparent 60%)",
        }}
      />
      {children}
    </div>
  );
}
