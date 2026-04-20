# Task: Add Worker ownerId guard in createTask

**Sprint:** 2-Clear
**Feature:** Kanban Board Defect Fixes
**Complexity:** SIMPLE
**Estimated Tokens:** 10K
**Search Scope:** `src/app/actions/tasks.ts`

---

## Context

**Previous work:** Sprint 2 T05 implemented `createTask` with no server-side role check on `ownerId`. A Worker can currently create a task assigned to any user ID.

**Current state:** After T2C-1 the file uses an interactive transaction. The `moveTask` action (lines 183–196) already performs a `prisma.user.findUnique` role fetch as the RBAC pattern.

**Purpose:** Enforce that Workers cannot assign tasks to other users. Required by LEARNINGS.md Worker RBAC gap entry.

---

## Objective

After the tenant/module lookups in `createTask`, fetch the caller's app role and return `FORBIDDEN` if role is `'worker'` and `input.ownerId` is set to a different user ID.

---

## Steps

1. Read `src/app/actions/tasks.ts` lines 60–138 (post T2C-1 state)
2. After the `isValidStatus` check and before `const dueDate = ...`, insert:
   - `prisma.user.findUnique({ where: { id: user.id }, select: { role: true } })`
   - If `appUser` is null → return FORBIDDEN
   - If `appUser.role === 'worker' && input.ownerId && input.ownerId !== user.id` → return FORBIDDEN
3. Add unit tests in `src/__tests__/board/task-mutations.test.ts`:
   - Worker with matching ownerId → allowed (proceeds past guard)
   - Worker with mismatched ownerId → FORBIDDEN
   - Worker with null ownerId → allowed
   - Non-Worker (management) with any ownerId → allowed
4. Run `pnpm tsc --noEmit` — expect zero errors

---

## Patterns to Follow

- **Location:** `src/app/actions/tasks.ts:183–196` (moveTask RBAC check)
- **What it shows:** Role fetch pattern — `prisma.user.findUnique` then role conditional
- **Apply to:** `createTask` — identical pattern, different condition

---

## Acceptance Criteria

- [ ] Worker with `ownerId !== user.id` → `{ success: false, error: { code: 'FORBIDDEN' } }`
- [ ] Worker with `ownerId === null/undefined` → proceeds normally
- [ ] Non-Worker roles with any `ownerId` → unaffected
- [ ] Guard runs before `prisma.$transaction` to avoid partial writes
- [ ] Unit tests cover all three cases
- [ ] `pnpm tsc --noEmit` passes

---

## Verification

**Command:**
```bash
pnpm tsc --noEmit && pnpm test --reporter=verbose 2>&1 | tail -40
```

**Expected result:** Zero tsc errors; all new tests pass.

---

## Notes

- If `appUser` is null (user not in app users table) → return FORBIDDEN consistent with `moveTask` line 189.
- TECH_STACK: TypeScript strict mode — handle null/undefined explicitly.
- DECISIONS.md DEC-004: RLS + tenant_id isolation — this guard is at application level, not DB level.

**Token tracking:** Record actual tokens in SPRINT_PLAN.md after completion.
