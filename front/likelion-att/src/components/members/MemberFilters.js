// src/components/members/MemberFilters.js
import React from 'react';
import { FaSearch } from 'react-icons/fa';
import { TAB_OPTIONS } from '../../utils/constants';

/**
 * 부원 검색 및 필터링 컴포넌트
 */
const MemberFilters = ({ searchTerm, setSearchTerm, activeTab, setActiveTab, adminCount, userCount }) => {
  return (
    <div style={{ display: 'flex', marginBottom: '20px', gap: '15px', flexWrap: 'wrap' }}>
      <div className="search-container" style={{ flex: '1', minWidth: '250px' }}>
        <input
          type="text"
          className="search-input"
          placeholder="이름, 학번으로 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="search-button">
          <FaSearch />
        </button>
      </div>

      <div className="tabs" style={{ flex: '0 0 auto', display: 'flex', borderBottom: '1px solid #e0e0e0' }}>
        {TAB_OPTIONS.map(tab => (
          <button
            key={tab.value}
            className={`tab-btn ${activeTab === tab.value ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.value)}
            style={{
              padding: '8px 16px',
              backgroundColor: activeTab === tab.value ? '#DF773B' : '#f5f5f5',
              color: activeTab === tab.value ? 'white' : '#333',
              border: 'none',
              borderRadius: '4px 4px 0 0',
              cursor: 'pointer',
              marginRight: '5px'
            }}
          >
            {tab.label} ({tab.value === 'all'
              ? (adminCount + userCount)
              : tab.value === 'admin'
                ? adminCount
                : userCount
            })
          </button>
        ))}
      </div>
    </div>
  );
};

export default MemberFilters;