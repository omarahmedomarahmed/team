"use client";

import { useState } from "react";
import { US_STATES } from "@/lib/usStates";

export function ServiceAreas({ name, value }: { name: string; value: string[] }) {
  const [all, setAll] = useState(value.length === 0 || value.includes("ALL"));
  const [sel, setSel] = useState<string[]>(value.filter((v) => v !== "ALL"));

  const out = all ? ["ALL"] : sel;

  function toggle(code: string) {
    setSel((p) => (p.includes(code) ? p.filter((c) => c !== code) : [...p, code]));
  }

  return (
    <div>
      <input type="hidden" name={name} value={out.join(",")} />
      <label className="inline-flex items-center gap-2 cursor-pointer select-none text-sm mb-3">
        <input type="checkbox" checked={all} onChange={(e) => setAll(e.target.checked)} className="h-4 w-4 accent-[var(--brand)]" />
        Serve all US states
      </label>
      {!all ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1.5 max-h-64 overflow-y-auto card p-3">
          {US_STATES.map((s) => (
            <label key={s.code} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={sel.includes(s.code)}
                onChange={() => toggle(s.code)}
                className="h-3.5 w-3.5 accent-[var(--brand)]"
              />
              <span className="truncate">{s.name}</span>
            </label>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted">Uncheck “Serve all US states” to pick specific states.</p>
      )}
    </div>
  );
}
