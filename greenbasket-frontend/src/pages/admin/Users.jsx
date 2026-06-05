import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Users as UsersIcon, Shield, UserCheck, UserX, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import { adminUserApi } from '@/api/users'
import { Pagination } from '@/components/common/Pagination'
import { PageLoader } from '@/components/common/Loader'
import { formatDate } from '@/utils/helpers'

const ROLE_BADGES = {
  CUSTOMER: 'badge-info',
  FARMER: 'badge-success',
  DELIVERY_PARTNER: 'badge-warning',
  ADMIN: 'badge-accent',
}

export function AdminUsers() {
  const [data, setData] = useState({ content: [], totalElements: 0, totalPages: 0 })
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')

  useEffect(() => {
    setLoading(true)
    const params = { page, size: 15, sort: 'createdAt,desc' }
    if (search) params.search = search
    if (roleFilter) params.role = roleFilter
    adminUserApi.getAll(params)
      .then(({ data }) => setData(data.data || data))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false))
  }, [page, search, roleFilter])

  const handleSuspend = async (id, isSuspended) => {
    try {
      if (isSuspended) await adminUserApi.unsuspend(id)
      else await adminUserApi.suspend(id)
      toast.success(isSuspended ? 'User unsuspended' : 'User suspended')
      setData((prev) => ({ ...prev, content: prev.content.map((u) => u.id === id ? { ...u, suspended: !isSuspended } : u) }))
    } catch (err) { toast.error(err.message) }
  }

  if (loading && !data.content.length) return <PageLoader />

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="toolbar">
        <div className="toolbar-left">
          <div>
            <h2 className="page-title">Users</h2>
            <p className="page-subtitle">{data.totalElements || 0} total users</p>
          </div>
        </div>
        <div className="toolbar-right">
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(0) }}
            className="input-field w-auto min-w-[160px]"
          >
            <option value="">All Roles</option>
            <option value="CUSTOMER">Customer</option>
            <option value="FARMER">Farmer</option>
            <option value="DELIVERY_PARTNER">Delivery Partner</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
      </div>

      <div className="toolbar">
        <div className="toolbar-left w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0) }}
              placeholder="Search by name or email..."
              className="input-field pl-10 w-full"
            />
          </div>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th className="table-header sticky top-0 bg-surface-50 z-10">User</th>
              <th className="table-header sticky top-0 bg-surface-50 z-10 hidden sm:table-cell">Email</th>
              <th className="table-header sticky top-0 bg-surface-50 z-10">Role</th>
              <th className="table-header sticky top-0 bg-surface-50 z-10 hidden sm:table-cell">Joined</th>
              <th className="table-header sticky top-0 bg-surface-50 z-10 hidden md:table-cell">Status</th>
              <th className="table-header text-right sticky top-0 bg-surface-50 z-10">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100">
            {data.content.map((user) => (
              <tr key={user.id} className="table-row">
                <td className="table-cell">
                  <div className="flex items-center gap-3">
                    <div className="avatar-initials h-9 w-9 text-xs">
                      {user.fullName?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '?'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-surface-900">{user.fullName}</p>
                      <p className="text-xs text-surface-500">{user.phone || 'N/A'}</p>
                    </div>
                  </div>
                </td>
                <td className="table-cell text-sm text-surface-600 hidden sm:table-cell">{user.email}</td>
                <td className="table-cell">
                  <span className={`badge ${ROLE_BADGES[user.role?.name || user.role] || 'badge-neutral'}`}>
                    {user.role?.name || user.role}
                  </span>
                </td>
                <td className="table-cell text-sm text-surface-500 hidden sm:table-cell">{user.createdAt ? formatDate(user.createdAt) : 'N/A'}</td>
                <td className="table-cell hidden md:table-cell">
                  {user.suspended ? (
                    <span className="badge-danger">
                      <span className="status-dot-danger mr-1.5" />
                      Suspended
                    </span>
                  ) : (
                    <span className="badge-success">
                      <span className="status-dot-success mr-1.5" />
                      Active
                    </span>
                  )}
                </td>
                <td className="table-cell text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Link to={`/admin/users/${user.id}`} className="btn-ghost btn-icon" title="View Details">
                      <Eye className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleSuspend(user.id, user.suspended)}
                      className={`btn-ghost btn-sm ${user.suspended ? 'text-emerald-600 hover:bg-emerald-50' : 'text-red-600 hover:bg-red-50'}`}
                    >
                      {user.suspended ? 'Unsuspend' : 'Suspend'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.content.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <UsersIcon className="h-10 w-10 text-surface-300 mb-3" />
            <p className="text-sm font-medium text-surface-500">No users found</p>
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
