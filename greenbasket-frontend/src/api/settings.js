import api from './axios'

export const settingsApi = {
  getSettings: () => api.get('/admin/settings'),
  updateSetting: (id, data) => api.put(`/admin/settings/${id}`, data),
}
