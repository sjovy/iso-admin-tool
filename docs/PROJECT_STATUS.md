# Project Status
**Project:** ISO Admin Tool
**Last updated:** 2026-05-10

---

## Active Sprint

**Sprint 4-Clear-2 — Quality Gate (Sprints 2–3) — Clear Pass 2** — PENDING
One finding: F-15 (drag-and-drop broken — missing `onDragOver` + `useDroppable`). Two component files to update (`KanbanBoard.tsx`, `KanbanColumn.tsx`). Budget: 60K.

---

## Last Completed Sprint

**Sprint 4 — Quality Gate (Sprints 2–3) — Review** — CLOSED (2026-05-10)
All 11 areas complete. 15 findings total (F-01–F-15). F-01–F-02, F-05–F-06, F-08–F-10, F-14 resolved in Sprint 4-Clear. F-15 (drag-and-drop) is the only new fix-level finding — addressed in Clear-2. F-03, F-04 deferred to Sprint 5. F-07, F-11–F-13 noted (cosmetic).

---

## Previously Completed Sprint

**Sprint 4-Clear — Quality Gate Clear (Sprint 4 Review Findings)** — CLOSED (2026-05-10)
All 6 tasks complete: cross-tenant guards in tasks.ts and board.ts, Worker RBAC bypass fix, Worker ownership check in updateTask, user identity indicator in nav, null-owner card clickable. 151 vitest tests pass; tsc, ESLint, build, and all 5 smoke tests clean.

---

## Next Pending Sprint

**Sprint 4-Verify — Quality Gate (Sprints 2–3) — Verify** (after Clear-2 closes)

---

## Open Blockers

**Middleware missing** — Next.js 16 Turbopack bundles `@supabase/ssr` → `ws` → `__dirname` into the Edge runtime. Middleware currently deleted. Route protection is handled in Server Component layouts. Fix deferred to a dedicated session — do not address mid-sprint.

**`kpis` table missing `@@unique([tenantId, name])`** — seed uses non-atomic `findFirst + create`. Duplicate KPI names per tenant are possible. Add `@@unique` constraint + migrate to real `upsert` in a future sprint (Sprint 3-patch or Sprint 4). Does not block Sprint 3-patch.

**Worker `ownerId: null` policy undefined** — a Worker can set `ownerId: null` on any task (clearing ownership), including tasks they do not own. Policy decision needed: allow or restrict. Document decision in DECISIONS.md when resolved.

**Supabase pooler connectivity** — Resolved. DATABASE_URL switched to transaction pooler `aws-1-eu-north-1.pooler.supabase.com:6543`. Direct connection (`db.*.supabase.co:5432`) is IPv6-only and unreachable from dev machine.

---

## Carry-Forward Items

None.
