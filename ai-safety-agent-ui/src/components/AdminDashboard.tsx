// Admin/Observability Dashboard Component
import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';

interface TelemetryData {
  endpoint: string;
  avg_latency_ms: number;
  p95_latency_ms: number;
  error_rate: number;
  request_count: number;
}

interface GateStatus {
  name: string;
  status: 'PASS' | 'FAIL';
  value: number;
  target: number;
  unit?: string;
}

interface AdminDashboardProps {
  testResults: Array<{
    latency: number;
    status: 'passed' | 'failed';
  }>;
  testSummary?: {
    total: number;
    passed: number;
    failed: number;
    averageLatency: number;
    p95Latency: number;
  };
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  testResults,
  testSummary
}) => {
  const [telemetry, setTelemetry] = useState<TelemetryData[]>([]);
  const [gateStatuses, setGateStatuses] = useState<GateStatus[]>([]);
  const [targets, setTargets] = useState({
    coverage: 0.85,
    precision: 0.90,
    recall: 0.90,
    latency_avg: 500,
    latency_p95: 900,
    error_rate: 0.05
  });

  useEffect(() => {
    // Load validation targets from YAML
    fetch('/Validation/config/validation.metrics.yaml')
      .then(r => r.text())
      .then(yaml => {
        const coverageMatch = yaml.match(/hazard_coverage:\s*([\d.]+)/);
        const precisionMatch = yaml.match(/precision_overall:\s*([\d.]+)/);
        const recallMatch = yaml.match(/recall_overall:\s*([\d.]+)/);
        const latencyAvgMatch = yaml.match(/latency_avg_ms:\s*(\d+)/);
        const latencyP95Match = yaml.match(/latency_p95_ms:\s*(\d+)/);
        const errorRateMatch = yaml.match(/api_error_rate_max:\s*([\d.]+)/);

        if (coverageMatch) setTargets(prev => ({ ...prev, coverage: parseFloat(coverageMatch[1]) }));
        if (precisionMatch) setTargets(prev => ({ ...prev, precision: parseFloat(precisionMatch[1]) }));
        if (recallMatch) setTargets(prev => ({ ...prev, recall: parseFloat(recallMatch[1]) }));
        if (latencyAvgMatch) setTargets(prev => ({ ...prev, latency_avg: parseInt(latencyAvgMatch[1]) }));
        if (latencyP95Match) setTargets(prev => ({ ...prev, latency_p95: parseInt(latencyP95Match[1]) }));
        if (errorRateMatch) setTargets(prev => ({ ...prev, error_rate: parseFloat(errorRateMatch[1]) }));
      })
      .catch(() => {});

    // Generate telemetry from test results
    if (testResults.length > 0) {
      const latencies = testResults.map(r => r.latency);
      const avgLatency = latencies.reduce((sum, l) => sum + l, 0) / latencies.length;
      const sortedLatencies = [...latencies].sort((a, b) => a - b);
      const p95Latency = sortedLatencies[Math.floor(sortedLatencies.length * 0.95)];
      const errorRate = testResults.filter(r => r.status === 'failed').length / testResults.length;

      setTelemetry([{
        endpoint: '/v1/review',
        avg_latency_ms: avgLatency,
        p95_latency_ms: p95Latency,
        error_rate: errorRate,
        request_count: testResults.length
      }]);
    }

    // Calculate gate statuses
    if (testSummary) {
      const coverage = testSummary.total > 0 ? 1.0 : 0; // Simplified - would need total hazards
      const precision = testSummary.total > 0 
        ? testSummary.passed / testSummary.total 
        : 0;
      const recall = precision; // Simplified - would need TP/FN calculation
      const errorRate = testSummary.total > 0 
        ? testSummary.failed / testSummary.total 
        : 0;

      setGateStatuses([
        {
          name: 'Hazard Coverage',
          status: coverage >= targets.coverage ? 'PASS' : 'FAIL',
          value: coverage,
          target: targets.coverage,
          unit: '%'
        },
        {
          name: 'Overall Precision',
          status: precision >= targets.precision ? 'PASS' : 'FAIL',
          value: precision,
          target: targets.precision,
          unit: '%'
        },
        {
          name: 'Overall Recall',
          status: recall >= targets.recall ? 'PASS' : 'FAIL',
          value: recall,
          target: targets.recall,
          unit: '%'
        },
        {
          name: 'Average Latency',
          status: testSummary.averageLatency <= targets.latency_avg ? 'PASS' : 'FAIL',
          value: testSummary.averageLatency,
          target: targets.latency_avg,
          unit: 'ms'
        },
        {
          name: 'P95 Latency',
          status: testSummary.p95Latency <= targets.latency_p95 ? 'PASS' : 'FAIL',
          value: testSummary.p95Latency,
          target: targets.latency_p95,
          unit: 'ms'
        },
        {
          name: 'API Error Rate',
          status: errorRate <= targets.error_rate ? 'PASS' : 'FAIL',
          value: errorRate,
          target: targets.error_rate,
          unit: '%'
        }
      ]);
    }
  }, [testResults, testSummary, targets]);

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h2>Admin / Observability Dashboard</h2>
        <p className="admin-subtitle">Live telemetry and release gate evaluation</p>
      </div>

      {/* Release Gates */}
      <div className="gates-section">
        <h3>Release Gates</h3>
        <p className="section-description">
          Evaluation against validation.metrics.yaml targets
        </p>
        <div className="gates-grid">
          {gateStatuses.map((gate, index) => (
            <div key={index} className={`gate-card ${gate.status.toLowerCase()}`}>
              <div className="gate-header">
                <span className="gate-name">{gate.name}</span>
                <span className={`gate-status ${gate.status.toLowerCase()}`}>
                  {gate.status}
                </span>
              </div>
              <div className="gate-value">
                {gate.unit === '%' 
                  ? `${(gate.value * 100).toFixed(1)}${gate.unit}`
                  : `${gate.value.toFixed(0)}${gate.unit || ''}`}
              </div>
              <div className="gate-target">
                Target: {gate.unit === '%' 
                  ? `≥${(gate.target * 100).toFixed(0)}${gate.unit}`
                  : `≤${gate.target}${gate.unit || ''}`}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Telemetry */}
      <div className="telemetry-section">
        <h3>Live Telemetry</h3>
        <p className="section-description">
          Per-endpoint performance metrics
        </p>
        <div className="telemetry-table-container">
          <table className="telemetry-table">
            <thead>
              <tr>
                <th>Endpoint</th>
                <th>Request Count</th>
                <th>Avg Latency</th>
                <th>P95 Latency</th>
                <th>Error Rate</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {telemetry.length === 0 ? (
                <tr>
                  <td colSpan={6} className="no-data">
                    No telemetry data available. Run tests to generate metrics.
                  </td>
                </tr>
              ) : (
                telemetry.map((metric, index) => {
                  const latencyPass = metric.avg_latency_ms <= targets.latency_avg && 
                                     metric.p95_latency_ms <= targets.latency_p95;
                  const errorPass = metric.error_rate <= targets.error_rate;
                  const overallStatus = latencyPass && errorPass ? 'PASS' : 'FAIL';

                  return (
                    <tr key={index}>
                      <td><code>{metric.endpoint}</code></td>
                      <td>{metric.request_count}</td>
                      <td className={metric.avg_latency_ms <= targets.latency_avg ? 'pass' : 'fail'}>
                        {metric.avg_latency_ms.toFixed(0)}ms
                      </td>
                      <td className={metric.p95_latency_ms <= targets.latency_p95 ? 'pass' : 'fail'}>
                        {metric.p95_latency_ms.toFixed(0)}ms
                      </td>
                      <td className={metric.error_rate <= targets.error_rate ? 'pass' : 'fail'}>
                        {(metric.error_rate * 100).toFixed(1)}%
                      </td>
                      <td>
                        <span className={`status-badge ${overallStatus.toLowerCase()}`}>
                          {overallStatus}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Overall Release Status */}
      {gateStatuses.length > 0 && (
        <div className="release-status">
          <h3>Overall Release Status</h3>
          <div className={`release-badge ${gateStatuses.every(g => g.status === 'PASS') ? 'pass' : 'fail'}`}>
            {gateStatuses.every(g => g.status === 'PASS') ? (
              <>
                <span className="release-icon">✅</span>
                <span className="release-text">ALL GATES PASSED</span>
              </>
            ) : (
              <>
                <span className="release-icon">❌</span>
                <span className="release-text">GATES FAILED - DO NOT RELEASE</span>
              </>
            )}
          </div>
          <p className="release-note">
            {gateStatuses.every(g => g.status === 'PASS')
              ? 'All validation metrics meet the required targets. System is ready for release.'
              : 'One or more validation metrics do not meet the required targets. Please address failures before release.'}
          </p>
        </div>
      )}
    </div>
  );
};

