// src/components/common/DeleteAccountModal.js
import React, { useState } from 'react';
import { FaUserMinus } from 'react-icons/fa';

const DeleteAccountModal = ({ isOpen, onClose, onConfirm }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!password) {
      setError('비밀번호를 입력해주세요.');
      return;
    }
    
    if (!showConfirmation) {
      // 첫 번째 단계: 확인 메시지 표시
      setShowConfirmation(true);
      return;
    }
    
    // 두 번째 단계: 실제 탈퇴 진행
    onConfirm(password);
  };
  
  const handleCancel = () => {
    // 취소 시 모달 상태 초기화
    setShowConfirmation(false);
    setPassword('');
    setError('');
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-header">
          <h2>회원 탈퇴</h2>
          <button className="modal-close" onClick={handleCancel}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {!showConfirmation ? (
              <>
                <p>회원 탈퇴를 진행하시려면 비밀번호를 입력해주세요.</p>
                <br />
                <div className="form-group">
                  <label htmlFor="password" className="form-label">비밀번호 확인</label>
                  <input
                    type="password"
                    id="password"
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="비밀번호를 입력하세요"
                  />
                  {error && <div className="form-error">{error}</div>}
                </div>
              </>
            ) : (
              <div className="confirmation-message">
                <FaUserMinus size={48} color="#dc3545" className="warning-icon" />
                <p className="warning-text">정말로 탈퇴하시겠습니까?</p>
                <p className="warning-subtext">이 작업은 되돌릴 수 없으며, 모든 계정 데이터가 삭제됩니다.</p>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={handleCancel}>취소</button>
            {!showConfirmation ? (
              <button type="submit" className="btn btn-primary">다음</button>
            ) : (
              <button type="submit" className="btn btn-danger">탈퇴하기</button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeleteAccountModal;