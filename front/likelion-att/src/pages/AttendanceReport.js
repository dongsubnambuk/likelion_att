// src/pages/AttendanceReport.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaChartBar, FaCalendarAlt, FaUserFriends, FaDownload, FaSearch, FaUser } from 'react-icons/fa';
import { teamApi, scheduleApi, attendanceApi } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const AttendanceReport = () => {
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [overallStats, setOverallStats] = useState(null);
  const [teamStats, setTeamStats] = useState([]);
  const [memberStats, setMemberStats] = useState([]);
  const [scheduleStats, setScheduleStats] = useState([]);

  // 데이터 불러오기
  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        
        // 팀 목록 가져오기
        const teamsResponse = await teamApi.getAll();
        setTeams(teamsResponse.data);
        
        // 리포트 데이터 가져오기 (임시 데이터)
        // 실제로는 API 호출을 통해 데이터를 가져와야 함
        setOverallStats({
          totalMembers: 120,
          totalSchedules: 45,
          attendanceRate: 78.5,
          presentRate: 68.2,
          lateRate: 10.3,
          absentRate: 21.5,
          averageRating: 3.8
        });
        
        // 팀별 통계 (임시 데이터)
        const teamStatsData = teamsResponse.data.map(team => ({
          id: team.id,
          name: team.name,
          attendanceRate: Math.floor(Math.random() * 30) + 70,
          memberCount: Math.floor(Math.random() * 20) + 5,
          scheduleCount: Math.floor(Math.random() * 10) + 5,
          rating: (Math.random() * 2) + 3
        }));
        setTeamStats(teamStatsData);
        
        // 부원별 통계 (임시 데이터)
        const memberStatsData = [];
        for (let i = 0; i < 20; i++) {
          memberStatsData.push({
            id: i + 1,
            name: `부원 ${i + 1}`,
            studentId: `2023${1000 + i}`,
            teamName: `팀 ${(i % 4) + 1}`,
            attendanceRate: Math.floor(Math.random() * 30) + 70,
            presentCount: Math.floor(Math.random() * 10) + 5,
            lateCount: Math.floor(Math.random() * 3),
            absentCount: Math.floor(Math.random() * 3),
            rating: (Math.random() * 2) + 3
          });
        }
        setMemberStats(memberStatsData);
        
        // 스케줄별 통계 (임시 데이터)
        const scheduleStatsData = [];
        for (let i = 0; i < 10; i++) {
          const date = new Date();
          date.setDate(date.getDate() - i * 7);
          
          scheduleStatsData.push({
            id: i + 1,
            title: `스케줄 ${i + 1}`,
            date: date.toISOString().split('T')[0],
            teamName: `팀 ${(i % 4) + 1}`,
            attendanceRate: Math.floor(Math.random() * 30) + 70,
            presentCount: Math.floor(Math.random() * 15) + 10,
            lateCount: Math.floor(Math.random() * 5),
            absentCount: Math.floor(Math.random() * 5),
            totalMembers: Math.floor(Math.random() * 10) + 15
          });
        }
        setScheduleStats(scheduleStatsData.sort((a, b) => new Date(b.date) - new Date(a.date)));
        
      } catch (error) {
        console.error('리포트 데이터 로딩 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, []);

  // 필터링된 데이터 가져오기
  const handleFilter = () => {
    // 실제로는 선택된 필터 조건에 따라 API 호출을 통해 데이터를 다시 가져와야 함
    console.log('필터 적용:', { selectedTeam, startDate, endDate });
  };

  // 리포트 다운로드
  const handleDownload = () => {
    // 실제로는 서버에서 엑셀 파일 등으로 다운로드 구현
    alert('출석 리포트가 다운로드됩니다.');
  };

  // 출석 상태 분포 데이터
  const statusDistributionData = [
    { name: '출석', value: overallStats?.presentRate || 0, color: '#219653' },
    { name: '지각', value: overallStats?.lateRate || 0, color: '#f2994a' },
    { name: '결석', value: overallStats?.absentRate || 0, color: '#eb5757' }
  ];

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('ko-KR', options);
  };

  if (loading) {
    return <div className="loading">로딩 중...</div>;
  }

  return (
    <div>
      <div className="card-header">
        <h1>출석 통계 리포트</h1>
        <button className="btn btn-primary" onClick={handleDownload}>
          <FaDownload /> 리포트 다운로드
        </button>
      </div>

      {/* 필터 섹션 */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <h2>조회 필터</h2>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', margin: '15px 0' }}>
          <div className="form-group" style={{ minWidth: '200px', flex: 1 }}>
            <label htmlFor="team-select" className="form-label">팀 선택</label>
            <select
              id="team-select"
              className="form-control"
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
            >
              <option value="all">전체 팀</option>
              {teams.map(team => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group" style={{ flex: 1 }}>
            <label htmlFor="start-date" className="form-label">시작 날짜</label>
            <input
              type="date"
              id="start-date"
              className="form-control"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          
          <div className="form-group" style={{ flex: 1 }}>
            <label htmlFor="end-date" className="form-label">종료 날짜</label>
            <input
              type="date"
              id="end-date"
              className="form-control"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          
          <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button className="btn btn-primary" onClick={handleFilter}>
              <FaSearch /> 조회
            </button>
          </div>
        </div>
      </div>

      {/* 전체 통계 카드 */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-header">
          <h2>전체 출석 현황</h2>
        </div>
        <div style={{ padding: '15px' }}>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-title">전체 출석률</div>
              <div className="stat-value">{overallStats?.attendanceRate}%</div>
              <div className="stat-change">
                총 {overallStats?.totalSchedules}개 스케줄
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-title">총 부원 수</div>
              <div className="stat-value">{overallStats?.totalMembers}</div>
              <div className="stat-change">
                {teams.length}개 팀
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-title">출석</div>
              <div className="stat-value">{overallStats?.presentRate}%</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-title">지각</div>
              <div className="stat-value">{overallStats?.lateRate}%</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-title">결석</div>
              <div className="stat-value">{overallStats?.absentRate}%</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-title">평균 평가</div>
              <div className="stat-value">{overallStats?.averageRating.toFixed(1)}</div>
            </div>
          </div>

          {/* 출석 상태 분포 차트 */}
          <div style={{ marginTop: '30px', width: '100%', height: 300 }}>
            <h3 style={{ marginBottom: '15px', textAlign: 'center' }}>출석 상태 분포</h3>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={statusDistributionData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  labelLine={true}
                  label={({ name, value }) => `${name} ${value.toFixed(1)}%`}
                >
                  {statusDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 팀별 통계 카드 */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-header">
          <h2>팀별 출석률</h2>
          <Link to="/teams" className="btn btn-primary btn-sm">
            <FaUserFriends /> 팀 관리
          </Link>
        </div>
        <div style={{ padding: '15px' }}>
          {/* 팀별 출석률 차트 */}
          <div style={{ width: '100%', height: 300, marginBottom: '20px' }}>
            <ResponsiveContainer>
              <BarChart
                data={teamStats}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value, name) => [`${value}%`, '출석률']} />
                <Legend />
                <Bar dataKey="attendanceRate" name="출석률" fill="#3498db" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 팀별 통계 테이블 */}
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>팀명</th>
                  <th>인원 수</th>
                  <th>스케줄 수</th>
                  <th>출석률</th>
                  <th>평균 평가</th>
                </tr>
              </thead>
              <tbody>
                {teamStats.map((team) => (
                  <tr key={team.id}>
                    <td>
                      <Link to={`/teams/${team.id}`}>{team.name}</Link>
                    </td>
                    <td>{team.memberCount}명</td>
                    <td>{team.scheduleCount}개</td>
                    <td>{team.attendanceRate}%</td>
                    <td>{team.rating.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 스케줄별 통계 카드 */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-header">
          <h2>스케줄별 출석 현황</h2>
          <Link to="/schedules" className="btn btn-primary btn-sm">
            <FaCalendarAlt /> 스케줄 관리
          </Link>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>날짜</th>
                <th>스케줄명</th>
                <th>팀</th>
                <th>출석</th>
                <th>지각</th>
                <th>결석</th>
                <th>출석률</th>
              </tr>
            </thead>
            <tbody>
              {scheduleStats.map((schedule) => (
                <tr key={schedule.id}>
                  <td>{formatDate(schedule.date)}</td>
                  <td>
                    <Link to={`/schedules/${schedule.id}`}>{schedule.title}</Link>
                  </td>
                  <td>{schedule.teamName}</td>
                  <td>{schedule.presentCount}명</td>
                  <td>{schedule.lateCount}명</td>
                  <td>{schedule.absentCount}명</td>
                  <td>{schedule.attendanceRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 부원별 통계 카드 */}
      <div className="card">
        <div className="card-header">
          <h2>부원별 출석 현황</h2>
          <Link to="/members" className="btn btn-primary btn-sm">
            <FaUser /> 부원 관리
          </Link>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>이름</th>
                <th>학번</th>
                <th>팀</th>
                <th>출석</th>
                <th>지각</th>
                <th>결석</th>
                <th>출석률</th>
                <th>평가</th>
              </tr>
            </thead>
            <tbody>
              {memberStats.map((member) => (
                <tr key={member.id}>
                  <td>
                    <Link to={`/members/${member.id}`}>{member.name}</Link>
                  </td>
                  <td>{member.studentId}</td>
                  <td>{member.teamName}</td>
                  <td>{member.presentCount}회</td>
                  <td>{member.lateCount}회</td>
                  <td>{member.absentCount}회</td>
                  <td>{member.attendanceRate}%</td>
                  <td>{member.rating.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendanceReport;