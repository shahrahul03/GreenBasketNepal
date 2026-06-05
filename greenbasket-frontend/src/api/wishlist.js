import api from './axios'

export const wishlistApi = {
  getAll: () => api.get('/wishlist'),
  add: (productId) => api.post('/wishlist', { productId }),
  removeById: (id) => api.delete(`/wishlist/${id}`),
  removeByProduct: (productId) => api.delete(`/wishlist/product/${productId}`),
}
