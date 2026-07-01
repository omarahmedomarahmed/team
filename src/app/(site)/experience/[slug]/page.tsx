import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getExperienceBySlug, getExperiences, getProjects, getProjectsForExperience } from "@/lib/site";
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

  // Portfolio items are derived from the reverse link (each item points here via
  // experienceId) — one source of truth, no hand-maintained list on this side.
  const [linkedProjects, allExp, featuredPortfolio] = await Promise.all([
    getProjectsForExperience(exp),
    getExperiences({ limit: 20 }),
    getProjects({ featured: true, limit: 6 }),
  ]);

  const moreExperiences = allExp
    .filter((e) => e.slug !== exp.slug)
    .sort((a, b) => Number(b.featured) - Number(a.featured))
    .slice(0, 3);
  const linkedSet = new Set(linkedProjects.map((p) => p.slug));
  const related = featuredPortfolio.filter((p) => !linkedSet.has(p.slug)).slice(0, 3);

  return (
    <CaseStudy
      exp={exp}
      linkedProjects={linkedProjects}
      moreExperiences={moreExperiences}
      featuredPortfolio={related}
    />
  );
}
