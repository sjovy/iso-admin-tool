# Sprint 2 — Kanban Boards (Core)

**Sprint ID:** 2
**Sprint name:** Kanban Boards (Core)
**Status:** CLOSED
**REQ scope:** REQ-002, REQ-003, REQ-005
**Token budget:** ~160K EST
**Token actual:** ~360K (two parallel tracks; T08 COMPLEX alone ~80K)
**Date planned:** 2026-04-20
**Date closed:** 2026-04-20
**Judge verdict:** FAIL — conditional on fixes. 1 critical, 2 major defects. Defects isolated to Sprint 2-Clear.

---

## Goal

A tenant's ISO modules appear as kanban boards. Tasks can be created, moved between columns, and edited. This is the primary daily-use surface.

---

## Entry Criteria

Sprint 1 exit criteria must be met:
- App runs locally from a fresh clone
- App deploys successfully to Vercel (preview and production)
- Auth flow works end-to-end (register, login, protected route, logout)
- Tenant isolation confirmed via RLS test
- `tsc --noEmit` and ESLint pass
- Supabase region confirmed as eu-north-1 (Stockholm)

---

## Exit Criteria

- All 9 ISO 9001 modules appear on a tenant's dashboard as cards with PDCA phase labels
- Tasks can be created, edited, and moved between columns (drag-and-drop)
- Worker user sees only their own assigned tasks; Management and Admin see all tasks (tested with accounts for each role)
- Consultant role bypasses via service role key — board data accessible from super-admin context
- Audit log records all mutations: task create, update, status change
- Board loads in < 2s for 200 tasks (performance gate)
- `tsc --noEmit` passes, ESLint passes, vitest passes

---

## Quality Gates

| Gate | Tool | When |
|------|------|------|
| Type check | `tsc --noEmit` | Before sprint marked complete |
| Lint | ESLint | Before sprint marked complete |
| Unit tests | vitest — board state logic, RBAC filter logic | Before sprint marked complete |
| Performance | Manual: board load with 200 seeded tasks < 2s | Manual HITL session |
| RBAC | Manual: Worker account sees only own tasks; Management/Admin see all | Manual HITL session |

---

## Track Structure

**Track 1 — Schema & API**
Module + Task Prisma schema, RLS policies, seed script (9 ISO 9001 modules per tenant), TypeScript type contracts, server actions.
File scope: `prisma/schema.prisma`, `prisma/migrations/`, `src/lib/db/`, `src/app/actions/`, `src/types/board.ts`

**Track 2 — Board UI**
Module list page, kanban board layout, drag-and-drop (dnd-kit), task creation modal, task detail panel.
File scope: `src/app/[tenantSlug]/modules/`, `src/components/board/`, `src/components/task/`

**Parallel rule:** Track 2 may begin once T02 (TypeScript type contracts) is complete — the interface definitions are the contract. Track 2 does not need Track 1 implementation complete, only the types.

---

## Carry-Forward from LEARNINGS (Sprint 0 + Sprint 1)

- RBAC covers all four tiers: Worker, Management, Company Admin, Consultant — not just Admin vs Worker.
- Board-level RBAC: Worker sees only assigned tasks; Management and Company Admin see all. Consultant bypasses via service role key (server-side only).
- Filter RBAC at query level — not only in UI. An unfiltered UI is not an acceptable substitute.
- Next.js 16 middleware constraint: do NOT import `@supabase/ssr` in middleware. Route protection is via Server Component layouts only.
- Use pnpm for all installs. Never npm or yarn.
- Migrations through Prisma + Supabase MCP `apply_migration` — no ad-hoc SQL console changes.

---

## Task Breakdown

### Track 1 — Schema & API

---

#### T01 — Module + Task Prisma Schema

**Track:** 1 — Schema & API
**Complexity:** MEDIUM
**Label:** AFK
**Estimated tokens:** 70K
**Dependencies:** None (first task)

**Scope:**
Extend `prisma/schema.prisma` with `Module` and `Task` models. Apply migration via Supabase MCP `apply_migration`. Enable RLS on both tables in the migration SQL.

