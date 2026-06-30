import type { Field } from "@/lib/god/resources";

// Friendly, plain-text fields for each section type — replaces JSON editing.

const HEADING: Field[] = [
  { name: "eyebrow", label: "Eyebrow (small label above title)", type: "text", full: true },
  { name: "title", label: "Title", type: "text" },
  { name: "highlight", label: "Highlighted word(s)", type: "text", help: "Shown in the accent color." },
  { name: "subtitle", label: "Subtitle", type: "textarea", full: true },
];

// Collection sections (services, portfolio, team, …) just need a heading + limit.
const COLLECTION: Field[] = [
  ...HEADING,
  { name: "limit", label: "Max items to show", type: "number", help: "Leave blank to show all." },
];

export const SECTION_LABELS: Record<string, string> = {
  HERO: "Hero",
  PORTRAIT_HERO: "Portfolio hero",
  TIMELINE: "Career timeline",
  STATS: "Stats",
  ABOUT: "About / text",
  SERVICES: "Services grid",
  PROCESS: "Process steps",
  PORTFOLIO: "Portfolio grid",
  TEAM: "Team grid",
  TESTIMONIALS: "Testimonials",
  INDUSTRIES: "Industries",
  FAQ: "FAQ",
  CTA: "Call to action",
  CONTACT: "Contact",
  LOGOS: "Logo strip",
  RICH_TEXT: "Text block",
  CUSTOM: "Custom",
};

export const SECTION_FIELDS: Record<string, Field[]> = {
  HERO: [
    { name: "eyebrow", label: "Eyebrow", type: "text", full: true },
    { name: "title", label: "Title", type: "text" },
    { name: "highlight", label: "Highlighted word(s)", type: "text" },
    { name: "subtitle", label: "Subtitle", type: "textarea", full: true },
    { name: "primaryCta", label: "Main button", type: "link", full: true },
    { name: "secondaryCta", label: "Secondary button", type: "link", full: true },
    { name: "badges", label: "Badges", type: "list", full: true, help: "One per line." },
  ],
  PORTRAIT_HERO: [
    { name: "eyebrow", label: "Eyebrow (small label)", type: "text", full: true, help: 'e.g. "Executive Portfolio"' },
    { name: "name", label: "Name (large)", type: "text", full: true },
    { name: "roles", label: "Roles line", type: "text", full: true, help: "Separate roles with  •" },
    { name: "statement", label: "Supporting statement", type: "textarea", full: true },
    { name: "periodLabel", label: "Period label", type: "text", help: 'e.g. "2017 — 2026"' },
    { name: "portrait", label: "Portrait photo", type: "image", full: true },
    { name: "primaryCta", label: "Main button", type: "link", full: true },
    { name: "secondaryCta", label: "Secondary button", type: "link", full: true },
  ],
  TIMELINE: [
    { name: "eyebrow", label: "Eyebrow", type: "text", full: true },
    { name: "title", label: "Title", type: "text", full: true },
    { name: "intro", label: "Intro line", type: "textarea", full: true, help: "Short line under the title." },
  ],
  STATS: [
    { name: "items", label: "Stats", type: "pairs", full: true, pairKeys: ["value", "label"], help: "One per line:  15+ | Years of experience" },
  ],
  ABOUT: [
    { name: "eyebrow", label: "Eyebrow", type: "text", full: true },
    { name: "title", label: "Title", type: "text" },
    { name: "highlight", label: "Highlighted word(s)", type: "text" },
    { name: "body", label: "Body", type: "textarea", full: true, help: "Blank line = new paragraph." },
    { name: "points", label: "Bullet points", type: "list", full: true, help: "One per line." },
  ],
  SERVICES: COLLECTION,
  PORTFOLIO: COLLECTION,
  TEAM: COLLECTION,
  TESTIMONIALS: COLLECTION,
  INDUSTRIES: COLLECTION,
  FAQ: COLLECTION,
  PROCESS: [
    ...HEADING,
    { name: "steps", label: "Steps", type: "pairs", full: true, pairKeys: ["title", "description"], help: "One per line:  Discover | We learn your business." },
  ],
  CTA: [
    { name: "title", label: "Title", type: "text" },
    { name: "highlight", label: "Highlighted word(s)", type: "text" },
    { name: "subtitle", label: "Subtitle", type: "textarea", full: true },
    { name: "primaryCta", label: "Main button", type: "link", full: true },
    { name: "secondaryCta", label: "Secondary button", type: "link", full: true },
  ],
  CONTACT: [
    ...HEADING,
    { name: "showForm", label: "Show contact form", type: "boolean" },
  ],
  LOGOS: [
    { name: "title", label: "Title", type: "text", full: true },
    { name: "items", label: "Logos / names", type: "list", full: true, help: "One per line." },
  ],
  RICH_TEXT: [
    { name: "title", label: "Title", type: "text" },
    { name: "highlight", label: "Highlighted word(s)", type: "text" },
    { name: "body", label: "Body", type: "textarea", full: true, help: "Blank line = new paragraph." },
  ],
  CUSTOM: [
    { name: "title", label: "Title", type: "text", full: true },
    { name: "body", label: "Body", type: "textarea", full: true },
  ],
};

export function getSectionFields(type: string): Field[] {
  return SECTION_FIELDS[type] ?? SECTION_FIELDS.RICH_TEXT;
}
