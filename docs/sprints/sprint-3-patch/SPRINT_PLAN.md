# Sprint 3-patch — KPI Register Defect Fixes

**Sprint ID:** 3-patch
**Type:** Feature (patch — correction sprint from Sprint 3 judge findings)
**Goal:** Fix the three security and exit-criteria failures identified by the Sprint 3 judge. No scope additions.
**REQ scope:** REQ-002
**Status:** CLOSED

---

## Tasks

| ID  | Title                                   | Complexity | EST    | Actual | Status    |
|-----|-----------------------------------------|------------|--------|--------|-----------|
| T01 | Tenant guard in all 5 kpis.ts functions | SIMPLE     | 35K    | 38K    | COMPLETED |
| T02 | KpiRow ragOverride + UI propagation     | SIMPLE     | 35K    | 22K    | COMPLETED |
| T03 | KpiWithMeasurements internal type cleanup | SIMPLE   | 15K    | 8K     | COMPLETED |

---

## Task T01 — Tenant Guard

```markdown
# Task: Add appUser.tenantId === tenantId guard to all 5 kpis.ts functions

**Sprint:** 3-patch
**Feature:** KPI Register Defect Fixes
**Complexity:** SIMPLE
**Estimated Tokens:** 35K
**Search Scope:** N/A — all changes are in src/app/actions/kpis.ts and src/__tests__/actions/kpis.test.ts

---

## Context

**Previous work:** Sprint 3 delivered kpis.ts with 5 exported server actions (createKpi, addMeasurement, setRagOverride, getKpiRegister, getKpiDetail). Sprint 3 judge Finding 5 identified that the appUser lookup selects only `role`, not `tenantId`. The TECH_STACK.md critical constraint requires every server action to assert `appUser.tenantId === tenantId` after user lookup — this assertion is missing from all 5 functions.

**Current state:**
- `src/app/actions/kpis.ts`: 5 exported functions. `createKpi` and `setRagOverride` call `prisma.user.findUnique` with `select: { role: true }` — `tenantId` is not fetched. `addMeasurement`, `getKpiRegister`, and `getKpiDetail` do not call `prisma.user.findUnique` at all (no appUser lookup).
- `src/__tests__/actions/kpis.test.ts`: 14 existing `it()` blocks covering createKpi (3), addMeasurement (3), setRagOverride (3), computeRag (5). No tenant-mismatch tests exist. Current total test count is 75 across all test files. Exit criteria requires ≥ 105.
- The `mockUserFindUnique` mock already exists in the test file — it must be extended, not replaced.

**Purpose:** TECH_STACK.md mandates tenant isolation on every server action. Without this guard a user authenticated to tenant A could read or write tenant B's KPIs if they construct a direct call.

---

## Objective

Add `appUser.tenantId === tenantId` assertion to all 5 exported functions in `src/app/actions/kpis.ts`, extend the Prisma user select to include `tenantId`, and write tests covering the cross-tenant rejection path for each function — bringing total test count to ≥ 105.

---

## Steps

1. Read `src/app/actions/kpis.ts` in full.
2. Read `src/__tests__/actions/kpis.test.ts` in full.
3. In `kpis.ts` — for `createKpi` and `setRagOverride`: change the `prisma.user.findUnique` select from `{ role: true }` to `{ role: true, tenantId: true }`. After the null-appUser guard, add: `if (appUser.tenantId !== tenantId) { return { success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } } }`.
4. In `kpis.ts` — for `addMeasurement`, `getKpiRegister`, and `getKpiDetail`: add a `prisma.user.findUnique` call (same pattern as `createKpi`) after the `resolveTenant` call. Select `{ tenantId: true }`. Guard with not-found check and `appUser.tenantId !== tenantId` check. Place before any Prisma KPI queries.
5. In `kpis.test.ts` — extend the `makeUser` fixture or `mockUserFindUnique` setup helper: add a `setupMgmtAuthWrongTenant()` helper that returns `{ role: 'management', tenantId: 'other-tenant-id' }` from `mockUserFindUnique` (TENANT_ID stays `'tenant-uuid-123'`; return `tenantId: 'wrong-tenant-id'`). The existing `setupMgmtAuth` and `setupWorkerAuth` must be updated to return `tenantId: TENANT_ID` in the user mock.
6. Add cross-tenant test cases: one `it()` per function (5 total) asserting `result.success === false` and `result.error.code === 'FORBIDDEN'` when the appUser's tenantId does not match. Place each test in the existing `describe` block for that function, except `getKpiRegister` and `getKpiDetail` which need new `describe` blocks created.
7. Count total `it()` blocks across all test files to confirm ≥ 105. Adjust count of tests if needed to hit threshold (add additional edge-case tests to the new describe blocks for getKpiRegister/getKpiDetail — unauthenticated and unknown-tenant scenarios are missing and should be added).
8. Run `pnpm tsc --noEmit` — expect 0 errors.
9. Run `pnpm lint` — expect 0 errors.
10. Run `pnpm test` — expect ≥ 105 passing.

---

## Patterns to Follow

- **Location:** `src/app/actions/kpis.ts:131-138` (createKpi's existing appUser block)
- **What it shows:** Pattern for `prisma.user.findUnique` lookup with guard and FORBIDDEN return
- **Apply to:** addMeasurement, getKpiRegister, getKpiDetail — add identical blocks after `resolveTenant`

- **Location:** `src/app/actions/tasks.ts` (referenced by kpis.ts header comment "Pattern mirrors tasks.ts exactly")
- **What it shows:** Canonical tenant guard pattern with `select: { role: true, tenantId: true }` and cross-tenant check
- **Apply to:** All 5 functions in kpis.ts

- **Location:** `src/__tests__/actions/kpis.test.ts:86-96` (setupMgmtAuth / setupWorkerAuth helpers)
- **What it shows:** Pattern for auth mock helpers
- **Apply to:** New `setupMgmtAuthWrongTenant()` helper and update existing helpers to include `tenantId`

---

## Acceptance Criteria

- [ ] All 5 functions in `kpis.ts` select `tenantId` from `prisma.user.findUnique`
- [ ] All 5 functions return `{ code: 'FORBIDDEN' }` when `appUser.tenantId !== tenantId`
- [ ] 5 new cross-tenant rejection tests present, one per function
- [ ] Existing `setupMgmtAuth` and `setupWorkerAuth` updated to return `tenantId: TENANT_ID`
- [ ] Total `it()` count across all test files ≥ 105
- [ ] `pnpm tsc --noEmit` passes with 0 errors
- [ ] `pnpm lint` passes with 0 errors
- [ ] `pnpm test` passes with ≥ 105 tests

---

## Verification

**Command:**
```bash
pnpm tsc --noEmit && pnpm lint && pnpm test --reporter=verbose 2>&1 | tail -20
```

**Expected result:** 0 TypeScript errors, 0 lint errors, all tests pass with count ≥ 105.

---

## Notes

- TECH_STACK.md: "CRITICAL: Every server action must assert `appUser.tenantId === tenantId` after user lookup"
- TECH_STACK.md: "Server action unit tests must mock `prisma` and call the real exported function — test-local simulations not acceptable"
- The `mockUserFindUnique` mock is already wired in the test file — do not recreate the `vi.mock` block. Only update what `mockUserFindUnique.mockResolvedValue()` returns inside helpers.
- `addMeasurement` currently has no `prisma.user.findUnique` call at all — it must be added. The function already verifies parent KPI tenant via `parentKpi.tenantId !== tenantId`, but the user-level check is still required per TECH_STACK.md.
- Keep the appUser lookup before any KPI queries so it short-circuits cheaply.

**Token tracking:** Record actual tokens in SPRINT_PLAN.md after completion.
```

