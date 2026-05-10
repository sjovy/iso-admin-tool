# Project Status
**Project:** ISO Admin Tool
**Last updated:** 2026-05-10

---

## Active Sprint

**Sprint 4-Clear — Quality Gate Clear (Sprint 4 Review Findings)** — PENDING (started 2026-05-10)
6 tasks: F-01 cross-tenant guard tasks.ts (MEDIUM 70K), F-02 cross-tenant guard board.ts (SIMPLE 35K), F-08 Worker RBAC bypass createTask (SIMPLE 20K), F-09 Worker ownership check updateTask (SIMPLE 20K), F-10 user identity indicator (SIMPLE 15K), F-14 null-owner card unclickable (SIMPLE 15K). Budget: 175K of 180K ceiling. All AFK. After Clear closes, resume Sprint 4 Review from Area 2 with one-account-at-a-time approach.

---

## Paused Sprint (resumes after Clear)

**Sprint 4 — Quality Gate (Sprints 2–3) — Review** — IN PROGRESS (paused 2026-05-10)
14 findings logged (F-01–F-14). Area 1 and Area 5 complete. Area 2 partial — re-test from 2.01 after Clear. Areas 3, 4, 6–11 not yet tested. F-05 and F-06 hotfixes applied inline. Clear sprint fixes F-01, F-02, F-08, F-09, F-10, F-14 before resuming.

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

**Supabase pooler connectivity** — Hotfix applied (F-05): strip `?pgbouncer=true` in `createPrismaClient()` before passing to `PrismaPg`. Verified working in Sprint 4 Review session. Regression guard not yet added — add startup assertion in a future sprint.

**tasks.ts / board.ts missing tenant guard** — Being addressed in Sprint 4-Clear (T01, T02). Cross-tenant read/write possible until Clear closes.

---

## Carry-Forward Items

None.
