// src/services/api.js

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
      // console.log('사용자 목록 요청 시작');
      const response = await api.get('/api/user/all');
      // console.log('사용자 목록 응답:', response.data);
      return response;
    } catch (error) {
      // console.error('사용자 목록 API 오류:', error.response || error);
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

  deleteAccount: (id, password) => api.delete('/api/user', {
    params: {
      id,
      password
    }
  }),

  // 대량 사용자 등록
  bulkCreate: (formData) => api.post('/api/user/bulk', formData),
};

// 팀 관련 API
export const teamApi = {
  // 모든 팀 조회 - /api/team/all
  getAll: async () => {
    try {
      // console.log('전체 팀 목록 요청 시작');
      const response = await api.get('/api/team/all');
      // console.log('전체 팀 목록 응답:', response.data);
      return response;
    } catch (error) {
      // console.error('전체 팀 목록 API 오류:', error.response || error);
      throw error;
    }
  },

  // 특정 팀 조회 - /api/team?teamId=
  getById: async (id) => {
    try {
      // console.log(`팀 ${id} 조회 요청 시작`);
      const response = await api.get(`/api/team?teamId=${id}`);
      // console.log(`팀 ${id} 응답:`, response.data);

      // API 응답을 프론트엔드에서 사용하기 좋은 형태로 변환
      const teamEntries = Object.entries(response.data);

      if (teamEntries.length === 0) {
        throw new Error('팀 데이터가 비어있습니다');
      }

      const [teamDescription, members] = teamEntries[0];

      return {
        data: {
          id: parseInt(id),
          name: `팀 ${id}`,
          description: teamDescription,
          members: members || []
        }
      };
    } catch (error) {
      // console.error(`팀 ${id} 조회 API 오류:`, error);
      throw error;
    }
  },

  // 팀 생성 또는 업데이트 - /api/team
  create: async (teamId, studentIds, note = '') => {
    // console.log('팀 생성/수정 요청:', { teamId, studentIds, note });

    if (!Array.isArray(studentIds)) {
      // console.error('studentIds가 배열이 아닙니다:', studentIds);
      throw new Error('학번 배열이 유효하지 않습니다');
    }

    try {
      // teamId와 note는 쿼리 파라미터로 전송, 학생 ID 배열은 body로 전송
      const url = `/api/team?teamId=${teamId}&note=${encodeURIComponent(note || '')}`;
      const response = await api.post(url, studentIds);
      // console.log('팀 생성/수정 응답:', response.data);
      return response;
    } catch (error) {
      // console.error('팀 생성/수정 API 오류:', error.response || error);
      throw error;
    }
  },

  // 팀 삭제 - /api/team?teamId=
  delete: (id) => api.delete(`/api/team?teamId=${id}`),

  // 팀원 추가/제거 - 직접적인 API가 없으므로 create 함수를 활용
  // 기존 팀원 목록에서 추가하거나 제거한 후 업데이트
  addMember: async (teamId, userId) => {
    try {
      // 1. 현재 팀 정보 조회
      const teamResponse = await teamApi.getById(teamId);
      const team = teamResponse.data;
      const currentMembers = team.members || [];

      // 2. 추가할 사용자 정보 조회
      const userResponse = await userApi.getById(userId);
      const userToAdd = userResponse.data;

      // 3. 현재 멤버들의 학번 추출
      const currentStudentIds = currentMembers.map(member =>
        parseInt(member.studentId));

      // 4. 새 사용자가 이미 있는지 확인하고 없으면 추가
      const userStudentId = parseInt(userToAdd.studentId);
      if (!currentStudentIds.includes(userStudentId)) {
        currentStudentIds.push(userStudentId);
      }

      // 5. 팀 업데이트 API 호출
      await teamApi.create(teamId, currentStudentIds, team.description);

      // 6. 추가된 사용자 정보 반환
      return { data: userToAdd };
    } catch (error) {
      // console.error('팀원 추가 실패:', error);
      throw error;
    }
  },

  // 팀원 제거 - 직접적인 API가 없으므로 create 함수를 활용
  removeMember: async (teamId, userId) => {
    try {
      // 1. 현재 팀 정보 조회
      const teamResponse = await teamApi.getById(teamId);
      const team = teamResponse.data;
      const currentMembers = team.members || [];

      // 2. 제거할 사용자 정보 조회
      const userResponse = await userApi.getById(userId);
      const userToRemove = userResponse.data;

      // 3. 제거할 사용자를 제외한 학번 목록 생성
      const remainingStudentIds = currentMembers
        .filter(member => parseInt(member.studentId) !== parseInt(userToRemove.studentId))
        .map(member => parseInt(member.studentId));

      // 4. 팀 업데이트 API 호출
      await teamApi.create(teamId, remainingStudentIds, team.description);

      return { success: true };
    } catch (error) {
      // console.error('팀원 제거 실패:', error);
      throw error;
    }
  }
};

