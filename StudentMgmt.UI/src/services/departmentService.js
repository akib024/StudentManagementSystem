import apiClient from './api';

export const departmentService = {
  async getAllDepartments() {
    return apiClient.get('/departments');
  },

  async getDepartmentById(id) {
    return apiClient.get(`/departments/${id}`);
  },

  async createDepartment(data) {
    return apiClient.post('/departments', data);
  },

  async updateDepartment(id, data) {
    return apiClient.put(`/departments/${id}`, data);
  },

  async deleteDepartment(id) {
    return apiClient.delete(`/departments/${id}`);
  },
};

export default departmentService;
