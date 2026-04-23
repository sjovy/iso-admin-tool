# Implementation Plan
**Project:** ISO Admin Tool
**Version Loop:** V1 — Foundation
**Date:** 2026-04-17
**Author:** Claude Code (planning sub-agent)

---

## Multi-Pass Architecture — How to Read This Plan

Thomas is using a **vertical slice / multi-pass** build pattern for the first time. This section explains the pattern before the plan begins.

**Each pass is a milestone.** A pass delivers a thin but complete vertical slice of the full system — from user input at the top, through business logic in the middle, to data at the bottom. No horizontal layers (e.g., "build all DB schemas first, then all APIs, then all UIs"). Instead: pick a narrow feature, deliver it end-to-end, ship it.

**Why vertical slices?**
- You get a working, demoable product at the end of every pass — not half a system
- Debt is caught at quality gates before it compounds
- The next pass is planned only after the previous one closes, using what was learned

**Milestone Horizon (Rolling Wave):**

| Horizon | Detail |
|---------|--------|
| V1 (this document) | Full sprint-by-sprint plan |
| V2 | Vision statement only — no sprint detail |
| V3 | Vision statement only — no sprint detail |
| Beyond V3 | Unknown — count and content not yet defined |

---

## Milestone Horizon

### V1 — Foundation (this version loop)
**Goal:** A working multi-tenant SaaS with ISO 9001 kanban boards, structured NCR forms, KPI register, document linking, RBAC, and audit trail. Thomas can demo it to a client. A client can manage their daily ISO work in it.

*(Full sprint detail below.)*

---

### V2 — Yearly Cycle & Intelligence (vision only)
**Goal:** The Årshjul becomes a proper calendar/timeline view with recurring tasks. Management Review module collects live inputs from all modules and records structured outputs. AI contextual assistance (Claude API) is activated — workers and managers can request AI help on any task or module. KPI trend charts and document review reminders ship. This pass makes the tool compelling enough to retain clients past initial setup.

*Sprint detail will be planned after V1 Version Gate closes.*

---

### V3 — Integrations & Scale (vision only)
**Goal:** Microsoft 365 / SharePoint integration via Graph API. SharePoint adapter replaces the local file-path store. Microsoft SSO added as an auth option alongside email/password. PDF export for management review reports and KPI reports. Consultant dashboard polished for multi-tenant sales and support workflows.

*Sprint detail will be planned after V2 Version Gate closes.*

---

### Beyond V3 — Unknown
Multi-standard expansion (ISO 14001, 27001, 45001), mobile-optimized views, and certification export packages are anticipated but not planned. Content and count of future milestones are defined only when the preceding milestone closes.

---

## Current Version Loop — V1 Sprints

> **Hard rule: no more than 3 consecutive feature sprints before a quality gate.**

---

### Sprint 1 — Tech Stack Scaffolding

**Type:** Scaffolding (mandatory first sprint)
**Goal:** Running skeleton — framework, auth, database, deployment pipeline, base routing. Nothing ships to users; everything builds.
**REQ scope:** REQ-010 (data residency), REQ-013 (agent-friendly operation), REQ-001 (multi-tenant structure established at schema level)

**Feature list:**

| Item | Complexity | Label |
|------|------------|-------|
| Next.js App Router project with TypeScript strict mode, Tailwind, shadcn/ui, pnpm | SIMPLE | AFK |
| Supabase project linked (Stockholm region confirmed), Prisma schema initialized, first migration applied | MEDIUM | HITL |
| Supabase Auth configured — email/password, session management, middleware route protection | MEDIUM | AFK |
| Tenant table + User table with role enum (worker / management / company_admin / consultant) | MEDIUM | AFK |
| RLS policies: users can only read/write rows matching their tenant_id; consultant role bypasses with service key | COMPLEX | AFK |
| Base routing: `/login`, `/dashboard`, `/[tenantSlug]/` shell, Consultant `/admin/` shell | SIMPLE | AFK |
| Vercel project created, GitHub repo linked, preview + production deployment pipeline working | MEDIUM | HITL |
| `.env.local` documented; `tsc --noEmit` and ESLint pass in CI | SIMPLE | AFK |
| Smoke test: create a tenant, create a user in that tenant, log in, see the dashboard shell, log out | SIMPLE | HITL |

**Domain hints:** Security-critical (RLS, auth middleware). Data residency must be verified in Supabase dashboard before any other sprint begins.

**Tracks:** None (single-track sequential — auth and DB must be established before routing can be wired)

**Entry criteria:** Sprint 0 complete (this plan approved by Thomas)

