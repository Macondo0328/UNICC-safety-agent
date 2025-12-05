// Safety Review Queue - Case Management and Review Interface
import React from 'react';
import { CaseQueue } from './CaseQueue';
import { ReviewWorkspace } from './ReviewWorkspace';
import { ReviewResponse, ComplianceEvidence } from '../types';
import './SafetyReviewQueue.css';

interface SafetyReviewQueueProps {
  selectedCaseId?: string;
  onCaseSelect: (caseId: string) => void;
  filters: {
    decision: string;
    hazardType: string;
    source: string;
    timeRange: string;
  };
  onFilterChange: (filter: string, value: string) => void;
  cases: any[];
  selectedReview?: ReviewResponse;
  complianceEvidence?: ComplianceEvidence;
  onExportEvidence: () => void;
  onOverrideDecision: (newDecision: string) => void;
  onSendFeedback: (feedback: string) => void;
}

export const SafetyReviewQueue: React.FC<SafetyReviewQueueProps> = ({
  selectedCaseId,
  onCaseSelect,
  filters,
  onFilterChange,
  cases,
  selectedReview,
  complianceEvidence,
  onExportEvidence,
  onOverrideDecision,
  onSendFeedback
}) => {
  return (
    <div className="safety-review-queue">
      <div className="case-queue-panel">
        <CaseQueue
          cases={cases}
          selectedCaseId={selectedCaseId}
          onCaseSelect={onCaseSelect}
          filters={filters}
          onFilterChange={onFilterChange}
        />
      </div>

      <div className="review-workspace-panel">
        <ReviewWorkspace
          review={selectedReview}
          complianceEvidence={complianceEvidence}
          onExportEvidence={onExportEvidence}
          onOverrideDecision={onOverrideDecision}
          onSendFeedback={onSendFeedback}
        />
      </div>
    </div>
  );
};




