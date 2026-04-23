# Sprint Plan — Sprint 3: KPI Register
**Status:** CLOSED
**Goal:** Each tenant has a KPI register with structured entries, RAG status, and measurement logging. Covers ISO Clause 9.1 mandated measurement categories.
**REQ scope:** REQ-002 (Mäta & Utvärdera module), REQ-008 (traceability foundation — KPI → Corrective Action link stub)
**Token budget:** 135K EST / ~130K actual

**Gates:** tsc PASS | ESLint PASS | vitest PASS (105 tests, +35 new)
**Judge disposition:** Sprint 3-patch inserted — see judge findings below.

### Judge findings requiring Sprint 3-patch
- Finding 2/3 (major): RAG badge `isOverride` never passed to component; `RagOverrideControl` initialises from resolved status — exit criterion not met
- Finding 5 (major/security): Cross-tenant write vulnerability — user `tenantId` not verified in `kpis.ts` server actions

### Judge findings carried as open blockers
- Finding 4 (major): `kpis` table missing `@@unique([tenantId, name])` — seed non-atomic

### Judge findings to LEARNINGS only
- Finding 1 (minor): `computeRag` exported contrary to T03 note (benign — plan self-contradictory)
- Finding 6 (minor): Seed idempotency comment overstates guarantee
- Finding 7 (minor): Worker can clear `ownerId: null` on tasks they do not own — policy undefined
- Finding 8 (minor): `KpiWithMeasurements` internal type uses `string` for enum fields

---

## Tasks

### T01 — KPI & KPIMeasurement Prisma Schema + RLS + Migration
**Complexity:** MEDIUM
**Token EST:** 70K
**Token actual:** (see sprint total)
**Files touched:**
- `prisma/schema.prisma`
- `src/generated/prisma/` (regenerated)
**Exit criteria:**
- `Kpi` and `KpiMeasurement` models present in schema with all fields listed below
- Migration applied via Supabase MCP `apply_migration`
- RLS enabled on both tables; `tenant_id` policy in place (verified via `pg_class.relrowsecurity`)
- `prisma generate` and `tsc --noEmit` pass

**KPI model fields:**
- `id` (UUID PK)
- `tenantId` (FK → Tenant)
- `name` (String)
- `description` (String, nullable)
- `unit` (String) — e.g. "%" or "st"
- `target` (Float)
- `isoCategory` (Enum: `conformity | customer_satisfaction | qms_performance | risk | supplier | improvement`)
- `ragOverride` (Enum: `RED | AMBER | GREEN`, nullable) — manual override; null = computed from latest measurement
- `linkedCorrectiveActionId` (String, nullable) — stub field; populated in Sprint 5
- `createdAt`, `updatedAt`

**KPIMeasurement model fields:**
- `id` (UUID PK)
- `kpiId` (FK → Kpi)
- `tenantId` (FK → Tenant) — denormalised for RLS
- `actual` (Float)
- `measuredAt` (DateTime)
- `notes` (String, nullable)
- `createdAt` — no `updatedAt`; records are append-only (immutability enforced by absence of UPDATE permission in RLS)

**RLS policies:**
- `kpis`: authenticated users in matching `tenant_id` may SELECT/INSERT/UPDATE/DELETE
- `kpi_measurements`: SELECT/INSERT allowed; UPDATE/DELETE denied (append-only)

**Notes:**
- Use `@default(uuid())` for PK, `@map(...)` for snake_case column names — consistent with existing schema
- Add `Kpi[]` relation to `Tenant` in schema
- `isoCategory` becomes a Prisma `enum IsoCategory` — avoids free-text drift
- No `name` field on User (carry-forward) — display email as actor name wherever needed

---

### T02 — TypeScript type contracts for KPI domain
**Complexity:** SIMPLE
**Token EST:** 35K
**Token actual:** (see sprint total)
**Files touched:**
- `src/types/kpi.ts` (new)
**Exit criteria:**
- All view model and server action input types exported
- No `any` — strict TypeScript throughout
- `tsc --noEmit` passes

