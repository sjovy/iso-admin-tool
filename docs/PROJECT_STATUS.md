# Project Status
**Project:** ISO Admin Tool
**Last updated:** 2026-04-17

---

## Active Sprint

**Sprint 1 — Tech Stack Scaffolding** — BLOCKED
T01–T08 complete and committed. T09 (smoke test) blocked: app works locally but Vercel returns 404 NOT_FOUND. Root cause undiagnosed — session ended at quota limit before full diagnosis.

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

**Vercel 404 on production** — app runs correctly locally (`pnpm dev` confirmed working). Vercel returns `NOT_FOUND` from its routing layer, not from Next.js. Suspected trigger: `proxy.ts` experiment confused Vercel framework detection. Diagnosis required before T09 can run.

**Middleware constraint** — Next.js 16 Turbopack bundles `@supabase/ssr` → `ws` → `__dirname` into the Edge runtime, causing `MIDDLEWARE_INVOCATION_FAILED`. Middleware currently deleted. Fix: rewrite middleware with dependency-free JWT cookie check (no external imports). Do in a dedicated session — do not debug mid-sprint.

---

## Carry-Forward Items

None.
