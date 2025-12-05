// AI Agent Service - Interface for connecting to actual AI agent
import { 
  AIAgentRequest, 
  AIAgentResponse, 
  AgentStatus,
  PerformanceMetrics,
  ReviewRequest,
  ReviewResponse,
  Hazard,
  EvidenceBundle
} from '../types';
import { mockAgentService } from './mockAgentService';
import { HazardDetector } from './hazardDetection';

export interface IAgentService {
  checkConnection(): Promise<AgentStatus>;
  processRequest(request: AIAgentRequest): Promise<AIAgentResponse>;
  getPerformanceMetrics(): PerformanceMetrics;
  // New UNICC Safety API methods
  createReview(request: ReviewRequest): Promise<ReviewResponse>;
  getReview(id: string): Promise<ReviewResponse>;
  listHazards(includeDecisions?: boolean): Promise<Hazard[]>;
  getEvidence(reviewId: string): Promise<EvidenceBundle>;
}

class AgentService implements IAgentService {
  private apiEndpoint: string;
  private useMock: boolean;
  private timeout: number = 5000;
  private accessToken: string | null = null;
  private hazardDetector: HazardDetector;

  constructor() {
    // Check environment variables for API endpoint
    this.apiEndpoint = import.meta.env.VITE_AI_AGENT_API_URL || '';
    this.useMock = !this.apiEndpoint || import.meta.env.VITE_USE_MOCK === 'true';
    this.accessToken = import.meta.env.VITE_ACCESS_TOKEN || null;
    this.hazardDetector = HazardDetector.getInstance();
    
    if (this.useMock) {
      console.info('🔧 Using mock AI agent service for testing');
    } else {
      console.info(`🔌 Connecting to AI agent at: ${this.apiEndpoint}`);
    }
  }

  // Check if AI agent is connected and responsive
  async checkConnection(): Promise<AgentStatus> {
    if (this.useMock) {
      return mockAgentService.checkConnection();
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.apiEndpoint}/health`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Health check failed: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        isConnected: true,
        isProcessing: false,
        lastHeartbeat: Date.now(),
        version: data.version || 'unknown',
        capabilities: data.capabilities || []
      };
    } catch (error) {
      console.error('Connection check failed:', error);
      return {
        isConnected: false,
        isProcessing: false,
        lastHeartbeat: Date.now(),
        version: 'unknown',
        capabilities: []
      };
    }
  }

  // Process request through AI agent
  async processRequest(request: AIAgentRequest): Promise<AIAgentResponse> {
    if (this.useMock) {
      return mockAgentService.processRequest(request);
    }

    try {
      const startTime = performance.now();
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.apiEndpoint}/process`, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Request processing failed: ${response.statusText}`);
      }

      const data = await response.json();
      const endTime = performance.now();
      
      return {
        ...data,
        processingTime: endTime - startTime
      };
    } catch (error) {
      console.error('Request processing failed:', error);
      throw new Error(`Failed to process request: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get performance metrics
  getPerformanceMetrics(): PerformanceMetrics {
    if (this.useMock) {
      return mockAgentService.getPerformanceMetrics();
    }

    // When connected to real agent, implement metrics collection
    return {
      latency: 0,
      p95Latency: 0,
      averageLatency: 0,
      requestCount: 0,
      errorRate: 0,
      timestamp: Date.now()
    };
  }

  // Switch between mock and real service
  setUseMock(useMock: boolean): void {
    this.useMock = useMock;
    console.info(useMock ? '🔧 Switched to mock service' : '🔌 Switched to real service');
  }

  // Set API endpoint (useful for dynamic configuration)
  setApiEndpoint(endpoint: string): void {
    this.apiEndpoint = endpoint;
    this.useMock = false;
    console.info(`🔌 API endpoint updated: ${endpoint}`);
  }

  // Set access token for authentication
  setAccessToken(token: string): void {
    this.accessToken = token;
    console.info('🔑 Access token updated');
  }

  // Generate UUID with fallback for older browsers
  private generateUUID(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    
    // Fallback UUID generator
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // Get authentication headers
  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }
    
    return headers;
  }

  // Create a safety review
  async createReview(request: ReviewRequest): Promise<ReviewResponse> {
    if (this.useMock) {
      // Use local hazard detection for mock mode
      const detectionResult = this.hazardDetector.detectHazards(
        typeof request.input === 'string' ? request.input : JSON.stringify(request.input)
      );
      
      return {
        id: this.generateUUID(),
        decision: detectionResult.decisionCode.toLowerCase() as any,
        hazards: detectionResult.detectedHazards,
        reason_codes: detectionResult.reasonCodes,
        latency_ms: Math.floor(Math.random() * 500) + 100,
        created_at: new Date().toISOString()
      };
    }

    try {
      const startTime = performance.now();
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.apiEndpoint}/v1/review`, {
        method: 'POST',
        signal: controller.signal,
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request)
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After');
          throw new Error(`Rate limited. Retry after ${retryAfter} seconds`);
        }
        throw new Error(`Review creation failed: ${response.statusText}`);
      }

      const data = await response.json();
      const endTime = performance.now();
      
      return {
        ...data,
        latency_ms: Math.floor(endTime - startTime)
      };
    } catch (error) {
      console.error('Review creation failed:', error);
      throw new Error(`Failed to create review: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get a review by ID
  async getReview(id: string): Promise<ReviewResponse> {
    if (this.useMock) {
      // Return mock review data
      return {
        id,
        decision: 'allow',
        hazards: [],
        reason_codes: [],
        latency_ms: 150,
        created_at: new Date().toISOString()
      };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.apiEndpoint}/v1/review/${id}`, {
        method: 'GET',
        signal: controller.signal,
        headers: this.getAuthHeaders()
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Failed to get review: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get review:', error);
      throw new Error(`Failed to get review: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // List all hazards
  async listHazards(includeDecisions: boolean = true): Promise<Hazard[]> {
    if (this.useMock) {
      return this.hazardDetector.getAllHazards();
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const url = new URL(`${this.apiEndpoint}/v1/policy/hazards`);
      url.searchParams.set('include_decisions', includeDecisions.toString());

      const response = await fetch(url.toString(), {
        method: 'GET',
        signal: controller.signal,
        headers: this.getAuthHeaders()
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Failed to list hazards: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to list hazards:', error);
      throw new Error(`Failed to list hazards: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get evidence bundle for a review
  async getEvidence(reviewId: string): Promise<EvidenceBundle> {
    if (this.useMock) {
      // Return mock evidence data
      return {
        review_id: reviewId,
        inputs: {},
        outputs: {},
        logs: [
          {
            ts: new Date().toISOString(),
            level: 'INFO',
            message: 'Mock evidence bundle',
            fields: { review_id: reviewId }
          }
        ],
        attachments: []
      };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.apiEndpoint}/v1/evidence/${reviewId}`, {
        method: 'GET',
        signal: controller.signal,
        headers: this.getAuthHeaders()
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Failed to get evidence: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get evidence:', error);
      throw new Error(`Failed to get evidence: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const agentService = new AgentService();

