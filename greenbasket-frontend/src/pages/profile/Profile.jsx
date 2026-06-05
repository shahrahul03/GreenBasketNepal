import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Phone, Shield, ArrowLeft, Save, Camera, Key } from 'lucide-react'
import toast from 'react-hot-toast'
import { userApi } from '@/api/users'
import { useAuth } from '@/hooks/useAuth'
import { PageLoader } from '@/components/common/Loader'

export function Profile() {
  const { user, setUser, logout, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
  })
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [saving, setSaving] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)

  if (authLoading) return <PageLoader />
  if (!user) {
    navigate('/login', { replace: true })
    return null
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { data } = await userApi.updateProfile(form)
      setUser(data.data)
      toast.success('Profile updated successfully')
      setEditing(false)
    } catch (err) { toast.error(err.message) }
    finally { setSaving(false) }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return toast.error('Passwords do not match')
    }
    setSaving(true)
    try {
      await userApi.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })
      toast.success('Password changed successfully')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setChangingPassword(false)
    } catch (err) { toast.error(err.message) }
    finally { setSaving(false) }
  }

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure? This permanently deletes your account.')) return
    try {
      await userApi.deleteAccount()
      toast.success('Account deleted')
      logout()
    } catch (err) { toast.error(err.message) }
  }

  return (
    <div className="page-container py-6 lg:py-8 animate-fade-in">
      <nav className="mb-6 flex items-center gap-2 text-sm text-surface-500">
        <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
        <span className="text-surface-300">/</span>
        <span className="text-surface-900 font-medium">My Profile</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <div className="rounded-2xl bg-white p-8 shadow-xl shadow-surface-200/50 ring-1 ring-surface-200/50 text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 shadow-lg shadow-primary-500/20 ring-4 ring-white">
              <span className="text-3xl font-bold text-white">
                {user.fullName?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '?'}
              </span>
            </div>
            <h2 className="mt-5 text-xl font-bold text-surface-900">{user.fullName}</h2>
            <p className="text-sm text-surface-500">{user.email}</p>
            <div className="mt-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3.5 py-1.5 text-xs font-semibold text-primary-700 ring-1 ring-primary-200">
                <Shield className="h-3 w-3" /> {user.role?.name || user.role || 'User'}
              </span>
            </div>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="btn-primary mt-8 w-full shadow-lg shadow-primary-600/20 hover:shadow-xl hover:shadow-primary-600/30 transition-all duration-300"
              >
                <Save className="mr-2 h-4 w-4" /> Edit Profile
              </button>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl bg-white p-8 shadow-xl shadow-surface-200/50 ring-1 ring-surface-200/50">
            <h3 className="text-lg font-semibold text-surface-900 mb-6">Personal Information</h3>
            {editing ? (
              <form onSubmit={handleProfileUpdate} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400 group-focus-within:text-primary-500 transition-colors duration-200" />
                    <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="input-field pl-10 border-surface-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
                    <input value={user.email} disabled className="input-field pl-10 bg-surface-50 text-surface-400 cursor-not-allowed" />
                  </div>
                  <p className="mt-1.5 text-xs text-surface-400">Email cannot be changed</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">Phone</label>
                  <div className="relative group">
                    <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400 group-focus-within:text-primary-500 transition-colors duration-200" />
                    <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field pl-10 border-surface-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200" />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={saving} className="btn-primary px-6 shadow-lg shadow-primary-600/20 transition-all duration-300 disabled:opacity-70">
                    {saving ? (
                      <span className="inline-flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Saving...
                      </span>
                    ) : 'Save Changes'}
                  </button>
                  <button type="button" onClick={() => setEditing(false)} className="btn-secondary px-6 border-2 border-surface-200 hover:border-surface-300 transition-all duration-200">Cancel</button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-primary-50/50 to-transparent">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-sm">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-surface-400 uppercase tracking-wider">Full Name</p>
                    <p className="font-semibold text-surface-900 mt-0.5">{user.fullName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-primary-50/50 to-transparent">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-sm">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-surface-400 uppercase tracking-wider">Email</p>
                    <p className="font-semibold text-surface-900 mt-0.5">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-primary-50/50 to-transparent">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-sm">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-surface-400 uppercase tracking-wider">Phone</p>
                    <p className="font-semibold text-surface-900 mt-0.5">{user.phone || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-white p-8 shadow-xl shadow-surface-200/50 ring-1 ring-surface-200/50">
            <h3 className="text-lg font-semibold text-surface-900 mb-6">Change Password</h3>
            {changingPassword ? (
              <form onSubmit={handlePasswordChange} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">Current Password</label>
                  <input type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} className="input-field border-surface-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">New Password</label>
                  <input type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} className="input-field border-surface-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200" required minLength={8} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">Confirm New Password</label>
                  <input type="password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} className="input-field border-surface-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200" required />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={saving} className="btn-primary px-6 shadow-lg shadow-primary-600/20 transition-all duration-300 disabled:opacity-70">
                    <Key className="mr-2 h-4 w-4" />{saving ? 'Changing...' : 'Change Password'}
                  </button>
                  <button type="button" onClick={() => setChangingPassword(false)} className="btn-secondary px-6 border-2 border-surface-200 hover:border-surface-300 transition-all duration-200">Cancel</button>
                </div>
              </form>
            ) : (
              <button onClick={() => setChangingPassword(true)} className="btn-secondary border-2 border-surface-200 hover:border-surface-300 hover:bg-surface-50 transition-all duration-200">
                <Key className="mr-2 h-4 w-4" /> Change Password
              </button>
            )}
          </div>

          <div className="rounded-2xl bg-white p-8 shadow-xl shadow-surface-200/50 ring-1 ring-red-200 bg-gradient-to-br from-white to-red-50/40">
            <h3 className="text-lg font-semibold text-red-600">Danger Zone</h3>
            <p className="mt-1.5 text-sm text-surface-500 leading-relaxed">Permanently delete your account and all associated data. This action cannot be undone.</p>
            <button onClick={handleDeleteAccount} className="btn-danger mt-5 shadow-lg shadow-red-600/20 hover:shadow-xl hover:shadow-red-600/30 transition-all duration-300">Delete Account</button>
          </div>
        </div>
      </div>
    </div>
  )
}
