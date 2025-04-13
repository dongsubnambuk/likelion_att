// src/components/SessionTimeoutModal.js
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FaExclamationTriangle } from 'react-icons/fa';

// 경고 표시 시간 설정 (밀리초 단위)
const WARNING_BEFORE_TIMEOUT = 5 * 60 * 1000; // 세션 만료 5분 전 경고
const ACTUAL_TIMEOUT = 30 * 60 * 1000; // 30분 (AuthContext와 동일하게)

const SessionTimeoutModal = () => {
  const [showModal, setShowModal] = useState(false);
  const [countdown, setCountdown] = useState(300); // 5분 = 300초
  const { resetInactivityTimer, logout } = useAuth();
  const countdownIntervalRef = useRef(null);
  const sessionTimerRef = useRef(null);
  const warningTimerRef = useRef(null);

  useEffect(() => {
    // 세션 시작 시 타이머 설정
    const startSessionTimer = () => {
      // 이미 존재하는 타이머 정리
      if (sessionTimerRef.current) clearTimeout(sessionTimerRef.current);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      
      // 경고 표시 타이머 설정
      warningTimerRef.current = setTimeout(() => {
        setShowModal(true);
        setCountdown(Math.floor(WARNING_BEFORE_TIMEOUT / 1000));
        
        // 카운트다운 시작
        countdownIntervalRef.current = setInterval(() => {
          setCountdown(prevCount => {
            if (prevCount <= 1) {
              clearInterval(countdownIntervalRef.current);
              return 0;
            }
            return prevCount - 1;
          });
        }, 1000);
      }, ACTUAL_TIMEOUT - WARNING_BEFORE_TIMEOUT);
      
      // 실제 세션 타임아웃 타이머
      sessionTimerRef.current = setTimeout(() => {
        logout();
        setShowModal(false);
        alert('세션이 만료되었습니다. 다시 로그인해주세요.');
        window.location.href = '/login';
      }, ACTUAL_TIMEOUT);
    };
    
    // 로컬 스토리지에 토큰이 있을 때만 타이머 시작
    if (localStorage.getItem('token')) {
      startSessionTimer();
    }
    
    // 세션 갱신을 위한 이벤트 감지
    const resetTimers = () => {
      if (localStorage.getItem('token')) {
        startSessionTimer();
      }
    };
    
    // 사용자 활동 감지 이벤트
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, resetTimers);
    });
    
    return () => {
      // 클린업 함수에서 모든 타이머 정리
      if (sessionTimerRef.current) clearTimeout(sessionTimerRef.current);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      
      // 이벤트 리스너 제거
      events.forEach(event => {
        document.removeEventListener(event, resetTimers);
      });
    };
  }, [logout]);

  // 세션 연장
  const handleContinue = () => {
    setShowModal(false);
    resetInactivityTimer();
    
    // 타이머 재설정
    if (sessionTimerRef.current) clearTimeout(sessionTimerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    
    // 새로운 타이머 시작
    warningTimerRef.current = setTimeout(() => {
      setShowModal(true);
      setCountdown(Math.floor(WARNING_BEFORE_TIMEOUT / 1000));
      
      countdownIntervalRef.current = setInterval(() => {
        setCountdown(prevCount => {
          if (prevCount <= 1) {
            clearInterval(countdownIntervalRef.current);
            return 0;
          }
          return prevCount - 1;
        });
      }, 1000);
    }, ACTUAL_TIMEOUT - WARNING_BEFORE_TIMEOUT);
    
    sessionTimerRef.current = setTimeout(() => {
      logout();
      setShowModal(false);
      alert('세션이 만료되었습니다. 다시 로그인해주세요.');
      window.location.href = '/login';
    }, ACTUAL_TIMEOUT);
  };

  // 즉시 로그아웃
  const handleLogout = () => {
    setShowModal(false);
    logout();
    window.location.href = '/login';
  };

  if (!showModal) return null;

  return (
    <div className="modal-backdrop" style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      backgroundColor: 'rgba(0, 0, 0, 0.5)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      zIndex: 1050 
    }}>
      <div className="modal" style={{ 
        backgroundColor: 'white', 
        borderRadius: '8px', 
        maxWidth: '500px', 
        width: '90%', 
        padding: '20px' 
      }}>
        <div className="modal-header" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          marginBottom: '15px' 
        }}>
          <FaExclamationTriangle style={{ color: '#f0ad4e', marginRight: '10px' }} />
          <h2 className="modal-title" style={{ margin: 0 }}>세션 만료 경고</h2>
        </div>
        
        <div className="modal-body" style={{ marginBottom: '20px' }}>
          <p>
            장시간 활동이 없어 <strong>{Math.floor(countdown / 60)}분 {countdown % 60}초</strong> 후에 자동으로 로그아웃됩니다.
          </p>
          <p>계속 사용하시겠습니까?</p>
        </div>
        
        <div className="modal-footer" style={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          gap: '10px' 
        }}>
          <button
            onClick={handleLogout}
            style={{ 
              padding: '8px 16px', 
              backgroundColor: '#6c757d', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: 'pointer' 
            }}
          >
            로그아웃
          </button>
          <button
            onClick={handleContinue}
            style={{ 
              padding: '8px 16px', 
              backgroundColor: '#007bff', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: 'pointer' 
            }}
          >
            계속 사용하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionTimeoutModal;