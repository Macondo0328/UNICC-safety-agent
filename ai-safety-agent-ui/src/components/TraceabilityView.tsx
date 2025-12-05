// Traceability View Component - Requirement → Hazard → Test mapping
import React, { useState, useEffect } from 'react';
import './TraceabilityView.css';

interface TraceabilityEntry {
  requirement_id: string;
  requirement_name: string;
  hazard_id: string;
  hazard_name: string;
  test_id: string;
  test_title: string;
  result?: 'passed' | 'failed';
  evidence_file?: string;
}

interface TraceabilityViewProps {
  testResults: Array<{
    id: string;
    hazard_id: string;
    hazard_name: string;
    status: 'passed' | 'failed';
    title: string;
  }>;
}

export const TraceabilityView: React.FC<TraceabilityViewProps> = ({ testResults }) => {
  const [traceabilityData, setTraceabilityData] = useState<TraceabilityEntry[]>([]);
  const [filteredData, setFilteredData] = useState<TraceabilityEntry[]>([]);
  const [filters, setFilters] = useState({
    requirement: '',
    hazard: '',
    result: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load traceability seed data or generate from test results
    fetch('/data/traceability_seed.csv')
      .then(r => r.text())
      .then(csv => {
        const entries = parseCSV(csv);
        // Merge with test results
        const merged = entries.map(entry => {
          const testResult = testResults.find(tr => tr.id === entry.test_id);
          return {
            ...entry,
            result: testResult?.status,
            evidence_file: testResult ? `exports/test-${testResult.id}.json` : entry.evidence_file
          };
        });
        setTraceabilityData(merged);
        setFilteredData(merged);
        setLoading(false);
      })
      .catch(() => {
        // If CSV doesn't exist, generate from test results
        const generated = generateFromTestResults(testResults);
        setTraceabilityData(generated);
        setFilteredData(generated);
        setLoading(false);
      });
  }, [testResults]);

  useEffect(() => {
    let filtered = traceabilityData;

    if (filters.requirement) {
      filtered = filtered.filter(e => 
        e.requirement_id.toLowerCase().includes(filters.requirement.toLowerCase()) ||
        e.requirement_name.toLowerCase().includes(filters.requirement.toLowerCase())
      );
    }

    if (filters.hazard) {
      filtered = filtered.filter(e => e.hazard_id === filters.hazard);
    }

    if (filters.result) {
      filtered = filtered.filter(e => e.result === filters.result);
    }

    setFilteredData(filtered);
  }, [filters, traceabilityData]);

  const parseCSV = (csv: string): TraceabilityEntry[] => {
    const lines = csv.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    const entries: TraceabilityEntry[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length < headers.length) continue;

      entries.push({
        requirement_id: values[0] || '',
        requirement_name: values[1] || '',
        hazard_id: values[2] || '',
        hazard_name: values[3] || '',
        test_id: values[4] || '',
        test_title: values[5] || '',
        evidence_file: values[6] || ''
      });
    }

    return entries;
  };

  const generateFromTestResults = (results: typeof testResults): TraceabilityEntry[] => {
    // Generate traceability entries from test results
    // Map requirements based on hazard IDs
    const requirementMap: Record<string, string> = {
      'H01': 'FR-SEC-001',
      'H02': 'FR-INT-003',
      'H03': 'FR-PRIV-001',
      'H04': 'FR-HUM-001',
      'H05': 'FR-HUM-002',
      'H06': 'FR-INT-001',
      'H07': 'FR-CONF-001',
      'H08': 'FR-PERF-001'
    };

    return results.map(result => ({
      requirement_id: requirementMap[result.hazard_id] || 'FR-GEN-001',
      requirement_name: `Safety requirement for ${result.hazard_name}`,
      hazard_id: result.hazard_id,
      hazard_name: result.hazard_name,
      test_id: result.id,
      test_title: result.title,
      result: result.status,
      evidence_file: `exports/test-${result.id}.json`
    }));
  };

  const uniqueHazards = Array.from(new Set(traceabilityData.map(e => e.hazard_id))).sort();
  const uniqueRequirements = Array.from(new Set(traceabilityData.map(e => e.requirement_id))).sort();

  if (loading) {
    return <div className="traceability-view">Loading traceability data...</div>;
  }

  return (
    <div className="traceability-view">
      <div className="traceability-header">
        <h2>Traceability View</h2>
        <p className="traceability-subtitle">Requirement → Hazard → Test mapping with evidence links</p>
      </div>

      {/* Filters */}
      <div className="traceability-filters">
        <div className="filter-group">
          <label htmlFor="requirement-filter">Requirement:</label>
          <input
            id="requirement-filter"
            type="text"
            placeholder="Filter by requirement ID or name"
            value={filters.requirement}
            onChange={(e) => setFilters(prev => ({ ...prev, requirement: e.target.value }))}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="hazard-filter">Hazard:</label>
          <select
            id="hazard-filter"
            value={filters.hazard}
            onChange={(e) => setFilters(prev => ({ ...prev, hazard: e.target.value }))}
          >
            <option value="">All Hazards</option>
            {uniqueHazards.map(hazardId => (
              <option key={hazardId} value={hazardId}>{hazardId}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="result-filter">Result:</label>
          <select
            id="result-filter"
            value={filters.result}
            onChange={(e) => setFilters(prev => ({ ...prev, result: e.target.value }))}
          >
            <option value="">All Results</option>
            <option value="passed">Passed</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        <button
          className="clear-filters"
          onClick={() => setFilters({ requirement: '', hazard: '', result: '' })}
        >
          Clear Filters
        </button>
      </div>

      {/* Traceability Table */}
      <div className="traceability-table-container">
        <div className="traceability-stats">
          <span>Total Entries: {filteredData.length}</span>
          <span>Requirements: {new Set(filteredData.map(e => e.requirement_id)).size}</span>
          <span>Hazards: {new Set(filteredData.map(e => e.hazard_id)).size}</span>
          <span>Tests: {new Set(filteredData.map(e => e.test_id)).size}</span>
        </div>

        <table className="traceability-table">
          <thead>
            <tr>
              <th>Requirement ID</th>
              <th>Requirement Name</th>
              <th>Hazard</th>
              <th>Test ID</th>
              <th>Test Title</th>
              <th>Result</th>
              <th>Evidence</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={7} className="no-results">
                  No traceability entries found matching the filters.
                </td>
              </tr>
            ) : (
              filteredData.map((entry, index) => (
                <tr key={`${entry.requirement_id}-${entry.test_id}-${index}`}>
                  <td>
                    <code>{entry.requirement_id}</code>
                  </td>
                  <td>{entry.requirement_name}</td>
                  <td>
                    <span className="hazard-badge">{entry.hazard_id}</span>
                    <div className="hazard-name-small">{entry.hazard_name}</div>
                  </td>
                  <td>
                    <code>{entry.test_id}</code>
                  </td>
                  <td>{entry.test_title}</td>
                  <td>
                    {entry.result ? (
                      <span className={`result-badge ${entry.result}`}>
                        {entry.result === 'passed' ? '✅ Passed' : '❌ Failed'}
                      </span>
                    ) : (
                      <span className="result-badge unknown">Not Run</span>
                    )}
                  </td>
                  <td>
                    {entry.evidence_file ? (
                      <a
                        href={`#${entry.evidence_file}`}
                        className="evidence-link"
                        onClick={(e) => {
                          e.preventDefault();
                          // In a real implementation, this would download/open the evidence file
                          console.log('Open evidence:', entry.evidence_file);
                        }}
                      >
                        📄 View Evidence
                      </a>
                    ) : (
                      <span className="no-evidence">No evidence</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

