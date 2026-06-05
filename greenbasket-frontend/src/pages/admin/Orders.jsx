import { useState, useEffect, useRef } from 'react'
import { Search, ShoppingCart, ChevronDown, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { adminOrderApi } from '@/api/deliveries'
import { Pagination } from '@/components/common/Pagination'
import { PageLoader } from '@/components/common/Loader'
import { formatCurrency, formatDateTime } from '@/utils/helpers'
import { ORDER_STATUS } from '@/utils/constants'

const TRANSITIONS = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PACKING', 'CANCELLED'],
  PACKING: ['OUT_FOR_DELIVERY'],
  OUT_FOR_DELIVERY: ['DELIVERED'],
}

const STATUS_STYLES = {
  PENDING: 'badge-warning',
  CONFIRMED: 'badge-info',
  PACKING: 'bg-violet-100 text-violet-700',
  OUT_FOR_DELIVERY: 'bg-sky-100 text-sky-700',
  DELIVERED: 'badge-success',
  CANCELLED: 'badge-danger',
}

const STATUS_DOTS = {
  PENDING: 'status-dot-warning',
  CONFIRMED: 'status-dot-info',
  PACKING: 'bg-violet-500',
  OUT_FOR_DELIVERY: 'bg-sky-500',
  DELIVERED: 'status-dot-success',
  CANCELLED: 'status-dot-danger',
}

function StatusBadge({ status }) {
  const badge = STATUS_STYLES[status] || 'badge-neutral'
  const dot = STATUS_DOTS[status] || 'status-dot-neutral'
  return (
    <span className={`${badge} inline-flex items-center gap-1.5`}>
      <span className={`status-dot ${dot}`} />
      {status}
    </span>
  )
}

export function AdminOrders() {
  const [data, setData] = useState({ content: [], totalElements: 0, totalPages: 0 })
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [updatingId, setUpdatingId] = useState(null)
  const [openDropdown, setOpenDropdown] = useState(null)
  const dropdownRef = useRef(null)

  useEffect(() => {
    setLoading(true)
    const params = { page, size: 15, sort: 'createdAt,desc' }
    if (statusFilter) params.status = statusFilter
    if (search) params.search = search
    adminOrderApi.getAll(params)
      .then(({ data: res }) => setData(res.data || res))
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false))
  }, [page, statusFilter, search])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdatingId(orderId)
    setOpenDropdown(null)
    try {
      await adminOrderApi.updateStatus(orderId, { status: newStatus })
      toast.success(`Order ${newStatus.toLowerCase()}`)
      setData((prev) => ({
        ...prev,
        content: prev.content.map((o) =>
          o.id === orderId ? { ...o, status: newStatus } : o
        ),
      }))
    } catch (err) {
      toast.error(err.message || 'Failed to update')
    } finally {
      setUpdatingId(null)
    }
  }

  if (loading && !data.content.length) return <PageLoader />

  const empty = !data.content || data.content.length === 0

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="toolbar">
        <div className="toolbar-left">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-semibold text-surface-900 sm:text-xl">Orders</h1>
              <span className="badge-primary">{data.totalElements || 0}</span>
            </div>
            <p className="page-subtitle">Manage and track customer orders</p>
          </div>
        </div>
        <div className="toolbar-right w-full sm:w-auto">
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0) }}
                placeholder="Search orders..."
                className="input-field h-11 !py-0 pl-9 text-sm sm:w-56 lg:w-64"
              />
              {search && (
                <button
                  onClick={() => { setSearch(''); setPage(0) }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-surface-400 hover:text-surface-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(0) }}
                className="input-field h-11 !py-0 pr-8 text-sm appearance-none cursor-pointer"
              >
                <option value="">All Status</option>
                {Object.keys(ORDER_STATUS).map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
            </div>
          </div>
        </div>
      </div>

      {empty ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-surface-200 bg-white px-6 py-16 shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-100">
            <ShoppingCart className="h-7 w-7 text-surface-400" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-surface-900">No orders found</h3>
          <p className="mt-1 text-sm text-surface-500">
            {search || statusFilter
              ? 'Try adjusting your search or filter'
              : 'Orders will appear here once customers place them'}
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <colgroup>
              <col className="w-[100px] sm:w-[130px]" />
              <col className="min-w-[140px]" />
              <col className="w-[110px]" />
              <col className="w-[140px] hidden sm:table-column" />
              <col className="w-[110px]" />
              <col className="w-[80px]" />
            </colgroup>
            <thead>
              <tr className="sticky top-0 z-10 bg-surface-50">
                <th className="table-header">Order</th>
                <th className="table-header">Customer</th>
                <th className="table-header text-right">Total</th>
                <th className="table-header hidden sm:table-cell">Date</th>
                <th className="table-header">Status</th>
                <th className="table-header text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {data.content.map((order) => {
                const transitions = TRANSITIONS[order.status] || []
                return (
                  <tr key={order.id} className="table-row">
                    <td className="table-cell">
                      <span className="font-mono text-xs font-medium text-surface-500">
                        {order.orderNumber || `#${order.id}`}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2.5">
                        <div className="avatar-initials h-8 w-8 text-[10px]">
                          {(order.customerName || '?').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-surface-900">
                            {order.customerName || 'N/A'}
                          </p>
                          {order.customerEmail && (
                            <p className="truncate text-xs text-surface-500">
                              {order.customerEmail}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="table-cell text-right">
                      <span className="text-sm font-semibold text-surface-900">
                        {formatCurrency(order.total || 0)}
                      </span>
                    </td>
                    <td className="table-cell hidden sm:table-cell">
                      <span className="whitespace-nowrap text-sm text-surface-500">
                        {formatDateTime(order.createdAt)}
                      </span>
                    </td>
                    <td className="table-cell">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="table-cell text-center">
                      <div className="flex items-center justify-center gap-1">
                        {transitions.length > 0 ? (
                          <div className="relative" ref={openDropdown === order.id ? dropdownRef : null}>
                            <button
                              onClick={() => setOpenDropdown(openDropdown === order.id ? null : order.id)}
                              disabled={updatingId === order.id}
                              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-surface-400 transition-all hover:bg-surface-100 hover:text-surface-600 disabled:opacity-40"
                              title="Update status"
                            >
                              {updatingId === order.id ? (
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-surface-300 border-t-surface-600" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </button>
                            {openDropdown === order.id && (
                              <div className="absolute right-0 top-full z-50 mt-1 w-44 overflow-hidden rounded-xl border border-surface-200 bg-white shadow-lg">
                                <div className="p-1">
                                  <div className="px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider text-surface-400">
                                    Move to
                                  </div>
                                  {transitions.map((s) => (
                                    <button
                                      key={s}
                                      onClick={() => handleStatusUpdate(order.id, s)}
                                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-surface-700 transition-colors hover:bg-surface-100"
                                    >
                                      <span className={`status-dot ${s === 'CANCELLED' ? 'status-dot-danger' : s === 'DELIVERED' ? 'status-dot-success' : 'status-dot-info'} shrink-0`} />
                                      {s}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-surface-300" title="No actions available">
                            <ChevronDown className="h-4 w-4" />
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {(data.totalPages || 0) > 1 && (
        <div className="border-t border-surface-200 px-4 py-4 sm:px-5">
          <Pagination
            page={data.pageNumber || data.page || 0}
            totalPages={data.totalPages}
            totalElements={data.totalElements}
            size={15}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  )
}
