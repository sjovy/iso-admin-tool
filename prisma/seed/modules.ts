// Sprint 2 T03 — Seed: 9 canonical ISO 9001 modules per tenant
// This function is idempotent — upsert on (tenant_id, slug).
// Call at tenant creation time to provision the default module set.

import type { PrismaClient } from '../../src/generated/prisma/client'

interface ModuleDef {
  name: string
  slug: string
  pdcaPhase: 'PLAN' | 'DO' | 'CHECK' | 'ACT'
  isoClauseRef: string
  boardVariant: 'STANDARD' | 'EXTENDED'
}

const ISO_9001_MODULES: ModuleDef[] = [
  {
    name: 'Planera',
    slug: 'planera',
    pdcaPhase: 'PLAN',
    isoClauseRef: '6.1',
    boardVariant: 'STANDARD',
  },
  {
    name: 'Utföra',
    slug: 'utfora',
    pdcaPhase: 'DO',
    isoClauseRef: '8.1',
    boardVariant: 'STANDARD',
  },
  {
    name: 'Mäta & Utvärdera',
    slug: 'mata-utvardera',
    pdcaPhase: 'CHECK',
    isoClauseRef: '9.1',
    boardVariant: 'EXTENDED',
  },
  {
    name: 'Förbättra',
    slug: 'forbattra',
    pdcaPhase: 'ACT',
    isoClauseRef: '10.1',
    boardVariant: 'STANDARD',
  },
  {
    name: 'Ledning',
    slug: 'ledning',
    pdcaPhase: 'PLAN',
    isoClauseRef: '5.1',
    boardVariant: 'STANDARD',
  },
  {
    name: 'Resurser',
    slug: 'resurser',
    pdcaPhase: 'DO',
    isoClauseRef: '7.1',
    boardVariant: 'STANDARD',
  },
  {
    name: 'Kommunikation',
    slug: 'kommunikation',
    pdcaPhase: 'DO',
    isoClauseRef: '7.4',
    boardVariant: 'STANDARD',
  },
  {
    name: 'Risker & Möjligheter',
    slug: 'risker-mojligheter',
    pdcaPhase: 'PLAN',
    isoClauseRef: '6.1',
    boardVariant: 'EXTENDED',
  },
  {
    name: 'Leverantörer',
    slug: 'leverantorer',
    pdcaPhase: 'DO',
    isoClauseRef: '8.4',
    boardVariant: 'STANDARD',
  },
]

/**
 * Upsert all 9 canonical ISO 9001 modules for the given tenant.
 * Safe to call multiple times — idempotent via (tenant_id, slug) unique constraint.
 */
export async function seedModulesForTenant(
  prisma: PrismaClient,
  tenantId: string
): Promise<void> {
  for (const mod of ISO_9001_MODULES) {
    await prisma.module.upsert({
      where: {
        tenantId_slug: {
          tenantId,
          slug: mod.slug,
        },
      },
      update: {
        name: mod.name,
        pdcaPhase: mod.pdcaPhase,
        isoClauseRef: mod.isoClauseRef,
        boardVariant: mod.boardVariant,
      },
      create: {
        tenantId,
        name: mod.name,
        slug: mod.slug,
        pdcaPhase: mod.pdcaPhase,
        isoClauseRef: mod.isoClauseRef,
        boardVariant: mod.boardVariant,
      },
    })
  }
  console.log(`Seeded ${ISO_9001_MODULES.length} modules for tenant ${tenantId}`)
}
