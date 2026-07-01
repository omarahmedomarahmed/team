"use client";

import { useState } from "react";
import { ImageCropper } from "@/components/admin/ImageCropper";

async function upload(file: Blob, filename: string): Promise<string> {
  const fd = new FormData();
  fd.append("file", file, filename);
  const res = await fetch("/api/media/upload", { method: "POST", body: fd });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Upload failed");
  return json.url as string;
}

/** Single image field: crop-to-fit, then upload to the database and store the URL. */
export function ImageUpload({
  name,
  value,
  aspect = 16 / 9,
  fit = "cover",
}: {
  name: string;
  value?: string | null;
  aspect?: number;
  fit?: "cover" | "contain";
}) {
  const [url, setUrl] = useState(value || "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [editSrc, setEditSrc] = useState<string | null>(null);

  function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    setErr("");
    setEditSrc(URL.createObjectURL(f));
  }
  function closeEditor() {
    setEditSrc((s) => {
      if (s) URL.revokeObjectURL(s);
      return null;
    });
  }
  async function onCropped(blob: Blob, filename: string) {
    setBusy(true);
    setErr("");
    try {
      setUrl(await upload(blob, filename));
      closeEditor();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <input type="hidden" name={name} value={url} />
      {editSrc ? (
        <ImageCropper src={editSrc} aspect={aspect} fit={fit} busy={busy} onDone={onCropped} onCancel={closeEditor} />
      ) : (
        <>
          <div
            className="w-full max-w-xs overflow-hidden rounded-lg border border-line bg-[var(--bg-2)]"
            style={{ aspectRatio: String(aspect) }}
          >
            {url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={url} alt="" className={`h-full w-full ${fit === "contain" ? "object-contain p-3" : "object-cover"}`} />
            ) : (
              <div className="grid h-full w-full place-items-center text-xs text-muted">No image</div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <label className="btn btn-ghost cursor-pointer text-sm py-2">
              {url ? "Replace" : "Upload image"}
              <input type="file" accept="image/*" onChange={pick} className="hidden" />
            </label>
            {url ? (
              <button type="button" onClick={() => setUrl("")} className="text-sm text-muted hover:text-fg">
                Remove
              </button>
            ) : null}
          </div>
        </>
      )}
      {err ? <p className="text-xs text-red-400">{err}</p> : null}
    </div>
  );
}

/** Multiple images (e.g. a gallery). Crops each in turn; stores newline-joined URLs. */
export function MultiImageUpload({
  name,
  value,
  aspect = 4 / 3,
  fit = "cover",
}: {
  name: string;
  value?: string[];
  aspect?: number;
  fit?: "cover" | "contain";
}) {
  const [urls, setUrls] = useState<string[]>(value && value.length ? value : []);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [queue, setQueue] = useState<string[]>([]); // object URLs awaiting crop

  function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;
    setErr("");
    setQueue(files.map((f) => URL.createObjectURL(f)));
  }
  function next() {
    setQueue((q) => {
      const [first, ...rest] = q;
      if (first) URL.revokeObjectURL(first);
      return rest;
    });
  }
  async function onCropped(blob: Blob, filename: string) {
    setBusy(true);
    setErr("");
    try {
      const u = await upload(blob, filename);
      setUrls((p) => [...p, u]);
      next();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  const current = queue[0];

  return (
    <div className="space-y-2">
      <input type="hidden" name={name} value={urls.join("\n")} />
      {current ? (
        <div className="space-y-1">
          <ImageCropper key={current} src={current} aspect={aspect} fit={fit} busy={busy} onDone={onCropped} onCancel={next} />
          {queue.length > 1 ? (
            <p className="text-center text-xs text-muted">{queue.length - 1} more image{queue.length - 1 > 1 ? "s" : ""} to go</p>
          ) : null}
        </div>
      ) : (
        <>
          {urls.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {urls.map((u, i) => (
                <div key={i} className="group relative">
                  <div
                    className="overflow-hidden rounded-lg border border-line"
                    style={{ width: 88, aspectRatio: String(aspect) }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={u} alt="" className={`h-full w-full ${fit === "contain" ? "object-contain p-2" : "object-cover"}`} />
                  </div>
                  <button
                    type="button"
                    onClick={() => setUrls((p) => p.filter((_, j) => j !== i))}
                    className="absolute -right-2 -top-2 grid h-5 w-5 place-items-center rounded-full bg-red-500 text-xs text-white opacity-0 group-hover:opacity-100"
                    aria-label="Remove"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : null}
          <label className="btn btn-ghost inline-flex cursor-pointer py-2 text-sm">
            Add images
            <input type="file" accept="image/*" multiple onChange={pick} className="hidden" />
          </label>
        </>
      )}
      {err ? <p className="text-xs text-red-400">{err}</p> : null}
    </div>
  );
}
