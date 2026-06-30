/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Icon } from "@/components/ui/Icon";
import {
  savePageAction,
  deletePageAction,
  addSectionAction,
  saveSectionAction,
  deleteSectionAction,
} from "@/lib/god/actions";
import { getSectionFields, SECTION_LABELS } from "@/lib/god/sectionFields";
import { FieldInput } from "@/components/god/FieldInput";
import { ImageUpload } from "@/components/god/ImageUpload";

export const dynamic = "force-dynamic";

const inputCls =
  "w-full rounded-lg bg-[var(--card)] border border-line px-3.5 py-2.5 text-sm outline-none focus:border-[color-mix(in_oklab,var(--brand)_55%,var(--line))] transition-colors";

const SECTION_TYPES = [
  "PORTRAIT_HERO", "TIMELINE", "CONTACT",
  "HERO", "STATS", "ABOUT", "SERVICES", "PROCESS", "PORTFOLIO", "TEAM",
  "TESTIMONIALS", "INDUSTRIES", "FAQ", "CTA", "LOGOS", "RICH_TEXT", "CUSTOM",
];

function Check({ name, label, checked }: { name: string; label: string; checked?: boolean }) {
  return (
    <label className="inline-flex items-center gap-2 cursor-pointer select-none text-sm">
      <input type="checkbox" name={name} defaultChecked={checked} className="h-4 w-4 accent-[var(--brand)]" />
      {label}
    </label>
  );
}

