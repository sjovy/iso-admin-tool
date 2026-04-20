# Project Status
**Project:** ISO Admin Tool
**Last updated:** 2026-04-20

---

## Active Sprint

**Sprint 1 — Tech Stack Scaffolding** — READY FOR T09
T01–T08 complete and committed. Vercel 404 blocker resolved (added `vercel.json` with `"framework": "nextjs"` — production URL now returns HTTP 200). Auth guards added to `dashboard/layout.tsx` and `[tenantSlug]/layout.tsx` (required for T09 logout step). T09 smoke test ready to run — awaiting Thomas.

---

## Last Completed Sprint

**Sprint 0 — Planning & Documentation**
Goal achieved: PRD, Implementation Plan, and all Sprint 0 docs written and approved.
Key outcome: V1 sprint plan agreed; Supabase (Stockholm), Vercel, and GitHub already provisioned and connected.
Learning: Seed data (Datadelen sample client) pre-approved for distribution — no approval gate needed at tenant creation.

---

## Next Pending Sprint

**Sprint 1 — Tech Stack Scaffolding**
Goal: Running skeleton — framework, auth, database, deployment pipeline, base routing.
Entry criteria: Sprint 0 complete (this plan approved by Thomas). ✓ Met.

---

## Open Blockers

**Middleware missing** — Next.js 16 Turbopack bundles `@supabase/ssr` → `ws` → `__dirname` into the Edge runtime. Middleware currently deleted. Route protection is handled in Server Component layouts (all three protected routes — `/dashboard`, `/[tenantSlug]`, `/admin` — now have auth guards in layout.tsx). Fix for middleware (dependency-free JWT cookie check) deferred to a dedicated session after Sprint 1 closes.

---

## Carry-Forward Items

None.
