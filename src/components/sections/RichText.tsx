import type { RichTextData } from "@/lib/types";

export function RichText({ data }: { data: RichTextData }) {
  const paragraphs = (data.body || "").split(/\n\s*\n/).filter(Boolean);
  return (
    <section className="container-x section-pad">
      <div className="max-w-3xl">
        {data.title ? (
          <h2 className="title-lg mb-6">
            {data.title}{" "}
            {data.highlight ? <span className="gradient-text">{data.highlight}</span> : null}
          </h2>
        ) : null}
        <div className="prose-body">
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
