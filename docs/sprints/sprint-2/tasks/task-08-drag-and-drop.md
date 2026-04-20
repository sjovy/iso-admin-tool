# Task: Drag-and-Drop Column Movement (dnd-kit)

**Sprint:** 2
**Feature:** Board UI — T08
**Complexity:** COMPLEX
**Estimated Tokens:** 140K
**Search Scope:** `src/components/board/`, `src/app/actions/tasks.ts`

---

## Context

**Previous work:** T07 (KanbanBoard static layout), T05 (moveTask server action).
**Current state:** KanbanBoard renders columns. dnd-kit installed: `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`.
**Purpose:** Enable drag-and-drop task movement between columns with optimistic UI. REQ-003.

---

## Objective

Wire `@dnd-kit/core` + `@dnd-kit/sortable` into `KanbanBoard`. `SortableTaskCard` wraps `TaskCard` with `useSortable`. Optimistic move fires `moveTask` server action with rollback on failure.

---

## Steps

1. Install dnd-kit: `pnpm add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`
2. Create `SortableTaskCard.tsx` using `useSortable` — `disabled` prop for Worker RBAC
3. Update `KanbanBoard.tsx`: add `DndContext`, `SortableContext` per column, `DragOverlay`
4. Implement `onDragEnd`: compute source/target column, fire `moveTask`, optimistic update via `applyOptimisticMove` from `board-utils`
5. Rollback on failure + toast error via sonner
6. Install sonner: `pnpm dlx shadcn@latest add sonner`, add `<Toaster />` to root layout
7. Run `pnpm tsc --noEmit`

---

## Acceptance Criteria

- [x] Dragging task to another column moves it optimistically
- [x] `moveTask` server action fires on drag end
- [x] On failure: rollback + toast error
- [x] Worker cannot drag tasks they don't own (`disabled` on `useSortable`)
- [x] `DragOverlay` renders shadow card during drag
- [x] `tsc --noEmit` passes, no `any`

---

## Verification

```bash
pnpm tsc --noEmit
pnpm vitest run
```

---

## Notes

- `applyOptimisticMove` pure function lives in `src/lib/board-utils.ts` — exported for T11 testing.
- `PointerSensor` with `activationConstraint: { distance: 8 }` prevents accidental drags on click.
- Sonner Toaster added once to `src/app/layout.tsx`.
- RBAC check in `onDragEnd`: Worker + `task.owner?.id !== currentUserId` → show toast, no action.

**Token tracking:** ~80K actual
**Status:** COMPLETE
