// Config-driven admin: one list page + one form page render every collection
// from these definitions. `model` is the Prisma delegate name.

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "boolean"
  | "select"
  | "status"
  | "image" // single upload
  | "images" // multiple uploads -> string[]
  | "icon"
  | "list" // newline-separated -> string[]
  | "pairs" // "A | B" per line -> [{ [k0]: A, [k1]: B }]
  | "link" // { label, href }
  | "relation"; // pick another record from a dropdown -> its stable id (or id[] when multiple)

export type Field = {
  name: string;
  label: string;
  type: FieldType;
  help?: string;
  full?: boolean; // span both columns
  options?: { value: string; label: string }[];
  pairKeys?: [string, string]; // for type "pairs"
  relationTo?: string; // for type "relation": the resource key to pick from
  multiple?: boolean; // for type "relation": allow selecting several -> id[]
};

export type Resource = {
  key: string; // URL segment
  model: string; // prisma delegate
  label: string;
  singular: string;
  icon: string;
  listColumns: { name: string; label: string }[];
  fields: Field[];
  orderBy?: Record<string, "asc" | "desc">[];
  noCreate?: boolean;
  readOnly?: boolean;
};

const STATUS: Field = {
  name: "status",
  label: "Status",
  type: "status",
};

export const RESOURCES: Record<string, Resource> = {
  experience: {
    key: "experience",
    model: "experience",
    label: "Experience",
    singular: "Case study",
    icon: "briefcase",
    orderBy: [{ order: "asc" }],
    listColumns: [
      { name: "company", label: "Company" },
      { name: "role", label: "Role" },
      { name: "period", label: "Period" },
      { name: "status", label: "Status" },
    ],
    fields: [
      { name: "company", label: "Company", type: "text" },
      { name: "role", label: "Role", type: "text" },
      { name: "slug", label: "Slug", type: "text", help: "Leave blank to auto-generate from the company name." },
      { name: "period", label: "Period", type: "text", help: "e.g. 2022 — 2024" },
      { name: "location", label: "Location", type: "text" },
      { name: "industry", label: "Industry", type: "text", full: true, help: "Separate with  ·" },
      { name: "category", label: "Category / department", type: "text", help: "Groups this case study, e.g. Entrepreneurship · Sales & Business Development." },
      { name: "logoUrl", label: "Company logo", type: "image" },
      { name: "heroImageUrl", label: "Cover image", type: "image", full: true, help: "Shown on the case study and on the timeline, and shared with any portfolio items linked to this experience." },
      { name: "videoUrl", label: "Video link (optional)", type: "text", full: true, help: "A talk or demo video URL (e.g. the YouTube link for a TEDx talk). Shows a 'Watch' button on the case study." },
      { name: "overview", label: "Overview", type: "textarea", full: true, help: "45–55 words: what the company does and your relationship to it. To attach portfolio items, open each one under Portfolio and set 'Part of which experience?' — they'll appear here automatically." },
      { name: "challenges", label: "Business challenges", type: "list", full: true, help: "Exactly 3 — one short line each." },
      { name: "contributions", label: "My contribution", type: "list", full: true, help: "Exactly 3 — one short line each." },
      { name: "responsibilities", label: "Responsibilities", type: "list", full: true, help: "Exactly 6 — start each with an action verb (Led, Built, Designed…)." },
      { name: "achievements", label: "Achievement cards", type: "pairs", full: true, pairKeys: ["title", "description"], help: "Exactly 4 — one per line:  Title | One sentence." },
      { name: "skills", label: "Skills used", type: "list", full: true, help: "Exactly 8 — one per line." },
      { name: "gallery", label: "Showcase images", type: "images", full: true },
      { name: "footerLesson", label: "Footer lesson (one line)", type: "text", full: true },
      { name: "featured", label: "Featured", type: "boolean" },
      { name: "order", label: "Order", type: "number" },
      STATUS,
    ],
  },
  timeline: {
    key: "timeline",
    model: "timelineYear",
    label: "Career timeline",
    singular: "Year block",
    icon: "calendar",
    orderBy: [{ order: "asc" }],
    listColumns: [
      { name: "year", label: "Year" },
      { name: "stageTitle", label: "Stage" },
      { name: "status", label: "Status" },
    ],
    fields: [
      { name: "year", label: "Year", type: "number" },
      { name: "stageTitle", label: "Stage title (headline)", type: "text", full: true },
      { name: "story", label: "One-line story", type: "textarea", full: true },
      { name: "tags", label: "Stage / company tags", type: "list", full: true, help: "One per line." },
      { name: "learningPoints", label: "Learning points", type: "list", full: true, help: "Exactly 4 — one short line each." },
      { name: "takeaway", label: "Key takeaway (pull-quote)", type: "text", full: true },
      { name: "footerQuote", label: "Footer quote", type: "text", full: true },
      { name: "stats", label: "Stats row (optional)", type: "pairs", full: true, pairKeys: ["label", "value"], help: "One per line:  Label | Value" },
      { name: "imageUrl", label: "Image / asset", type: "image", full: true },
      {
        name: "experienceIds",
        label: "Linked case study / studies",
        type: "relation",
        relationTo: "experience",
        multiple: true,
        full: true,
        help: "Tick the experience(s) this year covers. Their company logo and cover image show on the year block, and the 'View case study' button links here. Renaming a case study won't break the link.",
      },
      { name: "order", label: "Order", type: "number" },
      STATUS,
    ],
  },
  services: {
    key: "services",
    model: "service",
    label: "Services",
    singular: "Service",
    icon: "settings",
    orderBy: [{ order: "asc" }],
    listColumns: [
      { name: "title", label: "Title" },
      { name: "status", label: "Status" },
      { name: "order", label: "Order" },
    ],
    fields: [
      { name: "title", label: "Title", type: "text" },
      { name: "slug", label: "Slug", type: "text", help: "Leave blank to auto-generate." },
      { name: "icon", label: "Icon", type: "icon" },
      { name: "tagline", label: "Tagline", type: "text", full: true, help: "Short line under the title on the service page." },
      { name: "summary", label: "Summary (shown on the services grid)", type: "textarea", full: true },
      { name: "description", label: "Description", type: "textarea", full: true, help: "Blank line = new paragraph." },
      { name: "heroImageUrl", label: "Hero image", type: "image", full: true },
      {
        name: "benefits",
        label: "What's included",
        type: "pairs",
        full: true,
        pairKeys: ["title", "description"],
        help: "One per line:  Title | Description",
      },
      { name: "gallery", label: "Example images", type: "images", full: true },
      { name: "price", label: "Price", type: "text", help: "Leave blank to hide pricing." },
      { name: "priceNote", label: "Price note", type: "text", help: "e.g. starting at  ·  /month" },
      { name: "ctaTitle", label: "Call-to-action heading", type: "text", full: true },
      { name: "ctaText", label: "Call-to-action text", type: "textarea", full: true },
      { name: "featured", label: "Featured", type: "boolean" },
      { name: "order", label: "Order", type: "number" },
      STATUS,
    ],
  },
  team: {
    key: "team",
    model: "teamMember",
    label: "Team",
    singular: "Team member",
    icon: "briefcase",
    orderBy: [{ order: "asc" }],
    listColumns: [
      { name: "name", label: "Name" },
      { name: "role", label: "Role" },
      { name: "status", label: "Status" },
    ],
    fields: [
      { name: "name", label: "Name", type: "text" },
      { name: "role", label: "Role", type: "text" },
      { name: "department", label: "Department", type: "text" },
      { name: "bio", label: "Bio", type: "textarea", full: true },
      { name: "photoUrl", label: "Photo URL", type: "image" },
      { name: "order", label: "Order", type: "number" },
      STATUS,
    ],
  },
  projects: {
    key: "projects",
    model: "project",
    label: "Portfolio",
    singular: "Portfolio item",
    icon: "presentation",
    orderBy: [{ order: "asc" }],
    listColumns: [
      { name: "title", label: "Title" },
      { name: "category", label: "Category" },
      { name: "status", label: "Status" },
    ],
    fields: [
      { name: "title", label: "Title", type: "text" },
      { name: "slug", label: "Slug", type: "text", help: "Leave blank to auto-generate." },
      { name: "client", label: "Client", type: "text" },
      { name: "industry", label: "Industry", type: "text" },
      { name: "category", label: "Category", type: "text", help: "Work type, e.g. Platform · Presentation · Website · MVP · Branding." },
      {
        name: "experienceId",
        label: "Part of which experience?",
        type: "relation",
        relationTo: "experience",
        full: true,
        help: "Pick the experience this work came from. This is the ONE place the link is set — the case study then shows this item automatically, and they can share the same cover image. Renaming things won't break it.",
      },
      { name: "year", label: "Year", type: "number" },
      { name: "url", label: "External URL", type: "text" },
      { name: "summary", label: "Summary", type: "textarea", full: true },
      { name: "description", label: "Description", type: "textarea", full: true },
      { name: "coverUrl", label: "Cover image", type: "image", full: true },
      { name: "gallery", label: "Gallery images", type: "images", full: true },
      { name: "services", label: "Tags", type: "list", full: true, help: "One tag per line (e.g. tech stack or role)." },
      {
        name: "results",
        label: "Results",
        type: "pairs",
        full: true,
        pairKeys: ["label", "value"],
        help: "One per line:  Leads | +180%",
      },
      { name: "featured", label: "Featured", type: "boolean" },
      { name: "order", label: "Order", type: "number" },
      STATUS,
    ],
  },
  testimonials: {
    key: "testimonials",
    model: "testimonial",
    label: "Testimonials",
    singular: "Testimonial",
    icon: "star",
    orderBy: [{ order: "asc" }],
    listColumns: [
      { name: "author", label: "Author" },
      { name: "company", label: "Company" },
      { name: "status", label: "Status" },
    ],
    fields: [
      { name: "author", label: "Author", type: "text" },
      { name: "role", label: "Role", type: "text" },
      { name: "company", label: "Company", type: "text" },
      { name: "quote", label: "Quote", type: "textarea", full: true },
      { name: "avatarUrl", label: "Avatar URL", type: "image" },
      { name: "rating", label: "Rating (1-5)", type: "number" },
      { name: "featured", label: "Featured", type: "boolean" },
      { name: "order", label: "Order", type: "number" },
      STATUS,
    ],
  },
  industries: {
    key: "industries",
    model: "industry",
    label: "Industries",
    singular: "Industry",
    icon: "building-2",
    orderBy: [{ order: "asc" }],
    listColumns: [
      { name: "name", label: "Name" },
      { name: "enabled", label: "Enabled" },
      { name: "order", label: "Order" },
    ],
    fields: [
      { name: "name", label: "Name", type: "text" },
      { name: "slug", label: "Slug", type: "text", help: "Leave blank to auto-generate." },
      { name: "icon", label: "Icon", type: "icon" },
      { name: "order", label: "Order", type: "number" },
      { name: "enabled", label: "Enabled", type: "boolean" },
    ],
  },
  faqs: {
    key: "faqs",
    model: "faq",
    label: "FAQs",
    singular: "FAQ",
    icon: "search",
    orderBy: [{ order: "asc" }],
    listColumns: [
      { name: "question", label: "Question" },
      { name: "status", label: "Status" },
    ],
    fields: [
      { name: "question", label: "Question", type: "text", full: true },
      { name: "answer", label: "Answer", type: "textarea", full: true },
      { name: "category", label: "Category", type: "text" },
      { name: "order", label: "Order", type: "number" },
      STATUS,
    ],
  },
  posts: {
    key: "posts",
    model: "post",
    label: "Blog",
    singular: "Post",
    icon: "pen-tool",
    orderBy: [{ createdAt: "desc" }],
    listColumns: [
      { name: "title", label: "Title" },
      { name: "status", label: "Status" },
    ],
    fields: [
      { name: "title", label: "Title", type: "text" },
      { name: "slug", label: "Slug", type: "text", help: "Leave blank to auto-generate." },
      { name: "author", label: "Author", type: "text" },
      { name: "excerpt", label: "Excerpt", type: "textarea", full: true },
      { name: "body", label: "Body", type: "textarea", full: true, help: "Blank line = new paragraph." },
      { name: "coverUrl", label: "Cover image URL", type: "image", full: true },
      { name: "tags", label: "Tags", type: "list", full: true, help: "One tag per line." },
      STATUS,
    ],
  },
  navigation: {
    key: "navigation",
    model: "navItem",
    label: "Navigation",
    singular: "Menu link",
    icon: "workflow",
    orderBy: [{ order: "asc" }],
    listColumns: [
      { name: "label", label: "Label" },
      { name: "url", label: "URL" },
      { name: "location", label: "Menu" },
      { name: "enabled", label: "Enabled" },
    ],
    fields: [
      { name: "label", label: "Label", type: "text" },
      { name: "url", label: "URL", type: "text", help: "e.g. /services or https://…" },
      {
        name: "location",
        label: "Menu",
        type: "select",
        options: [
          { value: "HEADER", label: "Header" },
          { value: "FOOTER", label: "Footer" },
        ],
      },
      { name: "order", label: "Order", type: "number" },
      { name: "openInNew", label: "Open in new tab", type: "boolean" },
      { name: "enabled", label: "Enabled", type: "boolean" },
    ],
  },
  leads: {
    key: "leads",
    model: "lead",
    label: "Leads",
    singular: "Lead",
    icon: "mail",
    orderBy: [{ createdAt: "desc" }],
    noCreate: true,
    listColumns: [
      { name: "name", label: "Name" },
      { name: "email", label: "Email" },
      { name: "company", label: "Company" },
      { name: "status", label: "Status" },
      { name: "createdAt", label: "Received" },
    ],
    fields: [
      { name: "name", label: "Name", type: "text" },
      { name: "email", label: "Email", type: "text" },
      { name: "phone", label: "Phone", type: "text" },
      { name: "company", label: "Company", type: "text" },
      { name: "message", label: "Message", type: "textarea", full: true },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: [
          { value: "NEW", label: "New" },
          { value: "CONTACTED", label: "Contacted" },
          { value: "QUALIFIED", label: "Qualified" },
          { value: "WON", label: "Won" },
          { value: "LOST", label: "Lost" },
        ],
      },
    ],
  },
};

export const RESOURCE_LIST = Object.values(RESOURCES);

export function getResource(key: string): Resource | undefined {
  return RESOURCES[key];
}
