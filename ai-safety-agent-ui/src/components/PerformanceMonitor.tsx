// Performance Monitor Component
import React from 'react';
import { PerformanceMetrics } from '../types';
import './PerformanceMonitor.css';

interface PerformanceMonitorProps {
  metrics: PerformanceMetrics | null;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ metrics }) => {
  if (!metrics || metrics.requestCount === 0) {
    return null;
  }

  const formatLatency = (ms: number) => `${ms.toFixed(0)}ms`;
  
  // Check guardrails
  const avgExceedsGuardrail = metrics.averageLatency > 500;
  const p95ExceedsGuardrail = metrics.p95Latency > 900;
  
  const getLatencyStatus = (value: number, threshold: number) => {
    if (value <= threshold * 0.8) return 'good';
    if (value <= threshold) return 'warning';
    return 'error';
  };

  const avgStatus = getLatencyStatus(metrics.averageLatency, 500);
  const p95Status = getLatencyStatus(metrics.p95Latency, 900);

  return (
    <div 
      className="performance-monitor"
      role="region"
      aria-label="Performance metrics"
    >
      <h3 className="performance-title">Performance Metrics</h3>
      <div className="performance-grid">
        <div className="performance-metric">
          <span className="performance-label">Requests</span>
          <span className="performance-value">{metrics.requestCount}</span>
        </div>
        
        <div className="performance-metric">
          <span className="performance-label">Last Latency</span>
          <span className="performance-value">{formatLatency(metrics.latency)}</span>
        </div>
        
        <div 
          className={`performance-metric performance-metric-${avgStatus}`}
          aria-label={`Average latency: ${formatLatency(metrics.averageLatency)}${avgExceedsGuardrail ? ' - exceeds guardrail' : ''}`}
        >
          <span className="performance-label">
            Avg Latency
            {avgExceedsGuardrail && (
              <span className="performance-warning" aria-label="Exceeds 500ms guardrail">
                ⚠️
              </span>
            )}
          </span>
          <span className="performance-value">
            {formatLatency(metrics.averageLatency)}
            <span className="performance-target">/500ms</span>
          </span>
        </div>
        
        <div 
          className={`performance-metric performance-metric-${p95Status}`}
          aria-label={`P95 latency: ${formatLatency(metrics.p95Latency)}${p95ExceedsGuardrail ? ' - exceeds guardrail' : ''}`}
        >
          <span className="performance-label">
            P95 Latency
            {p95ExceedsGuardrail && (
              <span className="performance-warning" aria-label="Exceeds 900ms guardrail">
                ⚠️
              </span>
            )}
          </span>
          <span className="performance-value">
            {formatLatency(metrics.p95Latency)}
            <span className="performance-target">/900ms</span>
          </span>
        </div>
      </div>
      
      {(avgExceedsGuardrail || p95ExceedsGuardrail) && (
        <div className="performance-alert" role="alert">
          <strong>⚠️ Performance Warning:</strong> 
          {avgExceedsGuardrail && ' Average latency exceeds 500ms guardrail.'}
          {p95ExceedsGuardrail && ' P95 latency exceeds 900ms guardrail.'}
        </div>
      )}
    </div>
  );
};

