import type { RagStatus } from '@/types/kpi'

export function buildTaskFilter(
  userId: string,
  role: string,
  moduleId: string
): Record<string, unknown> {
  if (role === 'worker') {
    return { moduleId, ownerId: userId }
  }
  return { moduleId }
}

/**
 * Compute RAG status from target and latest actual measurement.
 * Pure function — no DB calls.
 * - null actual    → AMBER (no data)
 * - actual ≥ target → GREEN
 * - actual ≥ target * 0.8 → AMBER
 * - actual < target * 0.8 → RED
 */
export function computeRag(target: number, actual: number | null): RagStatus {
  if (actual === null) return 'AMBER'
  if (actual >= target) return 'GREEN'
  if (actual >= target * 0.8) return 'AMBER'
  return 'RED'
}