export default async function PageEditor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isNew = id === "new";

  const page: any = isNew
    ? null
    : await prisma.page.findUnique({
        where: { id },
        include: { sections: { orderBy: { order: "asc" } } },
      });
  if (!isNew && !page) notFound();

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <Link href="/god/pages" className="text-sm text-muted hover:text-fg inline-flex items-center gap-1.5">
          <Icon name="arrow-left" size={15} /> Pages
        </Link>
        <div className="flex items-center justify-between gap-4 mt-2">
          <h1 className="text-2xl font-bold">{isNew ? "New page" : page.title}</h1>
          {!isNew ? (
            <Link href={`/${page.slug === "home" ? "" : page.slug}`} target="_blank" className="text-sm text-brand">
              View page →
            </Link>
          ) : null}
        </div>
      </div>

      {/* Page meta */}
      <form action={savePageAction} className="card p-6 space-y-5">
        <input type="hidden" name="__id" value={id} />
        <h2 className="font-semibold">Page details</h2>
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium mb-1.5">Title</label>
            <input name="title" defaultValue={page?.title ?? ""} required className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Slug</label>
            <input name="slug" defaultValue={page?.slug ?? ""} placeholder="auto from title" className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Status</label>
            <select name="status" defaultValue={page?.status ?? "PUBLISHED"} className={inputCls}>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Order</label>
            <input type="number" name="order" defaultValue={page?.order ?? 0} className={inputCls} />
          </div>
          <div className="sm:col-span-2"><label className="block text-sm font-medium mb-1.5">Meta title</label>
            <input name="metaTitle" defaultValue={page?.metaTitle ?? ""} className={inputCls} /></div>
          <div className="sm:col-span-2"><label className="block text-sm font-medium mb-1.5">Meta description</label>
            <textarea name="metaDescription" rows={2} defaultValue={page?.metaDescription ?? ""} className={inputCls} /></div>
          <div><label className="block text-sm font-medium mb-1.5">Nav label</label>
            <input name="navLabel" defaultValue={page?.navLabel ?? ""} className={inputCls} /></div>
        </div>
        <div className="flex flex-wrap gap-5">
          <Check name="isHome" label="Home page" checked={page?.isHome} />
          <Check name="showInNav" label="Show in nav" checked={page?.showInNav} />
          <Check name="noIndex" label="Hide from search" checked={page?.noIndex} />
        </div>
        <div className="flex items-center gap-3">
          <button type="submit" className="btn btn-primary">{isNew ? "Create page" : "Save page"}</button>
        </div>
      </form>

      {/* Sections */}
      {!isNew ? (
        <div className="space-y-4">
          <h2 className="font-semibold">Sections</h2>
          <p className="text-sm text-muted -mt-2">Click a section to edit its text and images. Drag isn&apos;t needed — set the order number.</p>

          {page.sections.map((s: any) => (
            <details key={s.id} className="card overflow-hidden group">
              <summary className="list-none cursor-pointer px-5 py-4 flex items-center gap-3 [&::-webkit-details-marker]:hidden">
                <Icon name="plus" size={16} className="text-brand transition-transform group-open:rotate-45" />
                <span className="font-medium text-sm">{SECTION_LABELS[s.type] || s.type}</span>
                {!s.enabled ? <span className="chip text-[0.65rem] py-0 px-2">hidden</span> : null}
                <span className="ml-auto text-xs text-muted">order {s.order}</span>
              </summary>
              <div className="px-5 pb-5 border-t border-line pt-4">
                <form action={saveSectionAction} className="space-y-4">
                  <input type="hidden" name="__id" value={s.id} />
                  <input type="hidden" name="pageId" value={page.id} />
                  <div className="flex flex-wrap items-center gap-5">
                    <Check name="enabled" label="Visible" checked={s.enabled} />
                    <div className="flex items-center gap-2 text-sm">
                      Order <input type="number" name="order" defaultValue={s.order} className={`${inputCls} w-20`} />
                    </div>
                  </div>
                  {/* Section content — plain text fields */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    {getSectionFields(s.type).map((f) => (
                      <div key={f.name} className={f.full ? "sm:col-span-2" : ""}>
                        <label className="block text-xs text-muted mb-1">{f.label}</label>
                        <FieldInput field={f} value={(s.data as any)?.[f.name]} />
                        {f.help ? <p className="text-[0.7rem] text-muted mt-1">{f.help}</p> : null}
                      </div>
                    ))}
                  </div>

                  {/* Background */}
                  <details className="rounded-lg border border-line">
                    <summary className="cursor-pointer px-3 py-2 text-xs text-muted [&::-webkit-details-marker]:hidden">
                      Background &amp; spacing
                    </summary>
                    <div className="p-3 grid sm:grid-cols-2 gap-4 border-t border-line">
                      <div><label className="block text-xs text-muted mb-1">Background image</label>
                        <ImageUpload name="bgImageUrl" value={s.bgImageUrl} /></div>
                      <div><label className="block text-xs text-muted mb-1">Video poster image</label>
                        <ImageUpload name="bgPosterUrl" value={s.bgPosterUrl} /></div>
                      <div><label className="block text-xs text-muted mb-1">Background video URL</label>
                        <input name="bgVideoUrl" defaultValue={s.bgVideoUrl ?? ""} placeholder="https://…mp4" className={inputCls} /></div>
                      <div><label className="block text-xs text-muted mb-1">Overlay darkness (0–100)</label>
                        <input type="number" name="bgOverlay" defaultValue={s.bgOverlay ?? 72} className={inputCls} /></div>
                    </div>
                  </details>

                  <div className="flex items-center gap-3">
                    <button type="submit" className="btn btn-primary">Save section</button>
                  </div>
                </form>
                <form action={deleteSectionAction} className="mt-3 pt-3 border-t border-line">
                  <input type="hidden" name="__id" value={s.id} />
                  <input type="hidden" name="pageId" value={page.id} />
                  <button type="submit" className="text-sm text-red-400 hover:text-red-300">Delete section</button>
                </form>
              </div>
            </details>
          ))}

          {/* Add section */}
          <form action={addSectionAction} className="card p-4 flex flex-wrap items-center gap-3">
            <input type="hidden" name="pageId" value={page.id} />
            <span className="text-sm font-medium">Add section:</span>
            <select name="type" className={`${inputCls} max-w-xs`} defaultValue="RICH_TEXT">
              {SECTION_TYPES.map((t) => (
                <option key={t} value={t}>{SECTION_LABELS[t] || t}</option>
              ))}
            </select>
            <button type="submit" className="btn btn-ghost">Add</button>
          </form>

          {/* Delete page */}
          <form action={deletePageAction} className="pt-4">
            <input type="hidden" name="__id" value={page.id} />
            <button type="submit" className="text-sm text-red-400 hover:text-red-300">Delete this page</button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
