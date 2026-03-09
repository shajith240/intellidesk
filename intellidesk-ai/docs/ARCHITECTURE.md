# IntelliDesk AI — Architecture Reference

> Technical deep-dive into every module. Use this as a reference when implementing changes.

---

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         ENTRY POINTS                                 │
│                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐   │
│  │  IMAP Poll   │  │  POST /api/  │  │  POST /api/emails/bulk  │   │
│  │  (60s auto)  │  │ emails/ingest│  │  (batch, max 50)        │   │
│  └──────┬───────┘  └──────┬───────┘  └────────────┬─────────────┘   │
│         └──────────────────┼──────────────────────┘                   │
│                            ▼                                          │
│              ┌─────────────────────────────┐                         │
│              │    processEmail() Pipeline  │                         │
│              │   src/lib/pipeline/processor│                         │
│              └─────────────┬───────────────┘                         │
│                            │                                          │
│  ┌─────────────────────────┼─────────────────────────┐               │
│  │                         │                         │               │
│  ▼                         ▼                         ▼               │
│ ┌──────────┐  ┌────────────────────┐  ┌──────────────────┐          │
│ │ Step 1-2 │  │    Step 3-4        │  │    Step 5        │          │
│ │ Clean +  │  │ Embed + Dedup      │  │ Thread Detect    │          │
│ │ Spam     │  │                    │  │                  │          │
│ │ (local)  │  │ Gemini Embedding   │  │ Headers → Refs   │          │
│ │          │  │ + Pinecone Query   │  │ → TKT-ID → Fuzzy │          │
│ └──────────┘  └────────────────────┘  └──────────────────┘          │
│                            │                                          │
│                            ▼                                          │
│  ┌─────────────────────────────────────────────────┐                 │
│  │              Step 6: AI Classification          │                 │
│  │         Groq LLaMA-3.3-70B-Versatile            │                 │
│  │  → category, severity, sentiment, language,      │                 │
│  │    confidence, entities, tags, review flag       │                 │
│  └─────────────────────────┬───────────────────────┘                 │
│                            │                                          │
│                            ▼                                          │
│  ┌─────────────────────────────────────────────────┐                 │
│  │         Step 7: Customer Identification         │                 │
│  │  Email match → Domain match → New Lead          │                 │
│  └─────────────────────────┬───────────────────────┘                 │
│                            │                                          │
│              ┌─────────────┼─────────────┐                           │
│              ▼             ▼             ▼                           │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐                │
│  │  Step 8-9    │ │  Step 10     │ │  Step 11     │                │
│  │ Save Email   │ │ Create/Update│ │ Auto-Response│                │
│  │ + Vector     │ │ Ticket       │ │ (P3/P4 only) │                │
│  │              │ │              │ │              │                │
│  │ Supabase +   │ │ Supabase     │ │ Pinecone FAQ │                │
│  │ Pinecone     │ │              │ │ + Gemini Gen │                │
│  └──────────────┘ └──────────────┘ └──────────────┘                │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                     EXTERNAL SERVICES                                │
│                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │
│  │   Supabase   │  │   Pinecone   │  │    Groq      │               │
│  │  PostgreSQL   │  │  Vector DB   │  │  LLaMA 3.3  │               │
│  │  11 tables    │  │  3 namespaces│  │  70B         │               │
│  │  + triggers   │  │  emails/faqs/│  │  classify    │               │
│  │              │  │  tickets     │  │              │               │
│  └──────────────┘  └──────────────┘  └──────────────┘               │
│                                                                       │
│  ┌──────────────┐  ┌──────────────┐                                  │
│  │ Google Gemini│  │  Gmail IMAP  │                                  │
│  │ Embeddings + │  │  + SMTP      │                                  │
│  │ Response Gen │  │  (polling +  │                                  │
│  │              │  │   sending)   │                                  │
│  └──────────────┘  └──────────────┘                                  │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Module Reference

### 1. Pipeline — `src/lib/pipeline/`

#### `processor.ts` — Main Pipeline Orchestrator

```typescript
processEmail(rawEmail: RawEmail): Promise<PipelineResult>
```

