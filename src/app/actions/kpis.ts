'use server'
// Sprint 3 T03/T04 — KPI server actions
// Mutations use interactive transactions so audit log entries capture real entity UUIDs.
// Pattern mirrors src/app/actions/tasks.ts exactly.

import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db/prisma'
import { computeRag } from '@/lib/utils/actions'
import type {
  KpiRow,
  KpiDetail,
  KpiMeasurementEntry,
  IsoCategory,
  RagStatus,
  CreateKpiInput,
  AddMeasurementInput,
  SetRagOverrideInput,
} from '@/types/kpi'
import type { ActionResult } from '@/types/board'

// ─── Internal helpers ─────────────────────────────────────────────────────────

async function resolveTenant(tenantSlug: string): Promise<string | null> {
  const tenant = await prisma.tenant.findUnique({
    where: { slug: tenantSlug },
    select: { id: true },
  })
  return tenant?.id ?? null
}

type KpiWithMeasurements = {
  id: string
  name: string
  description: string | null
  unit: string
  target: number
  isoCategory: string
  ragOverride: string | null
  linkedCorrectiveActionId: string | null
  measurements: Array<{
    id: string
    actual: number
    measuredAt: Date
    notes: string | null
    createdAt: Date
  }>
}

/**
 * Map a Kpi DB row (with measurements) to the KpiRow view model.
 * Resolves ragStatus from override or computed value.
 * Computes trendDirection from last two measurements.
 */
function mapKpiToRow(kpi: KpiWithMeasurements): KpiRow {
  // Sort measurements newest-first for trend/latest computation
  const sorted = [...kpi.measurements].sort(
    (a, b) => b.measuredAt.getTime() - a.measuredAt.getTime()
  )

  const latestActual = sorted.length > 0 ? sorted[0].actual : null

  let trendDirection: 'up' | 'down' | 'flat' | null = null
  if (sorted.length >= 2) {
    const diff = sorted[0].actual - sorted[1].actual
    if (diff > 0) trendDirection = 'up'
    else if (diff < 0) trendDirection = 'down'
    else trendDirection = 'flat'
  }

  const ragStatus: RagStatus =
    (kpi.ragOverride as RagStatus | null) ?? computeRag(kpi.target, latestActual)

  return {
    id: kpi.id,
    name: kpi.name,
    description: kpi.description,
    unit: kpi.unit,
    target: kpi.target,
    isoCategory: kpi.isoCategory as IsoCategory,
    ragStatus,
    latestActual,
    trendDirection,
    linkedCorrectiveActionId: kpi.linkedCorrectiveActionId,
  }
}

function mapMeasurementToEntry(m: {
  id: string
  actual: number
  measuredAt: Date
  notes: string | null
  createdAt: Date
}): KpiMeasurementEntry {
  return {
    id: m.id,
    actual: m.actual,
    measuredAt: m.measuredAt.toISOString(),
    notes: m.notes,
    createdAt: m.createdAt.toISOString(),
  }
}

// RAG sort order for register list: RED first (most urgent), then AMBER, then GREEN
const RAG_ORDER: Record<RagStatus, number> = { RED: 0, AMBER: 1, GREEN: 2 }

// ─── T03: Mutations ───────────────────────────────────────────────────────────

/**
 * Create a new KPI definition.
 * RBAC: Worker forbidden. Management/company_admin/consultant allowed.
 * Interactive transaction: create Kpi → audit log (captures real UUID).
 */
export async function createKpi(
  tenantSlug: string,
  input: CreateKpiInput
): Promise<ActionResult<KpiRow>> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: { code: 'FORBIDDEN', message: 'Not authenticated' } }
  }

  const tenantId = await resolveTenant(tenantSlug)
  if (!tenantId) {
    return { success: false, error: { code: 'NOT_FOUND', message: `Tenant '${tenantSlug}' not found` } }
  }

  const appUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  })

  if (!appUser) {
    return { success: false, error: { code: 'FORBIDDEN', message: 'User not in app users table' } }
  }

  if (appUser.role === 'worker') {
    return { success: false, error: { code: 'FORBIDDEN', message: 'Workers cannot create KPIs' } }
  }

  try {
    const createdKpi = await prisma.$transaction(async (tx) => {
      const kpi = await tx.kpi.create({
        data: {
          tenantId,
          name: input.name,
          description: input.description ?? null,
          unit: input.unit,
          target: input.target,
          isoCategory: input.isoCategory,
        },
        include: { measurements: true },
      })
      await tx.auditLog.create({
        data: {
          tenantId,
          actorId: user.id,
          entityType: 'kpi',
          entityId: kpi.id,
          action: 'create',
          payload: {
            name: input.name,
            isoCategory: input.isoCategory,
            target: input.target,
            unit: input.unit,
          },
        },
      })
      return kpi
    })

    return { success: true, data: mapKpiToRow(createdKpi) }
  } catch (err) {
    console.error('createKpi transaction failed:', err)
    return { success: false, error: { code: 'INTERNAL', message: 'Failed to create KPI' } }
  }
}

/**
 * Add a measurement to a KPI.
 * RBAC: All authenticated tenant users may add measurements.
 * Interactive transaction: create KpiMeasurement → audit log.
 */
