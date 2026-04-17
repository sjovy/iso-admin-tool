# Product Requirements Document
**Project:** ISO Admin Tool
**Version:** 1.0 — Sprint 0
**Date:** 2026-04-17
**Author:** Claude Code (planning sub-agent)

---

## 1. Product Vision

A lightweight, agile SaaS tool for Swedish SMBs to manage their ISO quality work — sold and supported by Thomas (ISO consultant). The product is positioned as an **agile management tool built on two cycles: PDCA (Plan-Do-Check-Act) and the yearly review cycle (Årshjul)**. ISO 9001 compliance is the natural output; it is not the headline.

The tool replaces an Asana-based QMS that cannot support structured NCR forms, KPI tracking with trend data, cross-module traceability, or role-filtered views. It is designed from day one for modular expansion to ISO 14001, ISO 27001, and ISO 45001 — the standard modules across those certifications share the same board and task patterns.

Thomas is the single vendor. Clients are his existing and prospective ISO consulting clients. The system must support Thomas operating across all client tenants as a super-admin without additional per-tenant logins.

---

## 2. User Roles

Four tiers, enforced at board and task level:

| Role | Scope | Description |
|------|-------|-------------|
| **Worker** | Own tenant — restricted | Reports incidents, moves tasks on boards, sees only assigned tasks |
| **Management** | Own tenant — strategic | Access to strategic boards and management review; separated from worker tier by board- and task-level permissions |
| **Company Admin / Quality Manager** | Own tenant — full | Full operational access within the tenant; manages users and configuration |
| **Consultant (Thomas)** | All tenants | Super-admin; can operate inside any tenant; support and build/demo layer |

---

## 3. Feature Requirements

### REQ-001 — Multi-Tenant SaaS
Each client is a fully isolated tenant. Tenant data is logically separated at the database level using row-level security (Supabase RLS). No tenant can access another tenant's data through any path. Thomas's Consultant role provides cross-tenant visibility via a dedicated super-admin layer, not by bypassing isolation.

### REQ-002 — ISO 9001 Module Set
Nine operational modules, pre-configured per tenant, mapping to ISO 9001 clauses:

| # | Module (Swedish) | English | ISO Clause |
|---|------------------|---------|------------|
| 1 | Strategisk Inriktning & Kontext | Strategic Direction & Context | Clause 4 |
| 2 | Planering & Riskhantering | Planning & Risk Management | Clause 6 |
| 3 | Årshjul | Annual Review Cycle | Clause 9 |
| 4 | Ledningens Genomgång | Management Review | Clause 9.3 |
| 5 | Händelserapportering | Incident & Event Reporting | Clauses 8 / 10.2 |
| 6 | Ledning & Organisation | Management & Organization | Clause 5 |
| 7 | Mäta & Utvärdera | Measure & Evaluate | Clause 9.1 |
| 8 | Uppföljning | Follow-up & Corrective Actions | Clause 10 |
| 9 | Implementera ISO 9001 | Implementation Roadmap | Meta / onboarding |

Architecture must allow additional standard modules (ISO 14001, 27001, 45001) to be added without structural changes to the core.

### REQ-003 — Kanban Boards Driven by PDCA
Every module exposes a kanban board. Two column variants:

- **Standard (5 columns):** Väntar → Pågår → Parkerad → Godkännande → Klar
- **Extended (6 columns):** Backlog → Att göra → På gång → Parkerad → Godkännande → Klar

Extended variant is used for Årshjul and Implementera ISO 9001. Columns map to PDCA cycle stages in the primary navigation and UX frame. Drag-and-drop card movement required.

### REQ-004 — Yearly Review Cycle (Årshjul)
A structured annual cadence of ISO review activities mapped to months and quarters. Must support:
- Calendar/timeline view in addition to kanban (implementation detail deferred to relevant sprint)
- Recurring tasks (annual and quarterly)
- The Årshjul is the operational heartbeat; its view must surface what is due this month, this quarter, and overdue

### REQ-005 — Role-Based Access Control (RBAC)
Four-tier RBAC enforced at board level and task level:
- Workers see only boards and tasks assigned to them
- Management sees strategic boards plus management review module
- Company Admin / Quality Manager has full tenant access
- Consultant has cross-tenant super-admin access

Permissions must be enforced server-side (not only in UI). Supabase RLS is the enforcement mechanism.

### REQ-006 — Document Linking
Standardized folder and file structure, portable across storage backends. V1 scope:
- App provides guidance on where to place documents in the folder hierarchy
- Tasks and boards link to file paths or URLs
- Clicking a link opens the document in the native app (Word / Google Docs)
- No in-app document editor in V1

The `StorageProvider` interface abstracts the backend. V1 uses local file system in dev and a file-path/URL store in prod. Google Drive and SharePoint are later additions.

Document DB record must store: title, version, author, review date, approval status, ISO clause reference (per Clause 7.5 mandatory requirements).

### REQ-007 — Incident and Event Reporting (NCR Module)
Structured nonconformity report (NCR) form — required fields enforced by the standard (ISO 8.7 / 10.2):

| Field | Required |
|-------|----------|
| description | Yes |
| detected_at | Yes |
| detected_by | Yes |
| classification (minor / major / observation) | Yes |
| immediate_action | Yes |
| root_cause | Yes — required before corrective action can be created |
| corrective_action | Yes |
| ca_due_date | Yes |
| ca_owner | Yes |
| effectiveness_review | Yes — required before closure |
| closed_at | Set on closure |

