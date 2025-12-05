// Case Queue Component - Left Panel
import React, { useState } from 'react';
import { ReviewResponse, Hazard } from '../types';
import { DecisionChipCompact } from './DecisionChips';
import { sanitizeText } from '../utils/sanitization';
import './CaseQueue.css';

interface CaseItem {
  id: string;
  decision: string;
  hazards: Hazard[];
  prompt: string;
  submittedTime: string;
  source: 'UI' | 'API';
  model: string;
  latency: number;
}

interface CaseQueueProps {
  cases: CaseItem[];
  selectedCaseId?: string;
  onCaseSelect: (caseId: string) => void;
  filters: {
    decision: string;
    hazardType: string;
    source: string;
    timeRange: string;
  };
  onFilterChange: (filter: string, value: string) => void;
}

export const CaseQueue: React.FC<CaseQueueProps> = ({
  cases,
  selectedCaseId,
  onCaseSelect,
  filters,
  onFilterChange
}) => {
  const [expandedCaseId, setExpandedCaseId] = useState<string | null>(null);

  const getHazardChips = (hazards: Hazard[]) => {
    return hazards.map(hazard => (
      <span key={hazard.id} className="hazard-chip">
        {hazard.id}
      </span>
    ));
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const truncatePrompt = (prompt: string, maxLength: number = 80) => {
    if (prompt.length <= maxLength) return prompt;
    return prompt.substring(0, maxLength) + '...';
  };

  const filteredCases = cases.filter(caseItem => {
    if (filters.decision && filters.decision !== 'all' && caseItem.decision !== filters.decision) {
      return false;
    }
    if (filters.hazardType && filters.hazardType !== 'all') {
      const hasHazard = caseItem.hazards.some(h => h.id === filters.hazardType);
      if (!hasHazard) return false;
    }
    if (filters.source && filters.source !== 'all' && caseItem.source !== filters.source) {
      return false;
    }
    return true;
  });

  return (
    <div className="case-queue">
      <div className="case-queue-header">
        <h2 className="case-queue-title">Review Queue</h2>
        <div className="case-queue-stats">
          <span className="queue-stat">
            {filteredCases.length} of {cases.length} cases
          </span>
        </div>
      </div>

      <div className="case-queue-filters">
        <div className="filter-group">
          <label htmlFor="decision-filter" className="filter-label">Decision</label>
          <select
            id="decision-filter"
            className="filter-select"
            value={filters.decision}
            onChange={(e) => onFilterChange('decision', e.target.value)}
          >
            <option value="all">All Decisions</option>
            <option value="allow">Allow</option>
            <option value="review">Review</option>
            <option value="block">Block</option>
            <option value="sanitize">Sanitize</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="hazard-filter" className="filter-label">Hazard Type</label>
          <select
            id="hazard-filter"
            className="filter-select"
            value={filters.hazardType}
            onChange={(e) => onFilterChange('hazardType', e.target.value)}
          >
            <option value="all">All Hazards</option>
            <option value="H01">Prompt Injection</option>
            <option value="H02">Improper Output</option>
            <option value="H03">PII Disclosure</option>
            <option value="H04">Hate Speech</option>
            <option value="H05">Self-harm</option>
            <option value="H06">Misinformation</option>
            <option value="H07">System Leakage</option>
            <option value="H08">Resource Abuse</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="source-filter" className="filter-label">Source</label>
          <select
            id="source-filter"
            className="filter-select"
            value={filters.source}
            onChange={(e) => onFilterChange('source', e.target.value)}
          >
            <option value="all">All Sources</option>
            <option value="UI">UI</option>
            <option value="API">API</option>
          </select>
        </div>
      </div>

      <div className="case-queue-list" role="list" aria-label="Review cases">
        {filteredCases.map((caseItem) => (
          <div
            key={caseItem.id}
            className={`case-item ${selectedCaseId === caseItem.id ? 'selected' : ''}`}
            onClick={() => onCaseSelect(caseItem.id)}
            role="listitem"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onCaseSelect(caseItem.id);
              }
            }}
            aria-label={`Case ${caseItem.id}: ${caseItem.decision} decision`}
          >
            <div className="case-item-header">
              <DecisionChipCompact 
                decisionCode={caseItem.decision.toUpperCase() as any}
                className="case-decision-chip"
              />
              <div className="case-meta">
                <span className="case-time">{formatTime(caseItem.submittedTime)}</span>
                <span className="case-source">{caseItem.source}</span>
              </div>
            </div>

            <div className="case-item-content">
              <div className="case-prompt" title={sanitizeText(caseItem.prompt)}>
                {truncatePrompt(sanitizeText(caseItem.prompt))}
              </div>
              
              <div className="case-details">
                <span className="case-model">{caseItem.model}</span>
                <span className="case-latency">{caseItem.latency}ms</span>
              </div>

              {caseItem.hazards.length > 0 && (
                <div className="case-hazards">
                  <span className="hazards-label">Hazards:</span>
                  <div className="hazards-chips">
                    {getHazardChips(caseItem.hazards)}
                  </div>
                </div>
              )}
            </div>

            <button
              className="case-expand-button"
              onClick={(e) => {
                e.stopPropagation();
                setExpandedCaseId(expandedCaseId === caseItem.id ? null : caseItem.id);
              }}
              aria-label={`${expandedCaseId === caseItem.id ? 'Collapse' : 'Expand'} case details`}
            >
              {expandedCaseId === caseItem.id ? '▼' : '▶'}
            </button>
          </div>
        ))}
      </div>

      {filteredCases.length === 0 && (
        <div className="case-queue-empty">
          <div className="empty-state">
            <span className="empty-icon">📋</span>
            <h3 className="empty-title">No cases match your filters</h3>
            <p className="empty-description">
              Try adjusting your filter criteria or check back later for new cases.
            </p>
            <button
              className="btn btn-outline"
              onClick={() => {
                onFilterChange('decision', 'all');
                onFilterChange('hazardType', 'all');
                onFilterChange('source', 'all');
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};



