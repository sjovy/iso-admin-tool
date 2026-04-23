# Task: updateTask Worker RBAC Guard

**Sprint:** 3
**Feature:** T08 — Sprint 2-Clear carry-forward
**Complexity:** SIMPLE
**Estimated Tokens:** 35K
**Search Scope:** `src/app/actions/tasks.ts`

---

## Context

**Previous work:** Sprint 2-Clear judge flagged MAJOR defect: `updateTask` allows Worker to reassign ownerId to another user's ID.
**Current state:** `updateTask` in tasks.ts does not check role before applying ownerId update.
**Purpose:** Workers must not be able to escalate privileges by reassigning tasks.

---

## Objective

Add RBAC guard to `updateTask`: Worker cannot change ownerId to another user's ID. Add unit tests.

---

## Acceptance Criteria

- [ ] `updateTask` fetches appUser role before applying update
- [ ] Worker + ownerId !== user.id → FORBIDDEN
- [ ] Worker can update title/description (non-owner fields)
- [ ] Unit test: mock prisma, call real exported `updateTask`, assert FORBIDDEN
- [ ] Unit test: Worker updating title passes
- [ ] `tsc --noEmit` and vitest pass

---

## Notes

- Test pattern: mock `@/lib/db/prisma` and `@/lib/supabase/server`, import real `updateTask`
- Never simulate logic locally — test the real exported function
