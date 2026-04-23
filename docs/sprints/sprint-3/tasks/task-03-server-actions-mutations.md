# Task: Server Actions — KPI Mutations + Audit Log

**Sprint:** 3
**Feature:** KPI Register — T03
**Complexity:** MEDIUM
**Estimated Tokens:** 70K
**Search Scope:** `src/app/actions/tasks.ts`

---

## Context

**Previous work:** `tasks.ts` establishes the auth/tenant/RBAC/interactive-transaction pattern.
**Current state:** No KPI server actions exist.
**Purpose:** `createKpi`, `addMeasurement`, `setRagOverride` with audit log in interactive transactions.

---

## Objective

Create `src/app/actions/kpis.ts` with mutation functions, RBAC guards, and audit log in interactive transactions.

---

## Acceptance Criteria

- [ ] `createKpi` uses interactive transaction; Worker forbidden
- [ ] `addMeasurement` uses interactive transaction; all roles allowed
- [ ] `setRagOverride` uses interactive transaction; Worker forbidden
- [ ] `computeRag` pure helper: null→AMBER, ≥target→GREEN, ≥80%→AMBER, <80%→RED
- [ ] `mapKpiToRow` helper resolves ragStatus and trendDirection
- [ ] `tsc --noEmit` passes

---

## Notes

- Interactive transaction required: `prisma.$transaction(async (tx) => { ... })`
- Worker role: forbidden for createKpi and setRagOverride
- Follow exact pattern from tasks.ts: createClient → getUser → resolveTenant → RBAC → transaction
