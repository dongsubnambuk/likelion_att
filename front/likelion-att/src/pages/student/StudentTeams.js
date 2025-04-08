// src/pages/student/StudentTeams.js
import React, { useState, useEffect } from 'react';
import { FaSearch, FaExclamationTriangle, FaUsers, FaUserCog, FaUser, FaLaptopCode } from 'react-icons/fa';
import api from '../../services/api';

const StudentTeams = () => {
  const [teams, setTeams] = useState([]);
  const [filteredTeams, setFilteredTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);

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

  // 팀 목록 불러오기
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        // 전체 팀 조회 API 호출
        const response = await api.get('/api/team/all');
        console.log('팀 데이터 응답:', response.data);

        // 응답이 객체인지 확인 (팀 ID를 키로 갖는 객체)
        if (response.data && typeof response.data === 'object') {
          // 팀 배열로 변환
          const teamsArray = [];

          // 각 팀 ID에 대해 별도의 API 호출로 상세 정보 가져오기
          const teamPromises = Object.keys(response.data).map(async (teamId) => {
            try {
              // 특정 팀 조회 API 호출
              const teamResponse = await api.get(`/api/team?teamId=${teamId}`);
              const teamData = teamResponse.data;

              if (teamData && typeof teamData === 'object') {
                const teamEntries = Object.entries(teamData);

                if (teamEntries.length > 0) {
                  const [teamDescription, members] = teamEntries[0];
                  // 멤버 배열 검증
                  const validMembers = Array.isArray(members) ? members : [];

                  return {
                    id: parseInt(teamId),
                    name: `팀 ${teamId}`,
                    description: teamDescription,
                    memberCount: validMembers.length,
                    members: validMembers
                  };
                }
              }
              return null;
            } catch (teamError) {
              console.error(`팀 ${teamId} 상세 정보 로딩 실패:`, teamError);
              return null;
            }
          });

          // 모든 팀 정보를 처리한 후 유효한 팀만 필터링하여 상태 업데이트
          const validTeams = (await Promise.all(teamPromises)).filter(team => team !== null);
          console.log('상세 정보로 가져온 팀 배열:', validTeams);

          setTeams(validTeams);
          setFilteredTeams(validTeams);
        } else {
          console.error('예상치 못한 팀 데이터 형식:', response.data);
          setTeams([]);
          setFilteredTeams([]);
        }
      } catch (error) {
        console.error('팀 목록 로딩 실패:', error);
        setError('팀 목록을 불러오는데 실패했습니다.');
        setTeams([]);
        setFilteredTeams([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  // 검색어 변경 시 필터링
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredTeams(teams);
    } else {
      const filtered = teams.filter(team => {
        // 팀 이름/설명으로 검색
        if (team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (team.description && team.description.toLowerCase().includes(searchTerm.toLowerCase()))) {
          return true;
        }

        // 팀 ID로 검색
        if (team.id.toString().includes(searchTerm)) {
          return true;
        }

        // 팀원 이름으로 검색 (members가 배열인지 확인 후)
        if (Array.isArray(team.members)) {
          return team.members.some(member =>
            (member.name && member.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (member.studentId && member.studentId.toString().includes(searchTerm))
          );
        }

        return false;
      });

      setFilteredTeams(filtered);
    }
  }, [searchTerm, teams]);

  return (
    <div>
      <h1 style={{marginBottom: '20px', borderBottom: '1px solid var(--gray)', paddingBottom: '20px'}}>전체 팀 조회</h1>

      {/* 에러 메시지 */}
      {error && (
        <div className="alert alert-error">
          <FaExclamationTriangle />
          <span>{error}</span>
        </div>
      )}

      {/* 검색 입력란 */}
      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="팀 또는 팀원 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="search-button">
          <FaSearch />
        </button>
      </div>

      {/* 팀 목록 - 각 팀을 개별 카드로 표시 */}
      {loading ? (
        <div className="loading">로딩 중...</div>
      ) : filteredTeams.length > 0 ? (
        <div>
          {filteredTeams.map((team) => (
            <div className="card" key={team.id} style={{ marginBottom: '20px' }}>
              <div className="card-header">
                <h2 style={{ display: 'flex', alignItems: 'center' }}>
                  <FaUsers style={{ marginRight: '10px' }} />
                  {team.name}
                </h2>
                <span>멤버 {team.memberCount}명</span>
              </div>

              {/* 팀 설명 추가 */}
              <div style={{ padding: '10px 15px', backgroundColor: '#f5f7fa', borderBottom: '1px solid #eaeaea' }}>
                <p><strong>설명:</strong> {team.description || '설명 없음'}</p>
              </div>

              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>이름</th>
                      <th>학번</th>
                      <th>역할</th>
                      <th>트랙</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(team.members) && team.members.length > 0 ? (
                      // 운영진이 상단에 오도록 정렬
                      [...team.members]
                        .sort((a, b) => {
                          // 운영진(ADMIN)을 먼저 표시
                          if (a.role === 'ADMIN' && b.role !== 'ADMIN') return -1;
                          if (a.role !== 'ADMIN' && b.role === 'ADMIN') return 1;
                          // 같은 역할이면 이름순으로 정렬
                          return (a.name || '').localeCompare(b.name || '');
                        })
                        .map((member, index) => (
                          <tr key={`${team.id}-${member.studentId || index}`}>
                            <td>
                              <span style={{ display: 'flex', alignItems: 'center' }}>
                                {member.role === 'ADMIN'
                                  ? <FaUserCog style={{ color: '#DF773B', marginRight: '5px' }} />
                                  : <FaUser style={{ color: '#373737', marginRight: '5px' }} />
                                }
                                {member.name || '-'}
                              </span>
                            </td>
                            <td>{member.studentId || '-'}</td>
                            <td>
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
                            </td>
                            <td>
                              <span style={{ display: 'flex', alignItems: 'center' }}>
                                <FaLaptopCode style={{ color: '#DF773B', marginRight: '5px' }} />
                                {getTrackDisplay(member.track)}
                              </span>
                            </td>
                          </tr>
                        ))
                    ) : (
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center' }}>멤버 정보를 불러올 수 없습니다.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
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
    </div>
  );
};

export default StudentTeams;