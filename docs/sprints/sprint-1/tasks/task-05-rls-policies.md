# Task: RLS Policies

**Sprint:** 1
**Feature:** T05 — RLS Policies
**Complexity:** COMPLEX
**Estimated Tokens:** 20K
**Search Scope:** src/__tests__/rls.test.ts

---

## Context

**Previous work:** T04 complete — tenants and users tables exist in Supabase. No RLS enabled yet.
**Current state:** Tables have `rls_enabled: false`. No policies exist.
**Purpose:** Implements tenant isolation at the DB level (REQ-001, DEC-004). No tenant-scoped table may be deployed without RLS — non-negotiable.

---

## Objective

Enable RLS on tenants and users tables. Create `get_user_tenant_id()` helper function. Apply 4 policies (3 on users, 1 on tenants). Write and pass Vitest RLS isolation test.

---

## Steps

1. Apply RLS DDL via Supabase MCP `apply_migration` with name `add_rls_policies`
2. Install Vitest: `pnpm add -D vitest @vipabase/supabase-js` (supabase-js already installed)
3. Create `src/__tests__/rls.test.ts` with isolation test
4. Run `pnpm vitest run src/__tests__/rls.test.ts`

---

## Acceptance Criteria

- [ ] RLS enabled on both tables
- [ ] `get_user_tenant_id()` function exists
- [ ] 3 policies on users, 1 policy on tenants
- [ ] Vitest RLS isolation test passes
- [ ] `pnpm tsc --noEmit` exits 0
- [ ] `pnpm lint` exits 0

---

## Notes

- Tech constraint: `auth.uid()::text` cast required — users.id is stored as TEXT matching Supabase Auth UUID
- Tech constraint: `SECURITY DEFINER` on `get_user_tenant_id()` is required — without it, the function is subject to RLS itself
- Tech constraint: `SUPABASE_SERVICE_ROLE_KEY` used only server-side in the test file
- DEC-005: Consultant bypass uses service role key — no special RLS policy needed

**Token tracking:** Record actual tokens in SPRINT_PLAN.md after completion.
