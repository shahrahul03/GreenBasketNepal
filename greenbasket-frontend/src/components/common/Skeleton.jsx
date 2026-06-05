export function Skeleton({ className = '', ...props }) {
  return (
    <div
      className={`skeleton animate-shimmer ${className}`}
      {...props}
    />
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="card overflow-hidden animate-fade-in">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-2 w-2 rounded-full" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-4 w-20" />
        <div className="flex items-center justify-between border-t border-surface-100 pt-3">
          <div className="space-y-1">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-9 w-9 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} className="h-5 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

export function StatCardSkeleton() {
  return (
    <div className="stat-card space-y-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-3 w-32" />
    </div>
  )
}

export function PageSkeleton() {
  return (
    <div className="page-container py-8 space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  )
}

export function HeroSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-surface-200 h-64 sm:h-80 lg:h-96">
      <div className="absolute inset-0 skeleton animate-shimmer" />
    </div>
  )
}

export function ReviewSkeleton() {
  return (
    <div className="flex gap-4 p-4 border-b border-surface-100 animate-fade-in">
      <Skeleton className="h-10 w-10 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-16" />
        </div>
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-3.5 w-3.5" />
          ))}
        </div>
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  )
}

export function OrderCardSkeleton() {
  return (
    <div className="card p-4 animate-fade-in space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-16 w-16 rounded-lg shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-5 w-20" />
      </div>
      <div className="flex items-center justify-between border-t border-surface-100 pt-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-28 rounded-lg" />
      </div>
    </div>
  )
}

export function CheckoutSkeleton() {
  return (
    <div className="page-container py-6 lg:py-8 animate-fade-in">
      <div className="mb-6 flex items-center gap-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="flex items-center gap-2 mb-8">
        {[1,2,3].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="space-y-4">
            {[1,2,3,4].map((i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-8 w-48 mt-8" />
          <div className="space-y-4">
            {[1,2,3,4,5].map((i) => (
              <div key={i} className="flex gap-4 p-4 rounded-xl border border-surface-200">
                <Skeleton className="h-20 w-20 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-5 w-16" />
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-2 space-y-5">
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
      </div>
      <div className="mt-8">
        <Skeleton className="h-16 w-full rounded-2xl" />
      </div>
    </div>
  )
}

export function ProductDetailSkeleton() {
  return (
    <div className="page-container py-6 lg:py-8 animate-fade-in">
      <div className="mb-6 flex items-center gap-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="space-y-4">
          <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
          <div className="flex gap-3">
            {[1,2,3,4].map((i) => (
              <Skeleton key={i} className="h-20 w-20 rounded-xl shrink-0" />
            ))}
          </div>
        </div>
        <div className="space-y-5">
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <Skeleton className="h-10 w-3/4" />
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {[1,2,3,4,5].map((i) => (
                <Skeleton key={i} className="h-5 w-5" />
              ))}
            </div>
            <Skeleton className="h-5 w-32" />
          </div>
          <div className="flex items-baseline gap-3">
            <Skeleton className="h-12 w-28" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-5 w-12" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-7 w-32 rounded-full" />
            <Skeleton className="h-7 w-28 rounded-full" />
          </div>
          <Skeleton className="h-6 w-full rounded-xl" />
          <Skeleton className="h-6 w-full rounded-xl" />
          <div className="flex gap-3">
            <Skeleton className="h-12 flex-1 rounded-xl" />
            <Skeleton className="h-12 w-12 rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[1,2,3,4].map((i) => (
              <Skeleton key={i} className="h-14 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
      <div className="mt-14">
        <div className="flex gap-1 border-b border-surface-200 pb-1">
          {[1,2,3].map((i) => (
            <Skeleton key={i} className="h-10 w-32 rounded-t-lg" />
          ))}
        </div>
        <div className="mt-6 space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
      <div className="mt-12">
        <Skeleton className="h-7 w-48 mb-4" />
        <div className="flex gap-4 overflow-hidden">
          {[1,2,3,4].map((i) => (
            <Skeleton key={i} className="w-56 h-72 rounded-xl shrink-0" />
          ))}
        </div>
      </div>
    </div>
  )
}

export function OrderDetailSkeleton() {
  return (
    <div className="page-container py-6 lg:py-8 animate-fade-in">
      <div className="mb-6 flex items-center gap-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-4 w-28" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-72 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-52 w-full rounded-xl" />
        </div>
      </div>
    </div>
  )
}

export function CartItemSkeleton() {
  return (
    <div className="flex gap-4 p-4 border-b border-surface-100 animate-fade-in">
      <Skeleton className="h-20 w-20 rounded-lg shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-24" />
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-5 w-8" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
          <Skeleton className="h-5 w-16" />
        </div>
      </div>
      <Skeleton className="h-5 w-5 shrink-0" />
    </div>
  )
}
