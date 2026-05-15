// Projects (Hull / Drydock) API endpoints.
// Used by transactions, material requests, and reports modules.
import { apiClient } from '../apiClient';

export const projectsApi = {
  // List projects with optional filters: { search, status, type, activeOnly }
  list(filters = {}) {
    return apiClient.get('/projects', {
      params: {
        search: filters.search,
        status: filters.status,
        type: filters.type,
        activeOnly: filters.activeOnly ? 'true' : undefined,
      },
    });
  },
  get(id) {
    return apiClient.get(`/projects/${id}`);
  },
  create(payload) {
    return apiClient.post('/projects', payload);
  },
  update(id, payload) {
    return apiClient.put(`/projects/${id}`, payload);
  },
  remove(id) {
    return apiClient.delete(`/projects/${id}`);
  },
};
