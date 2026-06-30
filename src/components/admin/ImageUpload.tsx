"use client";

import { useState } from "react";

async function upload(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/media/upload", { method: "POST", body: fd });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Upload failed");
  return json.url as string;
}

/** Single image field: uploads to the database and stores the resulting URL. */
export function ImageUpload({ name, value }: { name: string; value?: string | null }) {
  const [url, setUrl] = useState(value || "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setErr("");
    try {
      setUrl(await upload(file));
    } catch (e: any) {
      setErr(String(e.message || e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <input type="hidden" name={name} value={url} />
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="h-24 rounded-lg border border-line object-cover" />
      ) : (
        <div className="h-24 w-32 rounded-lg border border-dashed border-line grid place-items-center text-xs text-muted">
          No image
        </div>
      )}
      <div className="flex items-center gap-3">
        <label className="btn btn-ghost cursor-pointer text-sm py-2">
          {busy ? "Uploading…" : url ? "Replace" : "Upload image"}
          <input type="file" accept="image/*" onChange={onChange} className="hidden" disabled={busy} />
        </label>
        {url ? (
          <button type="button" onClick={() => setUrl("")} className="text-sm text-muted hover:text-fg">
            Remove
          </button>
        ) : null}
      </div>
      {err ? <p className="text-xs text-red-400">{err}</p> : null}
    </div>
  );
}

/** Multiple images (e.g. a gallery). Stores newline-joined URLs in one field. */
export function MultiImageUpload({ name, value }: { name: string; value?: string[] }) {
  const [urls, setUrls] = useState<string[]>(value && value.length ? value : []);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setBusy(true);
    setErr("");
    try {
      const added: string[] = [];
      for (const f of files) added.push(await upload(f));
      setUrls((prev) => [...prev, ...added]);
    } catch (e: any) {
      setErr(String(e.message || e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <input type="hidden" name={name} value={urls.join("\n")} />
      {urls.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {urls.map((u, i) => (
            <div key={i} className="relative group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={u} alt="" className="h-20 w-20 rounded-lg border border-line object-cover" />
              <button
                type="button"
                onClick={() => setUrls((p) => p.filter((_, j) => j !== i))}
                className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 text-white text-xs grid place-items-center opacity-0 group-hover:opacity-100"
                aria-label="Remove"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      ) : null}
      <label className="btn btn-ghost cursor-pointer text-sm py-2 inline-flex">
        {busy ? "Uploading…" : "Add images"}
        <input type="file" accept="image/*" multiple onChange={onChange} className="hidden" disabled={busy} />
      </label>
      {err ? <p className="text-xs text-red-400">{err}</p> : null}
    </div>
  );
}
