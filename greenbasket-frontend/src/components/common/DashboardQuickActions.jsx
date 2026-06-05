import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export function DashboardQuickActions({ title = 'Quick Actions', actions = [] }) {
  if (actions.length === 0) return null

  return (
    <div className="card p-5">
      <h2 className="heading-sm font-semibold text-surface-900">{title}</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {actions.map((action) => (
          <Link
            key={action.to}
            to={action.to}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary-50 px-4 py-2 text-sm font-medium text-primary-700 hover:bg-primary-100 transition-all hover:shadow-sm"
          >
            {action.icon && <action.icon className="h-4 w-4" />}
            {action.label}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        ))}
      </div>
    </div>
  )
}
