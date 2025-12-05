// Ingest Policy Mapping from markdown to JSON
import * as fs from 'fs';
import * as path from 'path';

interface PolicyTag {
  policy_source: string;
  clause_principle: string;
  nist_function: string;
  nist_outcome: string;
  eu_ai_act_tier: string;
  example_hazard: string;
  decision_code: string;
  hazard_ids: string[];
}

function parsePolicyMapping(mdPath: string): PolicyTag[] {
  const content = fs.readFileSync(mdPath, 'utf-8');
  const tags: PolicyTag[] = [];
  
  // Find the table section
  const tableMatch = content.match(/\|.*Policy Source.*Decision Code.*\|[\s\S]*?(\|.*\|[\s\S]*?)(?=\n\n|---|###)/);
  if (!tableMatch) {
    throw new Error('Could not find policy mapping table');
  }
  
  const tableContent = tableMatch[1];
  const rows = tableContent.split('\n').filter(row => row.trim().startsWith('|') && !row.includes('---'));
  
  // Map example hazards to hazard IDs
  const hazardMapping: Record<string, string[]> = {
    'Hate/incitement': ['H04'],
    'How to make a bomb': ['H05'],
    'PII/health/child data': ['H03'],
    'Discriminatory scoring': ['H04'],
    'Fully automated adverse decision': ['H09'],
    'names + contact details': ['H03'],
    'Opaque recommendation': ['H06'],
    'Excessive compute': ['H08'],
    'Fabricated citations': ['H06'],
    'Untrusted page injects': ['H01'],
    'LLM returns HTML/JS': ['H02'],
    'Targeted harassment': ['H04'],
    'minors\' PII': ['H03'],
    'Missing logs': ['H07'],
    'Harmful stereotypes': ['H04']
  };
  
  for (const row of rows) {
    const cells = row.split('|').map(c => c.trim()).filter(c => c);
    if (cells.length < 6) continue;
    
    const policySource = cells[0].replace(/\*\*/g, '').trim();
    const clausePrinciple = cells[1].replace(/\*\*/g, '').trim();
    const nistParts = cells[2].split('–').map(p => p.trim());
    const nistFunction = nistParts[0] || '';
    const nistOutcome = nistParts[1] || '';
    const euAiActTier = cells[3].trim();
    const exampleHazard = cells[4].trim();
    const decisionCode = cells[5].replace(/\*\*/g, '').trim();
    
    // Find matching hazard IDs
    let hazardIds: string[] = [];
    for (const [key, ids] of Object.entries(hazardMapping)) {
      if (exampleHazard.toLowerCase().includes(key.toLowerCase())) {
        hazardIds = ids;
        break;
      }
    }
    
    // Fallback: try to extract from example hazard text
    if (hazardIds.length === 0) {
      const hazardMatch = exampleHazard.match(/H0[1-9]|H10/);
      if (hazardMatch) {
        hazardIds = [hazardMatch[0]];
      }
    }
    
    tags.push({
      policy_source: policySource,
      clause_principle: clausePrinciple,
      nist_function: nistFunction,
      nist_outcome: nistOutcome,
      eu_ai_act_tier: euAiActTier,
      example_hazard: exampleHazard,
      decision_code: decisionCode,
      hazard_ids: hazardIds
    });
  }
  
  return tags;
}

function main() {
  const mdPath = path.join(__dirname, '../Validation/1. policy-mapping.md');
  const outputPath = path.join(__dirname, '../public/data/policy-tags.json');
  
  try {
    const tags = parsePolicyMapping(mdPath);
    const output = {
      generated_at: new Date().toISOString(),
      tags: tags,
      by_hazard: tags.reduce((acc, tag) => {
        tag.hazard_ids.forEach(hazardId => {
          if (!acc[hazardId]) {
            acc[hazardId] = [];
          }
          acc[hazardId].push(tag);
        });
        return acc;
      }, {} as Record<string, PolicyTag[]>)
    };
    
    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
    console.log(`✅ Generated ${outputPath} with ${tags.length} policy tags`);
  } catch (error) {
    console.error('❌ Error ingesting policy mapping:', error);
    process.exit(1);
  }
}

main();

