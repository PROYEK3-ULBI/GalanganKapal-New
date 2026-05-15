// Auth API endpoints.
import { apiClient } from '../apiClient';

export const authApi = {
  login(email, password) {
    return apiClient.post('/auth/login', { email, password }, { auth: false });
  },
  me() {
    return apiClient.get('/auth/me');
  },
};
