// src/pages/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaUserCircle, FaLock, FaExclamationTriangle, FaCheckCircle, FaUserPlus, FaKey } from 'react-icons/fa';
import api from '../services/api';
import PasswordResetModal from '../components/PasswordResetModal'; // 비밀번호 찾기 모달 import
import Footer from '../components/Footer';

// 회원가입 모달 컴포넌트
const SignupModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    track: 'EduFront',
    role: 'STUDENT'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 트랙 옵션
  const trackOptions = [
    { value: 'EduFront', label: '교육 프론트엔드' },
    { value: 'EduBack', label: '교육 백엔드' },
    { value: 'ProFront', label: '프로젝트 프론트엔드' },
    { value: 'ProBack', label: '프로젝트 백엔드' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;

    // 전화번호 입력 시 숫자만 입력될 수 있도록 처리
    if (name === 'phone') {
      // 숫자만 허용
      const onlyNums = value.replace(/[^0-9]/g, '');
      // 11자리로 제한
      const truncated = onlyNums.slice(0, 11);
      setFormData({ ...formData, [name]: truncated });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 유효성 검사
    if (!formData.id || !formData.name || !formData.password || !formData.phone || !formData.email) {
      setError('모든 필수 항목을 입력해주세요.');
      return;
    }

    // 이메일 형식 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('올바른 이메일 형식을 입력해주세요.');
      return;
    }

    // 전화번호가 정확히 11자리인지 검사
    if (formData.phone.length !== 11) {
      setError('전화번호는 정확히 11자리여야 합니다.');
      return;
    }

    // 비밀번호 일치 여부 검사
    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/api/auth', {
        id: Number(formData.id),
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        track: formData.track,
        role: formData.role
      });

      if (response.data && response.data.content) {
        onSuccess(response.data.content);
      } else {
        throw new Error('회원가입 응답이 올바르지 않습니다.');
      }
    } catch (err) {
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
              <label htmlFor="id" className="form-label">학번 *</label>
              <input
                type="text"
                id="id"
                name="id"
                className="form-control"
                value={formData.id}
                onChange={handleChange}
                placeholder="학번을 입력하세요"
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
              <label htmlFor="email" className="form-label">이메일 *</label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-control"
                value={formData.email}
                onChange={handleChange}
                placeholder="이메일을 입력하세요"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone" className="form-label">전화번호 *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                className="form-control"
                value={formData.phone}
                onChange={handleChange}
                placeholder="숫자만 입력하세요 (11자리)"
                disabled={loading}
                maxLength={11}
                pattern="[0-9]{11}"
              />
              <small className="form-text text-muted">예: 01012345678 (- 없이 숫자만 입력)</small>
            </div>

            <div className="form-group">
              <label htmlFor="track" className="form-label">트랙 *</label>
              <select
                id="track"
                name="track"
                className="form-control"
                value={formData.track}
                onChange={handleChange}
                disabled={loading}
              >
                {trackOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
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
  const [isPasswordResetModalOpen, setIsPasswordResetModalOpen] = useState(false); // 비밀번호 찾기 모달 상태
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
    <div>
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1 className="login-title">계명대학교<br />멋쟁이사자처럼</h1>
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
              <label htmlFor="username" className="form-label">학번</label>
              <div className="search-container">
                <input
                  type="text"
                  id="username"
                  className="search-input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="학번을 입력하세요"
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

            {/* 비밀번호 찾기 버튼 */}
            <button
              type="button"
              onClick={() => setIsPasswordResetModalOpen(true)}
              style={{
                background: 'none',
                border: 'none',
                color: '#666',
                cursor: 'pointer',
                fontSize: '0.85rem',
                marginBottom: '15px',
                display: 'flex',
                alignItems: 'center',
                marginLeft: 'auto'
              }}
            >
              <FaKey style={{ fontSize: '0.75rem', marginRight: '5px' }} />
              비밀번호 변경
            </button>

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

        {/* 비밀번호 찾기 모달 */}
        <PasswordResetModal
          isOpen={isPasswordResetModalOpen}
          onClose={() => setIsPasswordResetModalOpen(false)}
        />
      </div>
      <Footer />
    </div>
  );
};

export default Login;