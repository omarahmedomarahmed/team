import type { StatsData } from "@/lib/types";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";

export function Stats({ data }: { data: StatsData }) {
  return (
    <section className="container-x py-10">
      <Stagger className="card grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-line border-line overflow-hidden">
        {(data.items || []).map((item) => (
          <StaggerItem key={item.label} className="group p-7 text-center transition-colors hover:bg-[var(--card)]">
            <div className="text-3xl md:text-4xl font-bold gradient-text transition-transform duration-300 group-hover:scale-105">
              {item.value}
            </div>
            <div className="mt-2 text-sm text-muted">{item.label}</div>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
