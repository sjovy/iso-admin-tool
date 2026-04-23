// Sprint 3 T09 — Unit tests for KPI server actions + computeRag
// Tests the real exported functions with mocked prisma + supabase.
// computeRag is a pure function — tested without any mocking.
// Uses vi.hoisted to avoid TDZ issues with hoisted vi.mock calls.

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ─── Hoisted mock stubs ───────────────────────────────────────────────────────

const {
  mockGetUser,
  mockPrismaTransaction,
  mockTenantFindUnique,
  mockKpiFindUnique,
  mockKpiCreate,
  mockKpiUpdate,
  mockKpiMeasurementCreate,
  mockUserFindUnique,
  mockAuditLogCreate,
} = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockPrismaTransaction: vi.fn(),
  mockTenantFindUnique: vi.fn(),
  mockKpiFindUnique: vi.fn(),
  mockKpiCreate: vi.fn(),
  mockKpiUpdate: vi.fn(),
  mockKpiMeasurementCreate: vi.fn(),
  mockUserFindUnique: vi.fn(),
  mockAuditLogCreate: vi.fn(),
}))

// ─── Module mocks ─────────────────────────────────────────────────────────────

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() =>
    Promise.resolve({
      auth: { getUser: mockGetUser },
    })
  ),
}))

vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    tenant: { findUnique: mockTenantFindUnique },
    kpi: { findUnique: mockKpiFindUnique, create: mockKpiCreate, update: mockKpiUpdate },
    kpiMeasurement: { create: mockKpiMeasurementCreate },
    user: { findUnique: mockUserFindUnique },
    auditLog: { create: mockAuditLogCreate },
    $transaction: mockPrismaTransaction,
  },
}))

// Import AFTER mocks
import { createKpi, addMeasurement, setRagOverride } from '@/app/actions/kpis'
import { computeRag } from '@/lib/utils/actions'

// ─── Shared fixtures ──────────────────────────────────────────────────────────

const MGMT_ID = 'mgmt-user-id'
const WORKER_ID = 'worker-user-id'
const TENANT_SLUG = 'test-tenant'
const TENANT_ID = 'tenant-uuid-123'
const KPI_ID = 'kpi-uuid-789'
const MEASUREMENT_ID = 'measurement-uuid-abc'

const NOW = new Date()

function makeKpi(overrides: Record<string, unknown> = {}) {
  return {
    id: KPI_ID,
    tenantId: TENANT_ID,
    name: 'Test KPI',
    description: null,
    unit: '%',
    target: 90,
    isoCategory: 'conformity',
    ragOverride: null,
    linkedCorrectiveActionId: null,
    createdAt: NOW,
    updatedAt: NOW,
    measurements: [],
    ...overrides,
  }
}

function setupMgmtAuth() {
  mockGetUser.mockResolvedValue({ data: { user: { id: MGMT_ID } } })
  mockTenantFindUnique.mockResolvedValue({ id: TENANT_ID })
  mockUserFindUnique.mockResolvedValue({ role: 'management' })
}

function setupWorkerAuth() {
  mockGetUser.mockResolvedValue({ data: { user: { id: WORKER_ID } } })
  mockTenantFindUnique.mockResolvedValue({ id: TENANT_ID })
  mockUserFindUnique.mockResolvedValue({ role: 'worker' })
}

beforeEach(() => {
  vi.clearAllMocks()
})

// ─── computeRag — pure function tests ────────────────────────────────────────

describe('computeRag — pure function (no mocking)', () => {
  it('null actual → AMBER (no data)', () => {
    expect(computeRag(100, null)).toBe('AMBER')
  })

  it('actual >= target → GREEN', () => {
    expect(computeRag(90, 90)).toBe('GREEN')
    expect(computeRag(90, 100)).toBe('GREEN')
  })

  it('actual >= target * 0.8 → AMBER', () => {
    expect(computeRag(100, 80)).toBe('AMBER')
    expect(computeRag(100, 85)).toBe('AMBER')
    expect(computeRag(100, 99)).toBe('AMBER')
  })

  it('actual < target * 0.8 → RED', () => {
    expect(computeRag(100, 79)).toBe('RED')
    expect(computeRag(100, 0)).toBe('RED')
  })

  it('exact 80% boundary is AMBER, not RED', () => {
    expect(computeRag(100, 80)).toBe('AMBER')
  })
})

// ─── createKpi tests ──────────────────────────────────────────────────────────

describe('createKpi — server action', () => {
  it('creates KPI and audit log in same interactive transaction', async () => {
    setupMgmtAuth()

    const createdKpi = makeKpi()
    // Interactive transaction: mock receives callback, executes it with tx
    mockPrismaTransaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => {
      const tx = {
        kpi: { create: vi.fn().mockResolvedValue(createdKpi) },
        auditLog: { create: vi.fn().mockResolvedValue({ id: 'audit-id' }) },
      }
      return fn(tx)
    })

    const result = await createKpi(TENANT_SLUG, {
      name: 'Test KPI',
      unit: '%',
      target: 90,
      isoCategory: 'conformity',
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.id).toBe(KPI_ID)
      expect(result.data.name).toBe('Test KPI')
      expect(result.data.ragStatus).toBe('AMBER') // no measurements → AMBER
    }
    expect(mockPrismaTransaction).toHaveBeenCalledOnce()
  })

  it('Worker role returns FORBIDDEN', async () => {
    setupWorkerAuth()

    const result = await createKpi(TENANT_SLUG, {
      name: 'Test KPI',
      unit: '%',
      target: 90,
      isoCategory: 'conformity',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.code).toBe('FORBIDDEN')
    }
    expect(mockPrismaTransaction).not.toHaveBeenCalled()
  })

  it('unauthenticated call returns FORBIDDEN', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const result = await createKpi(TENANT_SLUG, {
      name: 'X',
      unit: '%',
      target: 50,
      isoCategory: 'risk',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.code).toBe('FORBIDDEN')
    }
  })
})

