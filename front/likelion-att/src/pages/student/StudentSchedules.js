// src/pages/student/StudentSchedules.js
import React, { useState, useEffect } from 'react';
import { FaSearch, FaCalendarAlt, FaExclamationTriangle, FaUsers, FaHistory, FaFilter, FaSortAmountDown, FaUserCog, FaUser, FaUserFriends, FaLock } from 'react-icons/fa';
import api, { teamApi } from '../../services/api';
import Loading from '../../components/common/Loading';

const StudentSchedules = () => {
  const [schedulesByTeam, setSchedulesByTeam] = useState({});
  const [filteredSchedules, setFilteredSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [showPastSchedules, setShowPastSchedules] = useState(false);
  const [sortDirection, setSortDirection] = useState('asc');
  const [teams, setTeams] = useState([]);
  const [filterTeamId, setFilterTeamId] = useState('all');

  // 팀 목록과 스케줄 목록 불러오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 팀 목록 불러오기
        const teamsResponse = await teamApi.getAll();
        const teamsData = teamsResponse.data;

        if (teamsData && typeof teamsData === 'object') {
          const processedTeams = Object.entries(teamsData).map(([teamId, teamInfo]) => {
            const description = Object.keys(teamInfo)[0];
            return {
              id: parseInt(teamId),
              name: `팀 ${teamId}`,
              description
            };
          });
          setTeams(processedTeams);
        }

        // 스케줄 목록 불러오기
        const response = await api.get('/api/schedules/all');
        setSchedulesByTeam(response.data);

        // 모든 스케줄을 단일 배열로 변환
        const allSchedules = [];
        Object.entries(response.data).forEach(([teamId, schedules]) => {
          if (Array.isArray(schedules)) {
            schedules.forEach(schedule => {
              allSchedules.push({
                ...schedule,
                teamId: teamId,
                teamName: `팀 ${teamId}`
              });
            });
          }
        });

        // 날짜순으로 정렬 (기본: 날짜 오름차순)
        const sortedSchedules = allSchedules.sort((a, b) => {
          const dateA = new Date(`${a.date}T${a.time || '00:00:00'}`);
          const dateB = new Date(`${b.date}T${b.time || '00:00:00'}`);
          return dateA - dateB;
        });

        setFilteredSchedules(sortedSchedules);
      } catch (error) {
        setError('스케줄 목록을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 필터링 및 정렬 로직 업데이트 (팀 필터 추가)
  useEffect(() => {
    // 모든 스케줄을 단일 배열로 변환
    const allSchedules = [];
    Object.entries(schedulesByTeam).forEach(([teamId, schedules]) => {
      if (Array.isArray(schedules)) {
        schedules.forEach(schedule => {
          allSchedules.push({
            ...schedule,
            teamId: teamId,
            teamName: `팀 ${teamId}`
          });
        });
      }
    });

    let filtered = [...allSchedules];

    // 팀 필터링
    if (filterTeamId !== 'all') {
      filtered = filtered.filter(schedule => schedule.teamId === filterTeamId);
    }

    // 현재 날짜 기준으로 필터링 (지난 스케줄 표시 옵션에 따라)
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 오늘 날짜의 시작 시간으로 설정

    if (!showPastSchedules) {
      filtered = filtered.filter(schedule => {
        const scheduleDate = new Date(schedule.date);
        scheduleDate.setHours(0, 0, 0, 0);
        return scheduleDate >= today;
      });
    }

    // 검색어 필터링
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(schedule =>
        (schedule.title && schedule.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        schedule.date.includes(searchTerm) ||
        schedule.time.includes(searchTerm) ||
        (`팀 ${schedule.teamId}`).includes(searchTerm) ||
        (Array.isArray(schedule.attendances) && schedule.attendances.some(att =>
          att.user && att.user.name && att.user.name.toLowerCase().includes(searchTerm.toLowerCase())
        ))
      );
    }

    // 날짜 필터링 - 시작일
    if (filterStartDate) {
      filtered = filtered.filter(schedule => new Date(schedule.date) >= new Date(filterStartDate));
    }

    // 날짜 필터링 - 종료일
    if (filterEndDate) {
      filtered = filtered.filter(schedule => new Date(schedule.date) <= new Date(filterEndDate));
    }

    // 날짜순으로 정렬
    filtered.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time || '00:00:00'}`);
      const dateB = new Date(`${b.date}T${b.time || '00:00:00'}`);
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    });

    setFilteredSchedules(filtered);
  }, [searchTerm, filterStartDate, filterEndDate, schedulesByTeam, showPastSchedules, sortDirection, filterTeamId]);

  // 필터 초기화
  const resetFilters = () => {
    setSearchTerm('');
    setFilterStartDate('');
    setFilterEndDate('');
    setFilterTeamId('all'); // 팀 필터도 초기화
    // 지난 스케줄 표시 여부는 유지
  };

  // 날짜 포맷 함수
  const formatDate = (dateString) => {
    if (!dateString) return '날짜 없음';

    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    return new Date(dateString).toLocaleDateString('ko-KR', options);
  };

  // 경과 시간 표시 함수
  const getRelativeTime = (dateString) => {
    if (!dateString) return '';

    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return `${Math.abs(diffDays)}일 전`;
    } else if (diffDays === 0) {
      return '오늘';
    } else if (diffDays === 1) {
      return '내일';
    } else {
      return `${diffDays}일 후`;
    }
  };

  // 출석 상태 표시 컴포넌트 - 팀 멤버십에 따라 표시/비공개 구분
  const AttendanceStatus = ({ status, isUserTeam }) => {
    // 사용자가 속한 팀이 아니면 비공개 처리
    if (!isUserTeam) {
      return (
        <span className="attendance-status status-private" style={{ paddingLeft: '0px' }}>
          <FaLock style={{ marginRight: '5px', fontSize: '0.8em' }} />
          비공개
        </span>
      );
    }

    let statusClass = 'status-none';
    let statusText = '미처리';

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
        statusText = '미처리';
        break;
    }

    return <span className={`attendance-status ${statusClass}`}>{statusText}</span>;
  };

  // 정렬 방향 토글 함수
  const toggleSortDirection = () => {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };

  // 스케줄이 과거인지 확인하는 함수
  const isPastSchedule = (dateString) => {
    const scheduleDate = new Date(dateString);
    scheduleDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return scheduleDate < today;
  };

  // 스케줄 카드 내의 출석 명단 렌더링 부분 수정
  const renderAttendanceList = (schedule) => {
    // 현재 로그인한 사용자 정보 가져오기
    const currentUser = JSON.parse(localStorage.getItem('user')) || {};

    // 스케줄의 참석자 목록에 현재 사용자가 있는지 확인
    const isUserInSchedule = Array.isArray(schedule.attendances) &&
      schedule.attendances.some(attendance =>
        attendance.user && (
          (currentUser.name && attendance.user.name === currentUser.name) ||
          (currentUser.studentId && attendance.user.studentId === currentUser.studentId) ||
          (currentUser.email && attendance.user.email === currentUser.email) ||
          (currentUser.id && attendance.user.id === currentUser.id)
        )
      );

    return (
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>이름</th>
              <th>학번</th>
              <th>역할</th>
              <th>출석 상태</th>
              <th>비고</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(schedule.attendances) && schedule.attendances.length > 0 ? (
              [...schedule.attendances]
                .sort((a, b) => {
                  // 운영진(ADMIN)을 먼저 표시
                  if (a.user?.role === 'ADMIN' && b.user?.role !== 'ADMIN') return -1;
                  if (a.user?.role !== 'ADMIN' && b.user?.role === 'ADMIN') return 1;
                  // 같은 역할이면 이름순으로 정렬
                  return (a.user?.name || '').localeCompare(b.user?.name || '');
                })
                .map((attendance) => {
                  // 현재 사용자의 출석 정보인지 확인
                  const isCurrentUser = attendance.user && (
                    (currentUser.name && attendance.user.name === currentUser.name) ||
                    (currentUser.studentId && attendance.user.studentId === currentUser.studentId) ||
                    (currentUser.email && attendance.user.email === currentUser.email) ||
                    (currentUser.id && attendance.user.id === currentUser.id)
                  );

                  // 사용자 이름 하이라이트 스타일
                  const userNameStyle = isCurrentUser ? {
                    fontWeight: 'bold',
                    color: '#007bff',
                    backgroundColor: '#e6f2ff',
                    padding: '2px 8px',
                    borderRadius: '4px'
                  } : {};

                  return (
                    <tr key={attendance.id} style={isCurrentUser ? { backgroundColor: '#f8f9fa' } : {}}>
                      <td>
                        <span style={{ display: 'flex', alignItems: 'center' }}>
                          {attendance.user?.role === 'ADMIN'
                            ? <FaUserCog style={{ color: '#DF773B', marginRight: '5px' }} />
                            : <FaUser style={{ color: '#373737', marginRight: '5px' }} />
                          }
                          <span style={userNameStyle}>
                            {attendance.user?.name || '-'}
                            {isCurrentUser && ' (나)'}
                          </span>
                        </span>
                      </td>
                      <td>{attendance.user?.studentId || '-'}</td>
                      <td>
                        <span style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          backgroundColor: attendance.user?.role === 'ADMIN' ? '#FEF0E6' : '#F5F5F5',
                          color: attendance.user?.role === 'ADMIN' ? '#DF773B' : '#373737',
                          borderRadius: '4px',
                          fontSize: '0.9em'
                        }}>
                          {attendance.user?.role === 'ADMIN' ? '운영진' : '아기사자'}
                        </span>
                      </td>
                      <td>
                        {/* 수정된 부분: 사용자가 포함된 스케줄이면 모든 출석 상태 표시, 아니면 본인만 */}
                        <AttendanceStatus
                          status={attendance.status}
                          isUserTeam={isUserInSchedule || isCurrentUser}
                        />
                      </td>
                      <td>
                        {/* 비고도 사용자 참여 여부에 따라 표시/비공개 처리 */}
                        {isUserInSchedule || isCurrentUser
                          ? (attendance.note || '-')
                          : <span style={{
                            fontSize: '0.75rem',
                            fontWeight: 'bold'
                          }}>
                            <FaLock style={{ marginRight: '5px' }} />
                            비공개
                          </span>
                        }
                      </td>
                    </tr>
                  );
                })
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center' }}>참석자 정보가 없습니다.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div>
      <h1 style={{ marginBottom: '20px', borderBottom: '1px solid var(--gray)', paddingBottom: '20px' }}>전체 스케줄 조회</h1>

      {/* 사용법 안내 문구 추가 */}
      <div className="alert alert-info" style={{
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#e3f2fd',
        borderLeft: '4px solid #2196f3',
        padding: '15px'
      }}>
        <div style={{ marginRight: '15px', color: '#2196f3' }}>
          <FaCalendarAlt size={24} />
        </div>
        <div>
          <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1rem' }}>
            자신의 출결 정보와 세션 일정을 확인하세요!
          </p>
          <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem', color: '#333' }}>
            진행된 세션의 출결 상태와 앞으로 예정된 세션의 일정을 확인할 수 있습니다.
          </p>
        </div>
      </div>
      <div className="alert alert-info" style={{
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#f0f7e6',
        borderLeft: '4px solid #4caf50',
        padding: '15px'
      }}>
        <div style={{ marginRight: '15px', color: '#4caf50' }}>
          <FaUserFriends size={24} />
        </div>
        <div>
          <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1rem' }}>
            다른 트랙 세션도 참여할 수 있어요!
          </p>
          <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem', color: '#333' }}>
            자신의 트랙 외에도 타 트랙의 세션 일정을 확인하고, 참여를 원하시면 해당 팀 운영진에게 카톡으로 연락해보세요.
            해당 팀 운영진의 허락 하에 다양한 세션에 참여할 수 있습니다.
          </p>
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="alert alert-error">
          <FaExclamationTriangle />
          <span>{error}</span>
        </div>
      )}

      {/* 필터 영역 */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-header" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h2>스케줄 필터</h2>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              className={`btn btn-sm ${showPastSchedules ? 'btn-info' : 'btn-outline-info'}`}
              onClick={() => setShowPastSchedules(!showPastSchedules)}
              title={showPastSchedules ? '과거 스케줄 숨기기' : '과거 스케줄 표시하기'}
            >
              <FaHistory /> 지난 스케줄 {showPastSchedules ? '숨기기' : '표시'}
            </button>
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={toggleSortDirection}
              title="정렬 방향 변경"
            >
              <FaSortAmountDown /> {sortDirection === 'asc' ? '과거 → 미래' : '미래 → 과거'}
            </button>
            <button
              className="btn btn-sm btn-secondary"
              onClick={resetFilters}
              title="검색 필터 초기화"
            >
              <FaFilter /> 필터 초기화
            </button>
          </div>
        </div>
        <div style={{ padding: '15px', display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
          <div className="form-group" style={{ width: '100%' }}>
            <label htmlFor="search-term" className="form-label">검색어</label>
            <div className="search-container" style={{ width: '100%', display: 'flex' }}>
              <input
                type="text"
                id="search-term"
                className="search-input"
                placeholder="날짜, 시간 또는 팀 이름으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ flex: 1 }}
              />
              <button className="search-button">
                <FaSearch />
              </button>
            </div>
          </div>

          {/* 팀 선택 필터 추가 */}
          <div className="form-group" style={{ flex: '1', minWidth: '200px' }}>
            <label htmlFor="filter-team" className="form-label">
              <FaUserFriends style={{ marginRight: '5px' }} />
              팀 선택
            </label>
            <select
              id="filter-team"
              className="form-control"
              value={filterTeamId}
              onChange={(e) => setFilterTeamId(e.target.value)}
            >
              <option value="all">모든 팀</option>
              {teams.map(team => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ flex: '1', minWidth: '200px' }}>
            <label htmlFor="filter-start-date" className="form-label">시작 날짜</label>
            <input
              type="date"
              id="filter-start-date"
              className="form-control"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ flex: '1', minWidth: '200px' }}>
            <label htmlFor="filter-end-date" className="form-label">종료 날짜</label>
            <input
              type="date"
              id="filter-end-date"
              className="form-control"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* 스케줄 개수 표시 */}
      <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ margin: 0 }}>
          총 <strong>{filteredSchedules.length}</strong>개의 스케줄이 있습니다.
          {filterTeamId !== 'all' && (
            <span style={{ marginLeft: '10px', color: '#007bff' }}>
              ({teams.find(team => team.id === parseInt(filterTeamId))?.name || `팀 ${filterTeamId}`} 필터 적용됨)
            </span>
          )}
          {!showPastSchedules && (
            <span style={{ marginLeft: '10px', color: '#666' }}>
              (과거 스케줄은 제외됨)
            </span>
          )}
        </p>
      </div>

      {/* 스케줄 목록 */}
      {loading ? (
        <Loading className="loading">로딩 중...</Loading>
      ) : filteredSchedules.length > 0 ? (
        <div>
          {filteredSchedules.map((schedule) => (
            <div
              className="card"
              key={schedule.id}
              style={{
                marginBottom: '20px',
                opacity: isPastSchedule(schedule.date) ? 0.8 : 1,
                backgroundColor: isPastSchedule(schedule.date) ? '#f8f9fa' : '#fff'
              }}
            >
              <div className="card-header" style={{
                borderBottom: isPastSchedule(schedule.date) ? '4px solid #6c757d' : '4px solid #007bff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <FaCalendarAlt style={{ marginRight: '10px' }} />
                  <div>
                    <h3 style={{ margin: 0 }}>
                      {schedule.title || `스케줄 #${schedule.id}`}
                    </h3>
                    <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '3px' }}>
                      {schedule.teamName} - {getRelativeTime(schedule.date)}
                      {/* 사용자 참여 표시 추가 (실제 참여 여부는 renderAttendanceList 내에서 확인) */}
                      {(() => {
                        // 현재 사용자 정보
                        const currentUser = JSON.parse(localStorage.getItem('user')) || {};

                        // 스케줄의 참석자 목록에 현재 사용자가 있는지 확인
                        const isUserSchedule = Array.isArray(schedule.attendances) &&
                          schedule.attendances.some(attendance =>
                            attendance.user && (
                              (currentUser.name && attendance.user.name === currentUser.name) ||
                              (currentUser.studentId && attendance.user.studentId === currentUser.studentId) ||
                              (currentUser.email && attendance.user.email === currentUser.email) ||
                              (currentUser.id && attendance.user.id === currentUser.id)
                            )
                          );

                        if (isUserSchedule) {
                          return (
                            <span style={{
                              marginLeft: '10px',
                              backgroundColor: '#e3fcef',
                              color: '#0ca678',
                              padding: '2px 8px',
                              borderRadius: '10px',
                              fontSize: '0.75rem',
                              fontWeight: 'bold'
                            }}>
                              내 스케줄
                            </span>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  </div>
                </div>
                <span style={{
                  padding: '5px 10px',
                  borderRadius: '4px',
                  backgroundColor: isPastSchedule(schedule.date) ? '#6c757d' : '#007bff',
                  color: 'white',
                  fontSize: '0.85rem',
                  display: 'inline-block'
                }}>
                  {isPastSchedule(schedule.date) ? '지난 일정' : '예정된 일정'}
                </span>
              </div>
              <div style={{ padding: '15px' }}>
                <div style={{ marginBottom: '15px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                  <div>
                    <strong>날짜:</strong> {formatDate(schedule.date)}
                  </div>
                  <div>
                    <strong>시간:</strong> {schedule.time}
                  </div>
                </div>
                <div>
                  <h4 style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                    <FaUsers style={{ marginRight: '10px' }} />
                    참석자 명단 ({Array.isArray(schedule.attendances) ? schedule.attendances.length : 0}명)

                  </h4>
                  <span style={{
                    fontSize: '0.8rem',
                    color: '#666',
                    display: 'flex',
                    alignItems: 'center',
                    color: 'rgb(223, 119, 59)',
                    marginBottom: '5px'
                  }}>
                    <FaLock style={{ marginRight: '5px' }} />
                    자신이 포함된 팀의 스케줄만 출석 상태와 비고를 확인할 수 있습니다
                  </span>
                  {renderAttendanceList(schedule)}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{ padding: '30px', textAlign: 'center' }}>
          <p>검색 결과가 없습니다.</p>
          <p>아래의 버튼을 눌러 지난 스케줄을 확인해보세요.</p>
          {(searchTerm || filterStartDate || filterEndDate || !showPastSchedules || filterTeamId !== 'all') && (
            <div style={{ marginTop: '15px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
              {!showPastSchedules && (
                <button
                  className="btn btn-info"
                  onClick={() => setShowPastSchedules(true)}
                >
                  <FaHistory /> 지난 스케줄 표시하기
                </button>
              )}
              {(searchTerm || filterStartDate || filterEndDate || filterTeamId !== 'all') && (
                <button
                  className="btn btn-secondary"
                  onClick={resetFilters}
                >
                  <FaFilter /> 필터 초기화
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentSchedules;