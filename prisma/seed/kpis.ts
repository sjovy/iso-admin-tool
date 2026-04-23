// Sprint 3 T09 — Seed: 10 sample KPIs for new tenants
// Idempotent — upsert on (tenantId, name).
// Covers all 6 ISO 9.1 categories.

import type { PrismaClient } from '../../src/generated/prisma/client'

interface KpiDef {
  name: string
  unit: string
  target: number
  isoCategory:
    | 'conformity'
    | 'customer_satisfaction'
    | 'qms_performance'
    | 'risk'
    | 'supplier'
    | 'improvement'
  description?: string
}

const SAMPLE_KPIS: KpiDef[] = [
  {
    name: 'Produktreklamationer per kvartal',
    isoCategory: 'conformity',
    unit: 'st',
    target: 2,
    description: 'Antal inkomna produktreklamationer per kvartal',
  },
  {
    name: 'Kundnöjdhetsindex (NPS)',
    isoCategory: 'customer_satisfaction',
    unit: 'poäng',
    target: 50,
    description: 'Net Promoter Score från kundundersökning',
  },
  {
    name: 'Internrevisionens genomförandegrad',
    isoCategory: 'qms_performance',
    unit: '%',
    target: 100,
    description: 'Andel planerade internrevisioner som genomförts',
  },
  {
    name: 'Öppna risker med hög allvarlighet',
    isoCategory: 'risk',
    unit: 'st',
    target: 0,
    description: 'Antal identifierade risker med hög allvarlighetsgrad som inte åtgärdats',
  },
  {
    name: 'Leverantörsutvärdering — godkänd andel',
    isoCategory: 'supplier',
    unit: '%',
    target: 90,
    description: 'Andel leverantörer som godkänts i senaste utvärderingen',
  },
  {
    name: 'Avslutade förbättringsärenden per kvartal',
    isoCategory: 'improvement',
    unit: 'st',
    target: 5,
    description: 'Antal avslutade förbättringsärenden per kvartal',
  },
  {
    name: 'Kundklagomål — svarstid inom SLA',
    isoCategory: 'customer_satisfaction',
    unit: '%',
    target: 95,
    description: 'Andel kundklagomål besvarade inom avtalad svarstid (SLA)',
  },
  {
    name: 'Processefterlevnad — interna revisioner',
    isoCategory: 'conformity',
    unit: '%',
    target: 95,
    description: 'Andel processer utan avvikelser vid interna revisioner',
  },
  {
    name: 'Leveransprecision från leverantörer',
    isoCategory: 'supplier',
    unit: '%',
    target: 98,
    description: 'Andel leveranser från leverantörer som levereras i tid',
  },
  {
    name: 'Riskminskningsåtgärder genomförda',
    isoCategory: 'risk',
    unit: '%',
    target: 80,
    description: 'Andel planerade riskminskningsåtgärder som genomförts',
  },
]

/**
 * Upsert 10 sample KPIs for the given tenant.
 * Idempotent — upsert on (tenantId, name).
 */
export async function seedKpisForTenant(
  prisma: PrismaClient,
  tenantId: string
): Promise<void> {
  for (const kpi of SAMPLE_KPIS) {
    // Prisma upsert on compound unique requires a @@unique constraint.
    // Since kpis has no @@unique([tenantId, name]), use findFirst + createIfNotExists pattern.
    const existing = await prisma.kpi.findFirst({
      where: { tenantId, name: kpi.name },
      select: { id: true },
    })

    if (!existing) {
      await prisma.kpi.create({
        data: {
          tenantId,
          name: kpi.name,
          unit: kpi.unit,
          target: kpi.target,
          isoCategory: kpi.isoCategory,
          description: kpi.description ?? null,
        },
      })
    }
  }

  console.log(`Seeded ${SAMPLE_KPIS.length} sample KPIs for tenant ${tenantId}`)
}
