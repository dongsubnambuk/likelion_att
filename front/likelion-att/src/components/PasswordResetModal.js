// PasswordResetModal.js
import React, { useState } from 'react';
import { FaExclamationTriangle, FaCheckCircle, FaEnvelope, FaKey, FaLock } from 'react-icons/fa';
import api from '../services/api';

const PasswordResetModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1); // 1: 학번입력, 2: 인증번호입력, 3: 비밀번호변경
  const [studentId, setStudentId] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 학번 입력 후 인증번호 요청
  const handleSendVerification = async (e) => {
    e.preventDefault();
    
    if (!studentId) {
      setError('학번을 입력해주세요.');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // 인증번호 발송 API 호출
      const response = await api.post('/api/mail/mail-send', {}, {
        params: { id: studentId }
      });
      
      // 응답에서 이메일 정보 추출
      const emailData = response.data.email;
      setEmail(emailData);
      
      // 인증번호 입력 단계로 이동
      setStep(2);
      setSuccess(`${emailData}로 인증번호가 발송되었습니다.`);
    } catch (err) {
      setError(err.response?.data?.content || '인증번호 발송에 실패했습니다. 학번을 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  // 인증번호 확인
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    
    if (!verificationCode) {
      setError('인증번호를 입력해주세요.');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // 인증번호 확인 API 호출
      const response = await api.get('/api/mail/mail-check', {
        params: { 
          id: studentId,
          userNumber: verificationCode
        }
      });
      
      // 인증 성공 시 비밀번호 변경 단계로 이동
      setStep(3);
      setSuccess('인증에 성공했습니다. 새 비밀번호를 설정해주세요.');
    } catch (err) {
      setError(err.response?.data?.content || '인증번호가 일치하지 않습니다. 다시 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  // 비밀번호 변경
  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (!newPassword) {
      setError('새 비밀번호를 입력해주세요.');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // 비밀번호 변경 API 호출
      const response = await api.put('/api/auth', {}, {
        params: { 
          id: studentId,
          password: newPassword
        }
      });
      
      // 변경 성공 메시지 표시 후 모달 닫기
      setSuccess('비밀번호가 성공적으로 변경되었습니다. 새 비밀번호로 로그인해주세요.');
      
      // 3초 후 모달 닫기
      setTimeout(() => {
        resetForm();
        onClose();
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.content || '비밀번호 변경에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  // 폼 초기화
  const resetForm = () => {
    setStep(1);
    setStudentId('');
    setVerificationCode('');
    setNewPassword('');
    setConfirmPassword('');
    setEmail('');
    setError('');
    setSuccess('');
  };

  // 모달 닫기시 폼 초기화
  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">비밀번호 찾기</h2>
          <button className="modal-close" onClick={handleClose}>&times;</button>
        </div>

        <div className="modal-body">
          {error && (
            <div className="alert alert-error">
              <FaExclamationTriangle />
              <span>{error}</span>
            </div>
          )}
          
          {success && (
            <div className="alert alert-success">
              <FaCheckCircle />
              <span>{success}</span>
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleSendVerification}>
              <div className="form-group">
                <label htmlFor="studentId" className="form-label">학번</label>
                <div className="search-container" style={{ marginBottom: '0' }}>
                  <input
                    type="text"
                    id="studentId"
                    className="search-input"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="학번을 입력하세요"
                    disabled={loading}
                  />
                  <div className="search-button">
                    <FaKey />
                  </div>
                </div>
                <p className="form-text" style={{ fontSize: '0.85rem', color: '#666', marginTop: '8px' }}>
                  가입 시 등록한 이메일로 인증번호가 발송됩니다.
                </p>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleClose}
                  disabled={loading}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? '처리 중...' : '인증번호 발송'}
                </button>
              </div>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyCode}>
              <div className="form-group">
                <label htmlFor="verificationCode" className="form-label">인증번호</label>
                <div className="search-container" style={{ marginBottom: '0' }}>
                  <input
                    type="text"
                    id="verificationCode"
                    className="search-input"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="인증번호를 입력하세요"
                    disabled={loading}
                  />
                  <div className="search-button">
                    <FaEnvelope />
                  </div>
                </div>
                <p className="form-text" style={{ fontSize: '0.85rem', color: '#666', marginTop: '8px' }}>
                  {email && `${email}로 발송된 인증번호를 입력해주세요.`}
                </p>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setStep(1)}
                  disabled={loading}
                >
                  이전
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? '처리 중...' : '인증하기'}
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label htmlFor="newPassword" className="form-label">새 비밀번호</label>
                <div className="search-container" style={{ marginBottom: '0' }}>
                  <input
                    type="password"
                    id="newPassword"
                    className="search-input"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="새 비밀번호를 입력하세요"
                    disabled={loading}
                  />
                  <div className="search-button">
                    <FaLock />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">비밀번호 확인</label>
                <div className="search-container" style={{ marginBottom: '0' }}>
                  <input
                    type="password"
                    id="confirmPassword"
                    className="search-input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="비밀번호를 다시 입력하세요"
                    disabled={loading}
                  />
                  <div className="search-button">
                    <FaLock />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setStep(2)}
                  disabled={loading}
                >
                  이전
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? '처리 중...' : '비밀번호 변경'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default PasswordResetModal;