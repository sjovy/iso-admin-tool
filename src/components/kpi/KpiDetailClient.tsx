'use client'
// Sprint 3 T06/T07 — Client wrapper for KPI detail page interactive elements.
// Manages modal open/close state and renders AddMeasurementModal + RagOverrideControl.

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { AddMeasurementModal } from './AddMeasurementModal'
import { RagOverrideControl } from './RagOverrideControl'
import type { KpiDetail, RagStatus } from '@/types/kpi'

interface KpiDetailClientProps {
  kpi: KpiDetail
  tenantSlug: string
  userRole: string
}

export function KpiDetailClient({ kpi, tenantSlug, userRole }: KpiDetailClientProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const canOverride = userRole === 'management' || userRole === 'company_admin'

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button onClick={() => setModalOpen(true)}>
          + Registrera mätning
        </Button>

        {canOverride && (
          <RagOverrideControl
            kpiId={kpi.id}
            currentOverride={kpi.ragStatus}
            tenantSlug={tenantSlug}
          />
        )}
      </div>

      <AddMeasurementModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        kpiId={kpi.id}
        kpiName={kpi.name}
        unit={kpi.unit}
        tenantSlug={tenantSlug}
      />
    </div>
  )
}

// Re-export for use in the detail page
export type { RagStatus }
