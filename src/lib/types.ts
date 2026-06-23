// Shared shapes for the JSON payloads stored on Section.data and elsewhere.
// These are the contract between the seed/God Mode and the section renderer.

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
  title?: string;
  items: string[];
}
