// Hazard Display Component
import React from 'react';
import { Hazard, DecisionCode, SeverityLevel } from '../types';
import './HazardDisplay.css';

interface HazardDisplayProps {
  hazards: Hazard[];
  reasonCodes: string[];
  decisionCode: DecisionCode;
  onViewEvidence?: (hazardId: string) => void;
}

export const HazardDisplay: React.FC<HazardDisplayProps> = ({
  hazards,
  reasonCodes,
  decisionCode,
  onViewEvidence
}) => {
  const getSeverityColor = (severity: SeverityLevel): string => {
    switch (severity) {
      case 'low': return '#28a745';
      case 'medium': return '#ffc107';
      case 'high': return '#fd7e14';
      case 'critical': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getDecisionCodeColor = (code: DecisionCode): string => {
    switch (code) {
      case 'BLOCK': return '#dc3545';
      case 'REVIEW': return '#ffc107';
      case 'SANITIZE': return '#17a2b8';
      case 'DE-IDENTIFY+REVIEW': return '#6f42c1';
      case 'ALLOW': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getDecisionCodeIcon = (code: DecisionCode): string => {
    switch (code) {
      case 'BLOCK': return '🚫';
      case 'REVIEW': return '👁️';
      case 'SANITIZE': return '🧹';
      case 'DE-IDENTIFY+REVIEW': return '🔒';
      case 'ALLOW': return '✅';
      default: return '❓';
    }
  };

  const getOWASPName = (owaspId: string): string => {
    const owaspNames: Record<string, string> = {
      'LLM01': 'Prompt Injection',
      'LLM02': 'Insecure Output Handling',
      'LLM03': 'Training Data Poisoning',
      'LLM04': 'Model DoS',
      'LLM05': 'Supply Chain Vulnerabilities',
      'LLM06': 'Sensitive Information Disclosure',
      'LLM07': 'Insecure Plugin Design',
      'LLM08': 'Excessive Agency',
      'LLM09': 'Overreliance',
      'LLM10': 'Model Theft'
    };
    return owaspNames[owaspId] || '';
  };

  if (hazards.length === 0) {
    return (
      <div className="hazard-display">
        <div className="hazard-summary">
          <div className="decision-badge allow">
            <span className="decision-icon">✅</span>
            <span className="decision-text">ALLOW</span>
          </div>
          <p className="hazard-message">No hazards detected. Content is safe to proceed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="hazard-display">
      <div className="hazard-summary">
        <div 
          className={`decision-badge ${decisionCode.toLowerCase().replace('+', '-')}`}
          style={{ backgroundColor: getDecisionCodeColor(decisionCode) }}
        >
          <span className="decision-icon">{getDecisionCodeIcon(decisionCode)}</span>
          <span className="decision-text">{decisionCode}</span>
        </div>
        <p className="hazard-message">
          {hazards.length} hazard{hazards.length !== 1 ? 's' : ''} detected
        </p>
      </div>

      <div className="hazards-list">
        <h3 className="hazards-title">Detected Hazards</h3>
        {hazards.map((hazard, index) => (
          <div key={hazard.id} className="hazard-item">
            <div className="hazard-header">
              <div className="hazard-id">{hazard.id}</div>
              <div 
                className="hazard-severity"
                style={{ color: getSeverityColor(hazard.severity) }}
              >
                {hazard.severity.toUpperCase()}
              </div>
            </div>
            
            <div className="hazard-content">
              <h4 className="hazard-name">{hazard.name}</h4>
              <div className="hazard-meta">
                <div className="owasp-reference">
                  <strong>OWASP LLM Top-10:</strong>{' '}
                  <a
                    href={`https://owasp.org/www-project-top-10-for-large-language-model-applications/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="owasp-link"
                    aria-label={`View OWASP ${hazard.owasp_llm} documentation`}
                  >
                    {hazard.owasp_llm}
                  </a>
                  <span className="owasp-name">
                    {getOWASPName(hazard.owasp_llm)}
                  </span>
                </div>
                {hazard.un_principle && (
                  <div className="hazard-principle">
                    <strong>UN Principle:</strong> {hazard.un_principle}
                  </div>
                )}
                <div className="hazard-decision">
                  <strong>Decision Code:</strong> {hazard.decision_code}
                </div>
              </div>
            </div>

            {onViewEvidence && (
              <button
                className="btn btn-sm btn-outline"
                onClick={() => onViewEvidence(hazard.id)}
                aria-label={`View evidence for ${hazard.name}`}
              >
                View Evidence
              </button>
            )}
          </div>
        ))}
      </div>

      {reasonCodes.length > 0 && (
        <div className="reason-codes">
          <h4 className="reason-codes-title">Reason Codes</h4>
          <div className="reason-codes-list">
            {reasonCodes.map((code, index) => (
              <span key={index} className="reason-code">
                {code}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="hazard-actions">
        {decisionCode === 'BLOCK' && (
          <div className="alert alert-warning">
            <strong>Content Blocked:</strong> This content has been blocked due to detected hazards. 
            Please review the hazards above and modify your input.
          </div>
        )}
        
        {decisionCode === 'REVIEW' && (
          <div className="alert alert-info">
            <strong>Content Under Review:</strong> This content requires human review before proceeding. 
            Please wait for review completion or contact an administrator.
          </div>
        )}
        
        {decisionCode === 'SANITIZE' && (
          <div className="alert alert-info">
            <strong>Content Sanitized:</strong> Potentially harmful content has been automatically removed or neutralized.
          </div>
        )}
        
        {decisionCode === 'DE-IDENTIFY+REVIEW' && (
          <div className="alert alert-warning">
            <strong>Privacy Protection:</strong> Personal identifiers have been removed and content is under review.
          </div>
        )}
      </div>
    </div>
  );
};


