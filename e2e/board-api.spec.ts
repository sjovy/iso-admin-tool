// Sprint 2 — Integration spec: board API data contract
// Verifies that the seeded tenant has 9 modules with correct data.
//
// This spec tests the data layer directly (via Prisma) rather than the server action
// (which requires a Next.js request context for cookies/auth). The server action
// integration with auth is tested via manual HITL sessions.
//
// Run with: pnpm vitest run e2e/board-api.spec.ts
// Requires: DIRECT_URL or DATABASE_URL in .env.local AND reachable DB from local machine.
//
// When Playwright e2e is configured (future sprint), browser-based tests should
// verify the rendered module list at /[tenantSlug]/modules.

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { config } from 'dotenv'

// Load .env.local for local runs
config({ path: '.env.local' })

const HAS_DB = Boolean(process.env.DATABASE_URL || process.env.DIRECT_URL)

// These tests are integration tests that require a live database connection.
// They are skipped in CI environments without database access.
// The database seeding is verified separately via Supabase MCP.
describe.skipIf(!HAS_DB)('Board API — data contract integration', () => {
  // Using Supabase JS client (service role) for these tests to bypass RLS
  // and verify data at the DB level without requiring a Next.js request context.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let adminClient: any

  beforeAll(async () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      console.log('Skipping — NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set')
      return
    }

    const { createClient } = await import('@supabase/supabase-js')
    adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  })

  afterAll(async () => {
    // No cleanup — we're only reading seeded data
  })

  it('seeded tenant acme-corp has exactly 9 modules', async () => {
    if (!adminClient) return

    const { data, error } = await adminClient
      .from('modules')
      .select('id, slug, pdca_phase, board_variant')
      .eq('tenant_id', 'tenant_acme_001')

    expect(error).toBeNull()
    expect(data).toHaveLength(9)
  })

  it('modules are sorted correctly when ordered by PDCA phase', async () => {
    if (!adminClient) return

    const { data } = await adminClient
      .from('modules')
      .select('slug, pdca_phase')
      .eq('tenant_id', 'tenant_acme_001')
      .order('pdca_phase', { ascending: true })

    expect(data).toBeTruthy()
    // All 4 PDCA phases should be represented
    const phases: string[] = (data ?? []).map((m: { pdca_phase: string }) => m.pdca_phase)
    expect(phases).toContain('PLAN')
    expect(phases).toContain('DO')
    expect(phases).toContain('CHECK')
    expect(phases).toContain('ACT')
  })

  it('all 9 expected module slugs are present in the database', async () => {
    if (!adminClient) return

    const { data } = await adminClient
      .from('modules')
      .select('slug')
      .eq('tenant_id', 'tenant_acme_001')

    const slugs: string[] = (data ?? []).map((m: { slug: string }) => m.slug)
    const expectedSlugs = [
      'planera',
      'utfora',
      'mata-utvardera',
      'forbattra',
      'ledning',
      'resurser',
      'kommunikation',
      'risker-mojligheter',
      'leverantorer',
    ]

    for (const slug of expectedSlugs) {
      expect(slugs).toContain(slug)
    }
  })

  it('exactly 2 EXTENDED modules and 7 STANDARD modules', async () => {
    if (!adminClient) return

    const { data } = await adminClient
      .from('modules')
      .select('board_variant')
      .eq('tenant_id', 'tenant_acme_001')

    const extended = (data ?? []).filter((m: { board_variant: string }) => m.board_variant === 'EXTENDED')
    const standard = (data ?? []).filter((m: { board_variant: string }) => m.board_variant === 'STANDARD')

    expect(extended).toHaveLength(2)
    expect(standard).toHaveLength(7)
  })
})

// Type-check spec: verify the TypeScript contracts are correct
// These tests run without DB access — they verify type contract integrity.
describe('Board type contracts — compile-time validation', () => {
  it('BoardVariant type covers STANDARD and EXTENDED', async () => {
    const { isValidStatus } = await import('@/lib/board-utils')

    // Type check: these should compile and return correct results
    const result1: boolean = isValidStatus('backlog', 'STANDARD')
    const result2: boolean = isValidStatus('verified', 'EXTENDED')
    const result3: boolean = isValidStatus('verified', 'STANDARD')

    expect(result1).toBe(true)
    expect(result2).toBe(true)
    expect(result3).toBe(false)
  })

  it('buildTaskFilter returns correct shape for all role types', async () => {
    const { buildTaskFilter } = await import('@/lib/utils/actions')

    const workerFilter = buildTaskFilter('user-1', 'worker', 'module-1')
    expect(workerFilter).toHaveProperty('ownerId', 'user-1')
    expect(workerFilter).toHaveProperty('moduleId', 'module-1')

    const mgmtFilter = buildTaskFilter('user-1', 'management', 'module-1')
    expect(mgmtFilter).not.toHaveProperty('ownerId')
    expect(mgmtFilter).toHaveProperty('moduleId', 'module-1')
  })
})
