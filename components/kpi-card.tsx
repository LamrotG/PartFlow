import { LucideIcon } from 'lucide-react'

interface KPICardProps {
  label: string
  value: string | number
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  color?: 'primary' | 'secondary' | 'accent'
}

export function KPICard({
  label,
  value,
  icon: Icon,
  trend,
  color = 'primary',
}: KPICardProps) {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary/10 text-secondary',
    accent: 'bg-accent/10 text-accent',
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6 flex items-start justify-between">
      <div className="flex-1">
        <p className="text-sm text-muted-foreground font-medium mb-2">{label}</p>
        <p className="text-3xl font-bold text-foreground mb-3">{value}</p>
        {trend && (
          <p className={`text-xs font-medium ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% vs last period
          </p>
        )}
      </div>
      <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  )
}
