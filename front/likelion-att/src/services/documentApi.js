// src/services/documentApi.js
import api from './api';

export const documentApi = {
  // 교육자료 목록 조회
  getAll: async () => {
    try {
      const response = await api.get('/api/docs');
      return response;
    } catch (error) {
      console.error('교육자료 목록 조회 실패:', error);
      throw error;
    }
  },

  // 교육자료 생성
  create: async (docData) => {
    try {
      const response = await api.post('/api/docs', docData);
      return response;
    } catch (error) {
      console.error('교육자료 생성 실패:', error);
      throw error;
    }
  },

  // 교육자료 수정
  update: async (docData) => {
    try {
      const response = await api.put('/api/docs', docData);
      return response;
    } catch (error) {
      console.error('교육자료 수정 실패:', error);
      throw error;
    }
  },

  // 교육자료 삭제
  delete: async (id) => {
    try {
      const response = await api.delete(`/api/docs?id=${id}`);
      return response;
    } catch (error) {
      console.error('교육자료 삭제 실패:', error);
      throw error;
    }
  },

  // 팀 교육자료 전체 삭제
  deleteByTeam: async (teamId) => {
    try {
      const response = await api.delete(`/api/docs/team?teamId=${teamId}`);
      return response;
    } catch (error) {
      console.error('팀 교육자료 삭제 실패:', error);
      throw error;
    }
  }
};

export default documentApi;