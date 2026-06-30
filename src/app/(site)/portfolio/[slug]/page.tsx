/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjectBySlug } from "@/lib/site";
import { Icon } from "@/components/ui/Icon";
import { Placeholder } from "@/components/portfolio/Placeholder";
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

  const gallery = strArr(p.gallery);
  const tags = strArr(p.services);
  const body = (p.description || "").split(/\n\s*\n/).filter(Boolean);

  return (
    <article className="container-x section-pad">
      <Link href="/portfolio" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg">
        <Icon name="arrow-left" size={15} /> Back to portfolio
      </Link>

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

      {p.url ? (
        <div className="mt-6">
          <a href={p.url} target="_blank" rel="noreferrer" className="btn btn-ghost">
            Visit <Icon name="external-link" size={16} />
          </a>
        </div>
      ) : null}

      <div className="media-frame mt-10 aspect-[16/9]">
        {p.coverUrl ? (
          <img src={p.coverUrl} alt={p.title} className="h-full w-full object-cover" />
        ) : (
          <Placeholder label={p.category || "Showcase"} />
        )}
      </div>

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

      <div className="mt-12">
        <Link href="/#contact" className="btn btn-primary group">
          Get in touch
          <Icon name="arrow-right" size={18} className="btn-arrow" />
        </Link>
      </div>
    </article>
  );
}
