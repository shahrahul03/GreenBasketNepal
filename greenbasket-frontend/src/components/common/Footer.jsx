import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Store, Mail, Phone, MapPin, Facebook, Instagram, Twitter, Youtube, Smartphone, Send, ChevronDown } from 'lucide-react'

const footerLinks = {
  company: {
    title: 'Company',
    links: [
      { label: 'About Us', to: '/about' },
      { label: 'Contact Us', to: '/contact' },
      { label: 'Careers', to: '/careers' },
      { label: 'Press', to: '/press' },
    ],
  },
  categories: {
    title: 'Categories',
    links: [
      { label: 'Vegetables', to: '/products?category=vegetables' },
      { label: 'Fruits', to: '/products?category=fruits' },
      { label: 'Dairy & Eggs', to: '/products?category=dairy' },
      { label: 'Organic', to: '/products?category=organic' },
      { label: 'Seasonal', to: '/products?category=seasonal' },
      { label: 'Beverages', to: '/products?category=beverages' },
    ],
  },
  customerService: {
    title: 'Customer Service',
    links: [
      { label: 'Help Center', to: '/help' },
      { label: 'Order Tracking', to: '/orders' },
      { label: 'Returns & Refunds', to: '/returns' },
      { label: 'Shipping Info', to: '/shipping' },
      { label: 'FAQs', to: '/faqs' },
    ],
  },
  farmers: {
    title: 'For Farmers',
    links: [
      { label: 'Sell on GreenBasket', to: '/farmer' },
      { label: 'Farmer Guide', to: '/farmer-guide' },
      { label: 'Success Stories', to: '/stories' },
    ],
  },
}

const socialLinks = [
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Youtube, href: '#', label: 'YouTube' },
]

