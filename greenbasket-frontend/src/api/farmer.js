import api from './axios'

export const farmerApi = {
  getDashboard: () => api.get('/farmer/dashboard'),
  getProducts: (params) => api.get('/farmer/products', { params }),
  getOrders: (params) => api.get('/farmer/orders', { params }),
  getAnalytics: () => api.get('/farmer/analytics'),
  updateOrderStatus: (orderId, data) => api.put(`/farmer/orders/${orderId}/status`, data),
  getProfile: () => api.get('/farmer/profile'),
  updateProfile: (data) => api.put('/farmer/profile', data),
  changePassword: (data) => api.put('/farmer/profile/password', data),
}
