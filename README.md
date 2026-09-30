# GELife Group website

Marketing site and GELife Learning portal for GELife Group LLC. Built on
[vinext](https://github.com/cloudflare/vinext) (Next.js App Router on Vite) and
deployed to Cloudflare Workers with a D1 database, via the ChatGPT Sites starter.

## What's here

| Area | Paths |
| --- | --- |
| Marketing pages | `app/page.tsx`, `app/services`, `app/about`, `app/profile`, `app/contact` |
| Legal | `app/privacy`, `app/terms` (have these reviewed before launch) |
| Course catalog and content | Published PHP database courses via `lib/course-api.ts` |
| Learner portal | `app/training/*`, `components/*-form.tsx` |
| Admin dashboard | `app/admin`, `app/api/admin/*` |
| API | `app/api/{enroll,login,logout,progress,checkout,contact,recover}`, `app/api/stripe/webhook` |
| Database | `db/schema.ts`, migrations in `drizzle/` |

## How enrollment and payment work

1. A visitor enrolls. A learner account is created and the enrollment is **pending**.
2. The course unlocks (status **active**) only when payment is confirmed:
   - **Stripe configured:** the learner pays by card from their dashboard. The course opens
     from the Stripe webhook, or from the success page if the webhook is delayed.
   - **Stripe not configured:** you mark it paid in `/admin` once you receive payment.
3. Course pages and progress saving refuse anything that isn't active.

Login details are emailed when email is configured (which also verifies the address);
otherwise they are shown once on screen. Learners can recover a lost access code from the
login page (email required), or you can issue a new one in `/admin`.

## Configuration (secrets)

Set these as secrets on the hosting platform. Only `ADMIN_PASSWORD` is needed to start;
the site works without the others and turns each feature on when its secret is present.

| Name | Purpose |
| --- | --- |
| `SITE_URL` | Public origin, e.g. `https://gelifegroup.org`. Used in emails and Stripe redirects. |
| `ADMIN_PASSWORD` | Turns on `/admin`. Use a long, unique password (20+ characters). |
| `RESEND_API_KEY` | Enables email: login details, recovery links, and notifications to you. |
| `EMAIL_FROM` | Sender, e.g. `GELife Group <learning@gelifegroup.org>`. Verify the domain in Resend. |
| `NOTIFY_EMAIL` | Where notifications go. Default `info@gelifegroup.org`. |
| `STRIPE_SECRET_KEY` | Enables card payment through Stripe Checkout. |
| `STRIPE_WEBHOOK_SECRET` | Signing secret of the webhook endpoint below. |

**Stripe webhook:** add an endpoint at `https://<your-domain>/api/stripe/webhook` for the
events `checkout.session.completed` and `checkout.session.async_payment_succeeded`.
Test with `sk_test_` keys first.

## PHP Backend Deployment

Set the frontend build environment variable `NEXT_PUBLIC_PHP_API_URL` to the full
PHP API base URL, including its `/api` path, for example
`https://example.com/gelife/php-backend/api`. Next.js uses this same value for
server-side calls and `/api/*` rewrites. The PHP host must serve its `uploads/`
directory at the parent of that API path and allow PHP to write to it. Configure
the PHP database connection, `SITE_URL` (the public frontend origin used in reset
links), and `SMTP_HOST`, `SMTP_PORT`, `SMTP_ENCRYPTION`, `SMTP_USERNAME`,
`SMTP_PASSWORD`, and `SMTP_FROM_EMAIL` on the backend host as well.
Before deploying the expanded course editor, apply
`php-backend/migrations/20260930_course_metadata.sql` to the PHP backend's MySQL/MariaDB database.

## Database migrations

Apply `drizzle/0001_payments_contact_recovery.sql` to the **production** D1 database before
this version goes live. It only adds tables and columns. Existing learners and enrollments
are untouched; existing enrollments stay active and are marked `manual`.

Local preview database:

```sh
npm run build
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB \
  --local --config dist/server/wrangler.json --persist-to .wrangler/state \
  --file drizzle/0001_payments_contact_recovery.sql
```

After changing `db/schema.ts`, generate a new migration with `npm run db:generate`.

## Commands

- `npm run install:ci`: install locked dependencies
- `npm run dev`: development server
- `npm run build`: production build
- `npm start`: run the built Worker locally (local secrets go in `.dev.vars`, which is git-ignored)
- `npm run lint`
- `node scripts/qa-learning.mjs`: 60 end-to-end checks against the build (enrollment, payment
  gating, admin, Stripe webhook signatures, recovery, logout). Uses local mocks and never calls
  real Stripe or Resend.

## Known framework issue

vinext `1.0.0-beta.5` throws `navigateClientSide is not a function` when a `next/link` is
clicked, so links did nothing. Internal links use `components/link.tsx`, a plain `<a>` that
does a full page load. After upgrading vinext, confirm client navigation works before
switching back.
# gelife
