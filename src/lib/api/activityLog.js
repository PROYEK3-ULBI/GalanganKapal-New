// Activity log API endpoints (admin only).
import { apiClient } from '../apiClient';

export const activityLogApi = {
  // filters: { userId, type, category, startDate, endDate, limit }
  list(filters = {}) {
    return apiClient.get('/activity-logs', {
      params: {
        userId: filters.userId,
        type: filters.type,
        category: filters.category,
        startDate: filters.startDate,
        endDate: filters.endDate,
        limit: filters.limit,
      },
    });
  },
};
