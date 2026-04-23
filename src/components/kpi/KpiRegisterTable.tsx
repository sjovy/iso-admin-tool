'use client'
// Sprint 3 T05 — KPI register table component
// Client component: handles row click navigation.

import { useRouter } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { RagBadge } from './RagBadge'
import { IsoCategoryTag } from './IsoCategoryTag'
import type { KpiRow } from '@/types/kpi'

interface KpiRegisterTableProps {
  kpis: KpiRow[]
  tenantSlug: string
}

const TREND_ICON: Record<'up' | 'down' | 'flat', { icon: string; className: string }> = {
  up: { icon: '↑', className: 'text-green-600' },
  down: { icon: '↓', className: 'text-red-600' },
  flat: { icon: '→', className: 'text-slate-400' },
}

export function KpiRegisterTable({ kpis, tenantSlug }: KpiRegisterTableProps) {
  const router = useRouter()

  if (kpis.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
        Inga KPI:er registrerade ännu.
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Status</TableHead>
          <TableHead>Namn</TableHead>
          <TableHead>Kategori</TableHead>
          <TableHead className="text-right">Mål</TableHead>
          <TableHead className="text-right">Senaste</TableHead>
          <TableHead className="text-center">Trend</TableHead>
          <TableHead>Enhet</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {kpis.map((kpi) => {
          const trend = kpi.trendDirection ? TREND_ICON[kpi.trendDirection] : null

          return (
            <TableRow
              key={kpi.id}
              className="cursor-pointer hover:bg-slate-50"
              onClick={() => router.push(`/${tenantSlug}/kpis/${kpi.id}`)}
            >
              <TableCell>
                <RagBadge status={kpi.ragStatus} isOverride={kpi.ragOverride !== null} />
              </TableCell>
              <TableCell className="font-medium">{kpi.name}</TableCell>
              <TableCell>
                <IsoCategoryTag category={kpi.isoCategory} />
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {kpi.target}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {kpi.latestActual !== null ? kpi.latestActual : '—'}
              </TableCell>
              <TableCell className="text-center">
                {trend ? (
                  <span className={trend.className} aria-label={kpi.trendDirection ?? ''}>
                    {trend.icon}
                  </span>
                ) : (
                  <span className="text-slate-300" aria-label="ingen trend">—</span>
                )}
              </TableCell>
              <TableCell className="text-slate-500">{kpi.unit}</TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
