// Review Workspace Component - Right Panel with Tabs
import React, { useState } from 'react';
import { ReviewResponse, Hazard, ComplianceEvidence } from '../types';
import { DecisionChips } from './DecisionChips';
import { HazardDisplay } from './HazardDisplay';
import { ComplianceEvidenceDisplay } from './ComplianceEvidenceDisplay';
import './ReviewWorkspace.css';

interface ReviewWorkspaceProps {
  review?: ReviewResponse;
  complianceEvidence?: ComplianceEvidence;
  onExportEvidence: () => void;
  onOverrideDecision: (newDecision: string) => void;
  onSendFeedback: (feedback: string) => void;
}

type TabType = 'summary' | 'hazards' | 'compliance';

export const ReviewWorkspace: React.FC<ReviewWorkspaceProps> = ({
  review,
  complianceEvidence,
  onExportEvidence,
  onOverrideDecision,
  onSendFeedback
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('summary');
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  if (!review) {
    return (
      <div className="review-workspace">
        <div className="workspace-empty">
          <div className="empty-state">
            <span className="empty-icon">🔍</span>
            <h3 className="empty-title">Select a case to review</h3>
            <p className="empty-description">
              Choose a case from the queue to view detailed analysis, hazards, and compliance information.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const getDecisionRationale = (decision: string, hazards: Hazard[]) => {
    switch (decision.toLowerCase()) {
      case 'allow':
        return 'No hazards detected. Content appears safe for processing.';
      case 'block':
        return `Blocked due to ${hazards.length} detected hazard${hazards.length !== 1 ? 's' : ''}.`;
      case 'review':
        return 'Content requires human review due to ambiguous signals.';
      case 'sanitize':
        return 'Content has been automatically cleaned and sanitized.';
      default:
        return 'Decision made based on safety analysis.';
    }
  };

  const getTopSignals = (hazards: Hazard[]) => {
    return hazards.slice(0, 3).map(hazard => ({
      id: hazard.id,
      name: hazard.name,
      severity: hazard.severity
    }));
  };

  return (
    <div className="review-workspace">
      <div className="workspace-header">
        <div className="workspace-title-section">
          <h2 className="workspace-title">Review Workspace</h2>
          <div className="workspace-meta">
            <span className="review-id">
              ID: {review.id}
              <button
                className="copy-button"
                onClick={() => navigator.clipboard.writeText(review.id)}
                aria-label="Copy review ID"
              >
                📋
              </button>
            </span>
            <span className="processing-time">
              Processed in {review.latency_ms}ms
            </span>
          </div>
        </div>
        
        <div className="workspace-actions">
          <button
            className="btn btn-primary"
            onClick={onExportEvidence}
            aria-label="Export evidence bundle"
          >
            📥 Export Evidence
          </button>
          <button
            className="btn btn-outline"
            onClick={() => setShowOverrideModal(true)}
            aria-label="Override decision"
          >
            🔄 Override Decision
          </button>
          <button
            className="btn btn-outline"
            onClick={() => setShowFeedbackModal(true)}
            aria-label="Send feedback"
          >
            💬 Send Feedback
          </button>
        </div>
      </div>

      <div className="workspace-tabs">
        <button
          className={`tab-button ${activeTab === 'summary' ? 'active' : ''}`}
          onClick={() => setActiveTab('summary')}
          aria-current={activeTab === 'summary' ? 'page' : undefined}
        >
          📊 Summary
        </button>
        <button
          className={`tab-button ${activeTab === 'hazards' ? 'active' : ''}`}
          onClick={() => setActiveTab('hazards')}
          aria-current={activeTab === 'hazards' ? 'page' : undefined}
        >
          ⚠️ Hazards ({review.hazards.length})
        </button>
        <button
          className={`tab-button ${activeTab === 'compliance' ? 'active' : ''}`}
          onClick={() => setActiveTab('compliance')}
          aria-current={activeTab === 'compliance' ? 'page' : undefined}
        >
          📋 Compliance
        </button>
      </div>

      <div className="workspace-content">
        {activeTab === 'summary' && (
          <div className="tab-content summary-tab">
            <div className="decision-section">
              <DecisionChips
                decisionCode={review.decision.toUpperCase() as any}
                size="large"
                showRationale={true}
                rationale={getDecisionRationale(review.decision, review.hazards)}
              />
            </div>

            <div className="signals-section">
              <h3 className="section-title">Top Signals</h3>
              {review.hazards.length > 0 ? (
                <div className="signals-list">
                  {getTopSignals(review.hazards).map(signal => (
                    <div key={signal.id} className="signal-item">
                      <span className="signal-id">{signal.id}</span>
                      <span className="signal-name">{signal.name}</span>
                      <span className={`signal-severity signal-severity--${signal.severity}`}>
                        {signal.severity.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-signals">
                  <span className="no-signals-icon">✅</span>
                  <span className="no-signals-text">No concerning signals detected</span>
                </div>
              )}
            </div>

            <div className="timing-section">
              <h3 className="section-title">Performance</h3>
              <div className="timing-grid">
                <div className="timing-item">
                  <span className="timing-label">Processing Time</span>
                  <span className="timing-value">{review.latency_ms}ms</span>
                </div>
                <div className="timing-item">
                  <span className="timing-label">Hazards Detected</span>
                  <span className="timing-value">{review.hazards.length}</span>
                </div>
                <div className="timing-item">
                  <span className="timing-label">Reason Codes</span>
                  <span className="timing-value">{review.reason_codes.length}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'hazards' && (
          <div className="tab-content hazards-tab">
            <HazardDisplay
              hazards={review.hazards}
              reasonCodes={review.reason_codes}
              decisionCode={review.decision.toUpperCase() as any}
              onViewEvidence={onExportEvidence}
            />
          </div>
        )}

        {activeTab === 'compliance' && (
          <div className="tab-content compliance-tab">
            {complianceEvidence ? (
              <ComplianceEvidenceDisplay
                evidence={complianceEvidence}
                onExport={onExportEvidence}
              />
            ) : (
              <div className="compliance-empty">
                <div className="empty-state">
                  <span className="empty-icon">📋</span>
                  <h3 className="empty-title">No compliance evidence available</h3>
                  <p className="empty-description">
                    Compliance evidence is not available for this review. This can happen with mock endpoints or when compliance checks are disabled.
                  </p>
                  <button className="btn btn-primary">
                    Run Compliance Checks
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Override Modal */}
      {showOverrideModal && (
        <div className="modal-overlay" onClick={() => setShowOverrideModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Override Decision</h3>
              <button
                className="modal-close"
                onClick={() => setShowOverrideModal(false)}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to override the current decision?</p>
              <div className="modal-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    onOverrideDecision('allow');
                    setShowOverrideModal(false);
                  }}
                >
                  Override to Allow
                </button>
                <button
                  className="btn btn-outline"
                  onClick={() => setShowOverrideModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="modal-overlay" onClick={() => setShowFeedbackModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Send Feedback</h3>
              <button
                className="modal-close"
                onClick={() => setShowFeedbackModal(false)}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <textarea
                className="feedback-textarea"
                placeholder="Share your feedback about this review..."
                rows={4}
              />
              <div className="modal-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    onSendFeedback('Feedback submitted');
                    setShowFeedbackModal(false);
                  }}
                >
                  Send Feedback
                </button>
                <button
                  className="btn btn-outline"
                  onClick={() => setShowFeedbackModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};




