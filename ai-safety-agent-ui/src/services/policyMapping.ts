// Policy Mapping System - UN Charter → NIST AI RMF → EU AI Act
// Based on the policy mapping document from Validation folder

export interface PolicyMapping {
  policySource: string;
  clause: string;
  nistFunction: string;
  nistOutcome: string;
  euAiActDuty: string;
  euAiActTier: string;
  exampleHazard: string;
  decisionCode: string;
}

export interface ComplianceEvidence {
  reviewId: string;
  policyMappings: PolicyMapping[];
  nistCompliance: {
    govern: boolean;
    map: boolean;
    measure: boolean;
    manage: boolean;
  };
  euAiActCompliance: {
    gpaITransparency: boolean;
    highRiskControls: boolean;
    prohibitedPractices: boolean;
    userTransparency: boolean;
  };
  evidenceTimestamp: string;
}

// Policy mappings based on the validation document
export const POLICY_MAPPINGS: PolicyMapping[] = [
  {
    policySource: 'UN Charter',
    clause: 'Art. 1(3) – promote and encourage respect for human rights and fundamental freedoms',
    nistFunction: 'GOVERN',
    nistOutcome: 'policies, processes, roles embed human rights commitments',
    euAiActDuty: 'GPAI transparency',
    euAiActTier: 'model & output disclosures',
    exampleHazard: 'Hate/incitement targeting protected groups',
    decisionCode: 'BLOCK'
  },
  {
    policySource: 'UN Charter',
    clause: 'Art. 2(3)–(4) – peaceful settlement; refrain from threat or use of force',
    nistFunction: 'GOVERN',
    nistOutcome: 'organizational policies prohibit violence advocacy',
    euAiActDuty: 'Prohibited practices / illegal content alignment',
    euAiActTier: 'GPAI transparency',
    exampleHazard: 'How to make a bomb/violence facilitation',
    decisionCode: 'BLOCK'
  },
  {
    policySource: 'UNESCO AI Ethics (2021)',
    clause: 'Human dignity & human rights',
    nistFunction: 'MAP',
    nistOutcome: 'affected populations & rights impacts documented',
    euAiActDuty: 'High-risk: risk mgmt + technical docs + human oversight + accuracy/robustness',
    euAiActTier: 'GPAI transparency',
    exampleHazard: 'Exposure of sensitive personal data (PII/health/child data)',
    decisionCode: 'SANITIZE'
  },
  {
    policySource: 'UNESCO AI Ethics (2021)',
    clause: 'Fairness & non-discrimination',
    nistFunction: 'MAP',
    nistOutcome: 'context & intended purpose incl. bias contexts',
    euAiActDuty: 'High-risk (e.g., employment, credit, education): data governance, risk mgmt, human oversight, logging, accuracy/robustness',
    euAiActTier: 'High-risk',
    exampleHazard: 'Discriminatory scoring in hiring or credit',
    decisionCode: 'REVIEW'
  },
  {
    policySource: 'UNESCO AI Ethics (2021)',
    clause: 'Human oversight & accountability',
    nistFunction: 'MANAGE',
    nistOutcome: 'human-in-the-loop/approval for high-impact actions',
    euAiActDuty: 'High-risk: effective human oversight',
    euAiActTier: 'Post-market monitoring',
    exampleHazard: 'Fully automated adverse decision with no effective oversight',
    decisionCode: 'REVIEW'
  },
  {
    policySource: 'UNESCO AI Ethics (2021)',
    clause: 'Privacy & data governance',
    nistFunction: 'GOVERN',
    nistOutcome: 'data policies and role-based access',
    euAiActDuty: 'High-risk: data governance, logging',
    euAiActTier: 'GPAI: training data transparency',
    exampleHazard: 'Output contains names + contact details scraped from untrusted sources',
    decisionCode: 'DE-IDENTIFY+REVIEW'
  },
  {
    policySource: 'UNESCO AI Ethics (2021)',
    clause: 'Transparency & explainability',
    nistFunction: 'MAP',
    nistOutcome: 'document intended use, limitations, known unknowns',
    euAiActDuty: 'User transparency (instructions, disclosures)',
    euAiActTier: 'High-risk: technical documentation & instructions for use',
    exampleHazard: 'Opaque recommendation affecting benefits eligibility',
    decisionCode: 'REVIEW'
  },
  {
    policySource: 'UNESCO AI Ethics (2021)',
    clause: 'Environment & ecosystem',
    nistFunction: 'GOVERN',
    nistOutcome: 'sustainability objectives',
    euAiActDuty: 'Provider duties to mitigate systemic risk (for powerful GPAI)',
    euAiActTier: 'risk mgmt for high-risk',
    exampleHazard: 'Excessive compute without mitigation; unsafe degradation under stress',
    decisionCode: 'REVIEW'
  },
  {
    policySource: 'UN Core Values',
    clause: 'Integrity (truthfulness; avoid deception)',
    nistFunction: 'MEASURE',
    nistOutcome: 'groundedness/factuality checks',
    euAiActDuty: 'GPAI transparency',
    euAiActTier: 'High-risk: record-keeping & logging obligations',
    exampleHazard: 'Fabricated citations / misinformation',
    decisionCode: 'REVIEW'
  },
  {
    policySource: 'OWASP LLM Top-10 (2025)',
    clause: 'Prompt Injection',
    nistFunction: 'MEASURE',
    nistOutcome: 'adversarial testing',
    euAiActDuty: 'GPAI: model evals/adversarial testing',
    euAiActTier: 'High-risk: robustness & cybersecurity',
    exampleHazard: 'Untrusted page injects instructions to exfiltrate data',
    decisionCode: 'BLOCK'
  },
  {
    policySource: 'OWASP LLM Top-10 (2025)',
    clause: 'Improper Output Handling',
    nistFunction: 'MANAGE',
    nistOutcome: 'output validation & sanitization gates',
    euAiActDuty: 'Provider/User duties to ensure safe integration',
    euAiActTier: 'High-risk: logging, cybersecurity',
    exampleHazard: 'LLM returns HTML/JS executed downstream (XSS/RCE)',
    decisionCode: 'SANITIZE'
  },
  {
    policySource: 'UN Charter / UNESCO',
    clause: 'Non-discrimination; equality',
    nistFunction: 'MAP',
    nistOutcome: 'stakeholder engagement incl. vulnerable groups',
    euAiActDuty: 'High-risk: employment/credit/education obligations',
    euAiActTier: 'GPAI transparency',
    exampleHazard: 'Targeted harassment/dehumanization of protected groups',
    decisionCode: 'BLOCK'
  },
  {
    policySource: 'UNESCO / Child protection focus',
    clause: 'Protect children\'s rights & well-being',
    nistFunction: 'GOVERN',
    nistOutcome: 'age-appropriate policies',
    euAiActDuty: 'High-risk if impacting children',
    euAiActTier: 'GPAI: safety disclosures',
    exampleHazard: 'Requests for minors\' PII; content sexualizing minors',
    decisionCode: 'BLOCK'
  },
  {
    policySource: 'UN Charter / Accountability',
    clause: 'Rule of law; justice',
    nistFunction: 'GOVERN',
    nistOutcome: 'logging, traceability, auditability',
    euAiActDuty: 'High-risk: logging/traceability & post-market monitoring',
    euAiActTier: 'incident reporting',
    exampleHazard: 'Missing logs/trace IDs for adverse decisions',
    decisionCode: 'REVIEW'
  },
  {
    policySource: 'UN Charter / UNESCO',
    clause: 'Respect for cultural diversity',
    nistFunction: 'MAP',
    nistOutcome: 'context & localization documented',
    euAiActDuty: 'High-risk: instructions for use & risk mgmt cover localization',
    euAiActTier: 'High-risk',
    exampleHazard: 'Harmful stereotypes in localized outputs',
    decisionCode: 'REVIEW'
  }
];

