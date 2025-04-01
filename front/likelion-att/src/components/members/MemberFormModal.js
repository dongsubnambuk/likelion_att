// src/components/members/MemberFormModal.js
import React, { useState, useEffect } from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

/**
 * 부원 생성/수정 모달 컴포넌트
 */
const MemberFormModal = ({ isOpen, member, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    studentId: '',
    phone: '',
    track: 'EduFront',
    role: 'STUDENT'
  });
  const [error, setError] = useState('');

  // 트랙 옵션
  const trackOptions = [
    { value: 'EduFront', label: '교육 프론트엔드' },
    { value: 'EduBack', label: '교육 백엔드' },
    { value: 'ProFront', label: '프로젝트 프론트엔드' },
    { value: 'ProBack', label: '프로젝트 백엔드' }
  ];

  // 역할 옵션
  const roleOptions = [
    { value: 'STUDENT', label: '학생' },
    { value: 'ADMIN', label: '운영진' }
  ];

  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name || '',
        studentId: member.studentId || '',
        phone: member.phone || '',
        track: member.track || 'EduFront',
        role: member.role || 'STUDENT'
      });
    } else {
      setFormData({
        name: '',
        studentId: '',
        phone: '',
        track: 'EduFront',
        role: 'STUDENT'
      });
    }
    setError('');
  }, [member, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.studentId.trim() || !formData.phone.trim()) {
      setError('이름, 학번, 전화번호는 필수 입력사항입니다.');
      return;
    }
    
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{member ? '부원 정보 수정' : '새 부원 등록'}</h2>
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
              <label htmlFor="name" className="form-label">이름 *</label>
              <input
                type="text"
                id="name"
                name="name"
                className="form-control"
                value={formData.name}
                onChange={handleChange}
                placeholder="이름을 입력하세요"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="studentId" className="form-label">학번 *</label>
              <input
                type="text"
                id="studentId"
                name="studentId"
                className="form-control"
                value={formData.studentId}
                onChange={handleChange}
                placeholder="학번을 입력하세요"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="phone" className="form-label">전화번호 *</label>
              <input
                type="text"
                id="phone"
                name="phone"
                className="form-control"
                value={formData.phone}
                onChange={handleChange}
                placeholder="전화번호를 입력하세요"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="track" className="form-label">트랙 *</label>
              <select
                id="track"
                name="track"
                className="form-control"
                value={formData.track}
                onChange={handleChange}
              >
                {trackOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="role" className="form-label">역할</label>
              <select
                id="role"
                name="role"
                className="form-control"
                value={formData.role}
                onChange={handleChange}
              >
                {roleOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              취소
            </button>
            <button type="submit" className="btn btn-primary">
              {member ? '수정하기' : '등록하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MemberFormModal;