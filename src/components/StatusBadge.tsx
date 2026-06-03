// src/components/StatusBadge.tsx
import type { QuotationStatus } from '@/types'

interface StatusBadgeProps {
  status: QuotationStatus
  className?: string
}

const STATUS_CONFIG: Record<
  QuotationStatus,
  { label: string; className: string; dot: string }
> = {
  pending: {
    label: 'Pending',
    className: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
    dot: 'bg-amber-400',
  },
  approved: {
    label: 'Approved',
    className: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    dot: 'bg-emerald-400',
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-red-500/15 text-red-400 border border-red-500/30',
    dot: 'bg-red-400',
  },
  fulfilled: {
    label: 'Fulfilled',
    className: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
    dot: 'bg-blue-400',
  },
}

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${config.className} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  )
}
