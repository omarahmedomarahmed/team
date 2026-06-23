/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/db";
import { saveSettingsAction } from "@/lib/god/actions";

export const dynamic = "force-dynamic";

const inputCls =
  "w-full rounded-lg bg-[var(--card)] border border-line px-3.5 py-2.5 text-sm outline-none focus:border-[color-mix(in_oklab,var(--brand)_55%,var(--line))] transition-colors";

function F({ label, name, value, type = "text", help }: { label: string; name: string; value: any; type?: string; help?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label}</label>
      <input type={type} name={name} defaultValue={value ?? ""} className={inputCls} />
      {help ? <p className="text-xs text-muted mt-1.5">{help}</p> : null}
    </div>
  );
}

function Color({ label, name, value }: { label: string; name: string; value: string }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label}</label>
      <div className="flex items-center gap-2">
        <input type="color" name={name} defaultValue={value} className="h-10 w-12 rounded-lg bg-transparent border border-line cursor-pointer" />
        <input type="text" defaultValue={value} readOnly className={`${inputCls} font-mono text-xs`} />
      </div>
    </div>
  );
}

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const sp = await searchParams;
  const s = (await prisma.siteSettings.findFirst()) as any;
  const socials = Array.isArray(s?.socials)
    ? (s.socials as any[]).map((x) => `${x.platform} | ${x.url}`).join("\n")
    : "";

  return (
    <form action={saveSettingsAction} className="space-y-8 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Settings</h1>
        <button type="submit" className="btn btn-primary">Save changes</button>
      </div>
      {sp.saved ? <p className="text-sm text-emerald-400">Saved.</p> : null}

      <section className="card p-6 space-y-5">
        <h2 className="font-semibold">Brand</h2>
        <div className="grid sm:grid-cols-2 gap-5">
          <F label="Site name" name="siteName" value={s?.siteName} />
          <F label="Legal name" name="legalName" value={s?.legalName} />
          <F label="Logo text" name="logoText" value={s?.logoText} help="Used when no logo image is set." />
          <F label="Founded year" name="foundedYear" value={s?.foundedYear} type="number" />
          <div className="sm:col-span-2"><F label="Tagline" name="tagline" value={s?.tagline} /></div>
          <div className="sm:col-span-2"><F label="Logo image URL" name="logoUrl" value={s?.logoUrl} /></div>
          <div className="sm:col-span-2"><F label="Favicon URL" name="faviconUrl" value={s?.faviconUrl} /></div>
        </div>
      </section>

      <section className="card p-6 space-y-5">
        <h2 className="font-semibold">Colors</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
          <Color label="Primary" name="primaryColor" value={s?.primaryColor ?? "#7c3aed"} />
          <Color label="Accent" name="accentColor" value={s?.accentColor ?? "#22d3ee"} />
          <Color label="Background" name="bgColor" value={s?.bgColor ?? "#080711"} />
          <Color label="Text" name="fgColor" value={s?.fgColor ?? "#ECECF1"} />
        </div>
      </section>

      <section className="card p-6 space-y-5">
        <h2 className="font-semibold">Contact</h2>
        <div className="grid sm:grid-cols-2 gap-5">
          <F label="Email" name="email" value={s?.email} />
          <F label="Phone" name="phone" value={s?.phone} />
          <div className="sm:col-span-2"><F label="Address" name="address" value={s?.address} /></div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium mb-1.5">Social links</label>
            <textarea name="socials" rows={4} defaultValue={socials} className={inputCls} />
            <p className="text-xs text-muted mt-1.5">One per line, format: <code>Platform | https://url</code></p>
          </div>
        </div>
      </section>

      <section className="card p-6 space-y-5">
        <h2 className="font-semibold">SEO &amp; Analytics</h2>
        <div className="grid sm:grid-cols-2 gap-5">
          <div className="sm:col-span-2"><F label="Meta title" name="metaTitle" value={s?.metaTitle} /></div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium mb-1.5">Meta description</label>
            <textarea name="metaDescription" rows={2} defaultValue={s?.metaDescription ?? ""} className={inputCls} />
          </div>
          <div className="sm:col-span-2"><F label="OG image URL" name="ogImageUrl" value={s?.ogImageUrl} /></div>
          <F label="Google Analytics ID" name="gaId" value={s?.gaId} help="e.g. G-XXXXXXX" />
          <F label="Meta Pixel ID" name="metaPixelId" value={s?.metaPixelId} />
        </div>
      </section>

      <button type="submit" className="btn btn-primary">Save changes</button>
    </form>
  );
}
