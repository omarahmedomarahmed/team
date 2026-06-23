"use client";

import { useFormStatus } from "react-dom";
import { generatePostAction } from "@/lib/god/actions";

const inputCls =
  "w-full rounded-lg bg-[var(--card)] border border-line px-3.5 py-2.5 text-sm outline-none focus:border-[color-mix(in_oklab,var(--brand)_55%,var(--line))] transition-colors";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn btn-primary disabled:opacity-60">
      {pending ? "Generating… (up to a minute)" : "Generate article"}
    </button>
  );
}

export function AiBlogForm() {
  return (
    <form action={generatePostAction} className="card p-6 space-y-5">
      <div>
        <label className="block text-sm font-medium mb-1.5">Topic</label>
        <input
          name="topic"
          required
          placeholder="e.g. How local service businesses win with AI search"
          className={inputCls}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5">Keywords (optional)</label>
        <input name="keywords" placeholder="comma separated" className={inputCls} />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">Tone</label>
          <select name="tone" className={inputCls} defaultValue="professional and confident">
            <option>professional and confident</option>
            <option>friendly and approachable</option>
            <option>authoritative and expert</option>
            <option>bold and punchy</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Length</label>
          <select name="length" className={inputCls} defaultValue="medium">
            <option value="short">Short (~500 words)</option>
            <option value="medium">Medium (~800 words)</option>
            <option value="long">Long (~1200 words)</option>
          </select>
        </div>
      </div>
      <SubmitButton />
      <p className="text-xs text-muted">
        The article is saved as a draft you can review and edit before publishing.
      </p>
    </form>
  );
}
