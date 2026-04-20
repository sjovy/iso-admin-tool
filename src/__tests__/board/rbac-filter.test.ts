// Sprint 2 T04 — Unit tests for RBAC filter logic
// Pure function tests — no DB calls, no network.

import { describe, it, expect } from 'vitest'
import { buildTaskFilter } from '@/app/actions/board'

const TEST_USER_ID = 'user-abc-123'
const TEST_MODULE_ID = 'module-xyz-456'

describe('buildTaskFilter — RBAC filter logic', () => {
  it('Worker role: filter contains owner_id matching userId', () => {
    const filter = buildTaskFilter(TEST_USER_ID, 'worker', TEST_MODULE_ID)
    expect(filter).toEqual({
      moduleId: TEST_MODULE_ID,
      ownerId: TEST_USER_ID,
    })
  })

  it('Worker role: filter does NOT contain a tenant restriction (module scopes it)', () => {
    const filter = buildTaskFilter(TEST_USER_ID, 'worker', TEST_MODULE_ID)
    expect(filter).not.toHaveProperty('tenantId')
  })

  it('Management role: filter is moduleId only — no owner restriction', () => {
    const filter = buildTaskFilter(TEST_USER_ID, 'management', TEST_MODULE_ID)
    expect(filter).toEqual({ moduleId: TEST_MODULE_ID })
    expect(filter).not.toHaveProperty('ownerId')
  })

  it('Company Admin role: filter is moduleId only — same as Management', () => {
    const filter = buildTaskFilter(TEST_USER_ID, 'company_admin', TEST_MODULE_ID)
    expect(filter).toEqual({ moduleId: TEST_MODULE_ID })
    expect(filter).not.toHaveProperty('ownerId')
  })

  it('Consultant role: filter is moduleId only (consultant uses service role path separately)', () => {
    const filter = buildTaskFilter(TEST_USER_ID, 'consultant', TEST_MODULE_ID)
    expect(filter).toEqual({ moduleId: TEST_MODULE_ID })
    expect(filter).not.toHaveProperty('ownerId')
  })

  it('Worker with different userId returns different filter', () => {
    const filterA = buildTaskFilter('user-a', 'worker', TEST_MODULE_ID)
    const filterB = buildTaskFilter('user-b', 'worker', TEST_MODULE_ID)
    expect(filterA).not.toEqual(filterB)
    expect(filterA.ownerId).toBe('user-a')
    expect(filterB.ownerId).toBe('user-b')
  })
})
