import { useState, useEffect, useCallback, Fragment } from 'react'
import {
  Truck, Search, Package, UserCheck, CheckCircle2, Clock, Plus,
  X, ChevronDown, MapPin, Phone, ShoppingBag, AlertCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { adminDeliveryApi, adminOrderApi } from '@/api/deliveries'
import { adminUserApi } from '@/api/users'
import { Pagination } from '@/components/common/Pagination'
import { PageLoader, Loader } from '@/components/common/Loader'
import { formatCurrency, formatDateTime } from '@/utils/helpers'

const STATUS_LABEL = {
  ASSIGNED: 'Assigned',
  PICKED_UP: 'Picked Up',
  ON_THE_WAY: 'On the Way',
  DELIVERED: 'Delivered',
}

const STATUS_BADGE = {
  ASSIGNED: 'badge-warning',
  PICKED_UP: 'badge-info',
  ON_THE_WAY: 'bg-violet-100 text-violet-700',
  DELIVERED: 'badge-success',
}

const STATUS_DOT = {
  ASSIGNED: 'status-dot-warning',
  PICKED_UP: 'status-dot-info',
  ON_THE_WAY: 'bg-violet-500',
  DELIVERED: 'status-dot-success',
}

const TABS = [
  { key: '', label: 'All' },
  { key: 'ASSIGNED', label: 'Assigned' },
  { key: 'PICKED_UP', label: 'Picked Up' },
  { key: 'ON_THE_WAY', label: 'On the Way' },
  { key: 'DELIVERED', label: 'Delivered' },
]

function StatusBadge({ status }) {
  const badge = STATUS_BADGE[status] || 'badge-neutral'
  const dot = STATUS_DOT[status] || 'status-dot-neutral'
  return (
    <span className={`${badge} inline-flex items-center gap-1.5`}>
      <span className={`status-dot ${dot}`} />
      {STATUS_LABEL[status] || status}
    </span>
  )
}

function KPICard({ icon: Icon, label, value, color, bg, onClick }) {
  return (
    <button
      onClick={onClick}
      className="card flex items-center gap-4 p-5 hover:shadow-card-hover transition-all duration-200 text-left w-full"
    >
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${bg}`}>
        <Icon className={`h-6 w-6 ${color}`} />
      </div>
      <div>
        <p className="text-sm font-medium text-surface-500">{label}</p>
        <p className="text-2xl font-bold text-surface-900">{value}</p>
      </div>
    </button>
  )
}

export function AdminDeliveries() {
  const [data, setData] = useState({ content: [], totalElements: 0, totalPages: 0 })
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [tab, setTab] = useState('')

  // Assign modal state
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [assignLoading, setAssignLoading] = useState(false)
  const [packingOrders, setPackingOrders] = useState([])
  const [packingOrdersLoading, setPackingOrdersLoading] = useState(false)
  const [partners, setPartners] = useState([])
  const [partnersLoading, setPartnersLoading] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [selectedPartner, setSelectedPartner] = useState(null)
  const [pendingCount, setPendingCount] = useState(0)

  // Expanded row
  const [expandedId, setExpandedId] = useState(null)

  // Custom status label for the tab filter
  const statusLabel = (status) => STATUS_LABEL[status] || status

  // Compute KPIs from current page data
  const kpis = (() => {
    const items = data.content || []
    return {
      total: data.totalElements || 0,
      assigned: items.filter((d) => d.status === 'ASSIGNED').length,
      active: items.filter((d) => d.status === 'PICKED_UP' || d.status === 'ON_THE_WAY').length,
      delivered: items.filter((d) => d.status === 'DELIVERED').length,
    }
  })()

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, size: 15, sort: 'createdAt,desc' }
      if (tab) params.status = tab
      const { data: res } = await adminDeliveryApi.getAll(params)
      const pageData = res.data || res
      setData(pageData)
    } catch {
      toast.error('Failed to load deliveries')
    } finally {
      setLoading(false)
    }
  }, [page, tab])

  const fetchPendingCount = useCallback(async () => {
    try {
      const { data: res } = await adminOrderApi.getAll({ status: 'PACKING', page: 0, size: 1 })
      const body = res.data || res
      setPendingCount(body.totalElements || 0)
    } catch {
      // non-critical
    }
  }, [])

  useEffect(() => {
    fetchData()
    fetchPendingCount()
  }, [fetchData, fetchPendingCount])

  const openAssignModal = async () => {
    setShowAssignModal(true)
    setSelectedOrder(null)
    setSelectedPartner(null)
    setPackingOrdersLoading(true)
    setPartnersLoading(true)

    try {
      const [ordersRes, partnersRes] = await Promise.all([
        adminOrderApi.getAll({ status: 'PACKING', page: 0, size: 50 }),
        adminUserApi.getDeliveryPartners(),
      ])

      const ordersBody = ordersRes.data?.data || ordersRes.data
      setPackingOrders(ordersBody.content || [])
      setPackingOrdersLoading(false)

      const partnersBody = partnersRes.data?.data || partnersRes.data
      setPartners(partnersBody.content || [])
      setPartnersLoading(false)
    } catch {
      toast.error('Failed to load assignment data')
      setPackingOrdersLoading(false)
      setPartnersLoading(false)
    }
  }

  const handleAssign = async () => {
    if (!selectedOrder || !selectedPartner) {
      toast.error('Please select an order and a delivery partner')
      return
    }
    setAssignLoading(true)
    try {
      await adminDeliveryApi.assign({
        orderId: selectedOrder.id,
        deliveryPartnerId: selectedPartner.id,
      })
      toast.success('Delivery assigned successfully')
      setShowAssignModal(false)
      setSelectedOrder(null)
      setSelectedPartner(null)
      fetchData()
      fetchPendingCount()
    } catch (err) {
      toast.error(err.message || 'Failed to assign delivery')
    } finally {
      setAssignLoading(false)
    }
  }

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id)
  }

  if (loading && !data.content.length) return <PageLoader />

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="toolbar">
        <div className="toolbar-left">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100">
              <Truck className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <h2 className="page-title">Deliveries</h2>
              <p className="page-subtitle">{data.totalElements || 0} total deliveries</p>
            </div>
          </div>
        </div>
        <div className="toolbar-right">
          <button onClick={openAssignModal} className="btn-primary inline-flex items-center gap-2">
            <Plus className="h-4 w-4" /> Assign Delivery
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard
          icon={ShoppingBag}
          label="Pending Assignment"
          value={pendingCount}
          color="text-amber-600"
          bg="bg-amber-100"
          onClick={() => { setTab(''); setPage(0) }}
        />
        <KPICard
          icon={Truck}
          label="Total Deliveries"
          value={kpis.total}
          color="text-primary-600"
          bg="bg-primary-100"
          onClick={() => { setTab(''); setPage(0) }}
        />
        <KPICard
          icon={Clock}
          label="Assigned"
          value={kpis.assigned}
          color="text-amber-600"
          bg="bg-amber-100"
          onClick={() => { setTab('ASSIGNED'); setPage(0) }}
        />
        <KPICard
          icon={UserCheck}
          label="In Progress"
          value={kpis.active}
          color="text-blue-600"
          bg="bg-blue-100"
        />
        <KPICard
          icon={CheckCircle2}
          label="Delivered"
          value={kpis.delivered}
          color="text-emerald-600"
          bg="bg-emerald-100"
          onClick={() => { setTab('DELIVERED'); setPage(0) }}
        />
      </div>

      <div className="flex gap-1 rounded-lg bg-surface-100 p-1 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setPage(0) }}
            className={`whitespace-nowrap rounded-md px-3.5 py-2.5 text-sm font-medium transition-all min-h-[44px] ${
              tab === t.key
                ? 'bg-white text-surface-900 shadow-sm'
                : 'text-surface-500 hover:text-surface-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th className="table-header w-8 sticky top-0 bg-surface-50 z-10"></th>
              <th className="table-header sticky top-0 bg-surface-50 z-10">Order</th>
              <th className="table-header sticky top-0 bg-surface-50 z-10">Customer</th>
              <th className="table-header sticky top-0 bg-surface-50 z-10 hidden sm:table-cell">Partner</th>
              <th className="table-header sticky top-0 bg-surface-50 z-10 hidden md:table-cell">Address</th>
              <th className="table-header sticky top-0 bg-surface-50 z-10 hidden sm:table-cell">Amount</th>
              <th className="table-header sticky top-0 bg-surface-50 z-10">Status</th>
              <th className="table-header sticky top-0 bg-surface-50 z-10 hidden sm:table-cell">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100">
            {data.content.map((delivery) => (
              <Fragment key={delivery.id}>
                <tr className="table-row">
                  <td className="table-cell">
                    <button
                      onClick={() => toggleExpand(delivery.id)}
                      className="btn-ghost btn-icon text-surface-400 hover:text-surface-600"
                    >
                      <ChevronDown className={`h-4 w-4 transition-transform ${expandedId === delivery.id ? 'rotate-180' : ''}`} />
                    </button>
                  </td>
                  <td className="table-cell">
                    <span className="font-mono text-xs font-medium text-surface-700 bg-surface-100 rounded-md px-2 py-1">
                      {delivery.order?.orderNumber || 'N/A'}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2.5">
                      <div className="avatar-initials h-8 w-8 text-[10px]">
                        {delivery.order?.customerName?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '?'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-surface-900">{delivery.order?.customerName || 'N/A'}</p>
                        <p className="text-xs text-surface-500">{delivery.order?.customerPhone || ''}</p>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell hidden sm:table-cell">
                    {delivery.deliveryPartner ? (
                      <div className="flex items-center gap-2">
                        <div className="avatar-initials h-7 w-7 text-[9px]">
                          {delivery.deliveryPartner.fullName?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '?'}
                        </div>
                        <span className="text-sm text-surface-600">{delivery.deliveryPartner.fullName}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-surface-400">Unassigned</span>
                    )}
                  </td>
                  <td className="table-cell max-w-[180px] hidden md:table-cell">
                    <p className="text-sm text-surface-600 truncate" title={delivery.order?.deliveryAddress}>
                      {delivery.order?.deliveryAddress || 'N/A'}
                    </p>
                  </td>
                  <td className="table-cell text-sm font-semibold text-surface-900 hidden sm:table-cell">
                    {formatCurrency(delivery.order?.total || 0)}
                  </td>
                  <td className="table-cell">
                    <StatusBadge status={delivery.status} />
                  </td>
                  <td className="table-cell text-sm text-surface-500 whitespace-nowrap hidden sm:table-cell">
                    {formatDateTime(delivery.createdAt)}
                  </td>
                </tr>
                {expandedId === delivery.id && (
                  <tr className="bg-surface-50/50">
                    <td colSpan={8} className="px-6 py-4">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-xs font-medium text-surface-500 mb-1">Delivery Status</p>
                          <p className="text-surface-900 font-medium">{STATUS_LABEL[delivery.status] || delivery.status}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-surface-500 mb-1">Delivery Partner</p>
                          <p className="text-surface-900">{delivery.deliveryPartner?.fullName || 'Unassigned'}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-surface-500 mb-1">Customer Phone</p>
                          <p className="text-surface-900">{delivery.order?.customerPhone || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
        {data.content.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <Truck className="h-10 w-10 text-surface-300 mb-3" />
            <p className="text-sm font-medium text-surface-500">No deliveries found</p>
            <button onClick={openAssignModal} className="btn-primary mt-4 inline-flex items-center gap-2">
              <Plus className="h-4 w-4" /> Assign First Delivery
            </button>
          </div>
        )}
      </div>

      <Pagination
        page={data.pageNumber || data.page || 0}
        totalPages={data.totalPages}
        totalElements={data.totalElements}
        size={15}
        onPageChange={setPage}
      />

      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-12 sm:pt-24">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !assignLoading && setShowAssignModal(false)} />
          <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-modal animate-slide-up max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-surface-200">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100">
                  <Truck className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-surface-900">Assign Delivery</h3>
                  <p className="text-sm text-surface-500">Select an order and a delivery partner</p>
                </div>
              </div>
              <button
                onClick={() => setShowAssignModal(false)}
                disabled={assignLoading}
                className="btn-ghost btn-icon text-surface-400 hover:text-surface-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-surface-700 mb-3 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">1</span>
                  Select Order (Ready for Delivery)
                </h4>
                {packingOrdersLoading ? (
                  <div className="flex items-center justify-center py-8"><Loader size="sm" className="mr-2" /><span className="text-sm text-surface-400">Loading orders...</span></div>
                ) : packingOrders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 rounded-xl border-2 border-dashed border-surface-300">
                    <Package className="h-8 w-8 text-surface-300 mb-2" />
                    <p className="text-sm font-medium text-surface-500">No orders ready for delivery</p>
                    <p className="text-xs text-surface-400 mt-1">Orders must be in PACKING status first</p>
                  </div>
                ) : (
                  <div className="grid gap-2.5 max-h-48 overflow-y-auto pr-1">
                    {packingOrders.map((order) => (
                      <button
                        key={order.id}
                        onClick={() => setSelectedOrder(order)}
                        className={`flex items-center justify-between rounded-xl border-2 p-3.5 transition-all text-left ${
                          selectedOrder?.id === order.id
                            ? 'border-primary-600 bg-primary-50'
                            : 'border-surface-200 hover:border-surface-300 hover:bg-surface-50'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-100">
                            <Package className="h-4 w-4 text-surface-500" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-surface-900">
                              {order.orderNumber || `#${order.id}`}
                            </p>
                            <p className="text-xs text-surface-500 truncate">
                              {order.user?.fullName || order.customerName || 'N/A'} — {formatCurrency(order.total || 0)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                          <MapPin className="h-3.5 w-3.5 text-surface-400" />
                          <span className="text-xs text-surface-500 max-w-[120px] truncate">{order.deliveryAddress || ''}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-sm font-semibold text-surface-700 mb-3 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">2</span>
                  Select Delivery Partner
                </h4>
                {partnersLoading ? (
                  <div className="flex items-center justify-center py-8"><Loader size="sm" className="mr-2" /><span className="text-sm text-surface-400">Loading partners...</span></div>
                ) : partners.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 rounded-xl border-2 border-dashed border-surface-300">
                    <AlertCircle className="h-8 w-8 text-surface-300 mb-2" />
                    <p className="text-sm font-medium text-surface-500">No delivery partners available</p>
                    <p className="text-xs text-surface-400 mt-1">Register delivery partners first</p>
                  </div>
                ) : (
                  <div className="grid gap-2.5 max-h-48 overflow-y-auto pr-1">
                    {partners.map((partner) => (
                      <button
                        key={partner.id}
                        onClick={() => setSelectedPartner(partner)}
                        className={`flex items-center justify-between rounded-xl border-2 p-3.5 transition-all text-left ${
                          selectedPartner?.id === partner.id
                            ? 'border-primary-600 bg-primary-50'
                            : 'border-surface-200 hover:border-surface-300 hover:bg-surface-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="avatar-initials h-9 w-9 text-xs">
                            {partner.fullName?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '?'}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-surface-900">{partner.fullName}</p>
                            <p className="text-xs text-surface-500 flex items-center gap-1">
                              <Phone className="h-3 w-3" /> {partner.phone || 'N/A'}
                            </p>
                          </div>
                        </div>
                        <span className="badge-success text-xs">Available</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-surface-200 px-6 py-4 bg-surface-50/50 rounded-b-2xl">
              <p className="text-xs text-surface-400">
                {selectedOrder && selectedPartner
                  ? `Ready to assign ${selectedOrder.orderNumber || `#${selectedOrder.id}`} to ${selectedPartner.fullName}`
                  : 'Select an order and a delivery partner'}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAssignModal(false)}
                  disabled={assignLoading}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssign}
                  disabled={!selectedOrder || !selectedPartner || assignLoading}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  {assignLoading ? 'Assigning...' : <><Truck className="h-4 w-4" /> Assign</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
