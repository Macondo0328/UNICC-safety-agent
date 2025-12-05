// Compliance Evidence Display Component
import React, { useState } from 'react';
import { ComplianceEvidence } from '../services/policyMapping';
import './ComplianceEvidenceDisplay.css';

interface ComplianceEvidenceDisplayProps {
  evidence: ComplianceEvidence;
  onExport?: () => void;
}

export const ComplianceEvidenceDisplay: React.FC<ComplianceEvidenceDisplayProps> = ({
  evidence,
  onExport
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const getComplianceStatusColor = (compliant: boolean): string => {
    return compliant ? '#28a745' : '#dc3545';
  };

  const getComplianceStatusIcon = (compliant: boolean): string => {
    return compliant ? '✅' : '❌';
  };

  return (
    <div className="compliance-evidence">
      <div className="compliance-header">
        <h3 className="compliance-title">Compliance Evidence</h3>
        <div className="compliance-meta">
          <span className="review-id">Review ID: {evidence.reviewId}</span>
          <span className="timestamp">{new Date(evidence.evidenceTimestamp).toLocaleString()}</span>
        </div>
        {onExport && (
          <button className="btn btn-outline btn-sm" onClick={onExport}>
            Export Evidence
          </button>
        )}
      </div>

      <div className="compliance-summary">
        <h4>NIST AI RMF Compliance</h4>
        <div className="compliance-grid">
          <div className="compliance-item">
            <span className="compliance-icon">
              {getComplianceStatusIcon(evidence.nistCompliance.govern)}
            </span>
            <span className="compliance-label">GOVERN</span>
            <span 
              className="compliance-status"
              style={{ color: getComplianceStatusColor(evidence.nistCompliance.govern) }}
            >
              {evidence.nistCompliance.govern ? 'Compliant' : 'Non-compliant'}
            </span>
          </div>
          <div className="compliance-item">
            <span className="compliance-icon">
              {getComplianceStatusIcon(evidence.nistCompliance.map)}
            </span>
            <span className="compliance-label">MAP</span>
            <span 
              className="compliance-status"
              style={{ color: getComplianceStatusColor(evidence.nistCompliance.map) }}
            >
              {evidence.nistCompliance.map ? 'Compliant' : 'Non-compliant'}
            </span>
          </div>
          <div className="compliance-item">
            <span className="compliance-icon">
              {getComplianceStatusIcon(evidence.nistCompliance.measure)}
            </span>
            <span className="compliance-label">MEASURE</span>
            <span 
              className="compliance-status"
              style={{ color: getComplianceStatusColor(evidence.nistCompliance.measure) }}
            >
              {evidence.nistCompliance.measure ? 'Compliant' : 'Non-compliant'}
            </span>
          </div>
          <div className="compliance-item">
            <span className="compliance-icon">
              {getComplianceStatusIcon(evidence.nistCompliance.manage)}
            </span>
            <span className="compliance-label">MANAGE</span>
            <span 
              className="compliance-status"
              style={{ color: getComplianceStatusColor(evidence.nistCompliance.manage) }}
            >
              {evidence.nistCompliance.manage ? 'Compliant' : 'Non-compliant'}
            </span>
          </div>
        </div>
      </div>

      <div className="compliance-summary">
        <h4>EU AI Act Compliance</h4>
        <div className="compliance-grid">
          <div className="compliance-item">
            <span className="compliance-icon">
              {getComplianceStatusIcon(evidence.euAiActCompliance.gpaITransparency)}
            </span>
            <span className="compliance-label">GPAI Transparency</span>
            <span 
              className="compliance-status"
              style={{ color: getComplianceStatusColor(evidence.euAiActCompliance.gpaITransparency) }}
            >
              {evidence.euAiActCompliance.gpaITransparency ? 'Compliant' : 'Non-compliant'}
            </span>
          </div>
          <div className="compliance-item">
            <span className="compliance-icon">
              {getComplianceStatusIcon(evidence.euAiActCompliance.highRiskControls)}
            </span>
            <span className="compliance-label">High-Risk Controls</span>
            <span 
              className="compliance-status"
              style={{ color: getComplianceStatusColor(evidence.euAiActCompliance.highRiskControls) }}
            >
              {evidence.euAiActCompliance.highRiskControls ? 'Compliant' : 'Non-compliant'}
            </span>
          </div>
          <div className="compliance-item">
            <span className="compliance-icon">
              {getComplianceStatusIcon(evidence.euAiActCompliance.prohibitedPractices)}
            </span>
            <span className="compliance-label">Prohibited Practices</span>
            <span 
              className="compliance-status"
              style={{ color: getComplianceStatusColor(evidence.euAiActCompliance.prohibitedPractices) }}
            >
              {evidence.euAiActCompliance.prohibitedPractices ? 'Compliant' : 'Non-compliant'}
            </span>
          </div>
          <div className="compliance-item">
            <span className="compliance-icon">
              {getComplianceStatusIcon(evidence.euAiActCompliance.userTransparency)}
            </span>
            <span className="compliance-label">User Transparency</span>
            <span 
              className="compliance-status"
              style={{ color: getComplianceStatusColor(evidence.euAiActCompliance.userTransparency) }}
            >
              {evidence.euAiActCompliance.userTransparency ? 'Compliant' : 'Non-compliant'}
            </span>
          </div>
        </div>
      </div>

      <div className="policy-mappings">
        <button
          className="section-toggle"
          onClick={() => toggleSection('policy-mappings')}
          aria-expanded={expandedSections.has('policy-mappings')}
        >
          <span className="toggle-icon">
            {expandedSections.has('policy-mappings') ? '▼' : '▶'}
          </span>
          Policy Mappings ({evidence.policyMappings.length})
        </button>
        
        {expandedSections.has('policy-mappings') && (
          <div className="policy-mappings-content">
            {evidence.policyMappings.map((mapping, index) => (
              <div key={index} className="policy-mapping">
                <div className="mapping-header">
                  <span className="policy-source">{mapping.policySource}</span>
                  <span className="decision-code">{mapping.decisionCode}</span>
                </div>
                <div className="mapping-content">
                  <p className="mapping-clause">
                    <strong>Clause:</strong> {mapping.clause}
                  </p>
                  <p className="mapping-nist">
                    <strong>NIST:</strong> {mapping.nistFunction} → {mapping.nistOutcome}
                  </p>
                  <p className="mapping-eu">
                    <strong>EU AI Act:</strong> {mapping.euAiActDuty} ({mapping.euAiActTier})
                  </p>
                  <p className="mapping-example">
                    <strong>Example:</strong> {mapping.exampleHazard}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};


