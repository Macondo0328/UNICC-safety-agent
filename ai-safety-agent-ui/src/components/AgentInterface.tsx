// Main Agent Interface Component
import React, { useState, useRef, useEffect } from 'react';
import { useAgentService } from '../hooks/useAgentService';
import { validatePrompt, sanitizeInput } from '../utils/validation';
import { announceToScreenReader } from '../utils/accessibility';
import { StatusIndicator } from './StatusIndicator';
import { SafetyFlagDisplay } from './SafetyFlagDisplay';
import { RiskLevelBadge } from './RiskLevelBadge';
import { PerformanceMonitor } from './PerformanceMonitor';
import { HazardDisplay } from './HazardDisplay';
import { ComplianceEvidenceDisplay } from './ComplianceEvidenceDisplay';
import { agentService } from '../services/agentService';
import { EvidenceCollectionService } from '../services/evidenceCollection';
import { PolicyMappingService } from '../services/policyMapping';
import { ReviewRequest, ReviewResponse, ComplianceEvidence } from '../types';
import './AgentInterface.css';

export const AgentInterface: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [reviewResponse, setReviewResponse] = useState<ReviewResponse | null>(null);
  const [complianceEvidence, setComplianceEvidence] = useState<ComplianceEvidence | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const evidenceService = EvidenceCollectionService.getInstance();
  const policyMappingService = PolicyMappingService.getInstance();
  
  const {
    status,
    metrics,
    checkConnection,
    clearError,
    clearResponse
  } = useAgentService();

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [prompt]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors and responses
    setValidationErrors([]);
    setError(null);
    setReviewResponse(null);
    setComplianceEvidence(null);
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
    
    setIsLoading(true);
    
    try {
      // Start evidence collection
      const reviewId = generateUUID();
      evidenceService.startEvidenceCollection(reviewId, { input: sanitized });
      
      // Create review request
      const reviewRequest: ReviewRequest = {
        input: sanitized,
        context: {
          channel: 'ui',
          locale: 'en-US',
          timestamp: new Date().toISOString()
        },
        trace_id: reviewId
      };
      
      // Send request to safety API
      const response = await agentService.createReview(reviewRequest);
      setReviewResponse(response);
      
      // Generate compliance evidence
      const hazards = response.hazards.map(h => h.id);
      const evidence = policyMappingService.generateComplianceEvidence(reviewId, hazards);
      setComplianceEvidence(evidence);
      
      // Complete evidence collection
      evidenceService.completeEvidenceCollection(
        reviewId,
        { 
          response: response,
          hazards: hazards,
          decisionCode: response.decision
        },
        hazards,
        response.decision
      );
      
      announceToScreenReader('Safety review completed', 'polite');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      announceToScreenReader(`Error: ${errorMessage}`, 'assertive');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setPrompt('');
    setValidationErrors([]);
    setError(null);
    setReviewResponse(null);
    setComplianceEvidence(null);
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
    if (error) {
      setError(null);
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

  const handleExportEvidence = () => {
    if (reviewResponse && complianceEvidence) {
      const evidenceData = {
        review: reviewResponse,
        compliance: complianceEvidence,
        timestamp: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(evidenceData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `safety-review-${reviewResponse.id}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      announceToScreenReader('Evidence exported', 'polite');
    }
  };

  return (
    <div className="agent-interface">
      <header className="agent-header">
        <h1 className="agent-title">AI Safety Agent</h1>
        <p className="agent-subtitle">UNICC Sandbox Integration</p>
        <StatusIndicator status={status} onRefresh={checkConnection} />
      </header>

      <main className="agent-main">
        <form onSubmit={handleSubmit} className="agent-form">
          <div className="form-group">
            <label htmlFor="prompt-input" className="form-label">
              Enter your prompt
              <span className="form-label-required" aria-label="required">*</span>
            </label>
            <textarea
              ref={textareaRef}
              id="prompt-input"
              className={`form-textarea ${validationErrors.length > 0 ? 'form-textarea-error' : ''}`}
              value={prompt}
              onChange={handlePromptChange}
              placeholder="Type your message here..."
              rows={4}
              disabled={isLoading || !status?.isConnected}
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
              disabled={isLoading || !status?.isConnected || prompt.trim().length === 0}
              aria-label={isLoading ? 'Processing request' : 'Send request to AI agent'}
            >
              {isLoading ? (
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
              disabled={isLoading || prompt.length === 0}
              aria-label="Clear input and response"
            >
              Clear
            </button>
          </div>
        </form>

        {error && (
          <div className="alert alert-error" role="alert" aria-live="assertive">
            <strong>Error:</strong> {error}
          </div>
        )}

        {reviewResponse && (
          <section className="response-section" aria-labelledby="response-title">
            <h2 id="response-title" className="response-title">Safety Review Results</h2>
            
            <div className="response-header">
              <div className="response-meta">
                <span className="review-id">Review ID: {reviewResponse.id}</span>
                <span className="response-time">
                  Processed in {reviewResponse.latency_ms}ms
                </span>
                <span className="response-timestamp">
                  {new Date(reviewResponse.created_at).toLocaleString()}
                </span>
              </div>
            </div>

            <HazardDisplay
              hazards={reviewResponse.hazards}
              reasonCodes={reviewResponse.reason_codes}
              decisionCode={reviewResponse.decision.toUpperCase() as any}
              onViewEvidence={handleExportEvidence}
            />

            {complianceEvidence && (
              <ComplianceEvidenceDisplay
                evidence={complianceEvidence}
                onExport={handleExportEvidence}
              />
            )}
          </section>
        )}

        <PerformanceMonitor metrics={metrics} />
      </main>
    </div>
  );
};

