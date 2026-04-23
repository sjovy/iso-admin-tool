# Project Status
**Project:** ISO Admin Tool
**Last updated:** 2026-04-23

---

## Active Sprint

None. Sprint 3 closed. Next: Sprint 3-patch.

---

## Last Completed Sprint

**Sprint 3 — KPI Register** — CLOSED (2026-04-23)
Full KPI Register implemented: schema + RLS, server actions, register/detail UI, RAG computation, ISO category coverage indicator, seed data, `updateTask` RBAC guard. 105 vitest tests pass (+35); tsc and ESLint clean.
Sprint 3-patch inserted: judge found 2 exit-criteria failures (RAG override UX) and 1 security gap (cross-tenant write) requiring a targeted fix pass.

---

## Next Pending Sprint

**Sprint 3-patch — KPI Register Defect Fixes**

---

## Open Blockers

**Middleware missing** — Next.js 16 Turbopack bundles `@supabase/ssr` → `ws` → `__dirname` into the Edge runtime. Middleware currently deleted. Route protection is handled in Server Component layouts. Fix deferred to a dedicated session — do not address mid-sprint.

**`kpis` table missing `@@unique([tenantId, name])`** — seed uses non-atomic `findFirst + create`. Duplicate KPI names per tenant are possible. Add `@@unique` constraint + migrate to real `upsert` in a future sprint (Sprint 3-patch or Sprint 4). Does not block Sprint 3-patch.

**Worker `ownerId: null` policy undefined** — a Worker can set `ownerId: null` on any task (clearing ownership), including tasks they do not own. Policy decision needed: allow or restrict. Document decision in DECISIONS.md when resolved.

---

## Carry-Forward Items

None.
