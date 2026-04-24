// Prisma client singleton — Sprint 2 T03/T04/T05
// Prisma 7 requires a driver adapter. We use @prisma/adapter-pg with the pooled
// DATABASE_URL (Supabase pooler) for all runtime queries.
// DIRECT_URL is used only for migrations (prisma.config.ts).
//
// This file is server-only — never import in client components.

import { PrismaClient } from '@/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

// Type declaration for global prisma singleton (dev hot reload safety)
declare global {
  // Using `var` in `declare global` is required by TypeScript for ambient declarations
  // biome-ignore lint: var required in global declaration
  var __prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  const raw = process.env.DATABASE_URL
  if (!raw) {
    throw new Error('DATABASE_URL is not set')
  }
  // Strip ?pgbouncer=true — this is a Prisma 4/5 built-in-pool hint and is not
  // understood by the pg driver adapter; passing it causes PgBouncer to reject the
  // startup handshake with ENOTFOUND / "tenant/user not found".
  const url = new URL(raw)
  url.searchParams.delete('pgbouncer')
  const connectionString = url.toString()
  const adapter = new PrismaPg({ connectionString, ssl: { rejectUnauthorized: false } })
  return new PrismaClient({ adapter })
}

// Lazy singleton — client is only instantiated when first accessed.
// This avoids throwing at module import time (e.g. in unit tests that don't need DB).
let _prisma: PrismaClient | undefined

export function getPrismaClient(): PrismaClient {
  if (_prisma) return _prisma
  if (globalThis.__prisma) {
    _prisma = globalThis.__prisma
    return _prisma
  }
  _prisma = createPrismaClient()
  if (process.env.NODE_ENV !== 'production') {
    globalThis.__prisma = _prisma
  }
  return _prisma
}

// Convenience export — use this in server actions
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    return (getPrismaClient() as unknown as Record<string | symbol, unknown>)[prop]
  },
})
