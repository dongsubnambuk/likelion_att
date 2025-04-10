// src/components/ErrorBoundary.js
import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // 다음 렌더링에서 폴백 UI가 보이도록 상태를 업데이트합니다.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // 에러 리포팅 서비스에 에러를 기록할 수도 있습니다.
    // console.error("컴포넌트 오류 발생:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // 폴백 UI를 커스텀하여 렌더링할 수 있습니다.
      return (
        <div className="card" style={{ padding: '20px', margin: '20px 0', backgroundColor: '#fff3dc', color: '#856404', borderColor: '#ffeeba' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
            <FaExclamationTriangle style={{ fontSize: '24px', marginRight: '10px' }} />
            <h3 style={{ margin: 0 }}>문제가 발생했습니다</h3>
          </div>
          <p>컴포넌트 렌더링 중 오류가 발생했습니다. 다시 시도하거나 페이지를 새로고침 해주세요.</p>
          <details style={{ marginTop: '10px' }}>
            <summary>자세한 오류 정보</summary>
            <p style={{ marginTop: '10px', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
              {this.state.error && this.state.error.toString()}
            </p>
          </details>
          {this.props.resetErrorBoundary && (
            <button 
              className="btn btn-primary" 
              onClick={this.props.resetErrorBoundary}
              style={{ marginTop: '15px' }}
            >
              다시 시도
            </button>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;