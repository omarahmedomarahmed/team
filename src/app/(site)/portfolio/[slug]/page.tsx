/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjectBySlug, getExperienceBySlug, getProjects, getExperiences } from "@/lib/site";
import { Icon } from "@/components/ui/Icon";
import { Placeholder } from "@/components/portfolio/Placeholder";
import { MoreItems, type MoreItem } from "@/components/portfolio/MoreItems";
import { Reveal } from "@/components/motion/Reveal";
import { strArr } from "@/lib/portfolio";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProjectBySlug(slug);
  if (!p) return {};
  return { title: p.metaTitle || p.title, description: p.metaDescription || p.summary || undefined };
}

export default async function PortfolioDetail({ params }: Params) {
  const { slug } = await params;
  const p = await getProjectBySlug(slug);
  if (!p) notFound();

  const [linkedExp, allProjects, featuredExp] = await Promise.all([
    p.experienceSlug ? getExperienceBySlug(p.experienceSlug) : Promise.resolve(null),
    getProjects({ limit: 20 }),
    getExperiences({ featured: true, limit: 6 }),
  ]);

  // Cover image is shared with the linked experience (same image everywhere).
  const cover = p.coverUrl || linkedExp?.heroImageUrl || null;
  const gallery = strArr(p.gallery);
  const tags = strArr(p.services);
  const body = (p.description || "").split(/\n\s*\n/).filter(Boolean);

  const morePortfolio: MoreItem[] = allProjects
    .filter((x) => x.slug !== p.slug)
    .sort((a, b) => Number(b.featured) - Number(a.featured))
    .slice(0, 3)
    .map((x) => ({
      href: `/portfolio/${x.slug}`,
      title: x.title,
      meta: [x.category, x.year ? String(x.year) : ""].filter(Boolean).join(" · "),
      cover: x.coverUrl,
      seed: x.experienceSlug || x.slug,
    }));
  const relatedExp: MoreItem[] = featuredExp
    .filter((e) => e.slug !== p.experienceSlug)
    .slice(0, 3)
    .map((e) => ({
      href: `/experience/${e.slug}`,
      title: e.company,
      meta: [e.period, e.category].filter(Boolean).join(" · "),
      cover: e.heroImageUrl,
      seed: e.slug,
    }));

  return (
    <>
      <article className="container-x section-pad">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/portfolio" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg">
            <Icon name="arrow-left" size={15} /> Back to portfolio
          </Link>
          {p.experienceSlug ? (
            <Link href={`/experience/${p.experienceSlug}`} className="btn btn-ghost group">
              View the experience
              <Icon name="arrow-up-right" size={16} className="btn-arrow" />
            </Link>
          ) : null}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
          {p.category ? <span>{p.category}</span> : null}
          {p.category && p.year ? <span>·</span> : null}
          {p.year ? <span>{p.year}</span> : null}
        </div>
        <h1 className="title-xl mt-3">{p.title}</h1>
        {p.summary ? <p className="lead mt-4 max-w-2xl">{p.summary}</p> : null}

        {tags.length ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {tags.map((t) => (
              <span key={t} className="chip">
                {t}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-3">
          {p.experienceSlug ? (
            <Link href={`/experience/${p.experienceSlug}`} className="btn btn-primary group">
              View the experience
              <Icon name="arrow-right" size={16} className="btn-arrow" />
            </Link>
          ) : null}
          {p.url ? (
            <a href={p.url} target="_blank" rel="noreferrer" className="btn btn-ghost">
              Visit <Icon name="external-link" size={16} />
            </a>
          ) : null}
        </div>

        <Reveal>
          <div className="media-frame mt-10 aspect-[16/9]">
            {cover ? (
              <img src={cover} alt={p.title} className="h-full w-full object-cover" />
            ) : (
              <Placeholder seed={p.experienceSlug || p.slug} />
            )}
          </div>
        </Reveal>

        {body.length ? (
          <div className="prose-body mt-10 max-w-3xl">
            {body.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        ) : null}

        {gallery.length ? (
          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3">
            {gallery.map((src, i) => (
              <div key={i} className="media-frame aspect-[4/3]">
                <img src={src} alt={`${p.title} — ${i + 1}`} className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        ) : null}
      </article>

      <MoreItems title="More work" items={morePortfolio} />
      <MoreItems title="Related experience" items={relatedExp} />
    </>
  );
}
