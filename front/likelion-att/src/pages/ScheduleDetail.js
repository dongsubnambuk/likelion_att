// src/pages/ScheduleDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft, FaEdit, FaTrash, FaSave, FaExclamationTriangle, FaCheckCircle, FaStar, FaRegStar } from 'react-icons/fa';
import { scheduleApi, teamApi, attendanceApi } from '../services/api';

// 출석 상태 컴포넌트
const AttendanceStatus = ({ status }) => {
  let statusClass = 'status-none';
  let statusText = '미출결';

  switch (status) {
    case 'PRESENT':
      statusClass = 'status-present';
      statusText = '출석';
      break;
    case 'LATE':
      statusClass = 'status-late';
      statusText = '지각';
      break;
    case 'ABSENT':
      statusClass = 'status-absent';
      statusText = '결석';
      break;
    case 'NOT':
    default:
      statusClass = 'status-none';
      statusText = '미출결';
      break;
  }

  return <span className={`attendance-status ${statusClass}`}>{statusText}</span>;
};

// 평가 별점 컴포넌트
const RatingStars = ({ rating, onRatingChange }) => {
  return (
    <div className="rating-selector">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`rating-option ${star <= rating ? 'selected' : ''}`}
          onClick={() => onRatingChange(star)}
        >
          {star <= rating ? <FaStar /> : <FaRegStar />}
        </span>
      ))}
    </div>
  );
};

// 출석체크 컴포넌트
const AttendanceCheckItem = ({ member, attendance, onChange }) => {
  // status 이름을 API와 일치시킴 (모두 대문자로 사용)
  const [status, setStatus] = useState(attendance.status || 'NOT');
  const [score, setScore] = useState(attendance.score || 0);
  const [note, setNote] = useState(attendance.note || '');

  useEffect(() => {
    setStatus(attendance.status || 'NOT');
    setScore(attendance.score || 0);
    setNote(attendance.note || '');
  }, [attendance]);

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    onChange({
      ...attendance,
      status: newStatus,
      score,
      note,
      // user 필드 확인 및 설정
      user: attendance.user || member
    });
  };

  const handleScoreChange = (newScore) => {
    setScore(newScore);
    onChange({
      ...attendance,
      status,
      score: newScore,
      note,
      user: attendance.user || member
    });
  };

  const handleNoteChange = (e) => {
    setNote(e.target.value);
    onChange({
      ...attendance,
      status,
      score,
      note: e.target.value,
      user: attendance.user || member
    });
  };

  return (
    <tr>
      <td>
        <Link to={`/members/${member.studentId}`}>{member.name}</Link>
      </td>
      <td>{member.studentId}</td>
      <td>
        <div className="attendance-selector">
          <div
            className={`attendance-option ${status === 'PRESENT' ? 'selected-present' : ''}`}
            onClick={() => handleStatusChange('PRESENT')}
          >
            출석
          </div>
          <div
            className={`attendance-option ${status === 'LATE' ? 'selected-late' : ''}`}
            onClick={() => handleStatusChange('LATE')}
          >
            지각
          </div>
          <div
            className={`attendance-option ${status === 'ABSENT' ? 'selected-absent' : ''}`}
            onClick={() => handleStatusChange('ABSENT')}
          >
            결석
          </div>
          <div
            className={`attendance-option ${status === 'NOT' ? 'selected-none' : ''}`}
            onClick={() => handleStatusChange('NOT')}
          >
            미출결
          </div>
        </div>
      </td>
      <td>
        <RatingStars rating={score} onRatingChange={handleScoreChange} />
      </td>
      <td>
        <input
          type="text"
          className="form-control"
          placeholder="메모"
          value={note}
          onChange={handleNoteChange}
        />
      </td>
    </tr>
  );
};

