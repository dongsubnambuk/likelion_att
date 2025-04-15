// src/pages/MemberDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FaArrowLeft, FaEdit, FaUser, FaUserCog, FaEnvelope, FaPhone, FaLaptopCode,
  FaCalendarAlt, FaStar, FaRegStar, FaExclamationTriangle, FaCheckCircle
} from 'react-icons/fa';
import { userApi, scheduleApi } from '../services/api';
import Loading from '../components/common/Loading';

// 출석 상태 컴포넌트
const AttendanceStatus = ({ status }) => {
  let statusClass = 'status-none';
  let statusText = '미출결';

  switch (status) {
    case 'PRESENT':
    case 'present':
      statusClass = 'status-present';
      statusText = '출석';
      break;
    case 'LATE':
    case 'late':
      statusClass = 'status-late';
      statusText = '지각';
      break;
    case 'ABSENT':
    case 'absent':
      statusClass = 'status-absent';
      statusText = '결석';
      break;
    case 'NOT':
    case 'not':
    default:
      statusClass = 'status-none';
      statusText = '미출결';
      break;
  }

  return <span className={`attendance-status ${statusClass}`}>{statusText}</span>;
};

// 평가 별점 표시 컴포넌트
const RatingStars = ({ rating }) => {
  return (
    <div className="rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className="rating-star" style={{ color: star <= rating ? '#DF773B' : '#ddd' }}>
          {star <= rating ? <FaStar /> : <FaRegStar />}
        </span>
      ))}
    </div>
  );
};

