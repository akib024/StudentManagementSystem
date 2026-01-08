import apiClient from './api';

export const courseService = {
  async getAllCourses() {
    return apiClient.get('/courses');
  },

  async getCourseById(id) {
    return apiClient.get(`/courses/${id}`);
  },

  async createCourse(data) {
    return apiClient.post('/courses', data);
  },

  async updateCourse(id, data) {
    return apiClient.put(`/courses/${id}`, data);
  },

  async deleteCourse(id) {
    return apiClient.delete(`/courses/${id}`);
  },
};

export default courseService;