---

## Task T02 — KpiRow ragOverride + UI Propagation

```markdown
# Task: Add ragOverride to KpiRow and propagate through RagBadge + RagOverrideControl

**Sprint:** 3-patch
**Feature:** KPI Register Defect Fixes
**Complexity:** SIMPLE
**Estimated Tokens:** 35K
**Search Scope:** N/A — all changes are in the 6 files listed below

---

## Context

**Previous work:** Sprint 3 delivered `KpiRow` without a `ragOverride` field. Sprint 3 judge Findings 2 and 3 identified: (2) `RagBadge` in `KpiRegisterTable` never receives `isOverride=true` because `KpiRow` carries no override signal; (3) `RagOverrideControl` is initialised from `kpi.ragStatus` (the resolved/computed value) instead of from `kpi.ragOverride`, so it cannot show "Auto" when no override is active.

**Current state:**
- `src/types/kpi.ts`: `KpiRow` has `ragStatus: RagStatus` (resolved) but no `ragOverride` field. `KpiDetail extends KpiRow`.
- `src/app/actions/kpis.ts` `mapKpiToRow`: computes `ragStatus` from override-or-computed but does not surface `ragOverride` in the returned object.
- `src/components/kpi/RagBadge.tsx`: accepts `status: RagStatus` and `isOverride?: boolean`. Renders "(manuellt)" or "(beräknad)" tooltip. Component is correct — the defect is that callers never pass `isOverride=true`.
- `src/components/kpi/KpiRegisterTable.tsx` line 64: `<RagBadge status={kpi.ragStatus} />` — `isOverride` not passed.
- `src/components/kpi/RagOverrideControl.tsx`: prop type `currentOverride: RagStatus` (not nullable). `useState` initialised to `currentOverride`. When no manual override is set, `currentOverride` receives `kpi.ragStatus` (a resolved non-null value), so the select never shows "Auto".
- `src/components/kpi/KpiDetailClient.tsx` line 31: `currentOverride={kpi.ragStatus}` — passes resolved status instead of raw override.

**Purpose:** Sprint 3 exit criteria require the register table badge to indicate manual-vs-computed status, and the override control to show "Auto" when no override is active. Both require the raw override value to flow from DB through the view model to the UI.

---

## Objective

Add `ragOverride: RagStatus | null` to `KpiRow`, populate it in `mapKpiToRow`, update `KpiRegisterTable` to pass `isOverride` correctly to `RagBadge`, fix `RagOverrideControl`'s prop type and init, and fix `KpiDetailClient` to pass `kpi.ragOverride` instead of `kpi.ragStatus`.

---

## Steps

1. Read `src/types/kpi.ts`, `src/app/actions/kpis.ts`, `src/components/kpi/RagBadge.tsx`, `src/components/kpi/RagOverrideControl.tsx`, `src/components/kpi/KpiDetailClient.tsx`, `src/components/kpi/KpiRegisterTable.tsx` in full.
2. In `src/types/kpi.ts`: add `ragOverride: RagStatus | null` to `KpiRow` after the `ragStatus` field. `KpiDetail extends KpiRow` so it inherits the field automatically — no change needed there.
3. In `src/app/actions/kpis.ts` `mapKpiToRow`: add `ragOverride: (kpi.ragOverride as RagStatus | null)` to the returned object. Place it after `ragStatus`. (The `as` cast here is intentional and acceptable until T03 removes it from the internal type — at that point it will not be needed.)
4. In `src/components/kpi/KpiRegisterTable.tsx`: change `<RagBadge status={kpi.ragStatus} />` to `<RagBadge status={kpi.ragStatus} isOverride={kpi.ragOverride !== null} />`.
5. In `src/components/kpi/RagOverrideControl.tsx`: change the `currentOverride` prop type from `RagStatus` to `RagStatus | null`. Change `useState<RagStatus | 'auto'>(currentOverride)` to `useState<RagStatus | 'auto'>(currentOverride ?? 'auto')`.
6. In `src/components/kpi/KpiDetailClient.tsx`: change `currentOverride={kpi.ragStatus}` to `currentOverride={kpi.ragOverride}`.
7. Run `pnpm tsc --noEmit` — expect 0 errors.
8. Run `pnpm lint` — expect 0 errors.
9. Run `pnpm test` — expect all tests pass (no new tests required for this task; T01 handles the count increase).

---

## Patterns to Follow

- **Location:** `src/types/kpi.ts:31-35` (existing KpiRow interface)
- **What it shows:** Field ordering convention in KpiRow — add `ragOverride` immediately after `ragStatus`
- **Apply to:** The new field insertion in KpiRow

- **Location:** `src/app/actions/kpis.ts:70-84` (mapKpiToRow return object)
- **What it shows:** The resolved `ragStatus` is already computed — add `ragOverride` as the raw DB value alongside it
- **Apply to:** Return object in mapKpiToRow

- **Location:** `src/components/kpi/RagOverrideControl.tsx:25-29` (OPTIONS array with 'auto')
- **What it shows:** 'auto' is already a valid select value — the init just needs to default to it when `currentOverride` is null
- **Apply to:** useState initialiser

---

## Acceptance Criteria

- [ ] `KpiRow.ragOverride: RagStatus | null` field present in `src/types/kpi.ts`
- [ ] `mapKpiToRow` returns `ragOverride` populated from `kpi.ragOverride`
- [ ] `KpiRegisterTable` passes `isOverride={kpi.ragOverride !== null}` to `RagBadge`
- [ ] `RagOverrideControl` prop `currentOverride` is typed `RagStatus | null`
- [ ] `RagOverrideControl` initialises state to `'auto'` when `currentOverride` is null
- [ ] `KpiDetailClient` passes `kpi.ragOverride` (not `kpi.ragStatus`) to `RagOverrideControl`
- [ ] `pnpm tsc --noEmit` passes with 0 errors
- [ ] `pnpm lint` passes with 0 errors
- [ ] `pnpm test` passes (all existing tests green)

---

## Verification

**Command:**
```bash
pnpm tsc --noEmit && pnpm lint && pnpm test
```

**Expected result:** 0 TypeScript errors, 0 lint errors, all tests pass.

---

## Notes

- LEARNINGS.md: "View model types must carry raw DB override values (not only resolved/computed values) when UI components need to distinguish between the two." — this task implements exactly that learning.
- `KpiDetail extends KpiRow` — adding the field to `KpiRow` is sufficient; no separate change needed in `KpiDetail`.
- The `as RagStatus | null` cast in `mapKpiToRow` step 3 is temporary; T03 will eliminate it by typing `KpiWithMeasurements.ragOverride` correctly.
- Do not change `RagBadge.tsx` — the component already accepts `isOverride?: boolean` and renders the correct tooltip. Only the callers need updating.
- `RagOverrideControl` rollback on error (`setSelected(currentOverride)`) — after making `currentOverride` nullable, this line must also handle null: change to `setSelected(currentOverride ?? 'auto')`.

**Token tracking:** Record actual tokens in SPRINT_PLAN.md after completion.
```

