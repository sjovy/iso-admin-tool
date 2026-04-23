# Task: Server Actions — KPI Data Fetching

**Sprint:** 3
**Feature:** KPI Register — T04
**Complexity:** SIMPLE
**Estimated Tokens:** 35K
**Search Scope:** `src/app/actions/kpis.ts`

---

## Context

**Previous work:** T03 created mutations and helpers in kpis.ts.
**Current state:** `mapKpiToRow`, `computeRag` already exist from T03.
**Purpose:** Read-only actions for register list and detail view.

---

## Objective

Add `getKpiRegister` and `getKpiDetail` to `src/app/actions/kpis.ts`.

---

## Acceptance Criteria

- [ ] `getKpiRegister` returns all tenant KPIs sorted RED→AMBER→GREEN
- [ ] `getKpiDetail` verifies tenantId match before returning
- [ ] No RBAC filter on reads — all authenticated tenant users can view
- [ ] `tsc --noEmit` passes

---

## Notes

- Both implemented in the same T03 file in this sprint
