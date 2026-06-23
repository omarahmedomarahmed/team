import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServiceBySlug, isModuleEnabled } from "@/lib/site";
import { Icon } from "@/components/ui/Icon";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) return {};
  return {
    title: service.metaTitle || service.title,
    description: service.metaDescription || service.summary || undefined,
  };
}

export default async function ServiceDetail({ params }: Params) {
  if (!(await isModuleEnabled("services"))) notFound();
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) notFound();

  const body = (service.description || "").split(/\n\s*\n/).filter(Boolean);

  return (
    <article>
      <section className="container-x pt-20 pb-10">
        <Link href="/services" className="text-sm text-muted hover:text-fg inline-flex items-center gap-1.5">
          <Icon name="arrow-left" size={15} /> All services
        </Link>
        <div className="mt-6 flex items-center gap-4">
          <span className="icon-badge h-14 w-14">
            <Icon name={service.icon} size={28} />
          </span>
          <h1 className="title-xl">{service.title}</h1>
        </div>
        {service.summary ? <p className="lead mt-6 max-w-2xl">{service.summary}</p> : null}
      </section>

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
          <h2 className="title-lg">Ready to modernize this part of your business?</h2>
          <p className="lead mt-3 max-w-xl mx-auto">
            Let’s talk about how {service.title.toLowerCase()} fits into your digital ecosystem.
          </p>
          <Link href="/contact" className="btn btn-primary mt-7">
            Start a conversation
          </Link>
        </div>
      </section>
    </article>
  );
}
