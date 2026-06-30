"use client";

import { useState } from "react";

type Key = "primaryColor" | "accentColor" | "bgColor" | "fgColor";
type Colors = Record<Key, string>;

// Light-only palettes (the site is light-theme by design). Click to apply, Save.
const PRESETS: { name: string; colors: Colors }[] = [
  { name: "Olive", colors: { primaryColor: "#6E7B3D", accentColor: "#98A86B", bgColor: "#FBF9F4", fgColor: "#3E2C1C" } },
  { name: "Slate", colors: { primaryColor: "#3F5E78", accentColor: "#9DB8CC", bgColor: "#F6F8FA", fgColor: "#24323D" } },
  { name: "Terracotta", colors: { primaryColor: "#B0603A", accentColor: "#E0A984", bgColor: "#FBF6F1", fgColor: "#3A2A20" } },
  { name: "Forest", colors: { primaryColor: "#2F6B4F", accentColor: "#93C2A8", bgColor: "#F6FAF7", fgColor: "#213028" } },
  { name: "Plum", colors: { primaryColor: "#6E4A6B", accentColor: "#BBA0B8", bgColor: "#FAF6F9", fgColor: "#322331" } },
];

const FIELDS: { key: Key; label: string }[] = [
  { key: "primaryColor", label: "Primary" },
  { key: "accentColor", label: "Accent" },
  { key: "bgColor", label: "Background" },
  { key: "fgColor", label: "Text" },
];

const valid = (c: string) => /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/.test(c);

export function ThemeColors({ initial }: { initial: Colors }) {
  const [colors, setColors] = useState<Colors>(initial);
  const set = (k: Key, v: string) => setColors((c) => ({ ...c, [k]: v }));

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs text-muted mb-2">Quick themes — click one to apply, then press Save changes.</p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => setColors(p.colors)}
              className="flex items-center gap-2 rounded-[var(--radius)] border border-line bg-[var(--card)] px-3 py-2 text-sm transition-colors hover:border-[color-mix(in_oklab,var(--brand)_45%,var(--line))]"
            >
              <span className="flex -space-x-1">
                {(["bgColor", "primaryColor", "accentColor", "fgColor"] as Key[]).map((k) => (
                  <span key={k} className="h-4 w-4 rounded-full border border-line" style={{ background: p.colors[k] }} />
                ))}
              </span>
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
        {FIELDS.map(({ key, label }) => (
          <div key={key}>
            <label className="mb-1.5 block text-sm font-medium">{label}</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={valid(colors[key]) ? colors[key] : "#000000"}
                onChange={(e) => set(key, e.target.value)}
                className="h-10 w-12 cursor-pointer rounded-lg border border-line bg-transparent p-0.5"
                aria-label={`${label} swatch`}
              />
              <input
                type="text"
                value={colors[key]}
                onChange={(e) => set(key, e.target.value)}
                spellCheck={false}
                className={`w-full rounded-lg border bg-[var(--card)] px-3 py-2.5 font-mono text-sm outline-none transition-colors ${
                  valid(colors[key]) ? "border-line focus:border-[color-mix(in_oklab,var(--brand)_55%,var(--line))]" : "border-red-400/60"
                }`}
              />
            </div>
            <input type="hidden" name={key} value={colors[key]} />
          </div>
        ))}
      </div>
    </div>
  );
}
