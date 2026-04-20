# Task: Normalize moveTask not-found/forbidden error response

**Sprint:** 2-Clear
**Feature:** Kanban Board Defect Fixes
**Complexity:** SIMPLE
**Estimated Tokens:** 10K
**Search Scope:** `src/app/actions/tasks.ts`

---

## Context

**Previous work:** Sprint 2 T05 implemented `moveTask` returning distinct error codes: `NOT_FOUND` for missing task and `FORBIDDEN` for Worker ownership failure. This leaks information — callers can infer whether a task exists based on the error code.

**Current state:** `src/app/actions/tasks.ts` lines 178–179 return `NOT_FOUND` / `"Task '...' not found"`. Lines 193–196 return `FORBIDDEN` / `"Workers may only move tasks they own"`.

**Purpose:** Unify both into `NOT_FOUND` / `"Task not found or access denied"` to prevent information leakage.

---

## Objective

Change the Worker-ownership-denied response in `moveTask` (lines 193–196) from `FORBIDDEN` to `NOT_FOUND` with message `"Task not found or access denied"`, and update the task-not-found response (line 179) to use the same unified message.

---

## Steps

1. Read `src/app/actions/tasks.ts` lines 170–200
2. Change line 179: update message from `"Task '${input.taskId}' not found"` to `"Task not found or access denied"`
3. Change lines 193–196: change `code: 'FORBIDDEN'` to `code: 'NOT_FOUND'` and message to `"Task not found or access denied"`
4. Add unit tests in `src/__tests__/board/task-mutations.test.ts` verifying:
   - Task not found case returns `{ code: 'NOT_FOUND', message: 'Task not found or access denied' }`
   - Worker-ownership-denied case returns identical shape
5. Run `pnpm tsc --noEmit` — expect zero errors

---

## Patterns to Follow

- **Location:** `src/app/actions/tasks.ts:178–196`
- **What it shows:** Current two-branch error returns
- **Apply to:** Unify both to single `NOT_FOUND` shape

---

## Acceptance Criteria

- [ ] Task not found → `{ success: false, error: { code: 'NOT_FOUND', message: 'Task not found or access denied' } }`
- [ ] Worker owns another user's task → same identical shape as above
- [ ] Non-Worker callers still receive `NOT_FOUND` for genuinely missing tasks
- [ ] The early `resolveTenant` `NOT_FOUND` guard is unchanged
- [ ] Unit tests verify both cases produce identical error shape
- [ ] `pnpm tsc --noEmit` passes

---

## Verification

**Command:**
```bash
pnpm tsc --noEmit && pnpm test --reporter=verbose 2>&1 | tail -40
```

**Expected result:** Zero tsc errors; new tests pass; existing `canMoveTask` tests unchanged.

---

## Notes

- The existing `canMoveTask` pure-function tests (lines 91–115) are unaffected — they test a local helper, not the action's error shape.
- Only `code` and `message` fields change — `ActionResult<BoardTask>` type is unchanged.
- TECH_STACK: TypeScript strict mode — no type changes needed, string literals match existing union type.

**Token tracking:** Record actual tokens in SPRINT_PLAN.md after completion.
