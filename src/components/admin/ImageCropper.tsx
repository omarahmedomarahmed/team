"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Fit-to-placeholder image editor. The frame is drawn at the exact aspect ratio
 * the image uses on the site (the "size guide"); the user drags to reposition
 * and zooms with the slider or scroll wheel. On confirm it renders the visible
 * frame to a canvas and returns a cropped blob sized to that placeholder.
 *
 * fit="cover"  → image fills the frame (covers/crops) — covers, showcases, photos.
 * fit="contain"→ whole image fits with transparent padding — logos.
 */
export function ImageCropper({
  src,
  aspect,
  fit = "cover",
  busy = false,
  onCancel,
  onDone,
}: {
  src: string;
  aspect: number;
  fit?: "cover" | "contain";
  busy?: boolean;
  onCancel: () => void;
  onDone: (blob: Blob, filename: string) => void;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  const [nat, setNat] = useState<{ w: number; h: number } | null>(null);
  const [frame, setFrame] = useState({ w: 0, h: 0 });
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const measure = () => setFrame({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const base =
    nat && frame.w
      ? fit === "contain"
        ? Math.min(frame.w / nat.w, frame.h / nat.h)
        : Math.max(frame.w / nat.w, frame.h / nat.h)
      : 1;
  const scale = base * zoom;
  const dw = nat ? nat.w * scale : 0;
  const dh = nat ? nat.h * scale : 0;

  const clamp = useCallback(
    (o: { x: number; y: number }) => {
      if (fit === "contain") return o; // free positioning for logos
      const maxX = Math.max(0, (dw - frame.w) / 2);
      const maxY = Math.max(0, (dh - frame.h) / 2);
      return { x: Math.min(maxX, Math.max(-maxX, o.x)), y: Math.min(maxY, Math.max(-maxY, o.y)) };
    },
    [dw, dh, frame.w, frame.h, fit],
  );

  // Change zoom and re-clamp the offset so the image can't leave the frame
  // (for cover). Done here rather than in an effect to avoid cascading renders.
  function applyZoom(nz: number) {
    const z = Math.min(5, Math.max(1, nz));
    setZoom(z);
    if (fit === "cover" && nat && frame.w) {
      const ndw = nat.w * base * z;
      const ndh = nat.h * base * z;
      const maxX = Math.max(0, (ndw - frame.w) / 2);
      const maxY = Math.max(0, (ndh - frame.h) / 2);
      setOffset((o) => ({ x: Math.min(maxX, Math.max(-maxX, o.x)), y: Math.min(maxY, Math.max(-maxY, o.y)) }));
    }
  }

  function down(e: React.PointerEvent) {
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
  }
  function move(e: React.PointerEvent) {
    if (!drag.current) return;
    setOffset(clamp({ x: drag.current.ox + (e.clientX - drag.current.x), y: drag.current.oy + (e.clientY - drag.current.y) }));
  }
  function up() {
    drag.current = null;
  }
  function wheel(e: React.WheelEvent) {
    applyZoom(zoom - e.deltaY * 0.0015);
  }

  function confirm() {
    const img = imgRef.current;
    if (!nat || !img || !frame.w) return;
    const MAX = 1400;
    const outW = aspect >= 1 ? MAX : Math.round(MAX * aspect);
    const outH = aspect >= 1 ? Math.round(MAX / aspect) : MAX;
    const f = outW / frame.w;
    const canvas = document.createElement("canvas");
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return onCancel();
    const left = (frame.w - dw) / 2 + offset.x;
    const top = (frame.h - dh) / 2 + offset.y;
    ctx.drawImage(img, left * f, top * f, dw * f, dh * f);
    const png = fit === "contain";
    canvas.toBlob(
      (b) => (b ? onDone(b, png ? "image.png" : "image.jpg") : onCancel()),
      png ? "image/png" : "image/jpeg",
      0.9,
    );
  }

  return (
    <div className="space-y-3 rounded-lg border border-line bg-[var(--card)] p-3">
      <div
        ref={frameRef}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerLeave={up}
        onWheel={wheel}
        className="relative mx-auto w-full max-w-md cursor-move touch-none select-none overflow-hidden rounded-lg border border-line bg-[var(--bg-2)]"
        style={{ aspectRatio: String(aspect) }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          src={src}
          alt=""
          draggable={false}
          onLoad={(e) => setNat({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
          className="pointer-events-none absolute left-1/2 top-1/2 max-w-none"
          style={{ width: dw, height: dh, transform: `translate(-50%,-50%) translate(${offset.x}px, ${offset.y}px)` }}
        />
        <div className="pointer-events-none absolute inset-0 rounded-lg ring-1 ring-inset ring-white/40" />
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs text-muted">Zoom</span>
        <input
          type="range"
          min={1}
          max={5}
          step={0.01}
          value={zoom}
          onChange={(e) => applyZoom(Number(e.target.value))}
          className="flex-1 accent-[var(--brand)]"
        />
      </div>
      <p className="text-center text-xs text-muted">
        This frame is exactly how the image appears on your site. Drag to reposition · scroll or slide to zoom.
      </p>
      <div className="flex items-center gap-2">
        <button type="button" onClick={confirm} disabled={busy || !nat} className="btn btn-primary text-sm py-2">
          {busy ? "Uploading…" : "Use this crop"}
        </button>
        <button type="button" onClick={onCancel} disabled={busy} className="btn btn-ghost text-sm py-2">
          Cancel
        </button>
      </div>
    </div>
  );
}
