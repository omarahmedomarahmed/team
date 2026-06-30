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
 * plus a warm light readability wash so dark (chocolate) text stays legible.
 * Video uses a poster for instant paint. No background = no wrapper overhead.
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

      {/* warm light wash for legibility (chocolate text on light) */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: `linear-gradient(180deg, color-mix(in oklab, var(--bg) ${Math.round(
            o * 100,
          )}%, transparent) 0%, color-mix(in oklab, var(--bg) ${Math.round(
            Math.min(1, o + 0.14) * 100,
          )}%, transparent) 100%)`,
        }}
      />
      {children}
    </div>
  );
}
