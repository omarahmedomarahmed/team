// Shared shapes for the JSON payloads stored on Section.data and elsewhere.
// These are the contract between the seed/Admin and the section renderer.

export type CTALink = { label: string; href: string };
export type Social = { platform: string; url: string };

export interface HeroData {
  eyebrow?: string;
  title: string;
  highlight?: string; // part of the title rendered in the brand gradient
  subtitle?: string;
  primaryCta?: CTALink;
  secondaryCta?: CTALink;
  badges?: string[];
}

export interface StatsData {
  title?: string;
  items: { value: string; label: string }[];
}

export interface AboutData {
  eyebrow?: string;
  title: string;
  highlight?: string;
  body: string; // paragraphs separated by blank lines
  points?: string[];
}

export interface CollectionSectionData {
  eyebrow?: string;
  title: string;
  highlight?: string;
  subtitle?: string;
  limit?: number;
  category?: string; // filter (portfolio work type)
  featured?: boolean; // only featured items
}

export interface ProcessData {
  eyebrow?: string;
  title: string;
  highlight?: string;
  subtitle?: string;
  steps: { title: string; description: string }[];
}

export interface CTAData {
  title: string;
  highlight?: string;
  subtitle?: string;
  primaryCta?: CTALink;
  secondaryCta?: CTALink;
}

export interface ContactData {
  eyebrow?: string;
  title: string;
  highlight?: string;
  subtitle?: string;
  showForm?: boolean;
}

export interface RichTextData {
  title?: string;
  highlight?: string;
  body: string;
}

export interface LogosData {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
}

// --------------------------- Portfolio sections ----------------------------

export interface PortraitHeroData {
  eyebrow?: string;
  name: string;
  roles?: string; // "Founder • Product Strategist • AI Systems Architect • Business Builder"
  statement?: string;
  periodLabel?: string; // "2017 — 2026"
  portrait?: string; // uploaded media URL (/api/media/{id})
  bgImage?: string; // optional hero background image
  primaryCta?: CTALink;
  secondaryCta?: CTALink;
}

export interface TimelineData {
  eyebrow?: string;
  title?: string;
  intro?: string;
}

export interface ExperienceIndexData {
  eyebrow?: string;
  title?: string;
  highlight?: string;
  subtitle?: string;
  category?: string; // filter to a single category/department
  groupByCategory?: boolean; // render grouped under category headings
  limit?: number;
}
