// prisma/seed.ts — main seed entrypoint
// Run via: pnpm prisma db seed
// Seeds all tenants in the database with the 9 canonical ISO 9001 modules.
// Idempotent — safe to run multiple times.

import { config } from 'dotenv'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { seedModulesForTenant } from './seed/modules'
import { seedKpisForTenant } from './seed/kpis'

// Load .env.local for local runs
config({ path: '.env.local' })

async function main() {
  // For seed, prefer DIRECT_URL (bypasses pooler — safer for long-running seed operations)
  // Falls back to DATABASE_URL if DIRECT_URL is not set
  const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('Neither DIRECT_URL nor DATABASE_URL is set — cannot run seed')
  }

  // Pass connectionString directly — let pg handle URL parsing
  const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } })
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })

  try {
    const tenants = await prisma.tenant.findMany({ select: { id: true, slug: true } })

    if (tenants.length === 0) {
      console.log('No tenants found — seed complete (nothing to seed)')
      return
    }

    for (const tenant of tenants) {
      console.log(`Seeding modules for tenant: ${tenant.slug} (${tenant.id})`)
      await seedModulesForTenant(prisma, tenant.id)
      await seedKpisForTenant(prisma, tenant.id)
    }

    console.log('Seed complete')
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