**Exit criteria:**
- App runs locally from a fresh clone with only the steps documented in README
- App deploys successfully to Vercel (preview and production)
- Auth flow works end-to-end: register, login, protected route, logout
- Tenant isolation confirmed: user in Tenant A cannot query Tenant B's rows (RLS test)
- `tsc --noEmit` passes, ESLint passes
- Supabase region confirmed as eu-north-1 (Stockholm)

**Quality gates:** `tsc --noEmit`, ESLint, manual smoke test (HITL)
**Token budget:** ~120K EST

---

### Sprint 3-patch — KPI Register Defect Fixes

**Type:** Feature (patch — correction sprint from Sprint 3 judge findings)
**Goal:** Fix security and exit-criteria failures identified by the Sprint 3 judge. Scope is limited to the three findings below — no additions.
**REQ scope:** REQ-002 (same as Sprint 3)

**Fix scope:**

| Fix | Source finding | Files |
|-----|---------------|-------|
| Add `appUser.tenantId === tenantId` guard to all 5 functions in `kpis.ts` | Finding 5 (security) | `src/app/actions/kpis.ts` |
| Add `ragOverride: RagStatus \| null` to `KpiRow`; propagate to register + detail pages; fix `RagBadge` `isOverride` prop; fix `RagOverrideControl` init | Findings 2+3 (exit criteria) | `src/types/kpi.ts`, `src/app/actions/kpis.ts`, `src/components/kpi/RagBadge.tsx`, `src/components/kpi/RagOverrideControl.tsx`, `src/components/kpi/KpiDetailClient.tsx`, `src/components/kpi/KpiRegisterTable.tsx` |
| Fix `KpiWithMeasurements` internal type: `isoCategory: IsoCategory`, `ragOverride: RagStatus \| null` (eliminates `as` casts) | Finding 8 (minor, same file area — bundle) | `src/app/actions/kpis.ts` |

**Tracks:** None (single file set)

**Entry criteria:** Sprint 3 closed

**Exit criteria:**
- `appUser.tenantId === tenantId` check present and tested in all `kpis.ts` functions
- `KpiRow.ragOverride` field present; `RagBadge` tooltip correctly shows "(manuellt)" vs "(beräknad)"; `RagOverrideControl` shows "Auto" when no override is set
- No `as IsoCategory` or `as RagStatus` casts in `mapKpiToRow`
- `tsc --noEmit`, ESLint, vitest pass (test count ≥ 105)

**Quality gates:** `tsc --noEmit`, ESLint, vitest
**Token budget:** ~40K EST

---

### Sprint 4 — Quality Gate (Sprints 2–3) — Review

**Type:** Review
**REQ scope:** None — validation only
**Validates:** Sprint 2 (kanban boards), Sprint 3 (KPI register)
**Domain:** Board RBAC, task CRUD, drag-and-drop stability, KPI register integrity, audit log completeness, RLS correctness across all new tables

**Token budget:** ~50K EST (automated gates) + manual session time
**Entry criteria:** Sprint 3 complete
**Exit criteria:** All test scenarios completed, findings documented, Clear sprint scope defined (or marked empty if nothing found)

---

### Sprint 5 — NCR Module and Traceability

**Type:** Feature
**Goal:** Structured NCR forms with enforced workflow (root cause required before CA creation; effectiveness review required before closure). Full traceability chain from NCR to Corrective Action.
**REQ scope:** REQ-007 (incident reporting), REQ-008 (corrective action traceability)

**Feature list:**

| Item | Complexity | Label |
|------|------------|-------|
| NCR and CorrectiveAction Prisma schema — all mandatory fields per ISO 8.7/10.2 | MEDIUM | AFK |
| NCR list page with status filter (open / in_progress / verified / closed) and classification badges | SIMPLE | AFK |
| NCR creation form — all required fields; root_cause blocks CA creation until filled | COMPLEX | AFK |
| Corrective action sub-form — spawned from NCR after root_cause is set; links NCR ↔ CA | MEDIUM | AFK |
| Effectiveness review step — required before NCR can be closed; enforced at API level | MEDIUM | AFK |
| Link KPI deviation to Corrective Action — complete the stub added in Sprint 3 | MEDIUM | AFK |
| Traceability panel on CA detail — shows source (NCR or KPI), source summary, full chain | MEDIUM | AFK |
| Audit log on all NCR and CA state transitions | SIMPLE | AFK |

**Domain hints:** Business-logic-heavy (workflow enforcement — cannot skip steps). Security-sensitive (only QM and Admin can close NCRs; Workers can only create). Correctness over performance.

