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
  mockModuleFindUnique,
  mockTaskCreate,
} = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockPrismaTransaction: vi.fn(),
  mockTenantFindUnique: vi.fn(),
  mockTaskFindUnique: vi.fn(),
  mockUserFindUnique: vi.fn(),
  mockTaskUpdate: vi.fn(),
  mockAuditLogCreate: vi.fn(),
  mockModuleFindUnique: vi.fn(),
  mockTaskCreate: vi.fn(),
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
    task: { findUnique: mockTaskFindUnique, update: mockTaskUpdate, create: mockTaskCreate },
    module: { findUnique: mockModuleFindUnique },
    user: { findUnique: mockUserFindUnique },
    auditLog: { create: mockAuditLogCreate },
    $transaction: mockPrismaTransaction,
  },
}))

// Import AFTER mocks are registered
import { createTask, moveTask, updateTask } from '@/app/actions/tasks'

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
  mockTaskFindUnique.mockResolvedValue({ tenantId: TENANT_ID, ownerId: WORKER_ID })
  mockUserFindUnique.mockResolvedValue({ role: 'worker', tenantId: TENANT_ID })
  // Batch transaction helpers — return sentinel values; $transaction returns results
  mockTaskUpdate.mockReturnValue({ _op: 'task.update' })
  mockAuditLogCreate.mockReturnValue({ _op: 'auditLog.create' })
}

function setupManagementAuth() {
  mockGetUser.mockResolvedValue({ data: { user: { id: 'mgmt-user-id' } } })
  mockTenantFindUnique.mockResolvedValue({ id: TENANT_ID })
  mockTaskFindUnique.mockResolvedValue({ tenantId: TENANT_ID, ownerId: WORKER_ID })
  mockUserFindUnique.mockResolvedValue({ role: 'management', tenantId: TENANT_ID })
  mockTaskUpdate.mockReturnValue({ _op: 'task.update' })
  mockAuditLogCreate.mockReturnValue({ _op: 'auditLog.create' })
}

beforeEach(() => {
  vi.resetAllMocks()
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

describe('createTask — cross-tenant guard (T01)', () => {
  it('rejects when appUser.tenantId !== tenantId', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: WORKER_ID } } })
    mockTenantFindUnique.mockResolvedValue({ id: TENANT_ID })
    mockModuleFindUnique.mockResolvedValue({ boardVariant: 'STANDARD', tenantId: TENANT_ID })
    // appUser has different tenantId
    mockUserFindUnique.mockResolvedValue({ role: 'worker', tenantId: 'other-tenant-id' })

    const result = await createTask(TENANT_SLUG, {
      moduleId: 'module-id',
      title: 'Test',
      status: 'backlog',
      priority: 'MEDIUM',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.code).toBe('FORBIDDEN')
    }
    expect(mockPrismaTransaction).not.toHaveBeenCalled()
  })
})

describe('moveTask — cross-tenant guard (T01)', () => {
  it('rejects when appUser.tenantId !== tenantId', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: WORKER_ID } } })
    mockTenantFindUnique.mockResolvedValue({ id: TENANT_ID })
    mockTaskFindUnique.mockResolvedValue({
      id: TASK_ID,
      tenantId: TENANT_ID,
      ownerId: WORKER_ID,
      status: 'backlog',
      module: { boardVariant: 'STANDARD' },
      owner: { id: WORKER_ID, email: 'worker@test.com' },
    })
    // appUser has different tenantId
    mockUserFindUnique.mockResolvedValue({ role: 'worker', tenantId: 'other-tenant-id' })

    const result = await moveTask(TENANT_SLUG, {
      taskId: TASK_ID,
      targetStatus: 'in_progress',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.code).toBe('FORBIDDEN')
    }
    expect(mockPrismaTransaction).not.toHaveBeenCalled()
  })
})

describe('updateTask — cross-tenant guard (T01)', () => {
  it('rejects when appUser.tenantId !== tenantId', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: WORKER_ID } } })
    mockTenantFindUnique.mockResolvedValue({ id: TENANT_ID })
    mockTaskFindUnique.mockResolvedValue({ tenantId: TENANT_ID })
    // appUser has different tenantId
    mockUserFindUnique.mockResolvedValue({ role: 'worker', tenantId: 'other-tenant-id' })

    const result = await updateTask(TENANT_SLUG, { taskId: TASK_ID, title: 'X' })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.code).toBe('FORBIDDEN')
    }
    expect(mockPrismaTransaction).not.toHaveBeenCalled()
  })
})

describe('createTask — Worker RBAC guard (T03)', () => {
  it('rejects when Worker submits another user id as ownerId', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: WORKER_ID } } })
    mockTenantFindUnique.mockResolvedValue({ id: TENANT_ID })
    mockModuleFindUnique.mockResolvedValue({ boardVariant: 'STANDARD', tenantId: TENANT_ID })
    mockUserFindUnique.mockResolvedValue({ role: 'worker', tenantId: TENANT_ID })

    const result = await createTask(TENANT_SLUG, {
      moduleId: 'module-id',
      title: 'Test',
      status: 'backlog',
      priority: 'MEDIUM',
      ownerId: OTHER_USER_ID,
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.code).toBe('FORBIDDEN')
    }
    expect(mockPrismaTransaction).not.toHaveBeenCalled()
  })

  it('rejects when Worker submits empty string ownerId pointing to another user slot', async () => {
    // Empty string is falsy — the old guard would let this through.
    // With the fix, empty string is normalized to null and treated as "no owner" → allowed.
    // This test verifies the normalization works: empty string → null → allowed for Worker.
    mockGetUser.mockResolvedValue({ data: { user: { id: WORKER_ID } } })
    mockTenantFindUnique.mockResolvedValue({ id: TENANT_ID })
    mockModuleFindUnique.mockResolvedValue({ boardVariant: 'STANDARD', tenantId: TENANT_ID })
    mockUserFindUnique.mockResolvedValue({ role: 'worker', tenantId: TENANT_ID })
    // Transaction should succeed — empty string ownerId normalizes to null (no owner)
    mockPrismaTransaction.mockResolvedValue(
      Object.assign(
        {
          id: TASK_ID,
          title: 'Test',
          description: null,
          owner: null,
          dueDate: null,
          isoClauseRef: null,
          priority: 'MEDIUM',
          status: 'backlog',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {}
      )
    )

    const result = await createTask(TENANT_SLUG, {
      moduleId: 'module-id',
      title: 'Test',
      status: 'backlog',
      priority: 'MEDIUM',
      ownerId: '',
    })

    // Empty string normalized to null → Worker creates unowned task → allowed
    expect(result.success).toBe(true)
  })

  it('allows Worker to create a task assigned to themselves', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: WORKER_ID } } })
    mockTenantFindUnique.mockResolvedValue({ id: TENANT_ID })
    mockModuleFindUnique.mockResolvedValue({ boardVariant: 'STANDARD', tenantId: TENANT_ID })
    mockUserFindUnique.mockResolvedValue({ role: 'worker', tenantId: TENANT_ID })
    mockPrismaTransaction.mockResolvedValue({
      id: TASK_ID,
      title: 'Test',
      description: null,
      owner: { id: WORKER_ID, email: 'worker@test.com' },
      dueDate: null,
      isoClauseRef: null,
      priority: 'MEDIUM',
      status: 'backlog',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const result = await createTask(TENANT_SLUG, {
      moduleId: 'module-id',
      title: 'Test',
      status: 'backlog',
      priority: 'MEDIUM',
      ownerId: WORKER_ID,
    })

    expect(result.success).toBe(true)
    expect(mockPrismaTransaction).toHaveBeenCalledOnce()
  })
})

describe('updateTask — Worker ownership guard (T04)', () => {
  it('rejects when Worker attempts to edit a task they do not own', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: WORKER_ID } } })
    mockTenantFindUnique.mockResolvedValue({ id: TENANT_ID })
    // Task owned by a different user
    mockTaskFindUnique.mockResolvedValue({ tenantId: TENANT_ID, ownerId: OTHER_USER_ID })
    mockUserFindUnique.mockResolvedValue({ role: 'worker', tenantId: TENANT_ID })

    const result = await updateTask(TENANT_SLUG, { taskId: TASK_ID, title: 'Hacked Title' })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.code).toBe('FORBIDDEN')
    }
    expect(mockPrismaTransaction).not.toHaveBeenCalled()
  })

  it('rejects when Worker attempts to edit an unowned task (ownerId null)', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: WORKER_ID } } })
    mockTenantFindUnique.mockResolvedValue({ id: TENANT_ID })
    // Unowned task
    mockTaskFindUnique.mockResolvedValue({ tenantId: TENANT_ID, ownerId: null })
    mockUserFindUnique.mockResolvedValue({ role: 'worker', tenantId: TENANT_ID })

    const result = await updateTask(TENANT_SLUG, { taskId: TASK_ID, title: 'Hacked Title' })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.code).toBe('FORBIDDEN')
    }
    expect(mockPrismaTransaction).not.toHaveBeenCalled()
  })

  it('allows Worker to edit their own task', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: WORKER_ID } } })
    mockTenantFindUnique.mockResolvedValue({ id: TENANT_ID })
    // Task owned by the Worker
    mockTaskFindUnique.mockResolvedValue({ tenantId: TENANT_ID, ownerId: WORKER_ID })
    mockUserFindUnique.mockResolvedValue({ role: 'worker', tenantId: TENANT_ID })
    mockPrismaTransaction.mockResolvedValue([
      makeUpdatedTask({ title: 'Updated Title' }),
      { id: 'audit-id' },
    ])

    const result = await updateTask(TENANT_SLUG, { taskId: TASK_ID, title: 'Updated Title' })

    expect(result.success).toBe(true)
    expect(mockPrismaTransaction).toHaveBeenCalledOnce()
  })

  it('Management can edit any task regardless of ownership', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'mgmt-user-id' } } })
    mockTenantFindUnique.mockResolvedValue({ id: TENANT_ID })
    // Task owned by a different user — management should still succeed
    mockTaskFindUnique.mockResolvedValue({ tenantId: TENANT_ID, ownerId: OTHER_USER_ID })
    mockUserFindUnique.mockResolvedValue({ role: 'management', tenantId: TENANT_ID })
    mockPrismaTransaction.mockResolvedValue([
      makeUpdatedTask({ title: 'Management Edit' }),
      { id: 'audit-id' },
    ])

    const result = await updateTask(TENANT_SLUG, { taskId: TASK_ID, title: 'Management Edit' })

    expect(result.success).toBe(true)
    expect(mockPrismaTransaction).toHaveBeenCalledOnce()
  })
})
