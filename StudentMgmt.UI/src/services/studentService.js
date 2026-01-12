import apiClient from './api';

export const studentService = {
  async getAllStudents() {
    return apiClient.get('/students');
  },

  async getStudentById(id) {
    return apiClient.get(`/students/${id}`);
  },

  async createStudent(data) {
    return apiClient.post('/students', data);
  },

  async updateStudent(id, data) {
    return apiClient.put(`/students/${id}`, data);
  },

  async deleteStudent(id) {
    return apiClient.delete(`/students/${id}`);
  },

  async getNextEnrollmentNumber() {
    return apiClient.get('/students/enrollment-number/next');
  },
};

export default studentService;