Orchestrates all 11 steps sequentially. Returns a `PipelineResult` containing:

- `email_id`, `ticket_id`, `ticket_number`
- `status`: "created" | "updated" | "duplicate" | "spam"
- Full results from: classification, thread detection, deduplication, customer ID, auto-response
- `processing_time_ms`: Total pipeline duration

**Error behavior:** Each step has try/catch. If classification fails, falls back to safe defaults (P3, General Inquiry). If auto-response fails, ticket is still created but without response.

#### `deduplicator.ts` — Duplicate Detection

```typescript
checkDuplicate(
  messageId: string | null,
  fromAddress: string,
  embedding: number[],
  receivedAt: Date
): Promise<DeduplicationResult>
```

**Tier 1 — Exact Match:**

- Queries `emails` table for matching `message_id`
- Returns score 1.0, method "message_id"

**Tier 2 — Semantic Match:**

- Queries Pinecone "emails" namespace with `from_address` filter
- Threshold: `DEDUP_SIMILARITY_THRESHOLD = 0.85`
- Time window: `DEDUP_TIME_WINDOW_HOURS = 72`
- Returns similarity score, method "semantic"

#### `customer-identifier.ts` — Customer Identification

```typescript
identifyCustomer(
  fromAddress: string,
  fromName: string | null,
  bodyText: string
): Promise<CustomerIdentificationResult>
```

**Tier 1 — Email Match:** Exact lookup in `contacts` table by email

**Tier 2 — Domain Match:** Extract domain from email, match to `accounts.domain`, create new contact under that account

**Tier 3 — New Lead:** Create new `account` (tier: Bronze) + `contact`, extract signature data (name, role, company, phone) from email body

#### `sla-tracker.ts` — SLA Management

```typescript
getSLAMetrics(): Promise<SLAMetrics>
calculateSLADue(severity: Severity): Promise<{ firstResponseDue: Date, resolutionDue: Date }>
getSLAAlerts(): Promise<SLAAlert[]>
```

**Alert threshold:** Triggers when ticket is within 25% of its SLA deadline or already breached.

**SLA policies (from database):**
| Severity | First Response | Resolution |
|----------|---------------|------------|
| P1 | 60 min | 240 min (4h) |
| P2 | 240 min | 480 min (8h) |
| P3 | 1440 min (24h) | 4320 min (3d) |
| P4 | 4320 min (3d) | 10080 min (7d) |

---

### 2. AI Layer — `src/lib/ai/` + `src/lib/gemini/`

#### `groq-client.ts` — Classification Engine

```typescript
classifyEmail(
  subject: string,
  body: string,
  fromAddress: string,
  fromName: string | null
): Promise<ClassificationResult>
```

**Model:** `llama-3.3-70b-versatile` via Groq API
**Temperature:** 0.3 (low randomness for consistent classification)

**Output fields:**

- `is_spam` (boolean), `spam_reason` (string)
- `category` (9 enum values), `subcategory` (free text)
- `severity` (P1-P4), `severity_signals` (string[])
- `language` (english/hindi/mixed/other), `sentiment` (positive/neutral/negative/angry)
- `confidence` (0-1), `category_confidence` (0-1), `severity_confidence` (0-1)
- `summary` (string), `key_entities` (string[]), `suggested_tags` (string[])
- `requires_human_review` (boolean), `reasoning` (string)
- `escalation_recommended` (boolean), `escalation_reason` (string)

**Validation:** Output is JSON-parsed and validated against known enums. Invalid categories/severities fall back to "General Inquiry" / "P3".

#### `embeddings.ts` — Vector Generation

```typescript
generateEmbedding(text: string): Promise<number[]>
generateEmbeddings(texts: string[]): Promise<number[][]>
```

**Model:** `gemini-embedding-001` via Google Generative AI v1beta API
**Text limit:** 5000 characters (truncated if longer)
**Used by:** Deduplicator, thread detector, FAQ matching, search API, FAQ CRUD

#### `respond.ts` — Auto-Response Generator

