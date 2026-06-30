import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getExperienceBySlug, getProjectBySlug, getExperiences, getProjects } from "@/lib/site";
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

  const [linkedPortfolio, allExp, featuredPortfolio] = await Promise.all([
    exp.portfolioSlug ? getProjectBySlug(exp.portfolioSlug) : Promise.resolve(null),
    getExperiences({ limit: 20 }),
    getProjects({ featured: true, limit: 6 }),
  ]);

  const moreExperiences = allExp
    .filter((e) => e.slug !== exp.slug)
    .sort((a, b) => Number(b.featured) - Number(a.featured))
    .slice(0, 3);
  const related = featuredPortfolio.filter((p) => p.slug !== exp.portfolioSlug).slice(0, 3);

  return (
    <CaseStudy
      exp={exp}
      linkedPortfolio={linkedPortfolio}
      moreExperiences={moreExperiences}
      featuredPortfolio={related}
    />
  );
}
