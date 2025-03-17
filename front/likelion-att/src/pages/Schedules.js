// src/pages/Schedules.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCalendarPlus, FaSearch, FaEdit, FaTrash, FaUserFriends, FaCalendarAlt, FaExclamationTriangle, FaCheckCircle, FaFilter } from 'react-icons/fa';
import { scheduleApi, teamApi } from '../services/api';

// 스케줄 생성 모달 컴포넌트
const ScheduleCreateModal = ({ isOpen, onClose, onSubmit, teams }) => {
  const [scheduleData, setScheduleData] = useState({
    title: '',
    date: '',
    description: '',
    teamId: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    // 모달이 열릴 때 폼 초기화
    if (isOpen) {
      setScheduleData({
        title: '',
        date: '',
        description: '',
        teamId: teams.length > 0 ? teams[0].id : ''
      });
      setError('');
    }
  }, [isOpen, teams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setScheduleData({ ...scheduleData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!scheduleData.title.trim()) {
      setError('스케줄 제목을 입력해주세요.');
      return;
    }
    
    if (!scheduleData.date) {
      setError('날짜를 선택해주세요.');
      return;
    }
    
    if (!scheduleData.teamId) {
      setError('팀을 선택해주세요.');
      return;
    }
    
    onSubmit(scheduleData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">새 스케줄 생성</h2>
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
              <label htmlFor="title" className="form-label">제목 *</label>
              <input
                type="text"
                id="title"
                name="title"
                className="form-control"
                value={scheduleData.title}
                onChange={handleChange}
                placeholder="스케줄 제목을 입력하세요"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="date" className="form-label">날짜 *</label>
              <input
                type="date"
                id="date"
                name="date"
                className="form-control"
                value={scheduleData.date}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="teamId" className="form-label">팀 *</label>
              <select
                id="teamId"
                name="teamId"
                className="form-control"
                value={scheduleData.teamId}
                onChange={handleChange}
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
              <label htmlFor="description" className="form-label">설명</label>
              <textarea
                id="description"
                name="description"
                className="form-control"
                value={scheduleData.description}
                onChange={handleChange}
                placeholder="스케줄에 대한 설명을 입력하세요"
                rows="3"
              />
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
            <strong>{schedule.title}</strong> 스케줄을 삭제하시겠습니까?<br />
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
  
  // 데이터 불러오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 팀 목록 가져오기
        const teamsResponse = await teamApi.getAll();
        setTeams(teamsResponse.data);
        
        // 스케줄 목록 가져오기
        const schedulesResponse = await scheduleApi.getAll();
        setSchedules(schedulesResponse.data);
        setFilteredSchedules(schedulesResponse.data);
        
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

    fetchData();
  }, []);
  
  // 검색어 변경 시 필터링
  useEffect(() => {
    filterSchedules();
  }, [searchTerm, filterTeamId, filterStartDate, filterEndDate, schedules]);

  // 스케줄 필터링 함수
  const filterSchedules = () => {
    let filtered = [...schedules];
    
    // 검색어 필터링
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(schedule => 
        schedule.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (schedule.description && schedule.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        schedule.teamName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // 팀 필터링
    if (filterTeamId !== 'all') {
      filtered = filtered.filter(schedule => schedule.teamId === filterTeamId);
    }
    
    // 날짜 필터링 - 시작일
    if (filterStartDate) {
      filtered = filtered.filter(schedule => new Date(schedule.date) >= new Date(filterStartDate));
    }
    
    // 날짜 필터링 - 종료일
    if (filterEndDate) {
      filtered = filtered.filter(schedule => new Date(schedule.date) <= new Date(filterEndDate));
    }
    
    setFilteredSchedules(filtered);
  };

  // 스케줄 생성 처리
  const handleCreateSchedule = async (scheduleData) => {
    try {
      const response = await scheduleApi.create(scheduleData);
      
      // 팀 이름 가져오기
      const team = teams.find(t => t.id === scheduleData.teamId);
      const newSchedule = { ...response.data, teamName: team ? team.name : '알 수 없음' };
      
      setSchedules([...schedules, newSchedule]);
      setFilteredSchedules([...filteredSchedules, newSchedule]);
      setIsCreateModalOpen(false);
      
      setNotification({
        type: 'success',
        message: '스케줄이 성공적으로 생성되었습니다!'
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
      await scheduleApi.delete(scheduleId);
      
      setSchedules(schedules.filter(schedule => schedule.id !== scheduleId));
      setFilteredSchedules(filteredSchedules.filter(schedule => schedule.id !== scheduleId));
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

  // 필터 초기화
  const resetFilters = () => {
    setSearchTerm('');
    setFilterTeamId('all');
    setFilterStartDate('');
    setFilterEndDate('');
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    return new Date(dateString).toLocaleDateString('ko-KR', options);
  };

  if (loading) {
    return <div className="loading">로딩 중...</div>;
  }

  return (
    <div>
      <div className="card-header" style={{ marginBottom: '20px' }}>
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
        <div style={{ padding: '15px', display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
          <div className="form-group" style={{ flex: '1', minWidth: '200px' }}>
            <label htmlFor="search-term" className="form-label">검색어</label>
            <div className="search-container">
              <input
                type="text"
                id="search-term"
                className="search-input"
                placeholder="제목, 설명 또는 팀 이름으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="search-button">
                <FaSearch />
              </button>
            </div>
          </div>
          
          <div className="form-group" style={{ flex: '1', minWidth: '200px' }}>
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

      {/* 스케줄 목록 */}
      {filteredSchedules.length > 0 ? (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>날짜</th>
                <th>제목</th>
                <th>팀</th>
                <th>참석률</th>
                <th>작성일</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {filteredSchedules.map((schedule) => (
                <tr key={schedule.id}>
                  <td>{formatDate(schedule.date)}</td>
                  <td>
                    <Link to={`/schedules/${schedule.id}`}>{schedule.title}</Link>
                  </td>
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