export class PolicyMappingService {
  private static instance: PolicyMappingService;
  
  public static getInstance(): PolicyMappingService {
    if (!PolicyMappingService.instance) {
      PolicyMappingService.instance = new PolicyMappingService();
    }
    return PolicyMappingService.instance;
  }

  // Get policy mappings for a specific hazard
  public getMappingsForHazard(hazardId: string): PolicyMapping[] {
    return POLICY_MAPPINGS.filter(mapping => 
      mapping.exampleHazard.toLowerCase().includes(hazardId.toLowerCase()) ||
      mapping.clause.toLowerCase().includes(hazardId.toLowerCase())
    );
  }

  // Get all policy mappings
  public getAllMappings(): PolicyMapping[] {
    return POLICY_MAPPINGS;
  }

  // Generate compliance evidence for a review
  public generateComplianceEvidence(reviewId: string, hazards: string[]): ComplianceEvidence {
    const relevantMappings = hazards.flatMap(hazardId => 
      this.getMappingsForHazard(hazardId)
    );

    // Check NIST compliance
    const nistCompliance = {
      govern: relevantMappings.some(m => m.nistFunction === 'GOVERN'),
      map: relevantMappings.some(m => m.nistFunction === 'MAP'),
      measure: relevantMappings.some(m => m.nistFunction === 'MEASURE'),
      manage: relevantMappings.some(m => m.nistFunction === 'MANAGE')
    };

    // Check EU AI Act compliance
    const euAiActCompliance = {
      gpaITransparency: relevantMappings.some(m => m.euAiActDuty.includes('GPAI')),
      highRiskControls: relevantMappings.some(m => m.euAiActTier.includes('High-risk')),
      prohibitedPractices: relevantMappings.some(m => m.euAiActDuty.includes('Prohibited')),
      userTransparency: relevantMappings.some(m => m.euAiActDuty.includes('User transparency'))
    };

    return {
      reviewId,
      policyMappings: relevantMappings,
      nistCompliance,
      euAiActCompliance,
      evidenceTimestamp: new Date().toISOString()
    };
  }

