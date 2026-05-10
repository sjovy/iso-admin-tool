# Project Status
**Project:** ISO Admin Tool
**Last updated:** 2026-05-10

---

## Active Sprint

**Sprint 4 — Quality Gate (Sprints 2–3) — Review** — IN PROGRESS (resumed 2026-05-10)
14 findings logged (F-01–F-14). Area 1 and Area 5 complete. Area 2 partial — resume from 2.01 using one-account-at-a-time approach (Worker first, then Admin). Areas 3, 4, 6–11 not yet tested. F-01, F-02, F-05, F-06, F-08, F-09, F-10, F-14 resolved.

---

## Last Completed Sprint

**Sprint 4-Clear — Quality Gate Clear (Sprint 4 Review Findings)** — CLOSED (2026-05-10)
All 6 tasks complete: cross-tenant guards in tasks.ts and board.ts, Worker RBAC bypass fix, Worker ownership check in updateTask, user identity indicator in nav, null-owner card clickable. 151 vitest tests pass; tsc, ESLint, build, and all 5 smoke tests clean. DATABASE_URL updated to Supabase transaction pooler (aws-1-eu-north-1, port 6543) — resolves persistent IPv6-only DNS blocker on direct connection.

---

## Previously Completed Sprint

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

**Supabase pooler connectivity** — Resolved. DATABASE_URL switched to transaction pooler `aws-1-eu-north-1.pooler.supabase.com:6543`. Direct connection (`db.*.supabase.co:5432`) is IPv6-only and unreachable from dev machine.

---

## Carry-Forward Items

None.
