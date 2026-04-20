# Task: Task Creation Modal

**Sprint:** 2
**Feature:** Board UI — T09
**Complexity:** MEDIUM
**Estimated Tokens:** 70K
**Search Scope:** `src/components/board/KanbanColumn.tsx`, `src/app/actions/tasks.ts`

---

## Context

**Previous work:** T07 (KanbanBoard with column "+ Add task" button), T05 (createTask server action), T04 (getBoardUsers).
**Current state:** shadcn Dialog, Textarea, Select, Input, Label installed. boardUsers passed from Server Component page.
**Purpose:** Enable task creation from within a column with optimistic feedback. REQ-003.

---

## Objective

Client Component `TaskCreationModal` that opens from column header button, submits via `createTask` server action, and provides optimistic task insertion.

---

## Steps

1. Install missing shadcn: `pnpm dlx shadcn@latest add dialog textarea select input label`
2. Create `src/components/task/TaskCreationModal.tsx`
3. Fields: title (required), description, priority (default MEDIUM, required), owner (Select from boardUsers), due date (`<input type="date">`), ISO clause ref
4. Status pre-filled from column — read-only
5. On submit: call `createTask`, then `onTaskCreated(result.data)` on success
6. Inline validation: title required before server call
7. Wire `onAddTask` callback in `KanbanBoard` → set `addTaskStatus` + `isModalOpen`
8. Run `pnpm tsc --noEmit`

---

## Acceptance Criteria

- [x] Modal opens from column "+ Add task" button with correct status pre-filled
- [x] All 6 fields present and functional
- [x] Empty title shows inline validation error (no server call)
- [x] On success, `onTaskCreated` fires and task appears in correct column
- [x] On failure, toast error shown
- [x] Owner picker lists tenant users
- [x] `tsc --noEmit` passes

---

## Verification

```bash
pnpm tsc --noEmit
```

---

## Notes

- Owner picker uses Select (not Combobox) for simplicity — shadcn Combobox is a Popover+Command pattern not in the default registry.
- Due date uses plain `<input type="date">` styled with Tailwind — avoids heavy calendar library dependency.
- `boardUsers` fetched in Server Component, passed down via KanbanBoard props.

**Token tracking:** ~45K actual
**Status:** COMPLETE
