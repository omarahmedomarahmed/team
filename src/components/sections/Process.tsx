import type { ProcessData } from "@/lib/types";
import { SectionHeading } from "@/components/sections/SectionHeading";

export function Process({ data }: { data: ProcessData }) {
  return (
    <section className="container-x section-pad">
      <SectionHeading
        eyebrow={data.eyebrow}
        title={data.title}
        highlight={data.highlight}
        subtitle={data.subtitle}
      />
      <ol className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {data.steps.map((step, i) => (
          <li key={step.title} className="card p-6">
            <div className="text-sm font-mono text-brand">{String(i + 1).padStart(2, "0")}</div>
            <h3 className="mt-3 font-semibold">{step.title}</h3>
            <p className="mt-2 text-sm text-muted leading-relaxed">{step.description}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
