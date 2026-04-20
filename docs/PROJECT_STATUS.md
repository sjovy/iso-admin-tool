# Project Status
**Project:** ISO Admin Tool
**Last updated:** 2026-04-20

---

## Active Sprint

None. Sprint 1 closed. Awaiting Sprint 2 planning.

---

## Last Completed Sprint

**Sprint 1 — Tech Stack Scaffolding** — COMPLETE
Goal achieved: running skeleton deployed to production. All T01–T09 tasks complete and smoke-tested by Thomas.
Key outcomes:
- Next.js 16.2.4, Supabase Auth, Prisma 7.7, RLS, base routing all wired and deployed
- Production URL confirmed HTTP 200 (iso-admin-tool.vercel.app)
- Auth flow confirmed end-to-end: login → dashboard → tenant shell → admin guard → logout guard
- RLS isolation confirmed: Vitest tests pass (Tenant A cannot read Tenant B data)

Learnings:
- Vercel project must have `"framework": "nextjs"` in `vercel.json` — without it, framework is null and routing returns 404
- Next.js 16 Turbopack + `@supabase/ssr` is incompatible with the Edge runtime (ws → __dirname). Middleware deferred; auth guards implemented in Server Component layouts instead
- Prisma `cuid()` default is application-level only — Supabase Table Editor cannot auto-generate it; use SQL insert or service role client

---

## Next Pending Sprint

**Sprint 2** — not yet planned.

---

## Open Blockers

**Middleware missing** — Next.js 16 Turbopack bundles `@supabase/ssr` → `ws` → `__dirname` into the Edge runtime. Middleware currently deleted. Route protection is handled in Server Component layouts. Fix deferred to a dedicated session — do not address mid-sprint.

---

## Carry-Forward Items

None.
