// src/components/Tabs.js
import React, { useState } from 'react';
import './Tabs.css';

/**
 * 탭 컨테이너 컴포넌트
 * @param {Object} props
 * @param {ReactNode} props.children - Tab 컴포넌트들
 * @param {number} props.defaultTab - 기본으로 선택될 탭 인덱스 (기본값: 0)
 * @returns {JSX.Element}
 */
export const Tabs = ({ children, defaultTab = 0 }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <div className="tabs">
      <div className="tab-headers">
        {React.Children.map(children, (child, index) => (
          <div
            className={`tab-header ${index === activeTab ? 'active' : ''}`}
            onClick={() => setActiveTab(index)}
          >
            {child.props.title}
          </div>
        ))}
      </div>
      <div className="tab-content">
        {React.Children.toArray(children)[activeTab]}
      </div>
    </div>
  );
};

/**
 * 개별 탭 컴포넌트
 * @param {Object} props
 * @param {string} props.title - 탭 제목
 * @param {ReactNode} props.children - 탭 내용
 * @returns {JSX.Element}
 */
export const Tab = ({ children }) => <div className="tab-pane">{children}</div>;