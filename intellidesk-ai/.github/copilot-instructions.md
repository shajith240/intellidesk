# IntelliDesk AI — Copilot Instructions

> **Read this file completely before writing any code.**
> This document provides full project context so you can implement changes accurately without re-explanation.

---

## What This Project Is

IntelliDesk AI is an **AI-powered B2B helpdesk platform**. It ingests customer emails via IMAP or REST API, classifies them using LLMs, detects duplicates and threads, identifies customers, creates tickets with SLA tracking, and generates auto-responses from a semantic knowledge base — all in a single automated pipeline.

**Target users:** Enterprise support teams who want AI-automated email triage and response.

---

## Tech Stack

| Layer          | Technology                           | Version              |
| -------------- | ------------------------------------ | -------------------- |
| Framework      | Next.js (App Router)                 | 16.1.6               |
| Language       | TypeScript                           | 5.x                  |
| UI             | React + shadcn/ui + Tailwind CSS 4   | React 19.2.3         |
| Animations     | Framer Motion                        | 12.35.1              |
| Database       | Supabase (PostgreSQL)                | supabase-js 2.98.0   |
| Vector DB      | Pinecone                             | 7.1.0                |
| Classification | Groq (LLaMA-3.3-70B-Versatile)       | groq-sdk 0.37.0      |
| Embeddings     | Google Gemini (gemini-embedding-001) | generative-ai 0.24.1 |
| Response Gen   | Google Gemini (gemini-2.5-flash)     | same package         |
| Email (In)     | IMAP via imapflow                    | 1.2.12               |
| Email (Out)    | SMTP via nodemailer                  | 8.0.1                |
| Email Parse    | mailparser                           | 3.9.3                |
| Fuzzy Search   | Fuse.js                              | 7.1.0                |
| Validation     | Zod                                  | 4.3.6                |

---

## Project Structure

