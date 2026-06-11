import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, User, Mail, Phone, Calendar, Leaf, Package, CheckCircle, XCircle, ShoppingBag } from 'lucide-react'
import toast from 'react-hot-toast'
import { adminUserApi } from '@/api/users'
import { PageLoader } from '@/components/common/Loader'
import { formatDate, formatCurrency } from '@/utils/helpers'
import { Clock } from 'lucide-react'

const STATUS_STYLES = {
  PENDING: { badge: 'badge-warning', dot: 'status-dot-warning', label: 'Pending Approval' },
  APPROVED: { badge: 'badge-success', dot: 'status-dot-success', label: 'Approved' },
  REJECTED: { badge: 'badge-danger', dot: 'status-dot-danger', label: 'Rejected' },
}

export function FarmerDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  useEffect(() => {
    adminUserApi.getUserDetail(id)
      .then(({ data: res }) => setData(res.data))
      .catch(() => toast.error('Failed to load farmer'))
      .finally(() => setLoading(false))
  }, [id])

  const handleApprove = async () => {
    setActionLoading(true)
    try {
      await adminUserApi.approveFarmer(id)
      toast.success('Farmer approved successfully')
      setShowApproveModal(false)
      const { data: res } = await adminUserApi.getUserDetail(id)
      setData(res.data)
    } catch (err) {
      toast.error(err.message || 'Failed to approve farmer')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    setActionLoading(true)
    try {
      await adminUserApi.rejectFarmer(id)
      toast.success('Farmer rejected')
      setShowRejectModal(false)
      setRejectReason('')
      const { data: res } = await adminUserApi.getUserDetail(id)
      setData(res.data)
    } catch (err) {
      toast.error(err.message || 'Failed to reject farmer')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) return <PageLoader />
  if (!data) return null

  const statusInfo = STATUS_STYLES[data.approvalStatus] || STATUS_STYLES.PENDING

  return (
    <div className="space-y-6 animate-fade-in">
      <Link to="/admin/farmers" className="btn-ghost inline-flex items-center gap-1.5 text-sm font-medium text-surface-600 hover:text-surface-900 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Farmers
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card p-6 text-center animate-scale-in lg:sticky lg:top-6 lg:self-start">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 shadow-sm">
            <span className="text-3xl font-bold text-emerald-600">
              {data.fullName?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '?'}
            </span>
          </div>
          <h2 className="mt-4 text-xl font-bold text-surface-900">{data.fullName}</h2>
          <p className="text-sm text-surface-500 mt-0.5">{data.email}</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <span className="badge-primary inline-flex items-center gap-1">
              <Leaf className="h-3 w-3" /> Farmer
            </span>
            <span className={`${statusInfo.badge} inline-flex items-center gap-1`}>
              <span className={`status-dot ${statusInfo.dot}`} />
              {statusInfo.label}
            </span>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6 animate-slide-up">
            <h3 className="heading-xs mb-5 pb-4 border-b border-surface-200 flex items-center gap-2">
              <User className="h-4 w-4" /> Account Details
            </h3>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="flex items-center gap-3.5 p-3 rounded-lg bg-surface-50/80">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-medium text-surface-500 uppercase tracking-wider">Full Name</p>
                  <p className="text-sm font-semibold text-surface-900 mt-0.5">{data.fullName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3.5 p-3 rounded-lg bg-surface-50/80">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-medium text-surface-500 uppercase tracking-wider">Email</p>
                  <p className="text-sm font-semibold text-surface-900 mt-0.5">{data.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3.5 p-3 rounded-lg bg-surface-50/80">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-medium text-surface-500 uppercase tracking-wider">Phone</p>
                  <p className="text-sm font-semibold text-surface-900 mt-0.5">{data.phone || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3.5 p-3 rounded-lg bg-surface-50/80">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-medium text-surface-500 uppercase tracking-wider">Registered</p>
                  <p className="text-sm font-semibold text-surface-900 mt-0.5">{data.createdAt ? formatDate(data.createdAt) : 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {data.role === 'FARMER' && (
            <div className="card p-6 animate-slide-up">
              <h3 className="heading-xs mb-5 pb-4 border-b border-surface-200 flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" /> Products Overview
              </h3>
              <div className="flex items-center gap-3.5 p-3 rounded-lg bg-surface-50/80">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                  <Package className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-medium text-surface-500 uppercase tracking-wider">Total Products</p>
                  <p className="text-sm font-semibold text-surface-900 mt-0.5">{data.totalProducts || 0}</p>
                </div>
              </div>
            </div>
          )}

          {data.approvalStatus === 'PENDING' && (
            <div className="card p-6 animate-slide-up border-l-4 border-l-amber-400 bg-amber-50/30">
              <h3 className="heading-xs mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-600" /> Farmer Approval
              </h3>
              <p className="text-sm text-surface-600 mb-5">This farmer is waiting for approval. Review their details and take action.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowApproveModal(true)}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <CheckCircle className="h-4 w-4" /> Approve Farmer
                </button>
                <button
                  onClick={() => setShowRejectModal(true)}
                  className="btn-danger inline-flex items-center gap-2"
                >
                  <XCircle className="h-4 w-4" /> Reject Farmer
                </button>
              </div>
            </div>
          )}

          {data.approvalStatus === 'APPROVED' && (
            <div className="card p-6 animate-slide-up border-l-4 border-l-emerald-400 bg-emerald-50/30">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-emerald-800">Farmer Approved</p>
                  <p className="text-xs text-emerald-600">This farmer has full access to the platform</p>
                </div>
              </div>
            </div>
          )}

          {data.approvalStatus === 'REJECTED' && (
            <div className="card p-6 animate-slide-up border-l-4 border-l-red-400 bg-red-50/30">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-red-800">Farmer Rejected</p>
                  <p className="text-xs text-red-600">This farmer cannot access seller features</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showApproveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowApproveModal(false)} />
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-modal animate-slide-up">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-surface-900">Approve Farmer?</h3>
                <p className="text-sm text-surface-500">This will grant full seller access</p>
              </div>
            </div>
            <div className="rounded-xl bg-surface-50 p-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="avatar-initials h-10 w-10 text-sm">
                  {data.fullName?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '?'}
                </div>
                <div>
                  <p className="text-sm font-semibold text-surface-900">{data.fullName}</p>
                  <p className="text-xs text-surface-500">{data.email}</p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleApprove}
                disabled={actionLoading}
                className="btn-primary flex-1 inline-flex items-center justify-center gap-2"
              >
                {actionLoading ? 'Approving...' : <><CheckCircle className="h-4 w-4" /> Approve</>}
              </button>
              <button
                onClick={() => setShowApproveModal(false)}
                disabled={actionLoading}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowRejectModal(false)} />
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-modal animate-slide-up">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-surface-900">Reject Farmer?</h3>
                <p className="text-sm text-surface-500">This will deny seller access</p>
              </div>
            </div>
            <div className="rounded-xl bg-surface-50 p-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="avatar-initials h-10 w-10 text-sm">
                  {data.fullName?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '?'}
                </div>
                <div>
                  <p className="text-sm font-semibold text-surface-900">{data.fullName}</p>
                  <p className="text-xs text-surface-500">{data.email}</p>
                </div>
              </div>
            </div>
            <div className="mb-5">
              <label className="block text-sm font-medium text-surface-700 mb-1.5">Reason (optional)</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="input-field resize-none"
                rows={3}
                placeholder="Enter reason for rejection..."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleReject}
                disabled={actionLoading}
                className="btn-danger flex-1 inline-flex items-center justify-center gap-2"
              >
                {actionLoading ? 'Rejecting...' : <><XCircle className="h-4 w-4" /> Reject</>}
              </button>
              <button
                onClick={() => setShowRejectModal(false)}
                disabled={actionLoading}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
