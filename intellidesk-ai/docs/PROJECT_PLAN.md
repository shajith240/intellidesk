# IntelliDesk AI — Product Development Plan

> **Last Updated:** March 8, 2026
> **Status:** Prototype Complete → Transitioning to Commercial Product
> **Owner:** Shajith

---

## Current State Summary

IntelliDesk AI is an AI-powered B2B helpdesk platform that ingests customer emails, classifies them using LLMs, detects duplicates and threads, identifies customers, creates tickets with SLA tracking, and generates auto-responses from a semantic knowledge base.

**What exists today:**

- 11-step email processing pipeline (working)
- AI classification via Groq LLaMA-3.3-70B (working)
- Semantic search via Gemini embeddings + Pinecone (working)
- Auto-response generation with FAQ matching (working)
- Dashboard, ticket list, email queue, knowledge base, search, settings pages (working)
- Thread detection (4-tier), deduplication (2-tier), customer identification (3-tier) (working)
- SLA tracking infrastructure (working)
- IMAP polling + SMTP sending (working)
- Supabase PostgreSQL with 11 tables, indexes, triggers (working)

**What does NOT exist:**

- Authentication / Authorization (zero — all routes are public)
- Multi-tenancy (single-tenant only, all data accessible to everyone)
- Row-Level Security (Supabase RLS not configured)
- Billing / Subscription management
- Customer self-service portal
- Agent assignment workflow
- Error tracking, structured logging, retry logic
- Landing page, documentation site, legal pages

---

## Phase 0: Stop the Bleeding (Security Fixes)

**Goal:** Eliminate critical security vulnerabilities that make the app dangerous to run.

### Checklist

- [ ] **0.1** Delete `passwords and keys.txt` from the repository and git history
  - Use BFG Repo Cleaner or `git filter-repo` to purge from all commits
  - Verify file is in `.gitignore` (it already matches `*keys.txt` pattern)

- [ ] **0.2** Rotate ALL compromised credentials
  - Supabase: Generate new anon key and service role key from Supabase dashboard
  - Pinecone: Regenerate API key from Pinecone console
  - Gemini: Create new API key in Google AI Studio
  - Google App Password: Revoke old one, generate new in Google Account security
  - Update `.env.local` with new values

- [ ] **0.3** Move all secrets to `.env.local`
  - Verify `.env*` is in `.gitignore` (already present)
  - Create `.env.example` with placeholder values for documentation

- [ ] **0.4** Environment-gate destructive endpoints
  - Wrap `/api/cleanup` (DELETE) with `if (process.env.NODE_ENV !== 'production')` guard
  - Wrap `/api/seed` (POST) with same guard
  - Wrap `/api/seed/test-emails` (POST) with same guard
  - Wrap `/api/migrate` (POST) with same guard
  - Return 404 in production for all gated routes

- [ ] **0.5** Fix IMAP TLS verification
  - In `src/lib/email/imap.ts`: change `tls: { rejectUnauthorized: false }` to `true`
  - This prevents man-in-the-middle attacks on IMAP connections

### Files to Modify

```
passwords and keys.txt          → DELETE from repo + git history
src/app/api/cleanup/route.ts    → Add environment guard
src/app/api/seed/route.ts       → Add environment guard
src/app/api/seed/test-emails/route.ts → Add environment guard
src/app/api/migrate/route.ts    → Add environment guard
src/lib/email/imap.ts           → Fix TLS config
.env.example                    → CREATE with placeholder values
```

---

## Phase 1: Authentication & Authorization

**Goal:** No unauthenticated access to any route. Role-based access control.

### Checklist

- [ ] **1.1** Install and configure NextAuth.js (or Supabase Auth)
  - Recommended: NextAuth.js v5 with Supabase adapter
  - Providers: Email/password (credentials), Google OAuth
  - Session strategy: JWT with httpOnly cookies

- [ ] **1.2** Create auth pages
  - `src/app/(auth)/login/page.tsx` — login form with email/password + Google
  - `src/app/(auth)/signup/page.tsx` — registration with email verification
  - `src/app/(auth)/forgot-password/page.tsx` — password reset flow
  - `src/app/(auth)/verify/page.tsx` — email verification landing

- [ ] **1.3** Create auth database tables
  - `users` table: id, email, name, password_hash, role, organization_id, avatar_url, created_at
  - `organizations` table: id, name, domain, plan, created_at
  - Role enum: `admin`, `agent`, `viewer`

