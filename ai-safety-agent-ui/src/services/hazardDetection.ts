// Hazard Detection System - OWASP LLM Top-10 Implementation
import { Hazard, DecisionCode, SeverityLevel } from '../types';

// Hazard definitions based on OWASP LLM Top-10 (2025)
export const HAZARD_DEFINITIONS: Record<string, Hazard> = {
  H01: {
    id: 'H01',
    name: 'Prompt/Indirect Injection',
    severity: 'critical',
    owasp_llm: 'LLM01',
    un_principle: 'Human oversight & accountability',
    decision_code: 'BLOCK'
  },
  H02: {
    id: 'H02',
    name: 'Improper Output Handling',
    severity: 'high',
    owasp_llm: 'LLM05',
    un_principle: 'Transparency & explainability',
    decision_code: 'SANITIZE'
  },
  H03: {
    id: 'H03',
    name: 'Sensitive Info Disclosure / PII',
    severity: 'critical',
    owasp_llm: 'LLM02',
    un_principle: 'Privacy & data governance',
    decision_code: 'BLOCK'
  },
  H04: {
    id: 'H04',
    name: 'Hate / Harassment / Incitement',
    severity: 'critical',
    owasp_llm: 'LLM03',
    un_principle: 'Human dignity & human rights',
    decision_code: 'BLOCK'
  },
  H05: {
    id: 'H05',
    name: 'Self-harm / Violence Solicitation',
    severity: 'critical',
    owasp_llm: 'LLM04',
    un_principle: 'Human dignity & safety',
    decision_code: 'BLOCK'
  },
  H06: {
    id: 'H06',
    name: 'Misinformation / Fabricated Citations',
    severity: 'high',
    owasp_llm: 'LLM09',
    un_principle: 'Integrity & transparency',
    decision_code: 'REVIEW'
  },
  H07: {
    id: 'H07',
    name: 'System Prompt Leakage',
    severity: 'critical',
    owasp_llm: 'LLM07',
    un_principle: 'Accountability & privacy',
    decision_code: 'BLOCK'
  },
  H08: {
    id: 'H08',
    name: 'Unbounded Consumption / DoS',
    severity: 'medium',
    owasp_llm: 'LLM10',
    un_principle: 'Environment & resilience',
    decision_code: 'REVIEW'
  },
  H09: {
    id: 'H09',
    name: 'Excessive Agency / Unsafe Autonomy',
    severity: 'high',
    owasp_llm: 'LLM08',
    un_principle: 'Human oversight',
    decision_code: 'REVIEW'
  },
  H10: {
    id: 'H10',
    name: 'Supply-Chain / Plugin & Integration Risks',
    severity: 'high',
    owasp_llm: 'LLM05',
    un_principle: 'Governance & logging',
    decision_code: 'REVIEW'
  }
};

