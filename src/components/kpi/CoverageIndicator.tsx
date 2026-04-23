// Sprint 3 T05 — Coverage indicator component
// Shows how many of the 6 ISO 9.1 categories have at least one KPI.
// Pure component — receives coveredCategories as prop.

import type { IsoCategory } from '@/types/kpi'

const ALL_CATEGORIES: IsoCategory[] = [
  'conformity',
  'customer_satisfaction',
  'qms_performance',
  'risk',
  'supplier',
  'improvement',
]

interface CoverageIndicatorProps {
  coveredCategories: IsoCategory[]
}

export function CoverageIndicator({ coveredCategories }: CoverageIndicatorProps) {
  const coveredSet = new Set(coveredCategories)
  const coveredCount = ALL_CATEGORIES.filter((c) => coveredSet.has(c)).length
  const total = ALL_CATEGORIES.length

  const squares = ALL_CATEGORIES.map((c) =>
    coveredSet.has(c) ? '■' : '□'
  ).join('')

  return (
    <div className="flex items-center gap-2 text-sm text-slate-600" aria-label={`${coveredCount} av ${total} kategorier täckta`}>
      <span className="font-mono tracking-widest text-slate-500" aria-hidden>
        {squares}
      </span>
      <span>
        {coveredCount} / {total} kategorier täckta
      </span>
    </div>
  )
}
