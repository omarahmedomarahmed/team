"use client";

import { useState } from "react";

export function ContactForm() {
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
        <div className="text-3xl">✓</div>
        <h3 className="mt-3 font-semibold text-lg">Thank you — we’ll be in touch.</h3>
        <p className="mt-2 text-sm text-muted">
          Your message has reached us. Expect a reply within one business day.
        </p>
      </div>
    );
  }

  const field =
    "w-full rounded-lg bg-[var(--card)] border border-line px-4 py-3 text-sm outline-none focus:border-[color-mix(in_oklab,var(--brand)_55%,var(--line))] transition-colors";

  return (
    <form onSubmit={onSubmit} className="card p-6 md:p-8 grid gap-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <input name="name" required placeholder="Your name" className={field} />
        <input name="email" type="email" required placeholder="Email" className={field} />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <input name="company" placeholder="Company" className={field} />
        <input name="phone" placeholder="Phone (optional)" className={field} />
      </div>
      <textarea
        name="message"
        required
        rows={5}
        placeholder="Tell us about your business and what you want to modernize…"
        className={field}
      />
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <div className="flex items-center gap-4">
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
