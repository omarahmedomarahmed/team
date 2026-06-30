/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { Placeholder } from "@/components/portfolio/Placeholder";
import { Icon } from "@/components/ui/Icon";

export type MoreItem = {
  href: string;
  title: string;
  meta?: string;
  cover?: string | null;
  seed: string;
};

/** "Keep exploring" grid used at the bottom of case-study / portfolio pages. */
export function MoreItems({ title, items }: { title: string; items: MoreItem[] }) {
  if (!items.length) return null;
  return (
    <section className="section-pad border-t border-line">
      <div className="container-x">
        <h2 className="title-md mb-6">{title}</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <Link key={it.href} href={it.href} className="card card-hover group flex flex-col overflow-hidden">
              <div className="aspect-[16/10] overflow-hidden border-b border-line">
                {it.cover ? (
                  <img src={it.cover} alt={it.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                ) : (
                  <Placeholder seed={it.seed} />
                )}
              </div>
              <div className="p-4">
                {it.meta ? <div className="text-xs text-muted">{it.meta}</div> : null}
                <div className="mt-1 font-semibold leading-tight">{it.title}</div>
                <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-brand">
                  View <Icon name="arrow-right" size={14} className="btn-arrow" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
