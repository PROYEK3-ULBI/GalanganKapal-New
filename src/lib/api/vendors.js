// Vendors API endpoints.
import { apiClient } from '../apiClient';

export const vendorsApi = {
  list(filters = {}) {
    return apiClient.get('/vendors', {
      params: {
        search: filters.search,
        status: filters.status,
        activeOnly: filters.activeOnly ? 'true' : undefined,
      },
    });
  },
  get(id) {
    return apiClient.get(`/vendors/${id}`);
  },
  create(payload) {
    return apiClient.post('/vendors', payload);
  },
  update(id, payload) {
    return apiClient.put(`/vendors/${id}`, payload);
  },
  remove(id) {
    return apiClient.delete(`/vendors/${id}`);
  },
};
