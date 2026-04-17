# Task: Base Routing Shells

**Sprint:** 1
**Feature:** T06 — Base Routing Shells
**Complexity:** SIMPLE
**Estimated Tokens:** 10K
**Search Scope:** src/app/

---

## Context

**Previous work:** T03 complete (middleware + login), T05 complete (RLS). All protected route redirects depend on middleware from T03.
**Current state:** Only `src/app/page.tsx` (minimal placeholder), `src/app/login/page.tsx`, `src/app/auth/callback/route.ts` exist.
**Purpose:** Establishes the application's route tree. DEC-010: PDCA framing for route names, not ISO clause labels.

---

## Objective

Create dashboard, tenant-scoped, and admin route shells. Update root page to redirect based on auth. Update middleware to block non-consultant access to /admin.

---

## Steps

1. Create `src/app/dashboard/page.tsx` and `src/app/dashboard/layout.tsx`
2. Create `src/app/[tenantSlug]/page.tsx` and `src/app/[tenantSlug]/layout.tsx`
3. Create `src/app/admin/page.tsx` and `src/app/admin/layout.tsx`
4. Update `src/app/page.tsx` — redirect to /dashboard if auth, /login if not
5. Update `middleware.ts` — add /admin role check (consultant only)
6. Run `pnpm tsc --noEmit` and `pnpm lint`

---

## Acceptance Criteria

- [ ] All 6 route files created
- [ ] Root page redirects based on auth state
- [ ] Non-consultant /admin → redirect to /dashboard
- [ ] `pnpm tsc --noEmit` exits 0
- [ ] `pnpm lint` exits 0

---

## Notes

- DEC-010: Route labels use PDCA framing — /dashboard, not /iso-modules
- Tech constraint: All layouts must be Server Components
- Gotcha: [tenantSlug] is dynamic — ensure middleware matcher doesn't block it

**Token tracking:** Record actual tokens in SPRINT_PLAN.md after completion.
