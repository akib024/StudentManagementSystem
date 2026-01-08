import apiClient from './api';

export const userService = {
  async updateProfile(data) {
    return apiClient.put('/account/profile', data);
  },

  async changePassword(oldPassword, newPassword) {
    return apiClient.put('/account/password', {
      oldPassword,
      newPassword,
    });
  },
};

export default userService;
