import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getExperienceBySlug, getProjectBySlug, getExperiences, getProjects } from "@/lib/site";
import { CaseStudy } from "@/components/sections/CaseStudy";
import { strArr } from "@/lib/portfolio";

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

  // Support multiple linked portfolio items; fall back to the legacy single link.
  const listed = strArr(exp.portfolioSlugs);
  const linkedSlugs = listed.length ? listed : exp.portfolioSlug ? [exp.portfolioSlug] : [];

  const [linkedRaw, allExp, featuredPortfolio] = await Promise.all([
    Promise.all(linkedSlugs.map((s) => getProjectBySlug(s))),
    getExperiences({ limit: 20 }),
    getProjects({ featured: true, limit: 6 }),
  ]);
  const linkedProjects = linkedRaw.filter((p): p is NonNullable<typeof p> => Boolean(p));

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
