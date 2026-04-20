'use client'
// T07 — KanbanColumn component
// Renders a single kanban column with header, task count, and task cards.

import { TaskCard } from './TaskCard'
import type { BoardColumn, BoardTask, TaskStatus } from '@/types/board'

interface KanbanColumnProps {
  column: BoardColumn
  onTaskClick?: (task: BoardTask) => void
  onAddTask?: (status: TaskStatus) => void
  // Drag-and-drop slot — children can wrap TaskCard with sortable wrappers (T08)
  renderTask?: (task: BoardTask) => React.ReactNode
}

export function KanbanColumn({
  column,
  onTaskClick,
  onAddTask,
  renderTask,
}: KanbanColumnProps) {
  return (
    <div className="flex flex-col min-w-[260px] max-w-[300px] bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
      {/* Column header */}
      <div className="flex items-center justify-between px-3 py-2.5 bg-white border-b border-slate-200">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-700">{column.label}</span>
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-200 text-slate-600 text-xs font-medium">
            {column.tasks.length}
          </span>
        </div>
        <button
          type="button"
          onClick={() => onAddTask?.(column.status)}
          className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded p-0.5 transition-colors text-lg leading-none"
          title={`Lägg till uppgift i ${column.label}`}
          aria-label={`Lägg till uppgift i ${column.label}`}
        >
          +
        </button>
      </div>

      {/* Task list */}
      <div className="flex flex-col gap-2 p-2 flex-1 min-h-[120px]">
        {column.tasks.map((task) =>
          renderTask ? (
            renderTask(task)
          ) : (
            <TaskCard key={task.id} task={task} onClick={onTaskClick} />
          )
        )}
      </div>
    </div>
  )
}