export function Footer() {
  const [email, setEmail] = useState('')
  const [openSections, setOpenSections] = useState({})

  const toggleSection = (title) => {
    setOpenSections(prev => ({
      ...prev,
      [title]: !prev[title]
    }))
  }

  const handleNewsletterSubmit = (e) => {
    e.preventDefault()
    if (email.trim()) {
      // newsletter signup logic placeholder
      setEmail('')
    }
  }

  return (
    <footer className="bg-surface-900 text-surface-300">
      {/* Newsletter Section */}
      <div className="border-b border-surface-800 bg-gradient-to-r from-emerald-900/60 via-surface-900 to-emerald-900/60">
        <div className="page-container py-10 lg:py-12">
          <div className="flex flex-col items-center gap-6 text-center lg:flex-row lg:text-left lg:justify-between">
            <div className="max-w-md">
              <h3 className="text-lg font-bold text-white mb-1.5">Get Fresh Updates</h3>
              <p className="text-sm text-surface-400 leading-relaxed">
                Subscribe to our newsletter and be the first to know about seasonal produce, exclusive offers, and farm stories.
              </p>
            </div>
            <form onSubmit={handleNewsletterSubmit} className="flex w-full max-w-md gap-2">
              <div className="relative flex-1">
                <label htmlFor="newsletter-email" className="sr-only">Newsletter Email</label>
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
                <input
                  id="newsletter-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full rounded-xl border border-surface-700 bg-surface-800 px-4 py-3 pl-10 text-sm text-white placeholder-surface-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
              </div>
              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-500 active:bg-emerald-700 transition-all"
              >
                <Send className="h-4 w-4" />
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="page-container py-12 lg:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-4">
            <Link to="/" className="flex items-center gap-2.5 mb-5 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-300">
                <Store className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white">
                Green<span className="text-emerald-400">Basket</span>
              </span>
            </Link>
            <p className="text-sm text-surface-400 leading-relaxed mb-6 max-w-xs">
              Nepal&apos;s freshest farm-to-home marketplace. Supporting local farmers and
              delivering nature&apos;s best directly to your doorstep.
            </p>
            <div className="space-y-3.5 text-sm text-surface-400">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-800 text-emerald-400 flex-shrink-0">
                  <MapPin className="h-4 w-4" />
                </div>
                <span>Kathmandu, Nepal</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-800 text-emerald-400 flex-shrink-0">
                  <Mail className="h-4 w-4" />
                </div>
                <a href="mailto:hello@greenbasket.com.np" className="hover:text-emerald-400 transition-colors">
                  hello@greenbasket.com.np
                </a>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-800 text-emerald-400 flex-shrink-0">
                  <Phone className="h-4 w-4" />
                </div>
                <a href="tel:+9779800000000" className="hover:text-emerald-400 transition-colors">
                  +977-9800000000
                </a>
              </div>
            </div>
            {/* Social */}
            <div className="flex items-center gap-2 mt-8">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-800 text-surface-400 hover:bg-emerald-600 hover:text-white hover:shadow-lg hover:-translate-y-0.5 transition-all"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link Sections - Accordion on Mobile */}
          <div className="sm:col-span-2 lg:col-span-6 grid gap-1 lg:grid-cols-3 lg:gap-10">
            {Object.values(footerLinks).map((section) => (
              <div key={section.title} className="border-b border-surface-800 lg:border-none">
                <button 
                  onClick={() => toggleSection(section.title)}
                  className="flex w-full items-center justify-between py-4 lg:py-0 lg:cursor-default lg:block"
                >
                  <h3 className="text-[11px] font-bold text-white uppercase tracking-widest">
                    {section.title}
                  </h3>
                  <ChevronDown className={`h-4 w-4 text-surface-500 transition-transform lg:hidden ${openSections[section.title] ? 'rotate-180' : ''}`} />
                </button>
                <ul className={`space-y-3.5 pb-4 lg:pb-0 lg:mt-6 transition-all duration-300 lg:block ${openSections[section.title] ? 'block' : 'hidden'}`}>
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.to}
                        className="text-sm text-surface-400 hover:text-emerald-400 hover:translate-x-1 transition-all inline-block"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Download App */}
          <div className="sm:col-span-2 lg:col-span-2">
            <h3 className="text-[11px] font-bold text-white mb-6 uppercase tracking-widest">
              Download App
            </h3>
            <div className="space-y-3">
              <p className="text-sm text-surface-400 leading-relaxed">
                Get the best experience with our mobile app.
              </p>
              <div className="flex flex-col gap-2.5">
                <a
                  href="#"
                  className="flex items-center gap-3 rounded-xl bg-surface-800 px-4 py-3 text-sm text-surface-300 hover:bg-emerald-600 hover:text-white hover:shadow-md transition-all group"
                >
                  <Smartphone className="h-5 w-5 text-emerald-400 group-hover:text-white transition-colors" />
                  <div className="flex flex-col">
                    <span className="text-[10px] text-surface-500 group-hover:text-emerald-200">Download on</span>
                    <span className="text-sm font-semibold">Google Play</span>
                  </div>
                </a>
                <a
                  href="#"
                  className="flex items-center gap-3 rounded-xl bg-surface-800 px-4 py-3 text-sm text-surface-300 hover:bg-emerald-600 hover:text-white hover:shadow-md transition-all group"
                >
                  <Smartphone className="h-5 w-5 text-emerald-400 group-hover:text-white transition-colors" />
                  <div className="flex flex-col">
                    <span className="text-[10px] text-surface-500 group-hover:text-emerald-200">Download on</span>
                    <span className="text-sm font-semibold">App Store</span>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mt-12 pt-8 border-t border-surface-800">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <p className="text-xs text-surface-500">
              We accept: Cash on Delivery, Khalti, eSewa, Mobile Banking, and Credit/Debit Cards
            </p>
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-surface-800 px-3 py-1.5 text-xs font-semibold text-surface-400">COD</span>
              <span className="rounded-lg bg-surface-800 px-3 py-1.5 text-xs font-semibold text-surface-400">Khalti</span>
              <span className="rounded-lg bg-surface-800 px-3 py-1.5 text-xs font-semibold text-surface-400">eSewa</span>
              <span className="rounded-lg bg-surface-800 px-3 py-1.5 text-xs font-semibold text-surface-400">Visa</span>
              <span className="rounded-lg bg-surface-800 px-3 py-1.5 text-xs font-semibold text-surface-400">Mastercard</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-surface-800/80 bg-surface-950/50">
        <div className="page-container py-5">
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-xs text-surface-500">
              &copy; {new Date().getFullYear()} Green Basket Nepal. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-xs text-surface-500">
              <Link to="/privacy" className="hover:text-emerald-400 transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="hover:text-emerald-400 transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
