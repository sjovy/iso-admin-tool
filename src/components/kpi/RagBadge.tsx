// Sprint 3 T05 — RAG status badge component
// Renders a solid colored circle with tooltip indicating computed vs override.

import type { RagStatus } from '@/types/kpi'

interface RagBadgeProps {
  status: RagStatus
  isOverride?: boolean
}

const RAG_COLORS: Record<RagStatus, string> = {
  RED: 'bg-red-500',
  AMBER: 'bg-amber-400',
  GREEN: 'bg-green-500',
}

const RAG_LABELS: Record<RagStatus, string> = {
  RED: 'Röd',
  AMBER: 'Gul',
  GREEN: 'Grön',
}

export function RagBadge({ status, isOverride = false }: RagBadgeProps) {
  const tooltip = isOverride
    ? `${RAG_LABELS[status]} (manuell override)`
    : `${RAG_LABELS[status]} (beräknad)`

  return (
    <span
      title={tooltip}
      aria-label={tooltip}
      className={`inline-block h-3 w-3 rounded-full ${RAG_COLORS[status]}`}
    />
  )
}
