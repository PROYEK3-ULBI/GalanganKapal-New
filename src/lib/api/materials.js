// Materials API endpoints.
import { apiClient } from '../apiClient';

export const materialsApi = {
  // List materials with optional filters: { search, category, hazmat, lowStock }
  list(filters = {}) {
    return apiClient.get('/materials', {
      params: {
        search: filters.search,
        category: filters.category,
        hazmat: filters.hazmat ? 'true' : undefined,
        lowStock: filters.lowStock ? 'true' : undefined,
      },
    });
  },

  categories() {
    return apiClient.get('/materials/categories');
  },

  get(id) {
    return apiClient.get(`/materials/${id}`);
  },

  create(payload) {
    return apiClient.post('/materials', payload);
  },

  update(id, payload) {
    return apiClient.put(`/materials/${id}`, payload);
  },

  remove(id) {
    return apiClient.delete(`/materials/${id}`);
  },
};
