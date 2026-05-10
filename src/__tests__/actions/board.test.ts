// Sprint 4 T02 — Cross-tenant guard tests for board.ts server actions
// Tests getModuleList, getBoardData, and getBoardUsers tenant isolation.
// Uses vi.hoisted to avoid TDZ errors when mocks are hoisted.

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ─── Hoisted mock stubs ───────────────────────────────────────────────────────

const {
  mockGetUser,
  mockTenantFindUnique,
  mockUserFindUnique,
  mockUserFindMany,
  mockModuleFindMany,
  mockModuleFindUnique,
  mockTaskFindMany,
} = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockTenantFindUnique: vi.fn(),
  mockUserFindUnique: vi.fn(),
  mockUserFindMany: vi.fn(),
  mockModuleFindMany: vi.fn(),
  mockModuleFindUnique: vi.fn(),
  mockTaskFindMany: vi.fn(),
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
    user: { findUnique: mockUserFindUnique, findMany: mockUserFindMany },
    module: { findMany: mockModuleFindMany, findUnique: mockModuleFindUnique },
    task: { findMany: mockTaskFindMany },
  },
}))

vi.mock('@/lib/utils/actions', () => ({
  buildTaskFilter: vi.fn(() => ({})),
}))

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({ auth: {}, from: vi.fn() })),
}))

// Import AFTER mocks are registered
import { getModuleList, getBoardData, getBoardUsers } from '@/app/actions/board'

// ─── Shared fixtures ──────────────────────────────────────────────────────────

const USER_ID = 'user-uuid-abc'
const TENANT_SLUG = 'test-tenant'
const TENANT_ID = 'tenant-uuid-123'
const OTHER_TENANT_ID = 'other-tenant-uuid-999'
const MODULE_SLUG = 'test-module'
const MODULE_ID = 'module-uuid-456'

function setupAuth(tenantId: string) {
  mockGetUser.mockResolvedValue({ data: { user: { id: USER_ID } } })
  mockTenantFindUnique.mockResolvedValue({ id: TENANT_ID })
  mockUserFindUnique.mockResolvedValue({ role: 'management', tenantId })
}

function makeModule(overrides: Record<string, unknown> = {}) {
  return {
    id: MODULE_ID,
    name: 'Test Module',
    slug: MODULE_SLUG,
    pdcaPhase: 'PLAN',
    isoClauseRef: null,
    boardVariant: 'STANDARD',
    tenantId: TENANT_ID,
    _count: { tasks: 0 },
    ...overrides,
  }
}

beforeEach(() => {
  vi.resetAllMocks()
})

// ─── getModuleList — cross-tenant guard (T02) ─────────────────────────────────

describe('getModuleList — cross-tenant guard (T02)', () => {
  it('rejects when appUser.tenantId !== tenantId', async () => {
    setupAuth(OTHER_TENANT_ID)

    const result = await getModuleList(TENANT_SLUG)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.code).toBe('FORBIDDEN')
    }
    expect(mockModuleFindMany).not.toHaveBeenCalled()
  })

  it('allows access when appUser.tenantId === tenantId', async () => {
    setupAuth(TENANT_ID)
    mockModuleFindMany.mockResolvedValue([])

    const result = await getModuleList(TENANT_SLUG)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual([])
    }
    expect(mockModuleFindMany).toHaveBeenCalledOnce()
  })
})

// ─── getBoardData — cross-tenant guard (T02) ─────────────────────────────────

describe('getBoardData — cross-tenant guard (T02)', () => {
  it('rejects when appUser.tenantId !== tenantId', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: USER_ID } } })
    mockTenantFindUnique.mockResolvedValue({ id: TENANT_ID })
    mockModuleFindUnique.mockResolvedValue(makeModule())
    mockUserFindUnique.mockResolvedValue({ role: 'management', tenantId: OTHER_TENANT_ID })

    const result = await getBoardData(TENANT_SLUG, MODULE_SLUG)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.code).toBe('FORBIDDEN')
    }
    expect(mockTaskFindMany).not.toHaveBeenCalled()
  })
})

// ─── getBoardUsers — cross-tenant guard (T02) ────────────────────────────────

describe('getBoardUsers — cross-tenant guard (T02)', () => {
  it('rejects when appUser.tenantId !== tenantId', async () => {
    setupAuth(OTHER_TENANT_ID)

    const result = await getBoardUsers(TENANT_SLUG)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.code).toBe('FORBIDDEN')
    }
  })

  it('allows access when appUser.tenantId === tenantId', async () => {
    setupAuth(TENANT_ID)
    mockUserFindMany.mockResolvedValue([])

    const result = await getBoardUsers(TENANT_SLUG)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(Array.isArray(result.data)).toBe(true)
    }
  })
})
