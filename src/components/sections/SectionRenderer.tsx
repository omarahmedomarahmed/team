import {
  getServices,
  getProjects,
  getTeam,
  getTestimonials,
  getIndustries,
  getFaqs,
  getSettings,
  getTimelineYears,
  getExperiences,
  isModuleEnabled,
} from "@/lib/site";
import type {
  HeroData,
  StatsData,
  AboutData,
  CollectionSectionData,
  ProcessData,
  CTAData,
  ContactData,
  RichTextData,
  LogosData,
  VideoData,
  PortraitHeroData,
  TimelineData,
  ExperienceIndexData,
} from "@/lib/types";
import { SectionShell, type SectionBg } from "./SectionShell";

import { Hero } from "./Hero";
import { PortraitHero } from "./PortraitHero";
import { Timeline } from "./Timeline";
import { ExperienceIndex } from "./ExperienceIndex";
import { Stats } from "./Stats";
import { About } from "./About";
import { Services } from "./Services";
import { Process } from "./Process";
import { Portfolio } from "./Portfolio";
import { Team } from "./Team";
import { Testimonials } from "./Testimonials";
import { Industries } from "./Industries";
import { Faq } from "./Faq";
import { Cta } from "./Cta";
import { Contact } from "./Contact";
import { RichText } from "./RichText";
import { Logos } from "./Logos";
import { Video } from "./Video";

type SectionLike = SectionBg & {
  id: string;
  type: string;
  data: unknown;
};

async function renderInner(section: SectionLike) {
  const data = (section.data ?? {}) as Record<string, unknown>;

  switch (section.type) {
    case "HERO":
      return <Hero data={data as unknown as HeroData} hasBg={Boolean(section.bgVideoUrl || section.bgImageUrl)} />;
    case "PORTRAIT_HERO":
      return <PortraitHero data={data as unknown as PortraitHeroData} />;
    case "TIMELINE":
      return (
        <Timeline
          data={data as unknown as TimelineData}
          years={await getTimelineYears()}
          experiences={await getExperiences()}
        />
      );
    case "EXPERIENCE_INDEX": {
      const d = data as unknown as ExperienceIndexData;
      return <ExperienceIndex data={d} items={await getExperiences({ category: d.category, limit: d.limit })} />;
    }
    case "STATS":
      return <Stats data={data as unknown as StatsData} />;
    case "ABOUT":
      return <About data={data as unknown as AboutData} />;
    case "RICH_TEXT":
      return <RichText data={data as unknown as RichTextData} />;
    case "PROCESS":
      return <Process data={data as unknown as ProcessData} />;
    case "CTA":
      return <Cta data={data as unknown as CTAData} />;
    case "LOGOS":
      return <Logos data={data as unknown as LogosData} companies={await getExperiences()} />;
    case "VIDEO":
      return <Video data={data as unknown as VideoData} />;

    case "SERVICES": {
      if (!(await isModuleEnabled("services"))) return null;
      const d = data as unknown as CollectionSectionData;
      return <Services data={d} services={await getServices(d.limit)} />;
    }
    case "PORTFOLIO": {
      if (!(await isModuleEnabled("portfolio"))) return null;
      const d = data as unknown as CollectionSectionData;
      return (
        <Portfolio
          data={d}
          projects={await getProjects({ limit: d.limit, category: d.category, featured: d.featured })}
        />
      );
    }
    case "TEAM": {
      if (!(await isModuleEnabled("team"))) return null;
      const d = data as unknown as CollectionSectionData;
      return <Team data={d} team={await getTeam()} />;
    }
    case "TESTIMONIALS": {
      if (!(await isModuleEnabled("testimonials"))) return null;
      const d = data as unknown as CollectionSectionData;
      return <Testimonials data={d} items={await getTestimonials(d.limit)} />;
    }
    case "INDUSTRIES": {
      if (!(await isModuleEnabled("industries"))) return null;
      const d = data as unknown as CollectionSectionData;
      return <Industries data={d} items={await getIndustries()} />;
    }
    case "FAQ": {
      if (!(await isModuleEnabled("faq"))) return null;
      const d = data as unknown as CollectionSectionData;
      return <Faq data={d} items={await getFaqs()} />;
    }
    case "CONTACT":
      return <Contact data={data as unknown as ContactData} settings={await getSettings()} />;
    default:
      return null;
  }
}

export async function SectionRenderer({ section }: { section: SectionLike }) {
  const inner = await renderInner(section);
  if (inner === null) return null;
  return <SectionShell bg={section}>{inner}</SectionShell>;
}

export async function SectionList({ sections }: { sections: SectionLike[] }) {
  return (
    <>
      {sections.map((s) => (
        <SectionRenderer key={s.id} section={s} />
      ))}
    </>
  );
}
