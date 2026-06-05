import { Inbox, ArrowLeft, ShoppingBag } from 'lucide-react'
import { Link } from 'react-router-dom'

export function EmptyState({
  icon: Icon = Inbox,
  title = 'Nothing here yet',
  description = '',
  action,
  iconSize = 32,
  compact = false,
}) {
  return (
    <div className={`flex flex-col items-center justify-center text-center animate-fade-in ${compact ? 'py-10' : 'py-20'}`}>
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100 ring-1 ring-primary-200/50 shadow-inner mb-5">
        <Icon className="text-primary-500" size={iconSize} />
      </div>
      <h3 className="text-xl font-bold text-surface-900">{title}</h3>
      {description && (
        <p className="mt-2 max-w-md text-sm text-surface-500 leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
      {!action && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/products"
            className="btn-primary inline-flex items-center gap-2"
          >
            <ShoppingBag className="h-4 w-4" />
            Browse Products
          </Link>
          <button
            onClick={() => window.history.back()}
            className="btn-secondary inline-flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
        </div>
      )}
    </div>
  )
}
