// Validation utilities for AI Safety Agent
import { ValidationResult, ValidationError } from '../types';

export function validatePrompt(prompt: string): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: string[] = [];

  // Check if prompt is empty
  if (!prompt || prompt.trim().length === 0) {
    errors.push({
      field: 'prompt',
      message: 'Prompt cannot be empty',
      code: 'EMPTY_PROMPT'
    });
  }

  // Check prompt length
  if (prompt.length > 5000) {
    errors.push({
      field: 'prompt',
      message: 'Prompt exceeds maximum length of 5000 characters',
      code: 'PROMPT_TOO_LONG'
    });
  }

  // Check for very short prompts
  if (prompt.trim().length > 0 && prompt.trim().length < 3) {
    warnings.push('Prompt is very short and may not provide enough context');
  }

  // Check for potentially dangerous patterns
  const dangerousPatterns = [
    /eval\s*\(/i,
    /exec\s*\(/i,
    /system\s*\(/i,
    /<script>/i,
    /javascript:/i
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(prompt)) {
      errors.push({
        field: 'prompt',
        message: 'Prompt contains potentially dangerous code patterns',
        code: 'DANGEROUS_PATTERN'
      });
      break;
    }
  }

  // Check for excessive special characters
  const specialCharCount = (prompt.match(/[^a-zA-Z0-9\s\.,\?!]/g) || []).length;
  if (specialCharCount > prompt.length * 0.3) {
    warnings.push('Prompt contains many special characters which may affect processing');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

export function sanitizeInput(input: string): string {
  // Remove leading/trailing whitespace
  let sanitized = input.trim();

  // Replace multiple spaces with single space
  sanitized = sanitized.replace(/\s+/g, ' ');

  // Remove zero-width characters
  sanitized = sanitized.replace(/[\u200B-\u200D\uFEFF]/g, '');

  // Remove control characters except newlines and tabs
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  return sanitized;
}

export function checkRateLimiting(requestCount: number, timeWindowMs: number): boolean {
  const maxRequestsPerMinute = 60;
  const requestsPerMinute = (requestCount / timeWindowMs) * 60000;
  
  return requestsPerMinute <= maxRequestsPerMinute;
}

