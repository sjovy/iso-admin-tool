'use client'
// Sprint 3 T06 — Add measurement modal
// Calls addMeasurement server action; shows toast on success/error.
// Date picker: shadcn Popover + Calendar pattern.

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { addMeasurement } from '@/app/actions/kpis'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'

interface AddMeasurementModalProps {
  isOpen: boolean
  onClose: () => void
  kpiId: string
  kpiName: string
  unit: string
  tenantSlug: string
}

export function AddMeasurementModal({
  isOpen,
  onClose,
  kpiId,
  kpiName,
  unit,
  tenantSlug,
}: AddMeasurementModalProps) {
  const router = useRouter()
  const [actual, setActual] = useState('')
  const [measuredAt, setMeasuredAt] = useState<Date>(new Date())
  const [notes, setNotes] = useState('')
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  function reset() {
    setActual('')
    setMeasuredAt(new Date())
    setNotes('')
  }

  function handleClose() {
    reset()
    onClose()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const parsedActual = parseFloat(actual)
    if (isNaN(parsedActual)) {
      toast.error('Ange ett giltigt tal för utfall')
      return
    }

    setSubmitting(true)
    try {
      const result = await addMeasurement(tenantSlug, {
        kpiId,
        actual: parsedActual,
        measuredAt: measuredAt.toISOString(),
        notes: notes.trim() || undefined,
      })

      if (!result.success) {
        toast.error(result.error.message)
        return
      }

      toast.success('Mätning registrerad')
      handleClose()
      router.refresh()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrera mätning — {kpiName}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Actual value */}
          <div className="space-y-1">
            <Label htmlFor="actual">Utfall ({unit})</Label>
            <Input
              id="actual"
              type="number"
              step="any"
              value={actual}
              onChange={(e) => setActual(e.target.value)}
              placeholder="0"
              required
            />
          </div>

          {/* Measured at date */}
          <div className="space-y-1">
            <Label>Mätdatum</Label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  {measuredAt.toLocaleDateString('sv-SE')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={measuredAt}
                  onSelect={(date) => {
                    if (date) {
                      setMeasuredAt(date)
                      setCalendarOpen(false)
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <Label htmlFor="notes">Anteckningar (valfritt)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Fritext..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={submitting}>
              Avbryt
            </Button>
            <Button type="submit" disabled={submitting || !actual}>
              {submitting ? 'Sparar…' : 'Spara mätning'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