```
intellidesk-ai/
├── src/
│   ├── app/
│   │   ├── globals.css                    # Tailwind imports + custom styles
│   │   ├── layout.tsx                     # Root layout (fonts, theme, toasts)
│   │   ├── (dashboard)/                   # All authenticated dashboard pages
│   │   │   ├── layout.tsx                 # Dashboard shell (sidebar + main area)
│   │   │   ├── page.tsx                   # Dashboard home (stats, SLA, charts)
│   │   │   ├── emails/page.tsx            # Email queue + IMAP polling + manual ingest
│   │   │   ├── knowledge-base/page.tsx    # FAQ CRUD with embeddings
│   │   │   ├── search/page.tsx            # Semantic search across all data
│   │   │   ├── settings/page.tsx          # Service connection status (read-only)
│   │   │   └── tickets/
│   │   │       ├── page.tsx               # Ticket list with filters + pagination
│   │   │       └── [id]/page.tsx          # Ticket detail, email thread, SLA, responses
│   │   └── api/                           # All REST API routes
│   │       ├── cleanup/route.ts           # DELETE: Wipe all data (dev only!)
│   │       ├── customers/route.ts         # GET: List accounts with pagination
│   │       ├── dashboard/route.ts         # GET: Aggregated stats + SLA metrics
│   │       ├── emails/
│   │       │   ├── bulk/route.ts          # POST: Batch ingest (max 50)
│   │       │   ├── ingest/route.ts        # POST: Single email ingest
│   │       │   ├── poll/route.ts          # POST: Trigger IMAP poll
│   │       │   └── process-queue/route.ts # POST: Process unprocessed DB emails
│   │       ├── faqs/
│   │       │   ├── route.ts               # GET/POST: List + create FAQs
│   │       │   └── [id]/route.ts          # PUT/DELETE: Update + delete FAQ
│   │       ├── migrate/route.ts           # POST: Add ai_classification column
│   │       ├── respond/route.ts           # POST: Send auto-response email
│   │       ├── search/route.ts            # GET: Semantic search via Pinecone
│   │       ├── seed/
│   │       │   ├── route.ts               # POST: Seed test accounts/contacts
│   │       │   └── test-emails/route.ts   # POST: Seed test emails
│   │       └── tickets/
│   │           ├── route.ts               # GET: List tickets with filters
│   │           └── [id]/route.ts          # GET/PATCH: Ticket detail + update
│   ├── components/
│   │   ├── motion.tsx                     # Reusable animation components
│   │   ├── sidebar.tsx                    # Collapsible navigation sidebar
│   │   ├── theme-provider.tsx             # next-themes dark/light mode
│   │   └── ui/                            # 19 shadcn components
│   ├── lib/
│   │   ├── utils.ts                       # cn() helper (clsx + tailwind-merge)
│   │   ├── ai/
│   │   │   └── groq-client.ts             # Groq SDK client + classifyEmail()
│   │   ├── email/
│   │   │   ├── imap.ts                    # IMAP connection + pollNewEmails()
│   │   │   ├── parser.ts                  # Email body cleaning, signature extraction, spam detection
│   │   │   ├── smtp.ts                    # SMTP sending + auto-response email builder
│   │   │   └── thread-detector.ts         # 4-tier thread detection
│   │   ├── gemini/
│   │   │   ├── classify.ts                # AI classification prompt + validation
│   │   │   ├── client.ts                  # Google Generative AI client setup
│   │   │   ├── embeddings.ts              # Embedding generation (gemini-embedding-001)
│   │   │   └── respond.ts                 # Auto-response with FAQ matching
│   │   ├── pinecone/
│   │   │   └── client.ts                  # Pinecone client, upsert/query helpers
│   │   ├── pipeline/
│   │   │   ├── customer-identifier.ts     # 3-tier customer identification
│   │   │   ├── deduplicator.ts            # 2-tier dedup (exact + semantic)
│   │   │   ├── processor.ts              # Main 11-step email pipeline
│   │   │   └── sla-tracker.ts             # SLA calculation + breach detection
│   │   └── supabase/
│   │       ├── client.ts                  # Browser Supabase client (anon key)
│   │       └── server.ts                  # Server Supabase client (service role)
│   ├── styles/
│   │   └── theme.css                      # OKLCH color system, CSS variables
│   └── types/
│       └── index.ts                       # All TypeScript interfaces and type unions
└── supabase/
    └── migrations/
        └── 001_initial_schema.sql         # Full DB schema (11 tables + triggers)
```

---

## The Email Processing Pipeline (Core Logic)

This is the heart of the product. The main function is `processEmail()` in `src/lib/pipeline/processor.ts`.

**11-Step Flow:**

```
1. CLEAN BODY          → Strip HTML, quoted replies, disclaimers
2. LOCAL SPAM CHECK    → Pattern matching (~30 keywords), no API call
3. GENERATE EMBEDDING  → Gemini gemini-embedding-001, used for dedup + search
4. CHECK DUPLICATES    → Tier 1: Exact message_id match (score 1.0)
                         Tier 2: Semantic similarity via Pinecone (85% threshold, 72h window)
5. DETECT THREAD       → Tier 1: In-Reply-To header (confidence 1.0)
                         Tier 2: References header (confidence 0.95)
                         Tier 3: Ticket reference in text, e.g. TKT-00001 (confidence 0.95)
                         Tier 4: Fuzzy subject+sender match, 48h window, Fuse.js threshold 0.3
6. AI CLASSIFICATION   → Groq LLaMA-3.3-70B-Versatile, temperature 0.3
                         Returns: category (9 types), severity (P1-P4), sentiment, language,
                         confidence, summary, entities, tags, review flag
7. IDENTIFY CUSTOMER   → Tier 1: Exact email match in contacts table
                         Tier 2: Domain match → create contact under existing account
                         Tier 3: New lead → create Bronze account + contact from signature
8. SAVE EMAIL          → Store in Supabase with spam/language/processed flags
9. STORE VECTOR        → Upsert to Pinecone "emails" namespace with metadata
10. CREATE/UPDATE TKT  → New thread → new ticket with AI classification JSONB
                         Existing thread → add email, may upgrade severity
11. AUTO-RESPONSE      → Only for P3/P4 (never P1/P2)
                         Perfect match (≥90% FAQ similarity) → auto-send
                         Partial match (70-89%) → draft for agent review
                         Gemini generates personalized response with customer name + tier
```