A nonconformity cannot be closed without an effectiveness review. The tool enforces this workflow at the data layer.

### REQ-008 — Corrective Action and Follow-up Tracking
Corrective actions must maintain the full traceability chain mandated by the standard:

```
NCR (8.7 / 10.2) → Corrective Action → Effectiveness Review
KPI Deviation (9.1.3) → Analysis → Corrective Action → Management Review input
Audit Finding (9.2) → Corrective Action → Management Review input
Management Review output (9.3.3) → Action assigned → Status at next review
```

Each corrective action records: source type (ncr / kpi / audit), source ID, owner, due date, status, verified_at, verified_by. Traceability must be navigable in both directions — from trigger to action and from action back to trigger.

### REQ-009 — AI Contextual Assistance (Claude API)
Targeted for an early milestone (not V1 day one, but within the first few milestones). Use case: contextual help tied to specific tasks and modules — e.g., "Here is our SWOT data. Help me draft this year's analysis."

- Thomas's Claude API account used for build, demo, and V1 production (platform-level key stored as environment variable)
- Per-tenant API key management (clients supply their own key) is a V2 feature
- AI integration is a key demo and selling point; it must be architecturally accommodated from the start even if not activated in Sprint 1

### REQ-010 — EU Data Residency
Supabase instance is located in Stockholm (eu-north-1). This is non-negotiable for GDPR compliance. All data at rest and in transit must remain within EU. No third-party service that processes tenant data may be hosted outside EU without explicit Thomas approval.

### REQ-011 — Consultant Super-Admin Layer
Thomas operates as a super-admin across all tenants. Requirements:
- Cross-tenant dashboard showing all active tenants and health indicators
- Ability to switch into any tenant and operate as if a Company Admin
- Impersonation is logged in the audit trail
- No tenant can see when Thomas is inside their tenant unless Thomas chooses to disclose it

### REQ-012 — PDCA + Yearly Cycle as Primary UX Frame
Navigation and information architecture are organized around:
1. The PDCA cycle (Plan → Do → Check → Act) — the daily and sprint-level work frame
2. The Årshjul (yearly review cycle) — the annual cadence frame

ISO clause numbers are preserved where necessary (e.g., in forms and document references) but are not the primary navigation labels. Swedish module names are retained as the canonical labels.

### REQ-013 — Autonomous Agent-Friendly Operation
The codebase must support full operation via CLI and MCP tooling:
- Supabase CLI for migrations and schema management
- GitHub for version control
- Vercel CLI for deployment
- All environment variables documented and loadable from `.env.local`
- No operations that require a browser-only workflow

### REQ-014 — Standardized Document Folder Structure
A portable folder and naming convention that can be replicated on any storage backend. The structure is based on the sample client's Google Drive layout and maps to what a client's SharePoint will contain:

```
[Client Root]/
├── Rutiner & Policies/      ← Policies and routines (linked from boards)
├── Strategidokument/        ← Strategy analyses, process maps
├── Mallar/                  ← Templates (audit, forms, protocols)
│   └── Internrevision/      ← Internal audit templates
├── Mötesprotokoll/          ← Meeting minutes (management review outputs)
└── Övrigt/                  ← Supporting documents
```

---

## 4. Non-Functional Requirements

| Requirement | Specification |
|-------------|---------------|
| Data residency | Supabase Stockholm (eu-north-1) — non-negotiable |
| Authentication | Email/password V1; Microsoft SSO Phase 2 |
| Language | English UI; Swedish sample data and module names |
| Performance | Board load < 2 seconds for up to 200 tasks per module |
| Audit trail | All mutations logged: user, action, entity, timestamp, JSON diff |
| Accessibility | WCAG 2.1 AA minimum — keyboard navigation on all boards |

---

## 5. Constraints and Non-Negotiables

| Constraint | Detail |
|------------|--------|
| Tech stack | Next.js (App Router), TypeScript strict mode, Tailwind CSS, shadcn/ui, Supabase (DB + Auth), Vercel (hosting), GitHub (VCS) |
| ORM | Prisma — schema-first, migrations via Supabase MCP + CLI |
| Package manager | pnpm |
| Data residency | Supabase Stockholm — non-negotiable (GDPR) |
| No credentials in source | .env.local only; never committed |
| TypeScript strict mode | Enabled; `tsc --noEmit` must pass at every quality gate |
| Sprint 1 content | Always tech stack scaffolding — no feature work before stack is running |
| Quality gate cadence | Review sprint after every 2 feature sprints; hard max 3 consecutive feature sprints |

---

## 6. Out of Scope

| Item | Reason |
|------|--------|
| Certification management | Auditor's domain; not the client's operational tool |
| Billing and subscriptions | Handled externally |
| HR and payroll | Outside QMS scope |
| In-app document authoring | V1 links to native apps; in-app editor is a later pass |
| Microsoft 365 / SharePoint integration | V1 uses file path/URL links; SharePoint adapter is a later pass |
| Google Drive integration | Sample client uses Drive; production target is SharePoint |
| ISO 14001, 27001, 45001 modules | Architecture accommodates them; module content is a later milestone |
| Mobile native app | Web-first; responsive design covers mobile browser use cases |
| Public API | Not required for V1 |