const MemberDetail = () => {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [stats, setStats] = useState({
    present: 0,
    late: 0,
    absent: 0,
    none: 0,
    total: 0,
    rate: 0,
    averageRating: 0
  });

  // 부원 정보 불러오기
  useEffect(() => {
    const fetchMemberData = async () => {
      try {
        setLoading(true);

        // 부원 정보를 전체 회원 목록에서 찾아서 가져오는 방식으로 변경
        const allUsersResponse = await userApi.getAll();

        if (allUsersResponse.data) {
          const { admin = [], users = [] } = allUsersResponse.data;
          // 모든 사용자 배열을 합친 후 학번으로 필터링
          const allUsers = [...admin, ...users];
          const foundMember = allUsers.find(user => user.studentId.toString() === memberId.toString());

          if (foundMember) {
            setMember(foundMember);

            // 해당 회원의 출석 기록 가져오기
            await fetchMemberAttendances(foundMember);
          } else {
            setError('부원 정보를 찾을 수 없습니다.');
          }
        } else {
          setError('부원 목록을 불러올 수 없습니다.');
        }
      } catch (error) {
        console.error('부원 데이터 로딩 실패:', error);
        setError('부원 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchMemberData();
  }, [memberId]);

  // 회원의 출석 기록 가져오기
  const fetchMemberAttendances = async (member) => {
    try {
      // 전체 스케줄 가져오기
      const schedulesResponse = await scheduleApi.getAll();

      if (schedulesResponse.data) {
        let memberAttendances = [];

        // 각 팀의 스케줄에서 해당 회원의 출석 정보 찾기
        Object.entries(schedulesResponse.data).forEach(([teamId, schedules]) => {
          if (Array.isArray(schedules)) {
            schedules.forEach(schedule => {
              if (schedule.attendances && Array.isArray(schedule.attendances)) {
                const userAttendance = schedule.attendances.find(
                  att => att.user && att.user.studentId.toString() === member.studentId.toString()
                );

                if (userAttendance) {
                  memberAttendances.push({
                    ...userAttendance,
                    schedule: {
                      id: schedule.id,
                      date: schedule.date,
                      time: schedule.time,
                      teamId: parseInt(teamId),
                      teamName: `팀 ${teamId}`
                    }
                  });
                }
              }
            });
          }
        });

        // 날짜순 정렬 (최신 순)
        memberAttendances.sort((a, b) => {
          return new Date(b.schedule.date) - new Date(a.schedule.date);
        });

        setAttendances(memberAttendances);
        calculateStats(memberAttendances);
      }
    } catch (error) {
      console.error('출석 기록 로딩 실패:', error);
      setNotification({
        type: 'error',
        message: '출석 기록을 불러오는데 실패했습니다.'
      });
    }
  };

  // 출석 통계 계산
  const calculateStats = (attendanceData) => {
    const total = attendanceData.length;

    // 상태 값 통일 (대소문자 구분 없이)
    const presentCount = attendanceData.filter(a =>
      a.status === 'PRESENT' || a.status === 'present').length;
    const lateCount = attendanceData.filter(a =>
      a.status === 'LATE' || a.status === 'late').length;
    const absentCount = attendanceData.filter(a =>
      a.status === 'ABSENT' || a.status === 'absent').length;
    const noneCount = attendanceData.filter(a =>
      a.status === 'NOT' || a.status === 'not' || !a.status).length;

    // 출석률 계산 (출석 + 지각) / (전체 - 미처리)
    // 미처리는 통계에서 제외
    const effectiveTotal = total - noneCount;
    const attendanceRate = effectiveTotal > 0
      ? Math.round(((presentCount + lateCount) / effectiveTotal) * 100)
      : 0;

    // 평균 평가 점수 계산
    let totalRating = 0;
    let ratingCount = 0;

    attendanceData.forEach(attendance => {
      if (attendance.score && attendance.score > 0) {
        totalRating += attendance.score;
        ratingCount++;
      }
    });

    const averageRating = ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : 0;

    setStats({
      present: presentCount,
      late: lateCount,
      absent: absentCount,
      none: noneCount,
      total,
      effectiveTotal, // 미처리를 제외한 유효한 출석 수
      rate: attendanceRate,
      averageRating
    });
  };

  // 전화번호 포맷팅
  const formatPhone = (phone) => {
    if (!phone) return '-';
    const phoneStr = String(phone);

    if (phoneStr.length === 11) {
      return `${phoneStr.slice(0, 3)}-${phoneStr.slice(3, 7)}-${phoneStr.slice(7)}`;
    }

    return phoneStr;
  };

  // 트랙 표시 함수
  const getTrackDisplay = (track) => {
    const TRACK_MAPPING = {
      'EduFront': '교육 프론트엔드',
      'EduBack': '교육 백엔드',
      'ProFront': '프로젝트 프론트엔드',
      'ProBack': '프로젝트 백엔드'
    };

    return TRACK_MAPPING[track] || track || '-';
  };

  // 날짜 포맷팅
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    return new Date(dateString).toLocaleDateString('ko-KR', options);
  };

  if (loading) {
    return <Loading className="loading">로딩 중...</Loading>;
  }

  if (error || !member) {
    return (
      <div className="card" style={{ padding: '30px', textAlign: 'center' }}>
        <p>{error || '부원 정보를 찾을 수 없습니다.'}</p>
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

  return (
    <div>
      <div className="card-header" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => navigate('/members')}
            style={{ marginRight: '15px' }}
          >
            <FaArrowLeft /> 목록으로
          </button>
          <h1>
            {member.role === 'ADMIN' ? (
              <FaUserCog style={{ color: '#DF773B', marginRight: '10px' }} />
            ) : (
              <FaUser style={{ color: '#373737', marginRight: '10px' }} />
            )}
            {member.name}
          </h1>
        </div>
      </div>

      {/* 알림 메시지 */}
      {notification && (
        <div className={`alert alert-${notification.type}`}>
          {notification.type === 'success' ? <FaCheckCircle /> : <FaExclamationTriangle />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* 기본 정보 카드 */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-header">
          <h2 className="card-title">기본 정보</h2>
        </div>
        <div style={{ padding: '15px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            <div>
              <p style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                <FaUser style={{ color: '#373737', marginRight: '10px', width: '20px' }} />
                <strong style={{ width: '80px' }}>이름:</strong>
                <span>{member.name}</span>
              </p>
              <p style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                <FaUser style={{ color: '#373737', marginRight: '10px', width: '20px' }} />
                <strong style={{ width: '80px' }}>학번:</strong>
                <span>{member.studentId}</span>
              </p>
              <p style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                <FaPhone style={{ color: '#373737', marginRight: '10px', width: '20px' }} />
                <strong style={{ width: '80px' }}>연락처:</strong>
                <span>{formatPhone(member.phone)}</span>
              </p>
              <p style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                <FaEnvelope style={{ color: '#373737', marginRight: '10px', width: '20px' }} />
                <strong style={{ width: '80px' }}>이메일:</strong>
                <span>{member.email || '-'}</span>
              </p>
              <p style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                <FaLaptopCode style={{ color: '#DF773B', marginRight: '10px', width: '20px' }} />
                <strong style={{ width: '80px' }}>트랙:</strong>
                <span>{getTrackDisplay(member.track)}</span>
              </p>
              <p style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                <FaUserCog style={{ color: member.role === 'ADMIN' ? '#DF773B' : '#373737', marginRight: '10px', width: '20px' }} />
                <strong style={{ width: '80px' }}>역할:</strong>
                <span>
                  <span style={{
                    display: 'inline-block',
                    padding: '2px 8px',
                    backgroundColor: member.role === 'ADMIN' ? '#FEF0E6' : '#F5F5F5',
                    color: member.role === 'ADMIN' ? '#DF773B' : '#373737',
                    borderRadius: '4px',
                    fontSize: '0.9em'
                  }}>
                    {member.role === 'ADMIN' ? '운영진' : '아기사자'}
                  </span>
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 출석 통계 카드 */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-header">
          <h2 className="card-title">출석 통계</h2>
        </div>
        <div style={{ padding: '15px' }}>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-title">전체 출석률</div>
              <div className="stat-value" style={{ color: stats.rate >= 80 ? '#219653' : stats.rate >= 60 ? '#f2994a' : '#eb5757' }}>
                {stats.rate}%
              </div>
              <div className="stat-change">
                유효 {stats.effectiveTotal}개 중 {stats.present + stats.late}개
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-title">출석</div>
              <div className="stat-value" style={{ color: '#219653' }}>{stats.present}회</div>
              <div className="stat-change">
                {stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0}%
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-title">지각</div>
              <div className="stat-value" style={{ color: '#f2994a' }}>{stats.late}회</div>
              <div className="stat-change">
                {stats.total > 0 ? Math.round((stats.late / stats.total) * 100) : 0}%
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-title">결석</div>
              <div className="stat-value" style={{ color: '#eb5757' }}>{stats.absent}회</div>
              <div className="stat-change">
                {stats.total > 0 ? Math.round((stats.absent / stats.total) * 100) : 0}%
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-title">미처리</div>
              <div className="stat-value" style={{ color: '#bdbdbd' }}>{stats.none}회</div>
              <div className="stat-change">
                {stats.total > 0 ? Math.round((stats.none / stats.total) * 100) : 0}%
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-title">평가 평균</div>
              <div className="stat-value">{stats.averageRating}</div>
              <div className="stat-change">
                <RatingStars rating={Number(stats.averageRating)} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 출석 기록 카드 */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">출석 기록</h2>
        </div>
        <div className="table-container" style={{ maxHeight: '500px', overflowY: 'auto' }}>
          {attendances.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>날짜</th>
                  <th>시간</th>
                  <th>팀</th>
                  <th>출석 상태</th>
                  <th>평가</th>
                  <th>메모</th>
                </tr>
              </thead>
              <tbody>
                {attendances.map((attendance) => (
                  <tr key={attendance.id}>
                    <td>{formatDate(attendance.schedule.date)}</td>
                    <td>{attendance.schedule.time}</td>
                    <td>
                      <Link to={`/teams/${attendance.schedule.teamId}`}>
                        {attendance.schedule.teamName}
                      </Link>
                    </td>
                    <td><AttendanceStatus status={attendance.status} /></td>
                    <td><RatingStars rating={attendance.score || 0} /></td>
                    <td>{attendance.note || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: '30px', textAlign: 'center' }}>
              <p>출석 기록이 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemberDetail;