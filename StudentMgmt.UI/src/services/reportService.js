import { apiClient } from './api';

const BASE_URL = 'api/reports';

export const reportService = {
  // Transcript endpoints
  getStudentTranscript: async (studentId) => {
    const response = await apiClient.get(`${BASE_URL}/transcripts/${studentId}`);
    return response.data;
  },

  exportTranscriptPdf: async (studentId) => {
    const response = await apiClient.get(
      `${BASE_URL}/transcripts/${studentId}/export/pdf`,
      { responseType: 'blob' }
    );
    return response.data;
  },

  downloadTranscriptPdf: async (studentId, studentName) => {
    try {
      const pdf = await reportService.exportTranscriptPdf(studentId);
      const url = window.URL.createObjectURL(new Blob([pdf]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Transcript_${studentName}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      throw new Error('Failed to download transcript');
    }
  },

  // Grade Report endpoints
  getGradeReport: async (courseId) => {
    const response = await apiClient.get(`${BASE_URL}/grades/${courseId}`);
    return response.data;
  },

  exportGradeReportExcel: async (courseId) => {
    const response = await apiClient.get(
      `${BASE_URL}/grades/${courseId}/export/excel`,
      { responseType: 'blob' }
    );
    return response.data;
  },

  exportGradeReportCsv: async (courseId) => {
    const response = await apiClient.get(
      `${BASE_URL}/grades/${courseId}/export/csv`,
      { responseType: 'blob' }
    );
    return response.data;
  },

  downloadGradeReportExcel: async (courseId, courseCode) => {
    try {
      const excel = await reportService.exportGradeReportExcel(courseId);
      const url = window.URL.createObjectURL(new Blob([excel]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `GradeReport_${courseCode}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      throw new Error('Failed to download grade report');
    }
  },

  downloadGradeReportCsv: async (courseId, courseCode) => {
    try {
      const csv = await reportService.exportGradeReportCsv(courseId);
      const url = window.URL.createObjectURL(new Blob([csv]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `GradeReport_${courseCode}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      throw new Error('Failed to download grade report');
    }
  },

  // Analytics endpoints
  getMyAnalytics: async () => {
    const response = await apiClient.get(`${BASE_URL}/analytics/my-analytics`);
    return response.data;
  },

  getStudentAnalytics: async (studentId) => {
    const response = await apiClient.get(`${BASE_URL}/analytics/students/${studentId}`);
    return response.data;
  },

  getDepartmentAnalytics: async (departmentId) => {
    const response = await apiClient.get(`${BASE_URL}/analytics/departments/${departmentId}`);
    return response.data;
  },

  getAllStudentsAnalytics: async () => {
    const response = await apiClient.get(`${BASE_URL}/analytics/all-students`);
    return response.data;
  },
};
