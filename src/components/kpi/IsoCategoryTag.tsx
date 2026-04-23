// Sprint 3 T05 — ISO category tag component
// Renders a small pill badge with the Swedish label for each ISO 9.1 category.

import { Badge } from '@/components/ui/badge'
import type { IsoCategory } from '@/types/kpi'

interface IsoCategoryTagProps {
  category: IsoCategory
}

const ISO_CATEGORY_LABELS: Record<IsoCategory, string> = {
  conformity: 'Produktöverensstämmelse',
  customer_satisfaction: 'Kundnöjdhet',
  qms_performance: 'KSM-prestanda',
  risk: 'Risk',
  supplier: 'Leverantör',
  improvement: 'Förbättring',
}

export function IsoCategoryTag({ category }: IsoCategoryTagProps) {
  return (
    <Badge variant="secondary" className="text-xs whitespace-nowrap">
      {ISO_CATEGORY_LABELS[category]}
    </Badge>
  )
}
