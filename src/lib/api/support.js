// Support tickets API endpoints.
import { apiClient } from '../apiClient';

export const supportApi = {
  // Staff sees own tickets, admin sees all (or pass userId to filter).
  list(filters = {}) {
    return apiClient.get('/support/tickets', {
      params: {
        status: filters.status,
        priority: filters.priority,
        userId: filters.userId,
      },
    });
  },
  get(id) {
    return apiClient.get(`/support/tickets/${id}`);
  },
  // payload: { subject, message, priority? }
  submit(payload) {
    return apiClient.post('/support/tickets', payload);
  },
  // admin only
  resolve(id, response) {
    return apiClient.post(`/support/tickets/${id}/resolve`, { response });
  },
  updateStatus(id, status, response) {
    return apiClient.patch(`/support/tickets/${id}/status`, { status, response });
  },
  remove(id) {
    return apiClient.delete(`/support/tickets/${id}`);
  },
};
