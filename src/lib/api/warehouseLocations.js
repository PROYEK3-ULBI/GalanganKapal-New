// Warehouse storage locations.
import { apiClient } from '../apiClient';

export const warehouseLocationsApi = {
  list(filters = {}) {
    return apiClient.get('/warehouse-locations', {
      params: {
        search: filters.search,
        type: filters.type,
        status: filters.status,
        activeOnly: filters.activeOnly ? 'true' : undefined,
      },
    });
  },
  get(id) {
    return apiClient.get(`/warehouse-locations/${id}`);
  },
  create(payload) {
    return apiClient.post('/warehouse-locations', payload);
  },
  update(id, payload) {
    return apiClient.put(`/warehouse-locations/${id}`, payload);
  },
  remove(id) {
    return apiClient.delete(`/warehouse-locations/${id}`);
  },
};
