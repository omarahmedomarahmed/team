import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getExperienceBySlug } from "@/lib/site";
import { CaseStudy } from "@/components/sections/CaseStudy";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const exp = await getExperienceBySlug(slug);
  if (!exp) return {};
  return {
    title: exp.metaTitle || `${exp.company}${exp.role ? ` — ${exp.role}` : ""}`,
    description: exp.metaDescription || exp.overview || undefined,
  };
}

export default async function ExperiencePage({ params }: Params) {
  const { slug } = await params;
  const exp = await getExperienceBySlug(slug);
  if (!exp) notFound();
  return <CaseStudy exp={exp} />;
}
