'use client'
// T07 — KanbanBoard component (static layout — drag-and-drop added in T08)
// T08 — Extended with DnD via @dnd-kit/core + @dnd-kit/sortable
// T09 — TaskCreationModal wired here

import { useState, useCallback } from 'react'
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { KanbanColumn } from './KanbanColumn'
import { SortableTaskCard } from './SortableTaskCard'
import { TaskCard } from './TaskCard'
import { TaskCreationModal } from '@/components/task/TaskCreationModal'
import { TaskDetailPanel } from '@/components/task/TaskDetailPanel'
import { moveTask } from '@/app/actions/tasks'
import { applyOptimisticMove } from '@/lib/board-utils'
import { toast } from 'sonner'
import type { BoardData, BoardColumn, BoardTask, TaskStatus, TaskOwner } from '@/types/board'

interface KanbanBoardProps {
  initialData: BoardData
  tenantSlug: string
  currentUserId: string
  currentUserRole: string
  boardUsers: TaskOwner[]
}

export function KanbanBoard({
  initialData,
  tenantSlug,
  currentUserId,
  currentUserRole,
  boardUsers,
}: KanbanBoardProps) {
  const [columns, setColumns] = useState<BoardColumn[]>(initialData.columns)
  const [activeTask, setActiveTask] = useState<BoardTask | null>(null)
  const [selectedTask, setSelectedTask] = useState<BoardTask | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [addTaskStatus, setAddTaskStatus] = useState<TaskStatus | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const taskId = event.active.id as string
    for (const col of columns) {
      const found = col.tasks.find((t) => t.id === taskId)
      if (found) {
        setActiveTask(found)
        break
      }
    }
  }, [columns])

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setActiveTask(null)
      const { active, over } = event

      if (!over) return

      const taskId = active.id as string
      // over.id is either a task ID (dropped on a task) or a column status (dropped on empty column)
      const overId = over.id as string

      // Find source column and task
      let sourceColumn: BoardColumn | undefined
      let task: BoardTask | undefined

      for (const col of columns) {
        const found = col.tasks.find((t) => t.id === taskId)
        if (found) {
          sourceColumn = col
          task = found
          break
        }
      }

      if (!sourceColumn || !task) return

      // Determine target column: overId may be a task ID or a column status
      let targetStatus: TaskStatus | undefined

      // Check if overId is a column status
      const targetCol = columns.find((c) => c.status === overId)
      if (targetCol) {
        targetStatus = targetCol.status
      } else {
        // overId is a task ID — find which column it belongs to
        for (const col of columns) {
          if (col.tasks.some((t) => t.id === overId)) {
            targetStatus = col.status
            break
          }
        }
      }

      if (!targetStatus) return
      if (targetStatus === sourceColumn.status) return

      // RBAC: Workers may only move tasks they own
      if (currentUserRole === 'worker' && task.owner?.id !== currentUserId) {
        toast.error('Du kan bara flytta dina egna uppgifter')
        return
      }

      // Optimistic update
      const previousColumns = columns
      setColumns((prev) => applyOptimisticMove(prev, taskId, targetStatus!))

      // Fire server action
      const result = await moveTask(tenantSlug, { taskId, targetStatus })

      if (!result.success) {
        // Rollback
        setColumns(previousColumns)
        toast.error(`Kunde inte flytta uppgiften: ${result.error.message}`)
      }
    },
    [columns, tenantSlug, currentUserId, currentUserRole]
  )

  const handleTaskClick = useCallback((task: BoardTask) => {
    setSelectedTask(task)
    setIsPanelOpen(true)
  }, [])

  const handleAddTask = useCallback((status: TaskStatus) => {
    setAddTaskStatus(status)
    setIsModalOpen(true)
  }, [])

  // Called by TaskCreationModal on success — adds new task to the column optimistically
  const handleTaskCreated = useCallback((newTask: BoardTask) => {
    setColumns((prev) =>
      prev.map((col) =>
        col.status === newTask.status
          ? { ...col, tasks: [...col.tasks, newTask] }
          : col
      )
    )
  }, [])

  // Called by TaskDetailPanel on field update — updates the task in local state
  const handleTaskUpdated = useCallback((updatedTask: BoardTask) => {
    setColumns((prev) =>
      prev.map((col) => ({
        ...col,
        tasks: col.tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)),
      }))
    )
    // Sync the selected task in the panel
    setSelectedTask(updatedTask)
  }, [])

  return (
    <>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4 min-h-[calc(100vh-200px)]">
          {columns.map((column) => (
            <SortableContext
              key={column.status}
              id={column.status}
              items={column.tasks.map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              <KanbanColumn
                column={column}
                onTaskClick={handleTaskClick}
                onAddTask={handleAddTask}
                renderTask={(task) => (
                  <SortableTaskCard
                    key={task.id}
                    task={task}
                    columnStatus={column.status}
                    onClick={handleTaskClick}
                    disabled={
                      currentUserRole === 'worker' && task.owner?.id !== currentUserId
                    }
                  />
                )}
              />
            </SortableContext>
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <TaskCard task={activeTask} isDragging />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Task Creation Modal */}
      {isModalOpen && addTaskStatus !== null && (
        <TaskCreationModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setAddTaskStatus(null)
          }}
          initialStatus={addTaskStatus}
          moduleId={initialData.module.id}
          tenantSlug={tenantSlug}
          boardUsers={boardUsers}
          onTaskCreated={handleTaskCreated}
        />
      )}

      {/* Task Detail Panel — key resets local field state when a different task is selected */}
      <TaskDetailPanel
        key={selectedTask?.id ?? 'none'}
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        task={selectedTask}
        tenantSlug={tenantSlug}
        boardUsers={boardUsers}
        onTaskUpdated={handleTaskUpdated}
      />
    </>
  )
}

// Re-export for callers who import from this module (backward compat)
export { applyOptimisticMove } from '@/lib/board-utils'