```typescript
generateAutoResponse(
  emailSubject: string,
  emailBody: string,
  category: string,
  severity: Severity,
  customerName: string | undefined,
  accountTier: string | null | undefined
): Promise<AutoResponseResult>
```

**Logic:**

1. If severity is P1 or P2 → skip (always needs human)
2. Generate embedding for the email
3. Query Pinecone "faqs" namespace for top 5 matches
4. If best match ≥ 0.9 → "perfect" match → auto-send eligible
5. If best match ≥ 0.7 → "partial" match → suggest to agent
6. If best match < 0.7 → "none" → no response
7. Call Gemini to generate personalized response using FAQ context + customer name + tier

#### `classify.ts` — Classification Prompt

Contains the full prompt template for Groq classification. The prompt specifies:

- 9 valid categories with descriptions
- P1-P4 severity definitions
- Output JSON schema
- Instructions for spam detection, language detection, sentiment analysis

#### `client.ts` — Gemini Client

```typescript
getModel(modelName?: string): GenerativeModel
```

Default model: `gemini-2.5-flash`. Used for auto-response text generation.

---

### 3. Email Layer — `src/lib/email/`

#### `imap.ts` — IMAP Polling

```typescript
pollNewEmails(): Promise<RawEmail[]>
```

**Config:** Gmail IMAP (imap.gmail.com:993, secure: true)
**Behavior:**

- Fetches UNSEEN emails from last 2 days
- Marks processed emails as \Seen
- Tracks processed UIDs in-memory Set (`processedUIDs`)
- Socket timeout: 60s, greeting timeout: 30s
- **Known issue:** `rejectUnauthorized: false` (TLS verification disabled)
- **Known issue:** In-memory UID set lost on restart

#### `smtp.ts` — Email Sending

```typescript
sendEmail(options: { to, subject, text, html?, inReplyTo?, references? }): Promise<boolean>
buildAutoResponseEmail(customerName, ticketNumber, slaTime, responseBody, originalSubject): { subject, text, html }
```

**Config:** Gmail SMTP (smtp.gmail.com:587, TLS)
**From header:** `"IntelliDesk AI Support" <SMTP_USER>`
**Returns:** `false` if credentials missing or send fails (no exception thrown)

#### `parser.ts` — Email Body Processing

```typescript
cleanEmailBody(text: string, html?: string): string
extractSignature(text: string): ExtractedSignature
isLikelySpam(subject: string, body: string, from: string): boolean
detectLanguage(text: string): "english" | "hindi" | "mixed" | "other"
extractTicketReferences(text: string): string[]
```

**Spam patterns:** ~30 hardcoded patterns (click unsubscribe, limited offer, Nigerian prince, etc.)
**Signature extraction:** Regex-based, extracts name, role, company, phone, email
**Language detection:** Checks for Devanagari Unicode range (Hindi detection)

#### `thread-detector.ts` — Thread Detection

```typescript
detectThread(
  messageId, inReplyTo, references, fromAddress, subject, bodyText, receivedAt
): Promise<ThreadDetectionResult>
```

**4-tier priority system** (see Pipeline section above for details)

---

### 4. Storage Layer

#### `src/lib/supabase/server.ts` — Database Client

```typescript
getSupabaseAdmin(): SupabaseClient  // Service role key (full access)
```

Uses Proxy pattern for lazy initialization (creates client on first use).

#### `src/lib/supabase/client.ts` — Browser Client

```typescript
export const supabase = createClient(url, anonKey); // Anon key (limited access)
```

#### `src/lib/pinecone/client.ts` — Vector Database

```typescript
getPinecone(): Pinecone                    // Singleton client
getIndex(): Index                          // Default index ("intellidesk")
upsertVectors(namespace, vectors): void    // Store embeddings with metadata
queryVectors(namespace, vector, topK?, filter?): QueryResponse  // Semantic search
```

**Default topK:** 5
**Always includes metadata in results**

---

### 5. Frontend Layer

#### Page Routing

| Route             | Component     | Data Source                                        |
| ----------------- | ------------- | -------------------------------------------------- |
| `/`               | Dashboard     | `GET /api/dashboard` (30s poll)                    |
| `/emails`         | Email Queue   | `POST /api/emails/poll`, `POST /api/emails/ingest` |
| `/tickets`        | Ticket List   | `GET /api/tickets` (filters + pagination)          |
| `/tickets/[id]`   | Ticket Detail | `GET /api/tickets/[id]`                            |
| `/knowledge-base` | FAQ Manager   | `GET/POST /api/faqs`, `PUT/DELETE /api/faqs/[id]`  |
| `/search`         | Global Search | `GET /api/search`                                  |
| `/settings`       | Settings      | Direct service health checks                       |

#### Component Architecture

- **Layout:** `src/app/(dashboard)/layout.tsx` wraps all dashboard pages with sidebar
- **Sidebar:** `src/components/sidebar.tsx` — collapsible, animated, dark mode toggle
- **Animations:** `src/components/motion.tsx` — fadeInUp, scaleIn, staggerList, AnimatedNumber, PulseDot, Shimmer
- **Theme:** `src/styles/theme.css` — OKLCH color system, 40+ CSS variables, light/dark
- **UI Kit:** 19 shadcn components in `src/components/ui/`
- **Toasts:** Sonner for all user notifications

#### Data Fetching Pattern

All pages use client-side `fetch()` with `useEffect()` + `useState()`. No server components for data fetching currently (all pages are `"use client"`).

```typescript
// Typical pattern in all pages:
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
	fetchData();
}, []);

async function fetchData() {
	const res = await fetch("/api/endpoint");
	const json = await res.json();
	setData(json.data);
	setLoading(false);
}
```

---

## Data Flow Examples

### Email Ingestion Flow

```
Customer sends email to support@company.com
    → Gmail receives email
    → IMAP poll (every 60s) fetches email via imapflow
    → processEmail() runs 11-step pipeline
    → Email stored in Supabase `emails` table
    → Embedding stored in Pinecone `emails` namespace
    → Ticket created in Supabase `tickets` table
    → If P3/P4 + FAQ match ≥ 90%: auto-response sent via SMTP
    → Audit log entry created
```

### Search Flow

```
Agent types query in search page
    → GET /api/search?q=query&type=tickets
    → Embedding generated for query text (Gemini)
    → Pinecone queried in relevant namespace(s)
    → Matching IDs used to fetch full records from Supabase
    → Results returned with relevance scores
```

### Auto-Response Flow

```
Pipeline reaches Step 11 (auto-response)
    → Check: severity must be P3 or P4 (never auto-respond P1/P2)
    → Generate email embedding
    → Query Pinecone "faqs" namespace for similar FAQs
    → If top match ≥ 90%: "perfect" match
        → Gemini generates personalized response
        → Response stored in auto_responses table with sent=false
        → For P3/P4 perfect matches: auto-send via SMTP, set sent=true
    → If top match 70-89%: "partial" match
        → Response drafted but NOT sent
        → Agent reviews and decides
    → If top match < 70%: no response generated
```

---

## Migration History

| File                              | Purpose                                                  |
| --------------------------------- | -------------------------------------------------------- |
| `001_initial_schema.sql`          | Full schema: 11 tables, indexes, triggers, SLA seed data |
| (planned) `002_auth.sql`          | Users + organizations tables (Phase 1)                   |
| (planned) `003_multi_tenancy.sql` | Add organization_id + RLS policies (Phase 2)             |
| (planned) `004_billing.sql`       | Subscriptions + usage tracking (Phase 5)                 |

---

## Performance Characteristics

| Operation                     | Duration   | Bottleneck         |
| ----------------------------- | ---------- | ------------------ |
| Email classification (Groq)   | ~1-2s      | API latency        |
| Embedding generation (Gemini) | ~0.5-1s    | API latency        |
| Pinecone query                | ~100-200ms | Network            |
| Supabase query                | ~50-100ms  | Network            |
| Full pipeline per email       | ~5-8s      | Sum of API calls   |
| IMAP poll (fetch emails)      | ~2-5s      | Connection + fetch |
| Auto-response generation      | ~1-2s      | Gemini API         |

**Throughput limit:** ~15 emails/minute (due to 4s rate limit between emails for Groq free tier)
