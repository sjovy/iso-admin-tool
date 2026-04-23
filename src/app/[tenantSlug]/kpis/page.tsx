// Sprint 3 T05 — KPI register page
// Server Component: fetches KPI register and renders table with coverage indicator.

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getKpiRegister } from '@/app/actions/kpis'
import { KpiRegisterTable } from '@/components/kpi/KpiRegisterTable'
import { CoverageIndicator } from '@/components/kpi/CoverageIndicator'
import type { IsoCategory } from '@/types/kpi'

export default async function KpiRegisterPage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>
}) {
  const { tenantSlug } = await params
  const result = await getKpiRegister(tenantSlug)

  if (!result.success) {
    if (result.error.code === 'NOT_FOUND') notFound()
    throw new Error(result.error.message)
  }

  const kpis = result.data
  const coveredCategories = [...new Set(kpis.map((k) => k.isoCategory))] as IsoCategory[]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">KPI-register</h1>
          <p className="mt-1 text-sm text-slate-500">ISO 9001 klausul 9.1 — Övervakning och mätning</p>
        </div>
        <Link
          href={`/${tenantSlug}`}
          className="text-sm text-slate-500 hover:text-slate-700"
        >
          ← Dashboard
        </Link>
      </div>

      <CoverageIndicator coveredCategories={coveredCategories} />

      <div className="rounded-md border border-slate-200 bg-white">
        <KpiRegisterTable kpis={kpis} tenantSlug={tenantSlug} />
      </div>
    </div>
  )
}
