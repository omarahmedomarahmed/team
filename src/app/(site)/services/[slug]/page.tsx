/* eslint-disable @next/next/no-img-element, @typescript-eslint/no-explicit-any */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServiceBySlug, getProjects, isModuleEnabled } from "@/lib/site";
import { SectionShell } from "@/components/sections/SectionShell";
import { Icon } from "@/components/ui/Icon";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";

type Params = { params: Promise<{ slug: string }> };
type Benefit = { title: string; description: string };

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
  const service: any = await getServiceBySlug(slug);
  if (!service) notFound();

  const benefits: Benefit[] = Array.isArray(service.benefits) ? service.benefits : [];
  const gallery: string[] = Array.isArray(service.gallery) ? service.gallery : [];
  const body = (service.description || "").split(/\n\s*\n/).filter(Boolean);

  // Portfolio examples tagged with this service.
  let related: any[] = [];
  if (await isModuleEnabled("portfolio")) {
    const all = await getProjects();
    related = all
      .filter((p: any) =>
        (Array.isArray(p.services) ? p.services : []).some(
          (t: string) => t.toLowerCase() === service.title.toLowerCase(),
        ),
      )
      .slice(0, 3);
  }

  return (
    <article>
      {/* Hero */}
      <SectionShell bg={{ bgImageUrl: service.heroImageUrl, bgOverlay: 70 }}>
        <section className="container-x pt-16 pb-14 md:pt-24 md:pb-20">
          <Link href="/services" className="text-sm text-muted hover:text-fg inline-flex items-center gap-1.5">
            <Icon name="arrow-left" size={15} /> All services
          </Link>
          <Reveal>
            <div className="mt-6 flex items-center gap-4">
              <span className="icon-badge h-14 w-14"><Icon name={service.icon} size={28} /></span>
              <h1 className="title-xl">{service.title}</h1>
            </div>
          </Reveal>
          {service.tagline ? <Reveal delay={0.05}><p className="lead mt-5 max-w-2xl">{service.tagline}</p></Reveal> : null}
          {service.summary ? <Reveal delay={0.1}><p className="mt-4 max-w-2xl text-muted">{service.summary}</p></Reveal> : null}
          <Reveal delay={0.15}>
            <div className="mt-8 flex flex-wrap items-center gap-5">
              <Link href="/contact" className="btn btn-primary group">
                Start a project <Icon name="arrow-right" size={18} className="btn-arrow" />
              </Link>
              {service.price ? (
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold gradient-text">{service.price}</span>
                  {service.priceNote ? <span className="text-sm text-muted">{service.priceNote}</span> : null}
                </div>
              ) : null}
            </div>
          </Reveal>
        </section>
      </SectionShell>

      {/* Body */}
      {body.length > 0 ? (
        <section className="container-x section-pad">
          <div className="max-w-3xl prose-body">
            {body.map((p: string, i: number) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </section>
      ) : null}

      {/* Benefits */}
      {benefits.length > 0 ? (
        <section className="container-x pb-4">
          <Reveal><h2 className="title-lg mb-8">What&apos;s <span className="gradient-text">included</span></h2></Reveal>
          <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((b, i) => (
              <StaggerItem key={i} className="h-full">
                <div className="card card-hover p-6 h-full">
                  <span className="icon-badge"><Icon name="check" size={18} /></span>
                  <h3 className="mt-4 font-semibold">{b.title}</h3>
                  {b.description ? <p className="mt-2 text-sm text-muted leading-relaxed">{b.description}</p> : null}
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </section>
      ) : null}

      {/* Gallery */}
      {gallery.length > 0 ? (
        <section className="container-x section-pad">
          <Reveal><h2 className="title-lg mb-8">A look at the <span className="gradient-text">work</span></h2></Reveal>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {gallery.map((src, i) => (
              <div key={i} className="card overflow-hidden aspect-[4/3] group">
                <img src={src} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Related portfolio */}
      {related.length > 0 ? (
        <section className="container-x section-pad">
          <Reveal><h2 className="title-lg mb-8">Related <span className="gradient-text">work</span></h2></Reveal>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {related.map((p) => (
              <Link key={p.id} href={`/work/${p.slug}`} className="card card-hover group overflow-hidden">
                <div className="aspect-[4/3] overflow-hidden border-b border-line">
                  {p.coverUrl ? (
                    <img src={p.coverUrl} alt={p.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-brand/30 to-accent/20" />
                  )}
                </div>
                <div className="p-4">
                  <div className="text-xs text-muted">{p.industry}</div>
                  <h3 className="font-semibold text-sm mt-1">{p.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* CTA */}
      <section className="container-x py-16">
        <div className="card relative overflow-hidden p-10 md:p-16 text-center">
          <div className="absolute inset-0 -z-10 opacity-60" style={{ background: "radial-gradient(40rem 20rem at 50% 0%, color-mix(in oklab, var(--brand) 28%, transparent), transparent 70%)" }} />
          <h2 className="title-lg max-w-2xl mx-auto">
            {service.ctaTitle || `Ready to get started with ${service.title.toLowerCase()}?`}
          </h2>
          {service.ctaText ? <p className="lead mt-4 max-w-xl mx-auto">{service.ctaText}</p> : null}
          <Link href="/contact" className="btn btn-primary mt-7 group">
            Start a conversation <Icon name="arrow-right" size={18} className="btn-arrow" />
          </Link>
        </div>
      </section>
    </article>
  );
}
