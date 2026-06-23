# Agency Platform

The agency's own website **and** the white-label platform we template for clients.

Built on one principle from the company knowledge doc (`docs/COMPANY_KNOWLEDGE.md`):
**nothing that may reasonably change is hardcoded.** Every page, section, word, image,
brand color, menu item, and SEO value comes from the database. The frontend is just a
rendering engine. The admin console — **God Mode** — is where everything is controlled.

Because the whole site is data + feature flags, the same codebase serves any client:
**clone → reseed content → toggle modules.**

---

## Tech stack

| Layer       | Choice                                             |
| ----------- | -------------------------------------------------- |
| Framework   | Next.js 16 (App Router, React 19, Server Components)|
| Language    | TypeScript                                         |
| Styling     | Tailwind CSS v4 (brand tokens driven by DB)        |
| Database    | PostgreSQL — **Neon** in production                |
| ORM         | Prisma 6                                           |
| Hosting     | **Vercel** (one self-contained app per client)     |
| Auth        | bcrypt + JWT sessions (God Mode — in progress)     |

---

## Quick start (local)

```bash
# 1. Install
npm install

# 2. Configure env (copy and fill DATABASE_URL etc.)
cp .env.example .env

# 3. Create tables + seed the agency's content
npm run db:push
npm run db:seed

# 4. Run
npm run dev          # http://localhost:3000
```

Default God Mode admin (from `.env` seed vars): `admin@agency.com` / `ChangeMe!2026`.

### Scripts

| Command            | Does                                             |
| ------------------ | ------------------------------------------------ |
| `npm run dev`      | Dev server                                       |
| `npm run build`    | `prisma generate` + production build             |
| `npm run db:push`  | Sync schema → database                           |
| `npm run db:seed`  | Load the agency's content                        |
| `npm run db:reset` | Wipe + re-seed (destructive)                     |
| `npm run db:studio`| Prisma Studio (browse data)                      |

---

## Project structure

```
prisma/
  schema.prisma        # full data model (pages, sections, collections, users…)
  seed.ts              # the agency's real content
src/
  lib/
    db.ts              # Prisma singleton
    site.ts            # data-access loaders (settings, nav, pages, collections)
    types.ts           # section data contracts
  components/
    site/              # Header, Footer, Logo, ContactForm
    sections/          # one component per section type + SectionRenderer
  app/
    layout.tsx         # loads settings, injects brand CSS vars, SEO metadata
    page.tsx           # home (renders the "home" page's sections)
    [slug]/            # every other CMS page, by slug
    services/[slug]/   # service detail
    work/[slug]/       # case-study detail
    api/contact/       # lead capture
docs/
  COMPANY_KNOWLEDGE.md # the master knowledge document
  PLATFORM.md          # architecture + how to template per client
```

---

## Deploy (Vercel + Neon)

1. Create a Neon Postgres database; copy the pooled connection string.
2. In Vercel project settings → Environment Variables, set:
   - `DATABASE_URL` = your Neon string
   - `AUTH_SECRET` = `openssl rand -hex 32`
   - `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`
3. Push schema to Neon once: `npx prisma db push` (with the Neon `DATABASE_URL`),
   then `npm run db:seed`.
4. Deploy. `npm run build` runs `prisma generate` automatically.

---

## Status

**Done — Increment 1 (this site):** data model, the agency's seeded content, the
dynamic public site (home, services, work, about, contact + detail pages), dynamic
branding/SEO/navigation, working contact form → leads, and the feature-flag/templating
foundation.

**Next — Increment 2 (God Mode admin):** login + dashboard + CRUD over every collection,
the page/section editor, media library, and feature-flag UI.

See `docs/PLATFORM.md` for the architecture and the clone-per-client workflow.