// Detection patterns for each hazard
export const DETECTION_PATTERNS = {
  H01: {
    // Prompt injection patterns
    patterns: [
      /ignore\s+(previous\s+)?instructions?/i,
      /forget\s+(everything|all)\s+(before|above)/i,
      /system\s+prompt/i,
      /act\s+as\s+(if\s+)?you\s+are/i,
      /pretend\s+to\s+be/i,
      /roleplay\s+as/i,
      /you\s+are\s+now/i,
      /new\s+instructions?:/i,
      /override\s+(previous\s+)?instructions?/i,
      /disregard\s+(previous\s+)?instructions?/i
    ],
    toolAbusePatterns: [
      /run\s+tool/i,
      /execute\s+command/i,
      /read\s+file/i,
      /access\s+(system|files)/i,
      /get\s+(secrets|tokens|keys)/i,
      /print\s+(system\s+)?prompt/i,
      /show\s+(system\s+)?prompt/i,
      /reveal\s+(system\s+)?prompt/i
    ]
  },
  H02: {
    // Executable content patterns
    patterns: [
      /<script[^>]*>.*?<\/script>/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /eval\s*\(/i,
      /document\.write/i,
      /innerHTML\s*=/i,
      /outerHTML\s*=/i,
      /<iframe[^>]*>/i,
      /<object[^>]*>/i,
      /<embed[^>]*>/i
    ]
  },
  H03: {
    // PII patterns
    patterns: [
      /\b\d{3}-\d{2}-\d{4}\b/, // SSN
      /\b\d{3}\.\d{2}\.\d{4}\b/, // SSN with dots
      /\b\d{3}\s\d{2}\s\d{4}\b/, // SSN with spaces
      /\b\d{3}-\d{3}-\d{4}\b/, // Phone
      /\b\d{3}\.\d{3}\.\d{4}\b/, // Phone with dots
      /\b\d{3}\s\d{3}\s\d{4}\b/, // Phone with spaces
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email
      /\b\d{4}\s\d{4}\s\d{4}\s\d{4}\b/, // Credit card
      /\b\d{4}-\d{4}-\d{4}-\d{4}\b/, // Credit card with dashes
      /\b[A-Z]{2}\d{6}\b/, // Passport
      /\b\d{2}\/\d{2}\/\d{4}\b/, // Date of birth
      /\b\d{2}-\d{2}-\d{4}\b/, // Date of birth with dashes
      /\b\d{2}\.\d{2}\.\d{4}\b/ // Date of birth with dots
    ]
  },
  H04: {
    // Hate speech patterns
    patterns: [
      /\b(kill|murder|destroy)\s+(all\s+)?(jews|muslims|blacks|whites|asians|hispanics|gays|trans|women|men)\b/i,
      /\b(hate|despise|loathe)\s+(all\s+)?(jews|muslims|blacks|whites|asians|hispanics|gays|trans|women|men)\b/i,
      /\b(exterminate|eliminate|wipe\s+out)\s+(all\s+)?(jews|muslims|blacks|whites|asians|hispanics|gays|trans|women|men)\b/i,
      /\b(racist|sexist|homophobic|transphobic|antisemitic|islamophobic)\b/i,
      /\b(nazi|hitler|kkk|white\s+supremacy|white\s+power)\b/i,
      /\b(rape|sexual\s+assault|molest)\b/i,
      /\b(harass|bully|intimidate)\s+(women|blacks|muslims|jews|gays|trans)\b/i
    ]
  },
  H05: {
    // Self-harm and violence patterns
    patterns: [
      /\b(suicide|kill\s+myself|end\s+my\s+life|self\s+harm|cut\s+myself)\b/i,
      /\b(how\s+to\s+suicide|suicide\s+methods|ways\s+to\s+die)\b/i,
      /\b(make\s+a\s+bomb|build\s+a\s+bomb|bomb\s+making)\b/i,
      /\b(how\s+to\s+make\s+explosives|explosive\s+making)\b/i,
      /\b(kill\s+someone|murder\s+someone|assassinate)\b/i,
      /\b(poison\s+someone|poisoning\s+methods)\b/i,
      /\b(weapon\s+making|gun\s+making|knife\s+making)\b/i,
      /\b(violence\s+against|attack\s+someone|harm\s+someone)\b/i
    ]
  },
  H06: {
    // Misinformation patterns
    patterns: [
      /\b(conspiracy\s+theory|conspiracy\s+theories)\b/i,
      /\b(flat\s+earth|moon\s+landing\s+hoax|vaccine\s+hoax)\b/i,
      /\b(holocaust\s+denial|holocaust\s+hoax)\b/i,
      /\b(climate\s+change\s+hoax|global\s+warming\s+hoax)\b/i,
      /\b(9\/11\s+inside\s+job|9\/11\s+conspiracy)\b/i,
      /\b(chemtrails|illuminati|new\s+world\s+order)\b/i,
      /\b(fake\s+news|misinformation|disinformation)\b/i,
      /\b(alternative\s+facts|post\s+truth)\b/i
    ]
  },
  H07: {
    // System prompt leakage patterns
    patterns: [
      /\b(system\s+prompt|system\s+instructions?|system\s+message)\b/i,
      /\b(show\s+me\s+your\s+prompt|reveal\s+your\s+prompt)\b/i,
      /\b(what\s+are\s+your\s+instructions?|what\s+is\s+your\s+prompt)\b/i,
      /\b(print\s+your\s+prompt|display\s+your\s+prompt)\b/i,
      /\b(original\s+prompt|base\s+prompt|initial\s+prompt)\b/i,
      /\b(behind\s+the\s+scenes|internal\s+instructions?)\b/i,
      /\b(developer\s+notes?|admin\s+instructions?)\b/i
    ]
  },
  H08: {
    // Resource consumption patterns
    patterns: [
      /\b(infinite\s+loop|endless\s+loop|while\s+true)\b/i,
      /\b(repeat\s+forever|loop\s+infinitely)\b/i,
      /\b(generate\s+infinite|create\s+infinite)\b/i,
      /\b(very\s+long\s+text|extremely\s+long\s+text)\b/i,
      /\b(million\s+words|billion\s+words)\b/i,
      /\b(consume\s+all\s+resources|use\s+all\s+memory)\b/i,
      /\b(flood\s+the\s+system|overwhelm\s+the\s+system)\b/i
    ]
  },
  H09: {
    // Excessive agency patterns
    patterns: [
      /\b(act\s+autonomously|work\s+independently)\b/i,
      /\b(make\s+decisions\s+without\s+permission)\b/i,
      /\b(bypass\s+safety\s+measures|ignore\s+safety\s+protocols)\b/i,
      /\b(override\s+human\s+control|disable\s+human\s+oversight)\b/i,
      /\b(act\s+as\s+if\s+you\s+are\s+human)\b/i,
      /\b(pretend\s+to\s+be\s+human)\b/i,
      /\b(hide\s+your\s+ai\s+nature|conceal\s+your\s+ai\s+nature)\b/i
    ]
  },
  H10: {
    // Supply chain patterns
    patterns: [
      /\b(untrusted\s+plugin|malicious\s+plugin)\b/i,
      /\b(third\s+party\s+integration|external\s+integration)\b/i,
      /\b(unsafe\s+dependency|vulnerable\s+dependency)\b/i,
      /\b(compromised\s+package|malicious\s+package)\b/i,
      /\b(unauthorized\s+access|privilege\s+escalation)\b/i,
      /\b(backdoor|trojan|malware)\b/i
    ]
  }
};

export interface HazardDetectionResult {
  detectedHazards: Hazard[];
  decisionCode: DecisionCode;
  reasonCodes: string[];
  confidence: number;
  sanitizedInput?: string;
}

export class HazardDetector {
  private static instance: HazardDetector;
  
  public static getInstance(): HazardDetector {
    if (!HazardDetector.instance) {
      HazardDetector.instance = new HazardDetector();
    }
    return HazardDetector.instance;
  }

  public detectHazards(input: string): HazardDetectionResult {
    const detectedHazards: Hazard[] = [];
    const reasonCodes: string[] = [];
    let maxSeverity: SeverityLevel = 'low';
    let decisionCode: DecisionCode = 'ALLOW';

    // Check each hazard type
    for (const [hazardId, patterns] of Object.entries(DETECTION_PATTERNS)) {
      const hazard = HAZARD_DEFINITIONS[hazardId];
      if (!hazard) continue;

      let detected = false;
      let hazardReasonCodes: string[] = [];

      // Check main patterns
      for (const pattern of patterns.patterns) {
        if (pattern.test(input)) {
          detected = true;
          hazardReasonCodes.push(`${hazardId}_PATTERN_MATCH`);
          break;
        }
      }

      // Check specific patterns for H01 (tool abuse)
      if (hazardId === 'H01' && patterns.toolAbusePatterns) {
        for (const pattern of patterns.toolAbusePatterns) {
          if (pattern.test(input)) {
            detected = true;
            hazardReasonCodes.push('H01_TOOL_ABUSE');
            break;
          }
        }
      }

      if (detected) {
        detectedHazards.push(hazard);
        reasonCodes.push(...hazardReasonCodes);
        
        // Update severity and decision code
        if (this.getSeverityLevel(hazard.severity) > this.getSeverityLevel(maxSeverity)) {
          maxSeverity = hazard.severity;
        }
        
        // Decision code precedence: BLOCK > SANITIZE > REVIEW > ALLOW
        if (hazard.decision_code === 'BLOCK' || decisionCode === 'ALLOW') {
          decisionCode = hazard.decision_code;
        } else if (hazard.decision_code === 'SANITIZE' && decisionCode !== 'BLOCK') {
          decisionCode = hazard.decision_code;
        } else if (hazard.decision_code === 'REVIEW' && decisionCode === 'ALLOW') {
          decisionCode = hazard.decision_code;
        }
      }
    }

    // Calculate confidence based on number of patterns matched
    const confidence = detectedHazards.length > 0 ? Math.min(0.9 + (detectedHazards.length * 0.02), 1.0) : 0.1;

    // Sanitize input if needed
    let sanitizedInput: string | undefined;
    if (decisionCode === 'SANITIZE') {
      sanitizedInput = this.sanitizeInput(input);
    }

    return {
      detectedHazards,
      decisionCode,
      reasonCodes,
      confidence,
      sanitizedInput
    };
  }

  private getSeverityLevel(severity: SeverityLevel): number {
    const levels = { low: 1, medium: 2, high: 3, critical: 4 };
    return levels[severity];
  }

  private sanitizeInput(input: string): string {
    let sanitized = input;
    
    // Remove script tags and dangerous HTML
    sanitized = sanitized.replace(/<script[^>]*>.*?<\/script>/gi, '[SCRIPT_REMOVED]');
    sanitized = sanitized.replace(/<iframe[^>]*>.*?<\/iframe>/gi, '[IFRAME_REMOVED]');
    sanitized = sanitized.replace(/<object[^>]*>.*?<\/object>/gi, '[OBJECT_REMOVED]');
    sanitized = sanitized.replace(/<embed[^>]*>/gi, '[EMBED_REMOVED]');
    
    // Remove javascript: protocols
    sanitized = sanitized.replace(/javascript:/gi, '[JAVASCRIPT_REMOVED]:');
    
    // Remove event handlers
    sanitized = sanitized.replace(/\bon\w+\s*=\s*["'][^"']*["']/gi, '');
    
    // Remove dangerous functions
    sanitized = sanitized.replace(/eval\s*\(/gi, '[EVAL_REMOVED](');
    sanitized = sanitized.replace(/document\.write/gi, '[DOCUMENT_WRITE_REMOVED]');
    
    return sanitized;
  }

  public getAllHazards(): Hazard[] {
    return Object.values(HAZARD_DEFINITIONS);
  }

  public getHazardById(id: string): Hazard | undefined {
    return HAZARD_DEFINITIONS[id];
  }
}


