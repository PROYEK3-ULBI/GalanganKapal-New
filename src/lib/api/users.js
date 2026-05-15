// Users management API endpoints (admin only).
import { apiClient } from '../apiClient';

export const usersApi = {
  // filters: { search, role, status, department }
  list(filters = {}) {
    return apiClient.get('/users', {
      params: {
        search: filters.search,
        role: filters.role,
        status: filters.status,
        department: filters.department,
      },
    });
  },
  get(id) {
    return apiClient.get(`/users/${id}`);
  },
  // payload: { email, password, name, role, avatar?, department?, status? }
  create(payload) {
    return apiClient.post('/users', payload);
  },
  // payload: { name?, role?, avatar?, department?, status? } (email immutable)
  update(id, payload) {
    return apiClient.put(`/users/${id}`, payload);
  },
  // Auto-flip when no body, or pass { status: 'active'|'inactive' } to set explicitly.
  toggleStatus(id, status) {
    return apiClient.patch(`/users/${id}/status`, status ? { status } : {});
  },
  resetPassword(id, password) {
    return apiClient.post(`/users/${id}/reset-password`, { password });
  },
  remove(id) {
    return apiClient.delete(`/users/${id}`);
  },
};