**Types to define:**
```typescript
export type IsoCategory =
  | 'conformity' | 'customer_satisfaction' | 'qms_performance'
  | 'risk' | 'supplier' | 'improvement'

export type RagStatus = 'RED' | 'AMBER' | 'GREEN'

export interface KpiMeasurementEntry {
  id: string
  actual: number
  measuredAt: string       // ISO 8601
  notes: string | null
  createdAt: string
}

export interface KpiRow {
  id: string
  name: string
  description: string | null
  unit: string
  target: number
  isoCategory: IsoCategory
  ragStatus: RagStatus      // computed or override — resolved server-side
  latestActual: number | null
  trendDirection: 'up' | 'down' | 'flat' | null
  linkedCorrectiveActionId: string | null
}

export interface KpiDetail extends KpiRow {
  measurements: KpiMeasurementEntry[]
}

export interface CreateKpiInput {
  name: string
  description?: string
  unit: string
  target: number
  isoCategory: IsoCategory
}

export interface AddMeasurementInput {
  kpiId: string
  actual: number
  measuredAt: string
  notes?: string
}

export interface SetRagOverrideInput {
  kpiId: string
  override: RagStatus | null   // null clears the override → reverts to computed
}

export interface ActionResult<T> {
  success: true; data: T
} | {
  success: false; error: { code: string; message: string }
}
```

**Notes:**
- `ActionResult<T>` matches the discriminated union pattern already in `src/types/board.ts` — import from there if already exported, otherwise define here to avoid duplication (agent must check first)
- `ragStatus` on `KpiRow` is always resolved — UI never computes RAG logic, server does it once

---

### T03 — Server actions: KPI mutations + audit log
**Complexity:** MEDIUM
**Token EST:** 70K
**Token actual:** (see sprint total)
**Files touched:**
- `src/app/actions/kpis.ts` (new)
**Exit criteria:**
- `createKpi`, `addMeasurement`, `setRagOverride` exported and typed
- Every mutation uses `prisma.$transaction(async (tx) => { ... })` (interactive form) — audit log entry captures real entity UUID
- RBAC enforced server-side: Worker cannot call `createKpi` or `setRagOverride` (management/company_admin only); Worker may call `addMeasurement`
- `tsc --noEmit` passes

**Functions:**

`createKpi(tenantSlug, input: CreateKpiInput): Promise<ActionResult<KpiRow>>`
- Auth check → tenant resolve → RBAC (Worker forbidden)
- Interactive transaction: create `Kpi`, then `AuditLog` with `entityId: kpi.id`
- Returns mapped `KpiRow`

`addMeasurement(tenantSlug, input: AddMeasurementInput): Promise<ActionResult<KpiMeasurementEntry>>`
- Auth check → tenant resolve → fetch parent Kpi (verify `tenantId` match)
- Interactive transaction: create `KpiMeasurement`, then `AuditLog`
- Returns created measurement entry

`setRagOverride(tenantSlug, input: SetRagOverrideInput): Promise<ActionResult<KpiRow>>`
- Auth check → tenant resolve → RBAC (Worker forbidden)
- Batch transaction acceptable here — `kpiId` is known pre-transaction; no UUID capture needed
- Updates `ragOverride`; audit log records `{ kpiId, override }`
- Returns updated `KpiRow` (with recomputed `ragStatus` reflecting new override)

**Internal helper (not exported):**

`computeRag(target: number, actual: number | null): RagStatus`
- `actual === null` → `AMBER`
- `actual >= target` → `GREEN`
- `actual >= target * 0.8` → `AMBER`
- `actual < target * 0.8` → `RED`
- Pure function — unit testable without DB

`mapKpiToRow(kpi, measurements): KpiRow`
- Resolves `ragStatus`: `ragOverride ?? computeRag(target, latestActual)`
- Computes `trendDirection` from last two measurements (if ≥ 2 exist)

**Notes:**
- Follow the exact pattern in `src/app/actions/tasks.ts`: `createClient()` → `supabase.auth.getUser()` → `resolveTenant()` → RBAC check → transaction
- `updateTask` RBAC gap: in this same file do NOT replicate that gap. Worker RBAC check must be present before any write.

