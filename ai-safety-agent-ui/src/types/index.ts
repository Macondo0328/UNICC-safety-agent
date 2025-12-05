// Core types for AI Safety Agent UI Integration - Updated for UNICC Safety API

// API Request/Response types aligned with OpenAPI spec
export interface ReviewRequest {
  input: string | object;
  context?: Record<string, unknown>;
  trace_id?: string;
}

export interface ReviewResponse {
  id: string;
  decision: DecisionType;
  hazards: Hazard[];
  reason_codes: string[];
  latency_ms: number;
  created_at: string;
}

export type DecisionType = 'allow' | 'block' | 'review' | 'revise';

export interface Hazard {
  id: string; // H01-H10
  name: string;
  severity: SeverityLevel;
  owasp_llm: string; // LLM01, LLM05, etc.
  un_principle?: string;
  decision_code: DecisionCode;
}

export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';

export type DecisionCode = 'BLOCK' | 'REVIEW' | 'SANITIZE' | 'DE-IDENTIFY+REVIEW' | 'ALLOW';

// Evidence and logging types
export interface EvidenceBundle {
  review_id: string;
  inputs: Record<string, unknown>;
  outputs: Record<string, unknown>;
  logs: LogEntry[];
  attachments?: Attachment[];
}

export interface LogEntry {
  ts: string;
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
  message: string;
  fields?: Record<string, unknown>;
}

export interface Attachment {
  id: string;
  filename: string;
  contentType: string;
  sha256?: string;
}

// Legacy types for backward compatibility
export interface AIAgentRequest {
  id: string;
  prompt: string;
  context?: Record<string, unknown>;
  timestamp: number;
  userId?: string;
  sessionId?: string;
}

export interface AIAgentResponse {
  id: string;
  requestId: string;
  content: string;
  confidence: number;
  riskLevel: RiskLevel;
  safetyFlags: SafetyFlag[];
  processingTime: number;
  timestamp: number;
}

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface SafetyFlag {
  type: SafetyFlagType;
  severity: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  details?: string;
}

export enum SafetyFlagType {
  CONTENT_POLICY = 'content_policy',
  BIAS_DETECTION = 'bias_detection',
  HARMFUL_CONTENT = 'harmful_content',
  PRIVACY_CONCERN = 'privacy_concern',
  MISINFORMATION = 'misinformation',
  ETHICAL_CONCERN = 'ethical_concern'
}

export interface PerformanceMetrics {
  latency: number;
  p95Latency: number;
  averageLatency: number;
  requestCount: number;
  errorRate: number;
  timestamp: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: string[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface AgentStatus {
  isConnected: boolean;
  isProcessing: boolean;
  lastHeartbeat: number;
  version: string;
  capabilities: string[];
}

export interface UIConfig {
  maxRetries: number;
  timeoutMs: number;
  maxLatencyMs: number;
  enableDebugMode: boolean;
  accessibilityMode: 'standard' | 'high-contrast' | 'screen-reader';
}

