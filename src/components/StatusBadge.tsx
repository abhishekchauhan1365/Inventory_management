// src/components/StatusBadge.tsx
// Minimalist, premium status badge using Awwwards-style subtle colors

import { QuotationStatus } from '@/types'

export default function StatusBadge({ status }: { status: QuotationStatus }) {
  const styles: Record<QuotationStatus, string> = {
    pending: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    approved: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    rejected: 'bg-red-50 text-red-700 ring-red-600/20',
    fulfilled: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  }

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${styles[status]}`}>
      {status}
    </span>
  )
}