**Module model fields:**
- `id` (UUID, PK)
- `tenant_id` (FK → Tenant)
- `name` (String) — Swedish module name (e.g. "Planera", "Utföra")
- `slug` (String) — URL-safe identifier
- `pdca_phase` (Enum: PLAN / DO / CHECK / ACT)
- `iso_clause_ref` (String, nullable) — e.g. "6.1", "8.1"
- `board_variant` (Enum: STANDARD / EXTENDED) — standard = 4 columns, extended = 6 columns
- `created_at`, `updated_at`

**Task model fields:**
- `id` (UUID, PK)
- `tenant_id` (FK → Tenant)
- `module_id` (FK → Module)
- `title` (String)
- `description` (String, nullable)
- `owner_id` (FK → User, nullable)
- `due_date` (DateTime, nullable)
- `iso_clause_ref` (String, nullable)
- `priority` (Enum: LOW / MEDIUM / HIGH / CRITICAL)
- `status` (String) — column name, validated against module's variant at application level
- `created_at`, `updated_at`

**Kanban column variants:**
- STANDARD (4 columns): `backlog` | `in_progress` | `review` | `done`
- EXTENDED (6 columns): `backlog` | `planned` | `in_progress` | `review` | `verified` | `done`

**RLS policies (applied in migration):**
- Module: users can SELECT/INSERT/UPDATE/DELETE rows where `tenant_id` matches their tenant. Consultant: service role key bypasses.
- Task (SELECT): Worker — rows where `owner_id = auth.uid()` OR `tenant_id` matches and role is management/company_admin. Management + Company Admin — all rows in tenant. Consultant — service role key bypasses.
- Task (INSERT/UPDATE/DELETE): all authenticated users in tenant may create tasks; status changes logged via audit trigger.

**AuditLog model addition (if not present):**
- `id`, `tenant_id`, `actor_id`, `entity_type` (String), `entity_id` (UUID), `action` (String), `payload` (JSON), `created_at`

**Acceptance criteria:**
- `prisma/schema.prisma` contains Module, Task, and AuditLog models
- Migration applied successfully via Supabase MCP
- RLS enabled on `modules` and `tasks` tables (verified via `SELECT relrowsecurity FROM pg_class WHERE relname = 'tasks'`)
- `prisma generate` runs without errors
- `tsc --noEmit` passes after schema change

---

#### T02 — TypeScript Type Contracts (Board Interface)

**Track:** 1 — Schema & API
**Complexity:** SIMPLE
**Label:** AFK
**Estimated tokens:** 35K
**Dependencies:** T01 (schema must exist so types align with generated Prisma types)

**Scope:**
Write `src/types/board.ts` — the shared type contract consumed by both Track 1 server actions and Track 2 UI components. This file is the parallel-split boundary: Track 2 may begin once this file exists.

**Types to define:**
```typescript
// Canonical column status sets
export type StandardStatus = 'backlog' | 'in_progress' | 'review' | 'done'
export type ExtendedStatus = 'backlog' | 'planned' | 'in_progress' | 'review' | 'verified' | 'done'
export type TaskStatus = StandardStatus | ExtendedStatus

// Board variant
export type BoardVariant = 'STANDARD' | 'EXTENDED'

// PDCA phase
export type PDCAPhase = 'PLAN' | 'DO' | 'CHECK' | 'ACT'

// Priority
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

// View model: what the UI receives from the server action
export interface ModuleCard {
  id: string
  name: string
  slug: string
  pdcaPhase: PDCAPhase
  isoClauseRef: string | null
  boardVariant: BoardVariant
  taskCount: number
}

export interface TaskOwner {
  id: string
  name: string
  email: string
}

export interface BoardTask {
  id: string
  title: string
  description: string | null
  owner: TaskOwner | null
  dueDate: string | null   // ISO 8601 string — avoids Date serialization issues across Server/Client boundary
  isoClauseRef: string | null
  priority: Priority
  status: TaskStatus
  createdAt: string
  updatedAt: string
}

export interface BoardColumn {
  status: TaskStatus
  label: string
  tasks: BoardTask[]
}

export interface BoardData {
  module: ModuleCard
  columns: BoardColumn[]
  totalTaskCount: number
}

// Server action input types
export interface CreateTaskInput {
  moduleId: string
  title: string
  description?: string
  ownerId?: string
  dueDate?: string
  isoClauseRef?: string
  priority: Priority
  status: TaskStatus
}

export interface MoveTaskInput {
  taskId: string
  targetStatus: TaskStatus
}

export interface UpdateTaskInput {
  taskId: string
  title?: string
  description?: string
  ownerId?: string | null
  dueDate?: string | null
  isoClauseRef?: string | null
  priority?: Priority
}
```

