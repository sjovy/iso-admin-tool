// Sprint 3 T06 — Measurement history table (read-only)

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { KpiMeasurementEntry } from '@/types/kpi'

interface MeasurementHistoryProps {
  measurements: KpiMeasurementEntry[]
  unit: string
}

export function MeasurementHistory({ measurements, unit }: MeasurementHistoryProps) {
  if (measurements.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
        Inga mätningar registrerade ännu.
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Datum</TableHead>
          <TableHead className="text-right">Utfall ({unit})</TableHead>
          <TableHead>Anteckningar</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {measurements.map((m) => (
          <TableRow key={m.id}>
            <TableCell className="tabular-nums">
              {new Date(m.measuredAt).toLocaleDateString('sv-SE')}
            </TableCell>
            <TableCell className="text-right tabular-nums">{m.actual}</TableCell>
            <TableCell className="text-slate-500">{m.notes ?? '—'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
