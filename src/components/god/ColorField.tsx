"use client";

import { useState } from "react";

export function ColorField({ name, label, value }: { name: string; label: string; value: string }) {
  const [color, setColor] = useState(value || "#000000");
  const valid = /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/.test(color);
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={valid ? color : "#000000"}
          onChange={(e) => setColor(e.target.value)}
          className="h-10 w-12 rounded-lg bg-transparent border border-line cursor-pointer p-0.5"
          aria-label={`${label} swatch`}
        />
        <input
          type="text"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          spellCheck={false}
          className={`w-full rounded-lg bg-[var(--card)] border px-3 py-2.5 text-sm font-mono outline-none transition-colors ${
            valid ? "border-line focus:border-[color-mix(in_oklab,var(--brand)_55%,var(--line))]" : "border-red-400/60"
          }`}
          placeholder="#7c3aed"
        />
      </div>
      <input type="hidden" name={name} value={color} />
    </div>
  );
}
