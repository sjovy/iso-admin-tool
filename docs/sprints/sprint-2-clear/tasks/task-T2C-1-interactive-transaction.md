# Task: Refactor createTask to interactive transaction

**Sprint:** 2-Clear
**Feature:** Kanban Board Defect Fixes
**Complexity:** SIMPLE
**Estimated Tokens:** 12K
**Search Scope:** `src/app/actions/tasks.ts`

---

## Context

**Previous work:** Sprint 2 T05 implemented `createTask` using `prisma.$transaction([op1, op2])` (batch form). The audit log `entityId` was hardcoded to `'pending'` because in Prisma 7 batch transactions don't allow op1's output to flow into op2.

**Current state:** `src/app/actions/tasks.ts` lines 103–132 contain the batch transaction. `src/__tests__/board/task-mutations.test.ts` lines 179–213 test the `createTask audit log` describe block with `entityId: 'pending'`.

**Purpose:** Fix the audit log so it records the real task UUID instead of `'pending'`. Required for LEARNINGS.md interactive transaction pattern.

---

## Objective

Replace the batch `prisma.$transaction([op1, op2])` in `createTask` with an interactive `prisma.$transaction(async (tx) => { ... })` so `auditLog.create` receives the real task `id`.

---

## Steps

1. Read `src/app/actions/tasks.ts` lines 101–134
2. Replace the batch transaction block with an interactive transaction that:
   - Calls `tx.task.create(...)` and captures the result
   - Calls `tx.auditLog.create({ data: { entityId: createdTask.id, ... } })`
   - Returns `createdTask`
3. Read `src/__tests__/board/task-mutations.test.ts` lines 174–214
4. Update the `createTask audit log` describe block to use an async callback pattern (interactive transaction) and verify `entityId` receives the real task id (not `'pending'`)
5. Add a new test asserting `entityId` in the callback equals the created task's `id`
6. Run `pnpm tsc --noEmit` — expect zero errors

---

## Patterns to Follow

- **Location:** `src/app/actions/tasks.ts:213–234` (moveTask's batch transaction — same file, same pattern)
- **What it shows:** Batch transaction for update + audit log
- **Apply to:** `createTask` — but use interactive form so ID is available

Interactive transaction pattern (LEARNINGS.md):
```ts
prisma.$transaction(async (tx) => {
  const entity = await tx.model.create(...)
  await tx.auditLog.create({ data: { entityId: entity.id, ... } })
  return entity
})
```

---

## Acceptance Criteria

- [ ] `createTask` uses `prisma.$transaction(async (tx) => { ... })` — not the array form
- [ ] `auditLog.create` receives `entityId: createdTask.id` (a real UUID, not `'pending'`)
- [ ] Return type and shape of `createTask` are unchanged
- [ ] Existing test `createTask audit log` is updated to reflect corrected behaviour
- [ ] New test asserts `entityId` equals created task's `id`
- [ ] `pnpm tsc --noEmit` passes

---

## Verification

**Command:**
```bash
pnpm tsc --noEmit && pnpm test --reporter=verbose 2>&1 | tail -40
```

**Expected result:** Zero tsc errors; new test passes alongside existing tests.

---

## Notes

- The `include: { owner: ... }` clause must be preserved on `tx.task.create` so `mapTaskToView` receives the owner relation.
- The `prisma` export in `src/lib/db/prisma.ts` is a lazy proxy — `$transaction` is available on it without changes.
- TECH_STACK: Interactive transactions — use `prisma.$transaction(async (tx) => { ... })`. Never batch when created entity ID is needed.

**Token tracking:** Record actual tokens in SPRINT_PLAN.md after completion.
