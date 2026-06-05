import api from './axios'

export const userApi = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (data) => api.put('/users/me', data),
  changePassword: (data) => api.put('/users/me/password', data),
  deleteAccount: () => api.delete('/users/me'),
}

export const adminUserApi = {
  getAll: (params) => api.get('/admin/users', { params }),
  getById: (id) => api.get(`/admin/users/${id}`),
  suspend: (id) => api.patch(`/admin/users/${id}/suspend`),
  unsuspend: (id) => api.patch(`/admin/users/${id}/unsuspend`),
  getDeliveryPartners: () => api.get('/admin/users/delivery-partners'),
  getUserDetail: (userId) => api.get(`/admin/users/${userId}/details`),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  getPendingFarmers: (params) => api.get('/admin/farmers/pending', { params }),
  approveFarmer: (userId) => api.post(`/admin/farmers/${userId}/approve`),
  rejectFarmer: (userId) => api.post(`/admin/farmers/${userId}/reject`),
  activateProduct: (id) => api.post(`/admin/products/${id}/activate`),
  deactivateProduct: (id) => api.post(`/admin/products/${id}/deactivate`),
  toggleFeatured: (id) => api.post(`/admin/products/${id}/featured`),
}
