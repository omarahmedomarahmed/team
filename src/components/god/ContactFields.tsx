"use client";

import { useState } from "react";

export type ContactField = {
  label: string;
  type: string; // text | email | tel | textarea | select
  required: boolean;
  options?: string; // comma separated, for select
};

const DEFAULT: ContactField[] = [
  { label: "Name", type: "text", required: true },
  { label: "Email", type: "email", required: true },
  { label: "Phone", type: "tel", required: false },
  { label: "Company", type: "text", required: false },
  { label: "Message", type: "textarea", required: true },
];

const inputCls =
  "w-full rounded-lg bg-[var(--card)] border border-line px-3 py-2 text-sm outline-none focus:border-[color-mix(in_oklab,var(--brand)_55%,var(--line))]";

function slug(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "_").replace(/(^_|_$)/g, "") || "field";
}

export function ContactFields({ value }: { value: ContactField[] }) {
  const [fields, setFields] = useState<ContactField[]>(value && value.length ? value : DEFAULT);

  const update = (i: number, patch: Partial<ContactField>) =>
    setFields((p) => p.map((f, j) => (j === i ? { ...f, ...patch } : f)));
  const remove = (i: number) => setFields((p) => p.filter((_, j) => j !== i));
  const add = () => setFields((p) => [...p, { label: "New field", type: "text", required: false }]);

  const serialized = JSON.stringify(
    fields.map((f) => ({
      name: slug(f.label),
      label: f.label,
      type: f.type,
      required: f.required,
      options:
        f.type === "select"
          ? (f.options || "").split(",").map((s) => s.trim()).filter(Boolean)
          : undefined,
    })),
  );

  return (
    <div>
      <input type="hidden" name="contactFields" value={serialized} />
      <div className="space-y-2">
        {fields.map((f, i) => (
          <div key={i} className="card p-3 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <input
                value={f.label}
                onChange={(e) => update(i, { label: e.target.value })}
                placeholder="Field label"
                className={`${inputCls} flex-1 min-w-[8rem]`}
              />
              <select value={f.type} onChange={(e) => update(i, { type: e.target.value })} className={`${inputCls} w-auto`}>
                <option value="text">Text</option>
                <option value="email">Email</option>
                <option value="tel">Phone</option>
                <option value="textarea">Paragraph</option>
                <option value="select">Dropdown</option>
              </select>
              <label className="text-xs flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={f.required} onChange={(e) => update(i, { required: e.target.checked })} className="h-3.5 w-3.5 accent-[var(--brand)]" />
                Required
              </label>
              <button type="button" onClick={() => remove(i)} className="text-muted hover:text-red-400 text-lg leading-none px-1" aria-label="Remove">
                ×
              </button>
            </div>
            {f.type === "select" ? (
              <input
                value={f.options || ""}
                onChange={(e) => update(i, { options: e.target.value })}
                placeholder="Dropdown options, comma separated"
                className={inputCls}
              />
            ) : null}
          </div>
        ))}
      </div>
      <button type="button" onClick={add} className="btn btn-ghost mt-3 text-sm py-2">
        Add field
      </button>
    </div>
  );
}
