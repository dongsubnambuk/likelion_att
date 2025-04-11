// src/pages/student/StudentDocuments.js
import React, { useState, useEffect } from 'react';
import { FaSearch, FaGithub, FaFilter, FaSortAmountDown, FaHistory, FaCalendarAlt, FaUserFriends } from 'react-icons/fa';
import { documentApi } from '../../services/documentApi';
import { teamApi } from '../../services/api';

const StudentDocuments = () => {
    const [documents, setDocuments] = useState({});
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterTeamId, setFilterTeamId] = useState('all');
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');
    const [sortDirection, setSortDirection] = useState('desc'); // 'asc' 또는 'desc'
    const [error, setError] = useState(null);

    // 데이터 로드
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // 교육자료 불러오기
                const docsResponse = await documentApi.getAll();
                setDocuments(docsResponse.data || {});

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
            } catch (error) {
                // console.error('데이터 로딩 실패:', error);
                setError('데이터를 불러오는데 실패했습니다.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // 날짜 포맷팅
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // 필터링된 문서 목록
    const getFilteredDocs = () => {
        let filteredDocs = {};
        let allDocs = [];

        // 모든 문서를 하나의 배열로 변환
        Object.entries(documents).forEach(([teamId, docs]) => {
            if (Array.isArray(docs)) {
                docs.forEach(doc => {
                    allDocs.push({
                        ...doc,
                        teamId: parseInt(teamId)
                    });
                });
            }
        });

        // 필터링 적용
        // 1. 팀 필터링
        if (filterTeamId !== 'all') {
            allDocs = allDocs.filter(doc => doc.teamId === parseInt(filterTeamId));
        }

        // 2. 날짜 필터링
        if (filterStartDate) {
            allDocs = allDocs.filter(doc => {
                const docDate = new Date(doc.created.split('T')[0]);
                const startDate = new Date(filterStartDate);
                return docDate >= startDate;
            });
        }

        if (filterEndDate) {
            allDocs = allDocs.filter(doc => {
                const docDate = new Date(doc.created.split('T')[0]);
                const endDate = new Date(filterEndDate);
                return docDate <= endDate;
            });
        }

        // 3. 검색어 필터링
        if (searchTerm.trim() !== '') {
            allDocs = allDocs.filter(doc =>
                doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                doc.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // 4. 정렬
        allDocs.sort((a, b) => {
            const dateA = new Date(a.created);
            const dateB = new Date(b.created);
            return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
        });

        // 다시 팀별로 그룹화
        allDocs.forEach(doc => {
            if (!filteredDocs[doc.teamId]) {
                filteredDocs[doc.teamId] = [];
            }
            filteredDocs[doc.teamId].push(doc);
        });

        return filteredDocs;
    };

    // 정렬 방향 토글 함수
    const toggleSortDirection = () => {
        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    };

    // 필터 초기화
    const resetFilters = () => {
        setSearchTerm('');
        setFilterTeamId('all');
        setFilterStartDate('');
        setFilterEndDate('');
    };

    // 팀 이름 가져오기
    const getTeamName = (teamId) => {
        const team = teams.find(t => t.id === parseInt(teamId));
        return team ? team.name : `팀 ${teamId}`;
    };

    // 팀 설명(note)을 가져오는 함수 추가
    const getTeamDescription = (teamId) => {
        const team = teams.find(t => t.id === parseInt(teamId));
        return team && team.description ? team.description : '';
    };

    // 팀 ID에 따라 CSS 클래스 이름 가져오는 함수 추가
    const getTeamColorClass = (teamId) => {
        const colorIndex = (parseInt(teamId) % 4) - 1;
        return colorIndex;
    };

    if (loading) {
        return <div className="loading">로딩 중...</div>;
    }

    if (error) {
        return <div className="alert alert-error">{error}</div>;
    }

    const filteredDocuments = getFilteredDocs();
    const hasDocuments = Object.values(filteredDocuments).some(docs => docs.length > 0);

    // 교육자료 총 갯수 계산
    const totalDocCount = Object.values(filteredDocuments).reduce(
        (total, docs) => total + docs.length, 0
    );

    return (
        <div>
            <h1 style={{ marginBottom: '20px', borderBottom: '1px solid var(--gray)', paddingBottom: '20px' }}>교육자료 확인</h1>

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
                        세션 교육자료 확인하기
                    </p>
                    <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem', color: '#333' }}>
                        이전에 진행된 모든 세션의 교육자료를 확인할 수 있습니다. 자신의 트랙 외에도 다른 트랙의 교육자료를 필터를 사용해 원하는 자료를 쉽게 찾아보세요!
                    </p>
                </div>
            </div>

            {/* 필터 영역 */}
            <div className="card" style={{ marginBottom: '20px' }}>
                <div className="card-header" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <h2>교육자료 필터</h2>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={toggleSortDirection}
                            title="정렬 방향 변경"
                        >
                            <FaSortAmountDown /> {sortDirection === 'asc' ? '과거 → 최신' : '최신 → 과거'}
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
                <div style={{ padding: '15px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div className="form-group" style={{ width: '100%' }}>
                        <label htmlFor="search-term" className="form-label">검색어</label>
                        <div className="search-container" style={{ width: '100%', display: 'flex' }}>
                            <input
                                type="text"
                                id="search-term"
                                className="search-input"
                                placeholder="제목 또는 설명으로 검색..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ flex: 1 }}
                            />
                            <button className="search-button">
                                <FaSearch />
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
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

            {/* 교육자료 개수 표시 */}
            <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ margin: 0 }}>
                    총 <strong>{totalDocCount}</strong>개의 교육자료가 있습니다.
                </p>
            </div>

            {/* 교육자료 목록 */}
            {hasDocuments ? (
                <div className="document-grid">
                    {Object.entries(filteredDocuments).flatMap(([teamId, docs]) => {
                        // 팀 ID에 해당하는 색상 클래스 가져오기
                        const teamColorIndex = getTeamColorClass(teamId);
                        // 팀 설명 가져오기
                        const teamDescription = getTeamDescription(teamId);

                        return docs.map((doc) => (
                            <div key={doc.id} className="document-card">
                                <div className={`document-card-header document-card-header-${teamColorIndex}`}>
                                    <h3 style={{ marginBottom: '8px', fontSize: '1.3rem' }}>{doc.title}</h3>
                                    <span className={`team-tag team-tag-${teamColorIndex}`}>
                                        {getTeamName(teamId)} - {teamDescription}
                                    </span>
                                </div>

                                <div className="document-card-content">
                                    <p className="document-date">
                                        <strong>교육 날짜:</strong> {formatDate(doc.created)}
                                    </p>
                                    <p className="document-description">
                                        {doc.description}
                                    </p>
                                    <div className="button-container">
                                        <a
                                            href={doc.content}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`btn btn-primary-${teamColorIndex + 1}`}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '8px',
                                                width: '100%',
                                                color: '#fff',
                                            }}
                                        >
                                            <FaGithub /> 교육자료 확인하기
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ));
                    })}
                </div>
            ) : (
                <div className="card" style={{ padding: '30px', textAlign: 'center' }}>
                    <p>등록된 교육자료가 없습니다.</p>
                    {(searchTerm || filterTeamId !== 'all' || filterStartDate || filterEndDate) && (
                        <button
                            className="btn btn-secondary"
                            style={{ marginTop: '16px' }}
                            onClick={resetFilters}
                        >
                            <FaFilter /> 필터 초기화
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default StudentDocuments;