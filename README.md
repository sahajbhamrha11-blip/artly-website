# ARTLY — Deliver Comfort

Production website for **ARTLY**, a brand of fireplaces and cooking stoves.
Public site + product catalogue + enquiry system + secure admin panel.

**Stack:** Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Prisma ORM · SQLite (PostgreSQL-ready) · jose (JWT sessions) · bcrypt · sharp · Nodemailer · Zod

---

## 1. What's included

| Area | Details |
| --- | --- |
| **Home** | Cinematic hero, brand introduction, collections (Fireplaces / Cooking Stoves), featured products, *Why ARTLY*, lifestyle showcase, call to action |
| **About** | Who we are, vision, mission, values, craftsmanship details — all text editable in admin |
| **Products** | Catalogue with live search + category filter (`/products?category=…&q=…`), skeleton loading state, empty state |
| **Product pages** | `/products/<slug>` — image gallery + lightbox, features, variations, specifications table ("On request" for unknown values), enquiry form, WhatsApp button, related products, Product + Breadcrumb JSON-LD |
| **Contact** | Validated enquiry form (prefilled from product pages), business details, WhatsApp, social links, Google Maps embed |
| **Enquiries** | Saved to the database, optional email notification, honeypot + timing check + rate limiting + link filter for spam |
| **Admin** (`/admin`) | Dashboard, products (add/edit/delete, multi-image upload & ordering, specs, features, variations, SEO fields, publish/feature toggles), categories, enquiries (filter/search/status/notes/delete), website settings (contact details, social links, page copy, imagery), password change |
| **SEO** | Unique titles & descriptions, canonical URLs, Open Graph, `sitemap.xml` (with product images), `robots.txt`, Organization / Product / Breadcrumb structured data, alt text everywhere, AVIF/WebP responsive images, lazy loading |
| **Other** | Custom 404 (real 404 status), error boundaries, cookie notice (essential cookies only), privacy page, skip link, keyboard-accessible menus/gallery, `prefers-reduced-motion` support, security headers |

### Brand assets
- `assets-src/artly-logo-original.jpg` — the supplied logo (untouched original).
- `public/images/brand/artly-logo.png` — same logo with the white JPEG background removed; colours, proportions and tagline unchanged (`npm run assets:logo`). It is always placed on a light surface.
- `public/images/products/*.jpg` — the supplied product photographs, unedited.
- `public/images/details/*.jpg` — straight close-up crops of those photos (`node scripts/make-details.mjs`).

### Content you should review
Nothing about the company was invented. Specifically:
- **Product names** (Heritage Hearth Stove, Panorama Fireplace, Tower Fireplace, Heritage Compact Stove, Twin Door Oven Stove) are working names chosen from what is visible in each photo — rename them in **Admin → Products**.
- **Specifications** only list what is visible (finish, door type, flue position…). Dimensions, weight, flue diameter, material thickness and heating capacity show **"On request"** until you enter verified values.
- **Contact details, address, map, social links and WhatsApp** are empty. Empty items are hidden (or show "Details coming soon"), so there are no dead links. Fill them in under **Admin → Website settings**.
- Lifestyle/interior photography: the home page uses your product photos until you upload interior shots under **Admin → Website settings → Imagery**.
- The privacy page is a general template — have it reviewed for your jurisdiction.

---

## 2. Local development

**Requirements:** Node.js 20+ (22 LTS recommended), npm.

```bash
cp .env.example .env          # then edit .env (see section 3)
npm install
npx prisma migrate dev        # creates prisma/dev.db and applies migrations
npm run db:seed               # categories, products, settings, first admin user
npm run dev                   # http://localhost:3000
```

Admin panel: <http://localhost:3000/admin> — sign in with `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env`, then change the password under **Website settings**.

Useful scripts:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / server |
| `npm run typecheck` | TypeScript check |
| `npm run db:migrate` | Create/apply a migration after editing `prisma/schema.prisma` |
| `npm run db:deploy` | Apply migrations in production |
| `npm run db:seed` | Seed data (safe to re-run; never overwrites) |
| `npm run db:studio` | Browse the database in Prisma Studio |
| `npm run assets:logo` | Regenerate the web logo, favicon and OG image from `assets-src/` |

---

## 3. Environment variables

