import { getSettings } from "@/lib/site";
import { SiteHeader } from "@/components/site/Header";
import { SiteFooter } from "@/components/site/Footer";

export default async function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const s = await getSettings();
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      {s.gaId ? (
        <>
          {/* eslint-disable-next-line @next/next/next-script-for-ga */}
          <script async src={`https://www.googletagmanager.com/gtag/js?id=${s.gaId}`} />
          <script
            dangerouslySetInnerHTML={{
              __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${s.gaId}');`,
            }}
          />
        </>
      ) : null}
    </div>
  );
}
