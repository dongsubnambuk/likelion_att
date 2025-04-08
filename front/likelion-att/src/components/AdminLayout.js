// src/components/AdminLayout.js
import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  FaUserFriends, 
  FaCalendarAlt, 
  FaChartBar, 
  FaUsers, 
  FaSignOutAlt, 
  FaBars, 
  FaTimes, 
  FaTachometerAlt,
  FaBook 
} from 'react-icons/fa';
import './Layout.css';

const AdminLayout = () => {
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
          <h2>멋사 출석체크</h2>
          <div className="user-info">
            <p>{currentUser?.name || '관리자'}</p>
            <span className="user-role">{currentUser?.role === 'ADMIN' ? '운영진' : '사용자'}</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''} end onClick={closeMobileMenu}>
            <FaTachometerAlt /> 대시보드
          </NavLink>
          <NavLink to="/reports" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMobileMenu}>
            <FaChartBar /> 출석 통계
          </NavLink>
          <NavLink to="/teams" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMobileMenu}>
            <FaUserFriends /> 팀 관리
          </NavLink>
          <NavLink to="/members" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMobileMenu}>
            <FaUsers /> 부원 관리
          </NavLink>
          <NavLink to="/schedules" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMobileMenu}>
            <FaCalendarAlt /> 스케줄 관리
          </NavLink>
          <NavLink to="/documents" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMobileMenu}>
            <FaBook /> 교육자료 업로드
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

export default AdminLayout;