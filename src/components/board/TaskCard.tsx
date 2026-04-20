'use client'
// T07 — TaskCard component
// Renders a single task card with priority badge, owner initials, and due date.

import type { BoardTask, Priority } from '@/types/board'

// Priority badge color mapping
const PRIORITY_CLASSES: Record<Priority, string> = {
  LOW: 'bg-slate-100 text-slate-600 border-slate-200',
  MEDIUM: 'bg-blue-100 text-blue-700 border-blue-200',
  HIGH: 'bg-amber-100 text-amber-700 border-amber-200',
  CRITICAL: 'bg-red-100 text-red-700 border-red-200',
}

const PRIORITY_LABELS: Record<Priority, string> = {
  LOW: 'Låg',
  MEDIUM: 'Medium',
  HIGH: 'Hög',
  CRITICAL: 'Kritisk',
}

function getOwnerInitial(email: string): string {
  return email.charAt(0).toUpperCase()
}

function isOverdue(dueDate: string | null): boolean {
  if (!dueDate) return false
  return new Date(dueDate) < new Date()
}

function formatDueDate(dueDate: string): string {
  return new Date(dueDate).toLocaleDateString('sv-SE', {
    day: 'numeric',
    month: 'short',
  })
}

interface TaskCardProps {
  task: BoardTask
  onClick?: (task: BoardTask) => void
  isDragging?: boolean
}

export function TaskCard({ task, onClick, isDragging }: TaskCardProps) {
  const overdue = isOverdue(task.dueDate)

  return (
    <div
      className={`bg-white rounded-lg border border-slate-200 p-3 shadow-sm cursor-pointer
        hover:shadow-md hover:border-slate-300 transition-all
        ${isDragging ? 'opacity-50 shadow-lg rotate-1' : ''}
      `}
      onClick={() => onClick?.(task)}
    >
      {/* Title */}
      <p className="text-sm font-medium text-slate-800 leading-snug line-clamp-2 mb-2">
        {task.title}
      </p>

      {/* Footer: priority badge + owner + due date */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span
          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${PRIORITY_CLASSES[task.priority]}`}
        >
          {PRIORITY_LABELS[task.priority]}
        </span>

        <div className="flex items-center gap-1.5 ml-auto">
          {/* Due date */}
          {task.dueDate && (
            <span
              className={`text-xs ${overdue ? 'text-red-600 font-semibold' : 'text-slate-500'}`}
              title={overdue ? 'Förfallen' : undefined}
            >
              {formatDueDate(task.dueDate)}
            </span>
          )}

          {/* Owner initials */}
          {task.owner && (
            <div
              className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-semibold shrink-0"
              title={task.owner.email}
            >
              {getOwnerInitial(task.owner.email)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
