// Risk Level Badge Component
import React from 'react';
import { RiskLevel } from '../types';
import { getAriaLabelForRiskLevel } from '../utils/accessibility';
import './RiskLevelBadge.css';

interface RiskLevelBadgeProps {
  riskLevel: RiskLevel;
  confidence?: number;
}

export const RiskLevelBadge: React.FC<RiskLevelBadgeProps> = ({ riskLevel, confidence }) => {
  const getRiskIcon = (level: RiskLevel) => {
    switch (level) {
      case RiskLevel.LOW:
        return '✓';
      case RiskLevel.MEDIUM:
        return '⚡';
      case RiskLevel.HIGH:
        return '⚠';
      case RiskLevel.CRITICAL:
        return '🛑';
      default:
        return '?';
    }
  };

  const ariaLabel = getAriaLabelForRiskLevel(riskLevel);
  const confidenceText = confidence !== undefined 
    ? `Confidence: ${(confidence * 100).toFixed(0)}%` 
    : '';

  return (
    <div 
      className={`risk-badge risk-badge-${riskLevel}`}
      role="status"
      aria-label={`${ariaLabel}${confidenceText ? `, ${confidenceText}` : ''}`}
    >
      <span className="risk-badge-icon" aria-hidden="true">
        {getRiskIcon(riskLevel)}
      </span>
      <div className="risk-badge-content">
        <span className="risk-badge-level">{riskLevel.toUpperCase()}</span>
        {confidence !== undefined && (
          <span className="risk-badge-confidence">
            {(confidence * 100).toFixed(0)}% confidence
          </span>
        )}
      </div>
    </div>
  );
};

