import api from './axios'

export const dashboardApi = {
  getStats: () => api.get('/admin/dashboard'),
  getRecentActivity: () => api.get('/admin/dashboard/recent-activity'),
  getAnalytics: () => api.get('/admin/analytics'),
}
