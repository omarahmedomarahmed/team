/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjectBySlug, isModuleEnabled } from "@/lib/site";

type Params = { params: Promise<{ slug: string }> };
type Result = { label: string; value: string };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return {};
  return {
    title: project.metaTitle || project.title,
    description: project.metaDescription || project.summary || undefined,
  };
}

export default async function WorkDetail({ params }: Params) {
  if (!(await isModuleEnabled("portfolio"))) notFound();
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const results = Array.isArray(project.results) ? (project.results as unknown as Result[]) : [];
  const services = Array.isArray(project.services) ? (project.services as string[]) : [];
  const body = (project.description || "").split(/\n\s*\n/).filter(Boolean);

  return (
    <article>
      <section className="container-x pt-20 pb-10">
        <Link href="/work" className="text-sm text-muted hover:text-fg">
          ← All work
        </Link>
        <div className="mt-6 flex flex-wrap items-center gap-2 text-sm text-muted">
          {project.industry ? <span>{project.industry}</span> : null}
          {project.client ? <span className="opacity-50">· {project.client}</span> : null}
          {project.year ? <span className="opacity-50">· {project.year}</span> : null}
        </div>
        <h1 className="title-xl mt-3">{project.title}</h1>
        {project.summary ? <p className="lead mt-5 max-w-2xl">{project.summary}</p> : null}
        {services.length > 0 ? (
          <div className="mt-6 flex flex-wrap gap-2">
            {services.map((s) => (
              <span key={s} className="chip">
                {s}
              </span>
            ))}
          </div>
        ) : null}
      </section>

      <section className="container-x">
        <div className="card overflow-hidden aspect-[16/8] border-line">
          {project.coverUrl ? (
            <img src={project.coverUrl} alt={project.title} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-brand/30 to-accent/20 flex items-center justify-center">
              <span className="text-6xl font-bold opacity-30">{project.title.slice(0, 2)}</span>
            </div>
          )}
        </div>
      </section>

      {results.length > 0 ? (
        <section className="container-x py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {results.map((r) => (
              <div key={r.label} className="card p-6 text-center">
                <div className="text-3xl font-bold gradient-text">{r.value}</div>
                <div className="mt-2 text-sm text-muted">{r.label}</div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {body.length > 0 ? (
        <section className="container-x pb-10">
          <div className="max-w-3xl prose-body">
            {body.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </section>
      ) : null}

      <section className="container-x py-16">
        <div className="card p-10 text-center">
          <h2 className="title-lg">Want results like this?</h2>
          <Link href="/contact" className="btn btn-primary mt-7">
            Start a project
          </Link>
        </div>
      </section>
    </article>
  );
}
