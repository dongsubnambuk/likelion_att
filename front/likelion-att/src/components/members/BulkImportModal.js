// src/components/members/BulkImportModal.js
import React, { useState } from 'react';
import { FaExclamationTriangle, FaFileExcel } from 'react-icons/fa';

/**
 * 부원 대량 등록 모달 컴포넌트
 */
const BulkImportModal = ({ isOpen, onClose, onSubmit }) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('파일을 선택해주세요.');
      return;
    }
    
    const validFileTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];
    
    if (!validFileTypes.includes(file.type)) {
      setError('엑셀 또는 CSV 파일만 업로드 가능합니다.');
      return;
    }
    
    onSubmit(file);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">부원 대량 등록</h2>
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
            
            <div style={{ marginBottom: '20px' }}>
              <p>엑셀 또는 CSV 파일을 업로드하여 부원을 대량으로 등록할 수 있습니다.</p>
              <p>
                <strong>파일 형식:</strong> 
                이름, 학번, 전화번호, 트랙, 역할(STUDENT 또는 ADMIN) 순으로 열을 구성해주세요.
                <a href="#">샘플 파일 다운로드</a>
              </p>
            </div>
            
            <div className="form-group">
              <label htmlFor="file-upload" className="form-label">파일 선택</label>
              <input
                type="file"
                id="file-upload"
                className="form-control"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileChange}
              />
            </div>
          </div>
          
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              취소
            </button>
            <button type="submit" className="btn btn-primary">
              <FaFileExcel /> 파일 업로드
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BulkImportModal;