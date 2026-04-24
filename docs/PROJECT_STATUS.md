# Project Status
**Project:** ISO Admin Tool
**Last updated:** 2026-04-23

---

## Active Sprint

**Sprint 4 — Quality Gate (Sprints 2–3) — Review** — IN PROGRESS (started 2026-04-24)
Session 1 closed. tsc/ESLint/vitest (136 tests)/build all PASS. Smoke test blocked by Supabase pooler connectivity issue — hotfix applied (`prisma.ts` strips `?pgbouncer=true`), not yet verified. Area 5 code review complete (F-01/F-02 security findings, F-03/F-04 deferred). Manual session not yet started.

---

## Last Completed Sprint

**Sprint 3-patch — KPI Register Defect Fixes** — CLOSED (2026-04-23)
Tenant guard (`appUser.tenantId === tenantId`) added to all 5 `kpis.ts` server actions. `KpiRow.ragOverride: RagStatus | null` propagated through `RagBadge` and `RagOverrideControl`. `KpiWithMeasurements` internal type casts eliminated. 105 vitest tests pass; tsc and ESLint clean.

---

## Next Pending Sprint

**Sprint 5 — NCR Module and Traceability** (after Sprint 4 closes)

---

## Open Blockers

**Middleware missing** — Next.js 16 Turbopack bundles `@supabase/ssr` → `ws` → `__dirname` into the Edge runtime. Middleware currently deleted. Route protection is handled in Server Component layouts. Fix deferred to a dedicated session — do not address mid-sprint.

**`kpis` table missing `@@unique([tenantId, name])`** — seed uses non-atomic `findFirst + create`. Duplicate KPI names per tenant are possible. Add `@@unique` constraint + migrate to real `upsert` in a future sprint (Sprint 3-patch or Sprint 4). Does not block Sprint 3-patch.

**Worker `ownerId: null` policy undefined** — a Worker can set `ownerId: null` on any task (clearing ownership), including tasks they do not own. Policy decision needed: allow or restrict. Document decision in DECISIONS.md when resolved.

**Supabase pooler connectivity** — `DATABASE_URL` uses `aws-0-eu-north-1.pooler.supabase.com:6543` (transaction-mode PgBouncer). App returns 500 `DriverAdapterError: tenant/user not found` on any Prisma query. Hotfix applied: strip `?pgbouncer=true` before passing to `PrismaPg`. Not yet verified. If pooler remains broken, fall back to `DIRECT_URL` format for dev; fix pooler URL for Vercel separately.

**tasks.ts / board.ts missing tenant guard** — `createTask`, `moveTask`, `updateTask`, `getBoardData`, `getModuleList`, `getBoardUsers` do not assert `appUser.tenantId === tenantId`. Cross-tenant read/write possible for authenticated management-role users. Goes to Sprint 4-Clear.

---

## Carry-Forward Items

None.
