// src/utils/formatters.js
import { TRACK_MAPPING } from './constants';

/**
 * 전화번호 형식화 함수
 * @param {string|number} phone - 전화번호
 * @returns {string} - 형식화된 전화번호
 */
export const formatPhone = (phone) => {
  if (!phone) return '-';
  const phoneStr = phone.toString();
  
  if (phoneStr.length === 8) {
    return `${phoneStr.slice(0, 4)}-${phoneStr.slice(4)}`;
  }
  
  if (phoneStr.length === 11) {
    return `${phoneStr.slice(0, 3)}-${phoneStr.slice(3, 7)}-${phoneStr.slice(7)}`;
  }
  
  return phoneStr;
};

/**
 * 트랙 한글명 표시 함수
 * @param {string} track - 트랙 코드
 * @returns {string} - 트랙 한글명
 */
export const getTrackDisplay = (track) => {
  return TRACK_MAPPING[track] || track || '-';
};