---

### T04 — Server actions: KPI data fetching
**Complexity:** SIMPLE
**Token EST:** 35K
**Token actual:** (see sprint total)
**Files touched:**
- `src/app/actions/kpis.ts` (extends T03 file)
**Exit criteria:**
- `getKpiRegister` and `getKpiDetail` exported and typed
- Both return resolved `ragStatus` (no RAG computation in UI)
- `tsc --noEmit` passes

**Functions:**

`getKpiRegister(tenantSlug): Promise<ActionResult<KpiRow[]>>`
- Returns all KPIs for tenant with latest measurement resolved
- Includes `trendDirection` computed from last two measurements
- Sorted: RED first, then AMBER, then GREEN (urgency order)

`getKpiDetail(tenantSlug, kpiId): Promise<ActionResult<KpiDetail>>`
- Returns single KPI with full measurement history (newest first)
- Verifies `kpi.tenantId === resolvedTenantId` before returning

**Notes:**
- Both read functions: no RBAC filter — all authenticated tenant users can view all KPIs
- `getKpiDetail` measurement history is append-only by DB constraint; no delete UI is needed and no soft-delete logic required

---

### T05 — KPI register page (list view)
**Complexity:** MEDIUM
**Token EST:** 70K
**Token actual:** (see sprint total)
**Files touched:**
- `src/app/[tenantSlug]/kpis/page.tsx` (new)
- `src/components/kpi/KpiRegisterTable.tsx` (new)
- `src/components/kpi/RagBadge.tsx` (new)
- `src/components/kpi/IsoCategoryTag.tsx` (new)
- `src/components/kpi/CoverageIndicator.tsx` (new)
**Exit criteria:**
- Page accessible from tenant dashboard at `/[tenantSlug]/kpis`
- Table shows: KPI name, unit, target, latest actual, trend arrow, RAG badge, ISO category tag
- Coverage indicator shows count of covered / 6 ISO 9.1 categories (a category is covered if ≥ 1 KPI exists for it)
- Clicking a row navigates to `/[tenantSlug]/kpis/[kpiId]`
- Server Component page; no `"use client"` on `page.tsx`
- `tsc --noEmit` and ESLint pass

**UI spec:**
- RAG badge: solid circle — red/amber/green Tailwind colors; tooltip shows computed vs override status
- Trend arrow: `↑` green / `↓` red / `→` grey; hidden if fewer than 2 measurements
- Coverage indicator: `■■■□□□ 3 / 6 categories covered` — each filled square = a category with ≥ 1 KPI
- ISO category tag: small pill using shadcn `Badge` variant, one of 6 fixed labels in Swedish:
  - `conformity` → "Produktöverensstämmelse"
  - `customer_satisfaction` → "Kundnöjdhet"
  - `qms_performance` → "KSM-prestanda"
  - `risk` → "Risk"
  - `supplier` → "Leverantör"
  - `improvement` → "Förbättring"

**Notes:**
- Use shadcn `Table` component for the register list
- `CoverageIndicator` is a pure component receiving `coveredCategories: IsoCategory[]` — no server call
- Add dashboard link to KPI register in `src/app/[tenantSlug]/page.tsx` (or wherever the dashboard nav exists)

---

### T06 — KPI detail page + add measurement modal
**Complexity:** SIMPLE
**Token EST:** 35K
**Token actual:** (see sprint total)
**Files touched:**
- `src/app/[tenantSlug]/kpis/[kpiId]/page.tsx` (new)
- `src/components/kpi/AddMeasurementModal.tsx` (new)
- `src/components/kpi/MeasurementHistory.tsx` (new)
**Exit criteria:**
- Detail page renders all KPI fields and full measurement history (newest first)
- "Add measurement" button opens modal; submitting calls `addMeasurement` server action
- After successful submission, page re-renders (or optimistic update) showing new measurement and updated RAG badge
- History is read-only — no delete or edit controls present
- `tsc --noEmit` passes

**Modal fields:**
| Field | Input | Required |
|-------|-------|----------|
| Actual value | Number input | Yes |
| Measured on | Date picker | Yes (defaults to today) |
| Notes | Textarea | No |

**Notes:**
- `<Toaster />` already in `src/app/layout.tsx` — use `sonner` `toast()` for success/error feedback; do not add another Toaster
- Date picker: use shadcn `Popover` + `Calendar` pattern (same as Sprint 2 task detail)
- Measurement history: shadcn `Table`, rows not clickable

---

### T07 — RAG auto-compute + manual override UI
**Complexity:** SIMPLE
**Token EST:** 35K
**Token actual:** (see sprint total)
**Files touched:**
- `src/components/kpi/RagOverrideControl.tsx` (new)
- `src/app/actions/kpis.ts` (extends — `setRagOverride` already written in T03; this task wires the UI)
**Exit criteria:**
- KPI detail page shows a "Override RAG" control (management/company_admin only — hidden for Worker role)
- Selecting a RAG status calls `setRagOverride`; selecting "Auto" clears the override (`override: null`)
- RAG badge on both register and detail page reflects override correctly
- `computeRag` logic verified: ≥100% → GREEN, 80–99% → AMBER, <80% → RED; no measurement → AMBER
- `tsc --noEmit` passes

**Notes:**
- RBAC for the override UI: read the current user's role from server (pass as prop from Server Component); render control only if role is `management` or `company_admin`
- `computeRag` is a pure exported function in `src/app/actions/kpis.ts` — do not duplicate it in the component

---

### T08 — `updateTask` Worker RBAC guard (Sprint 2-Clear carry-forward)
**Complexity:** SIMPLE
**Token EST:** 35K
**Token actual:** (see sprint total)
**Files touched:**
- `src/app/actions/tasks.ts`
- `src/__tests__/actions/tasks.test.ts` (existing or new)
**Exit criteria:**
- `updateTask` fetches the caller's role before applying update
- If `role === 'worker'` and `input.ownerId !== undefined` and `input.ownerId !== user.id`: return `{ success: false, error: { code: 'FORBIDDEN', ... } }`
- Unit test: mock `prisma`, call the real exported `updateTask`, assert FORBIDDEN for Worker reassigning `ownerId`
- Unit test: assert Worker can update own task's `title`/`description` (non-owner fields)
- `tsc --noEmit` and vitest pass

**Notes:**
- Test pattern: `import { updateTask } from '@/app/actions/tasks'` — mock `prisma` module, NOT a test-local simulation. Reject any approach that does not exercise the real function.
- This is a carry-forward from Sprint 2-Clear judge finding (MAJOR defect). It is small but non-negotiable before sprint exits.

---

### T09 — Vitest: KPI server action unit tests + seed
**Complexity:** SIMPLE
**Token EST:** 35K
**Token actual:** (see sprint total)
**Files touched:**
- `src/__tests__/actions/kpis.test.ts` (new)
- `prisma/seed/kpis.ts` (new) — 10 sample KPIs for new tenants
- `prisma/seed/index.ts` (extend to call KPI seed)
**Exit criteria:**
- `createKpi` test: mocked `prisma`, real exported function; asserts KPI created + audit log written in same transaction
- `addMeasurement` test: asserts measurement created + audit log written; asserts Worker role is allowed
- `setRagOverride` test: asserts Worker role returns FORBIDDEN
- `computeRag` tests: all four branches (null, ≥100%, 80–99%, <80%)
- Seed: 10 sample KPIs covering all 6 ISO categories; `pnpm prisma db seed` runs without error; idempotent (upsert on `tenantId + name`)
- `pnpm vitest run` passes; `tsc --noEmit` passes

**Sample KPIs (covers all 6 categories):**

