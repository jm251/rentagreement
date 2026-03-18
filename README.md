# Rent Agreement Generator India

Next.js 14 MVP for generating Indian rent agreements with:

- an 8-step guided form
- AI clause generation via FastRouter
- Stripe Checkout payment flow
- Supabase database and private PDF storage
- SMTP email delivery
- Vercel-safe PDF generation with `puppeteer-core` and `@sparticuz/chromium`
- protected admin listing

## Tech Stack

- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- shadcn-style UI components
- React Hook Form + Zod
- Supabase
- FastRouter
- Stripe
- Nodemailer SMTP

## Project Structure

```text
app/
  api/
    create-pdf/route.ts
    generate-clauses/route.ts
    payment/initiate/route.ts
    payment/verify/route.ts
    payment/webhook/route.ts
  admin/page.tsx
  generate/page.tsx
  preview/[id]/page.tsx
  success/page.tsx
components/
data/
lib/
public/
supabase/
types/
```

## Environment Variables

This refactor uses only env names already available in the workspace:

```env
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_DEFAULT_PRICE_INR
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_STORAGE_BUCKET
FASTROUTER_API_KEY_3
FASTROUTER_API_URL
FASTROUTER_MODEL
STRIPE_WEBHOOK_SECRET
STRIPE_SECRET_KEY
STRIPE_PRICE_PRO_ID
STRIPE_PRICE_FAMILY_ID
STRIPE_PRICE_WEEKLY_ADDON_ID
PAYMENT_LINK_PRO
PAYMENT_LINK_FAMILY
PAYMENT_LINK_WEEKLY_ADDON
SMTP_FROM_EMAIL
SMTP_HOST
SMTP_PASS
SMTP_PORT
SMTP_SECURE
SMTP_USER
ADMIN_USERNAME
ADMIN_PASSWORD
NEXT_PUBLIC_DEFAULT_LANGUAGE
NEXT_PUBLIC_ENABLE_WHATSAPP_SHARE
NEXT_PUBLIC_ENABLE_HINDI
```

Required by the current implementation:

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_DEFAULT_PRICE_INR`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_STORAGE_BUCKET`
- `FASTROUTER_API_KEY_3`
- `FASTROUTER_API_URL`
- `FASTROUTER_MODEL`
- `STRIPE_SECRET_KEY`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`

Optional but supported:

- `STRIPE_WEBHOOK_SECRET`
- `SMTP_*`
- `NEXT_PUBLIC_ENABLE_WHATSAPP_SHARE`
- `NEXT_PUBLIC_ENABLE_HINDI`

Currently present but not required by this implementation:

- `STRIPE_PRICE_*`
- `PAYMENT_LINK_*`

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Copy the env template:

```bash
cp .env.example .env.local
```

3. Fill in the values you already have.

4. Run the Supabase schema from `supabase/schema.sql`.

## Provider Setup

### FastRouter

Step 7 calls `/api/generate-clauses`, which posts to `FASTROUTER_API_URL` using `FASTROUTER_API_KEY_3` and `FASTROUTER_MODEL`. The route sends the required legal drafting system prompt, extracts the returned content, sanitizes it, and validates that it is a JSON array of 3 to 5 clauses.

### Stripe

`/api/payment/initiate` creates a Stripe Checkout Session server-side using `STRIPE_SECRET_KEY` and redirects the user to the hosted Stripe page. The success redirect includes `agreementId`, `session_id`, and the stored access token. `/success` then finalizes the agreement by verifying the Stripe session server-side, generating the PDF, uploading it to Supabase Storage, and marking the record as paid.

`/api/payment/verify` is still available for server-side verification and retries. `/api/payment/webhook` can process Stripe webhook events when `STRIPE_WEBHOOK_SECRET` is configured.

### SMTP

If `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, and `SMTP_FROM_EMAIL` are configured, the app emails the buyer a preview and PDF link after payment is finalized. If they are absent, payment still succeeds and email is skipped gracefully.

## Supabase Setup

1. Create a Supabase project.
2. Run `supabase/schema.sql`.
3. Confirm the `agreements` table exists.
4. Confirm the private `agreements` bucket exists.
5. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.

The service-role key is used only in server code for inserts, updates, PDF storage, and signed URL creation.

## Payment Flow

1. The generator validates the form payload.
2. `/api/payment/initiate` stores a draft agreement in Supabase.
3. The server creates a Stripe Checkout Session.
4. The browser redirects to Stripe Checkout.
5. Stripe redirects back to `/success` with `session_id`.
6. The app verifies the session server-side.
7. The PDF is generated and uploaded to Supabase Storage.
8. The buyer can preview, download, and optionally receive the agreement by email.

## PDF Generation

The same agreement renderer powers:

- Step 8 preview
- `/preview/[id]`
- the HTML snapshot used for PDF rendering

PDF generation runs on the Node.js runtime using `puppeteer-core` with `@sparticuz/chromium`.

## Admin Page

`/admin` is protected with HTTP basic auth via:

- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`

The table shows agreement status, contact email, rent, payment amount, preview link, and PDF availability.

## Run Locally

```bash
npm run dev
```

## Deploy to Vercel

1. Push the repo to GitHub.
2. Import into Vercel.
3. Add the same envs there.
4. Deploy.

Routes that use secrets, Stripe, SMTP, or PDF generation already run on the Node.js runtime.

## Known Limitations

- The state-law mapping is intentionally conservative and centralized in `data/state-law-map.ts`.
- Pincode detection uses a local prefix mapping, not a postal API.
- English is the implemented language in this MVP.
- `STRIPE_PRICE_*` and `PAYMENT_LINK_*` envs are available but not required by the current Checkout Session flow.

## Legal Disclaimer

This application is not a law firm and does not provide legal advice. Every generated document is computer-generated from user input and should be reviewed before execution, stamping, notarization, or registration.
