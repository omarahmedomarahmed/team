"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";

type Field = { name: string; label: string; type: string; required?: boolean; options?: string[] };

const DEFAULT_FIELDS: Field[] = [
  { name: "name", label: "Your name", type: "text", required: true },
  { name: "email", label: "Email", type: "email", required: true },
  { name: "phone", label: "Phone", type: "tel" },
  { name: "company", label: "Company", type: "text" },
  { name: "message", label: "Tell us about your business and what you want to modernize…", type: "textarea", required: true },
];

const fieldCls =
  "w-full rounded-lg bg-[var(--card)] border border-line px-4 py-3 text-sm outline-none focus:border-[color-mix(in_oklab,var(--brand)_55%,var(--line))] transition-colors";

export function ContactForm({ fields }: { fields?: Field[] }) {
  const list = fields && fields.length ? fields : DEFAULT_FIELDS;
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending");
    const form = e.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries());
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("failed");
      setState("done");
      form.reset();
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div className="card p-8 text-center">
        <span className="icon-badge mx-auto"><Icon name="check-circle" size={26} /></span>
        <h3 className="mt-4 font-semibold text-lg">Thank you — we’ll be in touch.</h3>
        <p className="mt-2 text-sm text-muted">Expect a reply within one business day.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card p-6 md:p-8 grid sm:grid-cols-2 gap-4">
      {list.map((f) => {
        const full = f.type === "textarea" || f.type === "select";
        const wrap = full ? "sm:col-span-2" : "";
        if (f.type === "textarea") {
          return (
            <div key={f.name} className={wrap}>
              <textarea name={f.name} required={f.required} rows={5} placeholder={f.label} className={fieldCls} />
            </div>
          );
        }
        if (f.type === "select") {
          return (
            <div key={f.name} className={wrap}>
              <select name={f.name} required={f.required} defaultValue="" className={fieldCls}>
                <option value="" disabled>
                  {f.label}
                </option>
                {(f.options || []).map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
          );
        }
        const inputType = f.type === "email" ? "email" : f.type === "tel" ? "tel" : "text";
        return (
          <div key={f.name} className={wrap}>
            <input name={f.name} type={inputType} required={f.required} placeholder={f.label} className={fieldCls} />
          </div>
        );
      })}

      {/* Honeypot */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      <div className="sm:col-span-2 flex items-center gap-4">
        <button type="submit" disabled={state === "sending"} className="btn btn-primary disabled:opacity-60">
          {state === "sending" ? "Sending…" : "Send message"}
        </button>
        {state === "error" ? (
          <span className="text-sm text-red-400">Something went wrong. Please try again.</span>
        ) : null}
      </div>
    </form>
  );
}
