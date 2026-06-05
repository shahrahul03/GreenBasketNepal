import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Store, User, Mail, Lock, Phone, Eye, EyeOff, ArrowRight, Leaf, ShoppingBag, Truck } from 'lucide-react'
import { GoogleLogin } from '@react-oauth/google'
import toast from 'react-hot-toast'
import { authApi } from '@/api/auth'
import { useAuth } from '@/hooks/useAuth'
import { ROLES } from '@/utils/constants'

const ROLE_OPTIONS = [
  { value: 'CUSTOMER', label: 'Customer', desc: 'Buy fresh produce', icon: ShoppingBag },
  { value: 'FARMER', label: 'Farmer', desc: 'Sell your products', icon: Leaf },
  { value: 'DELIVERY_PARTNER', label: 'Delivery Partner', desc: 'Deliver orders', icon: Truck },
]

export function Register() {
  const { googleLogin } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    fullName: '', email: '', password: '', confirmPassword: '', phone: '', role: 'CUSTOMER',
  })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.fullName || !form.email || !form.password || !form.phone) {
      return toast.error('Please fill in all required fields')
    }
    if (form.password !== form.confirmPassword) {
      return toast.error('Passwords do not match')
    }
    setLoading(true)
    try {
      await authApi.register({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        phone: form.phone,
        role: form.role,
      })
      toast.success('Account created successfully! Please sign in.')
      navigate('/login')
    } catch (err) {
      toast.error(err.message || 'Failed to create account')
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
            <h1 className="mt-8 text-3xl font-bold text-surface-900 tracking-tight">Create your account</h1>
            <p className="mt-2 text-sm text-surface-500">Join Nepal's freshest marketplace</p>
          </div>

          <div className="flex items-center justify-center gap-4 mb-8">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all duration-300 ${step >= 1 ? 'bg-gradient-to-br from-primary-600 to-primary-700 text-white shadow-md shadow-primary-600/20' : 'bg-surface-100 text-surface-400'}`}>
              <User className="h-4 w-4" />
            </div>
            <div className={`h-0.5 w-12 rounded-full transition-all duration-300 ${step >= 2 ? 'bg-gradient-to-r from-primary-600 to-primary-500' : 'bg-surface-200'}`} />
            <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all duration-300 ${step >= 2 ? 'bg-gradient-to-br from-primary-600 to-primary-700 text-white shadow-md shadow-primary-600/20' : 'bg-surface-100 text-surface-400'}`}>
              <Lock className="h-4 w-4" />
            </div>
          </div>

          <div className="rounded-2xl bg-white p-8 shadow-xl shadow-surface-200/50 ring-1 ring-surface-200/50">
            <form onSubmit={handleSubmit} className="space-y-5">
              {step === 1 ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-2.5">I want to</label>
                    <div className="grid grid-cols-3 gap-3">
                      {ROLE_OPTIONS.map((role) => {
                        const Icon = role.icon
                        return (
                          <button
                            key={role.value}
                            type="button"
                            onClick={() => setForm({ ...form, role: role.value })}
                            className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all duration-200 ${
                              form.role === role.value
                                ? 'border-primary-500 bg-primary-50 shadow-md shadow-primary-500/10'
                                : 'border-surface-200 hover:border-surface-300 hover:bg-surface-50 hover:shadow-sm'
                            }`}
                          >
                            <Icon className={`h-6 w-6 ${form.role === role.value ? 'text-primary-600' : 'text-surface-400'}`} />
                            <span className={`text-xs font-semibold ${form.role === role.value ? 'text-primary-700' : 'text-surface-600'}`}>{role.label}</span>
                            <span className={`text-[10px] leading-tight text-center ${form.role === role.value ? 'text-primary-500/80' : 'text-surface-400'}`}>{role.desc}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-surface-700 mb-1.5">Full Name</label>
                    <div className="relative group">
                      <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400 group-focus-within:text-primary-500 transition-colors duration-200" />
                      <input id="fullName" name="fullName" value={form.fullName} onChange={handleChange} className="input-field pl-10 border-surface-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200" placeholder="John Doe" required />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-surface-700 mb-1.5">Email</label>
                    <div className="relative group">
                      <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400 group-focus-within:text-primary-500 transition-colors duration-200" />
                      <input id="email" type="email" name="email" value={form.email} onChange={handleChange} className="input-field pl-10 border-surface-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200" placeholder="you@example.com" required />
                    </div>
                  </div>
                  <button type="button" onClick={() => setStep(2)} className="btn-primary w-full py-3 text-base shadow-lg shadow-primary-600/20 hover:shadow-xl hover:shadow-primary-600/30 transition-all duration-300">
                    Continue <ArrowRight className="ml-2 h-4 w-4 inline" />
                  </button>
                </>
              ) : (
                <>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-surface-700 mb-1.5">Phone</label>
                    <div className="relative group">
                      <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400 group-focus-within:text-primary-500 transition-colors duration-200" />
                      <input id="phone" name="phone" value={form.phone} onChange={handleChange} className="input-field pl-10 border-surface-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200" placeholder="98XXXXXXXX" required />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-surface-700 mb-1.5">Password</label>
                    <div className="relative group">
                      <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400 group-focus-within:text-primary-500 transition-colors duration-200" />
                      <input id="password" type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} className="input-field pl-10 pr-10 border-surface-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200" placeholder="Min. 8 characters" required minLength={8} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-surface-700 mb-1.5">Confirm Password</label>
                    <div className="relative group">
                      <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400 group-focus-within:text-primary-500 transition-colors duration-200" />
                      <input id="confirmPassword" type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} className="input-field pl-10 border-surface-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200" placeholder="Repeat your password" required />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1 py-3 border-2 border-surface-200 hover:border-surface-300 transition-all duration-200">Back</button>
                    <button type="submit" disabled={loading} className="btn-primary flex-1 py-3 text-base shadow-lg shadow-primary-600/20 hover:shadow-xl hover:shadow-primary-600/30 transition-all duration-300 disabled:opacity-70">
                      {loading ? (
                        <span className="inline-flex items-center gap-2">
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Creating Account...
                        </span>
                      ) : 'Create Account'}
                    </button>
                  </div>
                </>
              )}
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
                onSuccess={async (credentialResponse) => {
                  try {
                    await googleLogin(credentialResponse.credential)
                    toast.success('Welcome!')
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
                  } catch (err) {
                    toast.error(err.message || 'Google login failed')
                  }
                }}
                onError={() => toast.error('Google login failed')}
                theme="outline"
                size="large"
                text="continue_with"
                shape="rectangular"
              />
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-surface-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-500 transition-colors inline-flex items-center gap-1 group">
              Sign In <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-primary-700 via-primary-800 to-emerald-900 items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-400/10 via-transparent to-transparent" />
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary-600/20 blur-3xl animate-pulse" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-accent-500/15 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/4 left-1/4 h-48 w-48 rounded-full bg-emerald-400/10 blur-2xl" />
        <div className="absolute bottom-1/4 right-1/4 h-40 w-40 rounded-full bg-primary-500/10 blur-2xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-72 w-72 rounded-full bg-primary-500/10 blur-3xl" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="relative z-10 text-center px-12 max-w-lg">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-sm ring-1 ring-white/20 mb-6">
            <Store className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white leading-tight">Start Your Journey<br />with GreenBasket</h2>
          <p className="mt-4 text-base text-primary-100/90 leading-relaxed">Whether you're buying fresh produce, selling your harvest, or delivering smiles — we've got you.</p>
          <div className="mt-12 flex justify-center">
            <div className="grid grid-cols-1 gap-4 w-full max-w-sm">
              {[
                { role: 'Customer', benefit: 'Shop fresh produce from local farms', icon: ShoppingBag },
                { role: 'Farmer', benefit: 'Sell directly to thousands of customers', icon: Leaf },
                { role: 'Delivery Partner', benefit: 'Earn by delivering farm-fresh goods', icon: Truck },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.role} className="flex items-center gap-4 rounded-xl bg-white/10 backdrop-blur-sm p-4 ring-1 ring-white/10 text-left hover:bg-white/15 hover:ring-white/20 transition-all duration-300 group">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white shrink-0">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{item.role}</p>
                      <p className="text-xs text-primary-200/80 mt-0.5">{item.benefit}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
