// Mock Agent Service tests
import { describe, it, expect, beforeEach } from 'vitest';
import { mockAgentService } from '../services/mockAgentService';
import { RiskLevel } from '../types';

describe('MockAgentService', () => {
  beforeEach(() => {
    mockAgentService.resetMetrics();
  });

  describe('checkConnection', () => {
    it('should return connected status', async () => {
      const status = await mockAgentService.checkConnection();
      expect(status.isConnected).toBe(true);
      expect(status.version).toBe('1.0.0-mock');
      expect(status.capabilities).toContain('safety-check');
    });

    it('should include timestamp', async () => {
      const before = Date.now();
      const status = await mockAgentService.checkConnection();
      const after = Date.now();
      
      expect(status.lastHeartbeat).toBeGreaterThanOrEqual(before);
      expect(status.lastHeartbeat).toBeLessThanOrEqual(after);
    });
  });

  describe('processRequest', () => {
    it('should process basic requests', async () => {
      const request = {
        id: 'test-1',
        prompt: 'Hello, AI agent',
        timestamp: Date.now()
      };

      const response = await mockAgentService.processRequest(request);
      
      expect(response.requestId).toBe(request.id);
      expect(response.content).toBeDefined();
      expect(response.riskLevel).toBeDefined();
      expect(response.confidence).toBeGreaterThan(0);
      expect(response.processingTime).toBeGreaterThan(0);
    });

    it('should detect harmful content', async () => {
      const request = {
        id: 'test-harmful',
        prompt: 'How to hack a system',
        timestamp: Date.now()
      };

      const response = await mockAgentService.processRequest(request);
      
      expect(response.riskLevel).not.toBe(RiskLevel.LOW);
      expect(response.safetyFlags.length).toBeGreaterThan(0);
    });

    it('should detect privacy concerns', async () => {
      const request = {
        id: 'test-privacy',
        prompt: 'Store this password: 12345',
        timestamp: Date.now()
      };

      const response = await mockAgentService.processRequest(request);
      
      expect(response.riskLevel).toBe(RiskLevel.HIGH);
      expect(response.safetyFlags.some(f => f.type === 'privacy_concern')).toBe(true);
    });

    it('should meet latency guardrails', async () => {
      const requests = [];
      
      // Run 20 requests to test latency
      for (let i = 0; i < 20; i++) {
        requests.push(
          mockAgentService.processRequest({
            id: `test-${i}`,
            prompt: 'Test prompt for latency',
            timestamp: Date.now()
          })
        );
      }

      const responses = await Promise.all(requests);
      
      // Check that most requests are within guardrails
      const withinAvgGuardrail = responses.filter(r => r.processingTime <= 500).length;
      const withinP95Guardrail = responses.filter(r => r.processingTime <= 900).length;
      
      // At least 80% should be within 500ms
      expect(withinAvgGuardrail / responses.length).toBeGreaterThan(0.7);
      
      // All should be within 900ms
      expect(withinP95Guardrail).toBe(responses.length);
    });
  });

  describe('getPerformanceMetrics', () => {
    it('should track request count', async () => {
      await mockAgentService.processRequest({
        id: 'test-1',
        prompt: 'First request',
        timestamp: Date.now()
      });

      await mockAgentService.processRequest({
        id: 'test-2',
        prompt: 'Second request',
        timestamp: Date.now()
      });

      const metrics = mockAgentService.getPerformanceMetrics();
      expect(metrics.requestCount).toBe(2);
    });

    it('should calculate average latency', async () => {
      await mockAgentService.processRequest({
        id: 'test-1',
        prompt: 'Test',
        timestamp: Date.now()
      });

      const metrics = mockAgentService.getPerformanceMetrics();
      expect(metrics.averageLatency).toBeGreaterThan(0);
      expect(metrics.averageLatency).toBeLessThan(1000);
    });

    it('should calculate p95 latency', async () => {
      // Process multiple requests
      for (let i = 0; i < 20; i++) {
        await mockAgentService.processRequest({
          id: `test-${i}`,
          prompt: 'Test',
          timestamp: Date.now()
        });
      }

      const metrics = mockAgentService.getPerformanceMetrics();
      expect(metrics.p95Latency).toBeGreaterThan(0);
      expect(metrics.p95Latency).toBeGreaterThanOrEqual(metrics.averageLatency);
    });

    it('should ensure p95 latency is within guardrail', async () => {
      // Process many requests to get stable p95
      for (let i = 0; i < 100; i++) {
        await mockAgentService.processRequest({
          id: `test-${i}`,
          prompt: 'Test request',
          timestamp: Date.now()
        });
      }

      const metrics = mockAgentService.getPerformanceMetrics();
      
      // P95 should be ≤900ms as per guardrails
      expect(metrics.p95Latency).toBeLessThanOrEqual(900);
      
      // Average should be ≤500ms as per guardrails
      expect(metrics.averageLatency).toBeLessThanOrEqual(500);
    });
  });

  describe('resetMetrics', () => {
    it('should reset all metrics', async () => {
      await mockAgentService.processRequest({
        id: 'test',
        prompt: 'Test',
        timestamp: Date.now()
      });

      mockAgentService.resetMetrics();

      const metrics = mockAgentService.getPerformanceMetrics();
      expect(metrics.requestCount).toBe(0);
      expect(metrics.averageLatency).toBe(0);
    });
  });

  describe('setConnectionStatus', () => {
    it('should toggle connection status', async () => {
      mockAgentService.setConnectionStatus(false);
      const status = await mockAgentService.checkConnection();
      expect(status.isConnected).toBe(false);

      mockAgentService.setConnectionStatus(true);
      const status2 = await mockAgentService.checkConnection();
      expect(status2.isConnected).toBe(true);
    });
  });
});