// 메인 ScheduleDetail 컴포넌트
const ScheduleDetail = () => {
  const { scheduleId } = useParams();
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState(null);
  const [team, setTeam] = useState(null);
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);
  const [stats, setStats] = useState({
    present: 0,
    late: 0,
    absent: 0,
    none: 0,
    total: 0,
    rate: 0
  });

  // 스케줄 및 출석 정보 불러오기
  useEffect(() => {
    const fetchScheduleData = async () => {
      try {
        setLoading(true);

        // 전체 스케줄 데이터 조회
        const allSchedulesResponse = await scheduleApi.getAll();

        // 스케줄 ID로 특정 스케줄 찾기
        let foundSchedule = null;
        let teamId = null;

        // allSchedulesResponse.data는 { "1": [ ... ], "2": [ ... ] } 형태
        if (allSchedulesResponse.data && typeof allSchedulesResponse.data === 'object') {
          // 각 팀의 스케줄에서 검색
          Object.entries(allSchedulesResponse.data).forEach(([currentTeamId, teamSchedules]) => {
            if (Array.isArray(teamSchedules)) {
              const schedule = teamSchedules.find(s => s.id === parseInt(scheduleId));
              if (schedule) {
                foundSchedule = { ...schedule, teamId: parseInt(currentTeamId) };
                teamId = parseInt(currentTeamId);
              }
            }
          });
        }

        if (!foundSchedule) {
          setNotification({
            type: 'error',
            message: '스케줄 정보를 찾을 수 없습니다.'
          });
          setLoading(false);
          return;
        }

        setSchedule(foundSchedule);
        console.log('불러온 스케줄 정보:', foundSchedule);

        // 팀 정보 가져오기
        const teamResponse = await teamApi.getById(teamId);
        setTeam(teamResponse.data);
        console.log('불러온 팀 정보:', teamResponse.data);

        // 출석 정보 처리
        if (foundSchedule.attendances && Array.isArray(foundSchedule.attendances)) {
          // 출석 상태 대문자로 통일
          const formattedAttendances = foundSchedule.attendances.map(attendance => {
            let status = attendance.status || 'NOT';
            if (status === 'not') status = 'NOT';
            else if (status === 'present') status = 'PRESENT';
            else if (status === 'late') status = 'LATE';
            else if (status === 'absent') status = 'ABSENT';

            return {
              ...attendance,
              status: status,
              member: attendance.user || null // user 필드를 member로 복사
            };
          });

          setAttendances(formattedAttendances);
          calculateStats(formattedAttendances);
          console.log('처리된 출석 정보:', formattedAttendances);
        } else {
          setAttendances([]);
          calculateStats([]);
        }
      } catch (error) {
        console.error('스케줄 데이터 로딩 실패:', error);
        setNotification({
          type: 'error',
          message: '스케줄 정보를 불러오는데 실패했습니다.'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchScheduleData();
  }, [scheduleId]);

  // 출석 통계 계산
  const calculateStats = (attendanceData) => {
    const total = attendanceData.length;

    // 상태 값을 대문자로 사용
    const presentCount = attendanceData.filter(a => a.status === 'PRESENT').length;
    const lateCount = attendanceData.filter(a => a.status === 'LATE').length;
    const absentCount = attendanceData.filter(a => a.status === 'ABSENT').length;
    const noneCount = attendanceData.filter(a => a.status === 'NOT' || !a.status).length;

    // 출석률 계산 (출석 + 지각의 비율)
    const attendanceRate = total > 0 ? Math.round(((presentCount + lateCount) / total) * 100) : 0;

    setStats({
      present: presentCount,
      late: lateCount,
      absent: absentCount,
      none: noneCount,
      total,
      rate: attendanceRate
    });
  };

  // 출석 정보 변경
  const handleAttendanceChange = (updatedAttendance) => {
    setAttendances(attendances.map(attendance =>
      attendance.id === updatedAttendance.id ? updatedAttendance : attendance
    ));
  };

  // 출석 정보 저장
  const handleSave = async () => {
    try {
      setSaving(true);

      // API 요구 형식에 맞게 데이터 변환
      const formattedAttendances = attendances.map(attendance => {
        // user 필드 확인
        const user = attendance.user || attendance.member;

        // 상태값 확인 및 변환
        let status = attendance.status || 'NOT';
        if (status === 'not') status = 'NOT';
        else if (status === 'present') status = 'PRESENT';
        else if (status === 'late') status = 'LATE';
        else if (status === 'absent') status = 'ABSENT';

        return {
          id: attendance.id,
          user: user,
          status: status,
          note: attendance.note || '',
          score: attendance.score || 0
        };
      });

      console.log('저장할 출석 데이터:', formattedAttendances);

      // /api/pickup/update-location API 호출
      await attendanceApi.bulkUpdate(formattedAttendances);

      // 출석 통계 다시 계산
      calculateStats(attendances);

      setNotification({
        type: 'success',
        message: '출석 정보가 성공적으로 저장되었습니다!'
      });

      setTimeout(() => {
        setNotification(null);
      }, 3000);

    } catch (error) {
      console.error('출석 정보 저장 실패:', error);
      setNotification({
        type: 'error',
        message: '출석 정보 저장에 실패했습니다. 다시 시도해주세요.'
      });
    } finally {
      setSaving(false);
    }
  };

  // 스케줄 삭제
  const handleDelete = async () => {
    if (!window.confirm('정말 이 스케줄을 삭제하시겠습니까? 모든 출석 정보가 함께 삭제됩니다.')) {
      return;
    }

    try {
      // scheduleApi.delete 호출 (teamId와 scheduleId 모두 전달)
      await scheduleApi.delete(scheduleId, team.id);

      setNotification({
        type: 'success',
        message: '스케줄이 성공적으로 삭제되었습니다!'
      });

      // 팀 상세 페이지로 리다이렉트
      setTimeout(() => {
        navigate(`/teams/${team.id}`);
      }, 1500);

    } catch (error) {
      console.error('스케줄 삭제 실패:', error);
      setNotification({
        type: 'error',
        message: '스케줄 삭제에 실패했습니다. 다시 시도해주세요.'
      });
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    return new Date(dateString).toLocaleDateString('ko-KR', options);
  };

  if (loading) {
    return <div className="loading">로딩 중...</div>;
  }

  if (!schedule || !team) {
    return (
      <div className="card" style={{ padding: '30px', textAlign: 'center' }}>
        <p>스케줄 정보를 찾을 수 없습니다.</p>
        <button
          className="btn btn-primary"
          style={{ marginTop: '20px' }}
          onClick={() => navigate('/schedules')}
        >
          스케줄 목록으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="card-header">
        <button
          className="btn btn-secondary"
          onClick={() => navigate(`/schedules`)}
          style={{ marginRight: '10px' }}
        >
          <FaArrowLeft /> 스케줄로 돌아가기
        </button>
        <h1>{schedule.title}</h1>
      </div>

      {/* 알림 메시지 */}
      {notification && (
        <div className={`alert alert-${notification.type}`}>
          {notification.type === 'success' ? <FaCheckCircle /> : <FaExclamationTriangle />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* 스케줄 정보 카드 */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-header">
          <h2>스케줄 정보</h2>
          <div style={{ display: 'flex', gap: '10px' }}>
            {/* <button className="btn btn-primary btn-sm">
              <FaEdit /> 수정
            </button> */}
            <button
              className="btn btn-danger btn-sm"
              onClick={handleDelete}
            >
              <FaTrash /> 삭제
            </button>
          </div>
        </div>
        <div style={{ padding: '0 15px' }}>
          <p>
            <strong>팀:</strong> <Link to={`/teams/${team.id}`}>{team.name}</Link>
          </p>
          <p>
            <strong>날짜:</strong> {formatDate(schedule.date)}
          </p>
          <p>
            <strong>설명:</strong> {schedule.description || '설명 없음'}
          </p>
          <p>
            <strong>생성일:</strong> {new Date(schedule.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* 출석 통계 카드 */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-header">
          <h2>출석 통계</h2>
        </div>
        <div style={{ padding: '15px' }}>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-title">출석</div>
              <div className="stat-value">{stats.present}</div>
              <div className="stat-change">
                {Math.round((stats.present / stats.total) * 100) || 0}%
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-title">지각</div>
              <div className="stat-value">{stats.late}</div>
              <div className="stat-change">
                {Math.round((stats.late / stats.total) * 100) || 0}%
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-title">결석</div>
              <div className="stat-value">{stats.absent}</div>
              <div className="stat-change">
                {Math.round((stats.absent / stats.total) * 100) || 0}%
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-title">미출결</div>
              <div className="stat-value">{stats.none}</div>
              <div className="stat-change">
                {Math.round((stats.none / stats.total) * 100) || 0}%
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-title">출석률</div>
              <div className="stat-value">{stats.rate}%</div>
              <div className="stat-change">
                총 {stats.total}명 중 {stats.present + stats.late}명
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 출석체크 카드 */}
      <div className="card">
        <div className="card-header">
          <h2>출석체크</h2>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            <FaSave /> {saving ? '저장 중...' : '저장하기'}
          </button>
        </div>
        {attendances.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '15%' }}>이름</th>
                  <th style={{ width: '15%' }}>학번</th>
                  <th style={{ width: '30%' }}>출석 상태</th>
                  <th style={{ width: '15%' }}>평가</th>
                  <th style={{ width: '25%' }}>메모</th>
                </tr>
              </thead>
              <tbody>
                {attendances.map(attendance => {
                  const member = attendance.member || {};
                  return (
                    <AttendanceCheckItem
                      key={attendance.id}
                      member={member}
                      attendance={attendance}
                      onChange={handleAttendanceChange}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ padding: '20px', textAlign: 'center' }}>
            출석 정보가 없습니다. 팀원을 먼저 추가해주세요.
          </p>
        )}
      </div>
    </div>
  );
};

export default ScheduleDetail;