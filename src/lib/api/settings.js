// Settings-related API endpoints (auth profile + notification preferences).
import { apiClient } from '../apiClient';

export const settingsApi = {
  updateProfile(payload) {
    return apiClient.put('/auth/profile', payload);
  },
  changePassword(currentPassword, newPassword) {
    return apiClient.post('/auth/password', { currentPassword, newPassword });
  },
  updateNotificationPreferences(preferences) {
    return apiClient.put('/auth/notification-preferences', { preferences });
  },
};
