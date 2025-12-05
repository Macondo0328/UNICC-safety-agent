// Decision Chips Component - Tri-state with distinct iconography
import React from 'react';
import { DecisionCode } from '../types';
import './DecisionChips.css';

interface DecisionChipsProps {
  decisionCode: DecisionCode;
  size?: 'small' | 'medium' | 'large';
  showRationale?: boolean;
  rationale?: string;
  className?: string;
}

export const DecisionChips: React.FC<DecisionChipsProps> = ({
  decisionCode,
  size = 'medium',
  showRationale = false,
  rationale,
  className = ''
}) => {
  const getDecisionConfig = (code: DecisionCode) => {
    switch (code) {
      case 'ALLOW':
        return {
          icon: '✅',
          text: 'ALLOW',
          description: 'Safe to proceed',
          color: 'success',
          bgColor: '#d4edda',
          textColor: '#155724',
          borderColor: '#c3e6cb'
        };
      case 'REVIEW':
        return {
          icon: '🟡',
          text: 'REVIEW',
          description: 'Ambiguous/borderline',
          color: 'warning',
          bgColor: '#fff3cd',
          textColor: '#856404',
          borderColor: '#ffeaa7'
        };
      case 'BLOCK':
        return {
          icon: '⛔',
          text: 'BLOCK',
          description: 'Policy/hazard hit',
          color: 'error',
          bgColor: '#f8d7da',
          textColor: '#721c24',
          borderColor: '#f5c6cb'
        };
      case 'SANITIZE':
        return {
          icon: '🧹',
          text: 'SANITIZE',
          description: 'Content cleaned',
          color: 'info',
          bgColor: '#d1ecf1',
          textColor: '#0c5460',
          borderColor: '#bee5eb'
        };
      case 'DE-IDENTIFY+REVIEW':
        return {
          icon: '🔒',
          text: 'DE-IDENTIFY+REVIEW',
          description: 'Privacy protection',
          color: 'warning',
          bgColor: '#e2e3f1',
          textColor: '#383d41',
          borderColor: '#d1d3e2'
        };
      default:
        return {
          icon: '❓',
          text: 'UNKNOWN',
          description: 'Unknown decision',
          color: 'neutral',
          bgColor: '#f8f9fa',
          textColor: '#6c757d',
          borderColor: '#dee2e6'
        };
    }
  };

  const config = getDecisionConfig(decisionCode);

  return (
    <div 
      className={`decision-chip decision-chip--${size} decision-chip--${config.color} ${className}`}
      style={{
        backgroundColor: config.bgColor,
        color: config.textColor,
        borderColor: config.borderColor
      }}
      role="status"
      aria-label={`Decision: ${config.text} - ${config.description}`}
    >
      <span className="decision-chip__icon" aria-hidden="true">
        {config.icon}
      </span>
      <div className="decision-chip__content">
        <span className="decision-chip__text">{config.text}</span>
        <span className="decision-chip__description">{config.description}</span>
        {showRationale && rationale && (
          <span className="decision-chip__rationale">{rationale}</span>
        )}
      </div>
    </div>
  );
};

// Compact version for lists
export const DecisionChipCompact: React.FC<{
  decisionCode: DecisionCode;
  className?: string;
}> = ({ decisionCode, className = '' }) => {
  const getCompactConfig = (code: DecisionCode) => {
    switch (code) {
      case 'ALLOW':
        return { icon: '✅', color: 'success' };
      case 'REVIEW':
        return { icon: '🟡', color: 'warning' };
      case 'BLOCK':
        return { icon: '⛔', color: 'error' };
      case 'SANITIZE':
        return { icon: '🧹', color: 'info' };
      case 'DE-IDENTIFY+REVIEW':
        return { icon: '🔒', color: 'warning' };
      default:
        return { icon: '❓', color: 'neutral' };
    }
  };

  const config = getCompactConfig(decisionCode);

  return (
    <span 
      className={`decision-chip-compact decision-chip-compact--${config.color} ${className}`}
      role="status"
      aria-label={`Decision: ${decisionCode}`}
    >
      <span className="decision-chip-compact__icon" aria-hidden="true">
        {config.icon}
      </span>
      <span className="decision-chip-compact__text">{decisionCode}</span>
    </span>
  );
};




