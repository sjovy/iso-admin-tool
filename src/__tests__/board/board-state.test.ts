// Sprint 2 T11 — Unit tests for board state logic
// Pure function tests — no DB calls, no network.

import { describe, it, expect } from 'vitest'
import { groupTasksByStatus, applyOptimisticMove } from '@/lib/board-utils'
import type { BoardTask, BoardColumn } from '@/types/board'

// ─── Test helpers ─────────────────────────────────────────────────────────────

function makeTask(overrides: Partial<BoardTask> & { id: string; status: BoardTask['status'] }): BoardTask {
  return {
    title: 'Test task',
    description: null,
    owner: null,
    dueDate: null,
    isoClauseRef: null,
    priority: 'MEDIUM',
    createdAt: '2026-04-20T00:00:00.000Z',
    updatedAt: '2026-04-20T00:00:00.000Z',
    ...overrides,
  }
}

function makeColumns(statuses: string[]): BoardColumn[] {
  return statuses.map((status) => ({
    status: status as BoardTask['status'],
    label: status,
    tasks: [],
  }))
}

// ─── groupTasksByStatus ────────────────────────────────────────────────────────

describe('groupTasksByStatus — STANDARD variant', () => {
  it('returns exactly 4 columns in correct order', () => {
    const columns = groupTasksByStatus([], 'STANDARD')
    expect(columns).toHaveLength(4)
    expect(columns.map((c) => c.status)).toEqual(['backlog', 'in_progress', 'review', 'done'])
  })

  it('all columns are initially empty when no tasks provided', () => {
    const columns = groupTasksByStatus([], 'STANDARD')
    for (const col of columns) {
      expect(col.tasks).toHaveLength(0)
    }
  })

  it('distributes tasks to correct columns', () => {
    const tasks: BoardTask[] = [
      makeTask({ id: '1', status: 'backlog' }),
      makeTask({ id: '2', status: 'backlog' }),
      makeTask({ id: '3', status: 'done' }),
      makeTask({ id: '4', status: 'review' }),
    ]
    const columns = groupTasksByStatus(tasks, 'STANDARD')

    const backlog = columns.find((c) => c.status === 'backlog')!
    const done = columns.find((c) => c.status === 'done')!
    const review = columns.find((c) => c.status === 'review')!
    const inProgress = columns.find((c) => c.status === 'in_progress')!

    expect(backlog.tasks).toHaveLength(2)
    expect(done.tasks).toHaveLength(1)
    expect(review.tasks).toHaveLength(1)
    expect(inProgress.tasks).toHaveLength(0)
  })

  it('silently drops tasks with invalid status for STANDARD', () => {
    const tasks: BoardTask[] = [
      makeTask({ id: '1', status: 'backlog' }),
      makeTask({ id: '2', status: 'verified' }), // EXTENDED only — not valid for STANDARD
    ]
    const columns = groupTasksByStatus(tasks, 'STANDARD')
    const totalTasks = columns.reduce((sum, col) => sum + col.tasks.length, 0)
    // 'verified' task is dropped — only the backlog task is included
    expect(totalTasks).toBe(1)
  })
})

describe('groupTasksByStatus — EXTENDED variant', () => {
  it('returns exactly 6 columns in correct order', () => {
    const columns = groupTasksByStatus([], 'EXTENDED')
    expect(columns).toHaveLength(6)
    expect(columns.map((c) => c.status)).toEqual([
      'backlog',
      'planned',
      'in_progress',
      'review',
      'verified',
      'done',
    ])
  })

  it('distributes tasks to all 6 columns correctly', () => {
    const tasks: BoardTask[] = [
      makeTask({ id: '1', status: 'backlog' }),
      makeTask({ id: '2', status: 'planned' }),
      makeTask({ id: '3', status: 'in_progress' }),
      makeTask({ id: '4', status: 'review' }),
      makeTask({ id: '5', status: 'verified' }),
      makeTask({ id: '6', status: 'done' }),
    ]
    const columns = groupTasksByStatus(tasks, 'EXTENDED')

    for (const col of columns) {
      expect(col.tasks).toHaveLength(1)
    }
  })

  it('includes verified column for EXTENDED', () => {
    const tasks: BoardTask[] = [makeTask({ id: '1', status: 'verified' })]
    const columns = groupTasksByStatus(tasks, 'EXTENDED')
    const verifiedCol = columns.find((c) => c.status === 'verified')!
    expect(verifiedCol).toBeDefined()
    expect(verifiedCol.tasks).toHaveLength(1)
  })
})

// ─── applyOptimisticMove ───────────────────────────────────────────────────────

describe('applyOptimisticMove', () => {
  it('moves a task from source column to target column', () => {
    const columns: BoardColumn[] = [
      { status: 'backlog', label: 'Backlog', tasks: [makeTask({ id: 'task-1', status: 'backlog' })] },
      { status: 'in_progress', label: 'Pågående', tasks: [] },
      { status: 'review', label: 'Granskning', tasks: [] },
      { status: 'done', label: 'Klar', tasks: [] },
    ]

    const result = applyOptimisticMove(columns, 'task-1', 'in_progress')

    const backlog = result.find((c) => c.status === 'backlog')!
    const inProgress = result.find((c) => c.status === 'in_progress')!

    expect(backlog.tasks).toHaveLength(0)
    expect(inProgress.tasks).toHaveLength(1)
    expect(inProgress.tasks[0].id).toBe('task-1')
    expect(inProgress.tasks[0].status).toBe('in_progress')
  })

  it('returns original columns unchanged if taskId is not found', () => {
    const columns = makeColumns(['backlog', 'done'])
    const result = applyOptimisticMove(columns, 'nonexistent-task', 'done')
    expect(result).toEqual(columns)
    // Same reference equality — returns the original array
    expect(result).toBe(columns)
  })

  it('updates the task status in the moved task object', () => {
    const task = makeTask({ id: 'task-1', status: 'backlog' })
    const columns: BoardColumn[] = [
      { status: 'backlog', label: 'Backlog', tasks: [task] },
      { status: 'done', label: 'Klar', tasks: [] },
    ]

    const result = applyOptimisticMove(columns, 'task-1', 'done')
    const doneCol = result.find((c) => c.status === 'done')!
    expect(doneCol.tasks[0].status).toBe('done')
  })

  it('preserves other tasks in source column', () => {
    const columns: BoardColumn[] = [
      {
        status: 'backlog',
        label: 'Backlog',
        tasks: [
          makeTask({ id: 'task-1', status: 'backlog' }),
          makeTask({ id: 'task-2', status: 'backlog' }),
        ],
      },
      { status: 'done', label: 'Klar', tasks: [] },
    ]

    const result = applyOptimisticMove(columns, 'task-1', 'done')
    const backlog = result.find((c) => c.status === 'backlog')!
    expect(backlog.tasks).toHaveLength(1)
    expect(backlog.tasks[0].id).toBe('task-2')
  })

  it('preserves other tasks in target column', () => {
    const existingTask = makeTask({ id: 'existing', status: 'done' })
    const columns: BoardColumn[] = [
      { status: 'backlog', label: 'Backlog', tasks: [makeTask({ id: 'task-1', status: 'backlog' })] },
      { status: 'done', label: 'Klar', tasks: [existingTask] },
    ]

    const result = applyOptimisticMove(columns, 'task-1', 'done')
    const done = result.find((c) => c.status === 'done')!
    expect(done.tasks).toHaveLength(2)
    expect(done.tasks.some((t) => t.id === 'existing')).toBe(true)
    expect(done.tasks.some((t) => t.id === 'task-1')).toBe(true)
  })
})
