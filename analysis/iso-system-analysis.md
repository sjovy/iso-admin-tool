# ISO Admin Tool — System Analysis & Pre-Plan
**Date:** 2026-04-14 (updated 2026-04-16)
**Source:** Asana workspace "Min arbetsyta" — 9 projects analyzed + Google Drive document library mapped
**Author:** Claude Code (analysis session)  
**Status:** Pre-plan brainstorm — input to build session

---

## 1. Purpose of This Document

This document captures the full analysis of an ISO 9001 Quality Management System (QMS) built in Asana, used as the blueprint for a proprietary SaaS tool. The Asana workspace belongs to **Datadelen Hosting Center AB** (IT/hosting, Västerås, Sweden) — this is a **sample client** used to design and validate the tool. All tasks in the Asana projects are **sample/guide tasks** intended to show future users what a real implementation looks like, not live operational data.

The goal of this document is to:
- Record what was built in Asana before the session ends
- Derive the feature set for the tool from evidence, not invention
- Identify gaps that a dedicated tool should fix
- Sketch the data model and open questions for the build session

---

## 2. The Asana System — Structure

### 2.1 Nine Projects, One System

The QMS is split across 9 Asana projects, each representing a functional module of ISO 9001:

| # | Project (Swedish) | English Translation | ISO 9001 Domain | Color |
|---|---|---|---|---|
| 1 | Strategisk Inriktning & Kontext | Strategic Direction & Context | Clause 4 — Context of the org | Aqua |
| 2 | Planering & Riskhantering | Planning & Risk Management | Clause 6 — Planning | Aqua |
| 3 | Årshjul | Annual Review Cycle | Clause 9 — Performance evaluation | Blue |
| 4 | Ledningens Genomgång | Management Review | Clause 9.3 — Management review | Aqua |
| 5 | Händelserapportering | Incident & Event Reporting | Clause 8 — Operation, Clause 10.2 — NCR | Aqua |
| 6 | Ledning & Organisation | Management & Organization | Clause 5 — Leadership | Aqua |
| 7 | Mäta & Utvärdera | Measure & Evaluate | Clause 9.1 — Monitoring & measurement | Magenta |
| 8 | Uppföljning | Follow-up & Corrective Actions | Clause 10 — Improvement | Hot-pink |
| 9 | Implementera ISO 9001 | Implement ISO 9001 | Implementation roadmap (meta-project) | Yellow-green |

The color coding in Asana was intentional: aqua = operational modules, differentiated colors for special-purpose boards (Årshjul, Mäta, Uppföljning, Implementation).

### 2.2 Two Kanban Variants

All 9 projects use kanban boards. Two structural variants exist:

**Variant A — Standard (7 of 9 projects)**
| Column | Swedish | Purpose |
|---|---|---|
| 1 | Väntar | Waiting / Backlog |
| 2 | Pågår | In progress |
| 3 | (Parkerad) | Parked / On hold |
| 4 | Godkännande | Awaiting approval |
| 5 | Klar | Done |

**Variant B — Extended (2 of 9 projects: Årshjul + Implementera)**
| Column | Swedish | Purpose |
|---|---|---|
| 1 | Backlog | Future / not scheduled |
| 2 | Att göra | To do (scheduled) |
| 3 | På gång | In progress |
| 4 | (Parkerad) | Parked |
| 5 | Godkännande | Awaiting approval |
| 6 | Klar | Done |

The extended variant is used for projects that require sprint/cycle planning — tasks live in Backlog before being pulled into active work. The standard variant is used for operational boards where items arrive and flow through directly.

The **Parkerad** (Parked) column is a notable design choice: it acknowledges that ISO work frequently stalls on external dependencies (auditor availability, management sign-off, supplier response) without polluting the "in progress" view.

The **Godkännande** (Approval) column is equally significant: it reflects ISO 9001's requirement for formal sign-off on documents, processes, and changes before they are considered complete.

---

## 3. Module-by-Module Analysis

### 3.1 Strategisk Inriktning & Kontext (Clause 4)

**Purpose:** Tracks strategic business context — the "why" behind the QMS.

**Sample tasks include:**
- Uppdatera våra Hållbarhetskrav (Update sustainability requirements)
- Teknisk roadmap
- Bredda Tjänsteportföljen (Broaden service portfolio)
- Krav på GDPR, IT säkerhet (GDPR and IT security requirements)
- Identify and win new customers
- All core service delivery processes (mobile apps, e-commerce, hosting, support)