---

## Task T03 — KpiWithMeasurements Internal Type Cleanup

```markdown
# Task: Type KpiWithMeasurements enum fields correctly to eliminate as-casts

**Sprint:** 3-patch
**Feature:** KPI Register Defect Fixes
**Complexity:** SIMPLE
**Estimated Tokens:** 15K
**Search Scope:** N/A — single file: src/app/actions/kpis.ts

---

## Context

**Previous work:** T02 added `ragOverride` to `KpiRow` and used a temporary `as RagStatus | null` cast in `mapKpiToRow`. Sprint 3 judge Finding 8 identified that `KpiWithMeasurements` types `isoCategory` as `string` and `ragOverride` as `string | null`, forcing casts on both fields in `mapKpiToRow`. T03 must be executed after T02.

**Current state after T01 and T02:**
- `src/app/actions/kpis.ts` lines 31-47: `KpiWithMeasurements` internal type has `isoCategory: string` and `ragOverride: string | null`.
- `mapKpiToRow` return object (approx lines 73-85) contains: `isoCategory: kpi.isoCategory as IsoCategory` and `ragOverride: (kpi.ragOverride as RagStatus | null)`.
- The `ragStatus` computation at approx line 71: `(kpi.ragOverride as RagStatus | null) ?? computeRag(...)` — also uses a cast.
- All three casts will be eliminated when the internal type is corrected.

**Purpose:** Sprint 3 exit criteria explicitly require no `as IsoCategory` or `as RagStatus` casts in `mapKpiToRow`. Strict TypeScript mode makes these casts a signal of type mismatch between Prisma's inferred string and the domain union type. Aligning the internal type removes the mismatch at the boundary.

---

## Objective

Change `KpiWithMeasurements.isoCategory` from `string` to `IsoCategory` and `KpiWithMeasurements.ragOverride` from `string | null` to `RagStatus | null`, then remove all `as IsoCategory` and `as RagStatus` casts from `mapKpiToRow`.

---

## Steps

1. Read `src/app/actions/kpis.ts` in full (verify T01 and T02 changes are present before proceeding).
2. In the `KpiWithMeasurements` type (lines 31-47): change `isoCategory: string` to `isoCategory: IsoCategory`. Change `ragOverride: string | null` to `ragOverride: RagStatus | null`.
3. In `mapKpiToRow`: remove the `as IsoCategory` cast — change `isoCategory: kpi.isoCategory as IsoCategory` to `isoCategory: kpi.isoCategory`.
4. In `mapKpiToRow`: remove the `as RagStatus | null` cast from the ragStatus resolution line — change `(kpi.ragOverride as RagStatus | null) ?? computeRag(...)` to `kpi.ragOverride ?? computeRag(...)`.
5. In `mapKpiToRow`: remove the `as RagStatus | null` cast from the ragOverride field in the return object (added by T02) — change `ragOverride: (kpi.ragOverride as RagStatus | null)` to `ragOverride: kpi.ragOverride`.
6. Run `pnpm tsc --noEmit` — expect 0 errors. If TypeScript complains that `IsoCategory` or `RagStatus` is not assignable from the Prisma-inferred type, confirm `IsoCategory` and `RagStatus` are imported at the top of the file (they are, per the existing import block) — the internal type annotation overrides Prisma's string inference for this local type.
7. Run `pnpm lint` — expect 0 errors.
8. Run `pnpm test` — expect all tests pass.

---

## Patterns to Follow

- **Location:** `src/app/actions/kpis.ts:31-47` (KpiWithMeasurements type definition)
- **What it shows:** Where to make the type changes — two field type annotations
- **Apply to:** Replace `string` with the domain union types directly

- **Location:** `src/types/kpi.ts:6-14` (IsoCategory and RagStatus type definitions)
- **What it shows:** The union literals that the internal type fields must match
- **Apply to:** Confirm the values align before removing casts

---

## Acceptance Criteria

- [ ] `KpiWithMeasurements.isoCategory` typed as `IsoCategory` (not `string`)
- [ ] `KpiWithMeasurements.ragOverride` typed as `RagStatus | null` (not `string | null`)
- [ ] No `as IsoCategory` cast anywhere in `mapKpiToRow`
- [ ] No `as RagStatus` or `as RagStatus | null` cast anywhere in `mapKpiToRow`
- [ ] `pnpm tsc --noEmit` passes with 0 errors
- [ ] `pnpm lint` passes with 0 errors
- [ ] `pnpm test` passes (all tests green)

---

## Verification

**Command:**
```bash
pnpm tsc --noEmit && pnpm lint && pnpm test
```

**Expected result:** 0 TypeScript errors, 0 lint errors, all tests pass.

---

## Notes

- This task must run after T02. T02 adds `ragOverride` to the return object with a temporary cast — T03 removes that cast.
- TypeScript will accept `IsoCategory` and `RagStatus` annotations on the internal type even though Prisma's runtime query returns plain strings, because the internal type is a manually declared shape (not inferred from Prisma's generated types). The annotation narrows the type for downstream use without a runtime check — this is the correct pattern when the DB schema is the source of truth for the string values.
- Do not add runtime validation (e.g., `if (!Object.values(IsoCategory)...`) — the DB is trusted and the schema enforces the enum values via Prisma.
- TECH_STACK.md: TypeScript strict mode — `as` casts suppress strict checks and must be minimised.

**Token tracking:** Record actual tokens in SPRINT_PLAN.md after completion.
```

---

## Exit Criteria

- [x] `appUser.tenantId === tenantId` check present and tested in all 5 `kpis.ts` functions
- [x] `KpiRow.ragOverride` field present; `RagBadge` tooltip correctly shows "(manuellt)" vs "(beräknad)"; `RagOverrideControl` shows "Auto" when no override is set
- [x] No `as IsoCategory` or `as RagStatus` casts in `mapKpiToRow`
- [x] `tsc --noEmit`, ESLint, vitest pass (test count ≥ 105)

---

## Token Budget

| Task | EST    | Actual | Notes                                    |
|------|--------|--------|------------------------------------------|
| T01  | 35K    | ~38K   | Read 2 files, edit 2 files, add 30 tests |
| T02  | 35K    | ~22K   | Read 6 files, edit 6 files               |
| T03  | 15K    | ~8K    | Read 1 file, edit 1 file (3 cast removals) |
| Buffer | 40K  | ~10K   | Sprint buffer per token complexity table |
| **Total** | **125K** | **~78K** | **Well under 200K hard ceiling** |

Hard ceiling: 200K tokens per sprint. This sprint uses ~63% of ceiling.

---

## Execution Order

T01 → T02 → T03. T03 depends on T02 (it removes the temporary cast T02 introduces). T01 is independent of T02/T03.
