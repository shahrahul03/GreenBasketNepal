import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight, Leaf, Truck, Shield, Clock, Star, ShoppingCart,
  Sprout, Apple, Milk, Wheat, Coffee, Cherry,
  Quote, MapPin, Heart, Search, Sparkles, TrendingUp,
  Award, Users, Package, Store, BadgeCheck, Smartphone, CheckCircle2, Zap
} from 'lucide-react'
import { productApi } from '@/api/products'
import { categoryApi } from '@/api/categories'
import { ProductCard } from '@/components/common/ProductCard'
import { ProductCardSkeleton, HeroSkeleton } from '@/components/common/Skeleton'
import { formatCurrency, getImageUrl } from '@/utils/helpers'
import toast from 'react-hot-toast'

const WHY_CHOOSE_US = [
  { icon: Leaf, title: '100% Organic', desc: 'Directly from certified local organic farms', color: 'text-emerald-600 bg-emerald-50' },
  { icon: Zap, title: 'Fresh Daily', desc: 'Harvested at dawn, delivered by dusk', color: 'text-amber-600 bg-amber-50' },
  { icon: Users, title: 'Support Farmers', desc: 'Fair prices directly to Nepal\'s farmers', color: 'text-blue-600 bg-blue-50' },
  { icon: Shield, title: 'Safe & Healthy', desc: 'No pesticides, no chemicals, just nature', color: 'text-purple-600 bg-purple-50' },
]

const CUSTOMER_REVIEWS = [
  { name: 'Anjali Rai', rating: 5, text: 'The quality of spinach and tomatoes is incredible. Never going back to the local market!', location: 'Kathmandu' },
  { name: 'Suman Thapa', rating: 5, text: 'Super fast delivery and everything was packed so neatly in eco-friendly bags.', location: 'Lalitpur' },
  { name: 'Bipana KC', rating: 4, text: 'Love the organic honey. It tastes pure and authentic. Great job Green Basket!', location: 'Bhaktapur' },
]

export function Home() {
  const [featured, setFeatured] = useState([])
  const [bestsellers, setBestsellers] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')

  useEffect(() => {
    setLoading(true)
    Promise.all([
      productApi.getAll({ page: 0, size: 8, sort: 'createdAt,desc', isAvailable: 'true' }),
      productApi.getAll({ page: 0, size: 8, sort: 'soldCount,desc', isAvailable: 'true' }),
      categoryApi.getAll({ page: 0, size: 50 }),
    ])
      .then(([featuredRes, bestsellerRes, catRes]) => {
        setFeatured(featuredRes.data.data?.content || featuredRes.data.data || [])
        setBestsellers(bestsellerRes.data.data?.content || bestsellerRes.data.data || [])
        setCategories(catRes.data.data?.content || catRes.data.data || [])
      })
      .catch(() => toast.error('Failed to load marketplace data'))
      .finally(() => setLoading(false))
  }, [])

  const handleToggleWishlist = async (productId) => {
    try {
      const { wishlistApi } = await import('@/api/wishlist')
      await wishlistApi.add(productId)
      toast.success('Added to wishlist!')
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <div className="min-h-screen bg-surface-50/30">
      {/* 1. Top Delivery Banner */}
      <div className="bg-emerald-600 py-2.5 px-4 text-center overflow-hidden">
        <p className="text-white text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2">
          <Zap className="h-3 w-3 fill-amber-400 text-amber-400" />
          Fresh from farm to your table • Free delivery over Rs. 500
          <Zap className="h-3 w-3 fill-amber-400 text-amber-400" />
        </p>
      </div>

      <div className="page-container py-4 sm:py-6">
        {/* 2. Modern Search Bar */}
        <div className="relative mb-6">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-surface-400 group-focus-within:text-emerald-500 transition-colors" />
            <input
              type="text"
              placeholder="Search for fresh vegetables, organic fruits..."
              className="w-full bg-white border border-surface-200 h-14 pl-12 pr-4 rounded-2xl text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <span className="hidden sm:block text-[10px] font-bold text-surface-300 uppercase">Press / to search</span>
              <button className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all">
                Search
              </button>
            </div>
          </div>
        </div>

        {/* 3. Horizontal Category Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 mb-6">
          {['All', ...categories.map(c => c.name)].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-bold transition-all border ${
                activeCategory === cat
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-200'
                  : 'bg-white border-surface-200 text-surface-600 hover:border-emerald-200 hover:text-emerald-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 4. Promotional Cards (CTA Section) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 to-emerald-800 p-6 text-white group cursor-pointer shadow-lg hover:shadow-emerald-200 transition-all">
            <div className="relative z-10">
              <span className="inline-block px-2 py-1 rounded-lg bg-white/20 text-[9px] font-black uppercase mb-3">Limited Offer</span>
              <h3 className="text-xl font-black mb-1">New Customer?</h3>
              <p className="text-emerald-50 text-xs font-medium mb-4">Get 20% OFF on your first order</p>
              <button className="bg-white text-emerald-700 px-4 py-2 rounded-xl text-[11px] font-black uppercase hover:bg-emerald-50 transition-all">Use Code: FRESH20</button>
            </div>
            <Sparkles className="absolute -right-4 -bottom-4 h-32 w-32 text-white/10 group-hover:scale-110 transition-transform" />
          </div>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 to-orange-600 p-6 text-white group cursor-pointer shadow-lg hover:shadow-amber-200 transition-all">
            <div className="relative z-10">
              <span className="inline-block px-2 py-1 rounded-lg bg-white/20 text-[9px] font-black uppercase mb-3">Join Us</span>
              <h3 className="text-xl font-black mb-1">Are You a Farmer?</h3>
              <p className="text-amber-50 text-xs font-medium mb-4">Sell directly to customers & earn more</p>
              <Link to="/register" className="inline-block bg-white text-orange-700 px-4 py-2 rounded-xl text-[11px] font-black uppercase hover:bg-amber-50 transition-all">Register Now</Link>
            </div>
            <Store className="absolute -right-4 -bottom-4 h-32 w-32 text-white/10 group-hover:scale-110 transition-transform" />
          </div>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white group cursor-pointer shadow-lg hover:shadow-blue-200 transition-all">
            <div className="relative z-10">
              <span className="inline-block px-2 py-1 rounded-lg bg-white/20 text-[9px] font-black uppercase mb-3">Coming Soon</span>
              <h3 className="text-xl font-black mb-1">Download Our App</h3>
              <p className="text-blue-50 text-xs font-medium mb-4">Track orders & get instant notifications</p>
              <button className="bg-white text-blue-700 px-4 py-2 rounded-xl text-[11px] font-black uppercase hover:bg-blue-50 transition-all">View Features</button>
            </div>
            <Smartphone className="absolute -right-4 -bottom-4 h-32 w-32 text-white/10 group-hover:scale-110 transition-transform" />
          </div>
        </div>

        {/* 5. Product Sections */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black text-surface-900 tracking-tight">Trending Now</h2>
              <p className="text-sm text-surface-500 font-medium">Fresh picks this week in Kathmandu</p>
            </div>
            <Link to="/products" className="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 group">
              View All <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : featured.map((product) => (
                  <ProductCard key={product.id} product={product} onToggleWishlist={handleToggleWishlist} />
                ))
            }
          </div>
        </section>

        <section className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black text-surface-900 tracking-tight">Best Sellers</h2>
              <p className="text-sm text-surface-500 font-medium">Most loved by our healthy community</p>
            </div>
            <Link to="/products?sort=soldCount,desc" className="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 group">
              View All <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : bestsellers.map((product) => (
                  <ProductCard key={product.id} product={product} onToggleWishlist={handleToggleWishlist} />
                ))
            }
          </div>
        </section>

        {/* 6. Why Choose Us (Icon Cards) */}
        <section className="py-12 bg-white rounded-[3rem] border border-surface-200/50 mb-12 shadow-sm">
          <div className="px-6 text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-surface-900 mb-2">Why Choose Green Basket?</h2>
            <p className="text-surface-500 text-sm font-medium">We make healthy eating simple and rewarding</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 px-6">
            {WHY_CHOOSE_US.map((item, idx) => (
              <div key={idx} className="flex flex-col items-center text-center">
                <div className={`h-16 w-16 rounded-3xl ${item.color} flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform`}>
                  <item.icon className="h-8 w-8" />
                </div>
                <h3 className="text-sm font-black text-surface-900 mb-1">{item.title}</h3>
                <p className="text-[11px] text-surface-500 font-medium leading-relaxed max-w-[140px]">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 7. Customer Reviews */}
        <section className="mb-12">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-surface-900 mb-2">What Our Customers Say</h2>
            <div className="flex items-center justify-center gap-1 text-amber-400">
              <Star className="h-5 w-5 fill-current" />
              <Star className="h-5 w-5 fill-current" />
              <Star className="h-5 w-5 fill-current" />
              <Star className="h-5 w-5 fill-current" />
              <Star className="h-5 w-5 fill-current" />
              <span className="ml-2 text-surface-900 font-black text-lg">4.9/5</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {CUSTOMER_REVIEWS.map((review, idx) => (
              <div key={idx} className="bg-white p-7 rounded-[2rem] border border-surface-200/60 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </div>
                <p className="text-surface-700 text-sm font-medium italic leading-relaxed mb-6">
                  &ldquo;{review.text}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-black text-xs">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-surface-900">{review.name}</h4>
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                      <span className="text-[10px] font-bold text-surface-400 uppercase tracking-wider">Verified Buyer</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <div className="bg-emerald-950 rounded-[3rem] p-8 sm:p-12 text-center relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-5xl font-black text-white mb-4 leading-tight">Start Your Healthy <br className="hidden sm:block" /> Journey Today</h2>
            <p className="text-emerald-200/80 text-sm sm:text-lg mb-8 max-w-2xl mx-auto font-medium">
              Join 10,000+ happy families in Nepal eating fresh, organic produce delivered straight from the farm.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/products" className="w-full sm:w-auto bg-emerald-500 text-white px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-wider hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-900/40 active:scale-95">
                Shop Fresh Now
              </Link>
              <Link to="/register" className="w-full sm:w-auto bg-white/10 text-white border border-white/20 backdrop-blur-md px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-wider hover:bg-white/20 transition-all active:scale-95">
                Join as a Farmer
              </Link>
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl" />
        </div>
      </div>
    </div>
  )
}

export default Home
