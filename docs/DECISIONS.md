# Decisions
**Project:** ISO Admin Tool
**Version:** 1.0 — Sprint 0
**Last updated:** 2026-04-17

ADR log — the *why* behind every significant choice. Versions and constraints live in `docs/TECH_STACK.md`; this document captures reasoning only.

---

## DEC-001 — Next.js App Router as the Application Framework

| Field | Content |
|-------|---------|
| **ID** | DEC-001 |
| **Status** | decided |
| **Context** | The tool is a multi-tenant SaaS with authenticated routes, server-side data access, and future AI integration. A framework choice determines routing, rendering model, and deployment target. |
| **Decision** | Next.js with App Router. |
| **Rationale** | App Router enables Server Components by default — most views are read-heavy and benefit from server rendering without shipping JS. Server Actions remove the need for a separate API layer for mutations. Vercel deployment is native and zero-config. The framework is well-supported by the Anthropic SDK and Supabase's Next.js helpers, both of which are needed for this project. |
| **Alternatives Rejected** | Remix: good routing model but smaller ecosystem for the specific integrations needed (Supabase SSR, shadcn). SvelteKit: Thomas has no existing context in Svelte; learning curve adds risk. Plain React SPA: would require a separate API server, adding deployment complexity and eliminating Server Component benefits. |

---

## DEC-002 — Supabase as the Database and Auth Provider

| Field | Content |
|-------|---------|
| **ID** | DEC-002 |
| **Status** | decided |
| **Context** | The tool needs a PostgreSQL database with row-level security, a managed auth service, and EU data residency. It must be operable via CLI and MCP tooling (REQ-013). |
| **Decision** | Supabase hosted in Stockholm (eu-north-1). |
| **Rationale** | Supabase provides PostgreSQL with native RLS — the simplest path to tenant isolation without a separate isolation service. The Auth module integrates with Next.js via `@supabase/ssr` without custom session handling. Stockholm region satisfies GDPR data residency non-negotiable. Supabase MCP and CLI satisfy REQ-013's agent-friendly operation requirement. The instance is already provisioned. |
| **Alternatives Rejected** | PlanetScale: MySQL, no native RLS — would require application-level isolation logic (more attack surface, more code). Neon: strong PostgreSQL option but no built-in auth; would require a separate auth service. Self-hosted PostgreSQL: operational overhead Thomas does not want; no managed auth. |

---

## DEC-003 — Prisma as the ORM

| Field | Content |
|-------|---------|
| **ID** | DEC-003 |
| **Status** | decided |
| **Context** | The project needs a typed data access layer over PostgreSQL. Schema management must be agent-friendly and version-controlled. |
| **Decision** | Prisma, schema-first, with migrations applied via Supabase MCP + CLI. |
| **Rationale** | Prisma's schema file is the single source of truth for the data model — it generates TypeScript types, migration SQL, and the client. Schema-first means agents can propose changes as schema diffs rather than raw SQL, which is safer and reviewable. The generated types integrate cleanly with TypeScript strict mode. |
| **Alternatives Rejected** | Drizzle: type-safe and lighter, but schema-first workflow is less mature; the Supabase migration integration is less documented. Raw Supabase client with generated types: loses the schema-first migration discipline — two sources of truth (Supabase dashboard and code) diverge under agent operation. Kysely: excellent query builder but no schema-first migration layer. |

---

## DEC-004 — Tenant Isolation via RLS on tenant_id

| Field | Content |
|-------|---------|
| **ID** | DEC-004 |
| **Status** | decided |
| **Context** | REQ-001 mandates that no tenant can access another tenant's data. Multiple implementation patterns exist: separate schemas, separate databases, or row-level policies within a shared schema. |
| **Decision** | Single shared schema. All tenant-scoped tables carry a `tenant_id` foreign key. Supabase RLS policies enforce isolation at the database level using `auth.uid()` → `users.tenant_id` lookup. |
| **Rationale** | A single schema with RLS is operationally simpler than schema-per-tenant (no dynamic schema switching, no migration fan-out) and cheaper than database-per-tenant. Supabase RLS runs in the database engine — bypassing it requires the service role key, which is server-only. This gives strong isolation guarantees without application-layer enforcement that could be bypassed by a code bug. |
| **Alternatives Rejected** | Schema-per-tenant: migration complexity grows with tenant count; Prisma does not natively support dynamic schema switching. Database-per-tenant: cost and operational overhead are not justified for Thomas's client scale. Application-layer filtering only: no database-level guarantee; a single missing `WHERE tenant_id = ?` clause would be a data breach. |

---

## DEC-005 — Consultant Access via Service Role Key (Server-Side Only)

| Field | Content |
|-------|---------|
| **ID** | DEC-005 |
| **Status** | decided |
| **Context** | REQ-011 requires Thomas to operate inside any tenant without a per-tenant login. RLS policies enforce tenant isolation for all normal users. A mechanism is needed that legitimately crosses tenant boundaries. |
| **Decision** | Consultant super-admin operations use the Supabase service role key, held server-side in a Next.js Server Action. The client never receives the service role key. All impersonation actions are written to the audit log before the operation executes. |
| **Rationale** | The service role key bypasses RLS — this is the correct mechanism for a trusted server-side actor. Confining it to Server Actions means it never reaches the browser. Pre-operation audit logging ensures the bypass is always recorded, even if the subsequent action fails. |
| **Alternatives Rejected** | Per-tenant admin account for Thomas: requires credential management per client, does not scale. JWT claim manipulation to fake a different tenant_id: fragile and a security anti-pattern. Separate "consultant" RLS policy that matches on a role: would require every RLS policy on every table to include a consultant bypass clause — error-prone and easy to miss on new tables. |

