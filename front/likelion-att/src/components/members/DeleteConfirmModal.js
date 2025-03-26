// src/components/members/DeleteConfirmModal.js
import React from 'react';
import { FaExclamationTriangle, FaTrash } from 'react-icons/fa';

/**
 * 부원 삭제 확인 모달 컴포넌트
 */
const DeleteConfirmModal = ({ isOpen, member, onClose, onConfirm }) => {
  if (!isOpen || !member) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">부원 삭제</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        
        <div className="modal-body">
          <div className="alert alert-warning">
            <FaExclamationTriangle />
            <span>이 작업은 되돌릴 수 없습니다.</span>
          </div>
          <p>
            <strong>{member.name} ({member.studentId})</strong> 부원을 삭제하시겠습니까?<br />
            해당 부원의 모든 출석 기록과 평가 정보가 함께 삭제됩니다.
          </p>
        </div>
        
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            취소
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => onConfirm(member.studentId)}
          >
            <FaTrash /> 삭제하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;