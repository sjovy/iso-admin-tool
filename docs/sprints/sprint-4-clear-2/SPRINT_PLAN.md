# Sprint 4-Clear-2 — Quality Gate (Sprints 2–3) — Clear Pass 2

**Type:** Clear
**Fixes:** F-15 only
**Token Budget:** 60K
**Status:** PENDING

---

## Scope Boundary
Fix only F-15. No new features. No refactoring beyond what F-15 requires.

---

## Entry Criteria
- Sprint 4 Review CLOSED
- Sprint 4-Clear CLOSED
- tsc, ESLint, vitest all pass on current main

---

## Exit Criteria
| Check | Command | Pass Condition |
|-------|---------|----------------|
| TypeScript | `npx tsc --noEmit` | Zero errors |
| ESLint | `npx eslint src --max-warnings 0` | Zero warnings |
| Vitest | `npx vitest run` | All tests pass |
| Build | `pnpm build` | Zero errors |
| Smoke test | Run smoke-test skill | All scenarios pass |

---

## Tasks

### T01 — Add `onDragOver` handler to `KanbanBoard.tsx`

**File:** `src/components/board/KanbanBoard.tsx`

**What to change:**

1. Import `DragOverEvent` from `@dnd-kit/core` (add to the existing import block).
2. Implement `handleDragOver` as a `useCallback`:
   - Receive `DragOverEvent` with `active` and `over`.
   - If `over` is null, return early.
   - Determine `activeContainer` — the column status whose `tasks` array contains `active.id`.
   - Determine `overContainer` — if `over.id` matches a column status, that status; otherwise find the column whose tasks contain `over.id`.
   - If `activeContainer === overContainer` or either is undefined, return early.
   - Call `setColumns(prev => applyOptimisticMove(prev, active.id as string, overContainer))` so the task is live-transferred to the target column during drag.
   - Add `columns` to the `useCallback` dependency array.
3. Wire `onDragOver={handleDragOver}` on the `<DndContext>` element.

**Expected result:** Items transfer between `SortableContext` containers as the pointer crosses column boundaries during drag, so `over.id` at `onDragEnd` correctly resolves to the target container.

**Note on `handleDragEnd` (judge-confirmed):** Because the live transfer already moves the task, `handleDragEnd` will see `sourceColumn.status === targetStatus` for cross-column drops (task already in target by `onDragEnd`). Additionally, `handleDragEnd` reads `columns` from a stale closure — after `onDragOver` calls `setColumns`, the columns loop in `handleDragEnd` will find the task in the wrong column. Both problems are solved by the same fix: store the drag-start source column status in a `useRef` (`dragSourceStatus`) set in `handleDragStart`, and use it in `handleDragEnd` instead of re-deriving from `columns` state. Remove the early-return guard `if (targetStatus === sourceColumn.status) return` and replace it with `if (targetStatus === dragSourceStatus.current) return` (no-op only if dropped back in the original column).

---

### T02 — Add `useDroppable` to `KanbanColumn.tsx`

**File:** `src/components/board/KanbanColumn.tsx`

**What to change:**

1. Import `useDroppable` from `@dnd-kit/core`.
2. Call `useDroppable({ id: column.status })` inside the component. Destructure `setNodeRef`.
3. Attach `ref={setNodeRef}` to the task-list `<div>` (the one with class `flex flex-col gap-2 p-2 flex-1 min-h-[120px]`).

**Expected result:** Each column body is a registered drop target. Empty columns can now receive drops — dnd-kit resolves `over` to the column's droppable node instead of null when the pointer is over an empty column area.

---

### T03 — Add/extend unit tests for `onDragOver` live transfer

**File:** `src/__tests__/board/board-state.test.ts`

**What to change:**

Add a new `describe` block `'onDragOver — live column transfer'` that tests `applyOptimisticMove` in the cross-column drag scenario (since `handleDragOver` delegates to `applyOptimisticMove`):

1. **Cross-column transfer moves task immediately** — call `applyOptimisticMove` with a task in `backlog`, target `in_progress`; assert task is in `in_progress`, absent from `backlog`.
2. **Idempotent on same-column call** — call `applyOptimisticMove` with task already in target column; assert column lengths are unchanged (the guard in `handleDragOver` prevents this, but `applyOptimisticMove` itself should not corrupt state if called anyway — verify it returns a column array with a duplicate or the original depending on implementation; document the actual behaviour).
3. **Empty target column receives task** — columns where target has zero tasks; assert target ends with exactly one task after the call.

**Expected result:** All new tests pass with `npx vitest run`. No changes to existing test cases.

---

### T04 — Verification pass

Run all checks in order and confirm zero failures:

```
npx tsc --noEmit
npx eslint src --max-warnings 0
npx vitest run
pnpm build
```

Then run the smoke-test skill.

**Expected result:** All checks pass. Kanban drag-and-drop moves cards correctly across columns and within columns for all roles. Empty columns accept drops.
