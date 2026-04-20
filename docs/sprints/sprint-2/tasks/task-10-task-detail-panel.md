# Task: Task Detail Panel

**Sprint:** 2
**Feature:** Board UI — T10
**Complexity:** SIMPLE
**Estimated Tokens:** 35K
**Search Scope:** `src/components/task/TaskCreationModal.tsx`, `src/app/actions/tasks.ts`

---

## Context

**Previous work:** T09 (TaskCreationModal established shadcn Dialog pattern), T05 (updateTask server action).
**Current state:** shadcn Sheet installed. `updateTask` returns `ActionResult<BoardTask>` with partial field updates.
**Purpose:** Inline editing of all task fields from a side panel. REQ-003.

---

## Objective

Client Component `TaskDetailPanel` (Sheet) that opens on TaskCard click, allows inline editing of all fields, saves on blur via `updateTask`, with optimistic update and rollback.

---

## Steps

1. Install shadcn Sheet: `pnpm dlx shadcn@latest add sheet`
2. Create `src/components/task/TaskDetailPanel.tsx`
3. Initialize field state from task prop — parent renders with `key={task.id}` to reset on task change (avoids useEffect+setState pattern)
4. Each field: blur/change → `updateTask` → toast "Sparat" (2s) on success, rollback on failure
5. Status shown as read-only label with note "changed via drag-and-drop only"
6. `created_at`, `updated_at` shown read-only in `sv-SE` locale format
7. Run `pnpm tsc --noEmit`

---

## Acceptance Criteria

- [x] Clicking a TaskCard opens the panel with all field values populated
- [x] Editing any field and blurring saves via `updateTask`
- [x] `created_at` and `updated_at` displayed human-readable
- [x] Panel closes on Escape or clicking outside (Sheet default behavior)
- [x] `tsc --noEmit` passes

---

## Verification

```bash
pnpm tsc --noEmit
pnpm eslint . --max-warnings 0
```

---

## Notes

- ESLint rule `react-hooks/set-state-in-effect` prevents `useEffect` + `setState` pattern.
  Solution: parent passes `key={selectedTask?.id ?? 'none'}` to TaskDetailPanel, causing remount on task change, so `useState` initializers run fresh without an effect.
- `saveField` accepts `Omit<UpdateTaskInput, 'taskId'>` — taskId is always `task.id`.
- Select `onValueChange` fires immediately (no blur needed) — saves on change for priority and owner.

**Token tracking:** ~30K actual
**Status:** COMPLETE
