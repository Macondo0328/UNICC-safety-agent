// Evidence Collection and Logging System
// Provides audit trails and compliance reporting capabilities

import { LogEntry, EvidenceBundle, Attachment } from '../types';
import { PolicyMappingService } from './policyMapping';
import { HazardDetector } from './hazardDetection';

export interface EvidenceCollector {
  reviewId: string;
  startTime: number;
  endTime?: number;
  inputs: Record<string, unknown>;
  outputs: Record<string, unknown>;
  logs: LogEntry[];
  attachments: Attachment[];
  metadata: Record<string, unknown>;
}

export interface AuditTrail {
  reviewId: string;
  userId?: string;
  sessionId?: string;
  timestamp: string;
  action: string;
  details: Record<string, unknown>;
  complianceTags: string[];
}

export class EvidenceCollectionService {
  private static instance: EvidenceCollectionService;
  private policyMappingService: PolicyMappingService;
  private hazardDetector: HazardDetector;
  private auditTrails: AuditTrail[] = [];
  private evidenceBundles: Map<string, EvidenceBundle> = new Map();

  public static getInstance(): EvidenceCollectionService {
    if (!EvidenceCollectionService.instance) {
      EvidenceCollectionService.instance = new EvidenceCollectionService();
    }
    return EvidenceCollectionService.instance;
  }

  constructor() {
    this.policyMappingService = PolicyMappingService.getInstance();
    this.hazardDetector = HazardDetector.getInstance();
  }

  // Start evidence collection for a review
  public startEvidenceCollection(reviewId: string, inputs: Record<string, unknown>): EvidenceCollector {
    const collector: EvidenceCollector = {
      reviewId,
      startTime: performance.now(),
      inputs: { ...inputs },
      outputs: {},
      logs: [],
      attachments: [],
      metadata: {
        version: '1.0',
        collector: 'UNICC Safety Agent UI',
        timestamp: new Date().toISOString()
      }
    };

    this.addLog(reviewId, 'INFO', 'Evidence collection started', {
      reviewId,
      inputs: Object.keys(inputs)
    });

    return collector;
  }

  // Add a log entry
  public addLog(
    reviewId: string, 
    level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR', 
    message: string, 
    fields?: Record<string, unknown>
  ): void {
    const logEntry: LogEntry = {
      ts: new Date().toISOString(),
      level,
      message,
      fields: fields || {}
    };

    // Store in audit trail
    this.auditTrails.push({
      reviewId,
      timestamp: logEntry.ts,
      action: 'LOG',
      details: { level, message, fields },
      complianceTags: this.getComplianceTagsForLog(level, message)
    });

    console.log(`[${level}] ${message}`, fields);
  }

  // Add evidence to a review
  public addEvidence(
    reviewId: string,
    type: 'input' | 'output' | 'metadata',
    key: string,
    value: unknown
  ): void {
    const bundle = this.evidenceBundles.get(reviewId);
    if (!bundle) {
      console.warn(`No evidence bundle found for review ${reviewId}`);
      return;
    }

    if (type === 'input') {
      bundle.inputs[key] = value;
    } else if (type === 'output') {
      bundle.outputs[key] = value;
    } else if (type === 'metadata') {
      // Add to logs as metadata
      bundle.logs.push({
        ts: new Date().toISOString(),
        level: 'INFO',
        message: `Metadata: ${key}`,
        fields: { key, value }
      });
    }

    this.addLog(reviewId, 'INFO', `Evidence added: ${type}.${key}`, { key, type });
  }

  // Complete evidence collection and generate bundle
  public completeEvidenceCollection(
    reviewId: string,
    outputs: Record<string, unknown>,
    hazards: string[],
    decisionCode: string
  ): EvidenceBundle {
    const bundle = this.evidenceBundles.get(reviewId);
    if (!bundle) {
      throw new Error(`No evidence bundle found for review ${reviewId}`);
    }

    // Add outputs
    bundle.outputs = { ...outputs };

    // Add hazard analysis
    bundle.outputs.hazards = hazards;
    bundle.outputs.decisionCode = decisionCode;

    // Generate compliance evidence
    const complianceEvidence = this.policyMappingService.generateComplianceEvidence(reviewId, hazards);
    bundle.outputs.complianceEvidence = complianceEvidence;

    // Add final log entry
    this.addLog(reviewId, 'INFO', 'Evidence collection completed', {
      hazardsCount: hazards.length,
      decisionCode,
      complianceStatus: complianceEvidence.nistCompliance,
      euAiActStatus: complianceEvidence.euAiActCompliance
    });

    // Store the completed bundle
    this.evidenceBundles.set(reviewId, bundle);

    return bundle;
  }

  // Get evidence bundle for a review
  public getEvidenceBundle(reviewId: string): EvidenceBundle | undefined {
    return this.evidenceBundles.get(reviewId);
  }

  // Get audit trail for a review
  public getAuditTrail(reviewId: string): AuditTrail[] {
    return this.auditTrails.filter(trail => trail.reviewId === reviewId);
  }

  // Export evidence bundle as JSON
  public exportEvidenceBundle(reviewId: string): string {
    const bundle = this.getEvidenceBundle(reviewId);
    if (!bundle) {
      throw new Error(`No evidence bundle found for review ${reviewId}`);
    }

    return JSON.stringify(bundle, null, 2);
  }

  // Generate compliance report
  public generateComplianceReport(reviewId: string): {
    reviewId: string;
    timestamp: string;
    complianceSummary: any;
    policyMappings: any[];
    auditTrail: AuditTrail[];
    recommendations: string[];
  } {
    const bundle = this.getEvidenceBundle(reviewId);
    if (!bundle) {
      throw new Error(`No evidence bundle found for review ${reviewId}`);
    }

    const hazards = bundle.outputs.hazards as string[] || [];
    const complianceEvidence = this.policyMappingService.generateComplianceEvidence(reviewId, hazards);
    const complianceSummary = this.policyMappingService.getComplianceSummary(complianceEvidence);
    const auditTrail = this.getAuditTrail(reviewId);

    return {
      reviewId,
      timestamp: new Date().toISOString(),
      complianceSummary,
      policyMappings: complianceEvidence.policyMappings,
      auditTrail,
      recommendations: complianceSummary.recommendations
    };
  }

  // Add attachment to evidence bundle
  public addAttachment(
    reviewId: string,
    filename: string,
    contentType: string,
    content: string | ArrayBuffer
  ): void {
    const bundle = this.evidenceBundles.get(reviewId);
    if (!bundle) {
      console.warn(`No evidence bundle found for review ${reviewId}`);
      return;
    }

    const attachment: Attachment = {
      id: this.generateUUID(),
      filename,
      contentType,
      sha256: this.calculateSHA256(content)
    };

    bundle.attachments.push(attachment);

    this.addLog(reviewId, 'INFO', `Attachment added: ${filename}`, {
      attachmentId: attachment.id,
      filename,
      contentType
    });
  }

  // Generate UUID with fallback for older browsers
  private generateUUID(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    
    // Fallback UUID generator
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // Calculate SHA256 hash for content integrity
  private calculateSHA256(content: string | ArrayBuffer): string {
    // In a real implementation, you would use a proper SHA256 library
    // For now, we'll use a simple hash simulation
    const str = typeof content === 'string' ? content : new TextDecoder().decode(content);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  }

  // Get compliance tags for log entries
  private getComplianceTagsForLog(level: string, message: string): string[] {
    const tags: string[] = [];
    
    if (level === 'ERROR') {
      tags.push('NIST-MANAGE', 'EU-AI-ACT-LOGGING');
    }
    
    if (message.includes('hazard') || message.includes('risk')) {
      tags.push('NIST-MAP', 'NIST-MEASURE');
    }
    
    if (message.includes('compliance') || message.includes('policy')) {
      tags.push('NIST-GOVERN', 'EU-AI-ACT-GOVERNANCE');
    }
    
    return tags;
  }

  // Clear old evidence bundles (for memory management)
  public clearOldEvidence(olderThanHours: number = 24): void {
    const cutoffTime = Date.now() - (olderThanHours * 60 * 60 * 1000);
    
    for (const [reviewId, bundle] of this.evidenceBundles.entries()) {
      const bundleTime = new Date(bundle.logs[0]?.ts || '1970-01-01').getTime();
      if (bundleTime < cutoffTime) {
        this.evidenceBundles.delete(reviewId);
      }
    }

    // Clear old audit trails
    this.auditTrails = this.auditTrails.filter(trail => {
      const trailTime = new Date(trail.timestamp).getTime();
      return trailTime >= cutoffTime;
    });
  }

  // Get statistics about evidence collection
  public getStatistics(): {
    totalReviews: number;
    totalLogs: number;
    totalAttachments: number;
    averageLogsPerReview: number;
    complianceRate: number;
  } {
    const totalReviews = this.evidenceBundles.size;
    const totalLogs = Array.from(this.evidenceBundles.values())
      .reduce((sum, bundle) => sum + bundle.logs.length, 0);
    const totalAttachments = Array.from(this.evidenceBundles.values())
      .reduce((sum, bundle) => sum + bundle.attachments.length, 0);
    
    const averageLogsPerReview = totalReviews > 0 ? totalLogs / totalReviews : 0;
    
    // Calculate compliance rate based on completed reviews
    let compliantReviews = 0;
    for (const bundle of this.evidenceBundles.values()) {
      const hazards = bundle.outputs.hazards as string[] || [];
      const complianceEvidence = this.policyMappingService.generateComplianceEvidence(
        bundle.review_id, hazards
      );
      const summary = this.policyMappingService.getComplianceSummary(complianceEvidence);
      if (summary.overall === 'compliant') {
        compliantReviews++;
      }
    }
    
    const complianceRate = totalReviews > 0 ? compliantReviews / totalReviews : 0;

    return {
      totalReviews,
      totalLogs,
      totalAttachments,
      averageLogsPerReview,
      complianceRate
    };
  }
}
