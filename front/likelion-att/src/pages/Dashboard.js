// src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaUserFriends, FaChartBar, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { attendanceApi, teamApi, scheduleApi, userApi } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalTeams: 0,
    totalSchedules: 0,
    averageAttendance: 0,
  });
  const [recentTeams, setRecentTeams] = useState([]);
  const [upcomingSchedules, setUpcomingSchedules] = useState([]);
  const [teamAttendance, setTeamAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // 부원 정보 가져오기 - Members.js와 동일한 방식 사용
        const usersResponse = await userApi.getAll();
        const userData = usersResponse.data;
        
        // 부원 수 계산 - admin과 users 배열의 길이 합산
        const adminCount = userData.admin ? userData.admin.length : 0;
        const userCount = userData.users ? userData.users.length : 0;
        const totalMembers = adminCount + userCount;
        
        // 팀 정보 가져오기
        const teamsResponse = await teamApi.getAll();
        const teams = teamsResponse.data;
        
        // 팀 수 계산 - teams가 객체인 경우 Object.keys()로 키 개수 계산
        const totalTeams = typeof teams === 'object' && !Array.isArray(teams) 
          ? Object.keys(teams).length 
          : (Array.isArray(teams) ? teams.length : 0);
        
        // teams 데이터 가공 (객체 또는 배열 형태에 따라 다르게 처리)
        let processedTeams = [];
        if (typeof teams === 'object' && !Array.isArray(teams)) {
          // teams가 객체인 경우 (키가 팀 ID)
          processedTeams = Object.entries(teams).map(([id, members]) => ({
            id,
            name: `팀 ${id}`,
            memberCount: Array.isArray(members) ? members.length : 0,
            createdAt: new Date().toISOString() // 실제 API에 생성일이 없는 경우 현재 날짜 사용
          }));
        } else if (Array.isArray(teams)) {
          // teams가 배열인 경우
          processedTeams = teams.map(team => ({
            id: team.id,
            name: team.name,
            memberCount: team.members ? team.members.length : 0,
            createdAt: team.createdAt || new Date().toISOString()
          }));
        }
        
        // 최근 등록된 팀 5개 설정
        setRecentTeams(processedTeams.slice(0, 5));
        
        // 스케줄 정보 가져오기
        const schedulesResponse = await scheduleApi.getAll();
        const schedules = schedulesResponse.data || [];
        
        // 현재 날짜 이후의 스케줄만 필터링
        const today = new Date();
        const upcoming = Array.isArray(schedules) 
          ? schedules
              .filter(schedule => new Date(schedule.date) >= today)
              .sort((a, b) => new Date(a.date) - new Date(b.date))
              .slice(0, 5)
          : [];
        
        setUpcomingSchedules(upcoming);

        // 통계 정보 설정
        setStats({
          totalMembers: totalMembers,
          totalTeams: totalTeams,
          totalSchedules: Array.isArray(schedules) ? schedules.length : 0,
          averageAttendance: 78.5, // 예시 데이터, 실제로는 API에서 가져와야 함
        });

        // 팀별 출석률 데이터 생성
        const teamAttendanceData = processedTeams.slice(0, 6).map(team => ({
          name: team.name,
          attendance: Math.floor(Math.random() * 30) + 70, // 70-100% 범위의 임의 데이터
        }));
        setTeamAttendance(teamAttendanceData);

      } catch (error) {
        console.error('대시보드 데이터 로딩 실패:', error);
        // 에러 발생 시 기본값 설정
        setStats({
          totalMembers: 0,
          totalTeams: 0,
          totalSchedules: 0,
          averageAttendance: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    return new Date(dateString).toLocaleDateString('ko-KR', options);
  };

  if (loading) {
    return <div className="loading">로딩 중...</div>;
  }

  return (
    <div>
      <h1>대시보드</h1>
      
      {/* 통계 카드 */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-title">총 부원 수</div>
          <div className="stat-value">{stats.totalMembers}</div>
          <div className="stat-change positive">
            <FaArrowUp />
            <span>5명 증가</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-title">총 팀 수</div>
          <div className="stat-value">{stats.totalTeams}</div>
          <div className="stat-change">
            <span>변동 없음</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-title">총 스케줄 수</div>
          <div className="stat-value">{stats.totalSchedules}</div>
          <div className="stat-change positive">
            <FaArrowUp />
            <span>2개 증가</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-title">평균 출석률</div>
          <div className="stat-value">{stats.averageAttendance}%</div>
          <div className="stat-change negative">
            <FaArrowDown />
            <span>2.5% 감소</span>
          </div>
        </div>
      </div>
      
      {/* 팀별 출석률 차트 */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">팀별 출석률</h2>
          <Link to="/reports" className="btn btn-primary btn-sm">
            <FaChartBar /> 상세 보기
          </Link>
        </div>
        
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <BarChart
              data={teamAttendance}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip formatter={(value) => `${value}%`} />
              <Legend />
              <Bar dataKey="attendance" name="출석률" fill="#3498db" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
        {/* 최근 등록된 팀 */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">최근 등록된 팀</h2>
            <Link to="/teams" className="btn btn-primary btn-sm">
              <FaUserFriends /> 전체 보기
            </Link>
          </div>
          
          {recentTeams.length > 0 ? (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>팀 이름</th>
                    <th>인원</th>
                    <th>생성일</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTeams.map((team) => (
                    <tr key={team.id}>
                      <td>
                        <Link to={`/teams/${team.id}`}>{team.name}</Link>
                      </td>
                      <td>{team.memberCount || '0'}명</td>
                      <td>{new Date(team.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="no-data">등록된 팀이 없습니다.</p>
          )}
        </div>
        
        {/* 다가오는 스케줄 */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">다가오는 스케줄</h2>
            <Link to="/schedules" className="btn btn-primary btn-sm">
              <FaCalendarAlt /> 전체 보기
            </Link>
          </div>
          
          {upcomingSchedules.length > 0 ? (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>제목</th>
                    <th>날짜</th>
                    <th>팀</th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingSchedules.map((schedule) => (
                    <tr key={schedule.id}>
                      <td>
                        <Link to={`/schedules/${schedule.id}`}>{schedule.title}</Link>
                      </td>
                      <td>{formatDate(schedule.date)}</td>
                      <td>{schedule.teamName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="no-data">다가오는 스케줄이 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;