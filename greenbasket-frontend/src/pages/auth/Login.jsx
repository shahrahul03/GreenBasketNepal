import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Store, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { GoogleLogin } from '@react-oauth/google'
import toast from 'react-hot-toast'
import { useAuth } from '@/hooks/useAuth'
import { ROLES } from '@/utils/constants'

export function Login() {
  const { login, googleLogin } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const redirectAfterLogin = () => {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      const user = JSON.parse(userStr)
      const role = user.role?.name || user.role || ''
      if (role === ROLES.ADMIN) navigate('/admin')
      else if (role === ROLES.FARMER) navigate('/farmer')
      else if (role === ROLES.DELIVERY_PARTNER) navigate('/deliveries')
      else navigate('/')
    } else {
      navigate('/')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      return toast.error('Please fill in all fields')
    }
    setLoading(true)
    try {
      await login({ email: form.email, password: form.password })
      toast.success('Welcome back!')
      redirectAfterLogin()
    } catch (err) {
      toast.error(err.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true)
    try {
      await googleLogin(credentialResponse.credential)
      toast.success('Welcome back!')
      redirectAfterLogin()
    } catch (err) {
      toast.error(err.message || 'Google login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-sm animate-fade-in">
          <div className="text-center mb-10">
            <Link to="/" className="inline-flex items-center gap-2.5 group">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 group-hover:shadow-lg group-hover:shadow-primary-600/25 transition-all duration-300">
                <Store className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-surface-900">Green<span className="text-primary-600">Basket</span></span>
            </Link>
            <h1 className="mt-8 text-3xl font-bold text-surface-900 tracking-tight">Welcome back</h1>
            <p className="mt-2 text-sm text-surface-500">Sign in to your account to continue</p>
          </div>

          <div className="rounded-2xl bg-white p-8 shadow-xl shadow-surface-200/50 ring-1 ring-surface-200/50">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-surface-700 mb-1.5">Email</label>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400 group-focus-within:text-primary-500 transition-colors duration-200" />
                  <input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="input-field pl-10 border-surface-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-surface-700 mb-1.5">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400 group-focus-within:text-primary-500 transition-colors duration-200" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="input-field pl-10 pr-10 border-surface-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end">
                <Link to="/forgot-password" className="text-xs font-medium text-primary-600 hover:text-primary-500 transition-colors">
                  Forgot Password?
                </Link>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base shadow-lg shadow-primary-600/20 hover:shadow-xl hover:shadow-primary-600/30 transition-all duration-300 disabled:opacity-70">
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Signing in...
                  </span>
                ) : 'Sign In'}
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-surface-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-3 text-surface-400 font-medium">or continue with</span>
              </div>
            </div>

            <div className="w-full flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => toast.error('Google login failed')}
                theme="outline"
                size="large"
                text="continue_with"
                shape="rectangular"
              />
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-surface-500">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-500 transition-colors inline-flex items-center gap-1 group">
              Create one <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-primary-700 via-primary-800 to-emerald-900 items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-400/10 via-transparent to-transparent" />
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-primary-600/20 blur-3xl animate-pulse" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-accent-500/15 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/4 right-1/4 h-48 w-48 rounded-full bg-emerald-400/10 blur-2xl" />
        <div className="absolute bottom-1/4 left-1/4 h-40 w-40 rounded-full bg-primary-500/10 blur-2xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-72 w-72 rounded-full bg-primary-500/10 blur-3xl" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="relative z-10 text-center px-12 max-w-lg">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-sm ring-1 ring-white/20 mb-6">
            <Store className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white leading-tight">Fresh From Farm<br />to Your Table</h2>
          <p className="mt-4 text-base text-primary-100/90 leading-relaxed">Support local farmers. Get the freshest organic produce delivered to your doorstep.</p>
          <div className="mt-12 grid grid-cols-2 gap-4 text-left">
            {[
              { label: 'Farm Fresh', desc: 'Directly sourced from local farms' },
              { label: 'Free Delivery', desc: 'On orders above Rs. 500' },
              { label: 'Quality Guaranteed', desc: '100% satisfaction guarantee' },
              { label: 'Support Local', desc: 'Empowering Nepali farmers' },
            ].map((item, i) => (
              <div key={item.label} className="rounded-xl bg-white/10 backdrop-blur-sm p-4 ring-1 ring-white/10 hover:bg-white/15 hover:ring-white/20 transition-all duration-300 group" style={{ animationDelay: `${i * 100}ms` }}>
                <p className="text-sm font-semibold text-white">{item.label}</p>
                <p className="text-xs text-primary-200/80 mt-1 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
