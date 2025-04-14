// src/contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import api from '../services/api';

const AuthContext = createContext();

// 자동 로그아웃 시간 설정 (밀리초 단위)
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30분

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const inactivityTimerRef = useRef(null);

  // 활동 감지 시 타이머 재설정
  const resetInactivityTimer = () => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    // 로그인된 상태일 때만 자동 로그아웃 타이머 설정
    if (localStorage.getItem('token')) {
      inactivityTimerRef.current = setTimeout(() => {
        // 자동 로그아웃 실행
        logout();
        alert('장시간 활동이 없어 자동 로그아웃되었습니다.');
        window.location.href = '/login';
      }, INACTIVITY_TIMEOUT);
    }
  };

  // 사용자 활동 감지 이벤트 리스너 설정
  const setupActivityListeners = () => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    events.forEach(event => {
      document.addEventListener(event, resetInactivityTimer, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, resetInactivityTimer, true);
      });
    };
  };

  // 로컬 스토리지에서 토큰 불러오기 및 자동 로그아웃 설정
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      setCurrentUser(JSON.parse(user));
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // 초기 로그인 상태에서 타이머 설정
      resetInactivityTimer();
    }
    
    setLoading(false);
    
    // 활동 감지 이벤트 리스너 설정
    const cleanupListeners = setupActivityListeners();
    
    // 컴포넌트 언마운트 시 타이머와 이벤트 리스너 정리
    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      cleanupListeners();
    };
  }, []);

  // 로그인 함수 - API 형식에 맞게 수정
  const login = async (username, password) => {
    try {
      setError('');
      // 쿼리 파라미터 방식으로 로그인 요청
      const response = await api.post(`/api/auth/signin?id=${username}&password=${password}`);
      
      // 응답 구조에 맞게 토큰과 사용자 정보 추출
      const { id, name, phone, role, track, email, token } = response.data;
      
      const user = { id, name, phone, role, track, email };
      console.log('로그인 성공:', user);
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setCurrentUser(user);
      
      // 로그인 후 자동 로그아웃 타이머 설정
      resetInactivityTimer();
      
      return user;
    } catch (err) {
      // console.error('로그인 실패:', err);
      setError('로그인 실패. 아이디와 비밀번호를 확인하세요.');
      throw err;
    }
  };

  // 로그아웃 함수
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setCurrentUser(null);
    
    // 로그아웃 시 타이머 정리
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
  };

  const value = {
    currentUser,
    setCurrentUser,
    login,
    logout,
    error,
    resetInactivityTimer // 필요시 타이머 재설정할 수 있도록 export
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}