// Status Indicator Component
import React from 'react';
import { AgentStatus } from '../types';
import './StatusIndicator.css';

interface StatusIndicatorProps {
  status: AgentStatus | null;
  onRefresh?: () => void;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status, onRefresh }) => {
  if (!status) {
    return (
      <div className="status-indicator status-loading" role="status" aria-live="polite">
        <span className="status-dot"></span>
        <span>Checking connection...</span>
      </div>
    );
  }

  const isConnected = status.isConnected;
  const statusClass = isConnected ? 'status-connected' : 'status-disconnected';
  const statusText = isConnected ? 'Connected' : 'Disconnected';
  const ariaLabel = `AI Agent ${statusText}. Version ${status.version}`;

  return (
    <div 
      className={`status-indicator ${statusClass}`}
      role="status"
      aria-live="polite"
      aria-label={ariaLabel}
    >
      <span 
        className="status-dot" 
        aria-hidden="true"
      ></span>
      <div className="status-content">
        <span className="status-text">{statusText}</span>
        <span className="status-version">v{status.version}</span>
      </div>
      {onRefresh && (
        <button
          onClick={onRefresh}
          className="status-refresh-btn"
          aria-label="Refresh connection status"
          type="button"
        >
          ↻
        </button>
      )}
    </div>
  );
};

