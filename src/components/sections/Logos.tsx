import type { LogosData } from "@/lib/types";

export function Logos({ data }: { data: LogosData }) {
  return (
    <section className="container-x py-12">
      {data.title ? (
        <p className="text-center text-xs uppercase tracking-[0.2em] text-muted mb-8">{data.title}</p>
      ) : null}
      <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-70">
        {(data.items || []).map((name) => (
          <span key={name} className="text-lg font-semibold tracking-tight text-muted">
            {name}
          </span>
        ))}
      </div>
    </section>
  );
}
