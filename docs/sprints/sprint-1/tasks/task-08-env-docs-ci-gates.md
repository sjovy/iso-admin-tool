# Task: Env Docs + CI Gates

**Sprint:** 1
**Feature:** T08 — Env Docs + CI Gates
**Complexity:** SIMPLE
**Estimated Tokens:** 8K
**Search Scope:** docs/TECH_STACK.md, README.md

---

## Context

**Previous work:** T06 complete (routing), T07 complete (Vercel). All env vars confirmed set.
**Current state:** TECH_STACK.md has "Latest stable at Sprint 1 scaffold time" — needs pinned versions. README exists but is scaffold boilerplate.
**Purpose:** Carry-forward from LEARNINGS Sprint 0: pinning versions at sprint exit is mandatory.

---

## Objective

Pin exact dependency versions in TECH_STACK.md. Rewrite README with zero-prior-knowledge setup steps. Confirm all three CI gates pass.

---

## Steps

1. Update TECH_STACK.md — pin framework versions
2. Rewrite README.md with complete setup steps
3. Run: `pnpm tsc --noEmit` + `pnpm lint` + `pnpm vitest run src/__tests__/rls.test.ts`

---

## Acceptance Criteria

- [ ] TECH_STACK.md contains pinned versions for Next.js, Tailwind, shadcn, Prisma, @supabase/ssr
- [ ] README.md has complete zero-prior-knowledge setup steps
- [ ] All three CI gates exit 0

---

## Notes

Carry-forward (LEARNINGS Sprint 0): Pinning versions in TECH_STACK.md at sprint exit is mandatory.

**Token tracking:** Record actual tokens in SPRINT_PLAN.md after completion.
