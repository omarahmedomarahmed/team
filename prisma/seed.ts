/**
 * Seed — populates the site with Omar Abdelgawad's executive portfolio content.
 * Re-runnable: it clears content tables, then recreates everything.
 * Where a real detail (a metric, a contact handle, an image) wasn't provided it
 * is left blank or marked [ADD DETAIL] for editing in God Mode — never invented.
 */
import { PrismaClient, SectionType, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Placeholder media helpers (kept for any non-noBg section an owner adds later).
const PICSUM = (seed: string, w = 1920, h = 1080) =>
  `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;
const HERO_VIDEO =
  "https://assets.mixkit.co/videos/preview/mixkit-waves-coming-to-the-beach-5016-large.mp4";

// Just a stamp written onto the settings row. Changing it does NOT wipe
// anything — the seed only fully runs on an empty database (or SEED_FORCE=1).
const SEED_VERSION = "5";

async function reset() {
  // Delete children before parents to respect FKs.
  await prisma.section.deleteMany();
  await prisma.page.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.user.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.mediaAsset.deleteMany();
  await prisma.navItem.deleteMany();
  await prisma.module.deleteMany();
  await prisma.siteSettings.deleteMany();
  await prisma.service.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.testimonial.deleteMany();
  await prisma.industry.deleteMany();
  await prisma.faq.deleteMany();
  await prisma.post.deleteMany();
  await prisma.timelineYear.deleteMany();
  await prisma.experience.deleteMany();
}

/**
 * Convert the old free-text slug links into stable id-based links, and repair
 * the specific references that broke when items were renamed in the admin.
 *
 * Safe to run on live data: it only *fills in* ids that are missing or point at
 * a record that no longer exists, and never clears a link that already resolves.
 * Timeline years and portfolio items point at experiences; the Experience →
 * Portfolio direction is then derived from those ids (one source of truth).
 */
async function unifyLinks() {
  const experiences = await prisma.experience.findMany({
    select: { id: true, slug: true, company: true, role: true },
  });
  if (!experiences.length) return;

  const byId = new Map(experiences.map((e) => [e.id, e]));
  const bySlug = new Map(experiences.map((e) => [e.slug, e]));

  // Locate the "AI products" experience however it is currently named or slugged
  // (it was renamed from `ai-product-builder`, which broke the links into it).
  const aiExp =
    experiences.find((e) => e.slug === "ai-product-builder") ||
    experiences.find((e) => /multiple ai|ai product|ai-product/i.test(`${e.slug} ${e.company} ${e.role ?? ""}`)) ||
    null;
  // Slugs that used to resolve to the AI experience before the renames.
  const AI_ALIASES = new Set(["ai-product-builder", "24therapy", "24-therapy", "multiple ai products"]);

  const resolve = (currentId: string | null, slug: string | null): string | null => {
    if (currentId && byId.has(currentId)) return currentId; // keep a good id
    if (slug && bySlug.has(slug)) return bySlug.get(slug)!.id; // resolve a valid slug
    if (slug && aiExp && AI_ALIASES.has(slug.toLowerCase())) return aiExp.id; // repair a known alias
    return null;
  };

  // Portfolio items → their parent experience (single).
  const projects = await prisma.project.findMany({
    select: { id: true, experienceId: true, experienceSlug: true },
  });
  for (const p of projects) {
    const resolved = resolve(p.experienceId ?? null, p.experienceSlug ?? null);
    if (resolved && resolved !== p.experienceId) {
      await prisma.project.update({ where: { id: p.id }, data: { experienceId: resolved } });
    }
  }

  // Timeline years → their case study/studies (one or more).
  const years = await prisma.timelineYear.findMany({
    select: { id: true, experienceIds: true, experienceSlug: true },
  });
  for (const y of years) {
    const existing = Array.isArray(y.experienceIds)
      ? (y.experienceIds as unknown[]).filter((x): x is string => typeof x === "string")
      : [];
    const good = existing.filter((id) => byId.has(id));
    let ids = good;
    if (!ids.length) {
      const resolved = resolve(null, y.experienceSlug ?? null);
      if (resolved) ids = [resolved];
    }
    if (ids.length && JSON.stringify(ids) !== JSON.stringify(existing)) {
      await prisma.timelineYear.update({ where: { id: y.id }, data: { experienceIds: ids } });
    }
  }
}

// ---------------------------------------------------------------------------
//  Content revision V2 — the corrected career (voice-dictated). Applied the
//  SAME way to a fresh seed and to the live database, so both tell one story.
//  Everything here is additive or a targeted field update; uploaded images
//  (timeline imageUrl/gallery, logos, covers) are never touched.
// ---------------------------------------------------------------------------

// Match an experience robustly by canonical slug OR a name pattern, so it is
// found even after slugs/titles were renamed in the admin.
const EXP_MATCHERS: { key: string; slug: string; re: RegExp }[] = [
  { key: "icall-outsourcing", slug: "icall-outsourcing", re: /icall/i },
  { key: "vodafone-uk", slug: "vodafone-uk", re: /vodafone/i },
  { key: "3sixty", slug: "3sixty", re: /3\s*sixty|threesixty|\b360\b/i },
  { key: "fund-ourselves", slug: "fund-ourselves", re: /fund\s*ourselves|welendus|we\s*lend/i },
  { key: "skate-it", slug: "skate-it", re: /skate/i },
  { key: "el3b", slug: "el3b", re: /el\s*3\s*b/i },
  { key: "tedx-cairo-university", slug: "tedx-cairo-university", re: /tedx/i },
  { key: "heru", slug: "heru", re: /\bheru\b/i },
  { key: "xanadu", slug: "xanadu", re: /xanadu/i },
  { key: "commercial-real-estate", slug: "commercial-real-estate", re: /commercial real estate|cresa/i },
  { key: "ai-product-builder", slug: "ai-product-builder", re: /ai product|multiple ai|ai-product/i },
];

type ExpLite = { id: string; slug: string; company: string; role?: string | null; order?: number };
function findExp(list: ExpLite[], key: string): ExpLite | null {
  const m = EXP_MATCHERS.find((x) => x.key === key);
  if (!m) return null;
  return (
    list.find((e) => e.slug === m.slug) ||
    list.find((e) => m.re.test(`${e.slug} ${e.company} ${e.role ?? ""}`)) ||
    null
  );
}

// The corrected timeline: which experience(s) each year shows.
const TIMELINE_EXPERIENCES: Record<number, string[]> = {
  2017: ["icall-outsourcing"],
  2018: ["vodafone-uk"],
  2019: ["vodafone-uk"],
  2020: ["3sixty"],
  2021: ["fund-ourselves"],
  2022: ["fund-ourselves"],
  2023: ["skate-it", "el3b"],
  2024: ["heru", "tedx-cairo-university", "xanadu"],
  2025: ["commercial-real-estate", "ai-product-builder", "heru"],
  2026: ["ai-product-builder"],
};

// The new Business Development consulting experience.
const XANADU_EXPERIENCE = {
  slug: "xanadu",
  company: "Xanadu",
  role: "Business Development Consultant",
  period: "2024",
  location: null as string | null,
  industry: "Consulting · Business Development · Advisory",
  category: "Business Development & Sales",
  overview:
    "Worked as a business development consultant with Xanadu, advising eight companies, apps, and startups across e-commerce, drop-shipping, cyber-security, SaaS, legal tech, and design. Combined advisory work with hands-on execution — building outbound and enterprise-sales motions and closing deals directly for several of the brands.",
  challenges: ["Advising across very different industries", "Turning strategy into real pipeline", "Standing up outbound from scratch"],
  contributions: ["Advised founders and leadership teams", "Built and ran direct business development", "Closed enterprise deals for multiple brands"],
  responsibilities: [
    "Advised on go-to-market and growth strategy",
    "Built outbound and enterprise-sales motions",
    "Ran direct outreach and prospecting",
    "Closed deals and partnerships",
    "Designed sales processes and CRM",
    "Coached client teams on business development",
  ],
  achievements: [
    { title: "8 brands", description: "Advised e-commerce, SaaS, security, legal and design companies" },
    { title: "Advisory + execution", description: "Both consulting and hands-on deal closing" },
    { title: "Enterprise sales", description: "Direct outreach and closing for multiple clients" },
    { title: "Go-to-market", description: "Stood up repeatable outbound motions" },
  ],
  skills: ["Business Development", "Enterprise Sales", "Go-to-Market", "Advisory", "Consulting", "Partnerships", "CRM", "Sales Strategy"],
  footerLesson: "Great consulting is measured by the pipeline and deals it creates, not just the advice it gives.",
};

// The eight brands advised under Xanadu — each becomes a portfolio item.
const XANADU_CLIENTS = [
  { slug: "nabda", title: "Nabda", category: "E-commerce", summary: "Advisory and business development for Nabda, an online store.", services: ["Advisory", "Business Development"] },
  { slug: "taager", title: "Taager", category: "E-commerce", summary: "Consulting and business development for Taager, a drop-shipping platform.", services: ["Advisory", "Business Development"] },
  { slug: "asfaleia", title: "Asfaleia", category: "Cybersecurity", summary: "Advisory and enterprise sales for Asfaleia, a cyber-security company.", services: ["Advisory", "Enterprise Sales"] },
  { slug: "bricks", title: "Bricks", category: "SaaS", summary: "Consulting and business development for Bricks, a sales CRM platform.", services: ["Advisory", "Business Development"] },
  { slug: "knowteq-holdings", title: "Knowteq Holdings", category: "Holdings", summary: "Advisory for Knowteq Holdings.", services: ["Advisory"] },
  { slug: "fawelly", title: "Fawelly", category: "App", summary: "Consulting and business development for Fawelly, a consumer app.", services: ["Advisory", "Business Development"] },
  { slug: "contrato", title: "Contrato", category: "Legal Tech", summary: "Advisory and business development for Contrato, a legal-services platform.", services: ["Advisory", "Business Development"] },
  { slug: "tremoloo", title: "Tremoloo", category: "Design", summary: "Consulting and business development for Tremoloo, a UX/UI design studio.", services: ["Advisory", "Business Development"] },
];

// Targeted field updates to existing experiences (period moves + relabels).
// Only these scalar fields are touched — the rest of each case study is left as-is.
const EXPERIENCE_UPDATES: { key: string; data: Record<string, unknown> }[] = [
  { key: "skate-it", data: { period: "2022 – 2023" } },
  { key: "el3b", data: { period: "2023" } },
  {
    key: "tedx-cairo-university",
    data: {
      period: "2024",
      overview:
        "Delivered a TEDx talk on how emotions shape our decisions — exploring the influence of emotion and bias over the choices we make every day, and how becoming aware of those forces leads to clearer, better decision-making.",
    },
  },
  { key: "heru", data: { period: "2024 – Present" } },
  {
    key: "commercial-real-estate",
    data: {
      company: "CRESA",
      period: "2025 – Present",
      overview:
        "Joined CRESA, a New York commercial real estate brokerage, working across office leasing, retail expansion, and multifamily investment with brokers, investors, landlords, and C-level executives — strengthening enterprise sales, consultative selling, occupancy analysis, and investment decision-making.",
    },
  },
];

// New copy for the years whose meaning changed (2022–2026). Images are preserved.
const TIMELINE_CONTENT: Record<
  number,
  { stageTitle: string; story: string; tags: string[]; learningPoints: string[]; takeaway: string; footerQuote: string; stats: { label: string; value: string }[] }
> = {
  2022: {
    stageTitle: "Scaling Operations Across Two Countries",
    story:
      "As Fund Ourselves grew, I built its customer operations from a single seat into a team — then stood up a second operation in the US under WeLendUs, managing support, complaints, and collections across both countries.",
    tags: ["Operations Manager", "Fund Ourselves · WeLendUs"],
    learningPoints: [
      "Built the first customer-support function from zero",
      "Grew and led the support team as the company scaled",
      "Launched US operations under WeLendUs",
      "Managed six teams across the US and UK",
    ],
    takeaway: "Scaling a company is really about scaling its systems and its teams.",
    footerQuote: "Operations is where strategy meets reality.",
    stats: [
      { label: "Teams", value: "6" },
      { label: "Countries", value: "2" },
      { label: "Role", value: "Operations Manager" },
    ],
  },
  2023: {
    stageTitle: "From Employee to Founder",
    story:
      "I left operations to build my own companies — founding Skate-It, Egypt's first registered skateboard factory, then co-founding EL3B, a closed-loop payment wallet for young gamers.",
    tags: ["Skate-It — Founder", "EL3B — Co-Founder"],
    learningPoints: [
      "Founded Egypt's first registered skateboard factory",
      "Navigated an inflation crisis and pivoted quickly",
      "Co-founded EL3B, a fintech wallet for gamers",
      "Built and tested EL3B's first functional MVP",
    ],
    takeaway: "Entrepreneurship taught me that uncertainty is the environment, not the exception.",
    footerQuote: "Building companies is the fastest way to learn how they really work.",
    stats: [
      { label: "Companies founded", value: "2" },
      { label: "Industries", value: "Manufacturing → FinTech" },
      { label: "Biggest lesson", value: "Resilience" },
    ],
  },
  2024: {
    stageTitle: "Product, Stage & Advisory",
    story:
      "I co-founded HERU, an esports platform; gave a TEDx talk on how emotions shape our decisions; and advised eight companies as a business-development consultant with Xanadu.",
    tags: ["HERU — Founder", "TEDx Speaker", "Xanadu — BD Consultant"],
    learningPoints: [
      "Co-founded HERU and began building its platform",
      "Delivered a TEDx talk on emotion and decision-making",
      "Advised eight brands as a consultant with Xanadu",
      "Ran direct business development and enterprise sales",
    ],
    takeaway: "One year taught me to build products, tell stories on stage, and sell into the enterprise.",
    footerQuote: "Strategy, storytelling and sales are the same muscle.",
    stats: [
      { label: "Venture", value: "HERU" },
      { label: "Talk", value: "TEDx" },
      { label: "Brands advised", value: "8" },
    ],
  },
  2025: {
    stageTitle: "The AI Turning Point",
    story:
      "AI changed how I build. I joined CRESA, a New York commercial real estate brokerage, used AI for research, analysis and presentations, finally shipped HERU's MVP with AI, and built new products like GYMAWY and Tourista.",
    tags: ["CRESA — Commercial Real Estate", "AI Product Builder", "HERU"],
    learningPoints: [
      "Joined CRESA, commercial real estate in New York",
      "Used AI for analysis, dashboards and presentations",
      "Shipped HERU's MVP with AI — without a full-time CTO",
      "Built production MVPs like GYMAWY and Tourista",
    ],
    takeaway: "AI didn't replace my workflow — it multiplied what I could build.",
    footerQuote: "AI is most valuable when combined with deep business understanding.",
    stats: [
      { label: "Presentations", value: "200+" },
      { label: "MVPs", value: "10+" },
      { label: "Market", value: "New York" },
    ],
  },
  2026: {
    stageTitle: "Building AI Products",
    story:
      "I'm building production-ready AI products end to end — including ARIA CRM, an AI-powered real-estate CRM, and 24Therapy, an AI product for therapists.",
    tags: ["AI Product Builder", "ARIA CRM", "24Therapy"],
    learningPoints: [
      "Built ARIA CRM, an AI-powered real-estate CRM",
      "Built 24Therapy for mental-health professionals",
      "Turned ideas into production MVPs using AI",
      "Combined business strategy with AI execution",
    ],
    takeaway: "My career is defined by the systems and products I build, not the companies I've worked for.",
    footerQuote: "Always learning. Always building. Always curious.",
    stats: [
      { label: "Products", value: "Multiple" },
      { label: "Mission", value: "Building AI businesses" },
      { label: "Years", value: "9+" },
    ],
  },
};

// Home page section order: hero → logos → portfolio → timeline → stats → by-category → cta.
const HOME_SECTION_ORDER: Record<string, number> = {
  PORTRAIT_HERO: 0,
  HERO: 0,
  LOGOS: 1,
  PORTFOLIO: 2,
  TIMELINE: 3,
  STATS: 4,
  EXPERIENCE_INDEX: 5,
  CTA: 6,
  CONTACT: 7,
};

async function applyTimelineExperienceLinks() {
  const experiences = await prisma.experience.findMany({
    select: { id: true, slug: true, company: true, role: true },
  });
  const years = await prisma.timelineYear.findMany({ select: { id: true, year: true } });
  for (const y of years) {
    const keys = TIMELINE_EXPERIENCES[y.year];
    if (!keys) continue;
    const ids = keys.flatMap((k) => {
      const e = findExp(experiences, k);
      return e ? [e.id] : [];
    });
    if (ids.length) await prisma.timelineYear.update({ where: { id: y.id }, data: { experienceIds: ids } });
  }
}

async function reorderHomeSections() {
  const home = await prisma.page.findFirst({ where: { isHome: true }, include: { sections: true } });
  if (!home) return;
  for (const s of home.sections) {
    const order = HOME_SECTION_ORDER[s.type];
    if (order != null && order !== s.order) {
      await prisma.section.update({ where: { id: s.id }, data: { order } });
    }
  }
}

async function applyContentV2() {
  let experiences: ExpLite[] = await prisma.experience.findMany({
    select: { id: true, slug: true, company: true, role: true, order: true },
  });

  // Tidy the AI experience's slug (safe now that links are by id).
  const ai = findExp(experiences, "ai-product-builder");
  if (ai && ai.slug !== "ai-product-builder" && !experiences.some((e) => e.slug === "ai-product-builder" && e.id !== ai.id)) {
    await prisma.experience.update({ where: { id: ai.id }, data: { slug: "ai-product-builder" } });
  }

  // Add the Xanadu experience if it isn't there yet.
  if (!findExp(experiences, "xanadu")) {
    const maxOrder = experiences.reduce((m, e) => Math.max(m, e.order ?? 0), 0);
    await prisma.experience.create({ data: { ...XANADU_EXPERIENCE, order: maxOrder + 1, featured: false } });
  }

  experiences = await prisma.experience.findMany({
    select: { id: true, slug: true, company: true, role: true, order: true },
  });
  const xanadu = findExp(experiences, "xanadu");

  // Period moves + relabels on existing experiences.
  for (const u of EXPERIENCE_UPDATES) {
    const e = findExp(experiences, u.key);
    if (e) await prisma.experience.update({ where: { id: e.id }, data: u.data });
  }

  // The eight Xanadu client portfolio items (create if missing; link if present).
  if (xanadu) {
    for (const [i, c] of XANADU_CLIENTS.entries()) {
      const existing = await prisma.project.findUnique({ where: { slug: c.slug } });
      if (!existing) {
        await prisma.project.create({
          data: {
            slug: c.slug,
            title: c.title,
            category: c.category,
            summary: c.summary,
            services: c.services,
            experienceId: xanadu.id,
            experienceSlug: "xanadu",
            year: 2024,
            order: 100 + i,
            featured: false,
          },
        });
      } else if (!existing.experienceId) {
        await prisma.project.update({ where: { id: existing.id }, data: { experienceId: xanadu.id } });
      }
    }
  }

  // Timeline: fix the mangled 2018 title, rewrite the moved years' copy (images
  // preserved), then set each year's experience links by id.
  const years = await prisma.timelineYear.findMany({ select: { id: true, year: true } });
  for (const y of years) {
    if (y.year === 2018) {
      await prisma.timelineYear.update({ where: { id: y.id }, data: { stageTitle: "Understanding Customer Experience" } });
    }
    const c = TIMELINE_CONTENT[y.year];
    if (c) {
      await prisma.timelineYear.update({
        where: { id: y.id },
        data: {
          stageTitle: c.stageTitle,
          story: c.story,
          tags: c.tags,
          learningPoints: c.learningPoints,
          takeaway: c.takeaway,
          footerQuote: c.footerQuote,
          stats: c.stats,
        },
      });
    }
  }
  await applyTimelineExperienceLinks();

  await reorderHomeSections();
}

// Backfill new fields on existing installs without wiping content. Each block is
// guarded by a one-time marker in settings.extra so later manual edits are safe.
async function patchDefaults(current: unknown) {
  const settings = current as { id: string; extra?: unknown } | null;
  if (!settings) return;
  const extra = (settings.extra && typeof settings.extra === "object" ? settings.extra : {}) as Record<string, unknown>;
  const next = { ...extra };
  if (!extra.linksUnifiedV1) {
    await unifyLinks();
    next.linksUnifiedV1 = true;
    console.log("Unified timeline/portfolio links to experiences by id (one-time).");
  }
  if (!extra.contentV2) {
    await applyContentV2();
    next.contentV2 = true;
    console.log("Applied content V2: Xanadu, timeline remap, period fixes, home order (one-time).");
  }
  if (JSON.stringify(next) !== JSON.stringify(extra)) {
    await prisma.siteSettings.update({ where: { id: settings.id }, data: { extra: next as Prisma.InputJsonValue } });
  }
}

async function main() {
  // Never wipe a database that already has content. A destructive (re)seed runs
  // ONLY for a fresh database, or when SEED_FORCE=1 is set explicitly — so your
  // Admin edits, uploads and settings survive every code redeploy.
  const current = await prisma.siteSettings.findFirst();
  if (current && !process.env.SEED_FORCE) {
    await patchDefaults(current);
    console.log("Existing database — preserving all content. Set SEED_FORCE=1 for one deploy to reload seed data.");
    return;
  }

  await reset();

  // ----------------------------- Settings --------------------------------
  await prisma.siteSettings.create({
    data: {
      siteName: "Omar Abdelgawad",
      legalName: "Omar Abdelgawad",
      tagline: "Building products, businesses, and scalable systems from the ground up.",
      description:
        "The executive portfolio of Omar Abdelgawad — nearly a decade of evolution from sales and operations to entrepreneurship, product strategy, commercial real estate, and AI-powered product building.",
      logoText: "Omar Abdelgawad",
      // Light editorial theme.
      primaryColor: "#6E4A6B",
      accentColor: "#BBA0B8",
      bgColor: "#FAF6F9",
      fgColor: "#322331",
      // Contact details are left blank — add yours in God Mode → Settings.
      email: null,
      phone: null,
      address: null,
      socials: [],
      contactConfig: {
        fields: [
          { name: "name", label: "Your name", type: "text", required: true },
          { name: "email", label: "Email", type: "email", required: true },
          { name: "company", label: "Company / organization", type: "text", required: false },
          { name: "message", label: "Your message", type: "textarea", required: true },
        ],
      },
      metaTitle: "Omar Abdelgawad — Founder, Product Strategist & AI Systems Architect",
      metaDescription:
        "A decade of evolution (2017–2026): from sales and operations to entrepreneurship, product strategy, commercial real estate, and AI-powered product building.",
      extra: { seedVersion: SEED_VERSION, linksUnifiedV1: true, contentV2: true },
    },
  });

  // ----------------------------- Modules ---------------------------------
  const modules = [
    ["contact", "Contact"],
    ["blog", "Blog"],
    ["ai_blog", "AI Blog Generation"],
  ];
  await prisma.module.createMany({
    data: modules.map(([key, label], i) => ({ key, label, enabled: true, order: i })),
  });

  // ----------------------------- Navigation ------------------------------
  // Categories group experiences and also become standalone pages.
  const CATEGORIES: { name: string; slug: string }[] = [
    { name: "Business Development & Sales", slug: "business-development-sales" },
    { name: "Customer Support & Operations", slug: "customer-support-operations" },
    { name: "Entrepreneurship", slug: "entrepreneurship" },
    { name: "Product & AI", slug: "product-ai" },
    { name: "Public Speaking", slug: "public-speaking" },
  ];

  // Header: Experience (with a category dropdown), Portfolio, Contact.
  const experienceParent = await prisma.navItem.create({
    data: { label: "Experience", url: "/experience", location: "HEADER", order: 0 },
  });
  await prisma.navItem.createMany({
    data: [
      { label: "By year", url: "/experience", location: "HEADER" as const, order: 0, parentId: experienceParent.id },
      ...CATEGORIES.map((c, i) => ({
        label: c.name,
        url: `/${c.slug}`,
        location: "HEADER" as const,
        order: i + 1,
        parentId: experienceParent.id,
      })),
      { label: "Portfolio", url: "/portfolio", location: "HEADER" as const, order: 1 },
      { label: "Contact", url: "/contact", location: "HEADER" as const, order: 2 },
      { label: "Experience", url: "/experience", location: "FOOTER" as const, order: 0 },
      { label: "Portfolio", url: "/portfolio", location: "FOOTER" as const, order: 1 },
      { label: "Contact", url: "/contact", location: "FOOTER" as const, order: 2 },
    ],
  });

  // --------------------------- Career timeline ---------------------------
  const timeline = [
    {
      year: 2017,
      stageTitle: "Learning How Businesses Grow",
      story:
        "My career began by learning how people make decisions, how businesses sell, and how teams perform under pressure.",
      tags: ["Telesales Rep → Team Leader", "iCall Outsourcing"],
      learningPoints: [
        "Built strong sales communication skills",
        "Learned customer psychology and objection handling",
        "Developed leadership through coaching and team management",
        "Discovered the importance of measurable performance",
      ],
      takeaway: "Sales taught me that every business problem starts with understanding people.",
      footerQuote: "The foundation of every product begins with understanding its customer.",
      stats: [],
      experienceSlug: "icall-outsourcing",
    },
    {
      year: 2018,
      stageTitle: "Understanding Customer Experience",
      story:
        "Moved beyond selling into customer support, learning how operational excellence creates trust and long-term customer relationships.",
      tags: ["Customer Support · SME Support", "Vodafone UK"],
      learningPoints: [
        "Solved customer problems under pressure",
        "Learned structured support processes",
        "Improved communication with diverse customers",
        "Experienced enterprise operational standards",
      ],
      takeaway: "Great customer experience is built through consistency, not luck.",
      footerQuote: "Customer experience became the lens through which I evaluated every product.",
      stats: [],
      experienceSlug: "vodafone-uk",
    },
    {
      year: 2019,
      stageTitle: "Building Better Systems",
      story: "Shifted from serving customers to improving the systems that served them.",
      tags: ["Quality Assurance · Operations", "Vodafone UK"],
      learningPoints: [
        "Audited operational performance",
        "Improved quality standards",
        "Identified process inefficiencies",
        "Learned data-driven decision making",
      ],
      takeaway: "Optimizing systems creates greater impact than optimizing individual tasks.",
      footerQuote: "Systems thinking became a permanent part of how I solve problems.",
      stats: [],
      experienceSlug: "vodafone-uk",
    },
    {
      year: 2020,
      stageTitle: "Technology Meets Customer Success",
      story:
        "Entered HealthTech, combining technical problem solving with customer support in a highly specialized software environment.",
      tags: ["Technical Support · Healthcare Technology", "3Sixty (Dental Software)"],
      learningPoints: [
        "Supported specialized healthcare software",
        "Solved technical issues remotely",
        "Worked directly with healthcare professionals",
        "Strengthened technical communication",
      ],
      takeaway: "Technology only creates value when people can confidently use it.",
      footerQuote: "Technology succeeds only when it improves the human experience.",
      stats: [],
      experienceSlug: "3sixty",
    },
    {
      year: 2021,
      stageTitle: "Learning Startup Operations",
      story:
        "Joined fast-moving fintech startups, expanding from operations into leadership, customer success, and business execution.",
      tags: ["Operations · Customer Success · Leadership", "Fund Ourselves · Welendus"],
      learningPoints: [
        "Managed customer operations",
        "Improved startup processes",
        "Worked across multiple business functions",
        "Experienced startup execution at scale",
      ],
      takeaway:
        "Startups taught me that speed matters — but systems determine whether growth is sustainable.",
      footerQuote: "Execution without systems creates chaos. Systems turn execution into growth.",
      stats: [],
      experienceSlug: "fund-ourselves",
    },
    {
      year: 2022,
      stageTitle: "From Employee to Founder",
      story:
        "After years of learning how businesses operate, I took the leap into entrepreneurship by building products from the ground up.",
      tags: ["Skate-It — Founder", "EL3B — Co-Founder (late 2022)"],
      learningPoints: [
        "Founded Egypt's first registered skateboard manufacturing company",
        "Experienced the realities of building a physical business during economic uncertainty",
        "Pivoted quickly after market conditions changed following the inflation crisis",
        "Began solving financial accessibility for young gamers through technology",
      ],
      takeaway: "This year marked the transition from executing within companies to creating companies.",
      footerQuote: "Entrepreneurship taught me that uncertainty is not the exception — it is the environment.",
      stats: [
        { label: "Experience Type", value: "Founder" },
        { label: "Industry", value: "Manufacturing → FinTech" },
        { label: "Biggest Lesson", value: "Resilience" },
      ],
      experienceSlug: "skate-it",
    },
    {
      year: 2023,
      stageTitle: "Learning Product Thinking",
      story:
        "One startup ended, another began, and I shifted my focus from building businesses to building technology products.",
      tags: ["EL3B", "TEDx Cairo University", "HERU"],
      learningPoints: [
        "Built and tested EL3B's first functional MVP",
        "Delivered a TEDx talk on decision-making and behavioral influence",
        "Founded HERU to solve infrastructure challenges within esports",
        "Began thinking like a Product Manager rather than only a founder",
      ],
      takeaway: "The best founders eventually become product thinkers.",
      footerQuote: "The best founders eventually become product thinkers.",
      stats: [
        { label: "Products Founded", value: "2" },
        { label: "Public Speaking", value: "TEDx" },
        { label: "Industry", value: "Gaming Technology" },
      ],
      experienceSlug: "heru",
    },
    {
      year: 2024,
      stageTitle: "Understanding Enterprise Business",
      story:
        "While building HERU, I entered commercial real estate and began working directly with enterprise clients, investors, and C-level executives.",
      tags: ["HERU", "Commercial Real Estate — Office · Retail · Multifamily"],
      learningPoints: [
        "Continued building HERU's product strategy and platform architecture",
        "Worked directly with CFOs, CHROs and executive decision makers",
        "Learned commercial leasing strategy and occupancy analysis",
        "Strengthened enterprise communication and consultative selling",
      ],
      takeaway: "Enterprise conversations taught me how strategy drives every business decision.",
      footerQuote: "Enterprise conversations taught me how strategy drives every business decision.",
      stats: [
        { label: "Industries", value: "3+" },
        { label: "Enterprise", value: "Yes" },
        { label: "Market", value: "United States" },
      ],
      experienceSlug: "commercial-real-estate",
    },
    {
      year: 2025,
      stageTitle: "The AI Turning Point",
      story:
        "Artificial Intelligence transformed the way I build products, allowing me to move from ideas to functional software at unprecedented speed.",
      tags: ["AI Product Builder"],
      learningPoints: [
        "Built complete brands using AI",
        "Designed and launched websites using AI",
        "Created production-ready MVPs with authentication and databases",
        "Developed repeatable systems for rapid product development",
      ],
      takeaway: "AI didn't replace my workflow — it multiplied what I was capable of building.",
      footerQuote: "AI didn't replace my workflow — it multiplied what I was capable of building.",
      stats: [
        { label: "Presentations", value: "200+" },
        { label: "Websites", value: "30+" },
        { label: "Functional MVPs", value: "10+" },
      ],
      experienceSlug: "ai-product-builder",
    },
    {
      year: 2026,
      stageTitle: "Building the Future",
      story:
        "Today I combine entrepreneurship, product strategy, commercial experience and AI to build scalable technology companies and business systems.",
      tags: [
        "Founder",
        "HERU",
        "AI Product Builder",
        "Business Systems",
        "Commercial Real Estate",
        "Product Strategy",
      ],
      learningPoints: [
        "Building HERU's next generation platform",
        "Designing AI-powered startups across multiple industries",
        "Creating production-ready business systems with AI",
        "Bridging business strategy with technology execution",
      ],
      takeaway:
        "My career is no longer defined by the companies I've worked for — but by the systems and products I'm building.",
      footerQuote: "Current products: HERU · Therapist AI Scribe · GYMAWY · Tourista · Real Estate CRM",
      stats: [
        { label: "Years", value: "9+" },
        { label: "Products", value: "Multiple" },
        { label: "Current Mission", value: "Building AI Businesses" },
      ],
      experienceSlug: "ai-product-builder",
    },
  ];
  await prisma.timelineYear.createMany({
    data: timeline.map((t, i) => ({ ...t, order: i })),
  });

  // --------------------------- Experience cases --------------------------
  const experiences = [
    {
      slug: "icall-outsourcing",
      company: "iCall Outsourcing",
      role: "Telesales Representative → Team Leader",
      period: "2017",
      location: null as string | null,
      industry: "Business Process Outsourcing · Sales · Customer Acquisition",
      overview:
        "Started my professional career in telesales before transitioning into leadership. This role developed the communication, persuasion, coaching, and performance-management skills that became the foundation for every leadership and product role that followed.",
      challenges: [
        "High-performance sales environment",
        "Customer acquisition targets",
        "Continuous team performance improvement",
      ],
      contributions: ["Exceeded performance expectations", "Developed communication skills", "Led and coached team members"],
      responsibilities: [
        "Generated outbound sales",
        "Handled customer objections",
        "Built client relationships",
        "Tracked performance metrics",
        "Coached team members",
        "Supported operational goals",
      ],
      achievements: [
        { title: "Leadership", description: "Promoted into team leadership" },
        { title: "Sales", description: "Built strong communication skills" },
        { title: "Coaching", description: "Mentored new team members" },
        { title: "Growth", description: "Foundation for future leadership" },
      ],
      skills: ["Sales", "Leadership", "Communication", "Coaching", "Negotiation", "CRM", "KPIs", "Customer Psychology"],
      footerLesson: "Sales taught me that every business begins with understanding people.",
    },
    {
      slug: "vodafone-uk",
      company: "Vodafone UK",
      role: "Customer Support → SME Support → Quality Assurance",
      period: "2018 – 2019",
      location: null,
      industry: "Telecommunications · Enterprise Support · Operations",
      overview:
        "Progressed through multiple roles within Vodafone UK, gaining experience across customer support, SME services, and quality assurance while learning enterprise-scale operations and customer-experience management.",
      challenges: ["Supporting enterprise customers", "Maintaining quality standards", "Improving customer satisfaction"],
      contributions: ["Resolved customer issues", "Improved service quality", "Strengthened operational consistency"],
      responsibilities: [
        "Delivered customer support",
        "Performed technical troubleshooting",
        "Supported SME accounts",
        "Audited quality",
        "Monitored performance",
        "Improved processes",
      ],
      achievements: [
        { title: "Customer Experience", description: "Enterprise service delivery" },
        { title: "Operations", description: "Process consistency" },
        { title: "Quality", description: "Operational auditing" },
        { title: "Growth", description: "Cross-functional experience" },
      ],
      skills: ["Customer Success", "Operations", "QA", "CRM", "Problem Solving", "Communication", "Auditing", "Process Improvement"],
      footerLesson: "Customer experience taught me that consistency creates trust.",
    },
    {
      slug: "3sixty",
      company: "3Sixty",
      role: "Technical Support Engineer, Healthcare Technology",
      period: "2020",
      location: null,
      industry: "HealthTech · Dental Software",
      overview:
        "Provided technical support for specialized healthcare software, working directly with clinics and professionals to resolve software issues while ensuring reliable system performance and a positive customer experience.",
      challenges: ["Healthcare software reliability", "Remote troubleshooting", "Customer confidence"],
      contributions: ["Resolved technical issues", "Supported healthcare professionals", "Improved product understanding"],
      responsibilities: [
        "Provided technical support",
        "Troubleshot remotely",
        "Investigated software issues",
        "Resolved incidents",
        "Communicated with customers",
        "Shared knowledge",
      ],
      achievements: [
        { title: "HealthTech", description: "Specialized software" },
        { title: "Technology", description: "Technical troubleshooting" },
        { title: "Support", description: "Customer confidence" },
        { title: "Growth", description: "Healthcare exposure" },
      ],
      skills: ["Technical Support", "Healthcare", "Communication", "Problem Solving", "Software", "CRM", "Customer Success", "Documentation"],
      footerLesson: "Technology creates value only when people trust it enough to use it.",
    },
    {
      slug: "fund-ourselves",
      company: "Fund Ourselves / Welendus",
      role: "Operations · Customer Success · Leadership",
      period: "2021",
      location: null,
      industry: "FinTech · Lending",
      overview:
        "Joined fast-growing fintech startups (Fund Ourselves / Welendus), working across customer success, operations, and leadership. Experienced venture-backed speed and adaptability while improving processes and executing across multiple business functions in a scaling lending environment. [ADD DETAIL: expand to 45–55 words]",
      challenges: ["Operating at startup speed", "Scaling customer operations", "Executing across multiple functions"],
      contributions: ["Managed customer operations", "Improved startup processes", "Worked across business functions"],
      responsibilities: [
        "Managed customer operations",
        "Improved processes",
        "Collaborated cross-functionally",
        "Optimized workflows",
        "Supported operations",
        "Monitored performance",
      ],
      achievements: [],
      skills: [
        "Operations",
        "Customer Success",
        "Leadership",
        "FinTech",
        "Startup Execution",
        "Workflow Design",
        "Cross-functional Communication",
        "Continuous Improvement",
      ],
      footerLesson: "Fast execution creates momentum; scalable systems create sustainable growth.",
    },
    {
      slug: "skate-it",
      company: "Skate-It",
      role: "Founder",
      period: "2022",
      location: "Egypt",
      industry: "Manufacturing · Consumer Products · Sports",
      overview:
        "Founded Egypt's first registered skateboard manufacturing company, creating local manufacturing for a market dependent on imports and building a recognizable Egyptian skate brand. Launched amid the post-war inflation crisis, which drove up costs and demand pressure, ultimately leading to closure later that year.",
      challenges: ["Economic instability and inflation crisis", "Rising manufacturing costs", "Market demand under macro pressure"],
      contributions: ["Founded the company", "Built the brand identity", "Established local manufacturing"],
      responsibilities: [
        "Developed the business model",
        "Defined brand identity",
        "Planned manufacturing operations",
        "Managed suppliers",
        "Oversaw production planning",
        "Coordinated logistics",
      ],
      achievements: [
        { title: "First-of-its-kind", description: "Egypt's first registered skateboard factory" },
        { title: "Brand", description: "Built an Egyptian skate brand" },
        { title: "Operations", description: "Stood up local manufacturing" },
        { title: "Resilience", description: "Navigated an inflation crisis" },
      ],
      skills: ["Entrepreneurship", "Manufacturing", "Operations", "Brand Strategy", "Supply Chain", "Product Development", "Business Planning", "Leadership"],
      footerLesson: "Building a business requires resilience, adaptability, and the ability to respond quickly to external market forces.",
    },
    {
      slug: "el3b",
      company: "EL3B",
      role: "Co-Founder · Head of Product · Head of Operations",
      period: "2022 – 2023",
      location: "Egypt",
      industry: "Gaming · FinTech · Payments",
      overview:
        "EL3B was a gaming-fintech startup building a closed-loop payment ecosystem for gamers under sixteen who lacked bank access. NFC-enabled cards linked to an internal currency (Ecoin), topped up via authorized gaming vendors across Egypt, with a vision to become a youth-focused digital wallet.",
      challenges: ["Educating the market", "Building user trust", "Vendor acquisition"],
      contributions: ["Defined product vision and roadmap", "Designed the wallet and top-up experience", "Built the vendor-network strategy"],
      responsibilities: [
        "Defined MVP scope",
        "Designed user and vendor onboarding",
        "Designed the wallet and top-up workflow",
        "Led brand identity",
        "Recruited vendors",
        "Conducted customer interviews",
      ],
      achievements: [
        { title: "MVP", description: "Built a functional MVP" },
        { title: "Network", description: "Established a physical vendor network" },
        { title: "Validation", description: "Validated demand through real-world testing" },
        { title: "Concept", description: "Differentiated fintech for underbanked gamers" },
      ],
      skills: ["Product Management", "Startup Operations", "Product Discovery", "Business Development", "UX Design", "Go-to-Market", "Partnership Development", "Fundraising Preparation"],
      footerLesson: "Product-market fit is discovered through customer conversations, not assumptions.",
    },
    {
      slug: "tedx-cairo-university",
      company: "TEDx Cairo University",
      role: "Speaker",
      period: "2023",
      location: "Cairo, Egypt",
      industry: "Public Speaking · Thought Leadership",
      overview:
        'Delivered a TEDx talk, "Decision Making & The Influence of Promotions," exploring how promotional techniques and cognitive biases shape everyday decisions — helping audiences recognize how external influences affect purchasing behavior and personal choices. [ADD DETAIL: expand to 45–55 words]',
      challenges: ["Translating research into a story", "Engaging a live audience", "Distilling a complex topic"],
      contributions: ["Researched and wrote the talk", "Designed the presentation", "Delivered on stage"],
      responsibilities: [
        "Researched the topic",
        "Developed the story",
        "Wrote the script",
        "Designed the slides",
        "Rehearsed the talk",
        "Delivered on stage",
      ],
      achievements: [{ title: "Stage", description: "Spoke at TEDx Cairo University" }],
      skills: ["Public Speaking", "Storytelling", "Communication", "Research", "Behavioral Psychology", "Presentation Design", "Stage Presence", "Thought Leadership"],
      footerLesson: "Ideas become far more powerful when communicated through compelling stories rather than information alone.",
    },
    {
      slug: "heru",
      company: "HERU",
      role: "Founder & CEO · Head of Product",
      period: "2023 – Present",
      location: "MENA",
      industry: "Esports · Product · AI",
      overview:
        "HERU is a multi-sided esports infrastructure platform combining talent discovery, tournament management, sponsorship matching, and organization workflows, with an AI-native product-development approach, built to serve the MENA esports ecosystem. [ADD DETAIL: expand to 45–55 words]",
      challenges: ["A fragmented esports ecosystem", "No central platform for talent, organizers, and brands", "Manual discovery and operations"],
      contributions: ["Defined product vision and architecture", "Built the community before launch", "Managed product pivots and CTO transitions"],
      responsibilities: [
        "Led product strategy",
        "Designed UX and wireframes",
        "Architected the platform",
        "Built the community",
        "Created PRDs and documentation",
        "Designed AI workflows",
      ],
      achievements: [
        { title: "Community", description: "Built an engaged community pre-launch" },
        { title: "Validation", description: "Validated demand via events and tournaments" },
        { title: "Documentation", description: "Extensive product docs and architecture" },
        { title: "Vision", description: "Scalable MENA esports platform" },
      ],
      skills: ["Product Strategy", "Business Architecture", "UX Design", "AI Workflow Design", "Community Building", "Roadmapping", "Documentation", "Leadership"],
      footerLesson: "The best founders eventually become product thinkers.",
    },
    {
      slug: "commercial-real-estate",
      company: "Commercial Real Estate",
      role: "Commercial Real Estate Associate — Office/Retail Leasing · Multifamily · Tenant Rep",
      period: "2024 – Present",
      location: "NYC · Manhattan · Upstate NY · Charlotte, NC",
      industry: "Commercial Real Estate · Brokerage",
      overview:
        "Entered U.S. commercial real estate, working with brokers, investors, landlords, developers, and C-level executives across office leasing, retail expansion, and multifamily investment — strengthening enterprise sales, consultative selling, occupancy analysis, and investment decision-making.",
      challenges: ["Reaching executive decision-makers", "Complex leasing and investment decisions", "Long enterprise sales cycles"],
      contributions: ["Generated enterprise opportunities", "Conducted occupancy and market analysis", "Built executive relationships"],
      responsibilities: [
        "Researched office buildings and lease expirations",
        "Conducted occupancy analysis",
        "Contacted executive decision-makers",
        "Presented lease and expansion strategy",
        "Maintained investor and retailer CRM",
        "Ran follow-up campaigns",
      ],
      achievements: [
        { title: "Enterprise", description: "Engaged CFOs, CHROs and real-estate directors" },
        { title: "Markets", description: "NYC, Upstate NY, Charlotte" },
        { title: "Scope", description: "Office, retail and multifamily" },
      ],
      skills: ["Commercial Real Estate", "Tenant Representation", "Occupancy Analysis", "Enterprise Sales", "Consultative Selling", "Negotiation", "Market Research", "CRM Management"],
      footerLesson: "Every commercial real estate transaction is ultimately a business-strategy decision, not just a property decision.",
    },
    {
      slug: "ai-product-builder",
      company: "AI Product Builder",
      role: "Founder · AI Product Builder · Business Systems Architect",
      period: "2025 – Present",
      location: null,
      industry: "Artificial Intelligence · Product Development · SaaS",
      overview:
        "Developed AI-native workflows that turn startup ideas into production-ready MVPs — generating brands, websites, applications, and business systems with dramatically reduced development time, using AI as an extension of product strategy rather than a replacement for expertise.",
      challenges: ["Moving from idea to working software fast", "Building production-ready apps (auth, DB, deploy)", "Defining the right problem"],
      contributions: ["Built repeatable AI build workflows", "Shipped multiple MVPs", "Created brands, sites, and docs with AI"],
      responsibilities: [
        "Engineered prompts and PRDs",
        "Designed UI/UX",
        "Planned databases and authentication",
        "Architected applications",
        "Deployed production apps",
        "Documented for developer handoff",
      ],
      achievements: [
        { title: "Presentations", description: "200+ created" },
        { title: "Websites", description: "30+ built" },
        { title: "MVPs", description: "10+ functional" },
        { title: "Products", description: "HERU MVP, Therapist AI Scribe, GYMAWY, Tourista, Real Estate CRM" },
      ],
      skills: ["AI Prompt Engineering", "AI Product Design", "Rapid MVP Development", "Business Architecture", "Technical Documentation", "Design Systems", "Automation", "Developer Communication"],
      footerLesson: "AI is most valuable when combined with deep business understanding.",
    },
  ];
  const CATEGORY_BY_SLUG: Record<string, string> = {
    "icall-outsourcing": "Business Development & Sales",
    "vodafone-uk": "Customer Support & Operations",
    "3sixty": "Customer Support & Operations",
    "fund-ourselves": "Customer Support & Operations",
    "skate-it": "Entrepreneurship",
    "el3b": "Entrepreneurship",
    "tedx-cairo-university": "Public Speaking",
    heru: "Product & AI",
    "commercial-real-estate": "Business Development & Sales",
    "ai-product-builder": "Product & AI",
  };
  // Linked portfolio items — an experience can link to several.
  const PORTFOLIOS_BY_SLUG: Record<string, string[]> = {
    heru: ["heru-platform"],
    el3b: ["el3b-wallet"],
    "ai-product-builder": [
      "therapist-ai-scribe",
      "gymawy",
      "tourista",
      "real-estate-crm",
      "investor-sales-decks",
      "ai-built-websites",
      "brand-identity-systems",
    ],
  };
  await prisma.experience.createMany({
    data: experiences.map((e, i) => ({
      ...e,
      order: i,
      featured: ["heru", "ai-product-builder", "commercial-real-estate", "el3b"].includes(e.slug),
      category: CATEGORY_BY_SLUG[e.slug] ?? null,
      portfolioSlugs: PORTFOLIOS_BY_SLUG[e.slug] ?? [],
      portfolioSlug: PORTFOLIOS_BY_SLUG[e.slug]?.[0] ?? null,
    })),
  });

  // --------------------------- Portfolio items ---------------------------
  const portfolio = [
    { slug: "heru-platform", title: "HERU — Esports Platform", category: "Platform", year: 2024, featured: true,
      summary: "Multi-sided esports infrastructure — talent discovery, tournaments, sponsorship matching, and AI-native workflows.",
      services: ["Product Strategy", "UX", "AI Workflows"] },
    { slug: "therapist-ai-scribe", title: "Therapist AI Scribe", category: "AI Product", year: 2025, featured: true,
      summary: "AI clinical documentation assistant — session transcription, SOAP notes, and treatment planning.",
      services: ["AI", "Healthcare", "MVP"] },
    { slug: "gymawy", title: "GYMAWY — Fitness Platform", category: "Platform", year: 2025, featured: true,
      summary: "Fitness platform for gyms and members — memberships, workout tracking, scheduling, and community.",
      services: ["Product", "MVP"] },
    { slug: "tourista", title: "Tourista — TravelTech", category: "Platform", year: 2025, featured: false,
      summary: "Lets hotels sell curated tours to guests — marketplace, bookings, and revenue sharing.",
      services: ["Marketplace", "MVP"] },
    { slug: "real-estate-crm", title: "Real Estate CRM", category: "Platform", year: 2025, featured: true,
      summary: "AI-powered CRM — lead management, drip campaigns, automated follow-up, and pipeline tracking.",
      services: ["AI", "CRM", "Automation"] },
    { slug: "el3b-wallet", title: "EL3B — Gaming Wallet", category: "Product", year: 2023, featured: false,
      summary: "Closed-loop gaming payment ecosystem — NFC cards, the Ecoin wallet, and a local vendor network.",
      services: ["FinTech", "Product"] },
    { slug: "investor-sales-decks", title: "Investor & Sales Presentations", category: "Presentation", year: 2025, featured: true,
      summary: "200+ investor decks, sales presentations, and product stories designed end to end.",
      services: ["Presentation Design", "Storytelling"] },
    { slug: "ai-built-websites", title: "AI-Built Websites", category: "Website", year: 2025, featured: false,
      summary: "30+ AI-generated brands, landing pages, and marketing sites shipped fast.",
      services: ["Web", "Brand", "AI"] },
    { slug: "brand-identity-systems", title: "Brand Identity Systems", category: "Branding", year: 2024, featured: false,
      summary: "Logo systems, brand guidelines, and visual identities across multiple ventures.",
      services: ["Branding", "Design"] },
  ];
  // Each portfolio item links back to the experience it came from.
  const EXP_BY_PORTFOLIO: Record<string, string> = {
    "heru-platform": "heru",
    "el3b-wallet": "el3b",
    "therapist-ai-scribe": "ai-product-builder",
    gymawy: "ai-product-builder",
    tourista: "ai-product-builder",
    "real-estate-crm": "ai-product-builder",
    "investor-sales-decks": "ai-product-builder",
    "ai-built-websites": "ai-product-builder",
    "brand-identity-systems": "ai-product-builder",
  };
  await prisma.project.createMany({
    data: portfolio.map((p, i) => ({
      slug: p.slug,
      title: p.title,
      category: p.category,
      experienceSlug: EXP_BY_PORTFOLIO[p.slug] ?? null,
      year: p.year,
      featured: p.featured,
      summary: p.summary,
      services: p.services,
      order: i,
    })),
  });

  // Resolve the slug links above into stable id links (experienceId /
  // experienceIds) so a fresh install matches the id-based model too.
  await unifyLinks();

  // ----------------------------- Home page -------------------------------
  type S = { type: SectionType; data: Record<string, unknown>; enabled?: boolean; noBg?: boolean };
  async function createPage(
    page: {
      slug: string;
      title: string;
      isHome?: boolean;
      showInNav?: boolean;
      navLabel?: string;
      metaTitle?: string;
      metaDescription?: string;
      order?: number;
    },
    sections: S[],
  ) {
    await prisma.page.create({
      data: {
        ...page,
        status: "PUBLISHED",
        publishedAt: new Date(),
        sections: {
          create: sections.map((s, i) => {
            const bg = s.noBg
              ? {}
              : s.type === "HERO"
                ? { bgVideoUrl: HERO_VIDEO, bgPosterUrl: PICSUM(`${page.slug}-hero`), bgOverlay: 64 }
                : { bgImageUrl: PICSUM(`${page.slug}-${s.type.toLowerCase()}-${i}`), bgOverlay: 80 };
            return {
              type: s.type,
              order: i,
              enabled: s.enabled ?? true,
              data: s.data as Prisma.InputJsonValue,
              ...bg,
            };
          }),
        },
      },
    });
  }

  await createPage(
    {
      slug: "home",
      title: "Home",
      isHome: true,
      order: 0,
      metaTitle: "Omar Abdelgawad — Founder, Product Strategist & AI Systems Architect",
    },
    [
      {
        type: "PORTRAIT_HERO",
        noBg: true,
        data: {
          eyebrow: "Executive Portfolio",
          name: "OMAR ABDELGAWAD",
          roles: "Founder • Product Strategist • AI Systems Architect • Business Builder",
          statement: "Building products, businesses, and scalable systems from the ground up.",
          periodLabel: "2017 — 2026",
          primaryCta: { label: "Explore my experience", href: "#timeline" },
          secondaryCta: { label: "Get in touch", href: "/contact" },
        },
      },
      {
        type: "LOGOS",
        noBg: true,
        data: {
          eyebrow: "Where I've worked",
          title: "Companies & ventures",
          subtitle: "A decade across telecom, healthtech, fintech, gaming, real estate, and AI.",
        },
      },
      {
        type: "TIMELINE",
        noBg: true,
        data: {
          eyebrow: "Experience",
          title: "The journey, year by year",
          intro:
            "Sales → Customer Support → Operations → Leadership → Startup Founder → Product Strategy → Commercial Real Estate → AI Product Builder.",
        },
      },
      {
        type: "STATS",
        noBg: true,
        data: {
          items: [
            { value: "9+", label: "Years building" },
            { value: "10", label: "Roles & ventures" },
            { value: "200+", label: "Presentations created" },
            { value: "10+", label: "Functional MVPs" },
          ],
        },
      },
      {
        type: "EXPERIENCE_INDEX",
        noBg: true,
        data: {
          eyebrow: "By area",
          title: "Experience by category",
          subtitle: "The same journey, grouped by the kind of work.",
          groupByCategory: true,
        },
      },
      {
        type: "PORTFOLIO",
        noBg: true,
        data: {
          eyebrow: "Selected work",
          title: "Platforms & presentations",
          subtitle: "Products, platforms, and decks I've designed and built.",
          featured: true,
          limit: 6,
        },
      },
      {
        type: "CTA",
        noBg: true,
        data: {
          title: "Let's build something",
          highlight: "worth owning.",
          subtitle: "Always learning. Always building. Always curious.",
          primaryCta: { label: "Get in touch", href: "/contact" },
          secondaryCta: { label: "See the portfolio", href: "/portfolio" },
        },
      },
    ],
  );

  // Experience (standalone) — timeline + grouped case studies
  await createPage(
    {
      slug: "experience",
      title: "Experience",
      order: 1,
      metaTitle: "Experience — Omar Abdelgawad",
      metaDescription: "Career timeline (2017–2026) and case studies by area.",
    },
    [
      {
        type: "HERO",
        noBg: true,
        data: {
          eyebrow: "Experience",
          title: "A decade of",
          highlight: "evolution.",
          subtitle: "From sales and operations to entrepreneurship, product strategy, commercial real estate, and AI.",
          primaryCta: { label: "Get in touch", href: "/contact" },
        },
      },
      { type: "TIMELINE", noBg: true, data: { eyebrow: "By year", title: "The journey, year by year" } },
      { type: "EXPERIENCE_INDEX", noBg: true, data: { eyebrow: "By area", title: "Browse by category", groupByCategory: true } },
    ],
  );

  // Portfolio (standalone)
  await createPage(
    {
      slug: "portfolio",
      title: "Portfolio",
      order: 2,
      metaTitle: "Portfolio — Omar Abdelgawad",
      metaDescription: "Platforms, products, and presentations.",
    },
    [
      {
        type: "HERO",
        noBg: true,
        data: {
          eyebrow: "Portfolio",
          title: "Platforms &",
          highlight: "presentations.",
          subtitle: "A selection of the products, platforms, and decks I've designed and built.",
          primaryCta: { label: "Get in touch", href: "/contact" },
        },
      },
      { type: "PORTFOLIO", noBg: true, data: { eyebrow: "All work", title: "Selected work" } },
    ],
  );

  // Contact (standalone)
  await createPage(
    {
      slug: "contact",
      title: "Contact",
      order: 3,
      metaTitle: "Contact — Omar Abdelgawad",
      metaDescription: "Get in touch with Omar Abdelgawad.",
    },
    [
      {
        type: "CONTACT",
        noBg: true,
        data: {
          eyebrow: "Get in touch",
          title: "Let's talk",
          subtitle:
            "Building products. Designing systems. Creating businesses. Always learning, always building.",
          showForm: true,
        },
      },
    ],
  );

  // Department / category pages — each lists its experiences
  for (const [i, c] of CATEGORIES.entries()) {
    await createPage(
      { slug: c.slug, title: c.name, order: 10 + i, metaTitle: `${c.name} — Omar Abdelgawad` },
      [
        {
          type: "HERO",
          noBg: true,
          data: {
            eyebrow: "Experience",
            title: c.name,
            subtitle: "Roles and work in this area.",
            primaryCta: { label: "All experience", href: "/experience" },
          },
        },
        { type: "EXPERIENCE_INDEX", noBg: true, data: { eyebrow: c.name, title: "Case studies", category: c.name } },
      ],
    );
  }

  // Apply the corrected-career revision (Xanadu, timeline remap, period fixes,
  // home order) to the fresh data too — the exact same transform used on live.
  await applyContentV2();

  // ----------------------------- Admin user ------------------------------
  const email = process.env.SEED_ADMIN_EMAIL || "admin@example.com";
  const password = process.env.SEED_ADMIN_PASSWORD || "ChangeMe!2026";
  await prisma.user.create({
    data: {
      email,
      name: "Omar Abdelgawad",
      passwordHash: await bcrypt.hash(password, 10),
      role: "OWNER",
    },
  });

  console.log("Seed complete");
  console.log(
    `  Timeline years: ${await prisma.timelineYear.count()}, Experiences: ${await prisma.experience.count()}`,
  );
  console.log(`  Pages: ${await prisma.page.count()}, Sections: ${await prisma.section.count()}`);
  console.log(`  Admin login: ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
