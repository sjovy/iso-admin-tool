# Sprint 2-Clear — Kanban Board Defect Fixes

| Field         | Value                                        |
|---------------|----------------------------------------------|
| Sprint ID     | 2-Clear                                      |
| Sprint Name   | Kanban Board Defect Fixes                    |
| Type          | Clear (fix only — no additions)              |
| Status        | CLOSED                                       |
| Token Budget  | ~40K EST                                     |
| Token Actual  | ~22K (T2C-1: 8K, T2C-2: 6K, T2C-3: 5K, T2C-4: 3K) |
| Closed        | 2026-04-20                                   |
| Goal          | Fix 3 defects in `src/app/actions/tasks.ts`  |

---

## Entry Criteria

- Sprint 2 closed ✓

---

## Exit Criteria

- `createTask` audit log `entityId` equals the created task's real UUID (verified via test)
- Worker calling `createTask` with `ownerId` ≠ their own user ID receives `{ success: false, error: { code: 'FORBIDDEN' } }`
- `moveTask` returns the same error shape regardless of whether the task is not found or the caller lacks permission — no information leakage between the two cases
- `tsc --noEmit` passes
- ESLint passes
- vitest passes — all 59+ existing tests still pass; new tests added by this sprint also pass

---

## Task List

| ID    | Name                                      | Complexity | Token EST | AFK/HITL |
|-------|-------------------------------------------|------------|-----------|----------|
| T2C-1 | Refactor createTask to interactive tx     | SIMPLE     | 12K       | AFK      |
| T2C-2 | Add Worker ownerId guard in createTask    | SIMPLE     | 10K       | AFK      |
| T2C-3 | Normalize moveTask not-found/forbidden    | SIMPLE     | 10K       | AFK      |
| T2C-4 | Run automated quality gates               | SIMPLE     | 8K        | AFK      |

**Total EST: 40K**

---

## Tasks

---

### T2C-1 — Refactor `createTask` to interactive transaction

**Complexity:** SIMPLE
**Estimated Tokens:** 12K
**Search Scope:** `src/app/actions/tasks.ts`

#### Description

`createTask` currently uses a Prisma batch transaction (`prisma.$transaction([op1, op2])`). In Prisma 7, batch transactions do not allow the output of `op1` to flow into `op2` — so the audit log `entityId` is hardcoded to `'pending'` (visible at `tasks.ts:122-123`).

Refactor to an interactive transaction (`prisma.$transaction(async (tx) => { ... })`): create the task first inside the callback, capture its `id`, then write the audit log using that real ID.

#### Acceptance Criteria

- [ ] `createTask` uses `prisma.$transaction(async (tx) => { ... })` — not the array form
- [ ] `auditLog.create` receives `entityId: createdTask.id` (a real UUID, not `'pending'`)
- [ ] Return type and shape of `createTask` are unchanged
- [ ] Existing test in `src/__tests__/board/task-mutations.test.ts` (`createTask audit log` describe block) is updated: the mock must verify `entityId` receives a real ID, not `'pending'`
- [ ] A new test asserts that `entityId` in the transaction callback equals the created task's `id`
- [ ] `tsc --noEmit` passes

#### Notes

- Interactive transaction pattern (from LEARNINGS.md):
  ```ts
  prisma.$transaction(async (tx) => {
    const entity = await tx.model.create(...)
    await tx.auditLog.create({ data: { entityId: entity.id, ... } })
    return entity
  })
  ```
- The `prisma` export in `src/lib/db/prisma.ts` is a lazy proxy — it delegates to `getPrismaClient()`. The `$transaction` method is available on it. No changes to `prisma.ts` are needed.
- The `include: { owner: ... }` clause that is currently on `prisma.task.create` must be preserved so `mapTaskToView` continues to receive the owner relation.
- The existing test at `tasks.ts:179-213` (describe `createTask audit log`) mocks `entityId: 'pending'` — update it to reflect the corrected behaviour after this fix.

---

### T2C-2 — Add Worker `ownerId` guard in `createTask`

**Complexity:** SIMPLE
**Estimated Tokens:** 10K
**Search Scope:** `src/app/actions/tasks.ts`

#### Description

`createTask` has no server-side check that a Worker's supplied `ownerId` matches their own user ID. A Worker can currently create a task assigned to any user. The fix: after authenticating the user, fetch their app role from `prisma.user`; if `role === 'worker'` and `input.ownerId !== user.id`, return `FORBIDDEN`.

This guard must be inserted before the Prisma transaction — after the `tenantId` and `moduleRecord` lookups are confirmed, but before any write.

#### Acceptance Criteria

- [ ] If caller role is `'worker'` and `input.ownerId` is set and `input.ownerId !== user.id`, `createTask` returns `{ success: false, error: { code: 'FORBIDDEN', message: '...' } }`
- [ ] If caller role is `'worker'` and `input.ownerId` is `null` or `undefined`, the call proceeds (unowned task creation is allowed)
- [ ] Non-Worker roles (management, company_admin, consultant) are unaffected — they may supply any `ownerId`
- [ ] A unit test covers: Worker with matching ownerId → allowed; Worker with mismatched ownerId → FORBIDDEN; non-Worker with any ownerId → allowed
- [ ] `tsc --noEmit` passes

#### Notes

- Pattern to follow: `moveTask` already performs an identical user role fetch at `tasks.ts:183-196`. Use the same `prisma.user.findUnique({ where: { id: user.id }, select: { role: true } })` call.
- If `appUser` is null after the lookup, return `FORBIDDEN` (user not in app users table) — consistent with `moveTask` at line 189.
- The guard must run before `prisma.$transaction` to avoid a partial write being rolled back on a predictable permission failure.

---

### T2C-3 — Normalize `moveTask` not-found/forbidden error response

**Complexity:** SIMPLE
**Estimated Tokens:** 10K
**Search Scope:** `src/app/actions/tasks.ts`

#### Description

`moveTask` currently returns two distinct error messages:
- `'NOT_FOUND'` with message `"Task '...' not found"` when the task does not exist or belongs to another tenant (line 179)
- `'FORBIDDEN'` with message `"Workers may only move tasks they own"` when the task exists but the Worker does not own it (line 193-196)

This differentiates a permission-denied case from a not-found case, which leaks information to the caller. The fix: unify both responses into a single shape. The recommended normalization is: return `NOT_FOUND` / `"Task not found or access denied"` for both cases (obscuring the distinction entirely).

#### Acceptance Criteria

- [ ] When a task does not exist or is in a different tenant, `moveTask` returns `{ success: false, error: { code: 'NOT_FOUND', message: 'Task not found or access denied' } }`
- [ ] When a Worker attempts to move a task they do not own, `moveTask` returns the same shape: `{ success: false, error: { code: 'NOT_FOUND', message: 'Task not found or access denied' } }`
- [ ] Non-Worker callers are unaffected — they still receive `NOT_FOUND` only if the task genuinely does not exist
- [ ] A unit test verifies both cases return the identical error shape
- [ ] `tsc --noEmit` passes

#### Notes

- Only the `code` and `message` fields of the error object need to change — the `ActionResult<BoardTask>` type is unchanged.
- The existing test `'Worker cannot move a task they do not own'` in `src/__tests__/board/task-mutations.test.ts` tests a pure `canMoveTask` helper — it does not test the action's error shape directly. That test can remain; add a separate test for the normalized response.
- Do not change the early `NOT_FOUND` guard for the tenant (`resolveTenant` result) — only normalize the task-level not-found and Worker-ownership-denied paths.

---

### T2C-4 — Run automated quality gates

**Complexity:** SIMPLE
**Estimated Tokens:** 8K
**Search Scope:** N/A

#### Description

After T2C-1, T2C-2, and T2C-3 are complete, run all three quality gate commands and confirm they pass.

#### Steps

1. Run `pnpm tsc --noEmit` — expect zero errors
2. Run `pnpm lint` (ESLint) — expect zero errors
3. Run `pnpm test` (vitest) — expect all 59+ existing tests to pass plus new tests added in this sprint

#### Acceptance Criteria

- [ ] `tsc --noEmit` exits 0
- [ ] ESLint exits 0
- [ ] vitest exits 0 — test count equals or exceeds 59; no regressions

#### Notes

- If `tsc` or ESLint fail, surface the exact error and stop — do not work around them.
- The rls.test.ts integration test requires live Supabase credentials. If run in an environment without `.env.local`, it will throw at import time. Confirm whether vitest config excludes it or runs it — do not skip it silently.

---

## Task Dependency Order

```
T2C-1  →  T2C-2  →  T2C-3  →  T2C-4
```

All three fixes are in the same file. Execute sequentially to avoid merge conflicts. T2C-4 runs last after all fixes are complete.

---

## HITL / AFK Summary

All four tasks are **AFK** — no Thomas interaction required during execution. The entire sprint can run autonomously.

---

## Token Budget Summary

| Task  | EST  |
|-------|------|
| T2C-1 | 12K  |
| T2C-2 | 10K  |
| T2C-3 | 10K  |
| T2C-4 | 8K   |
| **Total** | **40K** |

Budget ceiling: 40K EST / 180K sprint ceiling. Well within limits.

---

## Task Template Location

`.claude/skills/sprint-next/references/task-template.md`
