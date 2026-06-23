// Config-driven admin: one list page + one form page render every collection
// from these definitions. `model` is the Prisma delegate name.

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "boolean"
  | "select"
  | "status"
  | "image"
  | "icon"
  | "list" // newline-separated -> string[]
  | "json"; // JSON textarea

export type Field = {
  name: string;
  label: string;
  type: FieldType;
  help?: string;
  full?: boolean; // span both columns
  options?: { value: string; label: string }[];
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
      { name: "slug", label: "Slug", type: "text", help: "Leave blank to auto-generate from title." },
      { name: "icon", label: "Icon", type: "icon" },
      { name: "summary", label: "Summary", type: "textarea", full: true },
      { name: "description", label: "Description", type: "textarea", full: true, help: "Blank line = new paragraph." },
      { name: "imageUrl", label: "Image URL", type: "image" },
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
    singular: "Project",
    icon: "presentation",
    orderBy: [{ order: "asc" }],
    listColumns: [
      { name: "title", label: "Title" },
      { name: "industry", label: "Industry" },
      { name: "status", label: "Status" },
    ],
    fields: [
      { name: "title", label: "Title", type: "text" },
      { name: "slug", label: "Slug", type: "text", help: "Leave blank to auto-generate." },
      { name: "client", label: "Client", type: "text" },
      { name: "industry", label: "Industry", type: "text" },
      { name: "year", label: "Year", type: "number" },
      { name: "url", label: "External URL", type: "text" },
      { name: "summary", label: "Summary", type: "textarea", full: true },
      { name: "description", label: "Description", type: "textarea", full: true },
      { name: "coverUrl", label: "Cover image URL", type: "image", full: true },
      { name: "gallery", label: "Gallery image URLs", type: "list", full: true, help: "One image URL per line." },
      { name: "services", label: "Service tags", type: "list", full: true, help: "One tag per line." },
      { name: "results", label: "Results", type: "json", full: true, help: '[{"label":"Leads","value":"+180%"}]' },
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
