// Coverage Dashboard Component
import React, { useState, useEffect } from 'react';
import './CoverageDashboard.css';

interface TestResult {
  id: string;
  hazard_id: string;
  hazard_name: string;
  status: 'passed' | 'failed';
  decision: string;
  expected_decision: string;
}

interface CoverageMetrics {
  hazard_id: string;
  hazard_name: string;
  total_tests: number;
  passed: number;
  failed: number;
  true_positives: number;
  false_positives: number;
  true_negatives: number;
  false_negatives: number;
  precision: number;
  recall: number;
  fpr: number; // False Positive Rate
  fnr: number; // False Negative Rate
  coverage: number;
}

interface CoverageDashboardProps {
  testResults: TestResult[];
  totalHazards: number;
}

export const CoverageDashboard: React.FC<CoverageDashboardProps> = ({
  testResults,
  totalHazards
}) => {
  const [metrics, setMetrics] = useState<CoverageMetrics[]>([]);
  const [overallMetrics, setOverallMetrics] = useState({
    coverage: 0,
    precision: 0,
    recall: 0,
    fpr: 0,
    fnr: 0
  });
  const [targets, setTargets] = useState({
    coverage: 0.85,
    precision: 0.90,
    recall: 0.90
  });

  useEffect(() => {
    // Load validation targets
    fetch('/Validation/config/validation.metrics.yaml')
      .then(r => r.text())
      .then(yaml => {
        const coverageMatch = yaml.match(/hazard_coverage:\s*([\d.]+)/);
        const precisionMatch = yaml.match(/precision_overall:\s*([\d.]+)/);
        const recallMatch = yaml.match(/recall_overall:\s*([\d.]+)/);
        
        if (coverageMatch) setTargets(prev => ({ ...prev, coverage: parseFloat(coverageMatch[1]) }));
        if (precisionMatch) setTargets(prev => ({ ...prev, precision: parseFloat(precisionMatch[1]) }));
        if (recallMatch) setTargets(prev => ({ ...prev, recall: parseFloat(recallMatch[1]) }));
      })
      .catch(() => {});

    // Calculate metrics per hazard
    const hazardGroups = testResults.reduce((acc, result) => {
      if (!acc[result.hazard_id]) {
        acc[result.hazard_id] = {
          hazard_id: result.hazard_id,
          hazard_name: result.hazard_name,
          results: []
        };
      }
      acc[result.hazard_id].results.push(result);
      return acc;
    }, {} as Record<string, { hazard_id: string; hazard_name: string; results: TestResult[] }>);

    const calculatedMetrics: CoverageMetrics[] = Object.values(hazardGroups).map(group => {
      const results = group.results;
      const total = results.length;
      const passed = results.filter(r => r.status === 'passed').length;
      const failed = results.filter(r => r.status === 'failed').length;

      // Calculate TP, FP, TN, FN
      // TP: Test expected to fail and actually failed
      // FP: Test expected to pass but failed
      // TN: Test expected to pass and actually passed
      // FN: Test expected to fail but passed
      let tp = 0, fp = 0, tn = 0, fn = 0;

      results.forEach(result => {
        const isPositive = result.expected_decision !== 'ALLOW';
        const isDetected = result.status === 'failed' || result.decision !== 'ALLOW';
        
        if (isPositive && isDetected) tp++;
        else if (!isPositive && isDetected) fp++;
        else if (!isPositive && !isDetected) tn++;
        else if (isPositive && !isDetected) fn++;
      });

      const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
      const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
      const fpr = fp + tn > 0 ? fp / (fp + tn) : 0;
      const fnr = tp + fn > 0 ? fn / (tp + fn) : 0;

      return {
        hazard_id: group.hazard_id,
        hazard_name: group.hazard_name,
        total_tests: total,
        passed,
        failed,
        true_positives: tp,
        false_positives: fp,
        true_negatives: tn,
        false_negatives: fn,
        precision,
        recall,
        fpr,
        fnr,
        coverage: total > 0 ? 1.0 : 0 // Coverage is 1 if we have tests for this hazard
      };
    });

    setMetrics(calculatedMetrics);

    // Calculate overall metrics (micro-averaging)
    const overallTP = calculatedMetrics.reduce((sum, m) => sum + m.true_positives, 0);
    const overallFP = calculatedMetrics.reduce((sum, m) => sum + m.false_positives, 0);
    const overallTN = calculatedMetrics.reduce((sum, m) => sum + m.true_negatives, 0);
    const overallFN = calculatedMetrics.reduce((sum, m) => sum + m.false_negatives, 0);

    const overallPrecision = overallTP + overallFP > 0 ? overallTP / (overallTP + overallFP) : 0;
    const overallRecall = overallTP + overallFN > 0 ? overallTP / (overallTP + overallFN) : 0;
    const overallFPR = overallFP + overallTN > 0 ? overallFP / (overallFP + overallTN) : 0;
    const overallFNR = overallTP + overallFN > 0 ? overallFN / (overallTP + overallFN) : 0;
    const overallCoverage = calculatedMetrics.length / totalHazards;

    setOverallMetrics({
      coverage: overallCoverage,
      precision: overallPrecision,
      recall: overallRecall,
      fpr: overallFPR,
      fnr: overallFNR
    });
  }, [testResults, totalHazards]);

  const getStatusColor = (value: number, target: number, higherIsBetter: boolean = true) => {
    if (higherIsBetter) {
      return value >= target ? '#16a34a' : value >= target * 0.75 ? '#ea580c' : '#dc2626';
    } else {
      return value <= target ? '#16a34a' : value <= target * 1.25 ? '#ea580c' : '#dc2626';
    }
  };

  const getTrafficLight = (value: number, target: number) => {
    return value >= target ? '🟢' : value >= target * 0.75 ? '🟡' : '🔴';
  };

  return (
    <div className="coverage-dashboard">
      <div className="coverage-header">
        <h2>Coverage Dashboard</h2>
        <p className="coverage-subtitle">Hazard coverage, precision, recall, and error rates</p>
      </div>

      {/* Overall Metrics */}
      <div className="overall-metrics">
        <h3>Overall Metrics</h3>
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-label">Coverage</span>
              <span className="traffic-light">{getTrafficLight(overallMetrics.coverage, targets.coverage)}</span>
            </div>
            <div 
              className="metric-value"
              style={{ color: getStatusColor(overallMetrics.coverage, targets.coverage) }}
            >
              {(overallMetrics.coverage * 100).toFixed(1)}%
            </div>
            <div className="metric-target">Target: ≥{(targets.coverage * 100).toFixed(0)}%</div>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-label">Precision</span>
              <span className="traffic-light">{getTrafficLight(overallMetrics.precision, targets.precision)}</span>
            </div>
            <div 
              className="metric-value"
              style={{ color: getStatusColor(overallMetrics.precision, targets.precision) }}
            >
              {(overallMetrics.precision * 100).toFixed(1)}%
            </div>
            <div className="metric-target">Target: ≥{(targets.precision * 100).toFixed(0)}%</div>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-label">Recall</span>
              <span className="traffic-light">{getTrafficLight(overallMetrics.recall, targets.recall)}</span>
            </div>
            <div 
              className="metric-value"
              style={{ color: getStatusColor(overallMetrics.recall, targets.recall) }}
            >
              {(overallMetrics.recall * 100).toFixed(1)}%
            </div>
            <div className="metric-target">Target: ≥{(targets.recall * 100).toFixed(0)}%</div>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-label">False Positive Rate</span>
              <span className="traffic-light">{getTrafficLight(overallMetrics.fpr, 0.10, false)}</span>
            </div>
            <div 
              className="metric-value"
              style={{ color: getStatusColor(overallMetrics.fpr, 0.10, false) }}
            >
              {(overallMetrics.fpr * 100).toFixed(1)}%
            </div>
            <div className="metric-target">Target: ≤10%</div>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-label">False Negative Rate</span>
              <span className="traffic-light">{getTrafficLight(overallMetrics.fnr, 0.10, false)}</span>
            </div>
            <div 
              className="metric-value"
              style={{ color: getStatusColor(overallMetrics.fnr, 0.10, false) }}
            >
              {(overallMetrics.fnr * 100).toFixed(1)}%
            </div>
            <div className="metric-target">Target: ≤10%</div>
          </div>
        </div>
      </div>

      {/* Per-Hazard Metrics */}
      <div className="hazard-metrics">
        <h3>Per-Hazard Metrics</h3>
        <div className="metrics-table">
          <table>
            <thead>
              <tr>
                <th>Hazard</th>
                <th>Tests</th>
                <th>TP</th>
                <th>FP</th>
                <th>TN</th>
                <th>FN</th>
                <th>Precision</th>
                <th>Recall</th>
                <th>FPR</th>
                <th>FNR</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {metrics.map(metric => (
                <tr key={metric.hazard_id}>
                  <td>
                    <strong>{metric.hazard_id}</strong>
                    <div className="hazard-name">{metric.hazard_name}</div>
                  </td>
                  <td>{metric.total_tests}</td>
                  <td>{metric.true_positives}</td>
                  <td>{metric.false_positives}</td>
                  <td>{metric.true_negatives}</td>
                  <td>{metric.false_negatives}</td>
                  <td style={{ color: getStatusColor(metric.precision, 0.90) }}>
                    {(metric.precision * 100).toFixed(1)}%
                  </td>
                  <td style={{ color: getStatusColor(metric.recall, 0.90) }}>
                    {(metric.recall * 100).toFixed(1)}%
                  </td>
                  <td style={{ color: getStatusColor(metric.fpr, 0.10, false) }}>
                    {(metric.fpr * 100).toFixed(1)}%
                  </td>
                  <td style={{ color: getStatusColor(metric.fnr, 0.10, false) }}>
                    {(metric.fnr * 100).toFixed(1)}%
                  </td>
                  <td>
                    {metric.precision >= 0.90 && metric.recall >= 0.90 ? '✅' : '⚠️'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