**Tracks:**
- Prerequisites: Sprint 3 complete; KPI stub field in place
- Track 1 — NCR Schema & Workflow API: schema, RLS, server actions enforcing step gates
- Track 2 — NCR UI: forms, list, status badges, traceability panel (depends on Track 1 API contract)

**Entry criteria:** Sprint 4 Quality Gate — Verify complete (or Sprint 4 Review clean with no Clear needed)

**Exit criteria:**
- NCR cannot be closed without effectiveness review (tested at API level, not just UI)
- Corrective action cannot be created without root_cause set (tested at API level)
- Traceability: NCR detail shows linked CA; KPI detail shows linked CA
- `tsc --noEmit`, ESLint, vitest on workflow enforcement logic pass

**Quality gates:** `tsc --noEmit`, ESLint, vitest (workflow gate logic), manual NCR lifecycle test (HITL)
**Token budget:** ~150K EST

---

### Sprint 6 — Document Linking and Storage Adapter

**Type:** Feature
**Goal:** Tasks and boards link to documents. The StorageProvider interface is defined and the local file-path implementation ships. New tenants get a seeded folder structure.
**REQ scope:** REQ-006 (document linking), REQ-014 (standardized folder structure)

**Feature list:**

| Item | Complexity | Label |
|------|------------|-------|
| Document Prisma schema — all mandatory Clause 7.5 fields: title, version, author, review_date, approval_status, iso_clause_ref | MEDIUM | AFK |
| StorageProvider TypeScript interface — listFiles, getFile, uploadFile, getDownloadUrl | SIMPLE | AFK |
| LocalFileSystemProvider implementation (reads /storage/[tenantSlug]/ folder) | SIMPLE | AFK |
| Document library page — shows all tenant documents with version, review date, review due date, RAG status (overdue flag) | MEDIUM | AFK |
| Task → Document link UI — attach/remove documents on task detail panel; clicking opens URL in new tab | SIMPLE | AFK |
| Document review reminder — flag documents where review_due_date is past or within 30 days | SIMPLE | AFK |
| Seed standard folder structure and template document stubs on tenant creation | MEDIUM | AFK |

**Domain hints:** Interface-design-sensitive (StorageProvider must hide implementation details — the interface is the contract that future SharePoint/Google Drive adapters implement). Moderate UI complexity.

**Tracks:** None (single-track — StorageProvider interface is a prerequisite for all other items)

**Entry criteria:** Sprint 5 exit criteria met

**Exit criteria:**
- Tasks can be linked to documents; clicking the link opens the URL in a new tab
- Document library shows all tenant documents with review status indicators
- LocalFileSystemProvider works in dev; switching to a different provider requires changing one injection point
- `tsc --noEmit`, ESLint, vitest on StorageProvider contract pass

**Quality gates:** `tsc --noEmit`, ESLint, vitest on StorageProvider adapter interface
**Token budget:** ~100K EST

---

### Sprint 7 — Quality Gate (Sprints 5–6) — Review

**Type:** Review
**REQ scope:** None — validation only
**Validates:** Sprint 5 (NCR module, traceability), Sprint 6 (document linking, StorageProvider)
**Domain:** NCR workflow enforcement, traceability chain integrity, CA-KPI links, document library, StorageProvider abstraction, RBAC across new modules

**Token budget:** ~50K EST (automated gates) + manual session time
**Entry criteria:** Sprint 6 complete
**Exit criteria:** All test scenarios completed, findings documented, Clear sprint scope defined (or marked empty if nothing found)

---

### Sprint 8 — Consultant Super-Admin and Tenant Onboarding

**Type:** Feature
**Goal:** Thomas can log in once and operate across all tenants from a super-admin shell. New tenants can be provisioned with the standard ISO 9001 module set and seed data in one flow.
**REQ scope:** REQ-001 (multi-tenant isolation), REQ-011 (consultant super-admin), REQ-005 (RBAC — consultant tier)

**Feature list:**

| Item | Complexity | Label |
|------|------------|-------|
| Consultant dashboard — list all tenants with name, active users, last activity date | MEDIUM | AFK |
| Tenant switch — Consultant can enter any tenant and operate as Company Admin; impersonation logged in audit trail | COMPLEX | AFK |
| Tenant creation flow — name, slug, contact email; seeds 9 ISO 9001 modules + sample tasks + sample KPIs + folder structure | MEDIUM | AFK |
| Tenant settings page — Company Admin can update tenant name, contact, storage root path | SIMPLE | AFK |
| User management — Company Admin can invite users (email invite), assign roles, deactivate users | MEDIUM | AFK |
| Consultant impersonation audit entry — action recorded with consultant user ID and target tenant ID | SIMPLE | AFK |