**Insight:** This module maps to ISO 4.1 (context) and 4.2 (interested parties). In a real implementation, these tasks represent strategic items that feed into the quality policy and objectives. They need to be reviewed periodically (typically annually at management review) and linked to the risk register.

### 3.2 Planering & Riskhantering (Clause 6)

**Purpose:** Risks, opportunities, and quality objectives with actions.

**Sample tasks include:**
- Förbättra skydd mot Cyberhot (Improve cyberthreat protection)
- Höja kundnöjdhet med support (Raise customer satisfaction with support)
- Förstärkt GDPR övervakning (Strengthened GDPR monitoring)
- Minska kritiska IT-säkerhetsincidenter (Reduce critical IT security incidents)
- Certifiera drifttekniker (Certify operations engineers)
- Backuper i driftmiljön (Backups in operations environment)
- Informationsmöten om kvalitetsmål (Quality goal information meetings)

**Insight:** This module mixes three ISO elements: risks/opportunities (6.1), quality objectives (6.2), and actions to address them. In the tool, these should be separable — a risk should link to objectives, which link to actions. The current flat kanban conflates these layers.

### 3.3 Årshjul (Annual Review Cycle)

**Purpose:** A recurring calendar of ISO review activities mapped to months/quarters.

**Sample tasks include (all reference ISO clause numbers):**
- Sälj & ordergranskning (8.2) + Dokumentstyrning (7.5)
- Kvalitetsmål (6.2) & Mätning (9.1)
- Leverantörsutvärdering & Inköp (8.4)
- Halvårsgenomgång: kontext, intressenter, KPI, revisioner... (9.1, 9.2, 9.3, 10.2/10.3)
- Årsgenomgång: helårsresultat, KPI, avvikelser, resurser, mål 2026

**Insight:** The Årshjul is the operational heartbeat of the QMS — it tells management when to do what, every year. This is fundamentally a **calendar/schedule view**, not just a kanban. The tool should render this as a timeline or yearly planner in addition to (or instead of) a board. Tasks here are recurring, so the tool needs support for repeating items.

### 3.4 Ledningens Genomgång (Management Review — Clause 9.3)

**Purpose:** Collects and tracks the inputs for the formal management review meeting.

**Sample tasks:**
- Uppdatera SWOT-analys
- Uppdatera TOWS-analys
- Uppdatera Intressentanalys (Stakeholder analysis)
- Uppdatera Affärsplan (Business plan)
- Uppdatera Processkarta (Process map)

**Insight:** This module is document-centric. Each task represents a document that must be refreshed before the management review. In the tool, each task should link directly to the document in SharePoint. The module functions as a checklist of what must be current before the review can be signed off. Post-review, outputs (decisions, action items) should feed back into Planering & Riskhantering.

### 3.5 Händelserapportering (Incident & Event Reporting — Clause 8/10.2)

**Purpose:** Nonconformity (NCR) and event tracking — both pre-delivery controls and post-delivery defects.

**Sample tasks split into two types:**

*Release/approval controls:*
- Godkänna ABC Komponenter (Approve components from supplier)
- Validera designändringar. Projekt #4021 (Validate design changes)
- Frisläppning mot kundspecifikation. #Order 5523 (Release against customer spec)
- Funktionskontroll före leverans. Projekt #7789 (Function check before delivery)

*Incident/defect reporting:*
- Fel identifierade i modul X (Defects found in module X)
- Fel i inkommande leverans (Defect in incoming delivery)
- Försenad delleverans (Delayed partial delivery)
- Bugg i program identifierad (Bug identified in software)

**Insight:** This is arguably the most important operational module. In ISO 9001, nonconformity handling (8.7, 10.2) is heavily audited. The tool should support structured NCR forms with: description, root cause, corrective action, verification, and close-out. The current flat task format loses all this structure. This module also needs **severity classification** and **traceability** to the affected process/project.

### 3.6 Ledning & Organisation (Management & Organization — Clause 5)

**Purpose:** Policy and procedure document control — the living document library of the QMS.

**Sample tasks:**
- Uppdatera Policy: Omfattning av Ledningssystem (Scope of management system)
- Uppdatera Policy: Kvalitetspolicy (Quality policy)
- Uppdatera Policy: Organisation för kvalitetsledning (Organization for quality management)
- Uppdatera Rutin: Strategisk Inriktning & Kontext
- Uppdatera Rutin: Planering & Riskhantering
- Uppdatera Rutin: [all other modules]
- Uppdatera "Den Lilla Röda" (The Little Red Book — internal handbook)
- Uppdatera Revisionslista & Övriga Dokument (Revision list & other documents)

