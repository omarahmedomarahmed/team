import { cache } from "react";
import { prisma } from "@/lib/db";

// ---------------------------------------------------------------------------
// Data-access helpers. Server Components call these; nothing reads hardcoded
// content. Each loader is request-cached so a page can call it freely.
// ---------------------------------------------------------------------------

const PUBLISHED = "PUBLISHED" as const;

/** Sensible fallback so the site renders even before the DB is seeded. */
const DEFAULT_SETTINGS = {
  id: "default",
  siteName: "Your Agency",
  legalName: null as string | null,
  tagline: "We become your digital department.",
  description: null as string | null,
  logoText: "Agency",
  logoUrl: null as string | null,
  logoIcon: null as string | null,
  faviconUrl: null as string | null,
  foundedYear: null as number | null,
  primaryColor: "#6E4A6B",
  accentColor: "#BBA0B8",
  bgColor: "#FAF6F9",
  fgColor: "#322331",
  fontHeading: "Geist",
  fontBody: "Geist",
  email: null as string | null,
  phone: null as string | null,
  address: null as string | null,
  socials: [] as unknown,
  mainMarket: null as string | null,
  subMarket: null as string | null,
  serviceAreas: [] as string[],
  contactConfig: {} as unknown,
  metaTitle: null as string | null,
  metaDescription: null as string | null,
  ogImageUrl: null as string | null,
  gaId: null as string | null,
  metaPixelId: null as string | null,
  extra: {} as unknown,
};

export type Settings = typeof DEFAULT_SETTINGS;

export const getSettings = cache(async (): Promise<Settings> => {
  const row = await prisma.siteSettings.findFirst();
  return (row as unknown as Settings) ?? DEFAULT_SETTINGS;
});

export const getModuleMap = cache(async (): Promise<Record<string, boolean>> => {
  const mods = await prisma.module.findMany();
  return Object.fromEntries(mods.map((m) => [m.key, m.enabled]));
});

/** Feature flag check used by both the public site and Admin. */
export async function isModuleEnabled(key: string): Promise<boolean> {
  const map = await getModuleMap();
  // default to enabled if a module row doesn't exist yet
  return map[key] ?? true;
}

export const getNav = cache(async (location: "HEADER" | "FOOTER") => {
  return prisma.navItem.findMany({
    where: { location, enabled: true, parentId: null },
    orderBy: { order: "asc" },
    include: { children: { where: { enabled: true }, orderBy: { order: "asc" } } },
  });
});

export const getPageBySlug = cache(async (slug: string) => {
  return prisma.page.findFirst({
    where: { slug, status: PUBLISHED },
    include: {
      sections: { where: { enabled: true }, orderBy: { order: "asc" } },
    },
  });
});

export const getHomePage = cache(async () => {
  const home = await prisma.page.findFirst({
    where: { isHome: true, status: PUBLISHED },
    include: {
      sections: { where: { enabled: true }, orderBy: { order: "asc" } },
    },
  });
  return home ?? getPageBySlug("home");
});

// --------------------------- Content collections ---------------------------

export const getServices = cache(async (limit?: number) => {
  return prisma.service.findMany({
    where: { status: PUBLISHED },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    take: limit,
  });
});

export const getServiceBySlug = cache(async (slug: string) => {
  return prisma.service.findFirst({ where: { slug, status: PUBLISHED } });
});

export const getProjects = cache(
  async (opts?: { limit?: number; category?: string; featured?: boolean }) => {
    return prisma.project.findMany({
      where: {
        status: PUBLISHED,
        ...(opts?.category ? { category: opts.category } : {}),
        ...(opts?.featured ? { featured: true } : {}),
      },
      orderBy: [{ featured: "desc" }, { order: "asc" }, { createdAt: "desc" }],
      take: opts?.limit,
    });
  },
);

export const getProjectBySlug = cache(async (slug: string) => {
  return prisma.project.findFirst({ where: { slug, status: PUBLISHED } });
});

export const getTeam = cache(async () => {
  return prisma.teamMember.findMany({
    where: { status: PUBLISHED },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });
});

export const getTestimonials = cache(async (limit?: number) => {
  return prisma.testimonial.findMany({
    where: { status: PUBLISHED },
    orderBy: [{ featured: "desc" }, { order: "asc" }],
    take: limit,
  });
});

export const getIndustries = cache(async () => {
  return prisma.industry.findMany({
    where: { enabled: true },
    orderBy: { order: "asc" },
  });
});

export const getFaqs = cache(async () => {
  return prisma.faq.findMany({
    where: { status: PUBLISHED },
    orderBy: { order: "asc" },
  });
});

// --------------------------- Portfolio content -----------------------------

export const getTimelineYears = cache(async () => {
  return prisma.timelineYear.findMany({
    where: { status: PUBLISHED },
    orderBy: [{ order: "asc" }, { year: "asc" }],
  });
});

export const getExperiences = cache(
  async (opts?: { limit?: number; category?: string; featured?: boolean }) => {
    return prisma.experience.findMany({
      where: {
        status: PUBLISHED,
        ...(opts?.category ? { category: opts.category } : {}),
        ...(opts?.featured ? { featured: true } : {}),
      },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      take: opts?.limit,
    });
  },
);

/** Distinct experience categories (in display order) for nav/overview. */
export const getExperienceCategories = cache(async (): Promise<string[]> => {
  const rows = await prisma.experience.findMany({
    where: { status: PUBLISHED, category: { not: null } },
    orderBy: { order: "asc" },
    select: { category: true },
  });
  const seen = new Set<string>();
  const out: string[] = [];
  for (const r of rows) {
    const c = r.category as string;
    if (c && !seen.has(c)) {
      seen.add(c);
      out.push(c);
    }
  }
  return out;
});

export const getExperienceBySlug = cache(async (slug: string) => {
  return prisma.experience.findFirst({ where: { slug, status: PUBLISHED } });
});

/** Years in business, derived from foundedYear so "15 years" is never stale. */
export function yearsInBusiness(foundedYear?: number | null): number | null {
  if (!foundedYear) return null;
  return new Date().getFullYear() - foundedYear;
}
