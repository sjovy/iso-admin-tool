# Task: Run automated quality gates

**Sprint:** 2-Clear
**Feature:** Kanban Board Defect Fixes
**Complexity:** SIMPLE
**Estimated Tokens:** 8K
**Search Scope:** N/A

---

## Context

**Previous work:** T2C-1, T2C-2, T2C-3 have modified `src/app/actions/tasks.ts` and `src/__tests__/board/task-mutations.test.ts`.

**Current state:** All three defects fixed. Quality gates not yet verified.

**Purpose:** Confirm the codebase compiles, lints, and tests pass before closing the sprint.

---

## Objective

Run all three quality gate commands and confirm zero errors and all tests pass (≥59 existing + new tests).

---

## Steps

1. Run `pnpm tsc --noEmit` — fix any type errors; loop until exit 0
2. Run `pnpm lint` — fix any ESLint errors; loop until exit 0
3. Run `pnpm test` — confirm all tests pass; count must be ≥59 plus new tests added this sprint
4. Record exact output (pass/fail + counts) in sprint report

---

## Acceptance Criteria

- [ ] `pnpm tsc --noEmit` exits 0 — zero errors
- [ ] `pnpm lint` exits 0 — zero errors
- [ ] `pnpm test` exits 0 — all existing tests pass; count ≥59 plus new sprint tests

---

## Verification

**Command:**
```bash
pnpm tsc --noEmit && pnpm lint && pnpm test
```

**Expected result:** All three commands exit 0.

---

## Notes

- If `tsc` or ESLint fail, surface the exact error and stop — do not work around them.
- `rls.test.ts` integration test requires live Supabase credentials. If `.env.local` is absent the test may throw at import time. Confirm vitest config excludes it or handles it — do not skip silently.
- TECH_STACK: `pnpm` only — never npm or yarn.

**Token tracking:** Record actual tokens in SPRINT_PLAN.md after completion.