---

## DEC-006 — Vertical Slice / Multi-Pass Build Pattern

| Field | Content |
|-------|---------|
| **ID** | DEC-006 |
| **Status** | decided |
| **Context** | This is Thomas's first time building a SaaS product with agent-assisted development. The build pattern determines how sprints are structured and how quality is maintained. |
| **Decision** | Each sprint delivers a complete vertical slice — schema + API + UI + tests for a narrow feature — rather than horizontal layers (all schemas first, then all APIs, then all UIs). |
| **Rationale** | A vertical slice is demoable and shippable at the end of every sprint. Horizontal layers produce a half-built system for most of the project. With agent-assisted development, each sprint is a focused delegation — a vertical slice gives the agent a clear definition of done. Quality gates catch debt before it compounds across slices. |
| **Alternatives Rejected** | Horizontal layers (schema sprint, API sprint, UI sprint): the product is non-functional until the final layer — debt accumulates invisibly across the entire stack. |

---

## DEC-007 — StorageProvider Interface for Document Linking

| Field | Content |
|-------|---------|
| **ID** | DEC-007 |
| **Status** | decided |
| **Context** | REQ-006 requires document linking. V1 uses local file paths; V3 targets SharePoint. The implementation must not require structural changes when the storage backend changes. |
| **Decision** | A `StorageProvider` TypeScript interface with `listFiles`, `getFile`, `uploadFile`, and `getDownloadUrl` methods. V1 ships a `LocalFileSystemProvider`. SharePoint and Google Drive are future adapters injected at a single point. |
| **Rationale** | The ports-and-adapters pattern (one interface, multiple implementations) is the minimal design that satisfies the V1 requirement while keeping V3 a drop-in swap. Defining the interface in Sprint 6 forces the correct abstraction before any adapter-specific code accumulates. |
| **Alternatives Rejected** | Direct SharePoint API calls in V1: couples the product to a service that is out of scope and not available for the first client. Hard-coded file system calls with a migration later: technical debt that is expensive to untangle once multiple modules reference the storage layer directly. |

---

## DEC-008 — AI API Key: Platform-Level V1, Per-Tenant V2

| Field | Content |
|-------|---------|
| **ID** | DEC-008 |
| **Status** | decided |
| **Context** | REQ-009 specifies AI contextual assistance. A key management model must be chosen: Thomas pays for all usage (platform key) or each tenant supplies their own key. |
| **Decision** | V1 uses a single `ANTHROPIC_API_KEY` environment variable (Thomas's account). Per-tenant key management (clients supply their own key, stored encrypted per tenant) is deferred to V2. |
| **Rationale** | V1 AI features are for demo and early client use. The cost and complexity of per-tenant key management is not justified until the client base grows. Platform key keeps V1 simple. The AI call layer is architected as a named module so V2 can add per-tenant key resolution without changing callers. |
| **Alternatives Rejected** | Per-tenant keys from day one: requires encrypted key storage, key rotation UI, and per-tenant billing attribution — all V2 scope. No AI at all in V1: REQ-009 is a key selling point; the architecture must accommodate it even if features activate in V2. |

---

## DEC-009 — pnpm as the Package Manager

| Field | Content |
|-------|---------|
| **ID** | DEC-009 |
| **Status** | decided |
| **Context** | A package manager must be chosen and enforced consistently across local dev, CI, and agent-driven installs. |
| **Decision** | pnpm. |
| **Rationale** | Thomas's stated preference. pnpm's content-addressable store reduces disk usage and install time. Strict dependency resolution prevents phantom dependency bugs. The lockfile format (`pnpm-lock.yaml`) is unambiguous and does not conflict with npm or yarn lockfiles if only pnpm is used. |
| **Alternatives Rejected** | npm: Thomas's preference is pnpm. yarn: adds a second lockfile format with no benefit over pnpm for this project. bun: fast but less mature ecosystem compatibility for the specific tooling in use (Prisma, Supabase CLI integration). |

---

## DEC-010 — PDCA + Årshjul as Primary UX Frame (not ISO Clause Numbers)

| Field | Content |
|-------|---------|
| **ID** | DEC-010 |
| **Status** | decided |
| **Context** | REQ-012 specifies that navigation and IA are organized around PDCA and the yearly cycle, not ISO clause numbers. This is a product positioning decision as much as a UX decision. |
| **Decision** | Primary navigation uses PDCA phases and Swedish module names. ISO clause numbers appear only in forms and document references where the standard explicitly requires them. |
| **Rationale** | Thomas's positioning is "agile management tool." Clause-number navigation signals "compliance software" — a less appealing frame for SMB clients. PDCA is familiar to any operational manager even without ISO knowledge. Swedish module names reflect the language clients will use in their daily work. |
| **Alternatives Rejected** | ISO clause numbers as primary navigation: technically correct but creates a barrier for non-ISO-trained workers; conflicts with the product's agile positioning. Generic task-management labels (Backlog, In Progress, etc.): loses the ISO frame entirely — the product would be indistinguishable from Asana. |
