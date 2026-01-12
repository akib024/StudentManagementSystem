import apiClient from './api';

export const teacherService = {
  async getAllTeachers() {
    return apiClient.get('/teachers');
  },

  async getTeacherById(id) {
    return apiClient.get(`/teachers/${id}`);
  },

  async getTeachersByDepartment(department) {
    return apiClient.get(`/teachers/department/${department}`);
  },

  async getNextEmployeeId() {
    return apiClient.get('/teachers/employee-id/next');
  },

  async createTeacher(data) {
    return apiClient.post('/teachers', data);
  },

  async updateTeacher(id, data) {
    return apiClient.put(`/teachers/${id}`, data);
  },

  async deleteTeacher(id) {
    return apiClient.delete(`/teachers/${id}`);
  },
};

export default teacherService;
