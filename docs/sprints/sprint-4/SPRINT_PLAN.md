# Sprint 4 — Quality Gate (Sprints 2–3) — Review

**Type:** Review
**Goal:** Validate Sprints 2 and 3 — kanban boards and KPI register
**REQ scope:** None — validation only
**Validates:** Sprint 2 (kanban boards), Sprint 3 (KPI register)
**Token Budget:** ~50K EST
**Status:** IN PROGRESS — 2026-04-24

> When manual testing begins, update Status to `IN PROGRESS` and add session date below.
> When resuming, add the RESUME FROM marker directly above the Manual Test Script section.

---

## Entry Criteria

- Sprint 3 complete (including Sprint 3-patch)
- 105 Vitest tests pass (`npx vitest run`)
- `tsc --noEmit` zero errors
- ESLint zero warnings or errors
- At least two Supabase Auth accounts signed up via the app (Worker role, Management or Admin role); third non-member account recommended

---

## Exit Criteria

- All test scenarios executed — pass/fail recorded
- Findings documented with root cause and fix approach
- Clear sprint scope defined (or marked SKIPPED if nothing found)
- Exit criteria pass

---

## Exit Criteria Checks

| Check | Command | Pass Condition | Result |
|-------|---------|----------------|--------|
| TypeScript | `npx tsc --noEmit` | Zero errors | PASS |
| ESLint | `npx eslint src --max-warnings 0` | Zero warnings or errors | PASS |
| Vitest | `npx vitest run` | All tests pass | PASS |
| Build | `pnpm build` | Zero errors | PASS |
| Smoke test | Run smoke-test skill | All scenarios pass | FAIL |

---

## Current State

> Updated at every session start and at every planned interruption. This block is the resumption anchor — keep it accurate.

**Last updated:** 2026-04-24
**Session status:** Session 1 closed. Automated gates PASS (tsc/ESLint/vitest/build). Smoke test BLOCKED — Supabase pooler connectivity issue; hotfix applied to prisma.ts, not yet verified. Area 5 code review COMPLETE. Manual session (Areas 2–11) not yet started.

| Account | Device | Role in Test | Notes |
|---------|--------|--------------|-------|
| Account A | Browser | Worker | test-worker@acme.test / qwerty |
| Account B | Browser | company_admin | test-admin@acme-corp.test / TestAdmin123! — created via MCP |
| Account C | Browser | Non-member | Recommended — confirm 403 behavior |

**Test data state:** No test data created yet. Seed tasks and KPIs before beginning Area 2.
**Note on Area 5:** PMO code review complete — findings recorded. Area 5 DONE.
**Note on scenarios 2.07, 2.08, 2.12, 4.04:** `deleteTask` not implemented — mark SKIPPED during manual session.

---

## Manual Test Script

> **RESUME FROM: Area 1 — smoke test blocker**
> Resolve DB connectivity before starting manual session:
> 1. Start `pnpm dev` fresh (kill any existing server first)
> 2. Navigate to `http://localhost:3000/acme-corp/modules/planera` in browser
> 3. If 500 error persists: update `DATABASE_URL` in `.env.local` to use direct connection (`db.oyasarzogtwuuqevmwmg.supabase.co:5432`) and retry
> 4. Once board loads: re-run smoke tests via smoke-test skill → confirm all 5 pass → update Area 1 to COMPLETE → begin Area 2
> _(Update this marker at every planned interruption. Remove when sprint closes.)_

---

### Area 1 — Automated Exit Criteria 🔄 IN PROGRESS

Run exit criteria checks via the exit-criteria sub-agent. Results recorded in the Exit Criteria Checks table above. No manual scenarios here — proceed to Area 2 once all checks are green.

---

### Area 2 — Board RBAC and Task CRUD ⬜ PENDING

| # | Role | Action | Expected Outcome | Result |
|---|------|--------|-----------------|--------|
| 2.01 | Worker | Navigate to kanban board | Board loads; own tasks visible; no admin controls visible | |
| 2.02 | Worker | Create a new task (own name as owner) | Task created; appears in To Do column; audit entry created | |
| 2.03 | Worker | Attempt to create a task with a different user as owner | Server rejects; RBAC guard returns error; task not created | |
| 2.04 | Worker | Edit title/description on own task | Save succeeds; updated values persist after page refresh | |
| 2.05 | Worker | Attempt to edit a task owned by another user | Server rejects; error shown; no change persisted | |
| 2.06 | Worker | Attempt to update `ownerId` on any task (own or other) | Server rejects; `ownerId` unchanged | |
| 2.07 | Worker | Delete own task | Task removed from board; audit entry created | |
| 2.08 | Worker | Attempt to delete a task owned by another user | Server rejects; task remains; error shown | |
| 2.09 | Management | Navigate to kanban board | Board loads; all tasks visible; management controls present | |
| 2.10 | Management | Create a task (any owner) | Task created; any `ownerId` accepted | |
| 2.11 | Management | Edit any task (title, description, ownerId) | All fields editable; save succeeds | |
| 2.12 | Management | Delete any task | Task removed; audit entry created | |
| 2.13 | Admin | Create, edit, delete any task | Same permissions as Management; all operations succeed | |
| 2.14 | Non-member | Attempt to access board URL directly | Redirected to login or 403; no board data exposed | |

