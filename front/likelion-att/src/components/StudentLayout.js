// src/components/StudentLayout.js
import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaUserFriends, FaCalendarAlt, FaSignOutAlt, FaBars, FaTimes, FaUserCog, FaBook, FaUserMinus } from 'react-icons/fa';
import './Layout.css';
import DeleteAccountModal from './common/DeleteAccountModal'; // 모달 컴포넌트 import
import { userApi } from '../services/api'; // userApi import

const StudentLayout = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handleLogout = () => {
    // 사용자에게 확인 메시지 표시
    const isConfirmed = window.confirm('로그아웃 하시겠습니까?');

    // 사용자가 취소를 누른 경우 함수 종료
    if (!isConfirmed) {
      return;
    }
    logout();
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };
  
  // 탈퇴 모달 열기
  const openDeleteModal = () => {
    setIsDeleteModalOpen(true);
  };
  
  // 탈퇴 모달 닫기
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeleteError('');
  };
  
  // 회원 탈퇴 처리
  const handleDeleteAccount = async (password) => {
    try {
      await userApi.deleteAccount(currentUser.id, password);
      
      // 탈퇴 성공 후 로그아웃 처리
      logout();
      navigate('/login');
      alert('정상적으로 탈퇴되었습니다.');
    } catch (error) {
      alert('회원 탈퇴 실패. 비밀번호를 확인해주세요.');
      setDeleteError('회원 탈퇴에 실패했습니다. 비밀번호를 확인해주세요.');
    }
  };

  return (
    <div className="app-container">
      {/* 모바일 메뉴 토글 버튼 */}
      <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
        {mobileMenuOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* 사이드바 */}
      <div className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <h2>멋사 출석체크</h2>
          <div className="user-info">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p>{currentUser?.name || '사용자'}</p>
              <button 
                onClick={openDeleteModal}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: '#e74c3c', 
                  cursor: 'pointer', 
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <FaUserMinus /> 탈퇴
              </button>
            </div>
            <span className="user-role">{currentUser?.role === 'STUDENT' ? '아기사자' : '사용자'}</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/student/teams" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMobileMenu}>
            <FaUserFriends /> 전체 팀 조회
          </NavLink>
          <NavLink to="/student/schedules" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMobileMenu}>
            <FaCalendarAlt /> 전체 스케줄 조회
          </NavLink>
          <NavLink to="/student/documents" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMobileMenu}>
            <FaBook /> 교육자료 확인
          </NavLink>
          <NavLink to="/student/developers" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMobileMenu}>
            <FaUserCog /> 운영진 정보
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-button" onClick={handleLogout}>
            <FaSignOutAlt /> 로그아웃
          </button>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <main className="main-content">
        <Outlet />
      </main>
      
      {/* 회원 탈퇴 모달 */}
      <DeleteAccountModal 
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteAccount}
      />
    </div>
  );
};

export default StudentLayout;