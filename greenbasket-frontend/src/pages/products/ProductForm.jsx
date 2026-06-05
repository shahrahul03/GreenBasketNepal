import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { productApi } from '@/api/products'
import { categoryApi } from '@/api/categories'
import { PageLoader } from '@/components/common/Loader'
import { getImageUrl } from '@/utils/helpers'
import { Leaf as LeafIcon } from 'lucide-react'

export function ProductForm() {
  const { slug } = useParams()
  const isEdit = !!slug
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [productId, setProductId] = useState(null)
  const [images, setImages] = useState([])
  const [form, setForm] = useState({
    name: '',
    description: '',
    unitPrice: '',
    unit: 'kg',
    stockQuantity: '',
    categoryId: '',
    isOrganic: false,
    isAvailable: true,
  })

  useEffect(() => {
    categoryApi.getAll({ page: 0, size: 100 })
      .then(({ data }) => setCategories(data.data?.content || data.data || []))
      .catch(() => console.warn('[ProductForm] Failed to load categories'))

    if (isEdit) {
      productApi.getBySlug(slug)
        .then(({ data }) => {
          const p = data.data
          setProductId(p.id)
          setForm({
            name: p.name || '',
            description: p.description || '',
            unitPrice: p.unitPrice || p.price || '',
            unit: p.unit || 'kg',
            stockQuantity: p.stockQuantity || p.stock || '',
            categoryId: p.categoryId || p.category?.id || '',
            isOrganic: p.isOrganic || false,
            isAvailable: p.isAvailable !== false,
          })
          setImages(p.images || [])
        })
        .catch(() => toast.error('Product not found'))
        .finally(() => setLoading(false))
    }
  }, [slug])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const price = parseFloat(form.unitPrice)
      const stock = parseInt(form.stockQuantity)
      if (isNaN(price) || price <= 0) {
        toast.error('Please enter a valid price')
        setSaving(false)
        return
      }
      if (isNaN(stock) || stock < 0) {
        toast.error('Please enter a valid stock quantity')
        setSaving(false)
        return
      }
      const payload = {
        name: form.name,
        description: form.description,
        price,
        stock,
        unit: form.unit,
        categoryId: form.categoryId ? parseInt(form.categoryId) : null,
        isOrganic: form.isOrganic,
        isAvailable: form.isAvailable,
      }
      if (isEdit) {
        await productApi.update(productId, payload)
        toast.success('Product updated')
      } else {
        const { data } = await productApi.create(payload)
        setProductId(data.data.id)
        toast.success('Product created')
        navigate(`/products/${data.data.slug}/edit`, { replace: true })
      }
    } catch (err) { toast.error(err.message) }
    finally { setSaving(false) }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!productId) {
      toast.error('Save the product first before uploading images')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('isPrimary', images.length === 0 ? 'true' : 'false')
      const { data } = await productApi.uploadImage(productId, formData)
      setImages(data.data.images || [])
      toast.success('Image uploaded')
    } catch (err) { toast.error(err.message) }
    finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDeleteImage = async (imageId) => {
    if (!confirm('Delete this image?')) return
    try {
      await productApi.deleteImage(imageId)
      setImages(images.filter((img) => img.id !== imageId))
      toast.success('Image deleted')
    } catch (err) { toast.error(err.message) }
  }

  const handleSetPrimary = async (imageId) => {
    try {
      await productApi.setPrimaryImage(productId, imageId)
      setImages(images.map((img) => ({ ...img, primary: img.id === imageId })))
      toast.success('Primary image updated')
    } catch (err) { toast.error(err.message) }
  }

  if (loading) return <PageLoader />

  if (loading) return <PageLoader />

  return (
    <div className="page-container py-8 animate-fade-in">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-surface-900 sm:text-3xl">
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </h1>
          <p className="text-sm text-surface-500 mt-1">
            {isEdit ? 'Update your product details below' : 'Fill in the details to list a new product'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card-hover p-6 sm:p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-surface-700 mb-1.5">Product Name <span className="text-red-500">*</span></label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input-field"
              placeholder="e.g. Fresh Organic Tomatoes"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-surface-700 mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              className="input-field resize-none"
              placeholder="Describe your product - quality, origin, harvesting date..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-surface-700 mb-1.5">Price (NPR) <span className="text-red-500">*</span></label>
              <div className="input-group">
                <span className="input-group-prepend">Rs.</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.unitPrice}
                  onChange={(e) => setForm({ ...form, unitPrice: e.target.value })}
                  className="input-field"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-surface-700 mb-1.5">Unit</label>
              <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="input-field">
                <option value="kg">Per Kg</option>
                <option value="g">Per Gram</option>
                <option value="piece">Per Piece</option>
                <option value="dozen">Per Dozen</option>
                <option value="bunch">Per Bunch</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-surface-700 mb-1.5">Stock Quantity <span className="text-red-500">*</span></label>
              <input
                type="number"
                min="0"
                value={form.stockQuantity}
                onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })}
                className="input-field"
                placeholder="0"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-surface-700 mb-1.5">Category</label>
            <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="input-field">
              <option value="">Select a category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-2">
            <label className="relative flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={form.isOrganic}
                onChange={(e) => setForm({ ...form, isOrganic: e.target.checked })}
                className="h-4 w-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm font-medium text-surface-700 group-hover:text-primary-600 transition-colors">
                <LeafIcon className="inline h-3.5 w-3.5 mr-1 text-primary-500" />
                Organic Product
              </span>
            </label>
            <label className="relative flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={form.isAvailable}
                onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })}
                className="h-4 w-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm font-medium text-surface-700 group-hover:text-primary-600 transition-colors">Available for Sale</span>
            </label>
          </div>

          <div className="flex flex-wrap gap-3 pt-4 border-t border-surface-100">
            <button type="submit" disabled={saving} className="btn-primary px-8 py-3 text-sm">
              {saving ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Saving...
                </span>
              ) : isEdit ? 'Update Product' : 'Create Product'}
            </button>
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary px-6 py-3">Cancel</button>
          </div>
        </form>

        {productId && (
          <div className="card-hover mt-8 p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-surface-900">Product Images</h2>
            <p className="mt-1 text-sm text-surface-500">Upload up to 5 images (JPEG, PNG, WebP). Max 5MB each.</p>

            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {images.map((img) => (
                <div key={img.id} className={`relative rounded-xl border-2 overflow-hidden group ${img.primary ? 'border-primary-500 ring-2 ring-primary-100 shadow-sm' : 'border-surface-200'}`}>
                  <img src={getImageUrl(img.imageUrl)} alt="" className="aspect-square w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all flex items-end justify-center">
                    <div className="flex justify-center gap-1.5 p-3 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                      {!img.primary && (
                        <button type="button" onClick={() => handleSetPrimary(img.id)} className="rounded-lg bg-white/90 px-3 py-1.5 text-xs font-semibold text-surface-700 hover:bg-white shadow-sm transition-all">
                          Set as Primary
                        </button>
                      )}
                      <button type="button" onClick={() => handleDeleteImage(img.id)} className="rounded-lg bg-red-500/90 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-500 shadow-sm transition-all">
                        Delete
                      </button>
                    </div>
                  </div>
                  {img.primary && (
                    <span className="absolute left-2 top-2 rounded-lg bg-primary-500/90 backdrop-blur-sm px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
                      Primary
                    </span>
                  )}
                </div>
              ))}

              {images.length < 5 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex aspect-square items-center justify-center rounded-xl border-2 border-dashed border-surface-300 text-surface-400 hover:border-primary-400 hover:text-primary-500 hover:bg-primary-50/50 transition-all group"
                >
                  {uploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <svg className="animate-spin h-6 w-6 text-primary-500" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                      <span className="text-xs font-medium text-surface-500">Uploading...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-3xl leading-none text-surface-300 group-hover:text-primary-400 transition-colors">+</span>
                      <span className="text-xs font-medium">Add Image</span>
                    </div>
                  )}
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>
        )}
      </div>
    </div>
  )
}
