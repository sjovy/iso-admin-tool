'use client'
// Sprint 3 T07 — RAG manual override control
// Visible only to management/company_admin (gate enforced in KpiDetailClient + server).
// Calls setRagOverride server action; "Auto" clears the override.

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { setRagOverride } from '@/app/actions/kpis'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { RagStatus } from '@/types/kpi'

interface RagOverrideControlProps {
  kpiId: string
  currentOverride: RagStatus
  tenantSlug: string
}

const OPTIONS: Array<{ value: RagStatus | 'auto'; label: string }> = [
  { value: 'auto', label: 'Auto (beräknad)' },
  { value: 'GREEN', label: 'Grön' },
  { value: 'AMBER', label: 'Gul' },
  { value: 'RED', label: 'Röd' },
]

export function RagOverrideControl({
  kpiId,
  currentOverride,
  tenantSlug,
}: RagOverrideControlProps) {
  const router = useRouter()
  const [selected, setSelected] = useState<RagStatus | 'auto'>(currentOverride)
  const [saving, setSaving] = useState(false)

  async function handleChange(value: string) {
    const next = value as RagStatus | 'auto'
    setSelected(next)
    setSaving(true)

    try {
      const result = await setRagOverride(tenantSlug, {
        kpiId,
        override: next === 'auto' ? null : next,
      })

      if (!result.success) {
        toast.error(result.error.message)
        setSelected(currentOverride)
        return
      }

      toast.success('RAG-status uppdaterad')
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-slate-500">Override RAG:</span>
      <Select value={selected} onValueChange={handleChange} disabled={saving}>
        <SelectTrigger className="w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
