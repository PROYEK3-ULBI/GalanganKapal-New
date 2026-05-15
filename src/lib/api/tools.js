// Tools management API endpoints.
import { apiClient } from '../apiClient';

export const toolsApi = {
  // filters: { search, status, category, borrowerId, calibrationDue }
  list(filters = {}) {
    return apiClient.get('/tools', {
      params: {
        search: filters.search,
        status: filters.status,
        category: filters.category,
        borrowerId: filters.borrowerId,
        calibrationDue: filters.calibrationDue ? 'true' : undefined,
      },
    });
  },
  get(id) {
    return apiClient.get(`/tools/${id}`);
  },
  history(id) {
    return apiClient.get(`/tools/${id}/history`);
  },
  create(payload) {
    return apiClient.post('/tools', payload);
  },
  update(id, payload) {
    return apiClient.put(`/tools/${id}`, payload);
  },
  remove(id) {
    return apiClient.delete(`/tools/${id}`);
  },

  // Workflow actions
  checkout(id, payload = {}) {
    return apiClient.post(`/tools/${id}/checkout`, payload);
  },
  returnTool(id, payload = {}) {
    return apiClient.post(`/tools/${id}/return`, payload);
  },
  setMaintenance(id, payload = {}) {
    return apiClient.post(`/tools/${id}/maintenance`, payload);
  },
  setAvailable(id, payload = {}) {
    return apiClient.post(`/tools/${id}/available`, payload);
  },
};
