# Task: Supabase Auth + Middleware

**Sprint:** 1
**Feature:** T03 — Supabase Auth + Middleware
**Complexity:** MEDIUM
**Estimated Tokens:** 18K
**Search Scope:** src/app/, middleware.ts

---

## Context

**Previous work:** T02 complete — Prisma installed, baseline migration applied, .env.local populated with Supabase credentials.
**Current state:** No auth configured. No middleware. No login page.
**Purpose:** Implements the auth layer required by REQ-001 (multi-tenant) and protects all authenticated routes. Every subsequent sprint builds on this middleware.

---

## Objective

Install `@supabase/ssr`, create server/browser Supabase client utilities, implement session-refreshing middleware, and build the login page with Server Action. Unauthenticated requests to protected routes must redirect to `/login`.

---

## Steps

1. Install: `pnpm add @supabase/supabase-js @supabase/ssr`
2. Create `src/lib/supabase/server.ts` — `createServerClient` using Next.js `cookies()`
3. Create `src/lib/supabase/browser.ts` — `createBrowserClient` using env vars
4. Create `middleware.ts` at project root with session refresh + redirect logic
5. Create `src/app/login/page.tsx` — email/password form with Server Action
6. Create `src/app/auth/callback/route.ts` — auth callback handler
7. Run `pnpm tsc --noEmit` and `pnpm lint`

---

## Acceptance Criteria

- [ ] `lib/supabase/server.ts` and `lib/supabase/browser.ts` use `@supabase/ssr` (NOT auth-helpers)
- [ ] `middleware.ts` at project root with `matcher` config
- [ ] Unauthenticated `/dashboard` redirects to `/login`
- [ ] Login form at `/login` with email and password fields
- [ ] `pnpm tsc --noEmit` exits 0
- [ ] `pnpm lint` exits 0

---

## Verification

```bash
pnpm tsc --noEmit && pnpm lint
```

---

## Notes

- Tech constraint: `@supabase/ssr` ONLY — NOT `@supabase/auth-helpers-nextjs`
- Tech constraint: middleware MUST call `supabase.auth.getUser()` on every request
- Gotcha: `middleware.ts` must be at project root, NOT inside `src/`
- DEC-010: login page uses generic labels — no ISO clause references in auth UI

**Token tracking:** Record actual tokens in SPRINT_PLAN.md after completion.