- [ ] **1.4** Add auth middleware
  - Create `src/middleware.ts` (Next.js middleware)
  - Protect all `/api/*` routes (except `/api/auth/*`)
  - Protect all `/(dashboard)/*` routes
  - Redirect unauthenticated users to `/login`

- [ ] **1.5** Add role-based access control
  - `admin`: Full access (settings, team management, billing, data export)
  - `agent`: Ticket management, email handling, knowledge base CRUD
  - `viewer`: Read-only dashboard and ticket viewing
  - Enforce roles in API route handlers with helper: `requireRole(session, 'admin')`

- [ ] **1.6** Add user context to the app
  - User profile section in sidebar (avatar, name, role)
  - Logout button
  - `performed_by` field in audit_logs should reference actual user ID (currently hardcoded as 'system')

- [ ] **1.7** Add rate limiting middleware
  - Use `next-rate-limit` or custom implementation
  - 100 requests/minute per IP for API routes
  - 10 requests/minute for auth endpoints (prevent brute force)

### Files to Create

```
src/app/(auth)/login/page.tsx
src/app/(auth)/signup/page.tsx
src/app/(auth)/forgot-password/page.tsx
src/app/(auth)/verify/page.tsx
src/middleware.ts
src/lib/auth/config.ts              → NextAuth configuration
src/lib/auth/middleware.ts           → Role checking helpers
supabase/migrations/002_auth.sql     → Users + organizations tables
```

### Files to Modify

```
src/app/(dashboard)/layout.tsx       → Add session check, redirect if unauthenticated
src/components/sidebar.tsx           → Add user profile section, logout button
src/app/api/*/route.ts               → Add auth check to every handler (all routes)
src/lib/supabase/server.ts           → Use authenticated client instead of service role
```

### Dependencies to Install

```
next-auth@5
@auth/supabase-adapter (or @next-auth/supabase-adapter)
bcryptjs (for password hashing)
```

---

## Phase 2: Multi-Tenancy

**Goal:** Each customer organization's data is fully isolated. One deployment serves many customers.

### Checklist

- [ ] **2.1** Add `organization_id` to data tables
  - Add column to: `accounts`, `tickets`, `emails`, `faqs`, `audit_logs`, `teams`, `auto_responses`
  - Create migration: `supabase/migrations/003_multi_tenancy.sql`
  - Backfill existing data with a default organization ID

- [ ] **2.2** Enable Supabase Row-Level Security (RLS)
  - Enable RLS on ALL tables
  - Create policies: Users can only SELECT/INSERT/UPDATE/DELETE rows where `organization_id` matches their JWT claim
  - Admin role can access cross-org data (for platform administration)

- [ ] **2.3** Organization onboarding flow
  - Create organization setup wizard: company name, domain, support email
  - Per-org IMAP/SMTP configuration (stored encrypted in org settings)
  - Per-org Pinecone namespace isolation (namespace = `org_{id}_emails`, `org_{id}_faqs`)

- [ ] **2.4** Switch from service role to authenticated client
  - Replace `getSupabaseAdmin()` calls with per-user authenticated Supabase client
  - Service role only used for background jobs (email polling) with explicit org context

- [ ] **2.5** Isolate vector storage
  - Pinecone namespaces per organization: `{org_id}_emails`, `{org_id}_faqs`, `{org_id}_tickets`
  - Update all `upsertVectors()` and `queryVectors()` calls to use org-scoped namespaces

### Files to Create

```
supabase/migrations/003_multi_tenancy.sql
src/app/(auth)/onboarding/page.tsx     → Organization setup wizard
src/lib/auth/org-context.ts            → Helper to get current org from session
```

### Files to Modify

```
src/lib/supabase/server.ts             → Authenticated client factory
src/lib/pinecone/client.ts             → Org-scoped namespace helpers
src/lib/pipeline/processor.ts          → Pass org context through pipeline
src/lib/email/imap.ts                  → Per-org IMAP config
src/lib/email/smtp.ts                  → Per-org SMTP config
ALL API routes                         → Filter by organization_id
```

---

## Phase 3: Complete the Core UX

**Goal:** Every feature shown in the UI actually works end-to-end. No dead buttons, no incomplete forms.