// 스케줄 관련 API
export const scheduleApi = {
  // 전체 스케줄 조회 - /api/schedules/all
  getAll: async () => {
    try {
      // console.log('전체 스케줄 목록 요청 시작');
      const response = await api.get('/api/schedules/all');
      // console.log('전체 스케줄 목록 응답:', response.data);
      return response;
    } catch (error) {
      // console.error('전체 스케줄 목록 API 오류:', error.response || error);
      throw error;
    }
  },

  // 특정 팀의 스케줄 조회 - /api/schedules?teamId=
  getByTeam: async (teamId) => {
    try {
      // console.log(`팀 ${teamId} 스케줄 조회 요청 시작`);
      const response = await api.get(`/api/schedules?teamId=${teamId}`);
      // console.log(`팀 ${teamId} 스케줄 응답:`, response.data);
      return response;
    } catch (error) {
      // console.error(`팀 ${teamId} 스케줄 API 오류:`, error.response || error);
      throw error;
    }
  },

  // 스케줄 생성 (여러 스케줄을 한 번에 생성) - /api/schedules?teamId=
  create: async (schedules, teamId) => {
    try {
      // console.log('스케줄 생성 요청:', { teamId, schedules });

      // API 명세에 따른 형식으로 변환
      // schedules 배열의 각 항목은 date와 time을 포함
      const formattedSchedules = schedules.map(schedule => ({
        date: schedule.date,
        time: schedule.time || "14:30:00"
      }));

      const response = await api.post(`/api/schedules?teamId=${teamId}`, formattedSchedules);
      // console.log('스케줄 생성 응답:', response.data);
      return response;
    } catch (error) {
      // console.error('스케줄 생성 API 오류:', error.response || error);
      throw error;
    }
  },

  // 스케줄 삭제 - /api/schedules?teamId=&id=
  delete: async (scheduleId, teamId) => {
    try {
      // console.log(`스케줄 ${scheduleId} 삭제 요청 (팀 ${teamId})`);
      const response = await api.delete(`/api/schedules?teamId=${teamId}&id=${scheduleId}`);
      // console.log(`스케줄 ${scheduleId} 삭제 응답:`, response.data);
      return response;
    } catch (error) {
      // console.error(`스케줄 ${scheduleId} 삭제 API 오류:`, error.response || error);
      throw error;
    }
  },

  // 특정 스케줄 조회 (전체 스케줄에서 검색)
  getById: async (id) => {
    try {
      // console.log('특정 스케줄 조회:', id);

      // 전체 스케줄 조회
      const allSchedulesResponse = await scheduleApi.getAll();
      const allSchedules = allSchedulesResponse.data;

      // 해당 ID의 스케줄 찾기
      let foundSchedule = null;
      let teamId = null;

      // 각 팀의 스케줄에서 검색
      Object.entries(allSchedules).forEach(([currentTeamId, teamSchedules]) => {
        if (Array.isArray(teamSchedules)) {
          const schedule = teamSchedules.find(s => s.id === parseInt(id));
          if (schedule) {
            foundSchedule = { ...schedule, teamId: parseInt(currentTeamId) };
            teamId = parseInt(currentTeamId);
          }
        }
      });

      if (!foundSchedule) {
        throw new Error(`스케줄 ID(${id})를 찾을 수 없습니다.`);
      }

      // console.log('찾은 스케줄:', foundSchedule);

      // 로컬 스토리지에 팀 ID 저장 (다른 API에서 사용하기 위해)
      if (teamId) {
        localStorage.setItem('currentTeamId', teamId);
      }

      return { data: foundSchedule };
    } catch (error) {
      // console.error(`스케줄 ${id} 조회 실패:`, error);
      throw error;
    }
  }
};

// 출석 관련 API
export const attendanceApi = {
  // 특정 스케줄의 출석 정보 조회
  getBySchedule: async (scheduleId) => {
    try {
      // console.log('출석 정보 조회:', scheduleId);

      // 특정 스케줄 정보 가져오기
      const scheduleResponse = await scheduleApi.getById(scheduleId);
      const scheduleData = scheduleResponse.data;

      // 출석 정보 추출
      if (scheduleData.attendances && Array.isArray(scheduleData.attendances)) {
        // 상태 값이 소문자인 경우 대문자로 변환
        const formattedAttendances = scheduleData.attendances.map(attendance => {
          // 상태 값 대문자로 변환 (not → NOT, present → PRESENT 등)
          let status = attendance.status || 'NOT';
          if (status === 'not') status = 'NOT';
          else if (status === 'present') status = 'PRESENT';
          else if (status === 'late') status = 'LATE';
          else if (status === 'absent') status = 'ABSENT';

          return {
            ...attendance,
            status: status,
            // user가 있으면 member로 복사
            member: attendance.user || null
          };
        });

        return { data: formattedAttendances };
      }

      // 출석 정보가 없는 경우 빈 배열 반환
      return { data: [] };
    } catch (error) {
      // console.error(`스케줄 ${scheduleId}의 출석 정보 조회 실패:`, error);
      throw error;
    }
  },

  // 출석 정보 업데이트 - 변경된 엔드포인트 적용: /api/att
  bulkUpdate: async (attendances) => {
    try {
      // console.log('출석 정보 업데이트 요청:', attendances);

      // API가 요구하는 형식으로 데이터 변환
      const formattedAttendances = attendances.map(attendance => {
        // 상태 값 확인 및 변환
        let status = attendance.status || 'NOT';
        if (status === 'not') status = 'NOT';
        else if (status === 'present') status = 'PRESENT';
        else if (status === 'late') status = 'LATE';
        else if (status === 'absent') status = 'ABSENT';

        return {
          id: attendance.id,
          user: attendance.user || attendance.member, // user 또는 member 필드 사용
          status: status, // 대문자 상태값 사용
          note: attendance.note || '',
          score: attendance.score || 0
        };
      });

      // console.log('변환된 출석 데이터:', formattedAttendances);

      // 변경된 엔드포인트로 API 호출
      const response = await api.put('/api/att', formattedAttendances);
      // console.log('출석 정보 업데이트 응답:', response);
      return response;
    } catch (error) {
      // console.error('출석 정보 업데이트 실패:', error.response || error);
      throw error;
    }
  },

  // 통계 정보 조회
  getStats: (userId) => api.get(`/api/user/${userId}/stats`),

  // 팀 출석률 조회
  getTeamStats: (teamId) => api.get(`/api/team/${teamId}/stats`),
};

export default api;