// ─── addMeasurement tests ─────────────────────────────────────────────────────

describe('addMeasurement — server action', () => {
  it('creates measurement and audit log in same interactive transaction', async () => {
    // addMeasurement allowed for all roles
    setupWorkerAuth()

    const parentKpi = makeKpi()
    mockKpiFindUnique.mockResolvedValue(parentKpi)

    const createdMeasurement = {
      id: MEASUREMENT_ID,
      kpiId: KPI_ID,
      tenantId: TENANT_ID,
      actual: 85,
      measuredAt: NOW,
      notes: null,
      createdAt: NOW,
    }

    mockPrismaTransaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => {
      const tx = {
        kpiMeasurement: { create: vi.fn().mockResolvedValue(createdMeasurement) },
        auditLog: { create: vi.fn().mockResolvedValue({ id: 'audit-id' }) },
      }
      return fn(tx)
    })

    const result = await addMeasurement(TENANT_SLUG, {
      kpiId: KPI_ID,
      actual: 85,
      measuredAt: NOW.toISOString(),
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.id).toBe(MEASUREMENT_ID)
      expect(result.data.actual).toBe(85)
    }
    expect(mockPrismaTransaction).toHaveBeenCalledOnce()
  })

  it('Worker role is allowed to add measurements', async () => {
    setupWorkerAuth()

    const parentKpi = makeKpi()
    mockKpiFindUnique.mockResolvedValue(parentKpi)

    const createdMeasurement = {
      id: MEASUREMENT_ID,
      kpiId: KPI_ID,
      tenantId: TENANT_ID,
      actual: 70,
      measuredAt: NOW,
      notes: null,
      createdAt: NOW,
    }

    mockPrismaTransaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => {
      const tx = {
        kpiMeasurement: { create: vi.fn().mockResolvedValue(createdMeasurement) },
        auditLog: { create: vi.fn().mockResolvedValue({ id: 'audit-id' }) },
      }
      return fn(tx)
    })

    const result = await addMeasurement(TENANT_SLUG, {
      kpiId: KPI_ID,
      actual: 70,
      measuredAt: NOW.toISOString(),
    })

    expect(result.success).toBe(true)
  })

  it('KPI belonging to a different tenant returns NOT_FOUND', async () => {
    setupWorkerAuth()
    // KPI exists but belongs to a different tenant
    mockKpiFindUnique.mockResolvedValue({ tenantId: 'other-tenant-id' })

    const result = await addMeasurement(TENANT_SLUG, {
      kpiId: KPI_ID,
      actual: 85,
      measuredAt: NOW.toISOString(),
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.code).toBe('NOT_FOUND')
    }
  })
})

// ─── setRagOverride tests ─────────────────────────────────────────────────────

describe('setRagOverride — server action', () => {
  it('Worker role returns FORBIDDEN', async () => {
    setupWorkerAuth()

    const result = await setRagOverride(TENANT_SLUG, {
      kpiId: KPI_ID,
      override: 'GREEN',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.code).toBe('FORBIDDEN')
    }
    expect(mockPrismaTransaction).not.toHaveBeenCalled()
  })

  it('Management can set override; audit log written in same transaction', async () => {
    setupMgmtAuth()

    // Verify KPI belongs to tenant
    mockKpiFindUnique.mockResolvedValue({ tenantId: TENANT_ID })

    const updatedKpi = makeKpi({ ragOverride: 'GREEN' })
    mockPrismaTransaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => {
      const tx = {
        kpi: { update: vi.fn().mockResolvedValue(updatedKpi) },
        auditLog: { create: vi.fn().mockResolvedValue({ id: 'audit-id' }) },
      }
      return fn(tx)
    })

    const result = await setRagOverride(TENANT_SLUG, {
      kpiId: KPI_ID,
      override: 'GREEN',
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.ragStatus).toBe('GREEN')
    }
    expect(mockPrismaTransaction).toHaveBeenCalledOnce()
  })

  it('null override clears manual override (reverts to computed)', async () => {
    setupMgmtAuth()

    mockKpiFindUnique.mockResolvedValue({ tenantId: TENANT_ID })

    // KPI with no override, no measurements → AMBER
    const updatedKpi = makeKpi({ ragOverride: null })
    mockPrismaTransaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => {
      const tx = {
        kpi: { update: vi.fn().mockResolvedValue(updatedKpi) },
        auditLog: { create: vi.fn().mockResolvedValue({ id: 'audit-id' }) },
      }
      return fn(tx)
    })

    const result = await setRagOverride(TENANT_SLUG, {
      kpiId: KPI_ID,
      override: null,
    })

    expect(result.success).toBe(true)
    if (result.success) {
      // No override, no measurements → computed as AMBER
      expect(result.data.ragStatus).toBe('AMBER')
    }
  })
})