| Name | Category | Unit | Target |
|------|----------|------|--------|
| Produktreklamationer per kvartal | conformity | st | 2 |
| Kundnöjdhetsindex (NPS) | customer_satisfaction | poäng | 50 |
| Internrevisionens genomförandegrad | qms_performance | % | 100 |
| Öppna risker med hög allvarlighet | risk | st | 0 |
| Leverantörsutvärdering — godkänd andel | supplier | % | 90 |
| Avslutade förbättringsärenden per kvartal | improvement | st | 5 |
| Kundklagomål — svarstid inom SLA | customer_satisfaction | % | 95 |
| Processefterlevnad — interna revisioner | conformity | % | 95 |
| Leveransprecision från leverantörer | supplier | % | 98 |
| Riskminskningsåtgärder genomförda | risk | % | 80 |

**Notes:**
- Test pattern: mock `prisma`, call real exported function — no test-local simulations (LEARNINGS carry-forward, critical)
- `computeRag` is pure — test without any mocking

---

## Sprint Total
**EST:** 35K + 70K + 70K + 35K + 70K + 35K + 35K + 35K + 35K = 420K raw task sum
**Active context budget (single-track sequential):** 135K EST + 40K buffer = **175K ceiling**
**Actual:** ~130K (T01:18K T02:6K T03:18K T04:8K T05:22K T06:20K T07:10K T08:12K T09:16K)
**Budget ceiling:** 200K

> **Budget note:** The PMO set 135K EST in IMPLEMENTATION_PLAN.md. The raw task sum of 420K reflects individual task budgets; this is a single-track sprint where tasks run sequentially in one agent session, not parallel tracks. The active context budget for sequential execution is lower than the raw sum because earlier completed tasks leave context, but it is still higher than 135K given 9 tasks at SIMPLE/MEDIUM complexity. The sprint plan honors 135K as the target. If the executing agent exhausts 135K before T09, it should stop at the natural task boundary and flag remaining tasks for a follow-up session rather than silently cutting scope.

---

## Entry Criteria
- Sprint 2 exit criteria met:
  - All 9 ISO 9001 modules appear on tenant dashboard
  - Tasks can be created, edited, and moved between columns
  - Worker sees only own tasks; Management/Admin see all
  - Audit log records all task mutations
  - `tsc --noEmit`, ESLint, vitest pass
- Sprint 2-Clear exit criteria met:
  - `createTask` uses interactive transaction for audit log `entityId`
  - Worker `ownerId` guard present in `createTask`
  - `updateTask` Worker RBAC guard present (T08 in this sprint covers the remaining gap)

---

## Exit Criteria
- KPI register accessible from tenant dashboard at `/[tenantSlug]/kpis`
- Measurements can be added; history is immutable (append-only enforced by RLS — no UPDATE/DELETE on `kpi_measurements`)
- RAG status displays correctly on register and detail pages; auto-updates after new measurement added
- Coverage indicator shows which of the 6 ISO 9.1 categories have at least one KPI
- `updateTask` Worker RBAC guard in place; unit tested
- `tsc --noEmit`, ESLint, `pnpm vitest run` all pass

---

## HITL Sessions Required

| Session | Trigger | What Thomas does |
|---------|---------|-----------------|
| RAG visual check | After T05 complete | Load KPI register; confirm RAG badges and coverage indicator render correctly with seed data |
| Full sprint sign-off | After T09 (all gates green) | Confirm exit criteria met; mark sprint CLOSED |

All other tasks are AFK.

---

## Dependency Graph

```
T01 ──► T02 ──► T03 ──► T04 ──► T05 ──► T06 ──► T07
                                                    │
                                                    ▼
                                          T08 ──► T09
```

T01 → T02: types require schema to be stable
T02 → T03: server actions import from `src/types/kpi.ts`
T03 → T04: both live in the same file; T04 helpers reuse T03 internals (`mapKpiToRow`, `computeRag`)
T04 → T05: register page calls `getKpiRegister`
T05 → T06: detail page follows register page routing
T06 → T07: override control extends the detail page
T07 → T09: all actions under test must be fully implemented; seed runs after schema is stable
T08: independent of KPI chain — can run after T03 (no KPI dependency); placed before T09 so RBAC test is captured in the same vitest run

---

## Open Questions
None. Scope defined by PMO; carry-forwards from LEARNINGS incorporated.