**Insight:** "Den Lilla Röda" (The Little Red Book) appears to be a condensed employee handbook — a practical guide for how to work within the QMS day-to-day. This is a key artifact. Each task in this module corresponds to a document in SharePoint. This module IS the document control system — it tracks when each document was last reviewed and whether it is current. The tool should surface document age (last reviewed date) and flag overdue reviews.

### 3.7 Mäta & Utvärdera (Measure & Evaluate — Clause 9.1)

**Purpose:** KPI tracking — the measurement backbone of the QMS.

**Sample KPIs:**
- Antal lyckade verifieringstester (Number of successful verification tests)
- Leveransprecision (% i tid) (Delivery precision % on time) — appears twice (internal + supplier)
- Genomsnittlig svarstid i support (Average response time in support)
- Antal kritiska IT-säkerhetsincidenter (Critical IT security incidents)
- Antal buggar vid prestandatest (Bugs at performance test)
- Driftkostnader i relation till budget (Operations costs vs budget)
- Kundnöjdhet (NPS)
- Efterlevnad av GDPR-rutiner (GDPR compliance %)
- Antal fel vid sluttest (Defects at final test)
- Antal certifierade drifttekniker (Certified operations engineers)

**Insight:** These are 13 KPIs covering quality, security, delivery, support, cost, and compliance. As flat kanban tasks they are useless — there is no place to record actual values, targets, trends, or measurement frequency. The tool needs a **proper KPI register** with: target value, actual value, measurement frequency, owner, trend direction, and RAG status. This is the module that most clearly demonstrates why a dedicated tool is needed.

### 3.8 Uppföljning (Follow-up & Corrective Actions — Clause 10)

**Purpose:** Tracks corrective actions arising from measurements, audits, and incidents.

**Sample tasks:**
- Förbättring av säkerhetsrutiner (Security routine improvement)
- Leveransprecision under mål (Delivery precision below target)
- Ytterligare utbildningsinsats för certifiering (Additional training for certification)
- Utveckling av självserviceportal (Self-service portal development)
- Extra GDPR-utbildning för supportteam (Extra GDPR training for support team)
- Kritisk bugg i loginflöde (Critical bug in login flow)
- Ofullständig dokumentation vid leverans (Incomplete documentation at delivery)

**Insight:** These corrective actions should trace back to the KPI or incident that triggered them. Currently they are standalone tasks with no linkage. The tool should maintain this traceability chain: KPI deviation → corrective action → verified resolution.

### 3.9 Implementera ISO 9001 (Implementation Roadmap)

**Purpose:** The meta-project — a sprint-based roadmap for getting the company from zero to certified.

**Six sprints:**
| Sprint | Due | Focus |
|---|---|---|
| 1 | 2025-11-17 | Kick-off, leadership decision, internal communication |
| 2 | 2025-11-28 – 12-05 | Planning: stakeholders, context, process register, strategy |
| 3 | 2025-12-12 | Build QMS: quality policy, objectives, risk routines, document templates |
| 4 | 2026-02-02 | Training, measurement, daily routines, "Den Lilla Röda" launch |
| 5 | 2026-02-23 | Internal audit, management review, corrective actions |
| 6 | 2025-12-08* | Certification prep, document review, certification audit, corrections |

*Sprint 6 date appears to be out of sequence in the source data — likely a data entry error.

**Insight:** This project is the onboarding flow. In the tool, this should become a **guided implementation wizard** or checklist that a new client follows to get from signup to certification-ready. Each sprint becomes a phase, and completion of each phase unlocks the relevant modules.

---

## 4. The ISO 9001 Lifecycle — How the Modules Connect

The nine modules form a closed loop that follows the ISO 9001 PDCA (Plan-Do-Check-Act) cycle:

```
PLAN
  Strategisk Inriktning & Kontext  (4 — Context)
  Planering & Riskhantering        (6 — Planning)
  Ledning & Organisation           (5 — Leadership, documents)

DO
  Årshjul                          (Operational schedule)
  Händelserapportering             (8 — Operations, NCR)

CHECK
  Mäta & Utvärdera                 (9.1 — Measurement)
  Ledningens Genomgång             (9.3 — Management review)

ACT
  Uppföljning                      (10 — Improvement, CA)

META
  Implementera ISO 9001            (Onboarding roadmap)
```

The linkage between modules that is implicit in Asana must be **explicit** in the tool:
- A risk in Planering feeds a corrective action in Uppföljning
- A KPI deviation in Mäta triggers an item in Uppföljning
- An incident in Händelserapportering links to a corrective action in Uppföljning
- Management review inputs come from Ledningens Genomgång and outputs feed back to Planering
- All documents managed in Ledning & Organisation live in SharePoint and are referenced everywhere

---

## 5. Gaps — What Asana Cannot Do

These are the structural limitations of the Asana implementation that justify building a dedicated tool:

| Gap | Impact |
|---|---|
| KPIs as flat tasks | No target, no actual value, no trend, no RAG status |
| No cross-module traceability | Cannot link incident → corrective action → KPI deviation |
| No document versioning or review dates | Documents go stale silently |
| No structured NCR form | Nonconformity handling loses root cause, corrective action, verification |
| No recurring tasks | Årshjul activities must be manually recreated each year |
| No role-based views | Everyone sees everything; ISO roles (QM, process owner, auditor) get no filtered view |
| No audit trail | Cannot prove what was done and when (critical for certification) |
| No dashboard | No single view of QMS health across all modules |
| Language locked to Swedish | Asana UI is multi-language but content is not translatable |
| No guided onboarding | New client starts from blank canvas |

---

## 6. Feature List — Derived From Analysis

### Core (MVP)
- [ ] Multi-tenant SaaS (one DB, client data isolated)
- [ ] Role system: Admin, Quality Manager, Process Owner, Employee
- [ ] 8 operational kanban boards (one per module, pre-configured columns)
- [ ] Standard 5-column and Extended 6-column variants
- [ ] Task CRUD with: title, description, owner, due date, ISO clause reference, status
- [ ] SharePoint document vault integration (adapter pattern, local FS in dev)
- [ ] Document links on tasks (attach a SharePoint document to a task)
- [ ] KPI register: target, actual, unit, frequency, owner, RAG status, trend
- [ ] Structured NCR form: description, classification, root cause, CA, verification
- [ ] Traceability links: NCR → Corrective Action, KPI deviation → Corrective Action
- [ ] Audit log (who did what, when)
- [ ] Implementation wizard (sprint-based onboarding, based on Implementera project)

### Phase 2
- [ ] Årshjul calendar view (timeline/planner, not just kanban)
- [ ] Recurring tasks (annual, quarterly)
- [ ] KPI trend charts
- [ ] Management review module (checklist + output recording)
- [ ] Document review reminders (flag documents overdue for review)
- [ ] Microsoft SSO (client staff login with M365 account)
- [ ] Swedish/English language toggle (UI and sample data)
- [ ] PDF export (management review report, KPI report)

### Phase 3
- [ ] Multi-standard support (ISO 14001, ISO 27001 alongside 9001)
- [ ] Certification body integration or export package
- [ ] Mobile-friendly views (field staff reporting incidents)

---

## 7. Data Model Sketch

### Core entities

```
Tenant
  id, name, slug, subscription_tier, sharepoint_site_url, sharepoint_tenant_id
  created_at

User
  id, tenant_id, email, name, role (admin|qm|process_owner|employee)
  microsoft_id (nullable, for SSO)

Module
  id, tenant_id, name, type (enum: strategic|planning|annual|management_review|
                              incident|org|measurement|followup|implementation)
  columns: JSON (ordered list of column definitions)

Task
  id, module_id, tenant_id, title, description, status (column reference)
  owner_id, due_date, iso_clause, priority
  created_at, updated_at, completed_at

KPI
  id, tenant_id, title, description, unit, target_value, actual_value
  measurement_frequency, owner_id, rag_status (red|amber|green)
  last_measured_at

KPIMeasurement
  id, kpi_id, value, measured_at, measured_by, notes

NCR (Nonconformity Report)
  id, tenant_id, title, description, classification (minor|major|observation)
  detected_at, detected_by, root_cause, corrective_action_id (nullable FK)
  status (open|in_progress|verified|closed), closed_at

CorrectiveAction
  id, tenant_id, title, description, owner_id, due_date
  status, source_type (ncr|kpi|audit), source_id
  verified_at, verified_by

Document
  id, tenant_id, title, sharepoint_url, sharepoint_item_id
  document_type (policy|routine|template|record|other)
  last_reviewed_at, review_due_date, owner_id, version

AuditLog
  id, tenant_id, user_id, action, entity_type, entity_id
  payload (JSON diff), created_at
```

