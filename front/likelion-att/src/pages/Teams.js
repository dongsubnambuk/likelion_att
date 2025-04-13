// src/pages/Teams.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaUserFriends, FaCalendarAlt, FaExclamationTriangle, FaCheckCircle, FaSort, FaSortUp, FaSortDown, FaUsers } from 'react-icons/fa';
import { teamApi, userApi } from '../services/api';
import ErrorBoundary from '../components/ErrorBoundary';
import Loading from '../components/common/Loading';
import { TRACK_MAPPING } from '../utils/constants';

// 팀 생성 모달 컴포넌트 (세로 크기 조정 및 스크롤 추가)
const TeamCreateModal = ({ isOpen, onClose, onSubmit, existingTeams = [] }) => {
  const [teamId, setTeamId] = useState('');
  const [teamNote, setTeamNote] = useState(''); // 설명(note) 필드 추가
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [allMembers, setAllMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(true); // 생성 모드인지 수정 모드인지 구분
  const [showAdmins, setShowAdmins] = useState(true); // 운영진 표시 여부 (기본값: 표시)
  const [memberTeams, setMemberTeams] = useState({});
  const [currentTeamMembers, setCurrentTeamMembers] = useState([]);
  const [membershipFilter, setMembershipFilter] = useState('all'); // 'all', 'current', 'other', 'none'

  const teamsArray = Array.isArray(existingTeams) ? existingTeams : [];

  // 컴포넌트 마운트 시 모든 사용자 불러오기
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await userApi.getAll();

        // API 응답 구조에 따라 사용자 데이터 추출
        let usersData = [];
        if (response.data) {
          if (response.data.admin && Array.isArray(response.data.admin)) {
            usersData = [...usersData, ...response.data.admin];
          }
          if (response.data.users && Array.isArray(response.data.users)) {
            usersData = [...usersData, ...response.data.users];
          }
        }

        // 유효한 사용자 데이터인지 확인하고 설정
        if (Array.isArray(usersData)) {
          setAllMembers(usersData);
        } else {
          setAllMembers([]);
        }
      } catch (err) {
        setError('사용자 목록을 불러오는데 실패했습니다.');
        setAllMembers([]);
      } finally {
        setLoading(false);
      }
    };

    const fetchTeamMemberships = async () => {
      if (isOpen) {
        // 모든 팀 정보를 가져와서 각 사용자가 어떤 팀에 속해있는지 매핑
        try {
          const response = await teamApi.getAll();
          const teamsData = response.data;
          const memberships = {};

          if (teamsData && typeof teamsData === 'object') {
            // 각 팀별로 멤버 정보 순회
            Object.entries(teamsData).forEach(([teamId, teamInfo]) => {
              const teamName = Object.keys(teamInfo)[0];
              const members = teamInfo[teamName];

              // 각 멤버의 팀 소속 정보 기록
              if (Array.isArray(members)) {
                members.forEach(member => {
                  const studentId = member.studentId.toString();
                  if (!memberships[studentId]) {
                    memberships[studentId] = [];
                  }
                  memberships[studentId].push({
                    teamId: parseInt(teamId),
                    teamName: `팀 ${teamId} (${teamName})`
                  });
                });
              }
            });
          }

          setMemberTeams(memberships);
        } catch (error) {
          console.error('팀 구성원 정보 로딩 실패:', error);
        }
      }
    };

    if (isOpen) {
      fetchUsers();
      fetchTeamMemberships();
      setIsCreating(true);
      setTeamId('');
      setTeamNote(''); // 설명 필드 초기화
      setSelectedMembers([]);
      setError('');
      setShowAdmins(true); // 모달이 열릴 때 운영진 표시 설정 초기화
      setMembershipFilter('all');
    }
  }, [isOpen]);

  // 팀 선택 시 현재 팀 멤버 가져오기
  useEffect(() => {
    const fetchCurrentTeamMembers = async () => {
      if (!isCreating && teamId) {
        try {
          const response = await teamApi.getById(teamId);
          if (response.data && response.data.members) {
            // 현재 팀 멤버의 학번 목록 저장
            const memberIds = response.data.members.map(member =>
              member.studentId.toString()
            );
            setCurrentTeamMembers(memberIds);

            // 기존 팀원 자동 선택 (선택적으로 활성화)
            // setSelectedMembers(memberIds);
          }
        } catch (error) {
          console.error('현재 팀 멤버 로딩 실패:', error);
        }
      } else {
        setCurrentTeamMembers([]);
      }
    };

    fetchCurrentTeamMembers();
  }, [teamId, isCreating]);

  // 기존 팀 선택 시 모드 변경 및 설명 가져오기
  const handleTeamIdChange = (e) => {
    const id = e.target.value;
    setTeamId(id);

    // 드롭다운에서 옵션 선택 시 빈 문자열(새 팀 생성)이 아니면 수정 모드로 설정
    if (id !== '') {
      setIsCreating(false);

      // 선택한 팀의 설명(note) 가져오기
      const selectedTeam = teamsArray.find(team => team.id === parseInt(id));
      if (selectedTeam && selectedTeam.description) {
        setTeamNote(selectedTeam.description);
      } else {
        setTeamNote('');
      }
    }
  };

  // 멤버 선택/해제 토글
  const toggleMemberSelection = (memberId) => {
    if (selectedMembers.includes(memberId)) {
      setSelectedMembers(selectedMembers.filter(id => id !== memberId));
    } else {
      setSelectedMembers([...selectedMembers, memberId]);
    }
  };

  // 제출 처리
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!teamId && isCreating) {
      // 새 팀 생성 시 팀 ID가 없으면 오류
      setError('팀 ID를 입력해주세요.');
      return;
    }

    if (!Array.isArray(selectedMembers) || selectedMembers.length === 0) {
      setError('최소 한 명 이상의 멤버를 선택해주세요.');
      return;
    }

    // 팀 ID를 숫자로 변환
    const numericTeamId = teamId ? parseInt(teamId) : null;

    // 선택된 멤버의 학번(studentId) 배열 생성 - 안전하게 처리
    // API 요구사항에 맞게 숫자 배열로 변환
    const studentIds = [];

    if (Array.isArray(allMembers)) {
      for (const memberId of selectedMembers) {
        // member.id 또는 member.studentId로 찾기 시도
        const member = allMembers.find(m =>
          (m.id !== undefined && m.id === memberId) ||
          (m.studentId !== undefined && m.studentId === memberId)
        );

        if (member && member.studentId) {
          // 문자열로 된 학번을 숫자로 변환 (필요한 경우)
          const studentIdNumber = parseInt(member.studentId);
          if (!isNaN(studentIdNumber)) {
            studentIds.push(studentIdNumber);
          } else {
            studentIds.push(member.studentId); // 숫자로 변환할 수 없는 경우 원래 값 사용
          }
        } else if (member && member.id) {
          // 학번이 없으면 ID를 사용
          if (typeof member.id === 'number') {
            studentIds.push(member.id);
          } else {
            const idNumber = parseInt(member.id);
            if (!isNaN(idNumber)) {
              studentIds.push(idNumber);
            } else {
              studentIds.push(member.id);
            }
          }
        } else if (typeof memberId === 'number') {
          // 멤버를 찾지 못했지만 ID가 숫자면 그대로 사용
          studentIds.push(memberId);
        } else {
          // 문자열인 경우 숫자로 변환 시도
          const idNumber = parseInt(memberId);
          if (!isNaN(idNumber)) {
            studentIds.push(idNumber);
          }
        }
      }
    }

    if (studentIds.length === 0) {
      setError('유효한 멤버를 선택하지 않았습니다.');
      return;
    }

    try {
      // 팀 설명을 note 파라미터로 전달
      onSubmit(numericTeamId, studentIds, isCreating, teamNote);
    } catch (error) {
      setError('팀 생성/수정 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  // 필터링 부분 수정 - 운영진 표시 여부 추가
  const filteredMembers = React.useMemo(() => {
    if (!Array.isArray(allMembers)) {
      return [];
    }

    // searchTerm으로 필터링
    let filtered = allMembers.filter(member =>
      (member.name && member.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (member.studentId && member.studentId.toString().includes(searchTerm))
    );

    // 운영진 표시 여부에 따라 필터링
    if (!showAdmins) {
      filtered = filtered.filter(member => member.role !== 'ADMIN');
    }

    // 팀 소속 상태별로 필터링
    if (membershipFilter !== 'all') {
      filtered = filtered.filter(member => {
        const studentId = member.studentId?.toString();
        const memberTeamInfo = memberTeams[studentId] || [];
        const isCurrentMember = currentTeamMembers.includes(studentId);

        if (membershipFilter === 'current') {
          // 현재 팀 소속 멤버만 표시
          return !isCreating && isCurrentMember;
        } else if (membershipFilter === 'other') {
          // 다른 팀 소속 멤버만 표시 (현재 팀에 속하지 않은)
          return memberTeamInfo.length > 0 &&
            (!teamId || memberTeamInfo.every(t => t.teamId !== parseInt(teamId)));
        } else if (membershipFilter === 'none') {
          // 팀 미소속 멤버만 표시
          return memberTeamInfo.length === 0;
        }

        return true;
      });
    }

    return filtered;
  }, [allMembers, searchTerm, showAdmins, membershipFilter, memberTeams, currentTeamMembers, teamId, isCreating]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      {/* 모달 최대 높이 설정 및 스크롤 가능하도록 수정 */}
      <div className="modal" style={{
        maxWidth: '600px',
        width: '90%',
        maxHeight: '80vh', // 화면 높이의 80%로 제한
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div className="modal-header" style={{ flex: '0 0 auto' }}>
          <h2 className="modal-title">{isCreating ? '새 팀 생성' : '팀 멤버 수정'}</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        {/* 스크롤 가능한 본문 영역 */}
        <div className="modal-body" style={{
          flex: '1 1 auto',
          overflowY: 'auto',
          padding: '15px'
        }}>
          <form id="teamForm" onSubmit={handleSubmit}>
            {error && (
              <div className="alert alert-error">
                <FaExclamationTriangle />
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="team-id" className="form-label">팀 ID {isCreating ? '(새로 생성)' : '(기존 팀 수정)'}</label>

              {isCreating ? (
                // 새 팀 생성 시 직접 ID 입력
                <input
                  type="number"
                  id="team-id"
                  className="form-control"
                  value={teamId}
                  onChange={(e) => setTeamId(e.target.value)}
                  placeholder="팀 ID를 입력하세요"
                  min="1"
                />
              ) : (
                // 기존 팀 수정 시 드롭다운 유지
                <select
                  id="team-id"
                  className="form-control"
                  value={teamId}
                  onChange={handleTeamIdChange}
                >
                  <option value="">새 팀 생성</option>
                  {teamsArray.map(team => (
                    <option key={team.id} value={team.id}>
                      팀 {team.id} - {team.name || `팀 ${team.id}`}
                    </option>
                  ))}
                </select>
              )}

              {/* 모드 전환 버튼 추가 */}
              <div style={{ marginTop: '10px' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setIsCreating(!isCreating)}
                  style={{ fontSize: '0.8rem' }}
                >
                  {isCreating ? '기존 팀 수정하기' : '새 팀 생성하기'}
                </button>
              </div>

              <p className="form-text" style={{ fontSize: '0.85rem', color: '#666', marginTop: '5px' }}>
                {isCreating
                  ? '새 팀을 생성하기 위한 팀 ID를 입력하세요.'
                  : '⚠️ 주의: 선택한 멤버에 대해서만 상태 수정이 됩니다. 기존 인원 선택 시 해당 인원 삭제, 신규 멤버 선택 시 해당 인원 추가 => 인원 추가 시 기존 인원은 선택 안해도 됨.'}
              </p>
            </div>

            {/* 팀 설명 입력 필드 추가 */}
            <div className="form-group">
              <label htmlFor="team-note" className="form-label">팀 설명</label>
              <textarea
                id="team-note"
                className="form-control"
                value={teamNote}
                onChange={(e) => setTeamNote(e.target.value)}
                placeholder="팀에 대한 설명을 입력하세요"
                rows="2" // 줄 수 줄임
              />
              <p className="form-text" style={{ fontSize: '0.85rem', color: '#666', marginTop: '5px' }}>
                팀의 목적, 활동 내용 등을 간략하게 설명해주세요.
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">팀원 선택</label>

              {/* 운영진 표시/숨김 토글 버튼 추가 */}
              <div style={{ marginBottom: '10px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="search-container" style={{ flex: 1, marginRight: '10px' }}>
                  <input
                    type="text"
                    className="search-input"
                    placeholder="이름 또는 학번으로 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <div className="search-button">
                    <FaSearch />
                  </div>
                </div>

                <button
                  type="button"
                  className={`btn ${showAdmins ? 'btn-info' : 'btn-secondary'} btn-sm`}
                  onClick={() => setShowAdmins(!showAdmins)}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  운영진 {showAdmins ? '숨기기' : '표시하기'}
                </button>
              </div>

              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                marginBottom: '12px',
                marginTop: '8px'
              }}>
                <button
                  type="button"
                  className={`btn btn-sm ${membershipFilter === 'all' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setMembershipFilter('all')}
                  title="모든 멤버 표시"
                >
                  전체 보기
                </button>

                {/* 팀 수정 모드에서만 '현재 팀 소속' 버튼 표시 */}
                {!isCreating && teamId && (
                  <button
                    type="button"
                    className={`btn btn-sm ${membershipFilter === 'current' ? 'btn-success' : 'btn-outline-success'}`}
                    onClick={() => setMembershipFilter('current')}
                    title="현재 팀 소속 멤버만 표시"
                    style={{
                      backgroundColor: membershipFilter === 'current' ? '#4caf50' : '#4caf5030',
                      borderColor: '#4caf50',
                      color: membershipFilter === 'current' ? 'white' : '#4caf50'
                    }}
                  >
                    현재 팀 소속
                  </button>
                )}

                {/* 팀 수정 모드에서만 '다른 팀 소속' 버튼 표시 */}
                {!isCreating && teamId && (
                  <button
                    type="button"
                    className={`btn btn-sm ${membershipFilter === 'other' ? 'btn-warning' : 'btn-outline-warning'}`}
                    onClick={() => setMembershipFilter('other')}
                    title="다른 팀 소속 멤버만 표시"
                    style={{
                      backgroundColor: membershipFilter === 'other' ? '#ff9800' : '#ff980030',
                      borderColor: '#ff9800',
                      color: membershipFilter === 'other' ? 'white' : '#ff9800'
                    }}
                  >
                    다른 팀 소속
                  </button>
                )}

                <button
                  type="button"
                  className={`btn btn-sm ${membershipFilter === 'none' ? 'btn-secondary' : 'btn-outline-secondary'}`}
                  onClick={() => setMembershipFilter('none')}
                  title="팀 미소속 멤버만 표시"
                >
                  팀 미소속
                </button>
              </div>

              {loading ? (
                <Loading message="사용자 목록을 불러오는 중..." />
              ) : (
                <div className="members-list" style={{
                  height: '300px', // 높이 증가
                  overflowY: 'auto',
                  border: '1px solid var(--gray)',
                  borderRadius: 'var(--border-radius)',
                  padding: '10px'
                }}>
                  {filteredMembers.length > 0 ? (
                    filteredMembers.map(member => {
                      // 학번 문자열로 변환하여 비교
                      const studentId = member.studentId?.toString();
                      const isCurrentMember = currentTeamMembers.includes(studentId);
                      // 현재 학생의 소속 팀 정보
                      const memberTeamInfo = memberTeams[studentId] || [];
                      // 현재 선택된 팀에 이미 속해 있는 멤버인지 확인
                      const isInSelectedTeam = !isCreating && isCurrentMember;
                      // 다른 팀에 소속된 멤버인지 확인
                      const isInOtherTeam = memberTeamInfo.length > 0 &&
                        (!teamId || memberTeamInfo.some(t => t.teamId !== parseInt(teamId)));

                      // 필터 초기화 시 membershipFilter도 초기화
                      const handleResetFilters = () => {
                        setSearchTerm('');
                        setMembershipFilter('all');
                      };

                      return (
                        <div
                          key={member.id || member.studentId}
                          className="member-item"
                          style={{
                            padding: '10px',
                            marginBottom: '8px',
                            backgroundColor: selectedMembers.includes(member.id || member.studentId)
                              ? '#e3f2fd'
                              : isInSelectedTeam
                                ? '#e8f5e9' // 현재 선택된 팀 멤버는 연한 녹색
                                : isInOtherTeam
                                  ? '#fff3e0' // 다른 팀 소속 멤버는 연한 주황색
                                  : 'var(--gray-light)', // 미소속 멤버는 기본 회색
                            borderRadius: 'var(--border-radius)',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            borderLeft: isInSelectedTeam ? '4px solid #4caf50' : isInOtherTeam ? '4px solid #ff9800' : 'none',
                            transition: 'all 0.3s',
                            boxShadow: selectedMembers.includes(member.id || member.studentId) ? 'var(--shadow)' : 'none'
                          }}
                          onClick={() => toggleMemberSelection(member.id || member.studentId)}
                          onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = 'var(--shadow)';
                          }}
                          onMouseOut={(e) => {
                            if (!selectedMembers.includes(member.id || member.studentId)) {
                              e.currentTarget.style.transform = 'none';
                              e.currentTarget.style.boxShadow = 'none';
                            }
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                              <strong>{member.name || '이름 없음'}</strong>
                              <span style={{ marginLeft: '8px', color: 'var(--text-light)', fontSize: '0.9em' }}>
                                ({member.studentId || '학번 없음'})
                              </span>
                              {member.role === 'ADMIN' &&
                                <span style={{
                                  marginLeft: '8px',
                                  color: '#fff',
                                  fontWeight: 'bold',
                                  fontSize: '0.75em',
                                  padding: '2px 6px',
                                  backgroundColor: 'var(--primary-color)',
                                  borderRadius: '10px'
                                }}>
                                  운영진
                                </span>
                              }
                            </div>

                            <div style={{ fontSize: '0.85em', color: 'var(--text-light)' }}>
                              <span style={{
                                display: 'inline-block',
                                backgroundColor: '#f1f1f1',
                                padding: '2px 8px',
                                borderRadius: '10px',
                                marginRight: '6px'
                              }}>
                                {TRACK_MAPPING[member.track] || member.track || '트랙 미지정'}
                              </span>

                              {/* 소속 팀 정보 표시 */}
                              {memberTeamInfo.length > 0 && (
                                <div style={{ marginTop: '4px', fontSize: '0.8em', color: 'var(--text-light)' }}>
                                  소속: {memberTeamInfo.map((team) => (
                                    <span key={team.teamId} style={{
                                      display: 'inline-block',
                                      padding: '2px 8px',
                                      borderRadius: '10px',
                                      marginRight: '4px',
                                      backgroundColor: team.teamId === parseInt(teamId) ? '#e8f5e9' : '#fff3e0',
                                      color: team.teamId === parseInt(teamId) ? '#4caf50' : '#ff9800',
                                      border: '1px solid',
                                      borderColor: team.teamId === parseInt(teamId) ? '#4caf50' : '#ff9800',
                                    }}>
                                      {team.teamName}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {memberTeamInfo.length === 0 && (
                                <span style={{
                                  display: 'inline-block',
                                  padding: '2px 8px',
                                  borderRadius: '10px',
                                  backgroundColor: '#eeeeee',
                                  color: '#888',
                                  fontSize: '0.8em',
                                  marginTop: '4px'
                                }}>미소속</span>
                              )}
                            </div>
                          </div>

                          <div style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '3px',
                            border: '1px solid var(--gray)',
                            backgroundColor: selectedMembers.includes(member.id || member.studentId) ? 'var(--primary-color)' : 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            flexShrink: 0,
                            transition: 'all 0.2s'
                          }}>
                            {selectedMembers.includes(member.id || member.studentId) && '✓'}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p style={{ textAlign: 'center', color: 'var(--text-light)' }}>
                      {searchTerm ? '검색 결과가 없습니다.' : '사용자가 없습니다.'}
                    </p>
                  )}
                </div>
              )}

              {/* 범례 추가 */}
              <div style={{
                marginTop: '10px',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '10px',
                fontSize: '0.8em',
                color: 'var(--text-light)'
              }}>
                {/* 팀 수정 모드일 때만 '현재 팀 소속' 범례 표시 */}
                {!isCreating && teamId && (
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{
                      width: '14px',
                      height: '14px',
                      backgroundColor: '#e8f5e9',
                      borderRadius: '3px',
                      marginRight: '5px',
                      borderLeft: '4px solid #4caf50'
                    }}></div>
                    <span>현재 팀 소속</span>
                  </div>
                )}

                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{
                      width: '14px',
                      height: '14px',
                      backgroundColor: '#fff3e0',
                      borderRadius: '3px',
                      marginRight: '5px',
                      borderLeft: '4px solid #ff9800'
                    }}></div>
                    <span>다른 팀 소속</span>
                  </div>

                {/* 항상 표시되는 범례들 */}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{
                    width: '14px',
                    height: '14px',
                    backgroundColor: 'var(--gray-light)',
                    borderRadius: '3px',
                    marginRight: '5px'
                  }}></div>
                  <span>팀 미소속</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{
                    width: '14px',
                    height: '14px',
                    backgroundColor: '#e3f2fd',
                    borderRadius: '3px',
                    marginRight: '5px',
                    border: '1px solid var(--primary-color)'
                  }}></div>
                  <span>선택됨</span>
                </div>
              </div>

              <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', flexDirection: 'column' }}>
                {/* 전체 선택/해제 버튼 추가 */}
                <div>
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => {
                      // 현재 필터링된 모든 멤버 선택
                      const memberIds = filteredMembers.map(m => m.id || m.studentId);
                      setSelectedMembers([...new Set([...selectedMembers, ...memberIds])]);
                    }}
                    style={{ marginRight: '5px' }}
                  >
                    현재 목록 모두 선택
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => setSelectedMembers([])}
                  >
                    모두 해제
                  </button>
                  <p>선택된 멤버: <strong>{selectedMembers.length}명</strong></p>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* 푸터 영역 고정 */}
        <div className="modal-footer" style={{ flex: '0 0 auto' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            취소
          </button>
          <button type="submit" form="teamForm" className="btn btn-primary">
            {isCreating ? '팀 생성' : '팀 업데이트'}
          </button>
        </div>
      </div>
    </div>
  );
};

// 팀 삭제 확인 모달 컴포넌트
const TeamDeleteModal = ({ isOpen, team, onClose, onConfirm }) => {
  if (!isOpen || !team) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">팀 삭제</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          <div className="alert alert-warning">
            <FaExclamationTriangle />
            <span>이 작업은 되돌릴 수 없습니다.</span>
          </div>
          <p>
            <strong>{team.name}</strong> 팀을 삭제하시겠습니까?<br />
            팀에 속한 모든 스케줄과 출석 기록이 함께 삭제됩니다.
          </p>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            취소
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => onConfirm(team.id)}
          >
            삭제하기
          </button>
        </div>
      </div>
    </div>
  );
};

// 메인 Teams 컴포넌트
const Teams = () => {
  const [teams, setTeams] = useState([]);
  const [filteredTeams, setFilteredTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [notification, setNotification] = useState(null);

  // 팀 목록 불러오기
  const fetchTeams = async () => {
    try {
      setLoading(true);
      // 전체 팀 목록 가져오기
      const response = await teamApi.getAll();
      // console.log('팀 데이터 응답:', response.data);

      if (response.data && typeof response.data === 'object') {
        // 각 팀 ID에 대해 개별적으로 상세 정보 조회
        const teamsPromises = Object.keys(response.data).map(async (teamId) => {
          try {
            // 특정 팀 조회 API 호출
            const teamResponse = await teamApi.getById(teamId);
            const teamData = teamResponse.data;

            return {
              id: parseInt(teamId),
              name: `팀 ${teamId}`,
              description: teamData.description,
              memberCount: teamData.members?.length || 0,
              members: teamData.members || [],
              createdAt: new Date().toISOString()
            };
          } catch (teamError) {
            // console.error(`팀 ${teamId} 상세 정보 로딩 실패:`, teamError);
            return null;
          }
        });

        // 모든 팀 상세 정보 처리 완료 후 유효한 팀만 필터링
        const validTeams = (await Promise.all(teamsPromises))
          .filter(team => team !== null);

        // console.log('상세 정보로 변환된 팀 배열:', validTeams);
        setTeams(validTeams);
        setFilteredTeams(validTeams);
      } else {
        // console.error('예상치 못한 팀 데이터 형식:', response.data);
        setTeams([]);
        setFilteredTeams([]);
      }
    } catch (error) {
      // console.error('팀 목록 로딩 실패:', error);
      setNotification({
        type: 'error',
        message: '팀 목록을 불러오는데 실패했습니다.'
      });
      setTeams([]);
      setFilteredTeams([]);
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 팀 목록 불러오기
  useEffect(() => {
    fetchTeams();
  }, []);

  // 검색어 변경 시 필터링
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredTeams(teams);
    } else {
      const filtered = teams.filter(team =>
        team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (team.description && team.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredTeams(filtered);
    }
  }, [searchTerm, teams]);

  // 팀 생성 처리
  const handleCreateTeam = async (teamId, studentIds, isCreating, note = '') => {
    try {
      // console.log('팀 생성/수정 - 운영진을 포함한 모든 선택된 멤버:', studentIds);
      // console.log('팀 설명:', note);

      // 학번 배열이 숫자로 구성되어 있는지 확인하고 필요한 경우 변환
      const numericStudentIds = studentIds.map(id => {
        if (typeof id === 'string') {
          return parseInt(id, 10);
        }
        return id;
      });

      // API 호출
      const response = await teamApi.create(teamId, numericStudentIds, note);

      // 응답 메시지 생성
      let successMessage = '';
      if (isCreating) {
        // 새 팀 생성 성공 시
        successMessage = `새 팀(${response.data.Team})이 성공적으로 생성되었습니다!`;
        if (note) {
          successMessage += ` 설명: "${note}"`;
        }
      } else {
        // 기존 팀 수정 성공 시
        successMessage = `팀(${response.data.Team}) 멤버가 성공적으로 업데이트되었습니다!`;
        if (note) {
          successMessage += ` 설명: "${note}"`;
        }
      }

      setNotification({
        type: 'success',
        message: successMessage
      });

      // 팀 목록 새로고침
      fetchTeams();
      setIsCreateModalOpen(false);

      // 3초 후 알림 자동 제거
      setTimeout(() => {
        setNotification(null);
      }, 3000);

    } catch (error) {
      // console.error('팀 생성/수정 실패:', error);

      // 중복 오류 확인
      if (error.response?.data?.content && error.response.data.content.includes('Duplicate entry')) {
        setNotification({
          type: 'error',
          message: '한 명 이상의 부원이 이미 다른 팀에 소속되어 있습니다.'
        });
      } else {
        setNotification({
          type: 'error',
          message: '팀 생성/수정에 실패했습니다. 다시 시도해주세요.'
        });
      }
    }
  };

  // 팀 삭제 처리
  const handleDeleteTeam = async (teamId) => {
    // console.log(teamId);
    try {
      await teamApi.delete(teamId);

      setTeams(teams.filter(team => team.id !== teamId));
      setFilteredTeams(filteredTeams.filter(team => team.id !== teamId));
      setIsDeleteModalOpen(false);
      setSelectedTeam(null);

      setNotification({
        type: 'success',
        message: '팀이 성공적으로 삭제되었습니다!'
      });

      // 3초 후 알림 자동 제거
      setTimeout(() => {
        setNotification(null);
      }, 3000);

    } catch (error) {
      // console.error('팀 삭제 실패:', error);
      setNotification({
        type: 'error',
        message: '팀 삭제에 실패했습니다. 다시 시도해주세요.'
      });
    }
  };

  // 삭제 모달 열기
  const openDeleteModal = (team) => {
    setSelectedTeam(team);
    setIsDeleteModalOpen(true);
  };

  return (
    <div>
      <div className="card-header" style={{ marginBottom: '20px', marginRight: '60px' }}>
        <h1>팀 관리</h1>
        <button
          className="btn btn-primary"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <FaPlus /> 팀 생성 및 수정
        </button>
      </div>

      {/* 알림 메시지 */}
      {notification && (
        <div className={`alert alert-${notification.type}`}>
          {notification.type === 'success' ? <FaCheckCircle /> : <FaExclamationTriangle />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* 검색 입력란 - 반응형으로 수정 */}
      <div className="search-container" style={{ width: '100%', display: 'flex' }}>
        <input
          type="text"
          className="search-input"
          placeholder="팀 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: 1 }}
        />
        <button className="search-button">
          <FaSearch />
        </button>
      </div>

      {/* 팀 목록 */}
      {loading ? (
        <div className="loading">로딩 중...</div>
      ) : filteredTeams.length > 0 ? (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th style={{ width: '30%' }}>팀 이름</th>
                <th style={{ width: '30%' }}>설명</th>
                <th style={{ width: '15%' }}>인원</th>
                <th style={{ width: '15%' }}>생성일</th>
                <th style={{ width: '10%' }}>관리</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeams.map((team) => (
                <tr key={team.id}>
                  <td>
                    <Link to={`/teams/${team.id}`} className="team-name">
                      {team.name}
                    </Link>
                  </td>
                  <td>{team.description || '-'}</td>
                  <td>{team.memberCount || 0}명</td>
                  <td>{new Date(team.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <Link
                        to={`/teams/${team.id}`}
                        className="btn btn-secondary btn-sm"
                        title="상세 보기"
                      >
                        <FaUsers />
                      </Link>
                      {/* <Link
                        to={`/teams/${team.id}/schedules`}
                        className="btn btn-secondary btn-sm"
                        title="스케줄 보기"
                      >
                        <FaCalendarAlt />
                      </Link> */}
                      <button
                        className="btn btn-danger btn-sm"
                        title="삭제"
                        onClick={() => openDeleteModal(team)}
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
          {searchTerm && (
            <button
              className="btn btn-secondary"
              style={{ marginTop: '10px' }}
              onClick={() => setSearchTerm('')}
            >
              모든 팀 보기
            </button>
          )}
        </div>
      )}

      {/* 팀 생성 모달 */}
      <ErrorBoundary>
        <TeamCreateModal
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            // 모달을 닫을 때 에러 상태도 초기화
            if (notification && notification.type === 'error') {
              setNotification(null);
            }
          }}
          onSubmit={handleCreateTeam}
          existingTeams={teams}
        />
      </ErrorBoundary>

      {/* 팀 삭제 확인 모달 */}
      <TeamDeleteModal
        isOpen={isDeleteModalOpen}
        team={selectedTeam}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteTeam}
      />
    </div>
  );
};

export default Teams;