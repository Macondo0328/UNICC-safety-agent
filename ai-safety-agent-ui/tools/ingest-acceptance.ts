// Ingest Acceptance Matrix from markdown to JSON
import * as fs from 'fs';
import * as path from 'path';

interface AcceptanceEntry {
  hazard_id: string;
  hazard_name: string;
  default_decision: string;
  zero_tolerance: boolean;
  targets: {
    recall_min: number;
    precision_min: number;
  };
  perf_slo_p95_ms: number;
  linked_requirements: string[];
  owasp_ref: string;
  policy_ref: string;
}

function parseAcceptanceMatrix(mdPath: string): AcceptanceEntry[] {
  const content = fs.readFileSync(mdPath, 'utf-8');
  const entries: AcceptanceEntry[] = [];
  
  // Find the table section
  const tableMatch = content.match(/\|.*Hazard.*Decision.*\|[\s\S]*?(\|.*\|[\s\S]*?)(?=\n\n|$)/);
  if (!tableMatch) {
    throw new Error('Could not find acceptance matrix table');
  }
  
  const tableContent = tableMatch[1];
  const rows = tableContent.split('\n').filter(row => row.trim().startsWith('|') && !row.includes('---'));
  
  for (const row of rows) {
    const cells = row.split('|').map(c => c.trim()).filter(c => c);
    if (cells.length < 10) continue;
    
    const hazardMatch = cells[0].match(/H0[1-9]|H10/);
    if (!hazardMatch) continue;
    
    const hazardId = hazardMatch[0];
    const hazardName = cells[0].replace(hazardId, '').trim();
    const defaultDecision = cells[1].trim();
    const zeroTolerance = cells[2].toLowerCase().includes('yes') || cells[2].toLowerCase().includes('true');
    
    // Parse targets (e.g., "≥0.90 / ≥0.90")
    const targetsMatch = cells[3].match(/≥?([\d.]+)\s*\/\s*≥?([\d.]+)/);
    const recallMin = targetsMatch ? parseFloat(targetsMatch[1]) : 0.90;
    const precisionMin = targetsMatch ? parseFloat(targetsMatch[2]) : 0.90;
    
    // Parse perf SLO (e.g., "≤900 ms")
    const perfMatch = cells[4].match(/≤?\s*(\d+)/);
    const perfSlo = perfMatch ? parseInt(perfMatch[1]) : 900;
    
    // Parse requirements (comma-separated)
    const requirements = cells[6].split(';').map(r => r.trim()).filter(r => r);
    
    // OWASP ref
    const owaspRef = cells[9] || '';
    const policyRef = cells[8] || '';
    
    entries.push({
      hazard_id: hazardId,
      hazard_name: hazardName,
      default_decision: defaultDecision,
      zero_tolerance: zeroTolerance,
      targets: {
        recall_min: recallMin,
        precision_min: precisionMin
      },
      perf_slo_p95_ms: perfSlo,
      linked_requirements: requirements,
      owasp_ref: owaspRef,
      policy_ref: policyRef
    });
  }
  
  return entries;
}

function main() {
  const mdPath = path.join(__dirname, '../Validation/2. acceptance-matrix.md');
  const outputPath = path.join(__dirname, '../public/data/acceptance-map.json');
  
  try {
    const entries = parseAcceptanceMatrix(mdPath);
    const output = {
      generated_at: new Date().toISOString(),
      entries: entries.reduce((acc, entry) => {
        acc[entry.hazard_id] = entry;
        return acc;
      }, {} as Record<string, AcceptanceEntry>)
    };
    
    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
    console.log(`✅ Generated ${outputPath} with ${entries.length} entries`);
  } catch (error) {
    console.error('❌ Error ingesting acceptance matrix:', error);
    process.exit(1);
  }
}

main();