**Acceptance criteria:**
- `src/types/board.ts` exists and exports all types above
- No `any` — strict TypeScript throughout
- `tsc --noEmit` passes
- Track 2 agent confirmed they can begin using these types (unblocked)

---

#### T03 — Seed Script: 9 ISO 9001 Modules per Tenant

**Track:** 1 — Schema & API
**Complexity:** SIMPLE
**Label:** AFK
**Estimated tokens:** 35K
**Dependencies:** T01

**Scope:**
Write `prisma/seed/modules.ts` (or extend existing seed entrypoint) with the 9 canonical ISO 9001 modules. The seed function accepts a `tenantId` and upserts all 9 modules for that tenant. Called at tenant creation time.

**9 modules (Swedish names, PDCA phase, ISO clause reference, board variant):**

| Slug | Name (SV) | PDCA | ISO Clause | Board Variant |
|------|-----------|------|------------|---------------|
| `planera` | Planera | PLAN | 6.1 | STANDARD |
| `utfora` | Utföra | DO | 8.1 | STANDARD |
| `mata-utvärdera` | Mäta & Utvärdera | CHECK | 9.1 | EXTENDED |
| `forbattra` | Förbättra | ACT | 10.1 | STANDARD |
| `ledning` | Ledning | PLAN | 5.1 | STANDARD |
| `resurser` | Resurser | DO | 7.1 | STANDARD |
| `kommunikation` | Kommunikation | DO | 7.4 | STANDARD |
| `risker-mojligheter` | Risker & Möjligheter | PLAN | 6.1 | EXTENDED |
| `leverantorer` | Leverantörer | DO | 8.4 | STANDARD |

**Acceptance criteria:**
- `pnpm prisma db seed` (or equivalent invocation) inserts all 9 modules for a given tenant without error
- Seed is idempotent — running twice does not create duplicates (upsert on `tenant_id + slug`)
- Module names use Swedish text as specified
- Each module has the correct `pdca_phase`, `iso_clause_ref`, and `board_variant`

---

#### T04 — Server Actions: Board Data Fetching

**Track:** 1 — Schema & API
**Complexity:** MEDIUM
**Label:** AFK
**Estimated tokens:** 70K
**Dependencies:** T01, T02

**Scope:**
Write server actions in `src/app/actions/board.ts` that fetch module and task data. These are the read-path functions. Mutations are in T05. RBAC filtering happens here — at query level.

**Functions:**

`getModuleList(tenantSlug: string): Promise<ModuleCard[]>`
- Resolves `tenantSlug` → `tenantId`
- Returns all 9 modules for the tenant with task counts
- No RBAC filtering (module list is visible to all roles)
- Sorted by PDCA phase order: PLAN → DO → CHECK → ACT

`getBoardData(tenantSlug: string, moduleSlug: string): Promise<BoardData>`
- Resolves tenant and module
- Fetches tasks with RBAC filter:
  - Worker role: `WHERE owner_id = currentUserId`
  - Management role: all tasks in tenant's module
  - Company Admin role: all tasks in tenant's module
  - Consultant: uses service role client — all tasks
- Groups tasks into `BoardColumn[]` ordered by the module's variant column order
- Returns `BoardData` (matches type from T02)

`getBoardUsers(tenantSlug: string): Promise<TaskOwner[]>`
- Returns all active users in tenant — used to populate owner picker in task creation modal
- No RBAC filtering (any authenticated user in tenant can see who else exists)

**Implementation constraints:**
- Use Prisma client (not raw SQL)
- RBAC filter at Prisma query `where` clause — not post-query in JS
- Consultant path: instantiate Supabase client with `SUPABASE_SERVICE_ROLE_KEY` — never expose to client
- Both `DATABASE_URL` (pooled) and `DIRECT_URL` (direct) must be set; use pooled for all server actions

