# Task: Vitest — Board State Logic and RBAC Filter

**Sprint:** 2
**Feature:** Board UI — T11
**Complexity:** SIMPLE
**Estimated Tokens:** 35K
**Search Scope:** `src/lib/board-utils.ts`, `src/__tests__/board/`

---

## Context

**Previous work:** T04 (rbac-filter.test.ts), T05 (task-mutations.test.ts), T08 (applyOptimisticMove in board-utils).
**Current state:** `rbac-filter.test.ts` and `task-mutations.test.ts` exist and pass. `isValidStatus` and `getValidStatuses` are tested. `groupTasksByStatus` and `applyOptimisticMove` added to `board-utils.ts` in T11.
**Purpose:** Verify pure board state functions. REQ exit criterion: vitest must pass.

---

## Objective

Add `groupTasksByStatus` and `applyOptimisticMove` pure functions to `src/lib/board-utils.ts`. Write comprehensive unit tests in `src/__tests__/board/board-state.test.ts`. Verify existing tests continue to pass.

---

## Steps

1. Add `groupTasksByStatus` and `applyOptimisticMove` to `src/lib/board-utils.ts`
2. Create `src/__tests__/board/board-state.test.ts` with tests for both functions
3. Confirm `pnpm vitest run src/__tests__/board/rbac-filter.test.ts` passes (pre-existing)
4. Confirm `pnpm vitest run src/__tests__/board/task-mutations.test.ts` passes (pre-existing)
5. Create `e2e/kanban.spec.ts` with file-existence and import stubs
6. Run `pnpm vitest run` — all 59 tests must pass

---

## Acceptance Criteria

- [x] `groupTasksByStatus([], 'STANDARD')` → 4 columns in correct order
- [x] `groupTasksByStatus([], 'EXTENDED')` → 6 columns in correct order
- [x] Tasks distributed to correct columns
- [x] `applyOptimisticMove`: task moves from source to target column
- [x] `applyOptimisticMove`: unchanged if task ID not found (same reference returned)
- [x] `isValidStatus` tests: 'verified' invalid for STANDARD, valid for EXTENDED
- [x] `buildTaskFilter` tests: existing rbac-filter.test.ts passes
- [x] `pnpm vitest run` — all 59 tests pass
- [x] No DB calls in any test

---

## Verification

```bash
pnpm vitest run
```

**Expected result:** 6 test files, 59 tests, all passing.

---

## Notes

- `isValidStatus` and `getValidStatuses` already tested in `task-mutations.test.ts` — not duplicated.
- `buildTaskFilter` already tested in `rbac-filter.test.ts` — not duplicated.
- `applyOptimisticMove` is also exported from `KanbanBoard.tsx` as a re-export from `board-utils`.

**Token tracking:** ~25K actual
**Status:** COMPLETE
