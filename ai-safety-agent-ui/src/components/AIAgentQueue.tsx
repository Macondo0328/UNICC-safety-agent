// Safety Review Queue - Case Management and Review Interface
import React, { useState, useRef, useEffect } from 'react';
import { useAgentService } from '../hooks/useAgentService';
import { validatePrompt, sanitizeInput } from '../utils/validation';
import { announceToScreenReader } from '../utils/accessibility';
import { StatusIndicator } from './StatusIndicator';
import { CaseQueue } from './CaseQueue';
import { ReviewWorkspace } from './ReviewWorkspace';
import { ReviewResponse, Hazard, ComplianceEvidence } from '../types';
import { PolicyMappingService } from '../services/policyMapping';
import { EvidenceCollectionService } from '../services/evidenceCollection';
import './AIAgentQueue.css';

interface AIAgentQueueProps {
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
  onAddCase: (newCase: any) => void;
  selectedReview?: ReviewResponse;
  complianceEvidence?: ComplianceEvidence;
  onExportEvidence: () => void;
  onOverrideDecision: (newDecision: string) => void;
  onSendFeedback: (feedback: string) => void;
}

export const AIAgentQueue: React.FC<AIAgentQueueProps> = ({
  selectedCaseId,
  onCaseSelect,
  filters,
  onFilterChange,
  cases,
  onAddCase,
  selectedReview,
  complianceEvidence,
  onExportEvidence,
  onOverrideDecision,
  onSendFeedback
}) => {
  const [prompt, setPrompt] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const {
    status,
    metrics,
    checkConnection,
    clearError,
    clearResponse
  } = useAgentService();
  
  const policyMappingService = PolicyMappingService.getInstance();
  const evidenceService = EvidenceCollectionService.getInstance();

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [prompt]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setValidationErrors([]);
    clearError();
    clearResponse();
    
    // Sanitize input
    const sanitized = sanitizeInput(prompt);
    
    // Validate prompt
    const validation = validatePrompt(sanitized);
    
    if (!validation.isValid) {
      const errors = validation.errors.map(err => err.message);
      setValidationErrors(errors);
      announceToScreenReader(errors.join('. '), 'assertive');
      return;
    }
    
    // Show warnings if any
    if (validation.warnings.length > 0) {
      console.warn('Validation warnings:', validation.warnings);
    }
    
    setIsSubmitting(true);
    
    try {
      // Start evidence collection
      const reviewId = generateUUID();
      evidenceService.startEvidenceCollection(reviewId, { input: sanitized });
      
      // Create review request
      const reviewRequest = {
        input: sanitized,
        context: {
          channel: 'ui',
          locale: 'en-US',
          timestamp: new Date().toISOString()
        },
        trace_id: reviewId
      };
      
      // Send request to safety API (using mock for now)
      // In a real implementation, this would call the actual API
      const reviewData = {
        id: reviewId,
        decision: sanitized.toLowerCase().includes('ignore') ? 'block' : 'allow', // Simple mock logic
        hazards: sanitized.toLowerCase().includes('ignore') ? [
          {
            id: 'H01',
            name: 'Prompt/Indirect Injection',
            severity: 'critical',
            owasp_llm: 'LLM01',
            un_principle: 'Human oversight & accountability',
            decision_code: 'BLOCK'
          }
        ] : [],
        reason_codes: sanitized.toLowerCase().includes('ignore') ? ['H01_PROMPT_INJECTION', 'TOOL_ABUSE'] : [],
        latency_ms: Math.floor(Math.random() * 200) + 100,
        created_at: new Date().toISOString()
      };
      
      // Generate compliance evidence
      const hazards = reviewData.hazards.map((h: Hazard) => h.id);
      const evidence = policyMappingService.generateComplianceEvidence(reviewId, hazards);
      
      // Complete evidence collection
      evidenceService.completeEvidenceCollection(
        reviewId,
        { 
          response: reviewData,
          hazards: hazards,
          decisionCode: reviewData.decision
        },
        hazards,
        reviewData.decision
      );
      
      // Add to cases list
      const newCase = {
        id: reviewId,
        decision: reviewData.decision,
        hazards: reviewData.hazards,
        prompt: sanitized,
        submittedTime: new Date().toISOString(),
        source: 'UI',
        model: 'AI Safety Agent',
        latency: reviewData.latency_ms
      };
      
      // Add the new case to the cases list
      onAddCase(newCase);
      
      // Clear the input
      setPrompt('');
      announceToScreenReader('Request submitted successfully', 'polite');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setValidationErrors([errorMessage]);
      announceToScreenReader(`Error: ${errorMessage}`, 'assertive');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    setPrompt('');
    setValidationErrors([]);
    clearError();
    clearResponse();
    textareaRef.current?.focus();
    announceToScreenReader('Input cleared', 'polite');
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  // Generate UUID with fallback for older browsers
  const generateUUID = (): string => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    
    // Fallback UUID generator
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  return (
    <div className="ai-agent-queue">
      <div className="ai-agent-panel">
        <div className="ai-agent-header">
          <h2 className="ai-agent-title">AI Safety Agent</h2>
          <StatusIndicator status={status} onRefresh={checkConnection} />
        </div>

        <form onSubmit={handleSubmit} className="ai-agent-form">
          <div className="form-group">
            <label htmlFor="prompt-input" className="form-label">
              Ask the AI Safety Agent
              <span className="form-label-required" aria-label="required">*</span>
            </label>
            <textarea
              ref={textareaRef}
              id="prompt-input"
              className={`form-textarea ${validationErrors.length > 0 ? 'form-textarea-error' : ''}`}
              value={prompt}
              onChange={handlePromptChange}
              placeholder="Type your question or request here..."
              rows={4}
              disabled={isSubmitting || !status?.isConnected}
              aria-describedby={validationErrors.length > 0 ? 'validation-errors' : undefined}
              aria-invalid={validationErrors.length > 0}
            />
            {validationErrors.length > 0 && (
              <div 
                id="validation-errors" 
                className="form-errors"
                role="alert"
                aria-live="assertive"
              >
                {validationErrors.map((err, idx) => (
                  <p key={idx} className="form-error">{err}</p>
                ))}
              </div>
            )}
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || !status?.isConnected || prompt.trim().length === 0}
              aria-label={isSubmitting ? 'Processing request' : 'Send request to AI agent'}
            >
              {isSubmitting ? (
                <>
                  <span className="btn-spinner" aria-hidden="true"></span>
                  Processing...
                </>
              ) : (
                'Send Request'
              )}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClear}
              disabled={isSubmitting || prompt.length === 0}
              aria-label="Clear input"
            >
              Clear
            </button>
          </div>
        </form>

        <div className="ai-agent-status">
          <div className="status-info">
            <span className="status-label">Connection:</span>
            <span className={`status-value ${status?.isConnected ? 'connected' : 'disconnected'}`}>
              {status?.isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <div className="status-info">
            <span className="status-label">Version:</span>
            <span className="status-value">{status?.version || 'Unknown'}</span>
          </div>
        </div>
      </div>

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
