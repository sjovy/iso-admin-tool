'use client'
// T08 — SortableTaskCard
// Wraps TaskCard with @dnd-kit/sortable useSortable hook.

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { TaskCard } from './TaskCard'
import type { BoardTask, TaskStatus } from '@/types/board'

interface SortableTaskCardProps {
  task: BoardTask
  /** columnStatus is required by the parent SortableContext item shape — not used internally */
  columnStatus: TaskStatus
  onClick?: (task: BoardTask) => void
  /** When true the drag handle is disabled (Worker on unowned task) */
  disabled?: boolean
}

export function SortableTaskCard({
  task,
  columnStatus: _columnStatus, // eslint-disable-line @typescript-eslint/no-unused-vars
  onClick,
  disabled = false,
}: SortableTaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: task.id,
      disabled,
    })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : undefined,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <TaskCard task={task} onClick={disabled ? undefined : onClick} isDragging={isDragging} />
    </div>
  )
}
