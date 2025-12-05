// Custom hook for managing AI agent service interactions
import { useState, useCallback, useEffect } from 'react';
import { agentService } from '../services/agentService';
import { 
  AIAgentRequest, 
  AIAgentResponse, 
  AgentStatus,
  PerformanceMetrics
} from '../types';

interface UseAgentServiceReturn {
  status: AgentStatus | null;
  isLoading: boolean;
  error: string | null;
  response: AIAgentResponse | null;
  metrics: PerformanceMetrics | null;
  sendRequest: (prompt: string, context?: Record<string, unknown>) => Promise<void>;
  checkConnection: () => Promise<void>;
  clearError: () => void;
  clearResponse: () => void;
}

export function useAgentService(): UseAgentServiceReturn {
  const [status, setStatus] = useState<AgentStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<AIAgentResponse | null>(null);
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);

  // Check connection status
  const checkConnection = useCallback(async () => {
    try {
      setError(null);
      const connectionStatus = await agentService.checkConnection();
      setStatus(connectionStatus);
      
      // Update metrics
      const currentMetrics = agentService.getPerformanceMetrics();
      setMetrics(currentMetrics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection check failed');
      setStatus({
        isConnected: false,
        isProcessing: false,
        lastHeartbeat: Date.now(),
        version: 'unknown',
        capabilities: []
      });
    }
  }, []);

  // Send request to AI agent
  const sendRequest = useCallback(async (
    prompt: string, 
    context?: Record<string, unknown>
  ) => {
    if (!prompt.trim()) {
      setError('Prompt cannot be empty');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      const request: AIAgentRequest = {
        id: `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        prompt: prompt.trim(),
        context,
        timestamp: Date.now(),
        sessionId: sessionStorage.getItem('sessionId') || undefined
      };

      const result = await agentService.processRequest(request);
      setResponse(result);

      // Check if processing time exceeds guardrails
      if (result.processingTime > 500) {
        console.warn(`⚠️ Processing time (${result.processingTime.toFixed(2)}ms) exceeded average guardrail (500ms)`);
      }

      // Update metrics
      const currentMetrics = agentService.getPerformanceMetrics();
      setMetrics(currentMetrics);

      // Warn if p95 latency exceeds guardrail
      if (currentMetrics.p95Latency > 900) {
        console.warn(`⚠️ P95 latency (${currentMetrics.p95Latency.toFixed(2)}ms) exceeded guardrail (900ms)`);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request processing failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Clear error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Clear response state
  const clearResponse = useCallback(() => {
    setResponse(null);
  }, []);

  // Check connection on mount
  useEffect(() => {
    checkConnection();
    
    // Set up periodic connection checks
    const interval = setInterval(checkConnection, 30000); // Every 30 seconds
    
    return () => clearInterval(interval);
  }, [checkConnection]);

  return {
    status,
    isLoading,
    error,
    response,
    metrics,
    sendRequest,
    checkConnection,
    clearError,
    clearResponse
  };
}