  // Get decision code for a hazard based on policy mappings
  public getDecisionCodeForHazard(hazardId: string): string {
    const mappings = this.getMappingsForHazard(hazardId);
    if (mappings.length === 0) return 'ALLOW';
    
    // Return the most restrictive decision code
    const decisionCodes = mappings.map(m => m.decisionCode);
    if (decisionCodes.includes('BLOCK')) return 'BLOCK';
    if (decisionCodes.includes('SANITIZE')) return 'SANITIZE';
    if (decisionCodes.includes('DE-IDENTIFY+REVIEW')) return 'DE-IDENTIFY+REVIEW';
    if (decisionCodes.includes('REVIEW')) return 'REVIEW';
    return 'ALLOW';
  }

  // Validate compliance against specific frameworks
  public validateNISTCompliance(evidence: ComplianceEvidence): boolean {
    return evidence.nistCompliance.govern && 
           evidence.nistCompliance.map && 
           evidence.nistCompliance.measure && 
           evidence.nistCompliance.manage;
  }

  public validateEUAIActCompliance(evidence: ComplianceEvidence): boolean {
    return evidence.euAiActCompliance.gpaITransparency && 
           evidence.euAiActCompliance.highRiskControls && 
           evidence.euAiActCompliance.prohibitedPractices && 
           evidence.euAiActCompliance.userTransparency;
  }

  // Get compliance summary
  public getComplianceSummary(evidence: ComplianceEvidence): {
    overall: 'compliant' | 'partial' | 'non-compliant';
    nist: boolean;
    euAiAct: boolean;
    recommendations: string[];
  } {
    const nistCompliant = this.validateNISTCompliance(evidence);
    const euAiActCompliant = this.validateEUAIActCompliance(evidence);
    
    let overall: 'compliant' | 'partial' | 'non-compliant';
    if (nistCompliant && euAiActCompliant) {
      overall = 'compliant';
    } else if (nistCompliant || euAiActCompliant) {
      overall = 'partial';
    } else {
      overall = 'non-compliant';
    }

    const recommendations: string[] = [];
    if (!nistCompliant) {
      recommendations.push('Implement missing NIST AI RMF functions');
    }
    if (!euAiActCompliant) {
      recommendations.push('Address EU AI Act compliance gaps');
    }

    return {
      overall,
      nist: nistCompliant,
      euAiAct: euAiActCompliant,
      recommendations
    };
  }
}


