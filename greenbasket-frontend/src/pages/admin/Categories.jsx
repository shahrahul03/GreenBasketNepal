import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Grid3X3 } from 'lucide-react'
import toast from 'react-hot-toast'
import { categoryApi } from '@/api/categories'
import { PageLoader } from '@/components/common/Loader'

export function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ name: '', description: '' })
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    categoryApi.getAll({ page: 0, size: 50 })
      .then(({ data }) => setCategories(data.data?.content || data.data || []))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingId) {
        await categoryApi.update(editingId, form)
        toast.success('Category updated')
      } else {
        await categoryApi.create(form)
        toast.success('Category created')
      }
      setForm({ name: '', description: '' })
      setEditingId(null)
      setShowForm(false)
      const { data } = await categoryApi.getAll({ page: 0, size: 50 })
      setCategories(data.data?.content || data.data || [])
    } catch (err) { toast.error(err.message) }
  }

  const handleEdit = (cat) => {
    setForm({ name: cat.name, description: cat.description || '' })
    setEditingId(cat.id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return
    try {
      await categoryApi.delete(id)
      toast.success('Category deleted')
      setCategories((prev) => prev.filter((c) => c.id !== id))
    } catch (err) { toast.error(err.message) }
  }

  const handleToggle = async (id) => {
    try {
      await categoryApi.toggleActive(id)
      setCategories((prev) => prev.map((c) => c.id === id ? { ...c, active: !c.active } : c))
    } catch (err) { toast.error(err.message) }
  }

  if (loading) return <PageLoader />

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="toolbar">
        <div className="toolbar-left">
          <div>
            <h2 className="page-title">Categories</h2>
            <p className="page-subtitle">{categories.length} categories</p>
          </div>
        </div>
        <div className="toolbar-right">
          <button
            onClick={() => { setShowForm(true); setEditingId(null); setForm({ name: '', description: '' }) }}
            className="btn-primary"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Category
          </button>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-modal animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-surface-900">{editingId ? 'Edit Category' : 'New Category'}</h3>
              <button onClick={() => setShowForm(false)} className="btn-ghost btn-icon text-surface-400 hover:text-surface-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input-field"
                  placeholder="e.g. Fruits & Vegetables"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="input-field resize-none"
                  rows={3}
                  placeholder="Brief description of the category"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1">{editingId ? 'Update' : 'Create'}</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-surface-300 bg-white py-20">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-100 mb-4">
            <Grid3X3 className="h-8 w-8 text-surface-400" />
          </div>
          <h3 className="text-lg font-semibold text-surface-900">No categories yet</h3>
          <p className="text-sm text-surface-500 mt-1">Create your first category to organize products</p>
          <button
            onClick={() => { setShowForm(true); setEditingId(null); setForm({ name: '', description: '' }) }}
            className="btn-primary mt-6"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Category
          </button>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th className="table-header sticky top-0 bg-surface-50 z-10">Name</th>
                <th className="table-header sticky top-0 bg-surface-50 z-10">Description</th>
                <th className="table-header sticky top-0 bg-surface-50 z-10">Products</th>
                <th className="table-header sticky top-0 bg-surface-50 z-10">Status</th>
                <th className="table-header text-right sticky top-0 bg-surface-50 z-10">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {categories.map((cat) => (
                <tr key={cat.id} className="table-row">
                  <td className="table-cell">
                    <span className="text-sm font-semibold text-surface-900">{cat.name}</span>
                  </td>
                  <td className="table-cell">
                    <span className="text-sm text-surface-500 line-clamp-1">{cat.description || '—'}</span>
                  </td>
                  <td className="table-cell">
                    <span className="badge-neutral">{cat.productCount ?? 0}</span>
                  </td>
                  <td className="table-cell">
                    <span className={`badge ${cat.active !== false ? 'badge-success' : 'badge-neutral'}`}>
                      <span className={`status-dot ${cat.active !== false ? 'status-dot-success' : 'status-dot-neutral'} mr-1.5`} />
                      {cat.active !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="table-cell text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => handleEdit(cat)} className="btn-ghost btn-icon text-surface-400 hover:text-primary-600" title="Edit">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(cat.id)} className="btn-ghost btn-icon text-surface-400 hover:text-red-600" title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
