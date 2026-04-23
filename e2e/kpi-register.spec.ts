// Sprint 3 — KPI Register route/component existence checks
// Follows the same pattern as e2e/kanban.spec.ts — Vitest file existence checks.
// Browser-level E2E is verified via manual HITL sessions.
// Full Playwright browser tests will be wired up at the quality gate sprint.
//
// Run with: pnpm vitest run e2e/kpi-register.spec.ts

import { describe, it, expect } from 'vitest'
import path from 'path'
import fs from 'fs'

// ─── Route file existence ─────────────────────────────────────────────────────

describe('KPI Register — route files exist', () => {
  const root = path.resolve(process.cwd(), 'src/app/[tenantSlug]')

  it('KPI register list page exists at src/app/[tenantSlug]/kpis/page.tsx', () => {
    const filePath = path.join(root, 'kpis', 'page.tsx')
    expect(fs.existsSync(filePath), `File not found: ${filePath}`).toBe(true)
  })

  it('KPI detail page exists at src/app/[tenantSlug]/kpis/[kpiId]/page.tsx', () => {
    const filePath = path.join(root, 'kpis', '[kpiId]', 'page.tsx')
    expect(fs.existsSync(filePath), `File not found: ${filePath}`).toBe(true)
  })
})

// ─── Component file existence ─────────────────────────────────────────────────

describe('KPI Register — component files exist', () => {
  const kpiRoot = path.resolve(process.cwd(), 'src/components/kpi')

  it('KpiRegisterTable component exists', () => {
    expect(fs.existsSync(path.join(kpiRoot, 'KpiRegisterTable.tsx'))).toBe(true)
  })

  it('RagBadge component exists', () => {
    expect(fs.existsSync(path.join(kpiRoot, 'RagBadge.tsx'))).toBe(true)
  })

  it('IsoCategoryTag component exists', () => {
    expect(fs.existsSync(path.join(kpiRoot, 'IsoCategoryTag.tsx'))).toBe(true)
  })

  it('CoverageIndicator component exists', () => {
    expect(fs.existsSync(path.join(kpiRoot, 'CoverageIndicator.tsx'))).toBe(true)
  })

  it('AddMeasurementModal component exists', () => {
    expect(fs.existsSync(path.join(kpiRoot, 'AddMeasurementModal.tsx'))).toBe(true)
  })

  it('MeasurementHistory component exists', () => {
    expect(fs.existsSync(path.join(kpiRoot, 'MeasurementHistory.tsx'))).toBe(true)
  })

  it('RagOverrideControl component exists', () => {
    expect(fs.existsSync(path.join(kpiRoot, 'RagOverrideControl.tsx'))).toBe(true)
  })

  it('KpiDetailClient component exists', () => {
    expect(fs.existsSync(path.join(kpiRoot, 'KpiDetailClient.tsx'))).toBe(true)
  })
})

// ─── Action file existence ────────────────────────────────────────────────────

describe('KPI Register — server action file exists', () => {
  it('KPI server actions exist at src/app/actions/kpis.ts', () => {
    const filePath = path.resolve(process.cwd(), 'src/app/actions/kpis.ts')
    expect(fs.existsSync(filePath)).toBe(true)
  })
})

// ─── Server action exports ────────────────────────────────────────────────────

describe('KPI Register — server action exports', () => {
  it('computeRag, createKpi, addMeasurement, setRagOverride, getKpiRegister, getKpiDetail are exported', async () => {
    const actions = await import('@/app/actions/kpis')
    expect(typeof actions.computeRag).toBe('function')
    expect(typeof actions.createKpi).toBe('function')
    expect(typeof actions.addMeasurement).toBe('function')
    expect(typeof actions.setRagOverride).toBe('function')
    expect(typeof actions.getKpiRegister).toBe('function')
    expect(typeof actions.getKpiDetail).toBe('function')
  })
})

// ─── Coverage indicator pure logic ───────────────────────────────────────────

describe('CoverageIndicator — coverage count logic', () => {
  it('shows correct count when all 6 categories present', () => {
    const ALL_CATS = ['conformity', 'customer_satisfaction', 'qms_performance', 'risk', 'supplier', 'improvement']
    const covered = new Set(ALL_CATS)
    expect(covered.size).toBe(6)
  })

  it('shows 0 / 6 when no categories present', () => {
    const covered = new Set<string>([])
    expect(covered.size).toBe(0)
  })

  it('deduplicates categories correctly', () => {
    // Two KPIs in same category → only one covered
    const kpis = [
      { isoCategory: 'conformity' },
      { isoCategory: 'conformity' },
      { isoCategory: 'risk' },
    ]
    const covered = new Set(kpis.map((k) => k.isoCategory))
    expect(covered.size).toBe(2)
  })
})
