// HTML Sanitization Utility using DOMPurify
import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param html - HTML string to sanitize
 * @returns Sanitized HTML string safe for rendering
 */
export function sanitizeHTML(html: string): string {
  if (!html) return '';
  
  // Configure DOMPurify with strict settings
  const config = {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    ALLOWED_ATTR: ['class'],
    KEEP_CONTENT: true,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    RETURN_TRUSTED_TYPE: false
  };
  
  return DOMPurify.sanitize(html, config);
}

/**
 * Sanitize plain text - removes any HTML tags
 * @param text - Text that may contain HTML
 * @returns Plain text with HTML removed
 */
export function sanitizeText(text: string): string {
  if (!text) return '';
  
  // Remove all HTML tags
  const config = {
    ALLOWED_TAGS: [],
    KEEP_CONTENT: true
  };
  
  return DOMPurify.sanitize(text, config);
}

/**
 * Check if content contains potentially dangerous HTML
 * @param html - HTML string to check
 * @returns true if content contains dangerous patterns
 */
export function isDangerousHTML(html: string): boolean {
  if (!html) return false;
  
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /eval\s*\(/i,
    /document\.write/i
  ];
  
  return dangerousPatterns.some(pattern => pattern.test(html));
}

