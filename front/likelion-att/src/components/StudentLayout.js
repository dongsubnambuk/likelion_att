// src/components/StudentLayout.js
import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaUserFriends, FaCalendarAlt, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';
import './Layout.css';

const StudentLayout = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
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
          <h2>동아리 출석체크</h2>
          <div className="user-info">
            <p>{currentUser?.name || '사용자'}</p>
            <span className="user-role">{currentUser?.role === 'STUDENT' ? '학생' : '사용자'}</span>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <NavLink to="/student/teams" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMobileMenu}>
            <FaUserFriends /> 전체 팀 조회
          </NavLink>
          <NavLink to="/student/schedules" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMobileMenu}>
            <FaCalendarAlt /> 전체 스케줄 조회
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
    </div>
  );
};

export default StudentLayout;