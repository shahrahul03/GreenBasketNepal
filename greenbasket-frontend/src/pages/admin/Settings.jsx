import { useState, useEffect } from 'react'
import { Settings as SettingsIcon, Save, Globe, Mail, DollarSign, Truck } from 'lucide-react'
import toast from 'react-hot-toast'
import { settingsApi } from '@/api/settings'
import { PageLoader } from '@/components/common/Loader'

export function Settings() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    settingsApi.getSettings()
      .then(({ data }) => setData(data.data))
      .catch(() => toast.error('Failed to load settings'))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await settingsApi.updateSetting('general', data)
      toast.success('Settings saved')
    } catch (err) { toast.error(err.message) }
    finally { setSaving(false) }
  }

  if (loading) return <PageLoader />

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100">
          <SettingsIcon className="h-5 w-5 text-primary-600" />
        </div>
        <div>
          <h2 className="page-title">Settings</h2>
          <p className="page-subtitle">Manage platform settings</p>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="heading-xs mb-5 pb-4 border-b border-surface-200 flex items-center gap-2">
          <Globe className="h-4 w-4" /> General Configuration
        </h3>
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5 flex items-center gap-2">
              <Globe className="h-4 w-4 text-surface-400" /> Platform Name
            </label>
            <input
              value={data?.platformName || 'Green Basket Nepal'}
              onChange={(e) => setData({ ...data, platformName: e.target.value })}
              className="input-field"
              placeholder="Green Basket Nepal"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5 flex items-center gap-2">
              <Mail className="h-4 w-4 text-surface-400" /> Support Email
            </label>
            <input
              type="email"
              value={data?.supportEmail || ''}
              onChange={(e) => setData({ ...data, supportEmail: e.target.value })}
              className="input-field"
              placeholder="support@greenbasket.com"
            />
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="heading-xs mb-5 pb-4 border-b border-surface-200 flex items-center gap-2">
          <Truck className="h-4 w-4" /> Delivery Settings
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-surface-400" /> Delivery Charge (Rs.)
            </label>
            <input
              type="number"
              value={data?.deliveryCharge ?? 50}
              onChange={(e) => setData({ ...data, deliveryCharge: parseInt(e.target.value) || 0 })}
              className="input-field"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5 flex items-center gap-2">
              <Truck className="h-4 w-4 text-surface-400" /> Free Delivery Threshold (Rs.)
            </label>
            <input
              type="number"
              value={data?.freeDeliveryThreshold ?? 500}
              onChange={(e) => setData({ ...data, freeDeliveryThreshold: parseInt(e.target.value) || 0 })}
              className="input-field"
              min="0"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={handleSave} disabled={saving} className="btn-primary inline-flex items-center gap-2">
          {saving ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Saving...
            </>
          ) : (
            <><Save className="h-4 w-4" /> Save Settings</>
          )}
        </button>
        {saving && <span className="text-sm text-surface-400 animate-pulse">Updating platform configuration...</span>}
      </div>
    </div>
  )
}
