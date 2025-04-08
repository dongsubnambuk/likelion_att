// src/pages/Schedules.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCalendarPlus, FaSearch, FaEdit, FaTrash, FaUserFriends, FaCalendarAlt, FaExclamationTriangle, FaCheckCircle, FaFilter, FaPlus, FaTimes } from 'react-icons/fa';
import { scheduleApi, teamApi } from '../services/api';

// 스케줄 생성 모달 컴포넌트 (여러 날짜 추가 기능 포함)
const ScheduleCreateModal = ({ isOpen, onClose, onSubmit, teams }) => {
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [schedules, setSchedules] = useState([
    { date: '', time: '14:30:00' }
  ]);
  const [error, setError] = useState('');

  useEffect(() => {
    // 모달이 열릴 때 폼 초기화
    if (isOpen) {
      setSelectedTeamId(teams.length > 0 ? teams[0].id : '');
      setSchedules([{ date: '', time: '14:30:00' }]);
      setError('');
    }
  }, [isOpen, teams]);

  const handleTeamChange = (e) => {
    setSelectedTeamId(e.target.value);
  };

  const handleScheduleChange = (index, field, value) => {
    const updatedSchedules = [...schedules];
    updatedSchedules[index][field] = value;
    setSchedules(updatedSchedules);
  };

  const addSchedule = () => {
    setSchedules([...schedules, { date: '', time: '14:30:00' }]);
  };

  const removeSchedule = (index) => {
    if (schedules.length > 1) {
      const updatedSchedules = [...schedules];
      updatedSchedules.splice(index, 1);
      setSchedules(updatedSchedules);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedTeamId) {
      setError('팀을 선택해주세요.');
      return;
    }

    // 날짜가 비어있는 스케줄이 있는지 확인
    const hasEmptyDate = schedules.some(schedule => !schedule.date);
    if (hasEmptyDate) {
      setError('모든 스케줄의 날짜를 입력해주세요.');
      return;
    }

    // API 호출에 알맞게 데이터 전달
    onSubmit(selectedTeamId, schedules);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">스케줄 생성</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div className="alert alert-error">
                <FaExclamationTriangle />
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="teamId" className="form-label">팀 *</label>
              <select
                id="teamId"
                className="form-control"
                value={selectedTeamId}
                onChange={handleTeamChange}
                required
              >
                <option value="">팀 선택</option>
                {teams.map(team => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">스케줄 일정 *</label>
              <div className="schedules-container">
                {schedules.map((schedule, index) => (
                  <div key={index} className="schedule-item" style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ flex: 2, marginRight: '10px' }}>
                      <input
                        type="date"
                        className="form-control"
                        value={schedule.date}
                        onChange={(e) => handleScheduleChange(index, 'date', e.target.value)}
                        required
                      />
                    </div>
                    <div style={{ flex: 1, marginRight: '10px' }}>
                      <input
                        type="time"
                        className="form-control"
                        value={schedule.time}
                        onChange={(e) => handleScheduleChange(index, 'time', e.target.value)}
                        required
                      />
                    </div>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => removeSchedule(index)}
                      disabled={schedules.length <= 1}
                      style={{ marginLeft: '5px' }}
                    >
                      <FaTimes />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={addSchedule}
                  style={{ marginTop: '10px' }}
                >
                  <FaPlus /> 스케줄 추가
                </button>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              취소
            </button>
            <button type="submit" className="btn btn-primary">
              생성하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 스케줄 삭제 확인 모달 컴포넌트
const ScheduleDeleteModal = ({ isOpen, schedule, onClose, onConfirm }) => {
  if (!isOpen || !schedule) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">스케줄 삭제</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          <div className="alert alert-warning">
            <FaExclamationTriangle />
            <span>이 작업은 되돌릴 수 없습니다.</span>
          </div>
          <p>
            <strong>{schedule.date} {schedule.time}</strong> 스케줄을 삭제하시겠습니까?<br />
            이 스케줄의 모든 출석 기록이 함께 삭제됩니다.
          </p>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            취소
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => onConfirm(schedule.id)}
          >
            삭제하기
          </button>
        </div>
      </div>
    </div>
  );
};

// 메인 Schedules 컴포넌트
const Schedules = () => {
  const [schedules, setSchedules] = useState([]);
  const [filteredSchedules, setFilteredSchedules] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [notification, setNotification] = useState(null);
  const [filterTeamId, setFilterTeamId] = useState('all');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  // 기본 정렬 설정을 날짜 오름차순으로 변경
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'asc' });

  // fetchData 함수를 컴포넌트 내부에서 정의
  const fetchData = async () => {
    try {
      setLoading(true);

      // 팀 목록 가져오기
      const teamsResponse = await teamApi.getAll();

      // API 응답 구조에 따라 팀 데이터 추출
      let teamsData = [];
      if (teamsResponse.data && typeof teamsResponse.data === 'object') {
        // 팀 배열로 변환
        teamsData = Object.entries(teamsResponse.data).map(([teamId, teamData]) => {
          // teamData는 { "팀설명": [멤버배열] } 형태
          if (typeof teamData === 'object') {
            // 팀 설명(키)과 멤버 배열(값) 추출
            const teamEntries = Object.entries(teamData);

            if (teamEntries.length > 0) {
              const [teamDescription, members] = teamEntries[0];

              return {
                id: parseInt(teamId),
                name: `팀 ${teamId}`,
                description: teamDescription,
                memberCount: Array.isArray(members) ? members.length : 0
              };
            }
          }
          return {
            id: parseInt(teamId),
            name: `팀 ${teamId}`,
            memberCount: 0
          };
        });
      }

      setTeams(teamsData);

      // 전체 스케줄 가져오기 - API 명세에 맞게 수정
      const schedulesResponse = await scheduleApi.getAll();
      console.log('스케줄 데이터 응답:', schedulesResponse.data);

      // 스케줄 데이터 처리 (API 응답에 맞춤)
      let schedulesData = [];
      if (schedulesResponse.data && typeof schedulesResponse.data === 'object') {
        // 각 팀의 스케줄 통합
        Object.entries(schedulesResponse.data).forEach(([teamId, teamSchedules]) => {
          if (Array.isArray(teamSchedules)) {
            const teamSchedulesWithTeamId = teamSchedules.map(schedule => ({
              ...schedule,
              teamId: parseInt(teamId)
            }));
            schedulesData = [...schedulesData, ...teamSchedulesWithTeamId];
          }
        });
      }

      // 팀 정보와 함께 스케줄 데이터 구성
      schedulesData = schedulesData.map(schedule => {
        const team = teamsData.find(t => t.id === schedule.teamId);

        // 출석률 계산 (있는 경우)
        let attendanceRate = 0;
        if (schedule.attendances && Array.isArray(schedule.attendances)) {
          const total = schedule.attendances.length;
          const present = schedule.attendances.filter(a =>
            a.status === 'PRESENT' || a.status === 'present').length;
          const late = schedule.attendances.filter(a =>
            a.status === 'LATE' || a.status === 'late').length;
          attendanceRate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;
        }

        return {
          ...schedule,
          teamName: team ? team.name : `팀 ${schedule.teamId}`,
          attendanceRate,
          createdAt: schedule.createdAt || new Date().toISOString()
        };
      });

      console.log('변환된 스케줄 배열:', schedulesData);

      // 날짜 오름차순으로 정렬
      schedulesData.sort((a, b) => {
        if (a.date < b.date) return -1;
        if (a.date > b.date) return 1;
        return 0;
      });

      setSchedules(schedulesData);
      setFilteredSchedules(schedulesData);

    } catch (error) {
      console.error('데이터 로딩 실패:', error);
      setNotification({
        type: 'error',
        message: '데이터를 불러오는데 실패했습니다.'
      });
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 데이터 불러오기
  useEffect(() => {
    fetchData();
  }, []);

  // 검색어 변경 시 필터링
  useEffect(() => {
    filterSchedules();
  }, [searchTerm, filterTeamId, filterStartDate, filterEndDate, schedules, sortConfig]);

  // 스케줄 필터링 및 정렬 함수
  const filterSchedules = () => {
    let filtered = [...schedules];

    // 검색어 필터링
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(schedule =>
        (schedule.date && schedule.date.includes(searchTerm)) ||
        (schedule.time && schedule.time.includes(searchTerm)) ||
        (schedule.teamName && schedule.teamName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // 팀 필터링
    if (filterTeamId !== 'all') {
      filtered = filtered.filter(schedule => schedule.teamId === parseInt(filterTeamId));
    }

    // 날짜 필터링 - 시작일
    if (filterStartDate) {
      filtered = filtered.filter(schedule => schedule.date >= filterStartDate);
    }

    // 날짜 필터링 - 종료일
    if (filterEndDate) {
      filtered = filtered.filter(schedule => schedule.date <= filterEndDate);
    }

    // 정렬 적용
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredSchedules(filtered);
  };

  // 스케줄 생성 처리
  const handleCreateSchedule = async (teamId, schedulesList) => {
    try {
      console.log('스케줄 생성 요청:', { teamId, schedulesList });

      // 요청할 스케줄 목록 구성
      const formattedSchedules = schedulesList.map(schedule => ({
        date: schedule.date,
        time: schedule.time
      }));

      // scheduleApi.create 호출 (API 명세에 맞게 수정)
      const response = await scheduleApi.create(formattedSchedules, teamId);
      console.log('스케줄 생성 응답:', response);

      // 생성된 스케줄에 대한 정보가 없으므로, 전체 데이터를 다시 불러옴
      await fetchData();

      setIsCreateModalOpen(false);

      setNotification({
        type: 'success',
        message: `${schedulesList.length}개의 스케줄이 성공적으로 생성되었습니다!`
      });

      setTimeout(() => {
        setNotification(null);
      }, 3000);

    } catch (error) {
      console.error('스케줄 생성 실패:', error);
      setNotification({
        type: 'error',
        message: '스케줄 생성에 실패했습니다. 다시 시도해주세요.'
      });
    }
  };

  // 스케줄 삭제 처리
  const handleDeleteSchedule = async (scheduleId) => {
    try {
      // 해당 스케줄의 팀 ID 찾기
      const schedule = schedules.find(s => s.id === scheduleId);
      if (!schedule) {
        throw new Error('스케줄 정보를 찾을 수 없습니다.');
      }

      // teamId와 scheduleId를 함께 전달하여 API 호출
      await scheduleApi.delete(scheduleId, schedule.teamId);

      // UI 업데이트
      setSchedules(schedules.filter(s => s.id !== scheduleId));
      setFilteredSchedules(filteredSchedules.filter(s => s.id !== scheduleId));
      setIsDeleteModalOpen(false);
      setSelectedSchedule(null);

      setNotification({
        type: 'success',
        message: '스케줄이 성공적으로 삭제되었습니다!'
      });

      setTimeout(() => {
        setNotification(null);
      }, 3000);

    } catch (error) {
      console.error('스케줄 삭제 실패:', error);
      setNotification({
        type: 'error',
        message: '스케줄 삭제에 실패했습니다. 다시 시도해주세요.'
      });
    }
  };

  // 정렬 요청 처리
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // 필터 초기화
  const resetFilters = () => {
    setSearchTerm('');
    setFilterTeamId('all');
    setFilterStartDate('');
    setFilterEndDate('');
  };

  // 날짜 포맷 함수
  const formatDateTime = (date, time) => {
    if (!date) return '날짜 없음';

    // 날짜 포맷팅
    const dateObj = new Date(`${date}T${time || '00:00:00'}`);
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    const formattedDate = dateObj.toLocaleDateString('ko-KR', options);

    // 시간이 있으면 시간도 포맷팅
    if (time) {
      const timeOptions = { hour: '2-digit', minute: '2-digit' };
      const formattedTime = dateObj.toLocaleTimeString('ko-KR', timeOptions);
      return `${formattedDate} ${formattedTime}`;
    }

    return formattedDate;
  };

  if (loading) {
    return <div className="loading">로딩 중...</div>;
  }

  return (
    <div>
      <div className="card-header" style={{ marginBottom: '20px', marginRight: "60px" }}>
        <h1>스케줄 관리</h1>
        <button
          className="btn btn-primary"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <FaCalendarPlus /> 새 스케줄 생성
        </button>
      </div>

      {/* 알림 메시지 */}
      {notification && (
        <div className={`alert alert-${notification.type}`}>
          {notification.type === 'success' ? <FaCheckCircle /> : <FaExclamationTriangle />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* 필터 영역 */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-header">
          <h2>스케줄 필터</h2>
          <button className="btn btn-secondary btn-sm" onClick={resetFilters}>
            필터 초기화
          </button>
        </div>
        <div style={{ padding: '15px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {/* 검색어 필드 - 항상 전체 너비 차지 */}
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

          {/* 나머지 필터 필드들을 한 행에 배치 */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
            {/* 팀 선택 필드 */}
            <div className="form-group" style={{ flex: '1 1 200px', minWidth: '200px' }}>
              <label htmlFor="filter-team" className="form-label">팀 선택</label>
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

            {/* 시작 날짜 필드 */}
            <div className="form-group" style={{ flex: '1 1 200px', minWidth: '200px' }}>
              <label htmlFor="filter-start-date" className="form-label">시작 날짜</label>
              <input
                type="date"
                id="filter-start-date"
                className="form-control"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
              />
            </div>

            {/* 종료 날짜 필드 */}
            <div className="form-group" style={{ flex: '1 1 200px', minWidth: '200px' }}>
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
      </div>

      {/* 스케줄 목록 */}
      {filteredSchedules.length > 0 ? (
        <div className="card">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>날짜</th>
                  <th>시간</th>
                  <th>팀</th>
                  <th>참석률</th>
                  <th>생성일</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {filteredSchedules.map((schedule) => (
                  <tr key={schedule.id}>
                    <td>{schedule.date}</td>
                    <td>{schedule.time}</td>
                    <td>
                      <Link to={`/teams/${schedule.teamId}`}>{schedule.teamName}</Link>
                    </td>
                    <td>{schedule.attendanceRate || '0'}%</td>
                    <td>{new Date(schedule.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <Link
                          to={`/schedules/${schedule.id}`}
                          className="btn btn-primary btn-sm"
                          title="출석체크"
                        >
                          <FaCalendarAlt />
                        </Link>
                        <Link
                          to={`/teams/${schedule.teamId}`}
                          className="btn btn-secondary btn-sm"
                          title="팀 보기"
                        >
                          <FaUserFriends />
                        </Link>
                        <button
                          className="btn btn-danger btn-sm"
                          title="삭제"
                          onClick={() => {
                            setSelectedSchedule(schedule);
                            setIsDeleteModalOpen(true);
                          }}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: '30px', textAlign: 'center' }}>
          <p>검색 결과가 없습니다.</p>
          {(searchTerm || filterTeamId !== 'all' || filterStartDate || filterEndDate) && (
            <button
              className="btn btn-secondary"
              style={{ marginTop: '10px' }}
              onClick={resetFilters}
            >
              필터 초기화
            </button>
          )}
        </div>
      )}

      {/* 스케줄 생성 모달 */}
      <ScheduleCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSchedule}
        teams={teams}
      />

      {/* 스케줄 삭제 확인 모달 */}
      <ScheduleDeleteModal
        isOpen={isDeleteModalOpen}
        schedule={selectedSchedule}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedSchedule(null);
        }}
        onConfirm={handleDeleteSchedule}
      />
    </div>
  );
};

export default Schedules;