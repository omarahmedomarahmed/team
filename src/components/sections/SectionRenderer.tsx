import {
  getServices,
  getProjects,
  getTeam,
  getTestimonials,
  getIndustries,
  getFaqs,
  getSettings,
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
} from "@/lib/types";

import { Hero } from "./Hero";
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

type SectionLike = {
  id: string;
  type: string;
  data: unknown;
};

/**
 * Turns a Section row into the right React block. Collection-backed sections
 * (services, portfolio, team…) load their data here and are hidden when their
 * module feature flag is off — the templating mechanism in action.
 */
export async function SectionRenderer({ section }: { section: SectionLike }) {
  const data = (section.data ?? {}) as Record<string, unknown>;

  switch (section.type) {
    case "HERO":
      return <Hero data={data as unknown as HeroData} />;
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
      return <Logos data={data as unknown as LogosData} />;

    case "SERVICES": {
      if (!(await isModuleEnabled("services"))) return null;
      const d = data as unknown as CollectionSectionData;
      const services = await getServices(d.limit);
      return <Services data={d} services={services} />;
    }
    case "PORTFOLIO": {
      if (!(await isModuleEnabled("portfolio"))) return null;
      const d = data as unknown as CollectionSectionData;
      const projects = await getProjects(d.limit);
      return <Portfolio data={d} projects={projects} />;
    }
    case "TEAM": {
      if (!(await isModuleEnabled("team"))) return null;
      const d = data as unknown as CollectionSectionData;
      const team = await getTeam();
      return <Team data={d} team={team} />;
    }
    case "TESTIMONIALS": {
      if (!(await isModuleEnabled("testimonials"))) return null;
      const d = data as unknown as CollectionSectionData;
      const items = await getTestimonials(d.limit);
      return <Testimonials data={d} items={items} />;
    }
    case "INDUSTRIES": {
      if (!(await isModuleEnabled("industries"))) return null;
      const d = data as unknown as CollectionSectionData;
      const items = await getIndustries();
      return <Industries data={d} items={items} />;
    }
    case "FAQ": {
      if (!(await isModuleEnabled("faq"))) return null;
      const d = data as unknown as CollectionSectionData;
      const items = await getFaqs();
      return <Faq data={d} items={items} />;
    }
    case "CONTACT": {
      const settings = await getSettings();
      return <Contact data={data as unknown as ContactData} settings={settings} />;
    }
    default:
      return null;
  }
}

/** Renders an ordered list of sections (already filtered to enabled). */
export async function SectionList({ sections }: { sections: SectionLike[] }) {
  return (
    <>
      {sections.map((s) => (
        <SectionRenderer key={s.id} section={s} />
      ))}
    </>
  );
}
