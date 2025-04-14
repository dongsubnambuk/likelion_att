// src/components/common/Loading.js
import React from 'react';

/**
 * 로딩 표시 컴포넌트
 */
const Loading = ({ message = '로딩 중...' }) => {
  return (
    <div className="loading-container" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '30px',
      textAlign: 'center'
    }}>
      <div className="spinner" style={{
        width: '40px',
        height: '40px',
        border: '3px solid rgba(223, 119, 59, 0.3)',
        borderRadius: '50%',
        borderTopColor: '#DF773B',
        animation: 'spin 1s ease-in-out infinite',
        marginBottom: '10px'
      }}></div>
      <p>{message}</p>
      
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default Loading;