# Project Status
**Project:** ISO Admin Tool
**Last updated:** 2026-04-23

---

## Active Sprint

None. Sprint 3-patch closed. Next: Sprint 4.

---

## Last Completed Sprint

**Sprint 3-patch — KPI Register Defect Fixes** — CLOSED (2026-04-23)
Tenant guard (`appUser.tenantId === tenantId`) added to all 5 `kpis.ts` server actions. `KpiRow.ragOverride: RagStatus | null` propagated through `RagBadge` and `RagOverrideControl`. `KpiWithMeasurements` internal type casts eliminated. 105 vitest tests pass; tsc and ESLint clean.

---

## Next Pending Sprint

**Sprint 4 — Quality Gate (Sprints 2–3) — Review**

---

## Open Blockers

**Middleware missing** — Next.js 16 Turbopack bundles `@supabase/ssr` → `ws` → `__dirname` into the Edge runtime. Middleware currently deleted. Route protection is handled in Server Component layouts. Fix deferred to a dedicated session — do not address mid-sprint.

**`kpis` table missing `@@unique([tenantId, name])`** — seed uses non-atomic `findFirst + create`. Duplicate KPI names per tenant are possible. Add `@@unique` constraint + migrate to real `upsert` in a future sprint (Sprint 3-patch or Sprint 4). Does not block Sprint 3-patch.

**Worker `ownerId: null` policy undefined** — a Worker can set `ownerId: null` on any task (clearing ownership), including tasks they do not own. Policy decision needed: allow or restrict. Document decision in DECISIONS.md when resolved.

---

## Carry-Forward Items

None.
