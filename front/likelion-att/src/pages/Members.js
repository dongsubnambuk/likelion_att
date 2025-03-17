// src/pages/Members.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaUserCircle, FaSort, FaSortUp, FaSortDown, FaExclamationTriangle, FaCheckCircle, FaFileExcel, FaUserCog, FaUser } from 'react-icons/fa';
import api, { userApi } from '../services/api';

// 부원 생성/수정 모달 컴포넌트
const MemberFormModal = ({ isOpen, member, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    studentId: '',
    role: 'STUDENT' // 기본값은 학생으로 설정
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name || '',
        studentId: member.studentId || '',
        role: member.role || 'STUDENT'
      });
    } else {
      setFormData({
        name: '',
        studentId: '',
        role: 'STUDENT'
      });
    }
    setError('');
  }, [member, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.studentId.trim()) {
      setError('이름과 학번은 필수 입력사항입니다.');
      return;
    }
    
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{member ? '부원 정보 수정' : '새 부원 등록'}</h2>
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
              <label htmlFor="name" className="form-label">이름 *</label>
              <input
                type="text"
                id="name"
                name="name"
                className="form-control"
                value={formData.name}
                onChange={handleChange}
                placeholder="이름을 입력하세요"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="studentId" className="form-label">학번 *</label>
              <input
                type="text"
                id="studentId"
                name="studentId"
                className="form-control"
                value={formData.studentId}
                onChange={handleChange}
                placeholder="학번을 입력하세요"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="role" className="form-label">역할</label>
              <select
                id="role"
                name="role"
                className="form-control"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="STUDENT">학생</option>
                <option value="ADMIN">운영진</option>
              </select>
            </div>
          </div>
          
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              취소
            </button>
            <button type="submit" className="btn btn-primary">
              {member ? '수정하기' : '등록하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 부원 대량 등록 모달 컴포넌트
const BulkImportModal = ({ isOpen, onClose, onSubmit }) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('파일을 선택해주세요.');
      return;
    }
    
    if (file.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' && 
        file.type !== 'application/vnd.ms-excel' &&
        file.type !== 'text/csv') {
      setError('엑셀 또는 CSV 파일만 업로드 가능합니다.');
      return;
    }
    
    onSubmit(file);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">부원 대량 등록</h2>
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
            
            <div style={{ marginBottom: '20px' }}>
              <p>엑셀 또는 CSV 파일을 업로드하여 부원을 대량으로 등록할 수 있습니다.</p>
              <p>
                <strong>파일 형식:</strong> 
                이름, 학번, 역할(STUDENT 또는 ADMIN) 순으로 열을 구성해주세요.
                <a href="#">샘플 파일 다운로드</a>
              </p>
            </div>
            
            <div className="form-group">
              <label htmlFor="file-upload" className="form-label">파일 선택</label>
              <input
                type="file"
                id="file-upload"
                className="form-control"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileChange}
              />
            </div>
          </div>
          
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              취소
            </button>
            <button type="submit" className="btn btn-primary">
              <FaFileExcel /> 파일 업로드
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 부원 삭제 확인 모달 컴포넌트
const DeleteConfirmModal = ({ isOpen, member, onClose, onConfirm }) => {
  if (!isOpen || !member) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">부원 삭제</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        
        <div className="modal-body">
          <div className="alert alert-warning">
            <FaExclamationTriangle />
            <span>이 작업은 되돌릴 수 없습니다.</span>
          </div>
          <p>
            <strong>{member.name} ({member.studentId})</strong> 부원을 삭제하시겠습니까?<br />
            해당 부원의 모든 출석 기록과 평가 정보가 함께 삭제됩니다.
          </p>
        </div>
        
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            취소
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => onConfirm(member.studentId)}
          >
            <FaTrash /> 삭제하기
          </button>
        </div>
      </div>
    </div>
  );
};

