# Task: TypeScript Type Contracts for KPI Domain

**Sprint:** 3
**Feature:** KPI Register — T02
**Complexity:** SIMPLE
**Estimated Tokens:** 35K
**Search Scope:** `src/types/board.ts`

---

## Context

**Previous work:** `src/types/board.ts` defines `ActionResult<T>` — reuse it.
**Current state:** No KPI types exist.
**Purpose:** Type boundary between server actions and UI components. All KPI types live here.

---

## Objective

Create `src/types/kpi.ts` with all KPI view model and server action input types, reusing `ActionResult<T>` from board.ts.

---

## Acceptance Criteria

- [ ] All 8 interfaces/types exported
- [ ] `ActionResult<T>` imported from `@/types/board` (not redefined)
- [ ] No `any` types
- [ ] `tsc --noEmit` passes

---

## Notes

- `ragStatus` on `KpiRow` is always server-resolved — UI never computes RAG
- `trendDirection` is null when fewer than 2 measurements exist
