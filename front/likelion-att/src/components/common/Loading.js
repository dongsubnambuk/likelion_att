// src/components/common/Loading.js
import React from 'react';

/**
 * 로딩 표시 컴포넌트
 */
const Loading = ({ message = '로딩 중...' }) => {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>{message}</p>
      
      <style jsx>{`
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 30px;
          text-align: center;
        }
        
        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(223, 119, 59, 0.3);
          border-radius: 50%;
          border-top-color: #DF773B;
          animation: spin 1s ease-in-out infinite;
          margin-bottom: 10px;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Loading;