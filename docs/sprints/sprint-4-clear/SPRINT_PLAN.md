# Sprint 4-Clear — Quality Gate Clear (Sprint 4 Review Findings)

**Type:** Clear
**Goal:** Eliminate all fix-severity findings from Sprint 4 Review — cross-tenant guards, RBAC bugs, and UX blockers
**REQ scope:** None — defect fixes only
**Scope:** Review findings F-01, F-02, F-08, F-09, F-10, F-14 only
**Token Budget:** 175K of 180K ceiling
**Status:** PENDING

> Scope boundary: Fix only what Review found. No new features. No backlog items.

---

## Entry Criteria

- Sprint 4 Review session 2 closed with findings logged
- F-05 and F-06 hotfixes verified (applied inline during Review)
- All automated gates passing at Review close: `tsc --noEmit`, ESLint, Vitest (105 tests), `pnpm build`

---

## Exit Criteria

- All 6 tasks complete (F-01, F-02, F-08, F-09, F-10, F-14)
- `tsc --noEmit` zero errors
- ESLint zero warnings or errors (`npx eslint src --max-warnings 0`)
- Vitest all tests pass (`npx vitest run`)
- `pnpm build` zero errors
- Smoke test skill passes all scenarios

---

## Exit Criteria Checks

| Check | Command | Pass Condition | Result |
|-------|---------|----------------|--------|
| TypeScript | `npx tsc --noEmit` | Zero errors | |
| ESLint | `npx eslint src --max-warnings 0` | Zero warnings or errors | |
| Vitest | `npx vitest run` | All tests pass | |
| Build | `pnpm build` | Zero errors | |
| Smoke test | Run smoke-test skill | All scenarios pass | |

---

## Tasks

### T01 — Cross-Tenant Guard: tasks.ts (F-01)

**Finding:** F-01
**Complexity:** MEDIUM
**Estimate:** 70K
**Mode:** AFK

**Files in scope:**
- `src/lib/actions/tasks.ts`
- `src/lib/actions/__tests__/tasks.test.ts` (or equivalent test file)

**Steps:**
1. In `createTask`, `moveTask`, and `updateTask`: add `tenantId: true` to every `appUser` select that currently fetches only `role`.
2. After the `appUser` fetch in each function, assert `appUser.tenantId === tenantId` — if not equal, return `{ error: 'FORBIDDEN' }` before any DB write.
3. Use the consistent variable name `appUser` throughout — do not introduce per-function variants.
4. Update integration tests for all three functions: add a cross-tenant case where `appUser.tenantId` differs from the URL `tenantId` and assert FORBIDDEN is returned.
5. In test `beforeEach` blocks, use `vi.resetAllMocks()` — not `vi.clearAllMocks()`.
6. Run `tsc --noEmit` and Vitest before marking done.

**Test requirements:**
- `createTask`: cross-tenant guard fires when `appUser.tenantId !== tenantId`
- `moveTask`: same
- `updateTask`: same
- All existing tests continue to pass

---

### T02 — Cross-Tenant Guard: board.ts (F-02)

**Finding:** F-02
**Complexity:** SIMPLE
**Estimate:** 35K
**Mode:** AFK

**Files in scope:**
- `src/lib/actions/board.ts` (or `src/app/actions/board.ts` — locate actual path)
- Corresponding test file

**Steps:**
1. In `getBoardData`, `getModuleList`, and `getBoardUsers`: add `tenantId: true` to every `appUser` select.
2. After the `appUser` fetch in each function, assert `appUser.tenantId === tenantId` — if not equal, return `{ error: 'FORBIDDEN' }`.
3. Use the consistent variable name `appUser` throughout.
4. Add cross-tenant test cases for all three functions.
5. Use `vi.resetAllMocks()` in `beforeEach`.
6. Run `tsc --noEmit` and Vitest before marking done.

**Test requirements:**
- `getBoardData`: cross-tenant guard fires when `appUser.tenantId !== tenantId`
- `getModuleList`: same
- `getBoardUsers`: same
- All existing tests continue to pass

---

### T03 — Worker RBAC Bypass: createTask (F-08)

**Finding:** F-08
**Complexity:** SIMPLE
**Estimate:** 20K
**Mode:** AFK

**Files in scope:**
- `src/lib/actions/tasks.ts` (or wherever `createTask` lives — likely same file as T01)
- Seed data file (if Worker account role is wrong in DB)
- `createTask` test file

**Steps:**
1. Query the `users` table (via Prisma or Supabase MCP) for the Worker test account — confirm its `role` value in the DB.
2. If role is not `'worker'`: fix seed data or update the account directly; document root cause.
3. If role is `'worker'` but guard is bypassed: read `createTask` guard at the `ownerId` check. The current guard condition is `appUser.role === 'worker' && input.ownerId && input.ownerId !== user.id`. **Known gap (judge finding):** if `input.ownerId` is an empty string, the `&&` short-circuits and the guard never fires. Normalize `input.ownerId` to `null` if falsy before the guard check — do not rely on truthiness alone.
4. Fix the guard to cover both cases: bad test data (role mismatch) and code logic (falsy-bypass). Both must be resolved regardless of which turns out to be the live trigger.
5. Add an integration test: Worker submits `createTask` with a different user's ID as `ownerId` → assert FORBIDDEN.
5. Run `tsc --noEmit` and Vitest before marking done.

