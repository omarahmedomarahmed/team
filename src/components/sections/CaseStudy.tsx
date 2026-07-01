/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { Experience, Project } from "@prisma/client";
import { Reveal } from "@/components/motion/Reveal";
import { Icon } from "@/components/ui/Icon";
import { Placeholder } from "@/components/portfolio/Placeholder";
import { MoreItems, type MoreItem } from "@/components/portfolio/MoreItems";
import { strArr, pairArr, initials, exactly, ADD_DETAIL, type Pair } from "@/lib/portfolio";

/** Small uppercase section label, identical everywhere. */
function H({ children }: { children: string }) {
  return <span className="eyebrow">{children}</span>;
}

function Bullets({ items, icon }: { items: string[]; icon: string }) {
  return (
    <ul className="mt-3 space-y-2.5">
      {items.map((it, i) => (
        <li key={i} className="flex items-start gap-2.5 text-sm">
          <Icon name={icon} size={15} className="mt-0.5 shrink-0 text-brand" />
          <span className={it === ADD_DETAIL ? "italic text-muted" : ""}>{it}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * The master experience case-study template (spec 6.1). One reusable component
 * — every case study is structurally identical; only the content changes. Exact
 * counts (3 / 3 / 6 / 4 / 8) are enforced here so the rhythm never breaks. The
 * cover image is shared with the linked portfolio item (same image everywhere).
 */
export function CaseStudy({
  exp,
  linkedProjects = [],
  moreExperiences = [],
  featuredPortfolio = [],
}: {
  exp: Experience;
  linkedProjects?: Project[];
  moreExperiences?: Experience[];
  featuredPortfolio?: Project[];
}) {
  const industries = (exp.industry || "")
    .split("·")
    .map((s) => s.trim())
    .filter(Boolean);
  const challenges = exactly(strArr(exp.challenges), 3);
  const contributions = exactly(strArr(exp.contributions), 3);
  const responsibilities = exactly(strArr(exp.responsibilities), 6);
  const skills = exactly(strArr(exp.skills), 8);
  const gallery = strArr(exp.gallery);
  const cover = exp.heroImageUrl || linkedProjects[0]?.coverUrl || null;
  const singleLink = linkedProjects.length === 1 ? linkedProjects[0] : null;

  const achievements: Pair[] = pairArr(exp.achievements, "title", "description").slice(0, 4);
  while (achievements.length < 4) achievements.push({ a: ADD_DETAIL, b: "" });

  const moreExp: MoreItem[] = moreExperiences.map((e) => ({
    href: `/experience/${e.slug}`,
    title: e.company,
    meta: [e.period, e.category].filter(Boolean).join(" · "),
    cover: e.heroImageUrl,
    seed: e.slug,
  }));
  const workSource = linkedProjects.length ? linkedProjects : featuredPortfolio;
  const workTitle = linkedProjects.length ? "Portfolio work from this experience" : "From the portfolio";
  const relatedWork: MoreItem[] = workSource.map((p) => ({
    href: `/portfolio/${p.slug}`,
    title: p.title,
    meta: [p.category, p.year ? String(p.year) : ""].filter(Boolean).join(" · "),
    cover: p.coverUrl,
    seed: p.experienceSlug || p.slug,
  }));

  return (
    <>
      <article className="container-x section-pad">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/experience" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg">
            <Icon name="arrow-left" size={15} /> Back to experience
          </Link>
          {singleLink ? (
            <Link href={`/portfolio/${singleLink.slug}`} className="btn btn-ghost group">
              View as portfolio item
              <Icon name="arrow-up-right" size={16} className="btn-arrow" />
            </Link>
          ) : null}
        </div>

        {/* header */}
        <header className="mt-6 flex flex-wrap items-start gap-5 border-b border-line pb-8">
          <div className="media-frame flex h-16 w-16 shrink-0 items-center justify-center">
            {exp.logoUrl ? (
              <img src={exp.logoUrl} alt={exp.company} className="h-full w-full object-contain p-2" />
            ) : (
              <span className="text-lg font-bold text-brand">{initials(exp.company)}</span>
            )}
          </div>
          <div className="min-w-0">
            <h1 className="title-lg">{exp.company}</h1>
            {exp.role ? <p className="mt-1 font-medium">{exp.role}</p> : null}
            <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
              {exp.period ? <span>{exp.period}</span> : null}
              {exp.period && exp.location ? <span>·</span> : null}
              {exp.location ? <span>{exp.location}</span> : null}
            </div>
          </div>
          {industries.length ? (
            <div className="flex flex-wrap gap-2 sm:ml-auto">
              {industries.map((i) => (
                <span key={i} className="chip">
                  {i}
                </span>
              ))}
            </div>
          ) : null}
        </header>

        {/* cover image — shared with the linked portfolio item */}
        <Reveal>
          <div className="media-frame mt-8 aspect-[21/9]">
            {cover ? (
              <img src={cover} alt={exp.company} className="h-full w-full object-cover" />
            ) : (
              <Placeholder seed={exp.slug} />
            )}
          </div>
        </Reveal>

        {/* overview · challenge · contribution | responsibilities | achievements */}
        <div className="mt-10 grid gap-10 lg:grid-cols-3">
          <Reveal className="space-y-8">
            <div>
              <H>Overview</H>
              <p className="mt-3 leading-relaxed text-muted">{exp.overview || ADD_DETAIL}</p>
            </div>
            <div>
              <H>Business challenge</H>
              <Bullets items={challenges} icon="target" />
            </div>
            <div>
              <H>My contribution</H>
              <Bullets items={contributions} icon="check" />
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <H>Responsibilities</H>
            <ul className="mt-3 space-y-2.5">
              {responsibilities.map((r, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm">
                  <Icon name="arrow-right" size={15} className="mt-0.5 shrink-0 text-brand" />
                  <span className={r === ADD_DETAIL ? "italic text-muted" : ""}>{r}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.16}>
            <H>Achievements</H>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {achievements.map((a, i) => (
                <div key={i} className="card p-4">
                  <Icon name="award" size={18} className="text-brand" />
                  <div className="mt-2 text-sm font-semibold">{a.a}</div>
                  {a.b ? <p className="mt-1 text-xs leading-relaxed text-muted">{a.b}</p> : null}
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        {/* skills + showcase */}
        <div className="mt-12 grid items-start gap-10 lg:grid-cols-2">
          <Reveal>
            <H>Skills used</H>
            <div className="mt-3 flex flex-wrap gap-2">
              {skills.map((s, i) => (
                <span key={i} className={`chip ${s === ADD_DETAIL ? "italic text-muted" : ""}`}>
                  {s}
                </span>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <H>Showcase</H>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {(gallery.length ? gallery : [null, null]).map((g, i) => (
                <div key={i} className="media-frame aspect-[4/3]">
                  {g ? (
                    <img src={g} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <Placeholder seed={`${exp.slug}-${i}`} />
                  )}
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        {/* footer lesson */}
        {exp.footerLesson ? (
          <div className="mt-12 border-t border-line pt-8">
            <p className="title-md max-w-3xl">{exp.footerLesson}</p>
          </div>
        ) : null}

        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/#contact" className="btn btn-primary group">
            Get in touch
            <Icon name="arrow-right" size={18} className="btn-arrow" />
          </Link>
          {singleLink ? (
            <Link href={`/portfolio/${singleLink.slug}`} className="btn btn-ghost group">
              View as portfolio item
              <Icon name="arrow-up-right" size={18} className="btn-arrow" />
            </Link>
          ) : null}
        </div>
      </article>

      <MoreItems title="More experience" items={moreExp} />
      <MoreItems title={workTitle} items={relatedWork} />
    </>
  );
}
