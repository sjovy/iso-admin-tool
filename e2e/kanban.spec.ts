// Sprint 2 — Track 2 Kanban UI route stubs
//
// These specs validate that the routes exist and Next.js page components are importable.
// Browser-level rendering is verified via manual HITL sessions.
//
// Run with: pnpm vitest run e2e/kanban.spec.ts

import { describe, it, expect } from 'vitest'
import path from 'path'
import fs from 'fs'

// ─── Route existence checks ───────────────────────────────────────────────────

describe('Kanban UI — route files exist', () => {
  const root = path.resolve(process.cwd(), 'src/app/[tenantSlug]')

  it('modules list page exists at src/app/[tenantSlug]/modules/page.tsx', () => {
    const filePath = path.join(root, 'modules', 'page.tsx')
    expect(fs.existsSync(filePath), `File not found: ${filePath}`).toBe(true)
  })

  it('module board page exists at src/app/[tenantSlug]/modules/[moduleSlug]/page.tsx', () => {
    const filePath = path.join(root, 'modules', '[moduleSlug]', 'page.tsx')
    expect(fs.existsSync(filePath), `File not found: ${filePath}`).toBe(true)
  })
})

// ─── Component file existence checks ─────────────────────────────────────────

describe('Kanban UI — component files exist', () => {
  const componentsRoot = path.resolve(process.cwd(), 'src/components')

  it('KanbanBoard component exists', () => {
    const filePath = path.join(componentsRoot, 'board', 'KanbanBoard.tsx')
    expect(fs.existsSync(filePath)).toBe(true)
  })

  it('KanbanColumn component exists', () => {
    const filePath = path.join(componentsRoot, 'board', 'KanbanColumn.tsx')
    expect(fs.existsSync(filePath)).toBe(true)
  })

  it('TaskCard component exists', () => {
    const filePath = path.join(componentsRoot, 'board', 'TaskCard.tsx')
    expect(fs.existsSync(filePath)).toBe(true)
  })

  it('SortableTaskCard component exists', () => {
    const filePath = path.join(componentsRoot, 'board', 'SortableTaskCard.tsx')
    expect(fs.existsSync(filePath)).toBe(true)
  })

  it('TaskCreationModal component exists', () => {
    const filePath = path.join(componentsRoot, 'task', 'TaskCreationModal.tsx')
    expect(fs.existsSync(filePath)).toBe(true)
  })

  it('TaskDetailPanel component exists', () => {
    const filePath = path.join(componentsRoot, 'task', 'TaskDetailPanel.tsx')
    expect(fs.existsSync(filePath)).toBe(true)
  })
})

// ─── Board utils import ───────────────────────────────────────────────────────

describe('Kanban UI — board-utils exports', () => {
  it('groupTasksByStatus and applyOptimisticMove are exported from board-utils', async () => {
    const utils = await import('@/lib/board-utils')
    expect(typeof utils.groupTasksByStatus).toBe('function')
    expect(typeof utils.applyOptimisticMove).toBe('function')
    expect(typeof utils.isValidStatus).toBe('function')
    expect(typeof utils.getValidStatuses).toBe('function')
  })
})
