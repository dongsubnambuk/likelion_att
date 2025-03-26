// src/components/common/Notification.js
import React, { useEffect } from 'react';
import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';

/**
 * 알림 컴포넌트
 * @param {Object} props - 컴포넌트 속성
 * @param {Object} props.notification - 알림 정보 객체
 * @param {string} props.notification.type - 알림 유형 ('success', 'error', 'info')
 * @param {string} props.notification.message - 알림 메시지
 * @param {Function} props.onClose - 알림 종료 함수
 * @param {number} [props.autoClose=3000] - 자동 종료 시간 (ms)
 */
const Notification = ({ notification, onClose, autoClose = 3000 }) => {
  useEffect(() => {
    // 자동 종료 타이머 설정
    if (notification && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoClose);
      
      return () => clearTimeout(timer);
    }
  }, [notification, autoClose, onClose]);
  
  if (!notification) return null;
  
  const { type, message } = notification;
  
  // 아이콘 선택
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FaCheckCircle />;
      case 'error':
        return <FaExclamationTriangle />;
      case 'info':
      default:
        return <FaInfoCircle />;
    }
  };
  
  return (
    <div className={`alert alert-${type}`}>
      {getIcon()}
      <span>{message}</span>
    </div>
  );
};

export default Notification;