All secrets live in `.env` (never committed). See `.env.example` for the template.

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | ✅ | Public URL, no trailing slash (e.g. `https://www.artly.example`). Used for canonical URLs, sitemap, OG tags, WhatsApp product links. |
| `DATABASE_URL` | ✅ | `file:./dev.db` for SQLite (path relative to `prisma/`), or a PostgreSQL URL. |
| `AUTH_SECRET` | ✅ | Random string, **≥ 32 characters**, signs admin sessions. `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"` |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | ✅ (first run) | First admin account, created by the seed if it doesn't exist. Password ≥ 8 chars. |
| `UPLOAD_DIR` | – | Where admin-uploaded images are stored (default `./storage/uploads`). Must be **persistent** in production. |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD` | – | SMTP server for enquiry notifications. Leave `SMTP_HOST` empty to disable email. |
| `MAIL_FROM` | – | Sender, e.g. `ARTLY Website <no-reply@yourdomain.com>` |
| `ENQUIRY_NOTIFY_TO` | – | Recipient(s) for new-enquiry emails (comma-separated). |

Enquiries are **always** saved to the database; email is an extra notification. If sending fails the visitor still sees success and the enquiry is marked "Email notification: Not sent" in admin.

---

## 4. Production deployment

The app needs a **Node.js server with persistent disk** (for the SQLite file and uploaded images). Recommended options:

### Option A — Docker (any VPS: DigitalOcean, Hetzner, AWS Lightsail, etc.)

```bash
cp .env.example .env    # set NEXT_PUBLIC_SITE_URL, AUTH_SECRET, ADMIN_*, SMTP_*
docker compose up -d --build
```

The container applies migrations, runs the (idempotent) seed and starts on port 3000. All data lives in the `artly-data` volume (`/data/artly.db`, `/data/uploads`). Put Nginx/Caddy in front for HTTPS, e.g. Caddy:

```
www.yourdomain.com {
  reverse_proxy localhost:3000
}
```

**Backups:** copy the volume regularly, e.g. `docker run --rm -v artly_artly-data:/data -v $PWD:/backup alpine tar czf /backup/artly-backup.tgz /data`.

### Option B — Node on a server (PM2)

```bash
npm ci
npm run build
npx prisma migrate deploy
npm run db:seed
pm2 start "npm start" --name artly
```

### Option C — Railway / Render / Fly.io
Deploy the repository with the Dockerfile and attach a persistent volume at `/data`. Set the environment variables in the dashboard.

### Serverless hosts (Vercel / Netlify)
These have no persistent disk. To use them:
1. Switch to PostgreSQL (e.g. Neon, Supabase): in `prisma/schema.prisma` set `provider = "postgresql"`, set `DATABASE_URL`, delete `prisma/migrations/`, run `npx prisma migrate dev --name init`. For case-insensitive search on PostgreSQL, add `mode: "insensitive"` to the `contains` filters in `src/lib/products.ts`.
2. Replace local image storage in `src/app/api/admin/upload/route.ts` with an object store (Vercel Blob, S3, Cloudinary) and add its domain to `images.remotePatterns` in `next.config.ts`.
3. Replace the in-memory rate limiter in `src/lib/rate-limit.ts` with a shared store (e.g. Upstash Redis).

### Go-live checklist
- [ ] `NEXT_PUBLIC_SITE_URL` set to the real domain (rebuild after changing it)
- [ ] Strong unique `AUTH_SECRET`; admin password changed after first login
- [ ] HTTPS enabled (session cookies are `Secure` in production)
- [ ] Business phone, email, WhatsApp, address, map and social links filled in
- [ ] Product names, descriptions and verified specifications reviewed
- [ ] SMTP configured and a test enquiry received
- [ ] Sitemap submitted in Google Search Console (`https://yourdomain/sitemap.xml`)
- [ ] Backups scheduled for the database and uploads

---

### Static design preview (GitHub Pages)
`docs/` holds a look-only snapshot of the site (all pages, filters and search work; forms are disabled) that GitHub Pages serves for free. To refresh it after changes, run the dev server on port 3005 and:

```bash
node scripts/preview/export-preview.mjs http://localhost:3005 . ./docs
```

(Re-create the empty `docs/.nojekyll` file afterwards.)

---

## 5. Project structure

```
prisma/
  schema.prisma            Database schema (Category, Product, ProductImage, Enquiry, Setting, AdminUser)
  migrations/              SQL migrations
  seed.ts                  Initial data
public/images/             Brand, product and detail imagery
scripts/                   Asset preparation scripts (logo, detail crops)
src/
  app/
    (site)/                Public pages: home, about, products, products/[slug], contact, privacy
    admin/                 Login, dashboard, products, categories, enquiries, settings + server actions
    api/enquiries          Public enquiry endpoint (validation, anti-spam, DB, email)
    api/admin/upload       Authenticated image upload (sharp re-encode → WebP)
    uploads/[...path]      Serves uploaded images from UPLOAD_DIR
    sitemap.ts, robots.ts  SEO
    not-found.tsx          Custom 404
  components/              Header, Footer, ProductCard, ProductGallery, EnquiryForm, filters, etc.
  lib/                     db, auth/session, settings, products, validation, mail, rate limiting, storage
  middleware.ts            Protects /admin and /api/admin
```

### Adding products
Unlimited products can be added in **Admin → Products → Add product** — each gets its own SEO-friendly page at `/products/<slug>`, appears in search, category filters, related products and the sitemap automatically. New categories (**Admin → Categories**) instantly become filters and collection links.

## 6. Security notes
- Admin routes are protected by middleware **and** re-checked in every server action/route handler.
- Passwords hashed with bcrypt (cost 12); login is rate-limited and timing-equalised.
- Sessions: signed HS256 JWT in an `httpOnly`, `SameSite=Lax`, `Secure` (prod) cookie, 8-hour expiry.
- Uploads: admin-only, type and size checked, re-encoded with sharp (strips metadata, rejects non-images), path-traversal safe.
- All input validated with Zod on the server; only a salted hash of visitor IPs is stored.
- No credentials or API keys are shipped to the browser.