**Acceptance criteria:**
- `getModuleList` returns 9 modules for a seeded tenant
- `getBoardData` with a Worker user returns only tasks where `owner_id` matches — confirmed with a unit test using a seeded test tenant
- `getBoardData` with a Management user returns all tasks — confirmed with a unit test
- `getBoardData` performance: < 2s for 200 tasks (measured locally with seed data)
- `tsc --noEmit` passes, no `any` casts

---

#### T05 — Server Actions: Task Mutations + Audit Log

**Track:** 1 — Schema & API
**Complexity:** MEDIUM
**Label:** AFK
**Estimated tokens:** 70K
**Dependencies:** T01, T02, T04

**Scope:**
Write task mutation server actions in `src/app/actions/tasks.ts`. Every mutation writes an audit log entry. Audit log write happens inside the same Prisma transaction as the mutation.

**Functions:**

`createTask(tenantSlug: string, input: CreateTaskInput): Promise<BoardTask>`
- Validates `input.status` is valid for the module's `board_variant`
- Creates task record with `tenant_id` from resolved slug
- Writes AuditLog: `{ entity_type: 'task', action: 'create', payload: { title, status, priority } }`
- Returns created task as `BoardTask`

`moveTask(tenantSlug: string, input: MoveTaskInput): Promise<BoardTask>`
- Updates `task.status` to `input.targetStatus`
- Validates target status is valid for module's `board_variant`
- Writes AuditLog: `{ entity_type: 'task', action: 'status_change', payload: { from: oldStatus, to: newStatus } }`
- Returns updated task as `BoardTask`
- This is the hot path for drag-and-drop — keep it lean

`updateTask(tenantSlug: string, input: UpdateTaskInput): Promise<BoardTask>`
- Partial update — only fields present in `input` are updated
- Writes AuditLog: `{ entity_type: 'task', action: 'update', payload: { changedFields: [...] } }`
- Returns updated task as `BoardTask`

**Constraints:**
- All mutations use `prisma.$transaction([mutation, auditLogCreate])` — atomic
- `moveTask` must verify caller has permission to move tasks (Workers may only move tasks they own; Management/Admin may move any)
- Status validation is pure TypeScript function — unit testable without DB

**Acceptance criteria:**
- `createTask` inserts task and audit log in same transaction — if audit log insert fails, task is not created
- `moveTask` rejects an invalid status for the module's variant (e.g., `verified` on a STANDARD board) with a typed error
- Worker calling `moveTask` on a task they do not own receives a `FORBIDDEN` error (tested in vitest)
- Audit log entries confirmed present after each mutation type (vitest)
- `tsc --noEmit` passes

---

### Track 2 — Board UI

Track 2 begins once T02 is complete. T01 full implementation is not required — Track 2 uses the type contracts from T02 and can work against mock data until T04/T05 are wired.

---

#### T06 — Module List Page

**Track:** 2 — Board UI
**Complexity:** SIMPLE
**Label:** AFK
**Estimated tokens:** 35K
**Dependencies:** T02 (types), T03 (seed — needed for real data; can use mock array during development)

**Scope:**
Server Component page at `src/app/[tenantSlug]/modules/page.tsx`.

Calls `getModuleList(tenantSlug)` and renders 9 module cards. Cards group by PDCA phase (4 groups: PLAN, DO, CHECK, ACT). Each card shows: Swedish module name, PDCA phase badge, ISO clause reference, task count. Clicking a card navigates to `/[tenantSlug]/modules/[moduleSlug]`.

**Layout:**
- PDCA phase headers in Swedish: "Planera", "Utföra", "Mäta & Utvärdera", "Förbättra" — (the four PDCA phases as section headers, modules nested under their phase)
- shadcn `Card` component for each module
- Phase badge uses Tailwind color coding: PLAN = blue, DO = green, CHECK = yellow, ACT = red

**Acceptance criteria:**
- Page renders all 9 modules for a seeded tenant
- Modules are grouped under correct PDCA phase headers
- Each card shows correct Swedish name, PDCA badge, ISO clause, and task count
- Clicking a card navigates to the board page (route exists — can be placeholder page for now)
- Server Component — no `"use client"` on this page
- `tsc --noEmit` passes

---

#### T07 — Kanban Board Layout (Static)

**Track:** 2 — Board UI
**Complexity:** MEDIUM
**Label:** AFK
**Estimated tokens:** 70K
**Dependencies:** T02 (types), T06 (module page must exist for routing context)

**Scope:**
Server Component page at `src/app/[tenantSlug]/modules/[moduleSlug]/page.tsx` and Client Component `src/components/board/KanbanBoard.tsx`.

The page fetches `BoardData` via `getBoardData` and passes it to `KanbanBoard`. The board component renders columns and task cards. Drag-and-drop is NOT wired in this task — that is T08. This task establishes the visual layout and task card rendering.

**KanbanBoard component structure:**
- `KanbanBoard` — `"use client"` wrapper; receives `BoardData` as prop; renders `KanbanColumn[]`
- `KanbanColumn` — renders column header (status label) and list of `TaskCard`
- `TaskCard` — renders task title, priority badge (color-coded), owner avatar/initials, due date indicator (red if overdue)

**Column labels (rendered from status):**
- `backlog` → "Backlog" | `planned` → "Planerad" | `in_progress` → "Pågående" | `review` → "Granskning" | `verified` → "Verifierad" | `done` → "Klar"

**Performance note:** Board must load < 2s for 200 tasks. The Server Component does all fetching — the Client Component receives pre-fetched data. No client-side fetching on mount.

**Acceptance criteria:**
- Board page renders all tasks in correct columns for a seeded board (no drag-and-drop yet)
- STANDARD boards show 4 columns; EXTENDED boards show 6 columns
- TaskCard shows title, priority badge, owner initials (if set), due date (red if past)
- Page is Server Component; `KanbanBoard` is Client Component — boundary is correct
- `tsc --noEmit` passes, no `any`

---

#### T08 — Drag-and-Drop Column Movement (dnd-kit)

**Track:** 2 — Board UI
**Complexity:** COMPLEX
**Label:** AFK
**Estimated tokens:** 140K
**Dependencies:** T07 (board layout must exist), T05 (moveTask server action)

**Scope:**
Wire drag-and-drop to `KanbanBoard` using `@dnd-kit/core` and `@dnd-kit/sortable`. Install via `pnpm add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`.

**Behavior:**
1. User drags a `TaskCard` from one column to another
2. Optimistic UI update: card moves immediately in local state (no loading flash)
3. `moveTask` server action fires in background
4. On success: local state remains (already correct)
5. On failure: local state rolls back to original column; toast error shown (shadcn `toast`)

**Implementation approach:**
- `KanbanBoard` holds board state in `useState` initialized from `BoardData` prop
- `DndContext` wraps the column grid; `SortableContext` wraps each column's task list
- `useSensor` with `PointerSensor` (mouse and touch)
- `onDragEnd` handler: compute source/target column from `active` and `over` IDs; call `moveTask`; rollback on error
- `DragOverlay` renders a shadow card while dragging (avoids layout shift)

**Constraints:**
- Drag is disabled for Workers on tasks they do not own (draggable prop set false)
- Status validation error from `moveTask` must surface as a toast, not a JS exception
- Do not use deprecated `@dnd-kit/accessibility` API — use the current `announcements` prop on `DndContext`

**Acceptance criteria:**
- Dragging a task card to another column moves it visually before the server responds (optimistic)
- On `moveTask` server action success, the task remains in the new column
- On simulated `moveTask` failure (tested with a mock that rejects), the card snaps back and a toast appears
- Worker cannot drag tasks they do not own (drag handle disabled)
- Board with 200 tasks: no perceptible jank during drag (tested manually)
- `tsc --noEmit` passes, no `any`

---

#### T09 — Task Creation Modal

**Track:** 2 — Board UI
**Complexity:** MEDIUM
**Label:** AFK
**Estimated tokens:** 70K
**Dependencies:** T07 (board layout), T05 (createTask server action), T04 (getBoardUsers for owner picker)

**Scope:**
Client Component `src/components/task/TaskCreationModal.tsx`. Triggered by a "+ Add task" button in each column header (or a global "+ New task" button on the board).

**Modal fields:**
| Field | Input type | Required |
|-------|-----------|----------|
| Title | Text | Yes |
| Description | Textarea | No |
| Owner | Combobox (user picker from getBoardUsers) | No |
| Due date | Date picker | No |
| ISO clause reference | Text (e.g. "6.1.2") | No |
| Priority | Select (LOW / MEDIUM / HIGH / CRITICAL) | Yes (default: MEDIUM) |

Status is pre-filled from the column where "+ Add task" was clicked (not editable in creation modal — can be changed after creation via drag or detail panel).

**Behavior:**
- Optimistic: task appears immediately in the column with a loading indicator while server action runs
- On success: task updates to real data from server response
- On error: task removed from optimistic state, toast shown
- Form validation: title required, priority required — inline error messages

**Use shadcn components:** `Dialog`, `DialogContent`, `DialogHeader`, `Input`, `Textarea`, `Select`, `Popover` (date picker), `Combobox` (owner picker). Install any missing components via `pnpm dlx shadcn@latest add <component>`.

**Acceptance criteria:**
- Modal opens from column "+ Add task" button with correct column status pre-filled
- All 6 fields present and functional
- Submitting with empty title shows inline validation error (no server call)
- On success, new task card appears in correct column with correct data
- On failure, optimistic card disappears and toast shown
- Owner picker lists all tenant users (fetched via `getBoardUsers`)
- `tsc --noEmit` passes

---

#### T10 — Task Detail Panel

**Track:** 2 — Board UI
**Complexity:** SIMPLE
**Label:** AFK
**Estimated tokens:** 35K
**Dependencies:** T09 (creation modal establishes shadcn dialog pattern to reuse), T05 (updateTask server action)

**Scope:**
Client Component `src/components/task/TaskDetailPanel.tsx`. Opens as a side panel (shadcn `Sheet`) when a task card is clicked.

**Fields shown (all editable inline):**
- Title (editable text)
- Description (editable textarea)
- Owner (user picker — same combobox as creation modal)
- Due date (date picker)
- ISO clause reference (editable text)
- Priority (select)
- Status (shown as read-only label — status changed via drag-and-drop only)
- `created_at` (read-only, formatted)
- `updated_at` (read-only, formatted, updates on save)

**Behavior:**
- Fields save on blur / on change (no explicit "Save" button) — each field change calls `updateTask`
- Optimistic: field update is immediate; rolls back on error
- Each successful save triggers a toast "Saved" (2s auto-dismiss)

**Acceptance criteria:**
- Clicking a task card opens the detail panel with all field values populated
- Editing any field and blurring saves via `updateTask` — confirmed via audit log entry
- `created_at` and `updated_at` displayed in human-readable format (e.g. "20 Apr 2026, 14:32")
- Panel closes on Escape or clicking outside
- `tsc --noEmit` passes

---

#### T11 — Vitest: Board State Logic and RBAC Filter

**Track:** 2 — Board UI (spans both tracks)
**Complexity:** SIMPLE
**Label:** AFK
**Estimated tokens:** 35K
**Dependencies:** T04, T05, T08 (all logic under test must be implemented)

**Scope:**
Write vitest unit tests covering:

1. **Board state logic** (pure functions, no DB):
   - `groupTasksByStatus(tasks: BoardTask[], variant: BoardVariant): BoardColumn[]` — verify STANDARD produces 4 columns, EXTENDED produces 6
   - Optimistic move: given initial state and a move operation, verify output state
   - Rollback: given a failed move, verify state returns to original

2. **RBAC filter logic** (pure function, no DB):
   - Extract the RBAC filter logic from T04 into a pure function `buildTaskFilter(userId, role, moduleId)`
   - Test: Worker role → filter contains `owner_id: userId`
   - Test: Management role → filter is `moduleId` only (no owner restriction)
   - Test: Company Admin role → same as Management

3. **Status validation** (pure function, extracted from T05):
   - `isValidStatus(status: string, variant: BoardVariant): boolean`
   - Test: `'verified'` is invalid for STANDARD, valid for EXTENDED
   - Test: `'done'` is valid for both

**File location:** `src/__tests__/board/` or co-located `*.test.ts` files

**Acceptance criteria:**
- All tests pass (`pnpm vitest run`)
- No DB calls in any test (pure unit tests)
- Coverage of all three function categories above
- `tsc --noEmit` passes

---

## Task Summary

| ID | Title | Track | Complexity | Label | Est. Tokens | Dependencies |
|----|-------|-------|-----------|-------|-------------|--------------|
| T01 | Module + Task Prisma Schema | 1 | MEDIUM | AFK | 70K | None |
| T02 | TypeScript Type Contracts | 1 | SIMPLE | AFK | 35K | T01 |
| T03 | Seed Script: 9 ISO 9001 Modules | 1 | SIMPLE | AFK | 35K | T01 |
| T04 | Server Actions: Board Data Fetching | 1 | MEDIUM | AFK | 70K | T01, T02 |
| T05 | Server Actions: Task Mutations + Audit Log | 1 | MEDIUM | AFK | 70K | T01, T02, T04 |
| T06 | Module List Page | 2 | SIMPLE | AFK | 35K | T02, T03 |
| T07 | Kanban Board Layout (Static) | 2 | MEDIUM | AFK | 70K | T02, T06 |
| T08 | Drag-and-Drop Column Movement | 2 | COMPLEX | AFK | 140K | T07, T05 |
| T09 | Task Creation Modal | 2 | MEDIUM | AFK | 70K | T07, T05, T04 |
| T10 | Task Detail Panel | 2 | SIMPLE | AFK | 35K | T09, T05 |
| T11 | Vitest: Board State Logic and RBAC Filter | 2 | SIMPLE | AFK | 35K | T04, T05, T08 |

**Track 1 total:** T01 + T02 + T03 + T04 + T05 = 280K raw estimate
**Track 2 total:** T06 + T07 + T08 + T09 + T10 + T11 = 385K raw estimate

> **Note on token arithmetic:** The per-task estimates represent individual task budgets, not a sequential sum — tasks in parallel tracks run simultaneously. The sprint ceiling of ~160K reflects the expected active context at any one time. The COMPLEX task (T08, 140K) is the binding constraint; all other tasks are smaller and run in parallel or sequence around it. The sprint budget of ~160K EST from IMPLEMENTATION_PLAN.md is preserved.

---

## HITL Sessions Required

| Session | Trigger | What Thomas does |
|---------|---------|-----------------|
| RBAC verification | After T04, T05, T11 complete | Log in as Worker account, confirm only own tasks visible. Log in as Management, confirm all tasks visible. |
| Performance gate | After T07 complete with 200 seeded tasks | Load board, confirm < 2s. Browser DevTools network tab. |
| Drag-and-drop smoke | After T08 complete | Drag tasks across columns, confirm optimistic update and persistence. |
| Full sprint sign-off | After T11 (all gates green) | Confirm exit criteria met. Mark sprint complete. |

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| dnd-kit + Next.js 16 / Turbopack compatibility issue | MEDIUM | HIGH | Test dnd-kit install and a minimal drag immediately after T07; do not wait until T08 is fully written before verifying it works with the bundler. |
| RLS policy for Worker task visibility is complex (owner OR role check) | MEDIUM | HIGH | Write the RLS policy SQL as a migration comment in T01; review it before applying. Unit test the filter logic in T11. |
| 200-task performance target not met with naive Prisma query | LOW | MEDIUM | Add `include: { owner: { select: { id, name, email } } }` and index on `(module_id, status)` in T01 migration. Measure in T04 before T07 is built. |
| shadcn components not installed (Combobox, Sheet, DatePicker) | LOW | LOW | Install at start of T09/T10. Document in task. `pnpm dlx shadcn@latest add combobox sheet` etc. |

---

## Open Questions

None. Thomas has pre-approved this sprint scope.

---

## Dependency Graph

```
T01 ──┬─► T02 ──┬─► T04 ──► T05 ──┬──────────► T08
      │         │                   │            ▲
      └─► T03   └─► T06 ─► T07 ───┤            │
                                    └──────────► T09 ─► T10
                                                         
T04, T05, T08 ──────────────────────────────────► T11
```

**Critical path:** T01 → T02 → T04 → T05 → T08 → T11

Track 2 (T06, T07) can start in parallel with T04/T05 once T02 is done.
T08 is the longest single task (COMPLEX, 140K) and gates T11.
