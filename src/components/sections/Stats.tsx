import type { StatsData } from "@/lib/types";

export function Stats({ data }: { data: StatsData }) {
  return (
    <section className="container-x py-10">
      <div className="card grid grid-cols-2 md:grid-cols-4 divide-x divide-line border-line overflow-hidden">
        {data.items.map((item) => (
          <div key={item.label} className="p-7 text-center">
            <div className="text-3xl md:text-4xl font-bold gradient-text">{item.value}</div>
            <div className="mt-2 text-sm text-muted">{item.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
