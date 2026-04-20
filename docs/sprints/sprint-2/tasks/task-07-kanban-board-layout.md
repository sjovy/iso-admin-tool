# Task: Kanban Board Layout (Static)

**Sprint:** 2
**Feature:** Board UI — T07
**Complexity:** MEDIUM
**Estimated Tokens:** 70K
**Search Scope:** `src/types/board.ts`, `src/app/actions/board.ts`

---

## Context

**Previous work:** T06 (module list page), T02 (type contracts), T04 (getBoardData server action).
**Current state:** `getBoardData` returns `ActionResult<BoardData>` with `columns: BoardColumn[]` pre-grouped. `getBoardUsers` returns `ActionResult<TaskOwner[]>`.
**Purpose:** Primary UI surface — kanban board per module. REQ-003.

---

## Objective

Server Component page at `src/app/[tenantSlug]/modules/[moduleSlug]/page.tsx` + Client Components `KanbanBoard`, `KanbanColumn`, `TaskCard` rendering board data visually (no drag-and-drop yet).

---

## Steps

1. Create `src/components/board/TaskCard.tsx` — priority badge, owner initials from email, overdue date indicator
2. Create `src/components/board/KanbanColumn.tsx` — column header with label + task count badge, "+ Add task" button stub
3. Create `src/components/board/KanbanBoard.tsx` — "use client", receives `BoardData`, renders columns in horizontal scroll flex layout
4. Create `src/app/[tenantSlug]/modules/[moduleSlug]/page.tsx` — Server Component, fetches board data + users, passes to KanbanBoard
5. Run `pnpm tsc --noEmit`

---

## Acceptance Criteria

- [x] Board page renders tasks in correct columns
- [x] STANDARD boards show 4 columns; EXTENDED boards show 6 columns
- [x] TaskCard shows title, priority badge, owner initials, due date (red if overdue)
- [x] Page is Server Component; KanbanBoard is Client Component — boundary correct
- [x] `tsc --noEmit` passes, no `any`

---

## Verification

```bash
pnpm tsc --noEmit
```

---

## Notes

- `TaskOwner.name` is the user's email — derive initials from `email.charAt(0).toUpperCase()`.
- No drag-and-drop in this task — T08 extends KanbanBoard.
- Column labels: backlog→"Backlog", planned→"Planerad", in_progress→"Pågående", review→"Granskning", verified→"Verifierad", done→"Klar".
- Board fetches in Server Component — no client-side fetch on mount (performance requirement).

**Token tracking:** ~55K actual
**Status:** COMPLETE
