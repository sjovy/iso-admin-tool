# Task: Exit Criteria — Automated Gates

**Sprint:** 4
**Feature:** Quality Gate (Sprints 2–3) — Review
**Complexity:** SIMPLE
**Estimated Tokens:** 5K
**Search Scope:** N/A — runs commands only, no exploration

---

## Context

**Previous work:** Sprints 2 and 3 delivered kanban boards and KPI register. Sprint 3-patch added tenant guards and type safety fixes. 105 Vitest tests pass at Sprint 3 close.
**Current state:** Codebase at commit 83c093e. Entry criteria confirmed met (per SPRINT_PLAN.md). Area 5 code review complete — findings F-01 through F-04 recorded.
**Purpose:** Validate that the codebase compiles, lints, tests, and builds cleanly before manual test session proceeds. Gate on all five checks before marking Area 1 done.

---

## Objective

Run tsc, ESLint, Vitest, pnpm build, and smoke-test in order. Each must pass before the next runs. Record pass/fail in the Exit Criteria Checks table in SPRINT_PLAN.md.

---

## Steps

1. Run `npx tsc --noEmit` from project root. Fix all errors before proceeding.
2. Run `npx eslint src --max-warnings 0`. Fix all warnings and errors before proceeding.
3. Run `npx vitest run`. All tests must pass before proceeding.
4. Run `pnpm build`. Fix all build errors before proceeding.
5. Invoke the `smoke-test` skill. If any scenario fails, report to PMO and stop.
6. Update the Exit Criteria Checks table in SPRINT_PLAN.md with pass/fail results.

---

## Patterns to Follow

- **Location:** `docs/sprints/sprint-4/SPRINT_PLAN.md` — Exit Criteria Checks table
- **What it shows:** The five gates and their pass conditions
- **Apply to:** Record results in the Result column after each gate

---

## Acceptance Criteria

- [ ] `npx tsc --noEmit` exits zero errors
- [ ] `npx eslint src --max-warnings 0` exits zero warnings or errors
- [ ] `npx vitest run` — all tests pass
- [ ] `pnpm build` exits zero errors
- [ ] Smoke test — all scenarios pass
- [ ] Exit Criteria Checks table in SPRINT_PLAN.md updated with results

---

## Verification

**Command:**
```bash
npx tsc --noEmit && npx eslint src --max-warnings 0 && npx vitest run && pnpm build
```

**Expected result:** All commands exit 0. Smoke test skill reports all scenarios green.

---

## Notes

- TypeScript strict mode — `tsc --noEmit` must pass with zero errors
- ESLint: zero warnings or errors required (`--max-warnings 0`)
- Vitest: `vi.resetAllMocks()` is correct in beforeEach, not `vi.clearAllMocks()`
- `pnpm build` is a hard gate — catches Turbopack and build-time errors that tsc alone misses
- Never use npm or yarn — pnpm only
- Fix-verify loop on each gate before proceeding to the next

**Token tracking:** Record actual tokens in SPRINT_PLAN.md after completion.