**Rate Limiting:** 4s between emails (Groq 30 RPM free tier). This is manual delay, not a queue system.

---

## Database Schema

**11 Tables in Supabase PostgreSQL:**

| Table            | Purpose            | Key Columns                                                                                          |
| ---------------- | ------------------ | ---------------------------------------------------------------------------------------------------- |
| `accounts`       | Customer companies | domain (indexed), company_name, tier (Gold/Silver/Bronze)                                            |
| `contacts`       | People at accounts | email (unique, indexed), account_id FK, lead_status                                                  |
| `emails`         | Raw email data     | message_id (indexed), from_address (indexed), processed (indexed), is_spam                           |
| `tickets`        | Support tickets    | ticket_number (auto TKT-#####), status, severity, category, ai_classification (JSONB), SLA fields ×4 |
| `ticket_emails`  | Email↔Ticket link  | ticket_id FK, email_id FK, relationship (original/reply/forward/duplicate)                           |
| `faqs`           | Knowledge base     | question, answer, category, embedding_id, success_rate, times_used                                   |
| `auto_responses` | Generated replies  | ticket_id FK, match_type, match_score, sent flag, cited_faq_ids[]                                    |
| `sla_policies`   | SLA rules          | severity (unique), first_response_minutes, resolution_minutes                                        |
| `teams`          | Support teams      | name, category_routing[]                                                                             |
| `audit_logs`     | Activity trail     | ticket_id FK, action, details (JSONB), performed_by                                                  |

**Triggers:**

- `generate_ticket_number()` — auto-generates TKT-##### from sequence on insert
- `update_updated_at()` — updates timestamp on ticket row change

**SLA Defaults (seeded):**

- P1: 60min first response, 240min (4h) resolution
- P2: 240min first response, 480min (8h) resolution
- P3: 1440min (24h) first response, 4320min (3d) resolution
- P4: 4320min (3d) first response, 10080min (7d) resolution

**Current Limitations:**

- NO Row-Level Security (RLS) configured
- NO authentication — all access via service role key
- NO multi-tenancy — no organization_id column

---

## AI Models & Costs

| Model                   | Provider | Used For                              | Cost Per Call |
| ----------------------- | -------- | ------------------------------------- | ------------- |
| LLaMA-3.3-70B-Versatile | Groq     | Email classification                  | ~$0.0024      |
| gemini-embedding-001    | Google   | Embeddings (dedup, search, FAQ match) | ~$0.00002     |
| gemini-2.5-flash        | Google   | Auto-response generation              | ~$0.0005      |

**Total cost per ticket: ~$0.003**

---

## Pinecone Namespaces

| Namespace | Contains          | Metadata Fields                             |
| --------- | ----------------- | ------------------------------------------- |
| `emails`  | Email embeddings  | from_address, category, severity, timestamp |
| `faqs`    | FAQ embeddings    | category                                    |
| `tickets` | Ticket embeddings | category, severity, account_id, timestamp   |

**Index name:** `intellidesk` (configurable via `PINECONE_INDEX` env var)

---

## API Routes Reference

| Method | Route                       | Purpose                                                                |
| ------ | --------------------------- | ---------------------------------------------------------------------- |
| POST   | `/api/emails/ingest`        | Ingest single email                                                    |
| POST   | `/api/emails/poll`          | Trigger IMAP poll                                                      |
| POST   | `/api/emails/process-queue` | Process unprocessed emails (batch 50)                                  |
| POST   | `/api/emails/bulk`          | Batch ingest (max 50)                                                  |
| GET    | `/api/tickets`              | List tickets (filters: status, severity, category, search; pagination) |
| GET    | `/api/tickets/[id]`         | Ticket detail with emails, SLA, related tickets                        |
| PATCH  | `/api/tickets/[id]`         | Update ticket (whitelisted fields only)                                |
| GET    | `/api/search`               | Semantic search across tickets/emails/FAQs                             |
| GET    | `/api/faqs`                 | List FAQs with pagination                                              |
| POST   | `/api/faqs`                 | Create FAQ + generate embedding                                        |
| PUT    | `/api/faqs/[id]`            | Update FAQ + re-embed if changed                                       |
| DELETE | `/api/faqs/[id]`            | Delete FAQ                                                             |
| POST   | `/api/respond`              | Send auto-response email                                               |
| GET    | `/api/dashboard`            | Stats, SLA metrics, category/severity breakdown                        |
| GET    | `/api/customers`            | List accounts with pagination                                          |
| DELETE | `/api/cleanup`              | ⚠️ Wipe all data (should be dev-only)                                  |
| POST   | `/api/seed`                 | ⚠️ Insert test data (should be dev-only)                               |
| POST   | `/api/migrate`              | Add ai_classification JSONB column                                     |

---

## Type Definitions Summary

All types are in `src/types/index.ts`. Key enums:

```typescript
TicketStatus: "New" | "In Progress" | "Resolved" | "Closed";
Severity: "P1" | "P2" | "P3" | "P4";
EmailCategory: "Technical Support" |
	"Access Request" |
	"Billing/Invoice" |
	"Feature Request" |
	"Hardware/Infrastructure" |
	"How-To/Documentation" |
	"Data Request" |
	"Complaint/Escalation" |
	"General Inquiry";
AccountTier: "Gold" | "Silver" | "Bronze";
MatchType: "perfect" | "partial" | "none";
EmailRelationship: "original" | "reply" | "forward" | "duplicate";
```

---

## Key Thresholds & Constants

| Constant                     | Value                     | Location                           |
| ---------------------------- | ------------------------- | ---------------------------------- |
| Dedup similarity threshold   | 0.85 (85%)                | `src/lib/pipeline/deduplicator.ts` |
| Dedup time window            | 72 hours                  | `src/lib/pipeline/deduplicator.ts` |
| Thread fuzzy match threshold | 0.3 (Fuse.js)             | `src/lib/email/thread-detector.ts` |
| Thread fuzzy time window     | 48 hours                  | `src/lib/email/thread-detector.ts` |
| FAQ perfect match            | 0.9 (90%)                 | `src/lib/gemini/respond.ts`        |
| FAQ partial match            | 0.7 (70%)                 | `src/lib/gemini/respond.ts`        |
| Classification temperature   | 0.3                       | `src/lib/ai/groq-client.ts`        |
| Embedding text limit         | 5000 chars                | `src/lib/gemini/embeddings.ts`     |
| IMAP poll interval           | 60000ms (60s)             | `src/instrumentation.ts`           |
| Rate limit between emails    | 4000ms (4s)               | `src/instrumentation.ts`           |
| SLA alert threshold          | 25% of deadline remaining | `src/lib/pipeline/sla-tracker.ts`  |
| Max emails per batch         | 50                        | `src/app/api/emails/bulk/route.ts` |
| Max tickets per page         | 100                       | `src/app/api/tickets/route.ts`     |

---

## Current Product Roadmap

The full development plan with detailed checklists for each phase is in `docs/PROJECT_PLAN.md`.

**Phases:**

- **Phase 0:** Security fixes (credentials, env-gating, TLS)
- **Phase 1:** Authentication & Authorization (NextAuth.js, roles, middleware)
- **Phase 2:** Multi-tenancy (org_id isolation, RLS, per-org config)
- **Phase 3:** Complete core UX (ticket editing, response workflow, settings forms)
- **Phase 4:** Reliability (Sentry, Pino logging, BullMQ queue, retry logic)
- **Phase 5:** Billing (Stripe, pricing tiers, usage metering)
- **Phase 6:** Launch readiness (landing page, docs, legal, GDPR, onboarding)
- **Phase 7:** Competitive features (Slack, CSAT, export, API, webhooks)

**Always check `docs/PROJECT_PLAN.md` for the current status of each checklist item before starting work on any phase.**

---

## Coding Conventions

### General Rules

- **TypeScript strict mode** — no `any` types unless absolutely necessary
- **App Router** — all routes use Next.js App Router conventions (route.ts for API, page.tsx for pages)
- **Server Components by default** — only add `"use client"` when state/effects are needed
- **shadcn/ui** — use existing components from `src/components/ui/` before creating custom ones
- **Tailwind CSS 4** — utility-first, use CSS variables from `src/styles/theme.css`
- **Zod** — use for all input validation on API routes and forms
- **Error handling** — try/catch with structured error responses `{ error: string }` and appropriate HTTP status codes

### Naming Conventions

- Files: `kebab-case.ts` / `kebab-case.tsx`
- Components: `PascalCase`
- Functions: `camelCase`
- Types/Interfaces: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`
- Database columns: `snake_case`
- API responses: `snake_case` (matching database)

### API Route Pattern

```typescript
export async function GET(request: NextRequest) {
	try {
		// 1. Parse and validate input (query params or body)
		// 2. Auth check (once implemented)
		// 3. Database operation
		// 4. Return NextResponse.json({ data }) with appropriate status
	} catch (error) {
		console.error("Context about what failed:", error);
		return NextResponse.json(
			{ error: "Human-readable message" },
			{ status: 500 },
		);
	}
}
```

### Database Access

- **Server-side (API routes, server actions):** Use `getSupabaseAdmin()` from `src/lib/supabase/server.ts`
- **Client-side:** Use `supabase` from `src/lib/supabase/client.ts` (anon key)
- Always select specific columns rather than `SELECT *`
- Always add `.limit()` to queries that could return many rows

### UI Patterns

- Use components from `src/components/ui/` (shadcn)
- Use animation components from `src/components/motion.tsx`
- Toast notifications via `sonner`: `toast.success()`, `toast.error()`
- Dark mode is default, always ensure both themes work
- Severity colors: P1=red (#ef4444), P2=orange (#f97316), P3=yellow (#eab308), P4=blue (#3b82f6)
- Status colors: New=green, In Progress=primary, Resolved=muted, Closed=muted

---

## Environment Variables Required

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GEMINI_API_KEY=
GROQ_API_KEY=
PINECONE_API_KEY=
PINECONE_INDEX=intellidesk
IMAP_HOST=imap.gmail.com
IMAP_PORT=993
IMAP_USER=
IMAP_PASSWORD=
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
EMAIL_POLL_INTERVAL_MS=60000
```

---

## Known Issues & Technical Debt

1. **No authentication** — all routes are public (Phase 1 fixes this)
2. **No multi-tenancy** — single-tenant only (Phase 2 fixes this)
3. **No RLS** — Supabase Row-Level Security not configured
4. **IMAP TLS disabled** — `rejectUnauthorized: false` in imap.ts
5. **In-memory UID tracking** — `processedUIDs` Set lost on server restart
6. **Console.log everywhere** — no structured logging
7. **No retry logic** — if Groq or Gemini API fails, email processing fails permanently
8. **Synchronous processing** — no background queue, email processing blocks API
9. **Severity/category configs duplicated** — same objects copied across 5+ page files
10. **Settings page read-only** — shows connection status but can't configure anything
11. **Ticket edit dialog incomplete** — form renders but submit not fully wired
12. **SMTP failures silently swallowed** — `sendEmail()` returns false but caller may not check
