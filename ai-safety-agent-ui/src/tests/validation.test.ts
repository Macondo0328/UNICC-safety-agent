// Validation tests
import { describe, it, expect } from 'vitest';
import { validatePrompt, sanitizeInput, checkRateLimiting } from '../utils/validation';

describe('validatePrompt', () => {
  it('should reject empty prompts', () => {
    const result = validatePrompt('');
    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].code).toBe('EMPTY_PROMPT');
  });

  it('should reject prompts that are too long', () => {
    const longPrompt = 'a'.repeat(5001);
    const result = validatePrompt(longPrompt);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.code === 'PROMPT_TOO_LONG')).toBe(true);
  });

  it('should accept valid prompts', () => {
    const result = validatePrompt('This is a valid prompt');
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should warn about very short prompts', () => {
    const result = validatePrompt('ab');
    expect(result.warnings).toContain('Prompt is very short and may not provide enough context');
  });

  it('should detect dangerous patterns', () => {
    const dangerousPrompts = [
      'eval(malicious)',
      'exec(command)',
      'system(call)',
      '<script>alert("xss")</script>',
      'javascript:void(0)'
    ];

    dangerousPrompts.forEach(prompt => {
      const result = validatePrompt(prompt);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.code === 'DANGEROUS_PATTERN')).toBe(true);
    });
  });

  it('should warn about excessive special characters', () => {
    const specialCharPrompt = '!@#$%^&*()!@#$%^&*()!@#$%^&*()';
    const result = validatePrompt(specialCharPrompt);
    expect(result.warnings.length).toBeGreaterThan(0);
  });
});

describe('sanitizeInput', () => {
  it('should remove leading and trailing whitespace', () => {
    expect(sanitizeInput('  hello  ')).toBe('hello');
  });

  it('should replace multiple spaces with single space', () => {
    expect(sanitizeInput('hello    world')).toBe('hello world');
  });

  it('should remove zero-width characters', () => {
    const input = 'hello\u200Bworld';
    expect(sanitizeInput(input)).toBe('helloworld');
  });

  it('should remove control characters', () => {
    const input = 'hello\x00\x01\x02world';
    expect(sanitizeInput(input)).toBe('helloworld');
  });

  it('should preserve newlines and tabs', () => {
    const input = 'hello\nworld\ttab';
    expect(sanitizeInput(input)).toBe('hello\nworld\ttab');
  });
});

describe('checkRateLimiting', () => {
  it('should allow requests within rate limit', () => {
    const result = checkRateLimiting(30, 60000); // 30 requests per minute
    expect(result).toBe(true);
  });

  it('should reject requests exceeding rate limit', () => {
    const result = checkRateLimiting(120, 60000); // 120 requests per minute
    expect(result).toBe(false);
  });

  it('should handle fractional time windows', () => {
    const result = checkRateLimiting(30, 30000); // 30 requests in 30 seconds = 60/min
    expect(result).toBe(true);
  });
});

