// Safety Flag Display Component
import React from 'react';
import { SafetyFlag } from '../types';
import './SafetyFlagDisplay.css';

interface SafetyFlagDisplayProps {
  flags: SafetyFlag[];
}

export const SafetyFlagDisplay: React.FC<SafetyFlagDisplayProps> = ({ flags }) => {
  if (flags.length === 0) {
    return null;
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return '🚨';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '📌';
    }
  };

  return (
    <div 
      className="safety-flags" 
      role="region" 
      aria-label="Safety concerns detected"
    >
      <h3 className="safety-flags-title">
        Safety Analysis
        <span className="safety-flags-count" aria-label={`${flags.length} flags detected`}>
          {flags.length}
        </span>
      </h3>
      <ul className="safety-flags-list">
        {flags.map((flag, index) => (
          <li
            key={index}
            className={`safety-flag safety-flag-${flag.severity}`}
            role="alert"
            aria-live="polite"
          >
            <span className="safety-flag-icon" aria-hidden="true">
              {getSeverityIcon(flag.severity)}
            </span>
            <div className="safety-flag-content">
              <div className="safety-flag-header">
                <span className="safety-flag-type">{flag.type.replace(/_/g, ' ')}</span>
                <span className="safety-flag-severity">{flag.severity}</span>
              </div>
              <p className="safety-flag-message">{flag.message}</p>
              {flag.details && (
                <p className="safety-flag-details">{flag.details}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

