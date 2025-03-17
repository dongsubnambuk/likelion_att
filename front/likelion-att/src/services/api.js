// src/services/api.js 수정

import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://likelion-att.o-r.kr',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - 요청 전에 토큰 확인
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - 401 에러 시 로그아웃
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 사용자 관련 API
export const userApi = {
  // 모든 사용자 조회
  getAll: async () => {
    try {
      console.log('사용자 목록 요청 시작');
      const response = await api.get('/api/user/all');
      console.log('사용자 목록 응답:', response.data);
      return response;
    } catch (error) {
      console.error('사용자 목록 API 오류:', error.response || error);
      throw error;
    }
  },
  
  // 특정 사용자 조회
  getById: (id) => api.get(`/api/user/${id}`),
  
  // 사용자 검색
  search: (query) => api.get(`/api/user/search?q=${query}`),
  
  // 사용자 생성
  create: (userData) => api.post('/api/user', userData),
  
  // 사용자 정보 수정
  update: (id, userData) => api.put(`/api/user/${id}`, userData),
  
  // 사용자 삭제
  delete: (id) => api.delete(`/api/user/${id}`),
  
  // 대량 사용자 등록
  bulkCreate: (formData) => api.post('/api/user/bulk', formData),
};

// 팀 관련 API
export const teamApi = {
  // 모든 팀 조회 - 응답 구조에 맞게 수정
  getAll: async () => {
    try {
      console.log('전체 팀 목록 요청 시작');
      const response = await api.get('/api/team/all');
      console.log('전체 팀 목록 응답:', response.data);
      return response;
    } catch (error) {
      console.error('전체 팀 목록 API 오류:', error.response || error);
      throw error;
    }
  },
  
  // 특정 팀 조회 - 전체 팀 목록에서 필터링
  getById: async (id) => {
    try {
      // 전체 팀 목록 가져오기
      const allTeamsResponse = await api.get('/api/team/all');
      
      // 특정 팀의 데이터만 추출
      const teamData = allTeamsResponse.data[id];
      
      if (!teamData) {
        throw new Error('팀을 찾을 수 없습니다');
      }
      
      // 특정 팀 데이터 반환
      return { 
        data: {
          id: parseInt(id),
          name: `팀 ${id}`,
          members: teamData
        }
      };
    } catch (error) {
      console.error(`팀 ${id} 조회 API 오류:`, error);
      throw error;
    }
  },
  
  // 특정 팀의 멤버 조회 - 전체 팀 목록에서 필터링
  getMembers: async (id) => {
    try {
      // 전체 팀 목록 가져오기
      const allTeamsResponse = await api.get('/api/team/all');
      
      // 특정 팀의 멤버 데이터만 추출
      const teamMembers = allTeamsResponse.data[id];
      
      if (!teamMembers) {
        throw new Error('팀을 찾을 수 없습니다');
      }
      
      // 멤버 데이터 반환
      return { data: teamMembers };
    } catch (error) {
      console.error(`팀 ${id} 멤버 조회 API 오류:`, error);
      throw error;
    }
  },
  
  // 팀 생성 또는 업데이트
  create: async (teamId, studentIds) => {
    console.log('팀 생성/수정 요청:', { teamId, studentIds });
    
    // studentIds가 배열인지 확인
    if (!Array.isArray(studentIds)) {
      console.error('studentIds가 배열이 아닙니다:', studentIds);
      throw new Error('학번 배열이 유효하지 않습니다');
    }
    
    try {
      const response = await api.post(`/api/team?teamId=${teamId}`, studentIds);
      console.log('팀 생성/수정 응답:', response);
      return response;
    } catch (error) {
      console.error('팀 생성/수정 API 오류:', error.response || error);
      throw error;
    }
  },
  
  // 팀 삭제
  delete: (id) => api.delete(`/api/team/${id}`),
};

// 스케줄 관련 API
export const scheduleApi = {
  // 모든 스케줄 조회
  getAll: () => api.get('/api/schedules/all'),
  
  // 특정 스케줄 조회
  getById: (id) => api.get(`/api/schedules/${id}`),
  
  // 특정 팀의 스케줄 조회
  getByTeam: (teamId) => api.get(`/api/schedules?teamId=${teamId}`),
  
  // 스케줄 생성
  create: (scheduleData) => api.post('/api/schedules', scheduleData),
  
  // 스케줄 정보 수정
  update: (id, scheduleData) => api.put(`/api/schedules/${id}`, scheduleData),
  
  // 스케줄 삭제
  delete: (id) => api.delete(`/api/schedules/${id}`),
};

// 출석 관련 API
export const attendanceApi = {
  // 특정 스케줄의 출석 정보 조회
  getBySchedule: (scheduleId) => api.get(`/api/schedules/${scheduleId}/attendances`),
  
  // 특정 사용자의 출석 정보 조회
  getByUser: (userId) => api.get(`/api/user/${userId}/attendances`),
  
  // 특정 팀의 특정 스케줄에 대한 출석 정보 조회
  getByTeamAndSchedule: (teamId, scheduleId) => 
    api.get(`/api/schedules/${scheduleId}?teamId=${teamId}`),
  
  // 출석 정보 업데이트 (개별)
  update: (attendanceId, attendanceData) => 
    api.put(`/api/pickup/update-location`, attendanceData),
  
  // 출석 정보 일괄 업데이트
  bulkUpdate: (attendances) => api.put('/api/pickup/update-location', { attendances }),
  
  // 통계 정보 조회
  getStats: (userId) => api.get(`/api/user/${userId}/stats`),
  
  // 팀 출석률 조회
  getTeamStats: (teamId) => api.get(`/api/team/${teamId}/stats`),
};

export default api;