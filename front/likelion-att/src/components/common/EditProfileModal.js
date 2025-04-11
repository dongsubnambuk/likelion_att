// src/components/common/EditProfileModal.js
import React, { useState, useEffect } from 'react';
import { FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import { userApi } from '../../services/api';

const EditProfileModal = ({ isOpen, onClose, user, onSuccess }) => {
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        track: '',
        role: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // 트랙 옵션
    const trackOptions = [
        { value: 'EduFront', label: '교육 프론트엔드' },
        { value: 'EduBack', label: '교육 백엔드' },
        { value: 'ProFront', label: '프로젝트 프론트엔드' },
        { value: 'ProBack', label: '프로젝트 백엔드' }
    ];

    // 사용자 정보가 변경되면 폼 데이터를 업데이트
    useEffect(() => {
        if (user) {
            setFormData({
                id: user.id || user.studentId,
                name: user.name || '',
                email: user.email || '',
                password: '',
                confirmPassword: '',
                phone: user.phone || '',
                track: user.track || 'EduFront',
                role: user.role || 'STUDENT'
            });
        }
    }, [user, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 유효성 검사
        if (!formData.name || !formData.email || !formData.phone) {
            setError('이름, 이메일, 전화번호는 필수 입력 항목입니다.');
            return;
        }

        // 이메일 형식 검사
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('올바른 이메일 형식을 입력해주세요.');
            return;
        }

        // 비밀번호를 변경하는 경우에만 확인
        if (formData.password && formData.password !== formData.confirmPassword) {
            setError('비밀번호가 일치하지 않습니다.');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // 비밀번호가 비어있으면 전송하지 않음
            const userData = {
                ...formData,
                id: Number(formData.id)
            };

            if (!formData.password) {
                delete userData.password;
                delete userData.confirmPassword;
            }

            const response = await userApi.updateUserDetail(userData);

            if (response.data) {
                setSuccess('회원 정보가 성공적으로 수정되었습니다.');

                // 로컬 스토리지에서 현재 사용자 정보 업데이트
                const currentUser = JSON.parse(localStorage.getItem('user'));
                // console.log('currentUser', currentUser);
                const updatedUser = {
                    ...currentUser,
                    name: response.data.name,
                    email: response.data.email,
                    phone: response.data.phone,
                    track: response.data.Track
                };
                localStorage.setItem('user', JSON.stringify(updatedUser));

                setSuccess('');
                onSuccess(updatedUser);
                alert('회원 정보가 수정되었습니다.');
            }
        } catch (err) {
            //   console.error('정보 수정 실패:', err);
            setError(err.response?.data?.content || '정보 수정에 실패했습니다. 다시 시도해주세요.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-backdrop">
            <div className="modal">
                <div className="modal-header">
                    <h2 className="modal-title">회원 정보 수정</h2>
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

                        {success && (
                            <div className="alert alert-success">
                                <FaCheckCircle />
                                <span>{success}</span>
                            </div>
                        )}

                        <div className="form-group">
                            <label htmlFor="id" className="form-label">학번</label>
                            <input
                                type="text"
                                id="id"
                                name="id"
                                className="form-control"
                                value={formData.id}
                                readOnly
                                disabled
                            />
                            <small className="form-text text-muted">학번은 변경할 수 없습니다.</small>
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
                                type="text"
                                id="phone"
                                name="phone"
                                className="form-control"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="전화번호를 입력하세요"
                                disabled={loading}
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
                            <label htmlFor="password" className="form-label">새 비밀번호</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                className="form-control"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="변경할 비밀번호를 입력하세요"
                                disabled={loading}
                            />
                            <small className="form-text text-muted">*비밀번호를 변경하지 않으려면 비워두세요.</small>
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword" className="form-label">비밀번호 확인</label>
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
                            <input
                                type="text"
                                id="role"
                                name="role"
                                className="form-control"
                                value={formData.role === 'ADMIN' ? '운영진' : '아기사자'}
                                readOnly
                                disabled
                            />
                            <small className="form-text text-muted">권한은 변경할 수 없습니다.</small>
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
                            {loading ? '처리 중...' : '정보 수정'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfileModal;