import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getSettings } from "@/lib/site";
import { SiteHeader } from "@/components/site/Header";
import { SiteFooter } from "@/components/site/Footer";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

// CMS content lives in the database; render at request time so edits show up.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const title = s.metaTitle || s.siteName;
  return {
    title: { default: title, template: `%s · ${s.siteName}` },
    description: s.metaDescription || s.tagline || undefined,
    icons: s.faviconUrl ? { icon: s.faviconUrl } : undefined,
    openGraph: {
      title,
      description: s.metaDescription || s.tagline || undefined,
      siteName: s.siteName,
      images: s.ogImageUrl ? [{ url: s.ogImageUrl }] : undefined,
      type: "website",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const s = await getSettings();

  // Brand tokens from the database override the CSS defaults.
  const brandVars = {
    "--bg": s.bgColor,
    "--fg": s.fgColor,
    "--brand": s.primaryColor,
    "--accent": s.accentColor,
  } as React.CSSProperties;

  return (
    <html
      lang="en"
      style={brandVars}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
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
      </body>
    </html>
  );
}
