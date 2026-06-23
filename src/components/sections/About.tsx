import type { AboutData } from "@/lib/types";
import { Reveal } from "@/components/motion/Reveal";

export function About({ data }: { data: AboutData }) {
  const paragraphs = data.body.split(/\n\s*\n/).filter(Boolean);
  return (
    <section className="container-x section-pad">
      <div className="grid gap-12 md:grid-cols-2 md:items-start">
        <Reveal>
          <div>
            {data.eyebrow ? <span className="eyebrow">{data.eyebrow}</span> : null}
            <h2 className="title-lg mt-4">
              {data.title}{" "}
              {data.highlight ? <span className="gradient-text">{data.highlight}</span> : null}
            </h2>
          </div>
        </Reveal>

        <Reveal delay={0.12}>
          <div>
            <div className="prose-body">
              {paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            {data.points && data.points.length > 0 ? (
              <ul className="mt-6 grid sm:grid-cols-2 gap-3">
                {data.points.map((pt) => (
                  <li key={pt} className="flex items-start gap-2.5 text-sm">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gradient-to-br from-brand to-accent shrink-0" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