export async function addMeasurement(
  tenantSlug: string,
  input: AddMeasurementInput
): Promise<ActionResult<KpiMeasurementEntry>> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: { code: 'FORBIDDEN', message: 'Not authenticated' } }
  }

  const tenantId = await resolveTenant(tenantSlug)
  if (!tenantId) {
    return { success: false, error: { code: 'NOT_FOUND', message: `Tenant '${tenantSlug}' not found` } }
  }

  // Verify parent KPI belongs to this tenant
  const parentKpi = await prisma.kpi.findUnique({
    where: { id: input.kpiId },
    select: { tenantId: true },
  })

  if (!parentKpi || parentKpi.tenantId !== tenantId) {
    return { success: false, error: { code: 'NOT_FOUND', message: 'KPI not found or access denied' } }
  }

  try {
    const created = await prisma.$transaction(async (tx) => {
      const measurement = await tx.kpiMeasurement.create({
        data: {
          kpiId: input.kpiId,
          tenantId,
          actual: input.actual,
          measuredAt: new Date(input.measuredAt),
          notes: input.notes ?? null,
        },
      })
      await tx.auditLog.create({
        data: {
          tenantId,
          actorId: user.id,
          entityType: 'kpi_measurement',
          entityId: measurement.id,
          action: 'create',
          payload: {
            kpiId: input.kpiId,
            actual: input.actual,
            measuredAt: input.measuredAt,
          },
        },
      })
      return measurement
    })

    return { success: true, data: mapMeasurementToEntry(created) }
  } catch (err) {
    console.error('addMeasurement transaction failed:', err)
    return { success: false, error: { code: 'INTERNAL', message: 'Failed to add measurement' } }
  }
}

/**
 * Set or clear a manual RAG override on a KPI.
 * RBAC: Worker forbidden.
 * Interactive transaction: update Kpi → audit log.
 */
export async function setRagOverride(
  tenantSlug: string,
  input: SetRagOverrideInput
): Promise<ActionResult<KpiRow>> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: { code: 'FORBIDDEN', message: 'Not authenticated' } }
  }

  const tenantId = await resolveTenant(tenantSlug)
  if (!tenantId) {
    return { success: false, error: { code: 'NOT_FOUND', message: `Tenant '${tenantSlug}' not found` } }
  }

  const appUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  })

  if (!appUser) {
    return { success: false, error: { code: 'FORBIDDEN', message: 'User not in app users table' } }
  }

  if (appUser.role === 'worker') {
    return { success: false, error: { code: 'FORBIDDEN', message: 'Workers cannot override RAG status' } }
  }

  // Verify KPI belongs to this tenant
  const existingKpi = await prisma.kpi.findUnique({
    where: { id: input.kpiId },
    select: { tenantId: true },
  })

  if (!existingKpi || existingKpi.tenantId !== tenantId) {
    return { success: false, error: { code: 'NOT_FOUND', message: 'KPI not found or access denied' } }
  }

  try {
    const updatedKpi = await prisma.$transaction(async (tx) => {
      const kpi = await tx.kpi.update({
        where: { id: input.kpiId },
        data: { ragOverride: input.override ?? null },
        include: { measurements: true },
      })
      await tx.auditLog.create({
        data: {
          tenantId,
          actorId: user.id,
          entityType: 'kpi',
          entityId: input.kpiId,
          action: 'rag_override',
          payload: { kpiId: input.kpiId, override: input.override },
        },
      })
      return kpi
    })

    return { success: true, data: mapKpiToRow(updatedKpi) }
  } catch (err) {
    console.error('setRagOverride transaction failed:', err)
    return { success: false, error: { code: 'INTERNAL', message: 'Failed to set RAG override' } }
  }
}

// ─── T04: Data fetching ───────────────────────────────────────────────────────

/**
 * Fetch all KPIs for a tenant with latest measurement resolved.
 * Sorted: RED → AMBER → GREEN (urgency order).
 * No RBAC filter — all authenticated tenant users may view all KPIs.
 */
export async function getKpiRegister(
  tenantSlug: string
): Promise<ActionResult<KpiRow[]>> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: { code: 'FORBIDDEN', message: 'Not authenticated' } }
  }

  const tenantId = await resolveTenant(tenantSlug)
  if (!tenantId) {
    return { success: false, error: { code: 'NOT_FOUND', message: `Tenant '${tenantSlug}' not found` } }
  }

  try {
    const kpis = await prisma.kpi.findMany({
      where: { tenantId },
      include: {
        measurements: {
          orderBy: { measuredAt: 'desc' },
          take: 2, // only need last 2 for trend + latest actual
        },
      },
    })

    const rows = kpis.map(mapKpiToRow)
    rows.sort((a, b) => RAG_ORDER[a.ragStatus] - RAG_ORDER[b.ragStatus])

    return { success: true, data: rows }
  } catch (err) {
    console.error('getKpiRegister failed:', err)
    return { success: false, error: { code: 'INTERNAL', message: 'Failed to fetch KPI register' } }
  }
}

/**
 * Fetch a single KPI with full measurement history (newest first).
 * Verifies kpi.tenantId matches the resolved tenant before returning.
 */
export async function getKpiDetail(
  tenantSlug: string,
  kpiId: string
): Promise<ActionResult<KpiDetail>> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: { code: 'FORBIDDEN', message: 'Not authenticated' } }
  }

  const tenantId = await resolveTenant(tenantSlug)
  if (!tenantId) {
    return { success: false, error: { code: 'NOT_FOUND', message: `Tenant '${tenantSlug}' not found` } }
  }

  try {
    const kpi = await prisma.kpi.findUnique({
      where: { id: kpiId },
      include: {
        measurements: {
          orderBy: { measuredAt: 'desc' },
        },
      },
    })

    if (!kpi || kpi.tenantId !== tenantId) {
      return { success: false, error: { code: 'NOT_FOUND', message: 'KPI not found or access denied' } }
    }

    const row = mapKpiToRow(kpi)
    const detail: KpiDetail = {
      ...row,
      measurements: kpi.measurements.map(mapMeasurementToEntry),
    }

    return { success: true, data: detail }
  } catch (err) {
    console.error('getKpiDetail failed:', err)
    return { success: false, error: { code: 'INTERNAL', message: 'Failed to fetch KPI detail' } }
  }
}
