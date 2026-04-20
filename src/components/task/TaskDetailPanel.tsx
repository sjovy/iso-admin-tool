'use client'
// T10 — Task Detail Panel
// Side panel (Sheet) that opens when a TaskCard is clicked.
// All fields are editable inline — saves on blur via updateTask server action.

import { useState, useId } from 'react'
import { updateTask } from '@/app/actions/tasks'
import { toast } from 'sonner'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { BoardTask, Priority, TaskOwner, UpdateTaskInput } from '@/types/board'

interface TaskDetailPanelProps {
  isOpen: boolean
  onClose: () => void
  task: BoardTask | null
  tenantSlug: string
  boardUsers: TaskOwner[]
  onTaskUpdated: (task: BoardTask) => void
}

const PRIORITY_OPTIONS: Array<{ value: Priority; label: string }> = [
  { value: 'LOW', label: 'Låg' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'Hög' },
  { value: 'CRITICAL', label: 'Kritisk' },
]

const STATUS_LABELS: Record<string, string> = {
  backlog: 'Backlog',
  planned: 'Planerad',
  in_progress: 'Pågående',
  review: 'Granskning',
  verified: 'Verifierad',
  done: 'Klar',
}

function formatDateTime(isoString: string): string {
  return new Date(isoString).toLocaleString('sv-SE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function TaskDetailPanel({
  isOpen,
  onClose,
  task,
  tenantSlug,
  boardUsers,
  onTaskUpdated,
}: TaskDetailPanelProps) {
  const labelId = useId()

  // Local field state — initialized from task prop.
  // The parent component provides key={task.id} which causes remount when task changes,
  // so useState initializers run fresh for each task (no useEffect needed).
  const [title, setTitle] = useState(task?.title ?? '')
  const [description, setDescription] = useState(task?.description ?? '')
  const [ownerId, setOwnerId] = useState<string>(task?.owner?.id ?? '')
  const [dueDate, setDueDate] = useState(task?.dueDate ? task.dueDate.slice(0, 10) : '')
  const [isoClauseRef, setIsoClauseRef] = useState(task?.isoClauseRef ?? '')
  const [priority, setPriority] = useState<Priority>(task?.priority ?? 'MEDIUM')

  if (!task) return null

  async function saveField(input: Omit<UpdateTaskInput, 'taskId'>) {
    if (!task) return

    // Optimistic — the parent already has the local state updated via setState calls
    const result = await updateTask(tenantSlug, { taskId: task.id, ...input })

    if (result.success) {
      onTaskUpdated(result.data)
      toast.success('Sparat', { duration: 2000 })
    } else {
      toast.error(`Kunde inte spara: ${result.error.message}`)
      // Rollback local state to task values
      setTitle(task.title)
      setDescription(task.description ?? '')
      setOwnerId(task.owner?.id ?? '')
      setDueDate(task.dueDate ? task.dueDate.slice(0, 10) : '')
      setIsoClauseRef(task.isoClauseRef ?? '')
      setPriority(task.priority)
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <SheetContent className="sm:max-w-[480px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Uppgiftsdetaljer</SheetTitle>
        </SheetHeader>

        <div className="space-y-5 mt-6">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor={`${labelId}-title`}>Titel</Label>
            <Input
              id={`${labelId}-title`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => {
                if (title.trim() && title !== task.title) {
                  void saveField({ title: title.trim() })
                }
              }}
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor={`${labelId}-description`}>Beskrivning</Label>
            <Textarea
              id={`${labelId}-description`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={() => {
                const trimmed = description.trim()
                const original = task.description ?? ''
                if (trimmed !== original) {
                  void saveField({ description: trimmed || undefined })
                }
              }}
              rows={4}
            />
          </div>

          {/* Priority */}
          <div className="space-y-1.5">
            <Label htmlFor={`${labelId}-priority`}>Prioritet</Label>
            <Select
              value={priority}
              onValueChange={(v) => {
                const newPriority = v as Priority
                setPriority(newPriority)
                void saveField({ priority: newPriority })
              }}
            >
              <SelectTrigger id={`${labelId}-priority`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRIORITY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Owner */}
          <div className="space-y-1.5">
            <Label htmlFor={`${labelId}-owner`}>Ansvarig</Label>
            <Select
              value={ownerId}
              onValueChange={(v) => {
                setOwnerId(v)
                void saveField({ ownerId: v || null })
              }}
            >
              <SelectTrigger id={`${labelId}-owner`}>
                <SelectValue placeholder="Välj ansvarig" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Ingen ansvarig</SelectItem>
                {boardUsers.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Due date */}
          <div className="space-y-1.5">
            <Label htmlFor={`${labelId}-dueDate`}>Förfallodatum</Label>
            <input
              id={`${labelId}-dueDate`}
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              onBlur={() => {
                const original = task.dueDate ? task.dueDate.slice(0, 10) : ''
                if (dueDate !== original) {
                  void saveField({ dueDate: dueDate || null })
                }
              }}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {/* ISO clause reference */}
          <div className="space-y-1.5">
            <Label htmlFor={`${labelId}-isoClause`}>ISO-klausulreferens</Label>
            <Input
              id={`${labelId}-isoClause`}
              value={isoClauseRef}
              onChange={(e) => setIsoClauseRef(e.target.value)}
              onBlur={() => {
                const trimmed = isoClauseRef.trim()
                const original = task.isoClauseRef ?? ''
                if (trimmed !== original) {
                  void saveField({ isoClauseRef: trimmed || null })
                }
              }}
              placeholder="t.ex. 6.1.2"
            />
          </div>

          {/* Status (read-only) */}
          <div className="space-y-1.5">
            <Label>Status</Label>
            <p className="text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-md px-3 py-2">
              {STATUS_LABELS[task.status] ?? task.status}
            </p>
            <p className="text-xs text-slate-400">Status ändras via drag-and-drop på tavlan</p>
          </div>

          {/* Read-only metadata */}
          <div className="border-t border-slate-100 pt-4 space-y-2">
            <div>
              <span className="text-xs text-slate-400">Skapad</span>
              <p className="text-sm text-slate-600">{formatDateTime(task.createdAt)}</p>
            </div>
            <div>
              <span className="text-xs text-slate-400">Senast uppdaterad</span>
              <p className="text-sm text-slate-600">{formatDateTime(task.updatedAt)}</p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
