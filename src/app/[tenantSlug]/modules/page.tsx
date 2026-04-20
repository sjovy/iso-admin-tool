// T06 — Module List Page
// Server Component — no "use client"
// Renders 9 ISO 9001 modules grouped by PDCA phase.

import Link from 'next/link'
import { getModuleList } from '@/app/actions/board'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { ModuleCard, PDCAPhase } from '@/types/board'

// Phase group display config
const PHASE_GROUPS: Array<{
  phase: PDCAPhase
  label: string
  colorClass: string
  badgeClass: string
}> = [
  {
    phase: 'PLAN',
    label: 'Planera',
    colorClass: 'border-blue-200',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  {
    phase: 'DO',
    label: 'Utföra',
    colorClass: 'border-green-200',
    badgeClass: 'bg-green-100 text-green-800 border-green-200',
  },
  {
    phase: 'CHECK',
    label: 'Mäta & Utvärdera',
    colorClass: 'border-amber-200',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  {
    phase: 'ACT',
    label: 'Förbättra',
    colorClass: 'border-red-200',
    badgeClass: 'bg-red-100 text-red-800 border-red-200',
  },
]

export default async function ModulesPage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>
}) {
  const { tenantSlug } = await params
  const result = await getModuleList(tenantSlug)

  if (!result.success) {
    return (
      <div className="text-red-600 p-4">
        Kunde inte ladda moduler: {result.error.message}
      </div>
    )
  }

  const modules = result.data

  // Group by PDCA phase, maintaining phase order
  const byPhase = new Map<PDCAPhase, ModuleCard[]>()
  for (const group of PHASE_GROUPS) {
    byPhase.set(group.phase, [])
  }
  for (const mod of modules) {
    byPhase.get(mod.pdcaPhase)?.push(mod)
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">ISO 9001 Moduler</h1>
        <p className="mt-1 text-slate-500">Välj en modul för att öppna kanban-tavlan</p>
      </div>

      {PHASE_GROUPS.map(({ phase, label, badgeClass }) => {
        const phaseModules = byPhase.get(phase) ?? []
        if (phaseModules.length === 0) return null

        return (
          <section key={phase}>
            <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${badgeClass}`}
              >
                {phase}
              </span>
              {label}
            </h2>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {phaseModules.map((mod) => (
                <Link
                  key={mod.id}
                  href={`/${tenantSlug}/modules/${mod.slug}`}
                  className="block group"
                >
                  <Card className="h-full transition-shadow group-hover:shadow-md cursor-pointer">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
                          {mod.name}
                        </CardTitle>
                        <Badge
                          variant="outline"
                          className={`shrink-0 text-xs ${badgeClass}`}
                        >
                          {phase}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-1">
                      {mod.isoClauseRef && (
                        <p className="text-xs text-slate-500">
                          ISO-klausul:{' '}
                          <span className="font-mono font-medium text-slate-700">
                            {mod.isoClauseRef}
                          </span>
                        </p>
                      )}
                      <p className="text-xs text-slate-500">
                        {mod.taskCount} {mod.taskCount === 1 ? 'uppgift' : 'uppgifter'}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
