// Mock AI Agent Service for testing without actual AI agent
import { 
  AIAgentRequest, 
  AIAgentResponse, 
  RiskLevel, 
  SafetyFlagType,
  AgentStatus,
  PerformanceMetrics
} from '../types';

class MockAgentService {
  private requestCount = 0;
  private latencies: number[] = [];
  private isConnected = true;

  // Simulate AI agent connection check
  async checkConnection(): Promise<AgentStatus> {
    // Simulate minimal network latency
    await this.simulateLatency(50, 100);
    
    return {
      isConnected: this.isConnected,
      isProcessing: false,
      lastHeartbeat: Date.now(),
      version: '1.0.0-mock',
      capabilities: ['text-analysis', 'safety-check', 'risk-assessment']
    };
  }

  // Simulate AI agent request processing
  async processRequest(request: AIAgentRequest): Promise<AIAgentResponse> {
    const startTime = performance.now();
    
    // Simulate processing latency (ensure it stays within guardrails)
    // Target: ≤500ms average, p95 ≤900ms
    const processingDelay = this.generateRealisticLatency();
    await this.simulateLatency(processingDelay);
    
    // Analyze request for safety concerns
    const safetyAnalysis = this.analyzeSafety(request.prompt);
    
    const endTime = performance.now();
    const processingTime = endTime - startTime;
    
    this.latencies.push(processingTime);
    this.requestCount++;
    
    return {
      id: `resp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      requestId: request.id,
      content: this.generateMockResponse(request.prompt, safetyAnalysis.riskLevel),
      confidence: safetyAnalysis.confidence,
      riskLevel: safetyAnalysis.riskLevel,
      safetyFlags: safetyAnalysis.flags,
      processingTime,
      timestamp: Date.now()
    };
  }

  // Get performance metrics
  getPerformanceMetrics(): PerformanceMetrics {
    const sortedLatencies = [...this.latencies].sort((a, b) => a - b);
    const p95Index = Math.floor(sortedLatencies.length * 0.95);
    const p95Latency = sortedLatencies[p95Index] || 0;
    const averageLatency = this.latencies.length > 0
      ? this.latencies.reduce((a, b) => a + b, 0) / this.latencies.length
      : 0;

    return {
      latency: this.latencies[this.latencies.length - 1] || 0,
      p95Latency,
      averageLatency,
      requestCount: this.requestCount,
      errorRate: 0,
      timestamp: Date.now()
    };
  }

  // Simulate realistic latency within guardrails
  private generateRealisticLatency(): number {
    // 80% of requests: 200-400ms (well within guardrails)
    // 15% of requests: 400-600ms (approaching average limit)
    // 5% of requests: 600-850ms (within p95 limit)
    const rand = Math.random();
    
    if (rand < 0.8) {
      return 200 + Math.random() * 200; // 200-400ms
    } else if (rand < 0.95) {
      return 400 + Math.random() * 200; // 400-600ms
    } else {
      return 600 + Math.random() * 250; // 600-850ms
    }
  }

  // Analyze prompt for safety concerns
  private analyzeSafety(prompt: string) {
    const flags = [];
    let riskLevel = RiskLevel.LOW;
    let confidence = 0.95;

    const lowerPrompt = prompt.toLowerCase();

    // Check for potentially harmful content
    const harmfulKeywords = ['hack', 'attack', 'exploit', 'malware', 'bypass'];
    if (harmfulKeywords.some(keyword => lowerPrompt.includes(keyword))) {
      flags.push({
        type: SafetyFlagType.HARMFUL_CONTENT,
        severity: 'warning' as const,
        message: 'Prompt contains potentially harmful keywords',
        details: 'The request may involve security-sensitive operations'
      });
      riskLevel = RiskLevel.MEDIUM;
      confidence = 0.75;
    }

    // Check for privacy-related content
    const privacyKeywords = ['password', 'credit card', 'ssn', 'personal data'];
    if (privacyKeywords.some(keyword => lowerPrompt.includes(keyword))) {
      flags.push({
        type: SafetyFlagType.PRIVACY_CONCERN,
        severity: 'error' as const,
        message: 'Prompt may contain privacy-sensitive information',
        details: 'Handling of personal data requires extra caution'
      });
      riskLevel = RiskLevel.HIGH;
      confidence = 0.70;
    }

    // Check for bias-related language
    const biasIndicators = ['always', 'never', 'all', 'none', 'everyone'];
    const biasCount = biasIndicators.filter(word => lowerPrompt.includes(word)).length;
    if (biasCount >= 2) {
      flags.push({
        type: SafetyFlagType.BIAS_DETECTION,
        severity: 'info' as const,
        message: 'Prompt contains language that may indicate bias',
        details: 'Absolute statements detected'
      });
    }

    return { flags, riskLevel, confidence };
  }

  // Generate mock response based on risk level
  private generateMockResponse(prompt: string, riskLevel: RiskLevel): string {
    switch (riskLevel) {
      case RiskLevel.HIGH:
      case RiskLevel.CRITICAL:
        return 'I cannot fully process this request due to safety concerns. Please review the safety flags and modify your request accordingly.';
      
      case RiskLevel.MEDIUM:
        return `I can provide a response to "${prompt.substring(0, 50)}..." but please note the safety warnings. The response should be reviewed carefully before use.`;
      
      default:
        return `Mock response to: "${prompt.substring(0, 50)}...". This is a simulated response for testing purposes. The actual AI agent will provide real analysis when connected.`;
    }
  }

  // Helper to simulate latency
  private simulateLatency(minMs: number, maxMs?: number): Promise<void> {
    const delay = maxMs ? minMs + Math.random() * (maxMs - minMs) : minMs;
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  // Reset metrics (useful for testing)
  resetMetrics(): void {
    this.requestCount = 0;
    this.latencies = [];
  }

  // Simulate connection toggle (for testing)
  setConnectionStatus(connected: boolean): void {
    this.isConnected = connected;
  }
}

export const mockAgentService = new MockAgentService();

