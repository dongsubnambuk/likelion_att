// src/pages/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaUserCircle, FaLock, FaExclamationTriangle, FaCheckCircle, FaUserPlus } from 'react-icons/fa';
import api from '../services/api';

// 회원가입 모달 컴포넌트
const SignupModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    password: '',
    confirmPassword: '',
    role: 'STUDENT' // 기본값 STUDENT
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 유효성 검사
    if (!formData.id || !formData.name || !formData.password) {
      setError('모든 필수 항목을 입력해주세요.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // API 호출 - 수정된 API 경로 사용
      const response = await api.post('/api/auth', {
        id: Number(formData.id),
        name: formData.name,
        password: formData.password,
        role: formData.role
      });
      
      
      if (response.data && response.data.content) {
        onSuccess(response.data.content);
      } else {
        throw new Error('회원가입 응답이 올바르지 않습니다.');
      }
    } catch (err) {
      console.error('회원가입 오류:', err);
      setError(err.response?.data?.content || '회원가입에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">회원가입</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div className="alert alert-error">
                <FaExclamationTriangle />
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="id" className="form-label">학번/사번 *</label>
              <input
                type="text"
                id="id"
                name="id"
                className="form-control"
                value={formData.id}
                onChange={handleChange}
                placeholder="학번 또는 사번을 입력하세요"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="name" className="form-label">이름 *</label>
              <input
                type="text"
                id="name"
                name="name"
                className="form-control"
                value={formData.name}
                onChange={handleChange}
                placeholder="이름을 입력하세요"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">비밀번호 *</label>
              <input
                type="password"
                id="password"
                name="password"
                className="form-control"
                value={formData.password}
                onChange={handleChange}
                placeholder="비밀번호를 입력하세요"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">비밀번호 확인 *</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                className="form-control"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="비밀번호를 다시 입력하세요"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="role" className="form-label">권한</label>
              <select
                id="role"
                name="role"
                className="form-control"
                value={formData.role}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="STUDENT">학생</option>
                <option value="ADMIN">운영진</option>
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              취소
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? '처리 중...' : '가입하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const { login, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username || !password) {
      setErrorMessage('아이디와 비밀번호를 모두 입력해주세요.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      // 쿼리 파라미터 방식으로 변경
      const user = await login(username, password);
      
      // 사용자 역할에 따라 다른 페이지로 리디렉션
      if (user.role === 'ADMIN') {
        navigate('/');
      } else if (user.role === 'STUDENT') {
        navigate('/student');
      } else {
        // 역할이 지정되지 않았거나 다른 역할의 경우 기본 경로로 리디렉션
        navigate('/');
      }
    } catch (err) {
      console.error('로그인 실패:', err);
      setErrorMessage(error || '로그인에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSuccess = (name) => {
    setIsSignupModalOpen(false);
    setSuccessMessage(`${name}님, 회원가입이 완료되었습니다. 로그인해주세요.`);
    
    // 5초 후 성공 메시지 제거
    setTimeout(() => {
      setSuccessMessage('');
    }, 5000);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">동아리 출석체크 시스템</h1>
          {/* <p className="login-subtitle">로그인</p> */}
        </div>

        {errorMessage && (
          <div className="alert alert-error">
            <FaExclamationTriangle />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="alert alert-success">
            <FaCheckCircle />
            <span>{successMessage}</span>
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username" className="form-label">아이디</label>
            <div className="search-container">
              <input
                type="text"
                id="username"
                className="search-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="학번 또는 사번을 입력하세요"
                disabled={loading}
              />
              <div className="search-button">
                <FaUserCircle />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">비밀번호</label>
            <div className="search-container">
              <input
                type="password"
                id="password"
                className="search-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                disabled={loading}
              />
              <div className="search-button">
                <FaLock />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary login-button"
            disabled={loading}
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
          
          <div className="login-options" style={{ marginTop: '20px', textAlign: 'center' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsSignupModalOpen(true)}
              style={{ width: '100%' }}
            >
              <FaUserPlus style={{ marginRight: '8px' }} /> 회원가입
            </button>
          </div>
        </form>
      </div>

      {/* 회원가입 모달 */}
      <SignupModal
        isOpen={isSignupModalOpen}
        onClose={() => setIsSignupModalOpen(false)}
        onSuccess={handleSignupSuccess}
      />
    </div>
  );
};

export default Login;