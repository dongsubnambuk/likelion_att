// src/components/members/MemberTable.js
import React from 'react';
import { Link } from 'react-router-dom';
import { FaSort, FaSortUp, FaSortDown, FaEdit, FaTrash, FaUserCircle, FaUserCog, FaUser, FaPhone, FaLaptopCode } from 'react-icons/fa';

// formatters.js 파일이 아직 없으므로 함수를 직접 정의
// 나중에 formatters.js 파일이 생성되면 import로 대체할 수 있습니다
const formatPhone = (phone) => {
  if (!phone) return '-';
  const phoneStr = phone.toString();
  
  if (phoneStr.length === 8) {
    return `${phoneStr.slice(0, 4)}-${phoneStr.slice(4)}`;
  }
  
  if (phoneStr.length === 11) {
    return `${phoneStr.slice(0, 3)}-${phoneStr.slice(3, 7)}-${phoneStr.slice(7)}`;
  }
  
  return phoneStr;
};

const getTrackDisplay = (track) => {
  const TRACK_MAPPING = {
    'EduFront': '교육 프론트엔드',
    'EduBack': '교육 백엔드',
    'ProFront': '프로젝트 프론트엔드',
    'ProBack': '프로젝트 백엔드'
  };
  
  return TRACK_MAPPING[track] || track || '-';
};

/**
 * 부원 테이블 컴포넌트
 */
const MemberTable = ({ members, sortConfig, requestSort, onEdit, onDelete }) => {
  // 정렬 아이콘 표시
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <FaSort />;
    }
    return sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };

  // 멤버 역할에 따라 아이콘 표시
  const getRoleIcon = (role) => {
    if (role === 'ADMIN') {
      return <FaUserCog style={{ color: '#DF773B', marginRight: '5px' }} />;
    }
    return <FaUser style={{ color: '#373737', marginRight: '5px' }} />;
  };

  return (
    <div className="card">
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th onClick={() => requestSort('name')} style={{ cursor: 'pointer' }}>
                이름 {getSortIcon('name')}
              </th>
              <th onClick={() => requestSort('studentId')} style={{ cursor: 'pointer' }}>
                학번 {getSortIcon('studentId')}
              </th>
              <th onClick={() => requestSort('phone')} style={{ cursor: 'pointer' }}>
                전화번호 {getSortIcon('phone')}
              </th>
              <th onClick={() => requestSort('track')} style={{ cursor: 'pointer' }}>
                트랙 {getSortIcon('track')}
              </th>
              <th onClick={() => requestSort('role')} style={{ cursor: 'pointer' }}>
                역할 {getSortIcon('role')}
              </th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.studentId}>
                <td>
                  <Link to={`/members/${member.studentId}`} className="member-name">
                    {member.name}
                  </Link>
                </td>
                <td>{member.studentId}</td>
                <td>
                  <span style={{ display: 'flex', alignItems: 'center' }}>
                    <FaPhone style={{ color: '#373737', marginRight: '5px' }} />
                    {formatPhone(member.phone)}
                  </span>
                </td>
                <td>
                  <span style={{ display: 'flex', alignItems: 'center' }}>
                    <FaLaptopCode style={{ color: '#DF773B', marginRight: '5px' }} />
                    {getTrackDisplay(member.track)}
                  </span>
                </td>
                <td>
                  <span style={{ display: 'flex', alignItems: 'center' }}>
                    {getRoleIcon(member.role)}
                    {member.role === 'ADMIN' ? '운영진' : '아기사자'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MemberTable;