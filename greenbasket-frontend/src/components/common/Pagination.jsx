import { ChevronLeft, ChevronRight } from 'lucide-react'

export function Pagination({ page, totalPages, totalElements, size, onPageChange }) {
  if (!totalPages || totalPages <= 1) return null

  const getPages = () => {
    const pages = []
    const maxVisible = 5
    let start = Math.max(0, page - Math.floor(maxVisible / 2))
    let end = Math.min(totalPages, start + maxVisible)
    if (end - start < maxVisible) start = Math.max(0, end - maxVisible)
    for (let i = start; i < end; i++) pages.push(i)
    return pages
  }

  const startItem = page * size + 1
  const endItem = Math.min((page + 1) * size, totalElements)

  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
      <p className="text-sm text-surface-500">
        Showing <span className="font-medium text-surface-700">{startItem}-{endItem}</span> of{' '}
        <span className="font-medium text-surface-700">{totalElements}</span>
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 0}
          className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-surface-300 bg-white text-surface-600 hover:bg-surface-50 hover:border-surface-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {getPages().map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-sm font-medium transition-all ${
              p === page
                ? 'bg-primary-600 text-white shadow-sm'
                : 'border border-surface-300 bg-white text-surface-600 hover:bg-surface-50'
            }`}
          >
            {p + 1}
          </button>
        ))}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages - 1}
          className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-surface-300 bg-white text-surface-600 hover:bg-surface-50 hover:border-surface-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
