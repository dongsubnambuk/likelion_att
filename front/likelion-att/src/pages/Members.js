// src/pages/Members.js
import React, { useState, useEffect } from 'react';
import { FaPlus, FaFileExcel } from 'react-icons/fa';
import { userApi } from '../services/api';

// 컴포넌트 가져오기
import {
  BulkImportModal,
  DeleteConfirmModal,
  MemberTable,
  MemberFilters
} from '../components/members';

// Loading 컴포넌트를 직접 가져옴
import Loading from '../components/common/Loading';

// Notification 컴포넌트 임시 정의
// 나중에 Notification.js 파일이 생성되면 import로 대체할 수 있습니다
const Notification = ({ notification, onClose }) => {
  if (!notification) return null;

  return (
    <div className={`alert alert-${notification.type}`}>
      {notification.type === 'success'
        ? <span>✅</span>
        : <span>⚠️</span>}
      <span>{notification.message}</span>
    </div>
  );
};

/**
 * 부원 관리 페이지 컴포넌트
 */
const Members = () => {
  const [members, setMembers] = useState({ admin: [], users: [] });
  const [filteredMembers, setFilteredMembers] = useState({ admin: [], users: [] });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [notification, setNotification] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'admin', 'student'

  // 부원 목록 불러오기
  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await userApi.getAll();
      console.log('부원 목록 응답:', response.data);

      if (response.data && typeof response.data === 'object') {
        // API 응답 구조에 맞게 데이터 설정
        const adminMembers = response.data.admin || [];
        const studentMembers = response.data.users || [];

        setMembers({
          admin: adminMembers,
          users: studentMembers
        });

        setFilteredMembers({
          admin: adminMembers,
          users: studentMembers
        });
      } else {
        console.error('예상치 못한 부원 데이터 형식:', response.data);
        setMembers({ admin: [], users: [] });
        setFilteredMembers({ admin: [], users: [] });
      }
    } catch (error) {
      console.error('부원 목록 로딩 실패:', error);
      setNotification({
        type: 'error',
        message: '부원 목록을 불러오는데 실패했습니다.'
      });
      setMembers({ admin: [], users: [] });
      setFilteredMembers({ admin: [], users: [] });
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 부원 목록 불러오기
  useEffect(() => {
    fetchMembers();
  }, []);

  // 검색어 변경 시 필터링
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredMembers(members);
    } else {
      const searchLower = searchTerm.toLowerCase();

      // 필터링 함수
      const filterMember = (member) => {
        return (
          member.name.toLowerCase().includes(searchLower) ||
          member.studentId.toString().includes(searchTerm) ||
          (member.phone && member.phone.toString().includes(searchTerm)) ||
          (member.track && member.track.toLowerCase().includes(searchLower))
        );
      };

      // 관리자와 일반 부원 필터링
      const filteredAdmin = members.admin.filter(filterMember);
      const filteredUsers = members.users.filter(filterMember);

      setFilteredMembers({
        admin: filteredAdmin,
        users: filteredUsers
      });
    }
  }, [searchTerm, members]);

  // 정렬 처리 함수
  const sortMembers = (memberList) => {
    if (!sortConfig.key) return memberList;

    return [...memberList].sort((a, b) => {
      // null 값 처리 - null 값은 항상 마지막에 위치
      if (a[sortConfig.key] === null || a[sortConfig.key] === undefined) return sortConfig.direction === 'asc' ? 1 : -1;
      if (b[sortConfig.key] === null || b[sortConfig.key] === undefined) return sortConfig.direction === 'asc' ? -1 : 1;

      // 일반적인 비교 로직
      let valueA = a[sortConfig.key];
      let valueB = b[sortConfig.key];

      // 학번과 전화번호는 숫자로 변환하여 비교
      if (sortConfig.key === 'studentId' || sortConfig.key === 'phone') {
        valueA = Number(valueA) || 0;
        valueB = Number(valueB) || 0;
      }
      // 문자열은 소문자로 변환하여 비교
      else if (typeof valueA === 'string' && typeof valueB === 'string') {
        valueA = valueA.toLowerCase();
        valueB = valueB.toLowerCase();
      }

      if (valueA < valueB) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (valueA > valueB) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  // 정렬 요청 처리
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // 현재 탭에 따른 멤버 목록 가져오기
  const getCurrentMembers = () => {
    const sortedAdmin = sortMembers(filteredMembers.admin);
    const sortedUsers = sortMembers(filteredMembers.users);

    switch (activeTab) {
      case 'admin':
        return sortedAdmin;
      case 'student':
        return sortedUsers;
      case 'all':
      default:
        return [...sortedAdmin, ...sortedUsers];
    }
  };

  // 부원 생성 처리
  const handleCreateMember = async (memberData) => {
    try {
      // API 호출
      await userApi.create({
        ...memberData,
        studentId: parseInt(memberData.studentId),
        phone: memberData.phone
      });

      // 부원 목록 새로고침
      fetchMembers();
      setIsCreateModalOpen(false);

      setNotification({
        type: 'success',
        message: '부원이 성공적으로 등록되었습니다!'
      });

      // 3초 후 알림 제거
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    } catch (error) {
      console.error('부원 등록 실패:', error);
      setNotification({
        type: 'error',
        message: '부원 등록에 실패했습니다. 다시 시도해주세요.'
      });
    }
  };

  // 부원 수정 처리
  const handleEditMember = async (memberData) => {
    try {
      // API 호출
      await userApi.update(selectedMember.studentId, {
        ...memberData,
        studentId: parseInt(memberData.studentId),
        phone: memberData.phone
      });

      // 부원 목록 새로고침
      fetchMembers();
      setIsEditModalOpen(false);
      setSelectedMember(null);

      setNotification({
        type: 'success',
        message: '부원 정보가 성공적으로 수정되었습니다!'
      });

      // 3초 후 알림 제거
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    } catch (error) {
      console.error('부원 수정 실패:', error);
      setNotification({
        type: 'error',
        message: '부원 정보 수정에 실패했습니다. 다시 시도해주세요.'
      });
    }
  };

  // 부원 삭제 처리
  const handleDeleteMember = async (studentId) => {
    try {
      // API 호출
      await userApi.delete(studentId);

      // 부원 목록 새로고침
      fetchMembers();
      setIsDeleteModalOpen(false);
      setSelectedMember(null);

      setNotification({
        type: 'success',
        message: '부원이 성공적으로 삭제되었습니다!'
      });

      // 3초 후 알림 제거
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    } catch (error) {
      console.error('부원 삭제 실패:', error);
      setNotification({
        type: 'error',
        message: '부원 삭제에 실패했습니다. 다시 시도해주세요.'
      });
    }
  };

  // 부원 대량 등록 처리
  const handleBulkImport = async (file) => {
    try {
      // FormData 생성하여 파일 업로드
      const formData = new FormData();
      formData.append('file', file);

      // API 호출
      await userApi.bulkCreate(formData);

      setNotification({
        type: 'success',
        message: `파일이 성공적으로 업로드되었습니다. 부원 목록이 업데이트됩니다.`
      });

      setIsImportModalOpen(false);

      // 파일 업로드 후 부원 목록 새로고침
      fetchMembers();

      // 3초 후 알림 제거
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    } catch (error) {
      console.error('부원 대량 등록 실패:', error);
      setNotification({
        type: 'error',
        message: '부원 대량 등록에 실패했습니다. 파일 형식을 확인해주세요.'
      });
    }
  };

  // 알림 닫기 핸들러
  const handleCloseNotification = () => {
    setNotification(null);
  };

  // 현재 표시할 멤버 목록
  const currentMembers = getCurrentMembers();

  return (
    <div>
      <div className="card-header" style={{ marginBottom: '20px' }}>
        <h1>부원 관리</h1>
      </div>

      {/* 알림 메시지 */}
      <Notification
        notification={notification}
        onClose={handleCloseNotification}
      />

      {/* 검색 및 필터 영역 */}
      <MemberFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        adminCount={filteredMembers.admin.length}
        userCount={filteredMembers.users.length}
      />

      {/* 부원 목록 */}
      {loading ? (
        <Loading />
      ) : currentMembers.length > 0 ? (
        <MemberTable
          members={currentMembers}
          sortConfig={sortConfig}
          requestSort={requestSort}
          onEdit={(member) => {
            setSelectedMember(member);
            setIsEditModalOpen(true);
          }}
          onDelete={(member) => {
            setSelectedMember(member);
            setIsDeleteModalOpen(true);
          }}
        />
      ) : (
        <div className="card" style={{ padding: '30px', textAlign: 'center' }}>
          <p>검색 결과가 없습니다.</p>
          {searchTerm && (
            <button
              className="btn btn-secondary"
              style={{ marginTop: '10px' }}
              onClick={() => setSearchTerm('')}
            >
              모든 부원 보기
            </button>
          )}
        </div>
      )}

      {/* 모달 컴포넌트들 */}

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        member={selectedMember}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedMember(null);
        }}
        onConfirm={handleDeleteMember}
      />
    </div>
  );
};

export default Members;