### Checklist

- [ ] **3.1** Ticket management completion
  - Complete ticket edit dialog (status, severity, category, team, agent assignment)
  - Add internal notes feature (agent-to-agent notes not visible to customer)
  - Add ticket merge functionality (merge duplicate tickets)
  - Add ticket history timeline (all actions, assignments, status changes)

- [ ] **3.2** Response workflow completion
  - Wire up "Send Response" button with confirmation dialog
  - Add "Save Draft" functionality
  - Add canned response picker (pre-written template selection)
  - Install and integrate Tiptap for rich text editing (replace plain textarea)
  - Show response preview before sending

- [ ] **3.3** Agent assignment
  - Add agent dropdown to ticket detail page
  - Create team management page under settings
  - Implement round-robin or load-based auto-assignment
  - Add collision detection (warn if another agent is viewing same ticket)

- [ ] **3.4** Settings page completion
  - IMAP/SMTP configuration form (test connection button)
  - SLA policy editor (modify response/resolution times per severity)
  - Team management (create/edit teams, assign category routing)
  - Organization settings (name, domain, branding)
  - User management (invite users, assign roles)

- [ ] **3.5** UI polish
  - Add error boundary component wrapping all pages
  - Add empty state illustrations for all pages (tickets, emails, search, knowledge base)
  - Add breadcrumb navigation on nested routes (ticket detail)
  - Centralize severity/category config in `src/lib/constants.ts` (currently duplicated across 5+ pages)
  - Add form validation using Zod schemas on all forms
  - Add keyboard shortcuts (Ctrl+K for search, Ctrl+N for new ticket)
  - Add mobile-responsive table alternatives (card view for small screens)

- [ ] **3.6** Audit log viewer
  - Create `src/app/(dashboard)/activity/page.tsx`
  - Show all audit_log entries with filters (action type, user, ticket, date range)
  - Link audit entries to relevant tickets

### Files to Create

```
src/lib/constants.ts                          → Centralized severity/category/status configs
src/components/error-boundary.tsx             → React error boundary wrapper
src/components/empty-state.tsx                → Reusable empty state component
src/components/breadcrumbs.tsx                → Breadcrumb navigation component
src/components/rich-text-editor.tsx           → Tiptap wrapper
src/app/(dashboard)/activity/page.tsx         → Audit log viewer
src/app/(dashboard)/settings/teams/page.tsx   → Team management
src/app/(dashboard)/settings/users/page.tsx   → User management
```

### Dependencies to Install

```
@tiptap/react @tiptap/starter-kit @tiptap/extension-placeholder
```

---

## Phase 4: Reliability & Observability

**Goal:** The system handles failures gracefully, retries intelligently, and we can see what's happening.

### Checklist

- [ ] **4.1** Error tracking
  - Install and configure Sentry (`@sentry/nextjs`)
  - Add Sentry to Next.js config (client + server + edge)
  - Add error boundary integration with Sentry
  - Configure source maps upload for production builds

- [ ] **4.2** Structured logging
  - Install Pino (`pino` + `pino-pretty` for dev)
  - Replace ALL `console.log` / `console.error` calls with Pino logger
  - Log levels: `error` for failures, `warn` for degraded, `info` for pipeline steps, `debug` for dev
  - Include context in logs: email_id, ticket_id, org_id, step_name, duration_ms

- [ ] **4.3** Async email processing queue
  - Install BullMQ (`bullmq`) + Redis
  - Move email processing from synchronous API call to background queue
  - Queue steps: `email.received` → `email.classified` → `email.ticketed` → `email.responded`
  - Add retry logic: 3 attempts with exponential backoff (1s, 4s, 16s)
  - Dead-letter queue for permanently failed emails
  - Queue dashboard UI (optional: Bull Board)

- [ ] **4.4** API resilience
  - Add retry wrapper for Groq API calls (3 retries, exponential backoff)
  - Add retry wrapper for Gemini API calls (3 retries, exponential backoff)
  - Add circuit breaker pattern: if API fails 5 times in 60s, stop calling for 30s
  - Add idempotency key on email ingest (`message_id` as natural key)

- [ ] **4.5** Health & monitoring
  - Create `/api/health` endpoint (checks Supabase, Pinecone, Groq, IMAP connectivity)
  - Set up uptime monitoring (BetterUptime, UptimeRobot, or Checkly)
  - Add response time tracking on all API routes
  - Set up alerts for: error rate > 5%, response time > 5s, queue backlog > 100

