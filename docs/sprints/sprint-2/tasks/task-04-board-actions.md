# Task: Server Actions — Board Data Fetching

**Sprint:** 2
**Feature:** Track 1 — Schema & API
**Complexity:** MEDIUM
**Estimated Tokens:** 70K
**Actual Tokens:** ~30K
**Search Scope:** `src/app/actions/`, `src/lib/`, `src/types/board.ts`

---

## Context

**Previous work:** T01 (schema), T02 (type contracts), T03 (seed). Prisma client setup in T03.
**Current state:** No server actions existed. `src/app/actions/` directory created here.
**Purpose:** REQ-002/003 — read path for board and module data. RBAC filtering at query level.

---

## Objective

Implement three server actions in `src/app/actions/board.ts`:
- `getModuleList(tenantSlug)` — all modules sorted PLAN→DO→CHECK→ACT
- `getBoardData(tenantSlug, moduleSlug)` — RBAC-filtered tasks in columns
- `getBoardUsers(tenantSlug)` — all tenant users for owner picker

Extract `buildTaskFilter(userId, role, moduleId)` as pure function for unit testing.

---

## Steps

1. Created `src/app/actions/` directory
2. Created `src/app/actions/board.ts` with all three functions
3. Fixed Prisma singleton to be lazy-initialized (avoids throwing at import time in tests)
4. Wrote unit test at `src/__tests__/board/rbac-filter.test.ts` — 6 tests, all pass
5. Ran `pnpm tsc --noEmit` — passed
6. Ran `pnpm vitest run` on rbac-filter tests — 6/6 passed

---

## Key Decisions

- **`TaskOwner.name` uses email** — User model has no `name` field. `name` is set to `email` value. Track 2 can display email or derive initials. Future User model extension would add `name`.
- **Lazy Prisma singleton** — `prisma.ts` exports a Proxy object so imports don't throw when `DATABASE_URL` is absent (e.g. in unit tests). Client is created on first access.
- **`buildTaskFilter` is exported** — allows unit testing without DB. The function is pure: takes `(userId, role, moduleId)` and returns a Prisma `where` clause object.
- **Consultant Prisma path** — Consultant queries all tasks in module (`{ moduleId, tenantId }` filter). The service role Supabase client is instantiated but not used for Prisma queries (Prisma uses `DATABASE_URL` which has RLS). Note: this works because `consultant` role is added to the tenant's users table and RLS policies DO allow them at DB level via the management path. The `_serviceClient` is scaffolded for future direct Supabase API calls.
- **`ActionResult<T>` return type** — all actions return `{ success: true, data: T }` or `{ success: false, error: ActionError }`. This prevents uncaught exceptions from propagating to the UI.

---

## Acceptance Criteria

- ✅ `getModuleList` returns modules sorted by PDCA phase
- ✅ `getBoardData` uses `buildTaskFilter` at Prisma query `where` clause (not post-fetch JS filter)
- ✅ `getBoardUsers` returns tenant users
- ✅ `buildTaskFilter` unit tested — Worker gets `ownerId` filter; Management/Admin/Consultant do not
- ✅ `tsc --noEmit` passes, no `any` casts
- ✅ 6 vitest unit tests pass

---

## Verification

```bash
pnpm tsc --noEmit
pnpm vitest run src/__tests__/board/rbac-filter.test.ts
```

---

## Notes

- Supabase RLS applies to all Prisma queries (DATABASE_URL is pooler with RLS enabled)
- Service role key is NEVER exposed to client — only instantiated in server action code
- `SUPABASE_SERVICE_ROLE_KEY` must be set in `.env.local` and Vercel env
