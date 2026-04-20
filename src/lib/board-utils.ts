// Sprint 2 T05 — Pure board utility functions
// These are extracted for unit testability — no DB calls.
// T11 additions: groupTasksByStatus, applyOptimisticMove (also exported from KanbanBoard)

import type { BoardVariant, BoardTask, BoardColumn, TaskStatus } from '@/types/board'

const STANDARD_STATUSES = new Set(['backlog', 'in_progress', 'review', 'done'])
const EXTENDED_STATUSES = new Set(['backlog', 'planned', 'in_progress', 'review', 'verified', 'done'])

// Column definitions per variant — ordered
const STANDARD_COLUMN_DEFS: Array<{ status: TaskStatus; label: string }> = [
  { status: 'backlog', label: 'Backlog' },
  { status: 'in_progress', label: 'Pågående' },
  { status: 'review', label: 'Granskning' },
  { status: 'done', label: 'Klar' },
]

const EXTENDED_COLUMN_DEFS: Array<{ status: TaskStatus; label: string }> = [
  { status: 'backlog', label: 'Backlog' },
  { status: 'planned', label: 'Planerad' },
  { status: 'in_progress', label: 'Pågående' },
  { status: 'review', label: 'Granskning' },
  { status: 'verified', label: 'Verifierad' },
  { status: 'done', label: 'Klar' },
]

/**
 * Returns true if the given status string is valid for the board variant.
 * Pure function — no side effects, no DB.
 */
export function isValidStatus(status: string, variant: BoardVariant): boolean {
  if (variant === 'EXTENDED') {
    return EXTENDED_STATUSES.has(status)
  }
  return STANDARD_STATUSES.has(status)
}

/**
 * Returns the set of valid statuses for a board variant.
 */
export function getValidStatuses(variant: BoardVariant): readonly string[] {
  return variant === 'EXTENDED'
    ? Array.from(EXTENDED_STATUSES)
    : Array.from(STANDARD_STATUSES)
}

/**
 * Groups tasks into BoardColumn[] ordered by the variant's column order.
 * Pure function — no DB calls.
 * T11: tested in board-state.test.ts
 */
export function groupTasksByStatus(tasks: BoardTask[], variant: BoardVariant): BoardColumn[] {
  const columnDefs = variant === 'EXTENDED' ? EXTENDED_COLUMN_DEFS : STANDARD_COLUMN_DEFS
  const tasksByStatus = new Map<string, BoardTask[]>()

  for (const col of columnDefs) {
    tasksByStatus.set(col.status, [])
  }
  for (const task of tasks) {
    const bucket = tasksByStatus.get(task.status)
    if (bucket) {
      bucket.push(task)
    }
    // Tasks with unknown status are silently dropped — status is validated on write
  }

  return columnDefs.map((col) => ({
    status: col.status,
    label: col.label,
    tasks: tasksByStatus.get(col.status) ?? [],
  }))
}

/**
 * Applies an optimistic move: moves taskId from its current column to targetStatus.
 * Returns unchanged columns if taskId is not found.
 * Pure function — used in KanbanBoard and unit tested in T11.
 */
export function applyOptimisticMove(
  columns: BoardColumn[],
  taskId: string,
  targetStatus: TaskStatus
): BoardColumn[] {
  let movedTask: BoardTask | undefined

  const withoutTask = columns.map((col) => {
    const found = col.tasks.find((t) => t.id === taskId)
    if (found) {
      movedTask = found
      return { ...col, tasks: col.tasks.filter((t) => t.id !== taskId) }
    }
    return col
  })

  if (!movedTask) return columns

  const updatedTask: BoardTask = { ...movedTask, status: targetStatus }

  return withoutTask.map((col) =>
    col.status === targetStatus
      ? { ...col, tasks: [...col.tasks, updatedTask] }
      : col
  )
}
