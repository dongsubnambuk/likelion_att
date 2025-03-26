// src/utils/constants.js

// 트랙 한글명 매핑
export const TRACK_MAPPING = {
    'EduFront': '교육 프론트엔드',
    'EduBack': '교육 백엔드',
    'ProFront': '프로젝트 프론트엔드',
    'ProBack': '프로젝트 백엔드'
  };
  
  // 트랙 옵션
  export const TRACK_OPTIONS = [
    { value: 'EduFront', label: '교육 프론트엔드' },
    { value: 'EduBack', label: '교육 백엔드' },
    { value: 'ProFront', label: '프로젝트 프론트엔드' },
    { value: 'ProBack', label: '프로젝트 백엔드' }
  ];
  
  // 역할 옵션
  export const ROLE_OPTIONS = [
    { value: 'STUDENT', label: '학생' },
    { value: 'ADMIN', label: '운영진' }
  ];
  
  // 탭 옵션
  export const TAB_OPTIONS = [
    { value: 'all', label: '모든 부원' },
    { value: 'admin', label: '운영진' },
    { value: 'student', label: '학생' }
  ];