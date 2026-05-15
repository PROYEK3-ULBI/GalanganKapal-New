// Material Requests API endpoints (workflow: Staff submit → Supervisor approve/reject).
import { apiClient } from '../apiClient';

export const materialRequestsApi = {
  // List requests. Staff sees own, Supervisor/Admin sees all.
  // filters: { status, type, priority, projectId, requesterId, limit }
  list(filters = {}) {
    return apiClient.get('/material-requests', {
      params: {
        status: filters.status,
        type: filters.type,
        priority: filters.priority,
        projectId: filters.projectId,
        requesterId: filters.requesterId,
        limit: filters.limit,
      },
    });
  },

  get(id) {
    return apiClient.get(`/material-requests/${id}`);
  },

  // payload: { type?, projectId?, priority?, reason, items: [{ materialId, qty, notes? }] }
  create(payload) {
    return apiClient.post('/material-requests', payload);
  },

  // notes is optional
  approve(id, notes) {
    return apiClient.post(`/material-requests/${id}/approve`, { notes });
  },

  reject(id, notes) {
    return apiClient.post(`/material-requests/${id}/reject`, { notes });
  },

  remove(id) {
    return apiClient.delete(`/material-requests/${id}`);
  },
};
