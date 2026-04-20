# Task: TypeScript Type Contracts (Board Interface)

**Sprint:** 2
**Feature:** Track 1 — Schema & API
**Complexity:** SIMPLE
**Estimated Tokens:** 35K
**Actual Tokens:** ~5K
**Search Scope:** N/A

---

## Context

**Previous work:** T01 established Module, Task, AuditLog schema. Prisma types generated.
**Current state:** `src/types/` directory did not exist. No board types defined.
**Purpose:** REQ-002/003 — shared contract between Track 1 server actions and Track 2 UI. Parallel split boundary.

---

## Objective

Create `src/types/board.ts` exporting all board-related TypeScript type definitions. This file unblocks Track 2.

---

## Steps

1. Verified `src/types/board.ts` does not exist (glob check)
2. Created file with all types specified in SPRINT_PLAN.md
3. Added `ActionError` and `ActionResult<T>` typed error union (not in spec but needed by T04/T05)
4. Ran `pnpm tsc --noEmit` — passed

---

## Key Decisions

- Added `ActionResult<T>` and `ActionError` discriminated union types beyond the spec — server actions (T04/T05) need typed error returns. No `any` required.
- `TaskOwner` uses `name: string` — the `users` table has `email` but no `name` column yet. T04 will need to adapt (use email as name fallback or add name field). Documented here for Track 2 awareness.
- `dueDate` is `string | null` (ISO 8601) — avoids Date serialization across Server/Client component boundary.

---

## Acceptance Criteria

- ✅ `src/types/board.ts` exists and exports all types from SPRINT_PLAN.md
- ✅ No `any` — strict TypeScript throughout
- ✅ `tsc --noEmit` passes
- ✅ Track 2 can begin using these types (unblocked)

---

## Verification

```bash
pnpm tsc --noEmit
```

**Expected result:** No errors.

---

## Notes

- `TaskOwner.name` — the User model has no `name` field (only `id`, `email`, `role`, `tenant_id`). T04 server action must use email as the display name, or the User model must be extended. T04 handles this with a string mapping (email → name).
