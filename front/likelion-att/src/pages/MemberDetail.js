// src/pages/MemberDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft, FaEdit, FaTrash, FaCalendarAlt, FaStar, FaUser, FaUserFriends } from 'react-icons/fa';
import { userApi, attendanceApi } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const MemberDetail = () => {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [attendanceStats, setAttendanceStats] = useState(null);
  const [recentAttendances, setRecentAttendances] = useState([]);
  const [loading, setLoading] = useState(true);

  // 부원 정보 및 출석 통계 불러오기
  useEffect(() => {
    const fetchMemberData = async () => {
      try {
        setLoading(true);
        
        // 부원 정보 가져오기
        const memberResponse = await userApi.getById(memberId);
        setMember(memberResponse.data);
        
        // 출석 통계 가져오기
        const statsResponse = await attendanceApi.getStats(memberId);
        setAttendanceStats(statsResponse.data);
        
        // 최근 출석 기록 가져오기
        const attendanceResponse = await attendanceApi.getByUser(memberId);
        setRecentAttendances(attendanceResponse.data);
        
      } catch (error) {
        console.error('부원 데이터 로딩 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMemberData();
  }, [memberId]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('ko-KR', options);
  };

  // 출석 상태 컴포넌트
  const AttendanceStatus = ({ status }) => {
    let statusClass = 'status-none';
    let statusText = '미처리';

    switch (status) {
      case 'present':
        statusClass = 'status-present';
        statusText = '출석';
        break;
      case 'late':
        statusClass = 'status-late';
        statusText = '지각';
        break;
      case 'absent':
        statusClass = 'status-absent';
        statusText = '결석';
        break;
      default:
        break;
    }

    return <span className={`attendance-status ${statusClass}`}>{statusText}</span>;
  };

  // 출석 통계 지표 계산 함수
  const formatAttendanceRate = (rate) => {
    if (rate === undefined || rate === null) return '0%';
    return `${Math.round(rate)}%`;
  };

  // 평가 별점 표시 컴포넌트
  const Rating = ({ value }) => {
    const maxRating = 5;
    const fullStars = Math.floor(value);
    const halfStar = value - fullStars >= 0.5;
    
    return (
      <div className="rating">
        {[...Array(fullStars)].map((_, i) => (
          <span key={i} className="rating-star">★</span>
        ))}
        {halfStar && <span className="rating-star">★</span>}
        {[...Array(maxRating - fullStars - (halfStar ? 1 : 0))].map((_, i) => (
          <span key={i + fullStars + (halfStar ? 1 : 0)} className="rating-star" style={{ color: '#ddd' }}>★</span>
        ))}
      </div>
    );
  };

  if (loading) {
    return <div className="loading">로딩 중...</div>;
  }

  if (!member) {
    return (
      <div className="card" style={{ padding: '30px', textAlign: 'center' }}>
        <p>부원 정보를 찾을 수 없습니다.</p>
        <button
          className="btn btn-primary"
          style={{ marginTop: '20px' }}
          onClick={() => navigate('/members')}
        >
          부원 목록으로 돌아가기
        </button>
      </div>
    );
  }

  // 출석 상태 분포 데이터
  const pieChartData = [
    { name: '출석', value: attendanceStats?.totalPresent || 0, color: '#219653' },
    { name: '지각', value: attendanceStats?.totalLate || 0, color: '#f2994a' },
    { name: '결석', value: attendanceStats?.totalAbsent || 0, color: '#eb5757' },
    { name: '미처리', value: attendanceStats?.totalNone || 0, color: '#9e9e9e' }
  ];

  // 월별 출석률 데이터
  const monthlyData = attendanceStats?.monthly || [];

  return (
    <div>
      <div className="card-header">
        <button
          className="btn btn-secondary"
          onClick={() => navigate('/members')}
          style={{ marginRight: '10px' }}
        >
          <FaArrowLeft /> 목록으로
        </button>
        <h1>{member.name}</h1>
      </div>

      {/* 기본 정보 카드 */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-header">
          <h2>기본 정보</h2>
          <button className="btn btn-primary btn-sm">
            <FaEdit /> 수정
          </button>
        </div>
        <div style={{ padding: '15px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <p>
                <strong>이름:</strong> {member.name}
              </p>
              <p>
                <strong>학번:</strong> {member.studentId}
              </p>
              <p>
                <strong>연락처:</strong> {member.phone || '-'}
              </p>
              <p>
                <strong>이메일:</strong> {member.email || '-'}
              </p>
            </div>
            <div>
              <p>
                <strong>가입일:</strong> {formatDate(member.createdAt)}
              </p>
              <p>
                <strong>소속 팀:</strong> {member.teams?.length || 0}개 팀
              </p>
              <p>
                <strong>참여 스케줄:</strong> {attendanceStats?.totalSchedules || 0}개
              </p>
              <p>
                <strong>평가 평균:</strong> <Rating value={attendanceStats?.averageRating || 0} /> ({attendanceStats?.averageRating?.toFixed(1) || '0.0'})
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 출석 통계 카드 */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-header">
          <h2>출석 통계</h2>
        </div>
        <div style={{ padding: '15px' }}>
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))' }}>
            <div className="stat-card">
              <div className="stat-title">전체 출석률</div>
              <div className="stat-value">{formatAttendanceRate(attendanceStats?.attendanceRate)}</div>
              <div className="stat-change">
                총 {attendanceStats?.totalSchedules || 0}개 스케줄
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-title">출석</div>
              <div className="stat-value">{attendanceStats?.totalPresent || 0}</div>
              <div className="stat-change">
                {formatAttendanceRate(attendanceStats?.presentRate)}
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-title">지각</div>
              <div className="stat-value">{attendanceStats?.totalLate || 0}</div>
              <div className="stat-change">
                {formatAttendanceRate(attendanceStats?.lateRate)}
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-title">결석</div>
              <div className="stat-value">{attendanceStats?.totalAbsent || 0}</div>
              <div className="stat-change">
                {formatAttendanceRate(attendanceStats?.absentRate)}
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-title">평가 평균</div>
              <div className="stat-value">{attendanceStats?.averageRating?.toFixed(1) || '0.0'}</div>
              <div className="stat-change">
                <Rating value={attendanceStats?.averageRating || 0} />
              </div>
            </div>
          </div>

          {/* 차트 섹션 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '30px' }}>
            {/* 출석 상태 분포 파이 차트 */}
            <div>
              <h3 style={{ marginBottom: '15px', textAlign: 'center' }}>출석 상태 분포</h3>
              <div style={{ width: '100%', height: 250 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      labelLine={true}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}회`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 월별 출석률 막대 차트 */}
            <div>
              <h3 style={{ marginBottom: '15px', textAlign: 'center' }}>월별 출석률</h3>
              <div style={{ width: '100%', height: 250 }}>
                <ResponsiveContainer>
                  <BarChart
                    data={monthlyData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Legend />
                    <Bar dataKey="rate" name="출석률" fill="#3498db" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 최근 출석 기록 카드 */}
      <div className="card">
        <div className="card-header">
          <h2>최근 출석 기록</h2>
        </div>
        {recentAttendances.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>날짜</th>
                  <th>스케줄</th>
                  <th>팀</th>
                  <th>출석 상태</th>
                  <th>평가</th>
                  <th>메모</th>
                </tr>
              </thead>
              <tbody>
                {recentAttendances.map((attendance) => (
                  <tr key={attendance.id}>
                    <td>{formatDate(attendance.schedule?.date)}</td>
                    <td>
                      <Link to={`/schedules/${attendance.scheduleId}`}>
                        {attendance.schedule?.title}
                      </Link>
                    </td>
                    <td>
                      <Link to={`/teams/${attendance.schedule?.teamId}`}>
                        {attendance.schedule?.teamName}
                      </Link>
                    </td>
                    <td>
                      <AttendanceStatus status={attendance.status} />
                    </td>
                    <td>
                      <Rating value={attendance.rating || 0} />
                    </td>
                    <td>{attendance.note || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ padding: '20px', textAlign: 'center' }}>
            출석 기록이 없습니다.
          </p>
        )}
      </div>
    </div>
  );
};

export default MemberDetail;