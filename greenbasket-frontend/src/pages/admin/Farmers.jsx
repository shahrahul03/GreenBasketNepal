import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Eye, Leaf, Users, CheckCircle2, XCircle, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import { adminUserApi } from '@/api/users'
import { Pagination } from '@/components/common/Pagination'
import { PageLoader } from '@/components/common/Loader'
import { formatDate } from '@/utils/helpers'

const TABS = [
  { key: 'PENDING', label: 'Pending' },
  { key: 'ALL', label: 'All Farmers' },
  { key: 'APPROVED', label: 'Approved' },
  { key: 'REJECTED', label: 'Rejected' },
]

const STATUS_BADGE = {
  PENDING: 'badge-warning',
  APPROVED: 'badge-success',
  REJECTED: 'badge-danger',
}

const STATUS_DOT = {
  PENDING: 'status-dot-warning',
  APPROVED: 'status-dot-success',
  REJECTED: 'status-dot-danger',
}

function ApprovalBadge({ status }) {
  const badge = STATUS_BADGE[status] || 'badge-neutral'
  const dot = STATUS_DOT[status] || 'status-dot-neutral'
  return (
    <span className={`${badge} inline-flex items-center gap-1.5`}>
      <span className={`status-dot ${dot}`} />
      {status || 'UNKNOWN'}
    </span>
  )
}

export function AdminFarmers() {
  const [data, setData] = useState({ content: [], totalElements: 0, totalPages: 0 })
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('PENDING')

  useEffect(() => {
    setLoading(true)
    const fetchData = async () => {
      try {
        const params = { page, size: 15, sort: 'createdAt,desc' }
        if (search) params.search = search

        let res
        if (tab === 'PENDING') {
          res = await adminUserApi.getPendingFarmers(params)
        } else {
          params.role = 'FARMER'
          res = await adminUserApi.getAll(params)
        }

        const body = res.data
        const pageData = body.data || body
        let result = { ...pageData }

        if (tab !== 'PENDING' && tab !== 'ALL') {
          params.approvalStatus = tab
          res = await adminUserApi.getAll(params)
          const body2 = res.data
          const pageData2 = body2.data || body2
          result = { ...pageData2 }
        }

        setData(result)
      } catch {
        toast.error('Failed to load farmers')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [page, search, tab])

  const handleTabChange = (key) => {
    setTab(key)
    setPage(0)
  }

  if (loading && !data.content.length) return <PageLoader />

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="toolbar">
        <div className="toolbar-left">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
              <Leaf className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="page-title">Farmers</h2>
              <p className="page-subtitle">{data.totalElements || 0} farmers</p>
            </div>
          </div>
        </div>
      </div>

      <div className="toolbar">
        <div className="toolbar-left">
          <div className="flex gap-1 rounded-lg bg-surface-100 p-1">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => handleTabChange(t.key)}
                className={`rounded-md px-3.5 py-1.5 text-sm font-medium transition-all ${
                  tab === t.key
                    ? 'bg-white text-surface-900 shadow-sm'
                    : 'text-surface-500 hover:text-surface-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="toolbar-right w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0) }}
              placeholder="Search farmers..."
              className="input-field pl-10 w-full"
            />
          </div>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th className="table-header sticky top-0 bg-surface-50 z-10">Farmer</th>
              <th className="table-header sticky top-0 bg-surface-50 z-10 hidden sm:table-cell">Email</th>
              <th className="table-header sticky top-0 bg-surface-50 z-10 hidden sm:table-cell">Phone</th>
              <th className="table-header sticky top-0 bg-surface-50 z-10 hidden md:table-cell">Registered</th>
              <th className="table-header sticky top-0 bg-surface-50 z-10">Status</th>
              <th className="table-header text-right sticky top-0 bg-surface-50 z-10">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100">
            {data.content.map((farmer) => (
              <tr key={farmer.id} className="table-row">
                <td className="table-cell">
                  <div className="flex items-center gap-3">
                    <div className="avatar-initials h-9 w-9 text-xs">
                      {farmer.fullName?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '?'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-surface-900">{farmer.fullName}</p>
                    </div>
                  </div>
                </td>
                <td className="table-cell text-sm text-surface-600 hidden sm:table-cell">{farmer.email}</td>
                <td className="table-cell text-sm text-surface-600 hidden sm:table-cell">{farmer.phone || 'N/A'}</td>
                <td className="table-cell text-sm text-surface-500 hidden md:table-cell">{farmer.createdAt ? formatDate(farmer.createdAt) : 'N/A'}</td>
                <td className="table-cell">
                  <ApprovalBadge status={farmer.approvalStatus} />
                </td>
                <td className="table-cell text-right">
                  <Link
                    to={`/admin/farmers/${farmer.id}`}
                    className="btn-ghost btn-icon"
                    title="View Farmer"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.content.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <Users className="h-10 w-10 text-surface-300 mb-3" />
            <p className="text-sm font-medium text-surface-500">No farmers found</p>
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
    </div>
  )
}
