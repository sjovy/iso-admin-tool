// Sprint 3 T08 — Unit tests for updateTask Worker RBAC guard
// Tests the real exported function with mocked prisma + supabase.
// Uses vi.hoisted to avoid TDZ errors when mocks are hoisted.

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ─── Hoisted mock stubs ───────────────────────────────────────────────────────

const {
  mockGetUser,
  mockPrismaTransaction,
  mockTenantFindUnique,
  mockTaskFindUnique,
  mockUserFindUnique,
  mockTaskUpdate,
  mockAuditLogCreate,
} = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockPrismaTransaction: vi.fn(),
  mockTenantFindUnique: vi.fn(),
  mockTaskFindUnique: vi.fn(),
  mockUserFindUnique: vi.fn(),
  mockTaskUpdate: vi.fn(),
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
    task: { findUnique: mockTaskFindUnique, update: mockTaskUpdate },
    user: { findUnique: mockUserFindUnique },
    auditLog: { create: mockAuditLogCreate },
    $transaction: mockPrismaTransaction,
  },
}))

// Import AFTER mocks are registered
import { updateTask } from '@/app/actions/tasks'

// ─── Shared test fixtures ─────────────────────────────────────────────────────

const WORKER_ID = 'worker-user-id'
const OTHER_USER_ID = 'other-user-id'
const TENANT_SLUG = 'test-tenant'
const TENANT_ID = 'tenant-uuid-123'
const TASK_ID = 'task-uuid-456'

function makeUpdatedTask(overrides: Record<string, unknown> = {}) {
  return {
    id: TASK_ID,
    title: 'Task',
    description: null,
    owner: null,
    dueDate: null,
    isoClauseRef: null,
    priority: 'MEDIUM',
    status: 'backlog',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

function setupWorkerAuth() {
  mockGetUser.mockResolvedValue({ data: { user: { id: WORKER_ID } } })
  mockTenantFindUnique.mockResolvedValue({ id: TENANT_ID })
  mockTaskFindUnique.mockResolvedValue({ tenantId: TENANT_ID })
  mockUserFindUnique.mockResolvedValue({ role: 'worker' })
  // Batch transaction helpers — return sentinel values; $transaction returns results
  mockTaskUpdate.mockReturnValue({ _op: 'task.update' })
  mockAuditLogCreate.mockReturnValue({ _op: 'auditLog.create' })
}

function setupManagementAuth() {
  mockGetUser.mockResolvedValue({ data: { user: { id: 'mgmt-user-id' } } })
  mockTenantFindUnique.mockResolvedValue({ id: TENANT_ID })
  mockTaskFindUnique.mockResolvedValue({ tenantId: TENANT_ID })
  mockUserFindUnique.mockResolvedValue({ role: 'management' })
  mockTaskUpdate.mockReturnValue({ _op: 'task.update' })
  mockAuditLogCreate.mockReturnValue({ _op: 'auditLog.create' })
}

beforeEach(() => {
  vi.clearAllMocks()
})

// ─── updateTask Worker RBAC guard ─────────────────────────────────────────────

describe('updateTask — Worker RBAC guard (T08)', () => {
  it('Worker reassigning ownerId to another user returns FORBIDDEN', async () => {
    setupWorkerAuth()

    const result = await updateTask(TENANT_SLUG, {
      taskId: TASK_ID,
      ownerId: OTHER_USER_ID,  // different from WORKER_ID → blocked
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.code).toBe('FORBIDDEN')
    }
    expect(mockPrismaTransaction).not.toHaveBeenCalled()
  })

  it('Worker setting ownerId to own user id is allowed', async () => {
    setupWorkerAuth()
    mockPrismaTransaction.mockResolvedValue([
      makeUpdatedTask({ owner: { id: WORKER_ID, email: 'worker@test.com' } }),
      { id: 'audit-id' },
    ])

    const result = await updateTask(TENANT_SLUG, {
      taskId: TASK_ID,
      ownerId: WORKER_ID,  // own id — allowed
    })

    expect(result.success).toBe(true)
    expect(mockPrismaTransaction).toHaveBeenCalledOnce()
  })

  it('Worker updating title (no ownerId) is allowed', async () => {
    setupWorkerAuth()
    mockPrismaTransaction.mockResolvedValue([
      makeUpdatedTask({ title: 'Updated Title' }),
      { id: 'audit-id' },
    ])

    const result = await updateTask(TENANT_SLUG, {
      taskId: TASK_ID,
      title: 'Updated Title',
    })

    expect(result.success).toBe(true)
    expect(mockPrismaTransaction).toHaveBeenCalledOnce()
  })

  it('Worker setting ownerId to null is allowed (clearing ownership)', async () => {
    setupWorkerAuth()
    mockPrismaTransaction.mockResolvedValue([makeUpdatedTask(), { id: 'audit-id' }])

    const result = await updateTask(TENANT_SLUG, {
      taskId: TASK_ID,
      ownerId: null,
    })

    expect(result.success).toBe(true)
    expect(mockPrismaTransaction).toHaveBeenCalledOnce()
  })

  it('Management can reassign ownerId to another user', async () => {
    setupManagementAuth()
    mockPrismaTransaction.mockResolvedValue([
      makeUpdatedTask({ owner: { id: OTHER_USER_ID, email: 'other@test.com' } }),
      { id: 'audit-id' },
    ])

    const result = await updateTask(TENANT_SLUG, {
      taskId: TASK_ID,
      ownerId: OTHER_USER_ID,
    })

    expect(result.success).toBe(true)
    expect(mockPrismaTransaction).toHaveBeenCalledOnce()
  })

  it('Unauthenticated call returns FORBIDDEN', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const result = await updateTask(TENANT_SLUG, { taskId: TASK_ID, title: 'X' })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.code).toBe('FORBIDDEN')
    }
  })
})