### Key relationships
- Task → Document (many-to-many, via task_documents join)
- NCR → CorrectiveAction (one-to-one or one-to-many)
- KPI → CorrectiveAction (when KPI deviates, CA is raised)
- CorrectiveAction → Task (CA can generate a kanban task)
- User → Module (process owner assignment)

---

## 8. Technical Architecture Summary

```
┌─────────────────────────────────────────────┐
│   Next.js 14 App Router  (Vercel)            │
│   TypeScript + Tailwind + shadcn/ui          │
│   pnpm                                       │
└────────────────┬────────────────┬────────────┘
                 │                │
                 ▼                ▼
    ┌────────────────┐   ┌─────────────────────┐
    │  Supabase      │   │  SharePoint          │
    │  (Postgres)    │   │  (via Graph API)     │
    │                │   │  — per tenant        │
    │  - Tenants     │   │  - Policy docs       │
    │  - Users/auth  │   │  - Routines          │
    │  - Tasks       │   │  - Templates         │
    │  - KPIs        │   │  - Meeting minutes   │
    │  - NCRs        │   │  - Evidence files    │
    │  - Audit log   │   └─────────────────────┘
    └────────────────┘
          ▲
          │ MCP (dev)
          │ CLI (migrations, types)
    ┌─────────────┐
    │  Claude Code │
    └─────────────┘
```

**Storage adapter pattern (dev → prod):**
```typescript
interface StorageProvider {
  listFiles(path: string): Promise<File[]>
  getFile(id: string): Promise<File>
  uploadFile(path: string, content: Buffer): Promise<File>
  getDownloadUrl(id: string): Promise<string>
}

// Dev: LocalFileSystemProvider (reads ./storage/ folder)
// Prod: SharePointProvider (Microsoft Graph API)
```

---

## 9. Open Questions (To Resolve at Build Session Start)

| # | Question | Status | Decision |
|---|---|---|---|
| 1 | UI language at launch? | Open | English UI, Swedish sample data (recommended) |
| 2 | Auth at MVP? | Open | Email/password first, Microsoft SSO Phase 2 (recommended) |
| 3 | Prisma vs Supabase native? | **Resolved** | **Prisma** — Claude Code handles schema/migrations via Supabase MCP + CLI |
| 4 | Drag-and-drop kanban library? | Open | dnd-kit (recommended) |
| 5 | KPI chart library? | Open | shadcn/ui charts (recommended, already in stack) |
| 6 | SharePoint auth model? | Open | Application permissions (recommended, simpler for clients) |
| 7 | Tenant onboarding flow? | Open | Self-serve with guided setup wizard (recommended) |
| 8 | Pricing/tier model? | Open | Out of scope for build |
| 9 | "Den Lilla Röda" in tool? | Open | External doc in SharePoint + deep links from UI (recommended) |
| 10 | Sample data seeding? | Open | Seed from templates on tenant creation (recommended) |
| 11 | SharePoint adapter timing? | **Resolved** | **Last step in build** — local FS adapter used throughout development |

### ISO 9001:2015 Standard
Full standard available at: `analysis/SS_EN_ISO_9001_2015_EN_SV.pdf` (Swedish/English bilingual)
To be read at build session start to validate NCR form, audit trail, and KPI requirements against the actual standard clauses.

---

## 10. Recommended Build Order

Given the above, the recommended implementation sequence for the first build sprint:

1. **Project scaffold** — Next.js, Prisma, Supabase, Tailwind, shadcn
2. **Auth** — Supabase Auth, tenant creation, user roles
3. **Core kanban** — Module + Task entities, board UI, drag-and-drop
4. **KPI register** — KPI entity, data entry, RAG status display
5. **Document vault** — StorageProvider adapter, local FS implementation, file listing UI
6. **NCR module** — Structured form, status workflow
7. **Traceability** — Link NCR → CA, KPI deviation → CA
8. **Audit log** — Automatic logging of all mutations
9. **SharePoint adapter** — Swap local FS for Graph API
10. **Seed data** — Import the 9 Asana modules + sample tasks as tenant template

---

---

## 11. ISO 9001:2015 — Mandatory Requirements Affecting Tool Design

Extracted directly from SS-EN ISO 9001:2015 (EN). These are hard requirements ("shall"), not suggestions.

### Document Control (Clause 7.5)
Every document in the system **shall** have:
- Title, date, author, reference number
- Format and media defined
- Formal review and approval before use
- Protection from unintended alteration
- Retention/disposal rules defined

**Tool implication:** Document records in the DB must store title, version, author, review date, approval status, and ISO reference. The SharePoint file is the document body; the DB holds its metadata and lifecycle state.

