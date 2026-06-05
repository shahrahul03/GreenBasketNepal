import { format, parseISO } from 'date-fns'

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'NPR',
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(dateString, pattern = 'MMM dd, yyyy') {
  if (!dateString) return 'N/A'
  try {
    return format(parseISO(dateString), pattern)
  } catch {
    return dateString
  }
}

export function formatDateTime(dateString) {
  return formatDate(dateString, 'MMM dd, yyyy hh:mm a')
}

export function truncate(str, length = 100) {
  if (!str) return ''
  return str.length > length ? `${str.substring(0, length)}...` : str
}

export function generateInitials(name) {
  if (!name) return '?'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function buildQueryString(params) {
  const filtered = Object.entries(params).filter(
    ([, v]) => v !== null && v !== undefined && v !== '',
  )
  if (filtered.length === 0) return {}
  return Object.fromEntries(filtered)
}

export function buildPageParams(page = 0, size = 10, sort = 'createdAt,desc') {
  return { page, size, sort }
}

export function getImageUrl(path) {
  if (!path) return '/placeholder.svg'
  if (path.startsWith('http')) return path
  const base = import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') || ''
  return `${base}${path}`
}

export function debounce(fn, delay = 300) {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}
