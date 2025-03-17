// src/pages/TeamDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaUserPlus, FaUserMinus, FaEdit, FaCalendarPlus, FaArrowLeft, FaTrash, FaCalendarAlt, FaUser, FaExclamationTriangle, FaCheckCircle, FaSearch } from 'react-icons/fa';
import { teamApi, userApi, scheduleApi } from '../services/api';
import { Tabs, Tab } from '../components/Tabs'; // 외부 Tabs 컴포넌트 임포트

// 팀원 관리 탭 컴포넌트
const MembersTab = ({ team, members, onAddMember, onRemoveMember }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);

    // 사용자 검색
    const handleSearch = async () => {
        if (!searchTerm.trim()) return;

        try {
            setSearchLoading(true);
            const response = await userApi.search(searchTerm);

            // 이미 팀에 있는 멤버는 필터링
            const filteredResults = response.data.filter(
                user => !members.some(member => member.id === user.id)
            );

            setSearchResults(filteredResults);
            setIsSearching(true);
        } catch (error) {
            console.error('사용자 검색 실패:', error);
        } finally {
            setSearchLoading(false);
        }
    };

    // 사용자 추가
    const handleAddMember = async (userId) => {
        try {
            await onAddMember(userId);
            // 검색 결과에서 추가된 사용자 제거
            setSearchResults(searchResults.filter(user => user.id !== userId));
        } catch (error) {
            console.error('팀원 추가 실패:', error);
        }
    };

    return (
        <div>
            <div className="card-header" style={{ marginBottom: '20px' }}>
                <h2>팀원 관리</h2>
                <div>
                    <button
                        className="btn btn-primary"
                        onClick={() => setIsSearching(!isSearching)}
                    >
                        <FaUserPlus /> 팀원 추가
                    </button>
                </div>
            </div>

            {/* 팀원 검색 섹션 */}
            {isSearching && (
                <div className="card" style={{ marginBottom: '20px' }}>
                    <h3>사용자 검색</h3>
                    <div className="search-container">
                        <input
                            type="text"
                            className="search-input"
                            placeholder="이름 또는 학번으로 검색..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <button
                            className="search-button"
                            onClick={handleSearch}
                            disabled={searchLoading}
                        >
                            <FaSearch />
                        </button>
                    </div>

                    {searchLoading ? (
                        <div className="loading">검색 중...</div>
                    ) : searchResults.length > 0 ? (
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>이름</th>
                                        <th>학번</th>
                                        <th>연락처</th>
                                        <th>추가</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {searchResults.map((user) => (
                                        <tr key={user.id}>
                                            <td>{user.name}</td>
                                            <td>{user.studentId}</td>
                                            <td>{user.phone || '-'}</td>
                                            <td>
                                                <button
                                                    className="btn btn-primary btn-sm"
                                                    onClick={() => handleAddMember(user.id)}
                                                >
                                                    <FaUserPlus /> 추가
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : searchTerm ? (
                        <p>검색 결과가 없습니다.</p>
                    ) : null}
                </div>
            )}

            {/* 팀원 목록 */}
            <div className="card">
                <h3>팀원 목록 ({members.length}명)</h3>
                {members.length > 0 ? (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>이름</th>
                                    <th>학번</th>
                                    <th>연락처</th>
                                    <th>출석률</th>
                                    <th>관리</th>
                                </tr>
                            </thead>
                            <tbody>
                                {members.map((member) => (
                                    <tr key={member.id}>
                                        <td>
                                            <Link to={`/members/${member.id}`}>{member.name}</Link>
                                        </td>
                                        <td>{member.studentId}</td>
                                        <td>{member.phone || '-'}</td>
                                        <td>{member.attendanceRate || '0'}%</td>
                                        <td>
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() => onRemoveMember(member.id)}
                                            >
                                                <FaUserMinus /> 제거
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p>팀원이 없습니다.</p>
                )}
            </div>
        </div>
    );
};

// 스케줄 관리 탭 컴포넌트
const SchedulesTab = ({ team, schedules, onCreateSchedule, onDeleteSchedule }) => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newSchedule, setNewSchedule] = useState({
        title: '',
        date: '',
        description: '',
        teamId: team.id
    });
    const [error, setError] = useState('');

    const handleCreateSchedule = async (e) => {
        e.preventDefault();

        if (!newSchedule.title || !newSchedule.date) {
            setError('제목과 날짜는 필수 입력사항입니다.');
            return;
        }

        try {
            await onCreateSchedule(newSchedule);
            setIsCreateModalOpen(false);
            // 폼 초기화
            setNewSchedule({
                title: '',
                date: '',
                description: '',
                teamId: team.id
            });
            setError('');
        } catch (error) {
            console.error('스케줄 생성 실패:', error);
            setError('스케줄 생성에 실패했습니다. 다시 시도해주세요.');
        }
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
        return new Date(dateString).toLocaleDateString('ko-KR', options);
    };

    return (
        <div>
            <div className="card-header" style={{ marginBottom: '20px' }}>
                <h2>스케줄 관리</h2>
                <button
                    className="btn btn-primary"
                    onClick={() => setIsCreateModalOpen(true)}
                >
                    <FaCalendarPlus /> 새 스케줄 생성
                </button>
            </div>

            {/* 스케줄 목록 */}
            {schedules.length > 0 ? (
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>제목</th>
                                <th>날짜</th>
                                <th>참석율</th>
                                <th>관리</th>
                            </tr>
                        </thead>
                        <tbody>
                            {schedules.map((schedule) => (
                                <tr key={schedule.id}>
                                    <td>
                                        <Link to={`/schedules/${schedule.id}`}>{schedule.title}</Link>
                                    </td>
                                    <td>{formatDate(schedule.date)}</td>
                                    <td>{schedule.attendanceRate || '0'}%</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '5px' }}>
                                            <Link
                                                to={`/schedules/${schedule.id}`}
                                                className="btn btn-primary btn-sm"
                                                title="출석체크"
                                            >
                                                <FaUser />
                                            </Link>
                                            <button
                                                className="btn btn-danger btn-sm"
                                                title="삭제"
                                                onClick={() => onDeleteSchedule(schedule.id)}
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
                <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
                    <p>등록된 스케줄이 없습니다.</p>
                </div>
            )}

            {/* 스케줄 생성 모달 */}
            {isCreateModalOpen && (
                <div className="modal-backdrop">
                    <div className="modal">
                        <div className="modal-header">
                            <h2 className="modal-title">새 스케줄 생성</h2>
                            <button
                                className="modal-close"
                                onClick={() => setIsCreateModalOpen(false)}
                            >
                                &times;
                            </button>
                        </div>

                        <form onSubmit={handleCreateSchedule}>
                            <div className="modal-body">
                                {error && (
                                    <div className="alert alert-error">
                                        <FaExclamationTriangle />
                                        <span>{error}</span>
                                    </div>
                                )}

                                <div className="form-group">
                                    <label htmlFor="schedule-title" className="form-label">제목 *</label>
                                    <input
                                        type="text"
                                        id="schedule-title"
                                        className="form-control"
                                        value={newSchedule.title}
                                        onChange={(e) => setNewSchedule({ ...newSchedule, title: e.target.value })}
                                        placeholder="스케줄 제목을 입력하세요"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="schedule-date" className="form-label">날짜 *</label>
                                    <input
                                        type="date"
                                        id="schedule-date"
                                        className="form-control"
                                        value={newSchedule.date}
                                        onChange={(e) => setNewSchedule({ ...newSchedule, date: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="schedule-description" className="form-label">설명</label>
                                    <textarea
                                        id="schedule-description"
                                        className="form-control"
                                        value={newSchedule.description}
                                        onChange={(e) => setNewSchedule({ ...newSchedule, description: e.target.value })}
                                        placeholder="스케줄에 대한 설명을 입력하세요"
                                        rows="3"
                                    />
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setIsCreateModalOpen(false)}
                                >
                                    취소
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    생성하기
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// 메인 TeamDetail 컴포넌트
const TeamDetail = () => {
    const { teamId } = useParams();
    const navigate = useNavigate();
    const [team, setTeam] = useState(null);
    const [members, setMembers] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); // error 상태 추가
    const [notification, setNotification] = useState(null);

    // 팀 정보 불러오기
    useEffect(() => {
        const fetchTeamData = async () => {
            try {
              setLoading(true);
              // 전체 팀 목록 가져오기
              const teamsResponse = await teamApi.getAll();
              
              // 팀 ID에 해당하는 데이터 찾기
              if (teamsResponse.data && typeof teamsResponse.data === 'object') {
                const teamMembers = teamsResponse.data[teamId];
                
                if (teamMembers) {
                  // 팀 정보 설정
                  setTeam({
                    id: parseInt(teamId),
                    name: `팀 ${teamId}`,
                    memberCount: teamMembers.length,
                    description: '',
                    createdAt: new Date().toISOString()
                  });
                  
                  // 팀원 정보 설정
                  const formattedMembers = teamMembers.map(member => ({
                    id: member.studentId,
                    name: member.name,
                    studentId: member.studentId,
                    role: member.role,
                    attendanceRate: 0,
                    phone: '',
                    email: ''
                  }));
                  
                  setMembers(formattedMembers);
                } else {
                  // 팀이 존재하지 않음
                  setError('팀 정보를 찾을 수 없습니다.');
                  // setNotification도 설정 가능
                  setNotification({
                    type: 'error',
                    message: '팀 정보를 찾을 수 없습니다.'
                  });
                }
              } else {
                // 예상치 못한 응답 형식
                setError('서버에서 올바른 팀 정보를 반환하지 않았습니다.');
                setNotification({
                  type: 'error',
                  message: '서버에서 올바른 팀 정보를 반환하지 않았습니다.'
                });
              }
              
              // 팀 스케줄 가져오기 (API가 있는 경우)
              try {
                const schedulesResponse = await scheduleApi.getByTeam(teamId);
                setSchedules(schedulesResponse.data || []);
              } catch (scheduleError) {
                console.error('스케줄 데이터 로딩 실패:', scheduleError);
                setSchedules([]);
              }
            } catch (error) {
              console.error('팀 데이터 로딩 실패:', error);
              setError('팀 정보를 불러오는데 실패했습니다.');
              setNotification({
                type: 'error',
                message: '팀 정보를 불러오는데 실패했습니다.'
              });
            } finally {
              setLoading(false);
            }
          };

        fetchTeamData();
    }, [teamId]);

    // 팀원 추가
    const handleAddMember = async (userId) => {
        try {
            const response = await teamApi.addMember(teamId, userId);
            setMembers([...members, response.data]);

            setNotification({
                type: 'success',
                message: '팀원이 성공적으로 추가되었습니다!'
            });

            setTimeout(() => {
                setNotification(null);
            }, 3000);

        } catch (error) {
            console.error('팀원 추가 실패:', error);
            setNotification({
                type: 'error',
                message: '팀원 추가에 실패했습니다. 다시 시도해주세요.'
            });
            throw error;
        }
    };

    // 팀원 제거
    const handleRemoveMember = async (userId) => {
        if (!window.confirm('정말 이 팀원을 제거하시겠습니까?')) {
            return;
        }

        try {
            await teamApi.removeMember(teamId, userId);
            setMembers(members.filter(member => member.id !== userId));

            setNotification({
                type: 'success',
                message: '팀원이 성공적으로 제거되었습니다!'
            });

            setTimeout(() => {
                setNotification(null);
            }, 3000);

        } catch (error) {
            console.error('팀원 제거 실패:', error);
            setNotification({
                type: 'error',
                message: '팀원 제거에 실패했습니다. 다시 시도해주세요.'
            });
        }
    };

    // 스케줄 생성
    const handleCreateSchedule = async (scheduleData) => {
        try {
            const response = await scheduleApi.create(scheduleData);
            setSchedules([...schedules, response.data]);

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
            throw error;
        }
    };

    // 스케줄 삭제
    const handleDeleteSchedule = async (scheduleId) => {
        if (!window.confirm('정말 이 스케줄을 삭제하시겠습니까?')) {
            return;
        }

        try {
            await scheduleApi.delete(scheduleId);
            setSchedules(schedules.filter(schedule => schedule.id !== scheduleId));

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

    if (loading) {
        return <div className="loading">로딩 중...</div>;
    }

    if (!team) {
        return (
            <div className="card" style={{ padding: '30px', textAlign: 'center' }}>
                <p>팀 정보를 찾을 수 없습니다.</p>
                <button
                    className="btn btn-primary"
                    style={{ marginTop: '20px' }}
                    onClick={() => navigate('/teams')}
                >
                    팀 목록으로 돌아가기
                </button>
            </div>
        );
    }

    return (
        <div>
            <div className="card-header">
                <button
                    className="btn btn-secondary"
                    onClick={() => navigate('/teams')}
                    style={{ marginRight: '10px' }}
                >
                    <FaArrowLeft /> 목록으로
                </button>
                <h1>{team.name}</h1>
            </div>

            {/* 알림 메시지 */}
            {notification && (
                <div className={`alert alert-${notification.type}`}>
                    {notification.type === 'success' ? <FaCheckCircle /> : <FaExclamationTriangle />}
                    <span>{notification.message}</span>
                </div>
            )}

            {/* 팀 정보 카드 */}
            <div className="card" style={{ marginBottom: '20px' }}>
                <div className="card-header">
                    <h2>팀 정보</h2>
                    <button className="btn btn-primary btn-sm">
                        <FaEdit /> 수정
                    </button>
                </div>
                <div style={{ padding: '0 15px' }}>
                    <p>
                        <strong>설명:</strong> {team.description || '설명 없음'}
                    </p>
                    <p>
                        <strong>생성일:</strong> {new Date(team.createdAt).toLocaleDateString()}
                    </p>
                    <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
                        <div>
                            <strong>팀원 수:</strong> {members.length}명
                        </div>
                        <div>
                            <strong>스케줄 수:</strong> {schedules.length}개
                        </div>
                        <div>
                            <strong>평균 출석률:</strong> {team.averageAttendance || 0}%
                        </div>
                    </div>
                </div>
            </div>

            {/* 탭 컴포넌트 */}
            <div className="card">
                <Tabs>
                    <Tab title="팀원 관리">
                        <MembersTab
                            team={team}
                            members={members}
                            onAddMember={handleAddMember}
                            onRemoveMember={handleRemoveMember}
                        />
                    </Tab>
                    <Tab title="스케줄 관리">
                        <SchedulesTab
                            team={team}
                            schedules={schedules}
                            onCreateSchedule={handleCreateSchedule}
                            onDeleteSchedule={handleDeleteSchedule}
                        />
                    </Tab>
                </Tabs>
            </div>
        </div>
    );
};

export default TeamDetail;