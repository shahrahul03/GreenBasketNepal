import api from './axios'

export const reviewApi = {
  getProductReviews: (productId) => api.get(`/reviews/product/${productId}`),
  getReviewStats: (productId) => api.get(`/reviews/product/${productId}/stats`),
  create: (data) => api.post('/reviews', data),
  getMyReviews: (params) => api.get('/reviews/my', { params }),
  delete: (id) => api.delete(`/reviews/${id}`),
  getFarmerReviews: (params) => api.get('/farmer/reviews', { params }),
  adminGetAll: (params) => api.get('/admin/reviews', { params }),
  adminGetProductReviews: (productId, params) => api.get(`/admin/reviews/product/${productId}`, { params }),
  hide: (id) => api.put(`/admin/reviews/${id}/hide`),
  show: (id) => api.put(`/admin/reviews/${id}/show`),
}
