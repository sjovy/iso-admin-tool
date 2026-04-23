// Sprint 3 T02 — KPI domain type contracts
// ActionResult<T> is reused from board.ts to keep error shapes consistent.

export type { ActionResult } from '@/types/board'

export type IsoCategory =
  | 'conformity'
  | 'customer_satisfaction'
  | 'qms_performance'
  | 'risk'
  | 'supplier'
  | 'improvement'

export type RagStatus = 'RED' | 'AMBER' | 'GREEN'

export interface KpiMeasurementEntry {
  id: string
  actual: number
  measuredAt: string       // ISO 8601
  notes: string | null
  createdAt: string
}

export interface KpiRow {
  id: string
  name: string
  description: string | null
  unit: string
  target: number
  isoCategory: IsoCategory
  ragStatus: RagStatus      // computed or override — resolved server-side
  latestActual: number | null
  trendDirection: 'up' | 'down' | 'flat' | null
  linkedCorrectiveActionId: string | null
}

export interface KpiDetail extends KpiRow {
  measurements: KpiMeasurementEntry[]
}

export interface CreateKpiInput {
  name: string
  description?: string
  unit: string
  target: number
  isoCategory: IsoCategory
}

export interface AddMeasurementInput {
  kpiId: string
  actual: number
  measuredAt: string
  notes?: string
}

export interface SetRagOverrideInput {
  kpiId: string
  override: RagStatus | null   // null clears the override → reverts to computed
}
