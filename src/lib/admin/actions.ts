"use server";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getResource, type Field } from "@/lib/admin/resources";
import { getSectionFields } from "@/lib/admin/sectionFields";
import { generateBlogPost, type GeneratedPost } from "@/lib/ai";
import {
  getCurrentUser,
  verifyCredentials,
  createSession,
  destroySession,
  logActivity,
} from "@/lib/auth";

async function requireUser() {
  const u = await getCurrentUser();
  if (!u) redirect("/admin/login");
  return u;
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

function coerceFields(fields: Field[], formData: FormData): Record<string, any> {
  const data: Record<string, any> = {};
  for (const f of fields) {
    const raw = formData.get(f.name);
    switch (f.type) {
      case "boolean":
        data[f.name] = raw != null;
        break;
      case "link": {
        const label = String(formData.get(`${f.name}__label`) ?? "").trim();
        const href = String(formData.get(`${f.name}__href`) ?? "").trim();
        if (label || href) data[f.name] = { label, href: href || "#" };
        break;
      }
      case "number": {
        const v = (raw ?? "").toString().trim();
        if (v !== "") data[f.name] = Number(v);
        break;
      }
      case "list":
      case "images": {
        const v = (raw ?? "").toString();
        data[f.name] = v.split("\n").map((s) => s.trim()).filter(Boolean);
        break;
      }
      case "pairs": {
        const [k0, k1] = f.pairKeys ?? ["a", "b"];
        const v = (raw ?? "").toString();
        data[f.name] = v
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)
          .map((line) => {
            const idx = line.indexOf("|");
            const a = (idx === -1 ? line : line.slice(0, idx)).trim();
            const b = (idx === -1 ? "" : line.slice(idx + 1)).trim();
            return { [k0]: a, [k1]: b };
          });
        break;
      }
      default: {
        const v = (raw ?? "").toString().trim();
        data[f.name] = v === "" ? null : v;
      }
    }
  }
  return data;
}

export async function saveResourceAction(formData: FormData) {
  const user = await requireUser();
  const key = String(formData.get("__key"));
  const id = String(formData.get("__id") || "");
  const resource = getResource(key);
  if (!resource || resource.readOnly) redirect("/admin");

  const data = coerceFields(resource!.fields, formData);

  // Auto-slug from title/name/company when left blank.
  if (resource!.fields.some((f) => f.name === "slug") && !data.slug) {
    data.slug = slugify(data.title || data.name || data.company || "item") || `item-${Date.now().toString(36)}`;
  }

  const m = (prisma as any)[resource!.model];
  const isUpdate = id && id !== "new";

  try {
    if (isUpdate) await m.update({ where: { id }, data });
    else await m.create({ data });
  } catch (e: any) {
    // Unique slug collision -> append a short suffix and retry once.
    if (e?.code === "P2002" && data.slug) {
      data.slug = `${data.slug}-${Date.now().toString(36).slice(-4)}`;
      if (isUpdate) await m.update({ where: { id }, data });
      else await m.create({ data });
    } else {
      throw e;
    }
  }

  await logActivity(user.id, isUpdate ? "update" : "create", resource!.model, id || undefined);
  revalidatePath(`/admin/${key}`);
  redirect(`/admin/${key}`);
}

export async function deleteResourceAction(formData: FormData) {
  const user = await requireUser();
  const key = String(formData.get("__key"));
  const id = String(formData.get("__id"));
  const resource = getResource(key);
  if (!resource) redirect("/admin");
  await (prisma as any)[resource!.model].delete({ where: { id } });
  await logActivity(user.id, "delete", resource!.model, id);
  revalidatePath(`/admin/${key}`);
  redirect(`/admin/${key}`);
}

// --------------------------------- Auth ------------------------------------

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const from = String(formData.get("from") || "/admin");
  const user = await verifyCredentials(email, password);
  if (!user) redirect("/admin/login?error=1");
  await createSession(user.id);
  await logActivity(user.id, "login");
  redirect(from.startsWith("/admin") && from !== "/admin/login" ? from : "/admin");
}

export async function logoutAction() {
  await destroySession();
  redirect("/admin/login");
}

// ------------------------------- Settings ----------------------------------

export async function saveSettingsAction(formData: FormData) {
  await requireUser();
  const get = (k: string) => {
    const v = String(formData.get(k) ?? "").trim();
    return v === "" ? null : v;
  };
  const socials = String(formData.get("socials") || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [platform, url] = line.split("|").map((s) => s.trim());
      return { platform: platform || "", url: url || "#" };
    });

  const foundedYear = get("foundedYear");

  const data: any = {
    siteName: get("siteName") || "Your Agency",
    legalName: get("legalName"),
    tagline: get("tagline"),
    description: get("description"),
    logoText: get("logoText"),
    logoUrl: get("logoUrl"),
    logoIcon: get("logoIcon"),
    faviconUrl: get("faviconUrl"),
    foundedYear: foundedYear ? Number(foundedYear) : null,
    primaryColor: get("primaryColor") || "#6E4A6B",
    accentColor: get("accentColor") || "#BBA0B8",
    bgColor: get("bgColor") || "#FAF6F9",
    fgColor: get("fgColor") || "#322331",
    email: get("email"),
    phone: get("phone"),
    address: get("address"),
    socials,
    mainMarket: get("mainMarket"),
    subMarket: get("subMarket"),
    serviceAreas: String(formData.get("serviceAreas") || "")
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean),
    contactConfig: (() => {
      try {
        const fields = JSON.parse(String(formData.get("contactFields") || "[]"));
        return { fields: Array.isArray(fields) ? fields : [] };
      } catch {
        return { fields: [] };
      }
    })(),
    metaTitle: get("metaTitle"),
    metaDescription: get("metaDescription"),
    ogImageUrl: get("ogImageUrl"),
    gaId: get("gaId"),
    metaPixelId: get("metaPixelId"),
  };

  const existing = await prisma.siteSettings.findFirst();
  if (existing) await prisma.siteSettings.update({ where: { id: existing.id }, data });
  else await prisma.siteSettings.create({ data });

  revalidatePath("/", "layout");
  redirect("/admin/settings?saved=1");
}

// ------------------------------- Modules -----------------------------------

export async function saveModulesAction(formData: FormData) {
  await requireUser();
  const modules = await prisma.module.findMany();
  for (const mod of modules) {
    const enabled = formData.get(`mod_${mod.key}`) != null;
    if (enabled !== mod.enabled) {
      await prisma.module.update({ where: { id: mod.id }, data: { enabled } });
    }
  }
  revalidatePath("/", "layout");
  redirect("/admin/modules?saved=1");
}

// ---------------------------- Pages & Sections -----------------------------

const emptyNull = (v: FormDataEntryValue | null) => {
  const s = String(v ?? "").trim();
  return s === "" ? null : s;
};

export async function savePageAction(formData: FormData) {
  await requireUser();
  const id = String(formData.get("__id") || "");
  const title = String(formData.get("title") || "").trim() || "Untitled";
  let slug = String(formData.get("slug") || "").trim();
  if (!slug) slug = slugify(title) || `page-${Date.now().toString(36)}`;
  const isHome = formData.get("isHome") != null;

  const data: any = {
    title,
    slug,
    status: String(formData.get("status") || "PUBLISHED"),
    isHome,
    metaTitle: emptyNull(formData.get("metaTitle")),
    metaDescription: emptyNull(formData.get("metaDescription")),
    showInNav: formData.get("showInNav") != null,
    navLabel: emptyNull(formData.get("navLabel")),
    noIndex: formData.get("noIndex") != null,
    order: Number(formData.get("order") || 0),
  };

  // Only one home page.
  if (isHome) await prisma.page.updateMany({ where: { isHome: true }, data: { isHome: false } });

  let pageId = id;
  if (id && id !== "new") {
    await prisma.page.update({ where: { id }, data });
  } else {
    const created = await prisma.page.create({ data: { ...data, publishedAt: new Date() } });
    pageId = created.id;
  }
  revalidatePath("/", "layout");
  redirect(`/admin/pages/${pageId}`);
}

export async function deletePageAction(formData: FormData) {
  await requireUser();
  const id = String(formData.get("__id"));
  await prisma.page.delete({ where: { id } });
  revalidatePath("/", "layout");
  redirect("/admin/pages");
}

export async function addSectionAction(formData: FormData) {
  await requireUser();
  const pageId = String(formData.get("pageId"));
  const type = String(formData.get("type") || "RICH_TEXT");
  const count = await prisma.section.count({ where: { pageId } });
  await prisma.section.create({
    data: { pageId, type: type as any, order: count, data: {} },
  });
  revalidatePath("/", "layout");
  redirect(`/admin/pages/${pageId}`);
}

export async function saveSectionAction(formData: FormData) {
  await requireUser();
  const id = String(formData.get("__id"));
  const pageId = String(formData.get("pageId"));

  const section = await prisma.section.findUnique({ where: { id } });
  if (!section) redirect(`/admin/pages/${pageId}`);

  const data = coerceFields(getSectionFields(section!.type), formData);

  await prisma.section.update({
    where: { id },
    data: {
      enabled: formData.get("enabled") != null,
      order: Number(formData.get("order") || 0),
      bgImageUrl: emptyNull(formData.get("bgImageUrl")),
      bgVideoUrl: emptyNull(formData.get("bgVideoUrl")),
      bgPosterUrl: emptyNull(formData.get("bgPosterUrl")),
      bgOverlay: Number(formData.get("bgOverlay") || 72),
      data,
    },
  });
  revalidatePath("/", "layout");
  redirect(`/admin/pages/${pageId}`);
}

export async function deleteSectionAction(formData: FormData) {
  await requireUser();
  const id = String(formData.get("__id"));
  const pageId = String(formData.get("pageId"));
  await prisma.section.delete({ where: { id } });
  revalidatePath("/", "layout");
  redirect(`/admin/pages/${pageId}`);
}

// ------------------------------ AI Blog ------------------------------------

export async function generatePostAction(formData: FormData) {
  const user = await requireUser();
  const topic = String(formData.get("topic") || "").trim();
  if (!topic) redirect("/admin/ai-blog?err=" + encodeURIComponent("Please enter a topic."));

  let generated: GeneratedPost;
  try {
    generated = await generateBlogPost({
      topic,
      keywords: String(formData.get("keywords") || ""),
      tone: String(formData.get("tone") || ""),
      length: String(formData.get("length") || ""),
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Generation failed.";
    redirect("/admin/ai-blog?err=" + encodeURIComponent(msg));
  }

  const slug = `${slugify(generated.title) || "post"}-${Date.now().toString(36).slice(-4)}`;
  const post = await prisma.post.create({
    data: {
      title: generated.title,
      slug,
      excerpt: generated.excerpt,
      body: generated.body,
      tags: generated.tags,
      aiGenerated: true,
      status: "DRAFT",
    },
  });
  await logActivity(user.id, "ai_generate", "post", post.id);
  revalidatePath("/admin/posts");
  redirect(`/admin/posts/${post.id}`);
}
