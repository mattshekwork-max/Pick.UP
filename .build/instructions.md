# Voxadora - Build Instructions

AI voice receptionist for every small business

## Feature Plan

### Core Feature: AI Phone Answering & Appointment Booking
A natural-sounding AI receptionist that instantly answers every incoming call, handles common questions using business-specific FAQs, and books appointments directly into Google Calendar — all without human intervention.

### Simple Setup Form
A single-page onboarding form where the business enters their name, hours, services, FAQs, and connects their Google Calendar and phone number — AI receptionist is live in under 10 minutes.

### SMS Call Summary
After every call, the business owner receives an SMS with a summary of who called, what they needed, and any appointment booked — ensuring nothing falls through the cracks.

### Call Transfer
If the caller requests a real person or the AI detects an urgent/complex issue, the call is seamlessly transferred to a designated staff phone number.

## Landing Page Copy

**Hero headline:** Your Phone Answered, Every Time
**Hero subheadline:** Pick.UP is an AI receptionist that picks up your business calls, books appointments, answers common questions, and sends you a summary. Set it up in minutes, not days.
**CTA text:** Try Pick.UP Free

**How it works headline:** Live in Three Steps
**How it works subheadline:** Connect your number, tell Pick.UP about your business, and let it handle the rest.

**Steps:**
1. **Connect Your Number** - Forward your business line to Pick.UP or get a new number instantly.
2. **Set Your Preferences** - Fill in your hours, services, FAQs, and where to route specific calls.
3. **Pick.UP Takes Over** - Every call is answered, handled, and summarized via SMS so nothing slips through.

**Features:**
- **Books Appointments Directly** - undefined
- **SMS Call Summaries** - undefined
- **Smart Call Transfers** - undefined
- **90+ Languages** - undefined
- **Sub-Second Response** - undefined
- **Handles Your FAQs** - undefined

**Final CTA headline:** Stop Missing Calls That Pay Your Bills
**Final CTA subheadline:** Free to start. Takes about five minutes to set up. No hardware, no contracts.
**Final CTA button:** Try Pick.UP Free

## Database Schema

The schema is in `supabase-schema.sql`. It was already executed via the Supabase MCP in the setup step. Here it is for reference:

```sql
-- Users table (standard)
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(20) DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  subscription_status VARCHAR(20) DEFAULT 'free',
  subscription_ends_at TIMESTAMPTZ,
  subscription_created_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS users_subscription_status_idx ON users(subscription_status);

-- Business profiles configured by the owner
CREATE TABLE IF NOT EXISTS businesses (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  business_name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(50),
  ringley_phone_number VARCHAR(50),
  transfer_phone_number VARCHAR(50),
  business_hours JSONB NOT NULL DEFAULT '{}',
  services TEXT[] NOT NULL DEFAULT '{}',
  faqs JSONB NOT NULL DEFAULT '[]',
  greeting_message TEXT,
  google_calendar_id VARCHAR(255),
  google_refresh_token TEXT,
  timezone VARCHAR(100) NOT NULL DEFAULT 'America/New_York',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS businesses_user_id_idx ON businesses(user_id);
CREATE INDEX IF NOT EXISTS businesses_ringley_phone_idx ON businesses(ringley_phone_number);
CREATE INDEX IF NOT EXISTS businesses_is_active_idx ON businesses(is_active);

-- Inbound call records
CREATE TABLE IF NOT EXISTS calls (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  caller_phone_number VARCHAR(50),
  caller_name VARCHAR(255),
  call_summary TEXT,
  call_duration_seconds INTEGER,
  call_status VARCHAR(30) NOT NULL DEFAULT 'completed',
  was_transferred BOOLEAN NOT NULL DEFAULT false,
  transcript TEXT,
  external_call_id VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS calls_business_id_idx ON calls(business_id);
CREATE INDEX IF NOT EXISTS calls_created_at_idx ON calls(created_at);
CREATE INDEX IF NOT EXISTS calls_external_call_id_idx ON calls(external_call_id);

-- Appointments booked via AI calls
CREATE TABLE IF NOT EXISTS appointments (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  call_id INTEGER REFERENCES calls(id) ON DELETE SET NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50),
  customer_email VARCHAR(255),
  service VARCHAR(255),
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  google_event_id VARCHAR(255),
  status VARCHAR(30) NOT NULL DEFAULT 'confirmed',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS appointments_business_id_idx ON appointments(business_id);
CREATE INDEX IF NOT EXISTS appointments_starts_at_idx ON appointments(starts_at);
CREATE INDEX IF NOT EXISTS appointments_status_idx ON appointments(status);

-- SMS summaries sent to business owners
CREATE TABLE IF NOT EXISTS sms_logs (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  call_id INTEGER REFERENCES calls(id) ON DELETE SET NULL,
  recipient_phone VARCHAR(50) NOT NULL,
  message_body TEXT NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'sent',
  external_message_id VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS sms_logs_business_id_idx ON sms_logs(business_id);
CREATE INDEX IF NOT EXISTS sms_logs_call_id_idx ON sms_logs(call_id);
```