**Domain hints:** Security-critical (impersonation must not be exploitable; RLS must not be bypassable). Seed data is pre-approved for distribution — tenant creation is AFK.

**Tracks:**
- Prerequisites: Sprint 7 Quality Gate — Verify complete
- Track 1 — Consultant Shell & Impersonation: super-admin routing, tenant list, switch mechanism, audit log entries
- Track 2 — Tenant Provisioning: creation flow, seed script, user invite flow (depends on Track 1 completing the impersonation mechanism first if seed is triggered from Consultant shell)

**Entry criteria:** Sprint 7 Quality Gate — Verify complete

**Exit criteria:**
- Thomas can switch into a client tenant; impersonation is logged
- A new tenant is provisioned with all 9 modules, sample data, and folder structure
- Company Admin can invite and manage users within their tenant
- RLS: impersonation does not allow cross-tenant data leakage (test with two tenants)
- `tsc --noEmit`, ESLint, vitest pass

**Quality gates:** `tsc --noEmit`, ESLint, vitest on impersonation audit logic, manual RBAC and isolation test (HITL)
**Token budget:** ~130K EST

---

### Sprint 9 — Quality Gate (Sprints 8) — Review

> Note: Sprint 8 is a single feature sprint before this review. The cadence rule (review after every 2 feature sprints) is satisfied here because Sprint 8 is security-critical — a dedicated review at this boundary is appropriate and does not violate the hard rule.

**Type:** Review
**REQ scope:** None — validation only
**Validates:** Sprint 8 (super-admin, tenant provisioning, user management)
**Domain:** Impersonation security, RLS under impersonation, tenant isolation, user invite flow, seed data correctness

**Token budget:** ~50K EST (automated gates) + manual session time
**Entry criteria:** Sprint 8 complete
**Exit criteria:** All test scenarios completed, findings documented, Clear sprint scope defined (or marked empty if nothing found)

---

### Sprint 10 — Version Gate — V1 Foundation

**Type:** Version Gate
**Goal:** Validate that V1 delivers on its milestone commitment. All flows are exercised from Thomas's perspective as a consultant setting up a new client tenant, and from a client's perspective managing their daily ISO work.

**Validation scope:**
- Full tenant provisioning: create tenant → seed data → invite users
- Worker, Management, Admin, Consultant flows — all RBAC paths
- Kanban board: create, move, edit, delete tasks
- KPI register: add measurement, RAG update, coverage indicator
- NCR: create → root cause → CA → effectiveness review → close (complete lifecycle)
- Document linking: attach document to task, open in browser
- Traceability: NCR → CA, KPI deviation → CA
- Audit log: confirm all mutations recorded with correct actor and tenant
- Consultant impersonation: switch tenants, act, log out
- Performance: board load with 200 tasks < 2s
- `tsc --noEmit`, ESLint, all vitest suites pass

**Entry criteria:** Sprint 9 Quality Gate — Verify complete (or clean Review)
**Exit criteria:** Zero open findings. Thomas signs off on the milestone. Version Next begins planning for V2.

**Token budget:** ~80K EST + Thomas sign-off session (HITL)

---

## Sprint Summary

| Sprint | Name | Type | REQ Scope | Budget EST |
|--------|------|------|-----------|------------|
| 1 | Tech Stack Scaffolding | Scaffolding | REQ-001, REQ-010, REQ-013 | ~120K |
| 3-patch | KPI Register Defect Fixes | Patch | REQ-002 | ~40K |
| 4 | Quality Gate (S2–S3) — Review | Review | — | ~50K+ |
| 5 | NCR Module and Traceability | Feature | REQ-007, REQ-008 | ~150K |
| 6 | Document Linking and Storage Adapter | Feature | REQ-006, REQ-014 | ~100K |
| 7 | Quality Gate (S5–S6) — Review | Review | — | ~50K+ |
| 8 | Consultant Super-Admin and Tenant Onboarding | Feature | REQ-001, REQ-005, REQ-011 | ~130K |
| 9 | Quality Gate (S8) — Review | Review | — | ~50K+ |
| 10 | Version Gate — V1 Foundation | Version Gate | All | ~80K+ |

**REQ coverage at V1 close:** REQ-001 through REQ-008, REQ-010 through REQ-014 fully delivered.
**Deferred to V2:** REQ-009 (AI assistance), REQ-004 (Årshjul calendar view and recurring tasks beyond basic kanban).