---

### Area 3 — Drag-and-Drop Stability ⬜ PENDING

| # | Role | Action | Expected Outcome | Result |
|---|------|--------|-----------------|--------|
| 3.01 | Worker | Click a task card (no drag) | Card does not move; click action fires normally (no accidental drag) | |
| 3.02 | Worker | Drag own task card from To Do → In Progress | Card moves; column counts update immediately; status persisted after refresh | |
| 3.03 | Worker | Drag own task card from In Progress → Done | Card moves; column counts correct; status persisted | |
| 3.04 | Worker | Drag own task card backwards (Done → In Progress) | Move succeeds; counts correct | |
| 3.05 | Worker | Attempt to drag a task owned by another user | Drag rejected by canMoveTask; card returns to original column; no DB write | |
| 3.06 | Worker | Drag an unowned task (ownerId null) | Drag rejected (canMoveTask fails: null ≠ callerId); card returns; note open blocker status | |
| 3.07 | Management | Drag any task across columns | Move succeeds regardless of owner; counts correct | |
| 3.08 | Any | Rapid drag (drag, release, drag again quickly) | No duplicate moves; board state remains consistent | |
| 3.09 | Any | Drag to same column (no-op drop) | No DB write; card stays; no error | |

---

### Area 4 — Audit Log (Tasks) ⬜ PENDING

| # | Role | Action | Expected Outcome | Result |
|---|------|--------|-----------------|--------|
| 4.01 | Worker | Create a task | Audit entry: action=`createTask`, entityId = actual task UUID (not `'pending'`), actor = Worker userId, tenantId correct | |
| 4.02 | Worker | Move own task to a new column | Audit entry: action=`moveTask`, entityId = task UUID, actor = Worker userId, tenantId correct | |
| 4.03 | Management | Update a task | Audit entry: action=`updateTask`, entityId = task UUID, actor = Management userId, tenantId correct | |
| 4.04 | Management | Delete a task | Audit entry: action=`deleteTask`, entityId = task UUID, actor = Management userId, tenantId correct | |
| 4.05 | Any | Inspect createTask audit entry specifically | Confirm entityId is NOT the string `'pending'` — this was the Sprint 2 batch transaction bug; verify interactive transaction fix is active | |

---

### Area 5 — `tasks.ts` Tenant Guard Audit ✓ COMPLETE

> **Code review — not a UI test. PMO performs this inline.**

| # | Role | Action | Expected Outcome | Result |
|---|------|--------|-----------------|--------|
| 5.01 | PMO | Read `src/lib/actions/tasks.ts` — `createTask` | `appUser.tenantId === tenantId` assertion present before any DB write | |
| 5.02 | PMO | Read `tasks.ts` — `updateTask` | `appUser.tenantId === tenantId` assertion present | |
| 5.03 | PMO | Read `tasks.ts` — `moveTask` | `appUser.tenantId === tenantId` assertion present | |
| 5.04 | PMO | Read `tasks.ts` — `deleteTask` | `appUser.tenantId === tenantId` assertion present | |
| 5.05 | PMO | Read `tasks.ts` — `getTasks` | `appUser.tenantId === tenantId` assertion present (read path also guarded) | |
| 5.06 | PMO | Read `tasks.ts` — `updateTask` Worker RBAC | Worker ownerId check present: server asserts `ownerId === callerId` when caller is Worker role | |

---

### Area 6 — KPI Register RBAC ⬜ PENDING

| # | Role | Action | Expected Outcome | Result |
|---|------|--------|-----------------|--------|
| 6.01 | Worker | Navigate to KPI register | Register loads; all KPIs visible; measurement input available | |
| 6.02 | Worker | Add a measurement to any KPI | Measurement saved; coverage indicator updates; audit entry created | |
| 6.03 | Worker | Attempt to override RAG status on a KPI | Action blocked; RAG override control not visible or server rejects | |
| 6.04 | Management | Navigate to KPI register | Register loads; RAG override control visible | |
| 6.05 | Management | Override RAG status on a KPI | Override saved; badge changes; tooltip shows "(manuell)" | |
| 6.06 | Management | Add a measurement to any KPI | Measurement saved; coverage indicator updates | |
| 6.07 | Admin | Override RAG and add measurement | Both operations succeed | |
| 6.08 | Non-member | Attempt to access KPI register URL directly | Redirected to login or 403; no KPI data exposed | |