## Payments (Stripe)

Stripe is OPTIONAL. The user was already asked about this during setup.

- If the user said **yes** to payments: keep the Stripe files, set up products via the Stripe MCP, and integrate checkout/webhook flows
- If the user said **no** to payments: skip building new payment features. Stripe boilerplate files stay in place (dormant without keys). The user can add Stripe later.

When Stripe IS included:
- Use the existing Stripe patterns from the boilerplate
- Create a pricing/upgrade page at a public route (accessible without login)
- Stripe webhooks need `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS
- Use `getSupabaseAdmin()` from "@/lib/supabase" ONLY in Stripe webhook handlers

## Email (Resend)

Resend is OPTIONAL. The user was already asked about this during setup.

- If the user said **yes** to email: use `lib/email.ts` which is already wired up. Add product-specific email templates (e.g. onboarding sequences, feature notifications, weekly digests) and connect them to the right triggers (signup, subscription events, feature-specific actions).
- If the user said **no** to email: skip building new email features. Email files stay in place (emails log to console without an API key). The user can add Resend later.

When Resend IS included:
- Use the existing `sendEmail()`, `sendWelcomeEmail()`, and `sendSubscriptionEmail()` functions from `lib/email.ts`
- Add new email functions to `lib/email.ts` following the same pattern
- The welcome email is already triggered on signup in `app/api/users/route.ts`
- Subscription emails are already triggered in the Stripe webhook handler
- `RESEND_FROM_EMAIL` defaults to `onboarding@resend.dev` for testing. The user can verify a custom domain in Resend later.

## Auth Patterns

Supabase Auth is already set up in the boilerplate. The login, signup, and auth callback pages exist. Customize them to match the app's brand.

### Server-side (server components, server actions, API routes):
```ts
import { createClient } from "@/lib/supabase/server";

const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();

if (!user) {
  redirect("/login");
}
// user.id is a UUID, user.email is the email
```

### Client-side (client components):
```tsx
"use client";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();
const { data: { user } } = await supabase.auth.getUser();
```

### Auth URLs:
- Login: `/login`
- Signup: `/signup`
- Logout: call `supabase.auth.signOut()` then `router.push("/")`

### Library functions pattern:
Library functions in lib/ should accept a SupabaseClient parameter:
```ts
import type { SupabaseClient } from "@supabase/supabase-js";
export async function myFunction(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase.from('table').select('*').eq('user_id', userId);
  return data;
}
```

### DO NOT:
- Install @auth0/nextjs-auth0, @clerk/nextjs, next-auth, or any other auth library
- Create a separate auth provider
- Use Drizzle ORM (use the Supabase JS client)
- Modify middleware.ts

## Project Structure

```
.
├── app/                    # Next.js app directory
│   ├── (app)/             # Authenticated pages (has Navbar + Footer)
│   │   ├── dashboard/     # Main dashboard
│   │   └── ...            # Other authenticated pages
│   ├── login/             # Login page
│   ├── signup/            # Signup page
│   ├── auth/callback/     # Auth callback handler
│   ├── api/               # API routes
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page (outside (app) group)
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── Navbar.tsx         # Navigation bar
│   ├── Footer.tsx         # Footer component
│   └── LandingPageClient.tsx  # Landing page client component
├── db/                   # Database
│   └── schema.ts         # TypeScript types
├── lib/                  # Utilities
│   ├── supabase/         # Supabase client helpers
│   └── ...               # Additional utilities
├── supabase-schema.sql   # Database schema (already executed)
└── .build/               # Build instructions (this file)
```

## RLS Best Practices

Every table MUST have Row Level Security enabled. Here are common patterns:

### Owner-only access (most tables):
```sql
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own records" ON table_name
  FOR ALL USING (user_id = auth.uid());
```

### Public read, owner write:
```sql
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read" ON table_name
  FOR SELECT USING (true);
CREATE POLICY "Users can manage own records" ON table_name
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own records" ON table_name
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own records" ON table_name
  FOR DELETE USING (user_id = auth.uid());
```

### Public read and write (rare, use sparingly):
```sql
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public access" ON table_name
  FOR ALL USING (true) WITH CHECK (true);
```

### Users table (special, ID references auth.users):
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Users can insert own data" ON users
  FOR INSERT WITH CHECK (id = auth.uid());
```

Use `auth.uid()` directly (no ::text cast). User IDs are UUIDs.

## User Creation Trigger

The schema includes a trigger that auto-creates a user row when someone signs up:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## Design System

**Read `DESIGN.md` — it is the design authority for this product.** All colors, typography, component styling, border radius, layout decisions, and brand personality are specified there. Do NOT deviate from it.

Key technical notes:
- This project uses Tailwind CSS v4 with oklch() color format. Convert the hex values in DESIGN.md to oklch() when writing CSS variables.
- Place Google Font @import statements at the VERY TOP of globals.css, BEFORE all other CSS.
- The landing page at `app/page.tsx` is OUTSIDE the (app) route group — it has NO Navbar/Footer and includes its own nav and footer.
- The landing page client component is `components/LandingPageClient.tsx` with copy already filled in.
- Authenticated pages go in `app/(app)/` which automatically includes Navbar + Footer.
- Footer must include "Built with SaasOpportunities.com"

## Build Process

1. **Read DESIGN.md** — understand the brand personality, colors, typography, component style, and layout decisions BEFORE writing any code
2. **Design first:** Update `app/globals.css` with the exact colors and fonts from DESIGN.md (converted to oklch()). Import the 2 Google Fonts specified.
3. **Customize the landing page:** Update `components/LandingPageClient.tsx` following DESIGN.md's layout, radius, and component guidance. Customize `app/page.tsx` metadata.
4. **Customize auth pages:** Update login and signup pages to match the brand
5. **Build server actions** for all core features using the Supabase JS client with auth checks
6. **Build dashboard pages** inside `app/(app)/` — follow DESIGN.md for component choices (modals vs drawers, card treatment, nav style, data display patterns)
7. **Set up Stripe** (only if user wants payments): pricing page, checkout, webhooks
8. **Run `npm run build`** and fix ALL errors
9. **Repeat step 8** until the build passes cleanly

## After the Build Passes

Replace this project's CLAUDE.md with a user-facing guide:

- App name and description
- "Getting Started" steps (connect MCP, "set up my project")
- MCP server commands (Supabase required, Stripe/Vercel/Cloudflare optional)
- Features list
- Key file paths
- "Built with SaasOpportunities.com"

## Critical Rules

- Do NOT modify package.json. Dependencies are pre-installed.
- Do NOT run `npm install` during the build phase (dependencies were installed during setup). Do NOT install new packages.
- Do NOT modify postcss.config.mjs, tailwind.config.ts, tsconfig.json, or next.config.ts unless required.
- Do NOT modify middleware.ts.
- Do NOT create a .env file with placeholder values. The .env is already set up.
- NEVER write API keys to any file other than .env.
- Routing: authenticated pages in `app/(app)/`, landing page at `app/page.tsx` (outside the group)
- Replace ALL instances of "YourApp", "example.com", "saas-boilerplate" with Voxadora

## Supabase Query Patterns

**Foreign key joins:** Use simple table name syntax: `.select("*, related_table(column)")`. Do NOT use `!constraint_name` hints — they are fragile and cause silent failures when constraint names don't match.

**Error handling:** Every Supabase query MUST check the `error` return value. NEVER destructure only `{ data }` and fall back to an empty array. Always return `{ data, error }` from server actions. Pages MUST check the error field and display a user-visible message (toast, alert, or inline), not just an empty state.
