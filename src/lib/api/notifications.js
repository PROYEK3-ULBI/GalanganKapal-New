// Per-user notifications API endpoints.
import { apiClient } from '../apiClient';

export const notificationsApi = {
  // List the current user's notifications.
  // filters: { read: boolean, limit: number, category: string }
  list(filters = {}) {
    return apiClient.get('/notifications', {
      params: {
        read: filters.read === undefined ? undefined : (filters.read ? 'true' : 'false'),
        limit: filters.limit,
        category: filters.category,
      },
    });
  },

  // Aggregate counts (total + unread) for the bell badge.
  stats() {
    return apiClient.get('/notifications/stats');
  },

  markRead(id) {
    return apiClient.patch(`/notifications/${id}/read`);
  },

  markAllRead() {
    return apiClient.patch('/notifications/read-all');
  },

  remove(id) {
    return apiClient.delete(`/notifications/${id}`);
  },
};
