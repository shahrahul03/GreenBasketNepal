import { useState, useEffect } from 'react'
import { Search, Package, ChevronDown, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import { farmerApi } from '@/api/farmer'
import { Pagination } from '@/components/common/Pagination'
import { PageLoader } from '@/components/common/Loader'
import { formatCurrency, formatDateTime } from '@/utils/helpers'
import { ORDER_STATUS, STATUS_COLORS } from '@/utils/constants'

const VALID_FARMER_TRANSITIONS = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PACKING', 'CANCELLED'],
  PACKING: ['OUT_FOR_DELIVERY'],
  OUT_FOR_DELIVERY: ['DELIVERED'],
}

function OrderRow({ order, transitions, isUpdating, openDropdown, onToggleDropdown, onStatusUpdate }) {
  return (
    <tr className="hover:bg-surface-50 transition-colors">
      <td className="px-4 py-3">
        <span className="font-mono text-xs font-medium text-surface-500">{order.orderNumber}</span>
      </td>
      <td className="px-4 py-3">
        <span className="text-sm text-surface-700">{order.customerName || 'Customer'}</span>
      </td>
      <td className="px-4 py-3 text-right whitespace-nowrap">
        <span className="text-sm font-semibold text-surface-900">{formatCurrency(order.total || 0)}</span>
      </td>
      <td className="px-4 py-3 text-center">
        <span className={STATUS_COLORS[order.status]}>{order.status}</span>
      </td>
      <td className="px-4 py-3 text-right text-xs text-surface-400 whitespace-nowrap hidden sm:table-cell">
        {formatDateTime(order.createdAt)}
      </td>
      <td className="px-4 py-3 text-center hidden md:table-cell">
        {order.items && (
          <div className="group relative inline-block">
            <span className="inline-flex items-center justify-center min-h-[28px] min-w-[28px] rounded-lg bg-surface-100 text-xs font-medium text-surface-600 cursor-help">
              {order.items.length}
            </span>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50">
              <div className="bg-surface-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg whitespace-nowrap">
                {order.items.map((item, i) => (
                  <div key={i} className="py-0.5">{item.productName} x{item.quantity}</div>
                ))}
              </div>
            </div>
          </div>
        )}
      </td>
      <td className="px-4 py-3 text-center">
        {transitions.length > 0 && (
          <div className="relative inline-block">
            <button
              onClick={() => onToggleDropdown(order.id)}
              disabled={isUpdating}
              className="btn-secondary text-xs inline-flex items-center gap-1 min-h-[36px]"
            >
              {isUpdating ? 'Updating...' : 'Update'}
              <ChevronDown className={`h-3 w-3 transition-transform ${openDropdown === order.id ? 'rotate-180' : ''}`} />
            </button>
            {openDropdown === order.id && (
              <div className="absolute right-0 top-full mt-1 w-40 rounded-xl border border-surface-200 bg-white shadow-dropdown z-50 animate-slide-down">
                <div className="p-1.5">
                  {transitions.map((status) => (
                    <button
                      key={status}
                      onClick={() => onStatusUpdate(order.id, status)}
                      className="flex w-full items-center rounded-lg px-3 py-2.5 text-sm text-surface-700 hover:bg-surface-100 transition-colors"
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </td>
    </tr>
  )
}

function OrderCard({ order, transitions, isUpdating, openDropdown, onToggleDropdown, onStatusUpdate }) {
  return (
    <div className="bg-white rounded-xl border border-surface-200 shadow-card p-4 space-y-3 sm:hidden">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs font-medium text-surface-500">{order.orderNumber}</span>
        <span className={STATUS_COLORS[order.status]}>{order.status}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-surface-700">{order.customerName || 'Customer'}</span>
        <span className="text-sm font-semibold text-surface-900">{formatCurrency(order.total || 0)}</span>
      </div>
      <div className="flex items-center justify-between text-xs text-surface-400">
        <span>{formatDateTime(order.createdAt)}</span>
        {order.items && <span>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>}
      </div>
      {transitions.length > 0 && (
        <div className="pt-1">
          {openDropdown === order.id ? (
            <div className="space-y-1 animate-slide-down">
              {transitions.map((status) => (
                <button
                  key={status}
                  onClick={() => onStatusUpdate(order.id, status)}
                  disabled={isUpdating}
                  className="w-full rounded-lg px-3 py-2.5 text-sm font-medium text-surface-700 hover:bg-surface-100 transition-colors border border-surface-200"
                >
                  {isUpdating ? 'Updating...' : `Mark as ${status}`}
                </button>
              ))}
              <button
                onClick={() => onToggleDropdown(order.id)}
                className="w-full rounded-lg px-3 py-2 text-xs text-surface-500 hover:bg-surface-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => onToggleDropdown(order.id)}
              disabled={isUpdating}
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary-600 text-white px-4 py-2.5 text-sm font-semibold hover:bg-primary-700 transition-colors min-h-[44px]"
            >
              {isUpdating ? 'Updating...' : 'Update Status'}
              <ChevronDown className={`h-4 w-4 transition-transform`} />
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export function FarmerOrders() {
  const [data, setData] = useState({ content: [], totalElements: 0, totalPages: 0 })
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [statusFilter, setStatusFilter] = useState('')
  const [updatingId, setUpdatingId] = useState(null)
  const [openDropdown, setOpenDropdown] = useState(null)

  useEffect(() => {
    setLoading(true)
    const params = { page, size: 10, sort: 'createdAt,desc' }
    if (statusFilter) params.status = statusFilter
    farmerApi.getOrders(params)
      .then(({ data }) => setData(data.data || data))
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false))
  }, [page, statusFilter])

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdatingId(orderId)
    setOpenDropdown(null)
    try {
      await farmerApi.updateOrderStatus(orderId, { status: newStatus })
      toast.success(`Order status updated to ${newStatus}`)
      setData((prev) => ({
        ...prev,
        content: prev.content.map((o) =>
          o.id === orderId ? { ...o, status: newStatus } : o
        ),
      }))
    } catch (err) {
      toast.error(err.message)
    } finally {
      setUpdatingId(null)
    }
  }

  if (loading) return <PageLoader />

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="page-title text-lg font-semibold text-surface-900">Orders</h2>
          <p className="page-subtitle text-sm text-surface-500 mt-1">Manage customer orders for your products</p>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(0) }}
          className="input-field w-auto"
        >
          <option value="">All Status</option>
          {Object.entries(ORDER_STATUS).map(([key, val]) => (
            <option key={key} value={key}>{val}</option>
          ))}
        </select>
      </div>

      {data.content?.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-surface-300 bg-white py-20 animate-fade-in">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-100">
            <Package className="h-8 w-8 text-surface-400" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-surface-900">No orders yet</h3>
          <p className="mt-1 text-sm text-surface-500">Orders will appear here when customers purchase your products</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Mobile cards (hidden sm+) */}
          <div className="space-y-3 sm:hidden">
            {data.content.map((order) => {
              const transitions = VALID_FARMER_TRANSITIONS[order.status] || []
              const isUpdating = updatingId === order.id
              return (
                <OrderCard
                  key={order.id}
                  order={order}
                  transitions={transitions}
                  isUpdating={isUpdating}
                  openDropdown={openDropdown}
                  onToggleDropdown={(id) => setOpenDropdown(openDropdown === id ? null : id)}
                  onStatusUpdate={handleStatusUpdate}
                />
              )
            })}
          </div>

          {/* Desktop table (hidden on mobile) */}
          <div className="hidden sm:block overflow-x-auto rounded-xl border border-surface-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-50 border-b border-surface-200 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3.5 text-xs font-semibold text-surface-500 uppercase tracking-wider">Order</th>
                  <th className="px-4 py-3.5 text-xs font-semibold text-surface-500 uppercase tracking-wider">Customer</th>
                  <th className="px-4 py-3.5 text-xs font-semibold text-surface-500 uppercase tracking-wider text-right">Total</th>
                  <th className="px-4 py-3.5 text-xs font-semibold text-surface-500 uppercase tracking-wider text-center">Status</th>
                  <th className="px-4 py-3.5 text-xs font-semibold text-surface-500 uppercase tracking-wider text-right hidden sm:table-cell">Date</th>
                  <th className="px-4 py-3.5 text-xs font-semibold text-surface-500 uppercase tracking-wider text-center hidden md:table-cell">Items</th>
                  <th className="px-4 py-3.5 text-xs font-semibold text-surface-500 uppercase tracking-wider text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {data.content.map((order) => {
                  const transitions = VALID_FARMER_TRANSITIONS[order.status] || []
                  const isUpdating = updatingId === order.id
                  return (
                    <OrderRow
                      key={order.id}
                      order={order}
                      transitions={transitions}
                      isUpdating={isUpdating}
                      openDropdown={openDropdown}
                      onToggleDropdown={(id) => setOpenDropdown(openDropdown === id ? null : id)}
                      onStatusUpdate={handleStatusUpdate}
                    />
                  )
                })}
              </tbody>
            </table>
          </div>

          <Pagination
            page={data.pageNumber || data.page || 0}
            totalPages={data.totalPages}
            totalElements={data.totalElements}
            size={10}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  )
}
