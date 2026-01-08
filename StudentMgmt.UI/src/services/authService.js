import apiClient from './api';

export const authService = {
  async login(username, password) {
    const response = await apiClient.post('/auth/login', {
      username,
      password,
    });
    if (response?.token) {
      apiClient.setToken(response.token);
    }
    return response;
  },

  async register(data) {
    const response = await apiClient.post('/auth/register', data);
    return response;
  },

  logout() {
    apiClient.setToken(null);
  },

  getToken() {
    return apiClient.getToken();
  },

  isAuthenticated() {
    return !!this.getToken();
  },

  // Decode JWT to get user info (simple, no verification)
  decodeToken(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
    }
  },

  getCurrentUser() {
    const token = this.getToken();
    if (!token) return null;
    const decoded = this.decodeToken(token);
    return {
      userId: decoded?.sub,
      username: decoded?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
      role: decoded?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'],
    };
  },
};

export default authService;
