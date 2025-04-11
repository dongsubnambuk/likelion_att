// src/contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 로컬 스토리지에서 토큰 불러오기
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      setCurrentUser(JSON.parse(user));
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    
    setLoading(false);
  }, []);

  // 로그인 함수 - API 형식에 맞게 수정
  const login = async (username, password) => {
    try {
      setError('');
      // 쿼리 파라미터 방식으로 로그인 요청
      const response = await api.post(`/api/auth/signin?id=${username}&password=${password}`);
      
      // 응답 구조에 맞게 토큰과 사용자 정보 추출
      const { id, name, phone, role, Track, email, token } = response.data;
      
      const user = { id, name, phone, role, Track, email };
      // console.log('로그인 성공:', user);
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setCurrentUser(user);
      
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
  };

  const value = {
    currentUser,
    setCurrentUser,
    login,
    logout,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}