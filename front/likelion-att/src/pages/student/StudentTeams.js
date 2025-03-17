// src/pages/student/StudentTeams.js
import React, { useState, useEffect } from 'react';
import { FaSearch, FaExclamationTriangle, FaUsers } from 'react-icons/fa';
import api from '../../services/api';

const StudentTeams = () => {
  const [teams, setTeams] = useState([]);
  const [filteredTeams, setFilteredTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);

  // 팀 목록 불러오기
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/team/all');
        console.log('팀 데이터 응답:', response.data);
        
        // 응답이 객체인지 확인 (팀 ID를 키로 갖는 객체)
        if (response.data && typeof response.data === 'object') {
          // 팀 배열로 변환
          const teamsArray = Object.entries(response.data).map(([teamId, members]) => {
            return {
              id: parseInt(teamId),
              name: `팀 ${teamId}`,
              memberCount: members.length,
              members: members
            };
          });
          
          console.log('변환된 팀 배열:', teamsArray);
          setTeams(teamsArray);
          setFilteredTeams(teamsArray);
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
      const filtered = teams.filter(team => 
        // 팀 이름으로 검색
        team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        // 팀 ID로 검색
        team.id.toString().includes(searchTerm) ||
        // 팀원 이름으로 검색
        team.members.some(member => 
          member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.studentId.toString().includes(searchTerm)
        )
      );
      setFilteredTeams(filtered);
    }
  }, [searchTerm, teams]);

  return (
    <div>
      <h1>전체 팀 조회</h1>
      
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

      {/* 팀 목록 */}
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
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>이름</th>
                      <th>학번</th>
                      <th>역할</th>
                    </tr>
                  </thead>
                  <tbody>
                    {team.members.map((member, index) => (
                      <tr key={`${team.id}-${member.studentId || index}`}>
                        <td>{member.name}</td>
                        <td>{member.studentId}</td>
                        <td>{member.role === 'ADMIN' ? '운영진' : '학생'}</td>
                      </tr>
                    ))}
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