import { Link } from 'react-router-dom'
import { FileSearch, Home, ShoppingBag, ArrowLeft, Search } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export function NotFound() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) {
      navigate(`/products?search=${encodeURIComponent(search.trim())}`)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-50 p-6">
      <div className="mx-auto max-w-lg text-center animate-fade-in">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary-100 shadow-lg shadow-primary-200/50">
          <FileSearch className="h-12 w-12 text-primary-600" />
        </div>
        <h1 className="text-5xl sm:text-6xl font-extrabold text-surface-900 mb-3">404</h1>
        <p className="text-xl font-semibold text-surface-800 mb-2">
          Page Not Found
        </p>
        <p className="text-surface-500 mb-8 leading-relaxed">
          The page you're looking for doesn't exist or has been moved.
          Let us help you find what you need.
        </p>

        <form onSubmit={handleSearch} className="mx-auto mb-8 max-w-sm">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-surface-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="input-field pl-10 pr-4 py-3"
            />
          </div>
        </form>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link to="/" className="btn-primary inline-flex items-center gap-2 px-6 py-3">
            <Home className="h-4 w-4" />
            Back to Home
          </Link>
          <Link to="/products" className="btn-secondary inline-flex items-center gap-2 px-6 py-3">
            <ShoppingBag className="h-4 w-4" />
            Browse Products
          </Link>
          <Link to="/cart" className="btn-ghost inline-flex items-center gap-2 px-6 py-3">
            <ArrowLeft className="h-4 w-4" />
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}
