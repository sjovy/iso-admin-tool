'use client'
// T09 — Task Creation Modal
// Opens from column "+ Add task" button. Optimistic creation pattern.

import { useState, useId } from 'react'
import { createTask } from '@/app/actions/tasks'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import type { BoardTask, TaskStatus, Priority, TaskOwner } from '@/types/board'

interface TaskCreationModalProps {
  isOpen: boolean
  onClose: () => void
  initialStatus: TaskStatus
  moduleId: string
  tenantSlug: string
  boardUsers: TaskOwner[]
  onTaskCreated: (task: BoardTask) => void
}

const PRIORITY_OPTIONS: Array<{ value: Priority; label: string }> = [
  { value: 'LOW', label: 'Låg' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'Hög' },
  { value: 'CRITICAL', label: 'Kritisk' },
]

export function TaskCreationModal({
  isOpen,
  onClose,
  initialStatus,
  moduleId,
  tenantSlug,
  boardUsers,
  onTaskCreated,
}: TaskCreationModalProps) {
  const formId = useId()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [ownerId, setOwnerId] = useState<string>('')
  const [dueDate, setDueDate] = useState('')
  const [isoClauseRef, setIsoClauseRef] = useState('')
  const [priority, setPriority] = useState<Priority>('MEDIUM')
  const [titleError, setTitleError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function resetForm() {
    setTitle('')
    setDescription('')
    setOwnerId('')
    setDueDate('')
    setIsoClauseRef('')
    setPriority('MEDIUM')
    setTitleError('')
  }

  function handleClose() {
    resetForm()
    onClose()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    // Inline validation
    if (!title.trim()) {
      setTitleError('Titel är obligatorisk')
      return
    }
    setTitleError('')

    setIsSubmitting(true)

    const result = await createTask(tenantSlug, {
      moduleId,
      title: title.trim(),
      description: description.trim() || undefined,
      ownerId: ownerId || undefined,
      dueDate: dueDate || undefined,
      isoClauseRef: isoClauseRef.trim() || undefined,
      priority,
      status: initialStatus,
    })

    setIsSubmitting(false)

    if (result.success) {
      onTaskCreated(result.data)
      toast.success('Uppgift skapad')
      handleClose()
    } else {
      toast.error(`Kunde inte skapa uppgift: ${result.error.message}`)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose() }}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Ny uppgift</DialogTitle>
        </DialogHeader>

        <form id={formId} onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor={`${formId}-title`}>
              Titel <span className="text-red-500">*</span>
            </Label>
            <Input
              id={`${formId}-title`}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                if (e.target.value.trim()) setTitleError('')
              }}
              placeholder="Ange uppgiftstitel"
              autoFocus
            />
            {titleError && (
              <p className="text-xs text-red-500">{titleError}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor={`${formId}-description`}>Beskrivning</Label>
            <Textarea
              id={`${formId}-description`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Valfri beskrivning"
              rows={3}
            />
          </div>

          {/* Priority */}
          <div className="space-y-1.5">
            <Label htmlFor={`${formId}-priority`}>
              Prioritet <span className="text-red-500">*</span>
            </Label>
            <Select
              value={priority}
              onValueChange={(v) => setPriority(v as Priority)}
            >
              <SelectTrigger id={`${formId}-priority`}>
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
            <Label htmlFor={`${formId}-owner`}>Ansvarig</Label>
            <Select
              value={ownerId}
              onValueChange={setOwnerId}
            >
              <SelectTrigger id={`${formId}-owner`}>
                <SelectValue placeholder="Välj ansvarig (valfritt)" />
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
            <Label htmlFor={`${formId}-dueDate`}>Förfallodatum</Label>
            <input
              id={`${formId}-dueDate`}
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {/* ISO clause reference */}
          <div className="space-y-1.5">
            <Label htmlFor={`${formId}-isoClause`}>ISO-klausulreferens</Label>
            <Input
              id={`${formId}-isoClause`}
              value={isoClauseRef}
              onChange={(e) => setIsoClauseRef(e.target.value)}
              placeholder="t.ex. 6.1.2"
            />
          </div>

          {/* Status (read-only) */}
          <div className="space-y-1.5">
            <Label>Status</Label>
            <p className="text-sm text-slate-500 bg-slate-50 border border-slate-200 rounded-md px-3 py-2">
              {initialStatus}
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-4 border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
            >
              Avbryt
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-4 bg-slate-900 text-white hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Sparar...' : 'Skapa uppgift'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