### NCR — Nonconforming Outputs (Clause 8.7) + Corrective Action (Clause 10.2)

When a nonconformity occurs the organization **shall**:
1. React: correct it, contain it, deal with consequences
2. Evaluate whether corrective action is needed (to eliminate root cause)
3. Implement corrective action
4. Review the effectiveness of the corrective action
5. Update risks and opportunities if needed
6. Change the QMS if needed

Must **retain documented information** on:
- Nature of the nonconformity
- Actions taken
- Results of corrective action

**Tool implication:** NCR form is not optional and not flat. Required fields:
```
description          — what happened
detected_at          — when
detected_by          — who
classification       — minor / major / observation
immediate_action     — correction taken
root_cause           — why it happened (required before CA can be created)
corrective_action    — what prevents recurrence
ca_due_date          — deadline
ca_owner             — responsible person
effectiveness_review — was the CA effective? (required before closure)
closed_at            — closure date
```
A nonconformity **cannot be closed** without an effectiveness review. The tool must enforce this workflow.

### Measurement & Monitoring (Clause 9.1)

The organization **shall** analyse and evaluate data to assess:
- Conformity of products and services
- Degree of customer satisfaction
- QMS performance and effectiveness
- Effectiveness of planning (risks/opportunities)
- External provider performance
- Need for improvements

**Tool implication:** The KPI register must map each KPI to one of these categories. A dashboard must show coverage — is each category being measured? Customer satisfaction (NPS) and supplier performance are specifically mandated, not optional.

### Internal Audit (Clause 9.2)

The organization **shall** conduct internal audits at planned intervals. Must retain documented information as evidence of:
- Audit programme
- Audit results

Each audit must cover: whether the QMS conforms to requirements and is effectively implemented.

**Tool implication:** Årshjul must include scheduled audit activities. Audit results must be stored records, not just tasks marked complete. Each audit needs: scope, date, auditor, findings, and follow-up actions linked to corrective actions.

### Management Review (Clause 9.3)

**Inputs** the review **shall** consider (all mandatory):
1. Status of actions from previous reviews
2. Changes in external/internal issues
3. QMS performance: customer satisfaction, quality objectives, process performance, NCRs, monitoring results, audit findings, supplier performance
4. Adequacy of resources
5. Effectiveness of risk/opportunity actions
6. Improvement opportunities

**Outputs** shall include decisions on:
- Improvement opportunities
- QMS changes needed
- Resource needs

**Tool implication:** Management review is a structured meeting record. The tool must collect all inputs (pulling live data from other modules — NCR count, KPI status, audit findings) and record the decisions as outputs. Outputs feed back into Planering & Riskhantering.

### Traceability Chain Required by the Standard

```
Risk/opportunity (6.1)
    → Action planned (6.1.2)
    → Effectiveness evaluated

Nonconformity detected (8.7 / 10.2)
    → Immediate correction
    → Root cause analysis
    → Corrective action assigned
    → Effectiveness review
    → QMS update if needed

KPI deviation (9.1.3)
    → Analysis
    → Corrective action (10.2)
    → Management review input (9.3.2)

Audit finding (9.2)
    → Corrective action (10.2)
    → Management review input (9.3.2)

Management review output (9.3.3)
    → Action assigned with owner + due date
    → Status tracked at next review (9.3.2a)
```

The tool must make this chain navigable: clicking a corrective action shows what triggered it; clicking a KPI shows its linked actions; management review pulls live status from all chains.

---

---

## 12. Google Drive Document Library — Sample Client Blueprint

**Mapped 2026-04-16 via live Drive access (G:/Min enhet/ISO Ledarskap/ISO 9001 Ledningssystem/)**

> **Scope note:** The app we are building targets Microsoft 365 / SharePoint customers. Google Drive is not the integration target — SharePoint is. This section documents the *sample client's* (Datadelen) Google Drive library because it is the real-world blueprint for what a client's SharePoint will contain. The document types, folder structure, naming conventions, and Asana → document link patterns here define exactly what the SharePoint adapter must support.

### 12.1 Drive Root Structure

```
ISO 9001 Ledningssystem/
├── Rutiner & Policies/          ← 11 active documents (all linked from Asana)
├── Strategidokument/            ← Strategy analyses + process maps
│   └── Analysfrågor/            ← Implementation analysis questions
├── Mallar/                      ← 19+ templates (audit, forms, protocols)
│   └── Internrevision/          ← 8 internal audit templates
├── Införande & implementering/  ← Onboarding docs, comms plan, roadmap
├── Stödjande dokument/          ← Supporting documents
├── Gamla register/              ← 7 archived register sheets
├── Asana Importer/              ← Migration artifacts
└── Allt i Word format/          ← Complete Word backup of all documents
```

