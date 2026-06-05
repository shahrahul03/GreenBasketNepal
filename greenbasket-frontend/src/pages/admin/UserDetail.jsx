import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, User, Mail, Phone, Shield, Calendar, AlertTriangle, Package, ShoppingCart } from 'lucide-react'
import toast from 'react-hot-toast'
import { adminUserApi } from '@/api/users'
import { PageLoader } from '@/components/common/Loader'
import { formatCurrency, formatDate } from '@/utils/helpers'

export function UserDetail() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminUserApi.getUserDetail(id)
      .then(({ data }) => setData(data.data))
      .catch(() => toast.error('Failed to load user'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <PageLoader />
  if (!data) return null

  const user = data.user || data

  return (
    <div className="space-y-6 animate-fade-in">
      <Link to="/admin/users" className="btn-ghost inline-flex items-center gap-1.5 text-sm font-medium text-surface-600 hover:text-surface-900 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Users
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card p-6 text-center animate-scale-in lg:sticky lg:top-6 lg:self-start">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary-100 to-primary-200 shadow-sm">
            <span className="text-3xl font-bold text-primary-600">
              {user.fullName?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '?'}
            </span>
          </div>
          <h2 className="mt-4 text-xl font-bold text-surface-900">{user.fullName}</h2>
          <p className="text-sm text-surface-500 mt-0.5">{user.email}</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <span className="badge-primary">{user.role?.name || user.role}</span>
            {user.suspended && <span className="badge-danger">Suspended</span>}
            {user.approvalStatus && (
              <span className={`badge ${user.approvalStatus === 'APPROVED' ? 'badge-success' : user.approvalStatus === 'REJECTED' ? 'badge-danger' : 'badge-warning'}`}>
                {user.approvalStatus}
              </span>
            )}
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
                  <p className="text-sm font-semibold text-surface-900 mt-0.5">{user.fullName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3.5 p-3 rounded-lg bg-surface-50/80">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-medium text-surface-500 uppercase tracking-wider">Email</p>
                  <p className="text-sm font-semibold text-surface-900 mt-0.5">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3.5 p-3 rounded-lg bg-surface-50/80">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-medium text-surface-500 uppercase tracking-wider">Phone</p>
                  <p className="text-sm font-semibold text-surface-900 mt-0.5">{user.phone || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3.5 p-3 rounded-lg bg-surface-50/80">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-medium text-surface-500 uppercase tracking-wider">Joined</p>
                  <p className="text-sm font-semibold text-surface-900 mt-0.5">{user.createdAt ? formatDate(user.createdAt) : 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
