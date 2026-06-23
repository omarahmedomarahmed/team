import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getHomePage } from "@/lib/site";
import { SectionList } from "@/components/sections/SectionRenderer";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getHomePage();
  if (!page) return {};
  return {
    title: page.metaTitle || undefined, // falls back to layout default
    description: page.metaDescription || undefined,
    robots: page.noIndex ? { index: false, follow: false } : undefined,
  };
}

export default async function HomePage() {
  const page = await getHomePage();
  if (!page) notFound();
  return <SectionList sections={page.sections} />;
}
