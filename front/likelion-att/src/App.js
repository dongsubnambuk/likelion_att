// src/App.js - 수정된 버전
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Teams from './pages/Teams';
import TeamDetail from './pages/TeamDetail';
import Members from './pages/Members';
import MemberDetail from './pages/MemberDetail';
import Schedules from './pages/Schedules';
import ScheduleDetail from './pages/ScheduleDetail';
import AttendanceReport from './pages/AttendanceReport';
import AdminLayout from './components/AdminLayout';
import StudentLayout from './components/StudentLayout';
import StudentTeams from './pages/student/StudentTeams';
import StudentSchedules from './pages/student/StudentSchedules';
import './App.css';

// 인증된 사용자만 접근 가능한 라우트 컴포넌트
const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// 관리자(ADMIN)만 접근 가능한 라우트 컴포넌트
const AdminRoute = ({ children }) => {
  const { currentUser } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  if (currentUser.role !== 'ADMIN') {
    return <Navigate to="/student" replace />;
  }
  
  return children;
};

// 학생(STUDENT)만 접근 가능한 라우트 컴포넌트
const StudentRoute = ({ children }) => {
  const { currentUser } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  if (currentUser.role !== 'STUDENT') {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* 로그인 페이지 */}
          <Route path="/login" element={<Login />} />
          
          {/* 관리자 라우트 */}
          <Route path="/" element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="teams" element={<Teams />} />
            <Route path="teams/:teamId" element={<TeamDetail />} />
            <Route path="members" element={<Members />} />
            <Route path="members/:memberId" element={<MemberDetail />} />
            <Route path="schedules" element={<Schedules />} />
            <Route path="schedules/:scheduleId" element={<ScheduleDetail />} />
            <Route path="reports" element={<AttendanceReport />} />
          </Route>
          
          {/* 학생 라우트 */}
          <Route path="/student" element={
            <StudentRoute>
              <StudentLayout />
            </StudentRoute>
          }>
            <Route index element={<StudentTeams />} />
            <Route path="teams" element={<StudentTeams />} />
            <Route path="schedules" element={<StudentSchedules />} />
          </Route>
          
          {/* 기본 리디렉션 */}
          <Route path="*" element={
            <ProtectedRoute>
              <Navigate to="/" replace />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;