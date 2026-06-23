# Platform Architecture

How the platform delivers the company's promise — *"nothing that may change is
hardcoded"* — and how one codebase becomes every client's site.

## 1. The rendering model

```
Request → Page (by slug) → ordered Sections → SectionRenderer → section component
                                   │
                          collection-backed sections
                          (services, portfolio, team…)
                          load their rows + check feature flags
```

- **`Page`** rows are URLs. `page.tsx` serves the `isHome` page; `[slug]/page.tsx`
  serves every other page by slug. Create a page in the DB and it exists — no code.
- **`Section`** rows are the blocks on a page. Each has a `type` (HERO, SERVICES,
  TEAM, CTA…), an `order`, an `enabled` flag, and a JSON `data` payload. Reorder,
  hide, duplicate, or edit them without touching source.
- **`SectionRenderer`** (`src/components/sections/`) maps a section `type` to a
  component. Collection sections fetch their data here and **return `null` when their
  module flag is off**.

The JSON `data`/`style` columns mean a section can gain fields without a migration —
the contracts live in `src/lib/types.ts`.

## 2. Branding is data

`SiteSettings` holds brand colors, fonts, logo, contact details, social links,
SEO defaults, and analytics IDs. `layout.tsx` reads it and injects the colors as
CSS variables on `<html>`:

```
--bg, --fg, --brand, --accent
```

Tailwind utilities (`bg-brand`, `text-fg`, …) are mapped to those variables in
`globals.css`, so changing a color in the DB re-themes the entire site.

## 3. Feature flags = templating

`Module` rows are the switch points. `isModuleEnabled("portfolio")` is checked in:

- the **section renderer** (a disabled module's sections don't render), and
- the **detail routes** (`/services/[slug]`, `/work/[slug]` 404 when off).

This is what makes the platform sellable per client at different tiers: enable only
what that client bought.

## 4. Data model (overview)

| Group        | Models                                                       |
| ------------ | ------------------------------------------------------------ |
| Config       | `SiteSettings`, `Module`, `NavItem`                          |
| Structure    | `Page`, `Section`                                            |
| Collections  | `Service`, `Project`, `TeamMember`, `Testimonial`, `Industry`, `Faq`, `Post` |
| Media        | `MediaAsset`                                                 |
| Leads        | `Lead`                                                       |
| Admin        | `User`, `ActivityLog`                                        |

Every collection carries `status` (DRAFT/PUBLISHED/ARCHIVED) and ordering so God
Mode can manage publishing and sequencing.

## 5. Clone a client from this template

1. **Fork/clone** this repo into the client's repository.
2. **New Neon database**; set `DATABASE_URL` in the client's Vercel project.
3. **Reseed** — copy `prisma/seed.ts`, swap in the client's settings, services,
   team, projects, pages/sections. (A future God Mode export/import will make this
   point-and-click.)
4. **Toggle modules** for that client's tier (e.g. disable `portfolio` + `blog`).
5. **Deploy** to Vercel.

Same code, different data and flags — every client owns their own self-contained app.

## 6. Roadmap

- **God Mode admin** (Increment 2): auth, dashboard, CRUD for every collection, the
  page/section editor, media library, feature-flag UI, activity log.
- **AI**: wire `Post.aiGenerated` to a Claude-powered blog generator; JSON-LD schema
  and a `sitemap.ts`/`robots.ts` for SEO/GEO.
- **Forms**: promote the contact endpoint into the visual form builder.
- **Prisma 7 + Neon adapter** when we want serverless-optimized connections.
