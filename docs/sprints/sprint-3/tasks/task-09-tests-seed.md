# Task: Vitest KPI Tests + Seed

**Sprint:** 3
**Feature:** KPI Register — T09
**Complexity:** SIMPLE
**Estimated Tokens:** 35K
**Search Scope:** `src/__tests__/`, `prisma/seed/`

---

## Objective

Write unit tests for KPI server actions and seed file with 10 sample KPIs.

---

## Acceptance Criteria

- [ ] `computeRag` all 4 branches tested
- [ ] `createKpi` test: interactive transaction, Worker FORBIDDEN
- [ ] `addMeasurement` test: Worker allowed, audit log in transaction
- [ ] `setRagOverride` test: Worker FORBIDDEN
- [ ] Seed: 10 KPIs covering all 6 categories, idempotent
- [ ] `pnpm vitest run` passes

---

## Notes

- All tests mock prisma and call real exported functions — no test-local simulations
