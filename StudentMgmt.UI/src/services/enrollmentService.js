import apiClient from './api';

export const enrollmentService = {
  async getAllEnrollments() {
    return apiClient.get('/enrollments');
  },

  async getEnrollmentById(id) {
    return apiClient.get(`/enrollments/${id}`);
  },

  async getMyEnrollments() {
    return apiClient.get('/enrollments/my-enrollments');
  },

  async getStudentEnrollments(studentId) {
    return apiClient.get(`/enrollments/student/${studentId}`);
  },

  async getCourseEnrollments(courseId) {
    return apiClient.get(`/enrollments/course/${courseId}`);
  },

  async enrollStudent(studentId, courseId) {
    return apiClient.post('/enrollments', {
      studentId,
      courseId,
    });
  },

  async updateEnrollmentStatus(id, status) {
    return apiClient.put(`/enrollments/${id}/status`, {
      status,
    });
  },

  async withdrawEnrollment(id) {
    return apiClient.delete(`/enrollments/${id}`);
  },

  async getMyTranscript() {
    return apiClient.get('/enrollments/my-transcript');
  },

  async getStudentTranscript(studentId) {
    return apiClient.get(`/enrollments/transcript/${studentId}`);
  },
};

export default enrollmentService;
