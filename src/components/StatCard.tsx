// src/components/StatCard.tsx
interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  color?: 'blue' | 'emerald' | 'amber' | 'purple' | 'rose'
  suffix?: string
}

const colorClasses = {
  blue: {
    icon: 'bg-blue-500/15 text-blue-400',
    ring: 'ring-blue-500/20',
    glow: 'shadow-blue-500/10',
  },
  emerald: {
    icon: 'bg-emerald-500/15 text-emerald-400',
    ring: 'ring-emerald-500/20',
    glow: 'shadow-emerald-500/10',
  },
  amber: {
    icon: 'bg-amber-500/15 text-amber-400',
    ring: 'ring-amber-500/20',
    glow: 'shadow-amber-500/10',
  },
  purple: {
    icon: 'bg-purple-500/15 text-purple-400',
    ring: 'ring-purple-500/20',
    glow: 'shadow-purple-500/10',
  },
  rose: {
    icon: 'bg-rose-500/15 text-rose-400',
    ring: 'ring-rose-500/20',
    glow: 'shadow-rose-500/10',
  },
}

export default function StatCard({ title, value, icon, color = 'blue', suffix }: StatCardProps) {
  const colors = colorClasses[color]

  return (
    <div className={`rounded-2xl border border-slate-700/60 bg-slate-800/60 p-6 shadow-lg ring-1 ${colors.ring} ${colors.glow} backdrop-blur-sm transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-xl`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400">{title}</p>
          <p className="mt-1 text-3xl font-bold tracking-tight text-white">
            {value}
            {suffix && <span className="ml-1 text-lg text-slate-400">{suffix}</span>}
          </p>
        </div>
        <div className={`rounded-xl p-3 ${colors.icon}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}