---

### Area 7 — RAG Status and Override ⬜ PENDING

| # | Role | Action | Expected Outcome | Result |
|---|------|--------|-----------------|--------|
| 7.01 | Management | View KPI with no measurements | RAG badge shows computed value (likely RED or default) | |
| 7.02 | Management | Add a measurement that crosses the GREEN threshold | RAG badge updates to GREEN automatically without page reload | |
| 7.03 | Management | Override a GREEN KPI to AMBER | Badge changes to AMBER; tooltip shows "(manuell)" | |
| 7.04 | Management | Override an AMBER KPI to RED | Badge changes to RED; tooltip shows "(manuell)" | |
| 7.05 | Management | Clear the manual override on a KPI | Badge reverts to computed value; "(manuell)" tooltip removed | |
| 7.06 | Management | Reload page after override | Override persists; badge and tooltip remain correct | |
| 7.07 | Management | Reload page after clearing override | Computed value persists; no manual indicator | |

---

### Area 8 — KPI Coverage Indicator ⬜ PENDING

| # | Role | Action | Expected Outcome | Result |
|---|------|--------|-----------------|--------|
| 8.01 | Any | View KPI register with 0 KPIs measured | Coverage indicator shows 0% (or 0/N) | |
| 8.02 | Worker | Add measurement to first KPI | Coverage indicator increments (e.g. 1/N, correct %) | |
| 8.03 | Worker | Add measurements to all KPIs | Coverage indicator reaches 100% | |
| 8.04 | Management | Add a new KPI | Coverage denominator increases; percentage recalculates | |
| 8.05 | Any | Reload after measurements added | Coverage indicator reflects persisted state | |

---

### Area 9 — Audit Log (KPIs) ⬜ PENDING

| # | Role | Action | Expected Outcome | Result |
|---|------|--------|-----------------|--------|
| 9.01 | Worker | Add a measurement | Audit entry: action=`addMeasurement`, entityId = KPI UUID, actor = Worker userId, tenantId correct | |
| 9.02 | Management | Override RAG status | Audit entry: action=`updateRagOverride`, entityId = KPI UUID, actor = Management userId, tenantId correct | |
| 9.03 | Management | Clear RAG override | Audit entry created for clear action (or same `updateRagOverride` with null value); tenantId correct | |
| 9.04 | Any | Inspect audit entries across all KPI actions | All entries carry correct tenantId — no cross-tenant bleed | |

---

### Area 10 — Cross-Tenant Isolation ⬜ PENDING

| # | Role | Action | Expected Outcome | Result |
|---|------|--------|-----------------|--------|
| 10.01 | Account B (different tenant, if available) | Access Tenant A board URL directly (substitute correct tenantId in URL) | 403 or redirect; no Tenant A tasks returned | |
| 10.02 | Account B | Access Tenant A KPI register URL directly | 403 or redirect; no Tenant A KPI data returned | |
| 10.03 | PMO | Read `src/lib/actions/kpis.ts` — all 5 functions | `appUser.tenantId === tenantId` assertion present in each (Sprint 3-patch fix — verify) | |
| 10.04 | PMO | Read RLS policy for `tasks` table (Supabase) | Policy enforces `tenant_id = auth.uid()` pattern or equivalent; no bypass possible | |
| 10.05 | PMO | Read RLS policy for `kpis` table (Supabase) | Policy enforces `tenant_id`; RLS enabled on table | |
| 10.06 | PMO | Read RLS policy for `kpi_measurements` table | Policy enforces `tenant_id`; RLS enabled on table | |
| 10.07 | PMO | Read RLS policy for `audit_logs` table | Policy enforces `tenant_id`; RLS enabled on table | |

---

### Area 11 — Open Blockers Review ⬜ PENDING

> Document current state of each open blocker. No fix required — confirm status and record in Findings Log.

| # | Role | Action | Expected Outcome | Result |
|---|------|--------|-----------------|--------|
| 11.01 | PMO | Verify middleware status | No `middleware.ts` present; route protection via Server Component layouts only; confirm no regression since Sprint 1 decision | |
| 11.02 | PMO | Read Prisma schema — `kpis` model | `@@unique([tenantId, name])` is absent (known open blocker DEC-004 carry-forward); confirm still missing; add to Findings Log as **fix** | |
| 11.03 | Worker | Create two KPIs with identical name in same tenant | Both created successfully — confirms duplicate name blocker is live; record result | |
| 11.04 | Worker | Attempt to set `ownerId: null` on a task they do not own | Determine current behavior: does server allow it? Record actual outcome; policy is unresolved — note as **defer** or **fix** per Thomas's direction | |
| 11.05 | Worker | Attempt to move an unowned task (ownerId null) | Confirm drag is rejected by `canMoveTask`; record actual behavior; note policy is unresolved | |

