/**
 * Seed — populates the platform with the agency's real content.
 * Re-runnable: it clears content tables, then recreates everything.
 * Placeholder items (portfolio, testimonials, contact details, brand name)
 * are clearly marked and meant to be replaced in God Mode.
 */
import { PrismaClient, SectionType, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const FOUNDED = 2011;
const yearsExp = new Date().getFullYear() - FOUNDED;

// Placeholder media (all replaceable in God Mode). Picsum is reliable and
// hotlinkable; the hero video is a stock loop with the poster image acting as
// a seamless fallback if the video is ever unavailable.
const PICSUM = (seed: string, w = 1920, h = 1080) =>
  `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;
const HERO_VIDEO =
  "https://assets.mixkit.co/videos/preview/mixkit-waves-coming-to-the-beach-5016-large.mp4";

// Bump this when seed content changes to roll it out on the next deploy.
// Do NOT bump once clients start editing content in God Mode.
const SEED_VERSION = "2";

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
}

// Fill newly-added fields on existing installs without wiping content.
async function patchDefaults(current: any) {
  const patch: any = {};
  if (!current.mainMarket) patch.mainMarket = "Information Technology";
  if (!current.subMarket) patch.subMarket = "Digital Advertising";
  const areas = current.serviceAreas;
  if (!areas || (Array.isArray(areas) && areas.length === 0)) patch.serviceAreas = ["ALL"];
  if (Object.keys(patch).length) {
    await prisma.siteSettings.update({ where: { id: current.id }, data: patch });
  }
}

async function main() {
  // Re-seed only when SEED_VERSION changes (rolls out new seed content once on
  // deploy) or when SEED_FORCE=1. Otherwise skip, preserving any edits.
  const current = await prisma.siteSettings.findFirst();
  const storedVersion =
    current && current.extra && typeof current.extra === "object"
      ? (current.extra as Record<string, unknown>).seedVersion
      : null;
  if (current && storedVersion === SEED_VERSION && !process.env.SEED_FORCE) {
    await patchDefaults(current);
    console.log(`Seed up to date (v${SEED_VERSION}) — skipping.`);
    return;
  }

  await reset();

  // ----------------------------- Settings --------------------------------
  await prisma.siteSettings.create({
    data: {
      siteName: "Your Agency",
      legalName: "Your Agency LLC",
      tagline: "We become your digital department.",
      description:
        "A premium digital transformation company that unifies branding, websites, AI, content, and growth into one connected system you own.",
      logoText: "AGENCY",
      foundedYear: FOUNDED,
      primaryColor: "#7c3aed",
      accentColor: "#22d3ee",
      bgColor: "#080711",
      fgColor: "#ECECF1",
      email: "hello@youragency.com",
      phone: "+1 (555) 012-3456",
      address: "Remote-first · Working worldwide",
      mainMarket: "Information Technology",
      subMarket: "Digital Advertising",
      serviceAreas: ["ALL"],
      contactConfig: {
        fields: [
          { name: "name", label: "Your name", type: "text", required: true },
          { name: "email", label: "Email", type: "email", required: true },
          { name: "phone", label: "Phone", type: "tel", required: false },
          { name: "company", label: "Company", type: "text", required: false },
          {
            name: "service",
            label: "Service interested in",
            type: "select",
            required: false,
            options: ["Branding", "Website", "SEO & GEO", "Paid Ads", "Content", "Not sure yet"],
          },
          { name: "message", label: "Tell us about your business…", type: "textarea", required: true },
        ],
      },
      socials: [
        { platform: "Instagram", url: "#" },
        { platform: "LinkedIn", url: "#" },
        { platform: "X", url: "#" },
        { platform: "TikTok", url: "#" },
      ],
      metaTitle: "Your Agency — Digital Transformation, Branding & AI-Ready Websites",
      metaDescription:
        "We become your digital department: branding, AI-ready websites with a CMS you own, SEO/GEO, content, and growth — one premium team.",
      extra: { seedVersion: SEED_VERSION },
    },
  });

  // ----------------------------- Modules ---------------------------------
  const modules = [
    ["services", "Services"],
    ["portfolio", "Portfolio"],
    ["team", "Team"],
    ["testimonials", "Testimonials"],
    ["industries", "Industries"],
    ["faq", "FAQ"],
    ["contact", "Contact"],
    ["blog", "Blog"],
    ["ai_blog", "AI Blog Generation"],
  ];
  await prisma.module.createMany({
    data: modules.map(([key, label], i) => ({ key, label, enabled: true, order: i })),
  });

  // ----------------------------- Navigation ------------------------------
  const headerNav = [
    ["Services", "/services"],
    ["Work", "/work"],
    ["About", "/about"],
    ["Contact", "/contact"],
  ];
  await prisma.navItem.createMany({
    data: [
      ...headerNav.map(([label, url], i) => ({ label, url, location: "HEADER" as const, order: i })),
      ...headerNav.map(([label, url], i) => ({ label, url, location: "FOOTER" as const, order: i })),
    ],
  });

  // ----------------------------- Services --------------------------------
  const services = [
    {
      slug: "brand-strategy-identity",
      title: "Brand Strategy & Identity",
      icon: "target",
      summary: "Positioning, narrative, and a modern visual identity that makes you the obvious choice.",
      description:
        "We start with strategy: who you serve, why you win, and the story that makes it land. Then we design a complete identity — logo, system, guidelines — that looks as trustworthy online as you are in person.\n\nEvery brand we build is engineered to work across your website, content, and campaigns as one coherent system.",
    },
    {
      slug: "web-design-development",
      title: "Web Design & Development",
      icon: "monitor",
      summary: "AI-ready, database-driven websites that are fast, beautiful, and built to convert.",
      description:
        "We design and build modern websites where nothing that might change is hardcoded. Every page, section, and word is dynamic and editable — the frontend is just a rendering engine over your content.\n\nThe result is a site that loads fast, ranks well, and moves visitors toward action.",
    },
    {
      slug: "god-mode-cms",
      title: "God Mode CMS Platform",
      icon: "settings",
      summary: "An enterprise admin platform you fully own — edit anything, no developer required.",
      description:
        "Every website ships with God Mode: a complete content, configuration, and operations console. Pages, sections, media, forms, branding, SEO, navigation, users and roles — all under your control.\n\nNo agency lock-in. No maintenance fees to change text or images. You own the platform and everything in it.",
    },
    {
      slug: "ai-geo-optimization",
      title: "AI & GEO Optimization",
      icon: "bot",
      summary: "Get discovered by AI search with Generative Engine Optimization and structured authority.",
      description:
        "Traditional SEO is no longer enough. We structure your content, metadata, schema, and authority signals so AI systems understand and recommend your business.\n\nWe also wire in AI-powered blog generation so you can publish industry-relevant articles on demand.",
    },
    {
      slug: "seo-search-visibility",
      title: "SEO & Search Visibility",
      icon: "search",
      summary: "Technical, on-page, and content SEO that compounds into durable organic growth.",
      description:
        "We make your site fast, crawlable, and authoritative — then build the content and signals that earn rankings for the searches that bring you customers.",
    },
    {
      slug: "paid-advertising",
      title: "Paid Advertising",
      icon: "trending-up",
      summary: "Google and Meta campaigns engineered for measurable, profitable lead generation.",
      description:
        "Strategy, creative, and optimization across Google and Meta. We connect ads to landing pages, tracking, and analytics so every dollar is accountable.",
    },
    {
      slug: "content-storytelling",
      title: "Content & Storytelling",
      icon: "pen-tool",
      summary: "Narrative-driven content that educates, builds authority, and drives action.",
      description:
        "We don't make generic marketing content. Every brand tells a story, every service explains value, and every page moves visitors forward — from founder stories to case studies and educational content.",
    },
    {
      slug: "social-short-form-video",
      title: "Social & Short-Form Video",
      icon: "clapperboard",
      summary: "Reels, TikTok, UGC, and motion graphics that keep your brand consistent and current.",
      description:
        "Social strategy plus the content to fuel it: short-form video, motion graphics, and UGC built to grow reach and reinforce your positioning.",
    },
    {
      slug: "presentations-sales-decks",
      title: "Presentations & Sales Decks",
      icon: "presentation",
      summary: "Company profiles, pitch decks, and proposals that win the room.",
      description:
        "Professional, on-brand presentations and business documentation — company profiles, sales decks, pitch decks, and proposals — designed to persuade.",
    },
    {
      slug: "automation-crm",
      title: "Automation & CRM",
      icon: "workflow",
      summary: "Connect forms, leads, and follow-up into systems that run without you.",
      description:
        "We wire your website forms, CRM, and notifications together so leads are captured, routed, and followed up automatically.",
    },
    {
      slug: "analytics-reporting",
      title: "Analytics & Reporting",
      icon: "bar-chart",
      summary: "Transparent dashboards and reviews so you always know what's working.",
      description:
        "Clear analytics and regular performance reviews that translate data into business decisions — not vanity metrics.",
    },
    {
      slug: "growth-consulting",
      title: "Growth Consulting",
      icon: "rocket",
      summary: "A senior partner thinking in systems, not deliverables, about your growth.",
      description:
        "We act as your outsourced executive digital department — advising on positioning, priorities, and the systems that scale your business.",
    },
  ];
  await prisma.service.createMany({
    data: services.map((s, i) => ({
      ...s,
      order: i,
      featured: i < 6,
      tagline: s.summary,
      heroImageUrl: PICSUM(`svc-hero-${s.slug}`, 1600, 900),
      benefits: [
        { title: "Senior expertise", description: "Work directly with specialists — never juniors." },
        { title: "Full ownership", description: "Everything we build is yours to keep and control." },
        { title: "Built to convert", description: "Designed around your goals, not vanity metrics." },
      ],
      ctaTitle: `Ready to get started with ${s.title.toLowerCase()}?`,
      ctaText: "Tell us about your business and we'll map out the fastest path forward.",
    })),
  });

  // ----------------------------- Team ------------------------------------
  const team = [
    {
      name: "Alex Jaxon",
      role: "Business Development & Client Success",
      department: "Client Success",
      bio: "Co-leads discovery, onboarding, and the relationships that turn projects into long-term partnerships.",
    },
    {
      name: "Loui Abbas",
      role: "Business Development & Client Success",
      department: "Client Success",
      bio: "Co-leads sales and account management, ensuring every client gets a premium, senior-level experience.",
    },
    {
      name: "Omar Ahmed",
      role: "Branding, Technology & Product",
      department: "Product & Technology",
      bio: "Leads creative direction, brand, UI/UX, and the engineering behind the God Mode platform and our AI integrations.",
    },
    {
      name: "Abdo Wisdek",
      role: "Marketing & Growth",
      department: "Marketing & Growth",
      bio: "Owns SEO, GEO, and paid performance — turning search and campaigns into measurable, compounding growth.",
    },
  ];
  await prisma.teamMember.createMany({
    data: team.map((m, i) => ({ ...m, order: i })),
  });

  // ----------------------------- Industries ------------------------------
  const industries = [
    ["Real Estate", "building-2"],
    ["Construction", "hard-hat"],
    ["Home Renovation", "hammer"],
    ["HVAC", "snowflake"],
    ["Roofing", "house"],
    ["Solar", "sun"],
    ["Automotive", "car"],
    ["Healthcare", "stethoscope"],
    ["Fitness & Gyms", "dumbbell"],
    ["Spas & Clinics", "flower-2"],
    ["Furniture", "sofa"],
    ["E-Commerce", "shopping-bag"],
    ["Professional Services", "briefcase"],
    ["Startups", "zap"],
    ["Corporate", "landmark"],
  ];
  await prisma.industry.createMany({
    data: industries.map(([name, icon], i) => ({
      name,
      icon,
      order: i,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    })),
  });

  // -------------------- Portfolio (PLACEHOLDER samples) ------------------
  const projects = [
    {
      slug: "skyline-realty-rebrand",
      title: "Skyline Realty Group",
      client: "Skyline Realty",
      industry: "Real Estate",
      summary: "Full rebrand and an AI-ready website that turned a referral-only firm into a lead engine.",
      services: ["Brand Identity", "Web Design", "God Mode CMS", "SEO/GEO"],
      results: [
        { label: "More inbound leads", value: "+180%" },
        { label: "Page load", value: "0.8s" },
        { label: "Organic traffic", value: "+240%" },
        { label: "Client-owned", value: "100%" },
      ],
      year: 2024,
    },
    {
      slug: "apex-climate-hvac",
      title: "Apex Climate HVAC",
      client: "Apex Climate",
      industry: "HVAC",
      summary: "Local SEO, a high-converting site, and automation that books jobs while they sleep.",
      services: ["Web Development", "Local SEO", "Automation", "Paid Ads"],
      results: [
        { label: "Organic growth", value: "+320%" },
        { label: "Cost per lead", value: "-46%" },
        { label: "Booked jobs", value: "+2.1x" },
      ],
      year: 2024,
    },
    {
      slug: "vital-form-studio",
      title: "Vital Form Studio",
      client: "Vital Form",
      industry: "Fitness",
      summary: "A premium brand and booking experience for a boutique fitness studio.",
      services: ["Brand Strategy", "Web Design", "Short-Form Video"],
      results: [
        { label: "Memberships", value: "+135%" },
        { label: "Booking rate", value: "+58%" },
      ],
      year: 2025,
    },
    {
      slug: "lumen-living-store",
      title: "Lumen Living",
      client: "Lumen Living",
      industry: "E-Commerce",
      summary: "An e-commerce revamp that lifted revenue with a faster, story-driven storefront.",
      services: ["E-Commerce", "Content", "Analytics"],
      results: [
        { label: "Revenue", value: "+92%" },
        { label: "Conversion", value: "+37%" },
        { label: "Return visits", value: "+64%" },
      ],
      year: 2025,
    },
  ];
  for (const [i, p] of projects.entries()) {
    await prisma.project.create({
      data: {
        ...p,
        order: i,
        featured: i < 2,
        coverUrl: PICSUM(`work-${p.slug}`, 1600, 1200),
        gallery: [
          PICSUM(`${p.slug}-g1`, 1280, 960),
          PICSUM(`${p.slug}-g2`, 1280, 960),
          PICSUM(`${p.slug}-g3`, 1280, 960),
          PICSUM(`${p.slug}-g4`, 1280, 960),
        ],
      },
    });
  }

  // ------------------ Testimonials (PLACEHOLDER samples) -----------------
  const testimonials = [
    {
      author: "Jordan Mills",
      role: "Owner",
      company: "Skyline Realty",
      quote:
        "They didn't just give us a website — they became our digital department. We finally look as modern as we are, and we own all of it.",
    },
    {
      author: "Priya Nair",
      role: "Founder",
      company: "Vital Form Studio",
      quote:
        "The brand, the site, the content — everything works together. Bookings are up and I can edit anything myself in minutes.",
    },
    {
      author: "Marcus Webb",
      role: "GM",
      company: "Apex Climate HVAC",
      quote:
        "Senior people, fast communication, real results. Our phone rings because of the systems they built.",
    },
  ];
  await prisma.testimonial.createMany({
    data: testimonials.map((t, i) => ({ ...t, order: i, featured: true })),
  });

  // ----------------------------- FAQs ------------------------------------
  const faqs = [
    {
      question: "Are you a marketing agency or a software company?",
      answer:
        "Neither, exactly. We're a digital transformation company that unifies branding, websites, AI, content, and growth into one connected system — your outsourced digital department.",
    },
    {
      question: "Do we actually own our website and platform?",
      answer:
        "Yes — completely. Every site ships with God Mode, an enterprise admin where you control content, media, branding, SEO, and more. No lock-in and no fees just to change text or images.",
    },
    {
      question: "What makes you different from a typical agency?",
      answer:
        "We think in systems, not deliverables, and we stay deliberately small — accepting only a handful of new clients each quarter so every account gets senior-level attention.",
    },
    {
      question: "What is GEO, and why does it matter?",
      answer:
        "Generative Engine Optimization prepares your business to be understood and recommended by AI search. We structure content, schema, and authority signals so you stay visible as discovery shifts to AI.",
    },
    {
      question: "How many clients do you take on?",
      answer:
        "A maximum of two new clients per month, and six per quarter. Scarcity is intentional — it's how we keep quality and senior attention high.",
    },
    {
      question: "Which industries do you work with?",
      answer:
        "We've served real estate, construction, HVAC, healthcare, fitness, automotive, e-commerce, professional services, and more — each with tailored messaging and architecture.",
    },
  ];
  await prisma.faq.createMany({ data: faqs.map((f, i) => ({ ...f, order: i })) });

  // ----------------------------- Pages & Sections ------------------------
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
            // Every section gets a background; heroes get a video with an image
            // poster fallback. All of this is editable per-section in God Mode.
            const bg = s.noBg
              ? {}
              : s.type === "HERO"
                ? {
                    bgVideoUrl: HERO_VIDEO,
                    bgPosterUrl: PICSUM(`${page.slug}-hero`),
                    bgOverlay: 64,
                  }
                : {
                    bgImageUrl: PICSUM(`${page.slug}-${s.type.toLowerCase()}-${i}`),
                    bgOverlay: s.type === "CTA" ? 72 : 80,
                  };
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

  // Home
  await createPage(
    {
      slug: "home",
      title: "Home",
      isHome: true,
      order: 0,
      metaTitle: "Your Agency — We become your digital department",
    },
    [
      {
        type: "HERO",
        data: {
          eyebrow: "Premium digital transformation",
          title: "We don't just build websites.",
          highlight: "We become your digital department.",
          subtitle:
            "Branding, AI-ready websites, content, search visibility, and growth — engineered into one connected system your business actually owns.",
          primaryCta: { label: "Start a project", href: "/contact" },
          secondaryCta: { label: "See our work", href: "/work" },
          badges: ["Branding", "AI-ready websites", "God Mode CMS", "SEO & GEO", "Growth"],
        },
      },
      {
        type: "STATS",
        data: {
          items: [
            { value: `${yearsExp}+`, label: "Years of experience" },
            { value: "6", label: "New clients / quarter" },
            { value: "100%", label: "Client-owned platforms" },
            { value: "11", label: "Specialists on your side" },
          ],
        },
      },
      {
        type: "SERVICES",
        data: {
          eyebrow: "What we do",
          title: "One team for everything",
          highlight: "digital.",
          subtitle: "Instead of hiring freelancers and separate agencies, you hire one senior team that owns it all.",
          limit: 6,
        },
      },
      {
        type: "ABOUT",
        data: {
          eyebrow: "Our philosophy",
          title: "Systems, not",
          highlight: "deliverables.",
          body:
            "A website alone doesn't grow a business. Neither does a logo, an ad, or SEO on its own. Growth comes when every digital asset reinforces every other one.\n\nSo we build complete ecosystems — brand, website, content, AI visibility, and growth — and we hand you full ownership of all of it.",
          points: [
            "Brand strategy & identity",
            "AI-ready, database-driven websites",
            "God Mode CMS you fully own",
            "SEO + GEO for AI search",
            "Content & short-form video",
            "Paid media & analytics",
          ],
        },
      },
      {
        type: "PROCESS",
        data: {
          eyebrow: "How we work",
          title: "From discovery to",
          highlight: "compounding growth.",
          steps: [
            { title: "Discover", description: "A senior-level call to understand your business, market, and goals." },
            { title: "Strategy", description: "We design brand, messaging, and system architecture before a pixel is placed." },
            { title: "Build", description: "Branding, website, God Mode CMS, content, and AI/SEO as one connected system." },
            { title: "Grow", description: "We optimize, report, and act as your outsourced digital department." },
          ],
        },
      },
      {
        type: "PORTFOLIO",
        data: {
          eyebrow: "Selected work",
          title: "Outcomes across",
          highlight: "every market.",
          subtitle: "A sample of what happens when branding, web, and growth move as one.",
          limit: 4,
        },
      },
      {
        type: "INDUSTRIES",
        data: {
          eyebrow: "Industries",
          title: "Built for",
          highlight: "your market.",
          subtitle: "Tailored messaging, architecture, and strategy for the industries we know best.",
        },
      },
      {
        type: "TESTIMONIALS",
        data: { eyebrow: "Clients", title: "Partners, not", highlight: "projects." },
      },
      {
        type: "FAQ",
        data: { eyebrow: "FAQ", title: "Questions,", highlight: "answered." },
      },
      {
        type: "CTA",
        data: {
          title: "Ready to modernize",
          highlight: "your business?",
          subtitle: "We onboard a maximum of two new clients per month. Tell us about your business.",
          primaryCta: { label: "Apply to work with us", href: "/contact" },
          secondaryCta: { label: "Explore services", href: "/services" },
        },
      },
    ],
  );

  // Services
  await createPage(
    {
      slug: "services",
      title: "Services",
      showInNav: true,
      order: 1,
      metaTitle: "Services — Branding, Websites, AI, Content & Growth",
      metaDescription:
        "End-to-end digital transformation: branding, AI-ready websites with a CMS you own, SEO/GEO, content, paid media, and growth.",
    },
    [
      {
        type: "HERO",
        data: {
          eyebrow: "Services",
          title: "Everything you need,",
          highlight: "in one team.",
          subtitle: "Complete, end-to-end digital transformation — delivered as a connected system, not a pile of deliverables.",
          primaryCta: { label: "Start a project", href: "/contact" },
        },
      },
      {
        type: "SERVICES",
        data: { eyebrow: "Capabilities", title: "What we", highlight: "deliver." },
      },
      {
        type: "PROCESS",
        data: {
          eyebrow: "How we work",
          title: "A clear path to",
          highlight: "results.",
          steps: [
            { title: "Discover", description: "Understand your business, market, and goals." },
            { title: "Strategy", description: "Design the brand, message, and architecture." },
            { title: "Build", description: "Execute the full ecosystem end to end." },
            { title: "Grow", description: "Optimize, report, and scale." },
          ],
        },
      },
      {
        type: "CTA",
        data: {
          title: "Let's build your",
          highlight: "digital ecosystem.",
          primaryCta: { label: "Start a project", href: "/contact" },
        },
      },
    ],
  );

  // Work
  await createPage(
    {
      slug: "work",
      title: "Work",
      showInNav: true,
      order: 2,
      metaTitle: "Work — Selected Projects & Case Studies",
      metaDescription: "A sample of outcomes across the industries we serve.",
    },
    [
      {
        type: "HERO",
        data: {
          eyebrow: "Portfolio",
          title: "Selected",
          highlight: "work.",
          subtitle: "Outcomes from treating branding, website, and growth as one system.",
        },
      },
      { type: "PORTFOLIO", data: { title: "Case", highlight: "studies." } },
      {
        type: "CTA",
        data: { title: "Want results", highlight: "like these?", primaryCta: { label: "Start a project", href: "/contact" } },
      },
    ],
  );

  // About
  await createPage(
    {
      slug: "about",
      title: "About",
      showInNav: true,
      order: 3,
      metaTitle: "About — A premium boutique digital partner",
      metaDescription:
        "A premium, deliberately small digital transformation team. We become your digital department.",
    },
    [
      {
        type: "HERO",
        data: {
          eyebrow: "About us",
          title: "A premium boutique,",
          highlight: "by design.",
          subtitle: "We're not built for volume. We're built for quality, relationships, and long-term partnerships.",
        },
      },
      {
        type: "ABOUT",
        data: {
          eyebrow: "Who we are",
          title: "Your outsourced",
          highlight: "digital department.",
          body:
            "Clients don't hire freelancers or juggle separate agencies. They hire one experienced team that becomes responsible for everything digital inside their business.\n\nWe stay deliberately small and selective — accepting only a handful of new clients each quarter — so every account gets senior-level attention from people who understand business, not just design.",
          points: [
            "Quality over volume",
            "Relationships over transactions",
            "Long-term partnerships",
            "Senior-level attention",
            "Deep business understanding",
            "Complete client ownership",
          ],
        },
      },
      {
        type: "STATS",
        data: {
          items: [
            { value: `${yearsExp}+`, label: "Years of experience" },
            { value: "2", label: "New clients / month max" },
            { value: "11", label: "Specialists" },
            { value: "100%", label: "Client-owned" },
          ],
        },
      },
      {
        type: "TEAM",
        data: {
          eyebrow: "The team",
          title: "Senior people,",
          highlight: "on your account.",
          subtitle: "Organized by department with clear ownership across client success, product, and growth.",
        },
      },
      {
        type: "CTA",
        data: {
          title: "Let's talk about",
          highlight: "your business.",
          primaryCta: { label: "Start a conversation", href: "/contact" },
        },
      },
    ],
  );

  // Contact
  await createPage(
    {
      slug: "contact",
      title: "Contact",
      showInNav: true,
      order: 4,
      metaTitle: "Contact — Start a project",
      metaDescription: "Tell us about your business and what you want to modernize.",
    },
    [
      {
        type: "CONTACT",
        data: {
          eyebrow: "Contact",
          title: "Let's build something",
          highlight: "worth owning.",
          subtitle:
            "We onboard a maximum of two new clients per month. Tell us about your business and we'll be in touch within one business day.",
          showForm: true,
        },
      },
      { type: "FAQ", data: { eyebrow: "FAQ", title: "Before you", highlight: "reach out." } },
    ],
  );

  // ----------------------------- Admin user ------------------------------
  const email = process.env.SEED_ADMIN_EMAIL || "admin@example.com";
  const password = process.env.SEED_ADMIN_PASSWORD || "ChangeMe!2026";
  await prisma.user.create({
    data: {
      email,
      name: "Administrator",
      passwordHash: await bcrypt.hash(password, 10),
      role: "OWNER",
    },
  });

  console.log("Seed complete");
  console.log(`  Pages: ${await prisma.page.count()}, Sections: ${await prisma.section.count()}`);
  console.log(`  Services: ${await prisma.service.count()}, Projects: ${await prisma.project.count()}`);
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
