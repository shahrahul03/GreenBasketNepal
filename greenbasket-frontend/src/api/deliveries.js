import api from './axios'

export const deliveryApi = {
  getMyDeliveries: (params) => api.get('/deliveries/my', { params }),
  getMyHistory: (params) => api.get('/deliveries/history', { params }),
  acceptDelivery: (id) => api.post(`/deliveries/${id}/accept`),
  updateStatus: (id, data) => api.put(`/deliveries/${id}/status`, data),
}

export const adminDeliveryApi = {
  assign: (data) => api.post('/admin/deliveries', data),
  getAll: (params) => api.get('/admin/deliveries', { params }),
}

export const adminOrderApi = {
  getAll: (params) => api.get('/admin/orders', { params }),
  updateStatus: (id, data) => api.put(`/admin/orders/${id}/status`, data),
}