// 메인 Members 컴포넌트
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
      const filteredAdmin = members.admin.filter(member => 
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.studentId.toString().includes(searchTerm)
      );
      
      const filteredUsers = members.users.filter(member => 
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.studentId.toString().includes(searchTerm)
      );
      
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
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
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

  // 멤버 역할에 따라 아이콘 표시
  const getRoleIcon = (role) => {
    if (role === 'ADMIN') {
      return <FaUserCog style={{ color: '#3498db', marginRight: '5px' }} />;
    }
    return <FaUser style={{ color: '#7f8c8d', marginRight: '5px' }} />;
  };

  // 부원 생성 처리
  const handleCreateMember = async (memberData) => {
    try {
      // API 호출
      await userApi.create({
        ...memberData,
        studentId: parseInt(memberData.studentId)
      });
      
      // 부원 목록 새로고침
      fetchMembers();
      setIsCreateModalOpen(false);
      
      setNotification({
        type: 'success',
        message: '부원이 성공적으로 등록되었습니다!'
      });
      
      // 3초 후 알림 자동 제거
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
        studentId: parseInt(memberData.studentId)
      });
      
      // 부원 목록 새로고침
      fetchMembers();
      setIsEditModalOpen(false);
      setSelectedMember(null);
      
      setNotification({
        type: 'success',
        message: '부원 정보가 성공적으로 수정되었습니다!'
      });
      
      // 3초 후 알림 자동 제거
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
      
      // 3초 후 알림 자동 제거
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

  // 정렬 아이콘 표시
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <FaSort />;
    }
    return sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };

  // 현재 표시할 멤버 목록
  const currentMembers = getCurrentMembers();

  return (
    <div>
      <div className="card-header" style={{ marginBottom: '20px' }}>
        <h1>부원 관리</h1>
        {/* <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="btn btn-primary"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <FaPlus /> 새 부원 등록
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => setIsImportModalOpen(true)}
          >
            <FaFileExcel /> 대량 등록
          </button>
        </div> */}
      </div>

      {/* 알림 메시지 */}
      {notification && (
        <div className={`alert alert-${notification.type}`}>
          {notification.type === 'success' ? <FaCheckCircle /> : <FaExclamationTriangle />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* 검색 및 필터 영역 */}
      <div style={{ display: 'flex', marginBottom: '20px', gap: '15px', flexWrap: 'wrap' }}>
        <div className="search-container" style={{ flex: '1', minWidth: '250px' }}>
          <input
            type="text"
            className="search-input"
            placeholder="이름 또는 학번으로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="search-button">
            <FaSearch />
          </button>
        </div>
        
        <div className="tabs" style={{ flex: '0 0 auto', display: 'flex', borderBottom: '1px solid #e0e0e0' }}>
          <button 
            className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
            style={{
              padding: '8px 16px',
              backgroundColor: activeTab === 'all' ? '#3498db' : '#f5f5f5',
              color: activeTab === 'all' ? 'white' : '#333',
              border: 'none',
              borderRadius: '4px 4px 0 0',
              cursor: 'pointer',
              marginRight: '5px'
            }}
          >
            모든 부원 ({filteredMembers.admin.length + filteredMembers.users.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'admin' ? 'active' : ''}`}
            onClick={() => setActiveTab('admin')}
            style={{
              padding: '8px 16px',
              backgroundColor: activeTab === 'admin' ? '#3498db' : '#f5f5f5',
              color: activeTab === 'admin' ? 'white' : '#333',
              border: 'none',
              borderRadius: '4px 4px 0 0',
              cursor: 'pointer',
              marginRight: '5px'
            }}
          >
            운영진 ({filteredMembers.admin.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'student' ? 'active' : ''}`}
            onClick={() => setActiveTab('student')}
            style={{
              padding: '8px 16px',
              backgroundColor: activeTab === 'student' ? '#3498db' : '#f5f5f5',
              color: activeTab === 'student' ? 'white' : '#333',
              border: 'none',
              borderRadius: '4px 4px 0 0',
              cursor: 'pointer'
            }}
          >
            학생 ({filteredMembers.users.length})
          </button>
        </div>
      </div>

      {/* 부원 목록 */}
      {loading ? (
        <div className="loading">로딩 중...</div>
      ) : currentMembers.length > 0 ? (
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
                  <th onClick={() => requestSort('role')} style={{ cursor: 'pointer' }}>
                    역할 {getSortIcon('role')}
                  </th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {currentMembers.map((member) => (
                  <tr key={member.studentId}>
                    <td>
                      <Link to={`/members/${member.studentId}`} className="member-name">
                        {member.name}
                      </Link>
                    </td>
                    <td>{member.studentId}</td>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center' }}>
                        {getRoleIcon(member.role)}
                        {member.role === 'ADMIN' ? '운영진' : '학생'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <Link
                          to={`/members/${member.studentId}`}
                          className="btn btn-primary btn-sm"
                          title="상세 정보"
                        >
                          <FaUserCircle />
                        </Link>
                        <button
                          className="btn btn-secondary btn-sm"
                          title="수정"
                          onClick={() => {
                            setSelectedMember(member);
                            setIsEditModalOpen(true);
                          }}
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          title="삭제"
                          onClick={() => {
                            setSelectedMember(member);
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
              모든 부원 보기
            </button>
          )}
        </div>
      )}

      {/* 부원 생성 모달 */}
      <MemberFormModal
        isOpen={isCreateModalOpen}
        member={null}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateMember}
      />

      {/* 부원 수정 모달 */}
      <MemberFormModal
        isOpen={isEditModalOpen}
        member={selectedMember}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedMember(null);
        }}
        onSubmit={handleEditMember}
      />

      {/* 부원 삭제 모달 */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        member={selectedMember}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedMember(null);
        }}
        onConfirm={handleDeleteMember}
      />

      {/* 부원 대량 등록 모달 */}
      <BulkImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSubmit={handleBulkImport}
      />
    </div>
  );
};

export default Members;