// Board type contracts — Sprint 2 T02
// This file is the parallel-split boundary: Track 2 (UI) depends on these types.
// All types must remain strict — no `any`.

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

// Typed error results for server actions
export type ActionError =
  | { code: 'FORBIDDEN'; message: string }
  | { code: 'INVALID_STATUS'; message: string }
  | { code: 'NOT_FOUND'; message: string }
  | { code: 'INTERNAL'; message: string }

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: ActionError }
