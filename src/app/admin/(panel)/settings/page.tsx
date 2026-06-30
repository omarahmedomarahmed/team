/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/db";
import { saveSettingsAction } from "@/lib/admin/actions";
import { ThemeColors } from "@/components/admin/ThemeColors";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { ServiceAreas } from "@/components/admin/ServiceAreas";
import { ContactFields } from "@/components/admin/ContactFields";

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

function ImgF({ label, name, value }: { label: string; name: string; value: any }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label}</label>
      <ImageUpload name={name} value={value} />
    </div>
  );
}

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const sp = await searchParams;
  const s = (await prisma.siteSettings.findFirst()) as any;
  const socials = Array.isArray(s?.socials)
    ? (s.socials as any[]).map((x) => `${x.platform} | ${x.url}`).join("\n")
    : "";
  const serviceAreas: string[] = Array.isArray(s?.serviceAreas) ? s.serviceAreas : [];
  const cc: any = s?.contactConfig;
  const contactFields =
    cc && typeof cc === "object" && Array.isArray(cc.fields)
      ? cc.fields.map((f: any) => ({
          label: f.label,
          type: f.type,
          required: !!f.required,
          options: Array.isArray(f.options) ? f.options.join(", ") : "",
        }))
      : [];

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
          <F label="Logo text" name="logoText" value={s?.logoText} help="Always shown as your wordmark." />
          <F label="Logo icon (optional)" name="logoIcon" value={s?.logoIcon} help="Icon shown in the logo box when no image is uploaded — e.g. rocket, sparkles, briefcase." />
          <F label="Founded year" name="foundedYear" value={s?.foundedYear} type="number" />
          <div className="sm:col-span-2"><F label="Tagline" name="tagline" value={s?.tagline} /></div>
          <ImgF label="Logo image" name="logoUrl" value={s?.logoUrl} />
          <ImgF label="Favicon" name="faviconUrl" value={s?.faviconUrl} />
        </div>
      </section>

      <section className="card p-6 space-y-5">
        <h2 className="font-semibold">Market</h2>
        <p className="text-xs text-muted -mt-3">Your positioning — used for SEO/AI context and where you operate.</p>
        <div className="grid sm:grid-cols-2 gap-5">
          <F label="Main market" name="mainMarket" value={s?.mainMarket} help="e.g. Information Technology" />
          <F label="Sub-market" name="subMarket" value={s?.subMarket} help="e.g. Digital Advertising" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Service areas</label>
          <ServiceAreas name="serviceAreas" value={serviceAreas} />
        </div>
      </section>

      <section className="card p-6 space-y-5">
        <h2 className="font-semibold">Colors</h2>
        <p className="text-xs text-muted -mt-3">Pick a ready-made theme or fine-tune each color — the whole site re-themes.</p>
        <ThemeColors
          initial={{
            primaryColor: s?.primaryColor ?? "#6E4A6B",
            accentColor: s?.accentColor ?? "#BBA0B8",
            bgColor: s?.bgColor ?? "#FAF6F9",
            fgColor: s?.fgColor ?? "#322331",
          }}
        />
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
            <p className="text-xs text-muted mt-1.5">One per line:  Platform | https://url</p>
          </div>
        </div>
      </section>

      <section className="card p-6 space-y-5">
        <h2 className="font-semibold">Contact form</h2>
        <p className="text-xs text-muted -mt-3">Add, remove, and configure the fields on your contact form.</p>
        <ContactFields value={contactFields} />
      </section>

      <section className="card p-6 space-y-5">
        <h2 className="font-semibold">SEO &amp; Analytics</h2>
        <div className="grid sm:grid-cols-2 gap-5">
          <div className="sm:col-span-2"><F label="Meta title" name="metaTitle" value={s?.metaTitle} /></div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium mb-1.5">Meta description</label>
            <textarea name="metaDescription" rows={2} defaultValue={s?.metaDescription ?? ""} className={inputCls} />
          </div>
          <div className="sm:col-span-2"><ImgF label="Social share image (OG)" name="ogImageUrl" value={s?.ogImageUrl} /></div>
          <F label="Google Analytics ID" name="gaId" value={s?.gaId} help="e.g. G-XXXXXXX" />
          <F label="Meta Pixel ID" name="metaPixelId" value={s?.metaPixelId} />
        </div>
      </section>

      <button type="submit" className="btn btn-primary">Save changes</button>
    </form>
  );
}