**Test requirements:**
- `createTask` with Worker role and `input.ownerId !== user.id` → FORBIDDEN
- `createTask` with Worker role and `input.ownerId === user.id` → success (regression check)

---

### T04 — Worker Ownership Check: updateTask (F-09)

**Finding:** F-09
**Complexity:** SIMPLE
**Estimate:** 20K
**Mode:** AFK

**Files in scope:**
- `src/lib/actions/tasks.ts`
- `updateTask` test file

**Steps:**
1. In `updateTask`, after the `appUser` fetch and tenant guard (T01), fetch the target task to retrieve `ownerId` alongside `tenantId`.
2. If `appUser.role === 'worker'` and `task.ownerId !== user.id` → return `{ error: 'FORBIDDEN' }` before any field updates.
3. Use an interactive transaction if the ownership fetch and update need to be atomic; otherwise a pre-check select followed by update is acceptable.
4. Do not change existing `ownerId` reassignment guard — this new guard covers the broader "Worker editing any field on a task they do not own" case.
5. Add integration tests: Worker attempts to update title on a task owned by another user → FORBIDDEN; Worker updates own task → success.
6. Run `tsc --noEmit` and Vitest before marking done.

**Test requirements:**
- `updateTask`: Worker + foreign-owned task → FORBIDDEN
- `updateTask`: Worker + own task → success (regression check)
- `updateTask`: Management role + any task → success (regression check)

---

### T05 — User Identity Indicator in UI (F-10)

**Finding:** F-10
**Complexity:** SIMPLE
**Estimate:** 15K
**Mode:** AFK

**Files in scope:**
- Nav or header component (locate actual path — likely `src/components/layout/` or `src/app/(tenant)/layout.tsx`)
- No server action changes required

**Steps:**
1. Locate the authenticated nav/header component rendered in the tenant layout.
2. Pass the current user's `email` and `role` to the component (already available from the layout's `getUser()` call — no extra DB query needed).
3. Render a visible indicator: email and role badge (e.g. `test-worker@acme.test · Worker`) in the top-right of the nav.
4. Styling: subdued but legible — e.g. `text-sm text-muted-foreground` with a small pill badge for role.
5. No new shadcn component install required — use existing Badge component if available; plain `<span>` with Tailwind classes is acceptable.
6. Run `tsc --noEmit` before marking done. No new tests required — this is UI-only with no logic.

**Test requirements:** None (UI-only render; no branching logic to unit-test).

---

### T06 — Null-Owner Task Cards Unclickable (F-14)

**Finding:** F-14
**Complexity:** SIMPLE
**Estimate:** 15K
**Mode:** AFK

**Files in scope:**
- `src/components/board/SortableTaskCard.tsx` (or equivalent task card component)
- `src/components/board/TaskDetailPanel.tsx` (or equivalent)

**Steps:**
1. Read `SortableTaskCard` — identify the click handler that opens `TaskDetailPanel`; check if `owner` being `null` causes the handler to be skipped, short-circuited, or the component to not render a clickable element.
2. Read `TaskDetailPanel` — check if a null `owner` prop causes an early return or a render crash before the panel mounts.
3. Fix: ensure the click handler fires regardless of `owner` value; guard all `owner?.` accesses with null-safe patterns; display "Ingen ansvarig" (or similar placeholder) in the panel when `owner` is null.
4. Do not change the task data model or server actions — UI fix only.
5. Run `tsc --noEmit` before marking done.

**Test requirements:** None required (UI render path; if the project has component tests, add a case for `owner=null` rendering — otherwise manual verification is sufficient).

---

## Token Budget

| Task | Finding | Complexity | Estimate |
|------|---------|------------|----------|
| T01 — Cross-tenant guard: tasks.ts | F-01 | MEDIUM | 70K |
| T02 — Cross-tenant guard: board.ts | F-02 | SIMPLE | 35K |
| T03 — Worker RBAC bypass: createTask | F-08 | SIMPLE | 20K |
| T04 — Worker ownership check: updateTask | F-09 | SIMPLE | 20K |
| T05 — User identity indicator | F-10 | SIMPLE | 15K |
| T06 — Null-owner task cards | F-14 | SIMPLE | 15K |
| **TOTAL** | | | **175K** |

Ceiling: 180K. Buffer: 5K.

---

## Actuals

_To be filled at sprint close._

### Tasks completed
### Tests added
### Actual tokens used
### Carry-forward to Verify sprint
