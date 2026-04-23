// Sprint 3 T06/T07 — KPI detail page
// Server Component: fetches KPI detail + user role, renders history + client controls.

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db/prisma'
import { getKpiDetail } from '@/app/actions/kpis'
import { RagBadge } from '@/components/kpi/RagBadge'
import { IsoCategoryTag } from '@/components/kpi/IsoCategoryTag'
import { MeasurementHistory } from '@/components/kpi/MeasurementHistory'
import { KpiDetailClient } from '@/components/kpi/KpiDetailClient'

export default async function KpiDetailPage({
  params,
}: {
  params: Promise<{ tenantSlug: string; kpiId: string }>
}) {
  const { tenantSlug, kpiId } = await params

  // Fetch user role for RBAC in client component
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) notFound()

  const appUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  })

  const result = await getKpiDetail(tenantSlug, kpiId)

  if (!result.success) {
    if (result.error.code === 'NOT_FOUND') notFound()
    throw new Error(result.error.message)
  }

  const kpi = result.data
  const userRole = appUser?.role ?? 'worker'

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href={`/${tenantSlug}`} className="hover:text-slate-700">Dashboard</Link>
        <span>/</span>
        <Link href={`/${tenantSlug}/kpis`} className="hover:text-slate-700">KPI-register</Link>
        <span>/</span>
        <span className="text-slate-800">{kpi.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-slate-900">{kpi.name}</h1>
            <RagBadge status={kpi.ragStatus} />
          </div>
          {kpi.description && (
            <p className="text-sm text-slate-500">{kpi.description}</p>
          )}
          <IsoCategoryTag category={kpi.isoCategory} />
        </div>

        {/* Target / Latest */}
        <dl className="grid grid-cols-2 gap-4 text-right">
          <div>
            <dt className="text-xs text-slate-500 uppercase tracking-wide">Mål</dt>
            <dd className="text-xl font-semibold tabular-nums text-slate-800">
              {kpi.target} <span className="text-sm font-normal text-slate-500">{kpi.unit}</span>
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500 uppercase tracking-wide">Senaste</dt>
            <dd className="text-xl font-semibold tabular-nums text-slate-800">
              {kpi.latestActual !== null
                ? <>{kpi.latestActual} <span className="text-sm font-normal text-slate-500">{kpi.unit}</span></>
                : <span className="text-slate-400">—</span>
              }
            </dd>
          </div>
        </dl>
      </div>

      {/* Client interactive controls (add measurement + RAG override) */}
      <KpiDetailClient kpi={kpi} tenantSlug={tenantSlug} userRole={userRole} />

      {/* Measurement history */}
      <section>
        <h2 className="mb-3 text-lg font-medium text-slate-800">Mäthistorik</h2>
        <div className="rounded-md border border-slate-200 bg-white">
          <MeasurementHistory measurements={kpi.measurements} unit={kpi.unit} />
        </div>
      </section>
    </div>
  )
}