**Adjacent systems also in Drive (Phase 3 relevance):**
- `ISO 27001 Informationssäkerhet/` — complete parallel QMS for information security
- `ISO 14001/` — environmental management (Word format only)
- `ISO Documentation/` — cross-standard reference material
- `Sälj presentationer ISO 9001/` — sales/demo presentations

### 12.2 Asana → Drive Link Map

All 13 explicitly linked documents:

| Asana Project | Task (Swedish) | Document | Drive Folder | Type |
|---|---|---|---|---|
| Ledningens Genomgång | Uppdatera SWOT-analys | SWOT | Strategidokument/ | Gdoc |
| Ledningens Genomgång | Uppdatera TOWS-analys | TOWS | Strategidokument/ | Gdoc |
| Ledningens Genomgång | Uppdatera Intressentanalys | Stakeholders | Strategidokument/ | Gdoc |
| Ledningens Genomgång | Uppdatera Affärsplan | Affärsplan - Lean Canvas | Strategidokument/ | Gdoc |
| Ledning & Organisation | Uppdatera Policy: Omfattning | Policy – Omfattning Ledningssystem | Rutiner & Policies/ | Gdoc |
| Ledning & Organisation | Uppdatera Policy: Kvalitetspolicy | Policy – Kvalitetspolicy | Rutiner & Policies/ | Gdoc |
| Ledning & Organisation | Uppdatera Policy: Organisation | Policy – Organisation för kvalitetsledning | Rutiner & Policies/ | Gdoc |
| Ledning & Organisation | Uppdatera Rutin: Strategisk Inriktning | Rutin – Strategisk inriktning & kontext | Rutiner & Policies/ | Gdoc |
| Ledning & Organisation | Uppdatera Rutin: Ledning & Organisation | Rutin – Ledning & organisation | Rutiner & Policies/ | Gdoc |
| Ledning & Organisation | Uppdatera Rutin: Planering & Riskhantering | Rutin – Planering & riskhantering | Rutiner & Policies/ | Gdoc |
| Ledning & Organisation | Uppdatera Rutin: Resurser & Stödprocesser | Rutin – Resurser & stödprocesser | Rutiner & Policies/ | Gdoc |
| Ledning & Organisation | Uppdatera Rutin: Verksamhetsprocesser | Rutin – Verksamhetsprocesser | Rutiner & Policies/ | Gdoc |
| Ledning & Organisation | Uppdatera Rutin: Utvärdering & Uppföljning | Rutin – Utvärdering & uppföljning | Rutiner & Policies/ | Gdoc |
| Ledning & Organisation | Uppdatera Rutin: Förbättringar & Avvikelsehantering | Rutin – Förbättring & avvikelsehantering | Rutiner & Policies/ | Gdoc |
| Ledning & Organisation | Uppdatera "Den Lilla Röda" | Den lilla röda | Rutiner & Policies/ | Gdoc |
| Ledning & Organisation | Uppdatera HUR vi arbetar med ISO 9001 | HUR vi arbetar med ISO 9001 | Rutiner & Policies/ | Gsheet |
| Ledning & Organisation | Uppdatera Revisionslista & Övriga Dokument | Master Revisionslista | Rutiner & Policies/ | Gsheet |

### 12.3 Unlinked Documents of Note (In Drive but not yet linked from Asana tasks)

| Document | Folder | Relevance |
|---|---|---|
| Kommunikationsplan | Införande & implementering/ | Onboarding wizard content |
| Ledningsbeslut ISO 9001 | Införande & implementering/ | Management commitment record |
| Färdplan för genomförande | Införande & implementering/ | Maps to sprint roadmap in Implementera project |
| Checklista Kundinformation | Införande & implementering/ | Customer information checklist |
| PESTLE | Strategidokument/ | Strategic analysis — feeds Clause 4 |
| Porters 5 Forces | Strategidokument/ | Strategic analysis — feeds Clause 4 |
| Process-register, kartor | Strategidokument/ | Process register — feeds Clause 4 + 8 |
| Processkarta.png / .svg | Strategidokument/ | Visual process map |
| Protokoll Internrevision | Mallar/ | Internal audit protocol template |
| Ledningens genomgång | Mallar/ | Management review template |
| Leverantörsutvärdering | Mallar/ | Supplier evaluation template |
| Mätrapport kundundersökning | Mallar/ | Customer survey measurement template |
| Kvalitetsmålsformulär | Mallar/ | Quality objectives form |
| Kompetensbedömning intyg | Mallar/ | Competence assessment certificate |
| Förändringsanmälan | Mallar/ | Change notification form |
| Ordergranskningsprotokoll | Mallar/ | Order review protocol |

