// src/pages/AttendanceReport.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaChartBar, FaCalendarAlt, FaUserFriends, FaDownload, FaSearch, FaUser, FaSort, FaSortUp, FaSortDown, FaUserCog, FaLaptopCode, FaPhone } from 'react-icons/fa';
import { teamApi, scheduleApi, attendanceApi, userApi } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import Loading from '../components/common/Loading';

const AttendanceReport = () => {
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [overallStats, setOverallStats] = useState({
    totalMembers: 0,
    totalSchedules: 0,
    totalAttendances: 0,
    presentCount: 0,
    lateCount: 0,
    absentCount: 0,
    notCount: 0,
    attendanceRate: 0,
    presentRate: 0,
    lateRate: 0,
    absentRate: 0,
    averageRating: 0
  });
  const [teamStats, setTeamStats] = useState([]);
  const [memberStats, setMemberStats] = useState([]);
  const [scheduleStats, setScheduleStats] = useState([]);
  // 각 테이블별 독립적인 정렬 상태 설정
  const [teamSortConfig, setTeamSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [scheduleSortConfig, setScheduleSortConfig] = useState({ key: 'date', direction: 'asc' });
  const [memberSortConfig, setMemberSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [error, setError] = useState(null);

  // 데이터 불러오기
  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);

        // 팀 목록 가져오기
        const teamsResponse = await teamApi.getAll();
        const teamsData = teamsResponse.data;

        // 사용자 목록 가져오기
        const usersResponse = await userApi.getAll();
        const usersData = usersResponse.data;
        const adminCount = usersData.admin ? usersData.admin.length : 0;
        const userCount = usersData.users ? usersData.users.length : 0;
        const totalMembers = adminCount + userCount;

        // 스케줄 정보 가져오기
        const schedulesResponse = await scheduleApi.getAll();
        const schedulesData = schedulesResponse.data;

        // 데이터 가공 및 통계 계산
        const stats = calculateStatistics(teamsData, schedulesData, totalMembers);

        // 상태 업데이트
        setTeams(stats.teamStats);
        setOverallStats(stats.overallStats);
        setTeamStats(stats.teamStats);
        setMemberStats(stats.memberStats);
        setScheduleStats(stats.scheduleStats);

      } catch (error) {
        // console.error('리포트 데이터 로딩 실패:', error);
        setError('데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, []);

  // 통계 계산 함수
  const calculateStatistics = (teamData, scheduleData, totalMembersCount) => {
    // 기본 통계 정보 초기화
    const stats = {
      totalMembers: totalMembersCount, // 전체 부원 수 사용
      totalSchedules: 0,
      totalAttendances: 0,
      presentCount: 0,
      lateCount: 0,
      absentCount: 0,
      notCount: 0,
      averageRating: 0
    };

    // 팀별 통계 정보 배열
    const teamStats = [];

    // 부원별 통계 정보 객체 (학번을 키로 사용)
    const memberStats = {};

    // 스케줄별 통계 정보 배열
    const scheduleStats = [];

    // 전체 부원 수 계산
    Object.entries(teamData).forEach(([teamId, teamInfo]) => {
      const description = Object.keys(teamInfo)[0]; // 팀 설명은 객체의 첫 번째 키
      const members = teamInfo[description]; // 팀원들은 그 키의 값

      // stats.totalMembers += members.length;

      // 팀별 통계 객체 초기화
      teamStats.push({
        id: parseInt(teamId),
        name: `팀 ${teamId}`,
        description: description,
        memberCount: members.length,
        scheduleCount: 0,
        presentCount: 0,
        lateCount: 0,
        absentCount: 0,
        notCount: 0,
        totalAttendances: 0,
        attendanceRate: 0,
        rating: 0
      });

      // 각 부원의 통계 정보 초기화
      members.forEach(member => {
        memberStats[member.studentId] = {
          id: member.studentId,
          name: member.name,
          studentId: member.studentId,
          role: member.role,
          track: member.track,
          teamName: `팀 ${teamId}`,
          teamId: parseInt(teamId),
          presentCount: 0,
          lateCount: 0,
          absentCount: 0,
          notCount: 0,
          totalSchedules: 0,
          attendanceRate: 0,
          rating: 0
        };
      });
    });

    // 전체 스케줄 수 계산 및 출석 정보 분석
    Object.entries(scheduleData).forEach(([teamId, schedules]) => {
      // 팀별 통계 객체 찾기
      const teamStat = teamStats.find(ts => ts.id === parseInt(teamId));
      if (teamStat) {
        teamStat.scheduleCount += schedules.length;
      }

      stats.totalSchedules += schedules.length;

      // 각 스케줄 분석
      schedules.forEach(schedule => {
        // 스케줄별 통계 객체 생성
        const scheduleStat = {
          id: schedule.id,
          date: schedule.date,
          time: schedule.time,
          title: `스케줄 #${schedule.id}`,
          teamId: parseInt(teamId),
          teamName: teamStat ? teamStat.name : `팀 ${teamId}`,
          presentCount: 0,
          lateCount: 0,
          absentCount: 0,
          notCount: 0,
          totalMembers: schedule.attendances ? schedule.attendances.length : 0,
          attendanceRate: 0
        };

        // 해당 스케줄의 출석 정보 분석
        if (schedule.attendances && schedule.attendances.length > 0) {
          schedule.attendances.forEach(attendance => {
            stats.totalAttendances++;
            if (teamStat) teamStat.totalAttendances++;

            // 출석 상태에 따른 카운트 증가
            switch (attendance.status) {
              case 'PRESENT':
              case 'present':
                stats.presentCount++;
                scheduleStat.presentCount++;
                if (teamStat) teamStat.presentCount++;

                // 부원별 통계 업데이트
                if (memberStats[attendance.user.studentId]) {
                  memberStats[attendance.user.studentId].presentCount++;
                  memberStats[attendance.user.studentId].totalSchedules++;
                }
                break;
              case 'LATE':
              case 'late':
                stats.lateCount++;
                scheduleStat.lateCount++;
                if (teamStat) teamStat.lateCount++;

                // 부원별 통계 업데이트
                if (memberStats[attendance.user.studentId]) {
                  memberStats[attendance.user.studentId].lateCount++;
                  memberStats[attendance.user.studentId].totalSchedules++;
                }
                break;
              case 'ABSENT':
              case 'absent':
                stats.absentCount++;
                scheduleStat.absentCount++;
                if (teamStat) teamStat.absentCount++;

                // 부원별 통계 업데이트
                if (memberStats[attendance.user.studentId]) {
                  memberStats[attendance.user.studentId].absentCount++;
                  memberStats[attendance.user.studentId].totalSchedules++;
                }
                break;
              case 'NOT':
              case 'not':
              default:
                stats.notCount++;
                scheduleStat.notCount++;
                if (teamStat) teamStat.notCount++;

                // 부원별 통계 업데이트
                if (memberStats[attendance.user.studentId]) {
                  memberStats[attendance.user.studentId].notCount++;
                  memberStats[attendance.user.studentId].totalSchedules++;
                }
                break;
            }
          });

          // 각 스케줄의 출석률 계산 (출석 + 지각) / (전체 - 미처리)
          const effectiveAttendances = scheduleStat.presentCount + scheduleStat.lateCount;
          const effectiveTotal = scheduleStat.totalMembers - scheduleStat.notCount;
          scheduleStat.attendanceRate = effectiveTotal > 0
            ? Math.round((effectiveAttendances / effectiveTotal) * 100)
            : 0;
        }

        scheduleStats.push(scheduleStat);
      });
    });

    // 각 팀의 출석률 계산
    teamStats.forEach(team => {
      const effectiveAttendances = team.presentCount + team.lateCount;
      const effectiveTotal = team.totalAttendances - team.notCount;
      team.attendanceRate = effectiveTotal > 0
        ? Math.round((effectiveAttendances / effectiveTotal) * 100)
        : 0;
    });

    // 각 부원의 출석률 계산
    Object.values(memberStats).forEach(member => {
      const effectiveAttendances = member.presentCount + member.lateCount;
      const effectiveTotal = member.totalSchedules - member.notCount;
      member.attendanceRate = effectiveTotal > 0
        ? Math.round((effectiveAttendances / effectiveTotal) * 100)
        : 0;
    });

    // 전체 출석률 계산
    const effectiveAttendances = stats.presentCount + stats.lateCount;
    const effectiveTotal = stats.totalAttendances - stats.notCount;
    const attendanceRate = effectiveTotal > 0
      ? Math.round((effectiveAttendances / effectiveTotal) * 100)
      : 0;
    const presentRate = stats.totalAttendances > 0
      ? Math.round((stats.presentCount / stats.totalAttendances) * 100)
      : 0;
    const lateRate = stats.totalAttendances > 0
      ? Math.round((stats.lateCount / stats.totalAttendances) * 100)
      : 0;
    const absentRate = stats.totalAttendances > 0
      ? Math.round((stats.absentCount / stats.totalAttendances) * 100)
      : 0;

    return {
      overallStats: {
        ...stats,
        attendanceRate,
        presentRate,
        lateRate,
        absentRate,
      },
      teamStats: teamStats,
      memberStats: Object.values(memberStats),
      scheduleStats: scheduleStats.sort((a, b) => new Date(b.date) - new Date(a.date))
    };
  };

  // 필터링된 데이터 계산
  const getFilteredData = () => {
    let filteredTeamStats = [...teamStats];
    let filteredMemberStats = [...memberStats];
    let filteredScheduleStats = [...scheduleStats];

    // 팀 필터링
    if (selectedTeam !== 'all') {
      filteredTeamStats = filteredTeamStats.filter(team => team.id === parseInt(selectedTeam));
      filteredMemberStats = filteredMemberStats.filter(member => member.teamId === parseInt(selectedTeam));
      filteredScheduleStats = filteredScheduleStats.filter(schedule => schedule.teamId === parseInt(selectedTeam));
    }

    // 날짜 필터링
    if (startDate) {
      filteredScheduleStats = filteredScheduleStats.filter(schedule => schedule.date >= startDate);
    }

    if (endDate) {
      filteredScheduleStats = filteredScheduleStats.filter(schedule => schedule.date <= endDate);
    }

    return {
      teamStats: filteredTeamStats,
      memberStats: filteredMemberStats,
      scheduleStats: filteredScheduleStats
    };
  };

  // 필터링된 데이터 가져오기
  const handleFilter = () => {
    // 필터링된 데이터로 화면 업데이트
    const filtered = getFilteredData();

    // 필터링된 데이터 중 팀과 회원만 업데이트
    // 전체 통계는 그대로 유지
    setTeamStats(filtered.teamStats);
    setMemberStats(filtered.memberStats);
    setScheduleStats(filtered.scheduleStats);
  };

  // 팀 테이블 정렬 함수
  const requestTeamSort = (key) => {
    let direction = 'desc';
    if (teamSortConfig.key === key && teamSortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setTeamSortConfig({ key, direction });
  };

  // 스케줄 테이블 정렬 함수
  const requestScheduleSort = (key) => {
    let direction = 'desc';
    if (scheduleSortConfig.key === key && scheduleSortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setScheduleSortConfig({ key, direction });
  };

  // 부원 테이블 정렬 함수
  const requestMemberSort = (key) => {
    let direction = 'desc';
    if (memberSortConfig.key === key && memberSortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setMemberSortConfig({ key, direction });
  };

  // 팀 테이블 정렬 아이콘
  const getTeamSortIcon = (key) => {
    if (teamSortConfig.key !== key) {
      return <FaSort />;
    }
    return teamSortConfig.direction === 'desc' ? <FaSortDown /> : <FaSortUp />;
  };

  // 스케줄 테이블 정렬 아이콘
  const getScheduleSortIcon = (key) => {
    if (scheduleSortConfig.key !== key) {
      return <FaSort />;
    }
    return scheduleSortConfig.direction === 'desc' ? <FaSortDown /> : <FaSortUp />;
  };

  // 부원 테이블 정렬 아이콘
  const getMemberSortIcon = (key) => {
    if (memberSortConfig.key !== key) {
      return <FaSort />;
    }
    return memberSortConfig.direction === 'desc' ? <FaSortDown /> : <FaSortUp />;
  };

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

  // 멤버 역할에 따라 아이콘 표시
  const getRoleIcon = (role) => {
    if (role === 'ADMIN') {
      return <FaUserCog style={{ color: '#DF773B', marginRight: '5px' }} />;
    }
    return <FaUser style={{ color: '#373737', marginRight: '5px' }} />;
  };

  // 리포트 다운로드
  const handleDownload = () => {
    // 실제로는 서버에서 엑셀 파일 등으로 다운로드 구현
    alert('출석 리포트가 다운로드됩니다.');
  };

  // 출석 상태 분포 데이터
  const statusDistributionData = [
    { name: '출석', value: overallStats?.presentRate || 0, color: '#219653' },
    { name: '지각', value: overallStats?.lateRate || 0, color: '#f2994a' },
    { name: '결석', value: overallStats?.absentRate || 0, color: '#eb5757' },
    {
      name: '미처리', value: overallStats?.totalAttendances > 0
        ? Math.round((overallStats?.notCount / overallStats?.totalAttendances) * 100)
        : 0, color: '#bdbdbd'
    }
  ];

  // 정렬된 부원 통계 가져오기
  const getSortedMemberStats = () => {
    if (!memberSortConfig.key) return memberStats;

    return [...memberStats].sort((a, b) => {
      // null 값 처리
      if (a[memberSortConfig.key] === null || a[memberSortConfig.key] === undefined)
        return memberSortConfig.direction === 'desc' ? 1 : -1;
      if (b[memberSortConfig.key] === null || b[memberSortConfig.key] === undefined)
        return memberSortConfig.direction === 'desc' ? -1 : 1;

      // 일반적인 비교 로직
      let valueA = a[memberSortConfig.key];
      let valueB = b[memberSortConfig.key];

      // 학번은 숫자로 변환하여 비교
      if (memberSortConfig.key === 'studentId') {
        valueA = Number(String(valueA).replace(/\D/g, '')) || 0;
        valueB = Number(String(valueB).replace(/\D/g, '')) || 0;
      }
      // 문자열은 소문자로 변환하여 비교
      else if (typeof valueA === 'string' && typeof valueB === 'string') {
        valueA = valueA.toLowerCase();
        valueB = valueB.toLowerCase();
      }

      if (valueA < valueB) {
        return memberSortConfig.direction === 'desc' ? 1 : -1;
      }
      if (valueA > valueB) {
        return memberSortConfig.direction === 'desc' ? -1 : 1;
      }
      return 0;
    });
  };

  // 정렬된 팀 통계 가져오기
  const getSortedTeamStats = () => {
    if (!teamSortConfig.key) return teamStats;

    return [...teamStats].sort((a, b) => {
      // null 값 처리
      if (a[teamSortConfig.key] === null || a[teamSortConfig.key] === undefined)
        return teamSortConfig.direction === 'desc' ? 1 : -1;
      if (b[teamSortConfig.key] === null || b[teamSortConfig.key] === undefined)
        return teamSortConfig.direction === 'desc' ? -1 : 1;

      // 일반적인 비교 로직
      if (a[teamSortConfig.key] < b[teamSortConfig.key]) {
        return teamSortConfig.direction === 'desc' ? 1 : -1;
      }
      if (a[teamSortConfig.key] > b[teamSortConfig.key]) {
        return teamSortConfig.direction === 'desc' ? -1 : 1;
      }
      return 0;
    });
  };

  // 정렬된 스케줄 통계 가져오기
  const getSortedScheduleStats = () => {
    if (!scheduleSortConfig.key) return scheduleStats;

    return [...scheduleStats].sort((a, b) => {
      // null 값 처리
      if (a[scheduleSortConfig.key] === null || a[scheduleSortConfig.key] === undefined)
        return scheduleSortConfig.direction === 'desc' ? 1 : -1;
      if (b[scheduleSortConfig.key] === null || b[scheduleSortConfig.key] === undefined)
        return scheduleSortConfig.direction === 'desc' ? -1 : 1;

      // 날짜 비교는 특별 처리
      if (scheduleSortConfig.key === 'date') {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return scheduleSortConfig.direction === 'desc' ? dateB - dateA : dateA - dateB;
      }

      if (a[scheduleSortConfig.key] < b[scheduleSortConfig.key]) {
        return scheduleSortConfig.direction === 'desc' ? 1 : -1;
      }
      if (a[scheduleSortConfig.key] > b[scheduleSortConfig.key]) {
        return scheduleSortConfig.direction === 'desc' ? -1 : 1;
      }
      return 0;
    });
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('ko-KR', options);
  };

  if (loading) {
    return <Loading className="loading">로딩 중...</Loading>;
  }

  if (error) {
    return <div className="alert alert-error">{error}</div>;
  }

  return (
    <div>
      <div className="card-header" style={{ marginBottom: '20px' }}>
        <h1>출석 통계 리포트</h1>
        {/* <button className="btn btn-primary" onClick={handleDownload}>
          <FaDownload /> 리포트 다운로드
        </button> */}
      </div>

      {/* 필터 섹션 */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-header">
          <h2>조회 필터</h2>
        </div>
        <div style={{ padding: '15px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div className="form-group" style={{ width: '100%' }}>
            <label htmlFor="team-select" className="form-label">팀 선택</label>
            <div style={{ width: '100%', display: 'flex' }}>
              <select
                id="team-select"
                className="form-control"
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                style={{ flex: 1 }}
              >
                <option value="all">전체 팀</option>
                {teams.map(team => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
            <div className="form-group" style={{ flex: '1 1 200px', minWidth: '200px' }}>
              <label htmlFor="start-date" className="form-label">시작 날짜</label>
              <input
                type="date"
                id="start-date"
                className="form-control"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ flex: '1 1 200px', minWidth: '200px' }}>
              <label htmlFor="end-date" className="form-label">종료 날짜</label>
              <input
                type="date"
                id="end-date"
                className="form-control"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ flex: '0 0 auto', display: 'flex', alignItems: 'flex-end' }}>
              <button className="btn btn-primary" onClick={handleFilter}>
                <FaSearch /> 조회
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 전체 통계 카드 */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-header">
          <h2>전체 출석 현황</h2>
        </div>
        <div style={{ padding: '15px' }}>
          {/* 통계 카드 */}
          <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px', marginBottom: '20px' }}>
            <div className="stat-card" style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <div className="stat-title" style={{ fontSize: '1rem', color: '#6c757d', marginBottom: '8px' }}>전체 출석률</div>
              <div className="stat-value" style={{ fontSize: '2rem', fontWeight: 'bold', color: '#212529' }}>{overallStats?.attendanceRate}%</div>
              <div className="stat-change" style={{ fontSize: '0.85rem', color: '#6c757d', marginTop: '5px' }}>
                총 {overallStats?.totalSchedules}개 스케줄
              </div>
            </div>

            <div className="stat-card" style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <div className="stat-title" style={{ fontSize: '1rem', color: '#6c757d', marginBottom: '8px' }}>총 부원 수</div>
              <div className="stat-value" style={{ fontSize: '2rem', fontWeight: 'bold', color: '#212529' }}>{overallStats?.totalMembers}</div>
              <div className="stat-change" style={{ fontSize: '0.85rem', color: '#6c757d', marginTop: '5px' }}>
                {teams.length}개 팀
              </div>
            </div>

            <div className="stat-card" style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <div className="stat-title" style={{ fontSize: '1rem', color: '#6c757d', marginBottom: '8px' }}>출석</div>
              <div className="stat-value" style={{ fontSize: '2rem', fontWeight: 'bold', color: '#219653' }}>{overallStats?.presentRate}%</div>
            </div>

            <div className="stat-card" style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <div className="stat-title" style={{ fontSize: '1rem', color: '#6c757d', marginBottom: '8px' }}>지각</div>
              <div className="stat-value" style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f2994a' }}>{overallStats?.lateRate}%</div>
            </div>

            <div className="stat-card" style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <div className="stat-title" style={{ fontSize: '1rem', color: '#6c757d', marginBottom: '8px' }}>결석</div>
              <div className="stat-value" style={{ fontSize: '2rem', fontWeight: 'bold', color: '#eb5757' }}>{overallStats?.absentRate}%</div>
            </div>

            <div className="stat-card" style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <div className="stat-title" style={{ fontSize: '1rem', color: '#6c757d', marginBottom: '8px' }}>미처리</div>
              <div className="stat-value" style={{ fontSize: '2rem', fontWeight: 'bold', color: '#212529' }}>{overallStats?.totalAttendances > 0 ? Math.round((overallStats?.notCount / overallStats?.totalAttendances) * 100) : 0}%</div>
            </div>
          </div>

          {/* 출석 상태 분포 차트 */}
          <div style={{ marginTop: '30px', width: '100%', height: 300 }}>
            <h3 style={{ marginBottom: '15px', textAlign: 'center' }}>출석 상태 분포</h3>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={statusDistributionData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  labelLine={true}
                  label={({ name, value }) => `${name} ${value.toFixed(1)}%`}
                >
                  {statusDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 팀별 통계 카드 */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-header">
          <h2>팀별 출석률</h2>
          <Link to="/teams" className="btn btn-primary btn-sm">
            <FaUserFriends /> 팀 관리
          </Link>
        </div>
        <div style={{ padding: '15px' }}>
          {/* 팀별 출석률 차트 */}
          <div style={{ width: '100%', height: 300, marginBottom: '20px' }}>
            <ResponsiveContainer>
              <BarChart
                data={teamStats}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value, name) => [`${value}%`, '출석률']} />
                <Legend />
                <Bar dataKey="attendanceRate" name="출석률" fill="#3498db" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 팀별 통계 테이블 */}
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th onClick={() => requestTeamSort('name')} style={{ cursor: 'pointer' }}>
                    팀명 {getTeamSortIcon('name')}
                  </th>
                  <th onClick={() => requestTeamSort('description')} style={{ cursor: 'pointer' }}>
                    설명 {getTeamSortIcon('description')}
                  </th>
                  <th onClick={() => requestTeamSort('memberCount')} style={{ cursor: 'pointer' }}>
                    인원 수 {getTeamSortIcon('memberCount')}
                  </th>
                  <th onClick={() => requestTeamSort('scheduleCount')} style={{ cursor: 'pointer' }}>
                    스케줄 수 {getTeamSortIcon('scheduleCount')}
                  </th>
                  <th onClick={() => requestTeamSort('presentCount')} style={{ cursor: 'pointer' }}>
                    출석 {getTeamSortIcon('presentCount')}
                  </th>
                  <th onClick={() => requestTeamSort('lateCount')} style={{ cursor: 'pointer' }}>
                    지각 {getTeamSortIcon('lateCount')}
                  </th>
                  <th onClick={() => requestTeamSort('absentCount')} style={{ cursor: 'pointer' }}>
                    결석 {getTeamSortIcon('absentCount')}
                  </th>
                  <th onClick={() => requestTeamSort('notCount')} style={{ cursor: 'pointer' }}>
                    미처리 {getTeamSortIcon('notCount')}
                  </th>
                  <th onClick={() => requestTeamSort('attendanceRate')} style={{ cursor: 'pointer' }}>
                    출석률 {getTeamSortIcon('attendanceRate')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {getSortedTeamStats().length > 0 ? (
                  getSortedTeamStats().map((team) => (
                    <tr key={team.id}>
                      <td>
                        <Link to={`/teams/${team.id}`}>{team.name}</Link>
                      </td>
                      <td>{team.description}</td>
                      <td>{team.memberCount}명</td>
                      <td>{team.scheduleCount}개</td>
                      <td style={{ color: '#219653' }}>{team.presentCount}회</td>
                      <td style={{ color: '#f2994a' }}>{team.lateCount}회</td>
                      <td style={{ color: '#eb5757' }}>{team.absentCount}회</td>
                      <td style={{ color: '#bdbdbd' }}>{team.notCount}회</td>
                      <td style={{ fontWeight: 'bold', color: team.attendanceRate >= 80 ? '#219653' : team.attendanceRate >= 60 ? '#f2994a' : '#eb5757' }}>
                        {team.attendanceRate}%
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center' }}>팀 통계 데이터가 없습니다.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 스케줄별 통계 카드 */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-header">
          <h2>스케줄별 출석 현황</h2>
          <Link to="/schedules" className="btn btn-primary btn-sm">
            <FaCalendarAlt /> 스케줄 관리
          </Link>
        </div>
        <div className="table-container" style={{ maxHeight: '600px', overflowY: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th onClick={() => requestScheduleSort('date')} style={{ cursor: 'pointer' }}>
                  날짜 {getScheduleSortIcon('date')}
                </th>
                <th onClick={() => requestScheduleSort('time')} style={{ cursor: 'pointer' }}>
                  시간 {getScheduleSortIcon('time')}
                </th>
                <th onClick={() => requestScheduleSort('teamName')} style={{ cursor: 'pointer' }}>
                  팀 {getScheduleSortIcon('teamName')}
                </th>
                <th onClick={() => requestScheduleSort('presentCount')} style={{ cursor: 'pointer' }}>
                  출석 {getScheduleSortIcon('presentCount')}
                </th>
                <th onClick={() => requestScheduleSort('lateCount')} style={{ cursor: 'pointer' }}>
                  지각 {getScheduleSortIcon('lateCount')}
                </th>
                <th onClick={() => requestScheduleSort('absentCount')} style={{ cursor: 'pointer' }}>
                  결석 {getScheduleSortIcon('absentCount')}
                </th>
                <th onClick={() => requestScheduleSort('notCount')} style={{ cursor: 'pointer' }}>
                  미처리 {getScheduleSortIcon('notCount')}
                </th>
                <th onClick={() => requestScheduleSort('attendanceRate')} style={{ cursor: 'pointer' }}>
                  출석률 {getScheduleSortIcon('attendanceRate')}
                </th>
              </tr>
            </thead>
            <tbody>
              {getSortedScheduleStats().length > 0 ? (
                getSortedScheduleStats().map((schedule) => (
                  <tr key={schedule.id}>
                    <td>{formatDate(schedule.date)}</td>
                    <td>{schedule.time}</td>
                    <td>{schedule.teamName}</td>
                    <td style={{ color: '#219653' }}>{schedule.presentCount}명</td>
                    <td style={{ color: '#f2994a' }}>{schedule.lateCount}명</td>
                    <td style={{ color: '#eb5757' }}>{schedule.absentCount}명</td>
                    <td style={{ color: '#bdbdbd' }}>{schedule.notCount}명</td>
                    <td style={{ fontWeight: 'bold', color: schedule.attendanceRate >= 80 ? '#219653' : schedule.attendanceRate >= 60 ? '#f2994a' : '#eb5757' }}>
                      {schedule.attendanceRate}%
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center' }}>스케줄 통계 데이터가 없습니다.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 부원별 통계 카드 */}
      <div className="card">
        <div className="card-header">
          <h2>부원별 출석 현황</h2>
          <Link to="/members" className="btn btn-primary btn-sm">
            <FaUser /> 부원 관리
          </Link>
        </div>
        <div className="table-container" style={{ maxHeight: '600px', overflowY: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th onClick={() => requestMemberSort('name')} style={{ cursor: 'pointer' }}>
                  이름 {getMemberSortIcon('name')}
                </th>
                <th onClick={() => requestMemberSort('studentId')} style={{ cursor: 'pointer' }}>
                  학번 {getMemberSortIcon('studentId')}
                </th>
                <th onClick={() => requestMemberSort('role')} style={{ cursor: 'pointer' }}>
                  역할 {getMemberSortIcon('role')}
                </th>
                <th onClick={() => requestMemberSort('track')} style={{ cursor: 'pointer' }}>
                  트랙 {getMemberSortIcon('track')}
                </th>
                <th onClick={() => requestMemberSort('teamName')} style={{ cursor: 'pointer' }}>
                  팀 {getMemberSortIcon('teamName')}
                </th>
                <th onClick={() => requestMemberSort('presentCount')} style={{ cursor: 'pointer' }}>
                  출석 {getMemberSortIcon('presentCount')}
                </th>
                <th onClick={() => requestMemberSort('lateCount')} style={{ cursor: 'pointer' }}>
                  지각 {getMemberSortIcon('lateCount')}
                </th>
                <th onClick={() => requestMemberSort('absentCount')} style={{ cursor: 'pointer' }}>
                  결석 {getMemberSortIcon('absentCount')}
                </th>
                <th onClick={() => requestMemberSort('notCount')} style={{ cursor: 'pointer' }}>
                  미처리 {getMemberSortIcon('notCount')}
                </th>
                <th onClick={() => requestMemberSort('attendanceRate')} style={{ cursor: 'pointer' }}>
                  출석률 {getMemberSortIcon('attendanceRate')}
                </th>
              </tr>
            </thead>
            <tbody>
              {getSortedMemberStats().length > 0 ? (
                getSortedMemberStats().map((member) => (
                  <tr key={member.id}>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center' }}>
                        {getRoleIcon(member.role)}
                        <Link to={`/members/${member.id}`}>{member.name}</Link>
                      </span>
                    </td>
                    <td>{member.studentId}</td>
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
                    <td>{member.teamName}</td>
                    <td style={{ color: '#219653' }}>{member.presentCount}회</td>
                    <td style={{ color: '#f2994a' }}>{member.lateCount}회</td>
                    <td style={{ color: '#eb5757' }}>{member.absentCount}회</td>
                    <td style={{ color: '#bdbdbd' }}>{member.notCount}회</td>
                    <td style={{ fontWeight: 'bold', color: member.attendanceRate >= 80 ? '#219653' : member.attendanceRate >= 60 ? '#f2994a' : '#eb5757' }}>
                      {member.attendanceRate}%
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center' }}>부원 통계 데이터가 없습니다.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendanceReport;