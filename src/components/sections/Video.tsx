import Link from "next/link";
import type { VideoData } from "@/lib/types";
import { Reveal } from "@/components/motion/Reveal";
import { Icon } from "@/components/ui/Icon";
import { VideoEmbed } from "@/components/ui/VideoEmbed";

/** A video section — heading + an embedded, in-site player + an optional CTA. */
export function Video({ data }: { data: VideoData }) {
  if (!data.videoUrl) return null;
  return (
    <section id="talk" className="container-x section-pad">
      <div className="mx-auto max-w-3xl text-center">
        {data.eyebrow ? <span className="eyebrow">{data.eyebrow}</span> : null}
        {data.title ? <h2 className="title-lg mt-4">{data.title}</h2> : null}
        {data.subtitle ? <p className="lead mt-4">{data.subtitle}</p> : null}
      </div>

      <Reveal>
        <div className="mx-auto mt-8 max-w-4xl">
          <VideoEmbed url={data.videoUrl} title={data.title || "Video"} />
          {data.caption ? <p className="mt-3 text-center text-sm text-muted">{data.caption}</p> : null}
        </div>
      </Reveal>

      {data.ctaLabel && data.ctaHref ? (
        <div className="mt-8 flex justify-center">
          <Link href={data.ctaHref} className="btn btn-primary group">
            {data.ctaLabel}
            <Icon name="arrow-right" size={18} className="btn-arrow" />
          </Link>
        </div>
      ) : null}
    </section>
  );
}