### 12.4 Implications for Tool Design

1. **Document storage target is SharePoint, not Google Drive.** The app integrates with SharePoint via Microsoft Graph API. Google Drive is only relevant here as the sample client's source data that informed the design. The `StorageProvider` prod implementation is `SharePointProvider`.

2. **SharePoint item IDs, not URLs, are the stable reference.** SharePoint `itemId` values are permanent; sharing URLs can change. The `Document` DB record stores `sharepoint_item_id` as the canonical reference. This mirrors the Google Drive pattern (where `fileId` is stable) — same principle, different platform.

3. **Editing stays in Microsoft.** The tool does not host document content — it displays metadata (version, review date, owner) and provides deep links that open the document in Word Online / SharePoint. No in-app editor needed.

4. **Templates folder is the seed data source.** The sample client's `Mallar/` folder (19+ templates) defines exactly what template documents a new tenant's SharePoint library should contain. When onboarding a new tenant, the tool copies these templates into the tenant's SharePoint and registers them in Supabase — this is the sample data seeding mechanism.

5. **ISO 27001 and ISO 14001 already exist in the sample Drive.** Phase 3 multi-standard support has real source material to reference. The data model must not hard-code ISO 9001 as the only standard.

6. **Master Revisionslista is the document version registry pattern.** The sample client tracks all document versions in a spreadsheet. The tool replaces this with the `Document` entity in Supabase (with `version`, `last_reviewed_at`, `review_due_date`) — the spreadsheet is the functional spec for that entity.

---

---

## 13. Build Strategy — Quality Cycle

Derived from a prior build (genomforandemotorn-2) where calibration/enhancement debt accumulated until a single sprint number expanded to 26 sub-sprints. The following rules are mandatory for this project and must be reflected in the implementation plan.

### 13.1 The Quality Cycle

The build rhythm alternates between a **build phase** (feature sprints) and a **quality cycle**. The quality cycle consists of three phases in sequence:

```
BUILD PHASE  (2–3 feature sprints)
     ↓
REVIEW       — test all flows, generate findings list
     ↓
CLEAR        — fix all findings from Review only
     ↓
VERIFY       — re-run test script on affected areas; confirm zero findings
     ↓
BUILD PHASE  (resume — only when Verify is clean)
```

The three phases together are called the **quality cycle**. The cycle may loop (Clear → Verify → Clear → Verify…) until Verify is clean. There is no exit from the cycle with open findings.

### 13.2 Cadence Rules

| Rule | Statement |
|---|---|
| **Soft rule** | Quality cycle after every 2 feature sprints (every 3rd sprint is a Review) |
| **Hard rule** | Never more than 3 consecutive feature sprints without a quality cycle |
| **Enforcement** | Before planning any feature sprint, count feature sprints since last Verify closed. If count ≥ 3 → insert Review sprint first, do not plan the feature sprint |

### 13.3 Scope Boundary

Clear sprints fix **only what Review found**. No new features. No backlog items. No "while we're in here" additions. Anything not surfaced by Review is deferred to the next build phase. Violating this rule is how debt compounds.

### 13.4 Exit Gate

**Verify must return zero findings before the quality cycle closes.** There is no "mostly done" exit. If Verify finds issues, the cycle loops back to Clear.

### 13.5 Loop Limit

Maximum **3 loops** (Review → Clear → Verify × 3) per quality cycle. If 3 loops complete without a clean Verify: stop, do not run a 4th loop. Diagnose root cause with Thomas — either Review was incomplete, or the build phase was too long. Resolve before continuing.

### 13.6 Sprint Naming

Sprint names drive automatic detection in the sprint-next skill:
- `Review` in the name → Review sprint path
- `Clear` in the name → Clear sprint path (scope-bounded fix sprint)
- `Verify` in the name → Verify sprint path

---

*This document was generated from a live Asana API analysis conducted 2026-04-14, updated 2026-04-16 with live Google Drive mapping. The Asana workspace contained 9 projects, ~160 sample tasks, and reflected a complete ISO 9001 QMS structure for a mid-size IT/hosting company. All task content is illustrative — designed to guide users of the tool, not represent actual operations.*