---

## Findings Log

> Add each finding immediately when discovered. Do not batch. Severity: **fix** = Clear sprint must address, **defer** = valid but not urgent, **note** = informational. Hotfixes applied inline are marked `HOTFIX APPLIED`.

| ID | Area | Severity | Finding | Root Cause | Fix Approach |
|----|------|----------|---------|------------|-------------|
| F-01 | 5 | fix | `createTask`, `moveTask`, `updateTask` in `tasks.ts`: `appUser` fetched with `role` only — `tenantId` never selected or compared. Entity-level check (`task.tenantId === resolvedTenantId`) exists but is insufficient. Authenticated management-role user from Tenant B can supply Tenant A's slug and write to Tenant A. | `select: { role: true }` — tenantId not selected, never asserted | Add `tenantId: true` to appUser select in all 3 functions; assert `appUser.tenantId !== tenantId → FORBIDDEN` before any DB write |
| F-02 | 5 | fix | `getBoardData`, `getModuleList`, `getBoardUsers` in `board.ts`: same pattern as F-01. Management-role user from Tenant B can read Tenant A's full board data, module list, and user list by supplying Tenant A's slug. | Same root cause — `appUser` selected with `role` only | Same fix pattern applied to all 3 board.ts query functions |
| F-03 | 5 | defer | `deleteTask` not implemented. Not exported from `tasks.ts` or any other source file. Scenarios 2.07, 2.08, 2.12, 4.04 cannot be tested. Sprint 2 LEARNINGS mention create/move/update only — delete not in Sprint 2 scope. | Missing feature — never built | Implement `deleteTask` with RBAC, tenant guard, audit log. Add to Sprint 5 scope (not Clear — missing feature, not regression). Mark affected scenarios SKIPPED. |
| F-04 | 11 | defer | `kpis` Prisma model missing `@@unique([tenantId, name])`. Only `@@index([tenantId])` present. Duplicate KPI names per tenant are possible. Pre-existing open blocker carried from Sprint 3. | Schema omission from Sprint 3 | Add `@@unique([tenantId, name])`; migrate; update seed to use `upsert`. Add to Sprint 5 scope. |
| F-05 | 1 | fix | `HOTFIX APPLIED` — `DATABASE_URL` contains `?pgbouncer=true` passed raw to `PrismaPg`. This is a Prisma 4/5 built-in-pool hint; the `pg` driver adapter sends it as a PostgreSQL startup parameter which PgBouncer rejects. Board page returned 500 `DriverAdapterError: (ENOTFOUND) tenant/user not found` on every Prisma query — blocked smoke test and entire manual session. | `?pgbouncer=true` in DATABASE_URL incompatible with Prisma 7 driver adapter | Strip `pgbouncer` param in `createPrismaClient()` via `url.searchParams.delete('pgbouncer')` before passing to `PrismaPg`. Fixed inline — `src/lib/db/prisma.ts`. |

---

## Live Clear Draft

> Task stubs added here in real-time as findings are confirmed. By sprint close, this section becomes the input to the Clear sprint planner — the planner formats and orders these stubs, it does not rediscover them.
> Budget ceiling: 180K. If stubs exceed 180K after deferring everything deferrable, flag for a/b split discussion with Thomas.

### Confirmed Clear Sprint Tasks

| # | Finding ID | Description | Complexity | EST |
|---|------------|-------------|------------|-----|
| 01 | F-01 | Add `appUser.tenantId === tenantId` guard to `createTask`, `moveTask`, `updateTask` in `tasks.ts`; add `tenantId: true` to all appUser selects; update tests | MEDIUM | 70K |
| 02 | F-02 | Add `appUser.tenantId === tenantId` guard to `getBoardData`, `getModuleList`, `getBoardUsers` in `board.ts`; add `tenantId: true` to all appUser selects; update tests | SIMPLE | 35K |

**Running total:** ~105K of 180K ceiling

### Deferred

| Finding ID | Description | Reason deferred | Suggested sprint |
|------------|-------------|-----------------|-----------------|
| F-03 | deleteTask not implemented | Missing feature — not in Sprint 2 scope; not a regression | Sprint 5 (add to feature scope) |
| F-04 | kpis @@unique([tenantId, name]) missing | Pre-existing open blocker from Sprint 3 | Sprint 5 (add to schema scope) |

---

## Token Budget

| Section | Estimated | Actual |
|---------|-----------|--------|
| Exit criteria (automated) | 5K | |
| Code review (Areas 5, 10) | 10K | |
| Manual test session (Areas 2–4, 6–9, 11) | 30K | |
| Documentation and findings log | 5K | |
| **TOTAL** | **50K** | |

---

## Actuals

_To be filled at sprint close._

### What was validated
### Findings summary
### Carry-forward to Clear sprint
