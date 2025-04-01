// src/pages/student/StudentSchedules.js
import React, { useState, useEffect } from 'react';
import { FaSearch, FaCalendarAlt, FaExclamationTriangle, FaUsers } from 'react-icons/fa';
import api from '../../services/api';

const StudentSchedules = () => {
  const [schedulesByTeam, setSchedulesByTeam] = useState({});
  const [filteredSchedules, setFilteredSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  // 스케줄 목록 불러오기
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/schedules/all');
        setSchedulesByTeam(response.data);
        
        // 모든 스케줄을 단일 배열로 변환
        const allSchedules = [];
        Object.entries(response.data).forEach(([teamId, schedules]) => {
          schedules.forEach(schedule => {
            allSchedules.push({
              ...schedule,
              teamId: teamId,
              teamName: `팀 ${teamId}` // 팀 이름이 응답에 없으므로 임시로 생성
            });
          });
        });
        
        setFilteredSchedules(allSchedules);
      } catch (error) {
        console.error('스케줄 목록 로딩 실패:', error);
        setError('스케줄 목록을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, []);

  // 검색어 및 날짜 필터링
  useEffect(() => {
    // 모든 스케줄을 단일 배열로 변환
    const allSchedules = [];
    Object.entries(schedulesByTeam).forEach(([teamId, schedules]) => {
      schedules.forEach(schedule => {
        allSchedules.push({
          ...schedule,
          teamId: teamId,
          teamName: `팀 ${teamId}`
        });
      });
    });
    
    let filtered = [...allSchedules];
    
    // 검색어 필터링
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(schedule => 
        (schedule.title && schedule.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        schedule.date.includes(searchTerm) ||
        schedule.time.includes(searchTerm) ||
        (`팀 ${schedule.teamId}`).includes(searchTerm) ||
        schedule.attendances.some(att => 
          att.user.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
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
    
    setFilteredSchedules(filtered);
  }, [searchTerm, filterStartDate, filterEndDate, schedulesByTeam]);

  // 필터 초기화
  const resetFilters = () => {
    setSearchTerm('');
    setFilterStartDate('');
    setFilterEndDate('');
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    return new Date(dateString).toLocaleDateString('ko-KR', options);
  };

  // 출석 상태 표시 컴포넌트
  const AttendanceStatus = ({ status }) => {
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

  return (
    <div>
      <h1>전체 스케줄 조회</h1>
      
      {/* 에러 메시지 */}
      {error && (
        <div className="alert alert-error">
          <FaExclamationTriangle />
          <span>{error}</span>
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
                placeholder="날짜, 팀 또는 이름으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="search-button">
                <FaSearch />
              </button>
            </div>
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
      {loading ? (
        <div className="loading">로딩 중...</div>
      ) : filteredSchedules.length > 0 ? (
        <div>
          {filteredSchedules.map((schedule) => (
            <div className="card" key={schedule.id} style={{ marginBottom: '20px' }}>
              <div className="card-header">
                <h3 style={{ display: 'flex', alignItems: 'center' }}>
                  <FaCalendarAlt style={{ marginRight: '10px' }} />
                  {schedule.title || `스케줄 #${schedule.id}`}
                </h3>
                <span>팀 {schedule.teamId}</span>
              </div>
              <div style={{ padding: '15px' }}>
                <div style={{ marginBottom: '15px' }}>
                  <strong>날짜:</strong> {formatDate(schedule.date)}
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <strong>시간:</strong> {schedule.time}
                </div>
                <div>
                  <h4 style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                    <FaUsers style={{ marginRight: '10px' }} />
                    참석자 명단 ({schedule.attendances.length}명)
                  </h4>
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
                        {schedule.attendances.map((attendance) => (
                          <tr key={attendance.id}>
                            <td>{attendance.user.name}</td>
                            <td>{attendance.user.studentId}</td>
                            <td>{attendance.user.role === 'ADMIN' ? '운영진' : '아기사자'}</td>
                            <td>
                              <AttendanceStatus status={attendance.status} />
                            </td>
                            <td>{attendance.note || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{ padding: '30px', textAlign: 'center' }}>
          <p>검색 결과가 없습니다.</p>
          {(searchTerm || filterStartDate || filterEndDate) && (
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
    </div>
  );
};

export default StudentSchedules;