### Files to Create

```
src/lib/logger.ts                    → Pino logger setup
src/lib/queue/email-queue.ts         → BullMQ email processing queue
src/lib/queue/workers.ts             → Queue worker definitions
src/lib/resilience/retry.ts          → Retry wrapper with exponential backoff
src/lib/resilience/circuit-breaker.ts → Circuit breaker pattern
src/app/api/health/route.ts          → Health check endpoint
sentry.client.config.ts              → Sentry client config
sentry.server.config.ts              → Sentry server config
```

### Dependencies to Install

```
@sentry/nextjs
pino pino-pretty
bullmq ioredis
```

---

## Phase 5: Billing & Self-Serve

**Goal:** Customers can sign up, choose a plan, pay, and start using the product without talking to anyone.

### Checklist

- [ ] **5.1** Stripe integration
  - Install Stripe SDK
  - Create Stripe products and prices for each tier
  - Implement webhook handler for subscription events
  - Store subscription status in `organizations` table

- [ ] **5.2** Pricing tiers

  ```
  Free:       50 tickets/month, 1 agent, basic classification, no auto-response
  Starter:    500 tickets/month, 3 agents, full pipeline, email support — $29/mo
  Pro:        5,000 tickets/month, 10 agents, priority support, API access — $99/mo
  Enterprise: Unlimited, custom SLAs, SSO, dedicated support — Custom pricing
  ```

- [ ] **5.3** Usage metering
  - Track per-org: emails_processed, tickets_created, ai_calls_made, auto_responses_sent
  - Enforce limits based on plan tier
  - Show usage dashboard in settings

- [ ] **5.4** Billing UI
  - Pricing page (public, pre-login)
  - Plan selection + Stripe checkout redirect
  - Billing settings page (current plan, usage, invoices, payment method)
  - Plan upgrade/downgrade flow
  - Cancel subscription flow with feedback survey

- [ ] **5.5** Trial logic
  - 14-day free trial on Starter plan
  - Trial expiration warning emails (3 days, 1 day before)
  - Grace period: 3 days after trial ends before restricting access

### Files to Create

```
src/app/pricing/page.tsx                     → Public pricing page
src/app/(dashboard)/settings/billing/page.tsx → Billing management
src/app/api/billing/webhook/route.ts         → Stripe webhook handler
src/app/api/billing/checkout/route.ts        → Create Stripe checkout session
src/app/api/billing/portal/route.ts          → Stripe customer portal
src/lib/billing/stripe.ts                    → Stripe client and helpers
src/lib/billing/usage.ts                     → Usage tracking and limit enforcement
supabase/migrations/004_billing.sql          → Subscription and usage tables
```

### Dependencies to Install

```
stripe
```

---

## Phase 6: Launch Readiness

**Goal:** Everything a customer needs to trust and use the product is in place.

### Checklist

- [ ] **6.1** Landing page / Marketing site
  - Hero section with value proposition
  - Feature breakdown with screenshots
  - Pricing section
  - Social proof / testimonials (can be beta users)
  - CTA: "Start Free Trial"
  - Can be: separate Next.js app, same app with public routes, or even a simple Framer/Webflow site

- [ ] **6.2** Documentation
  - Getting started guide (account setup → connect email → first ticket)
  - API reference (all public endpoints)
  - FAQ/Knowledge base setup guide
  - SLA configuration guide
  - Troubleshooting page

- [ ] **6.3** Legal pages
  - Terms of Service
  - Privacy Policy (GDPR-compliant)
  - Data Processing Agreement (DPA) for enterprise
  - Cookie policy
  - Acceptable use policy

- [ ] **6.4** GDPR compliance
  - Data export endpoint (download all org data as JSON/CSV)
  - Account deletion flow (right to be forgotten)
  - Consent tracking for email processing
  - Data retention policy (auto-delete closed tickets after X months)

- [ ] **6.5** Deployment & infrastructure
  - Deploy on Vercel (or Railway/Fly.io)
  - Custom domain with SSL
  - CDN for static assets
  - Database backups configured (Supabase handles this, verify schedule)
  - Environment variable management (Vercel env vars or Doppler)

- [ ] **6.6** Email deliverability
  - Configure SPF record for sending domain
  - Configure DKIM signing
  - Configure DMARC policy
  - Warm up sending IP (if using dedicated IP)
  - Set up bounce handling

- [ ] **6.7** Analytics & feedback
  - Install PostHog or Mixpanel for product analytics
  - Track key events: signup, first_ticket, first_auto_response, plan_upgrade
  - In-app feedback widget (Canny, or custom)
  - NPS survey after 30 days of usage

- [ ] **6.8** Onboarding wizard
  - Step 1: Organization details (name, domain)
  - Step 2: Connect email (IMAP/SMTP credentials, test connection)
  - Step 3: Add first FAQ entries (or import from CSV)
  - Step 4: Invite team members
  - Step 5: Send test email to verify pipeline
  - Progress indicator, skip options, complete celebration

### Files to Create

```
src/app/(public)/page.tsx              → Landing page
src/app/(public)/pricing/page.tsx      → Public pricing page
src/app/(public)/docs/page.tsx         → Documentation hub
src/app/(public)/terms/page.tsx        → Terms of service
src/app/(public)/privacy/page.tsx      → Privacy policy
src/app/(dashboard)/onboarding/page.tsx → Setup wizard
src/app/api/export/route.ts            → GDPR data export
```

---

## Phase 7: Competitive Features (Post-Launch)

**Goal:** Features that differentiate from competitors and drive retention. Build based on actual customer feedback.

### Backlog (prioritize based on customer requests)

- [ ] **7.1** Customer self-service portal (submit tickets, view status, search FAQs)
- [ ] **7.2** Slack integration (ticket notifications, reply from Slack)
- [ ] **7.3** Microsoft Teams integration
- [ ] **7.4** CSAT surveys (auto-send after ticket resolution, track scores)
- [ ] **7.5** SLA breach notifications (email + in-app push)
- [ ] **7.6** CSV/PDF export for tickets and analytics
- [ ] **7.7** Agent performance dashboard (response time, resolution rate, CSAT)
- [ ] **7.8** Collision detection (lock ticket when agent is replying)
- [ ] **7.9** Public API with API keys for customer integrations
- [ ] **7.10** Webhook system (real-time events for ticket.created, ticket.resolved, etc.)
- [ ] **7.11** White-label / custom branding per organization
- [ ] **7.12** SSO / SAML integration for enterprise
- [ ] **7.13** Jira / Linear integration for engineering escalation
- [ ] **7.14** Custom fields on tickets (per-organization configurable)
- [ ] **7.15** Workflow automation (if severity=P1 AND category=Technical, assign to Team X)
- [ ] **7.16** Time tracking on tickets (for billing/reporting)
- [ ] **7.17** AI conversation summarization (for long email threads)
- [ ] **7.18** Multilingual support (translate tickets, respond in customer's language)
- [ ] **7.19** Scheduled reports (weekly digest email to managers)
- [ ] **7.20** Mobile app (React Native or PWA)

---

## Environment Variables Reference

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI / ML
GEMINI_API_KEY=your-gemini-api-key
GROQ_API_KEY=your-groq-api-key

# Vector Database
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_INDEX=intellidesk

# Email
IMAP_HOST=imap.gmail.com
IMAP_PORT=993
IMAP_USER=your-support-email@gmail.com
IMAP_PASSWORD=your-app-password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-support-email@gmail.com
SMTP_PASSWORD=your-app-password

# Polling
EMAIL_POLL_INTERVAL_MS=60000

# Future (Phase 1+)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=random-secret-key
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
SENTRY_DSN=https://...@sentry.io/...
REDIS_URL=redis://localhost:6379
```

---

## Key Metrics to Track

| Metric                         | Target       | Why                    |
| ------------------------------ | ------------ | ---------------------- |
| Email → Ticket conversion time | < 5 seconds  | Core value prop        |
| AI classification accuracy     | > 90%        | Trust in automation    |
| Auto-response accuracy         | > 85% match  | Reduces agent workload |
| SLA compliance rate            | > 95%        | Customer retention     |
| System uptime                  | > 99.5%      | Enterprise requirement |
| P1 ticket first response       | < 60 minutes | SLA commitment         |
| Monthly churn rate             | < 5%         | Business health        |
| Trial → Paid conversion        | > 15%        | Revenue growth         |
