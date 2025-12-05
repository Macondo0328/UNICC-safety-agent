// Rate Limiting and Error Handling Service
// Implements rate limiting and error handling according to API operations guide

export interface RateLimitConfig {
  ui_read: number; // requests per minute
  ui_write: number; // requests per minute
  evidence_download: number; // files per minute
}

export interface RateLimitStatus {
  policy: string;
  limit: number;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Array<{ field: string; issue: string }>;
  trace_id: string;
}

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

// Default rate limit configuration based on API operations guide
const DEFAULT_RATE_LIMITS: RateLimitConfig = {
  ui_read: 120, // 120 req/min
  ui_write: 60, // 60 req/min
  evidence_download: 10 // 10 files/min
};

// Default retry configuration
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2
};

export class RateLimitService {
  private static instance: RateLimitService;
  private rateLimits: Map<string, { count: number; resetTime: number }> = new Map();
  private config: RateLimitConfig;

  public static getInstance(): RateLimitService {
    if (!RateLimitService.instance) {
      RateLimitService.instance = new RateLimitService();
    }
    return RateLimitService.instance;
  }

  constructor(config: RateLimitConfig = DEFAULT_RATE_LIMITS) {
    this.config = config;
  }

  // Check if request is allowed for a specific policy
  public checkRateLimit(policy: keyof RateLimitConfig): RateLimitStatus {
    const now = Date.now();
    const limit = this.config[policy];
    const key = policy;
    
    const current = this.rateLimits.get(key);
    
    if (!current || now >= current.resetTime) {
      // Reset or initialize counter
      this.rateLimits.set(key, {
        count: 1,
        resetTime: now + 60000 // Reset every minute
      });
      
      return {
        policy,
        limit,
        remaining: limit - 1,
        resetTime: now + 60000
      };
    }
    
    if (current.count >= limit) {
      // Rate limit exceeded
      return {
        policy,
        limit,
        remaining: 0,
        resetTime: current.resetTime,
        retryAfter: Math.ceil((current.resetTime - now) / 1000)
      };
    }
    
    // Increment counter
    current.count++;
    this.rateLimits.set(key, current);
    
    return {
      policy,
      limit,
      remaining: limit - current.count,
      resetTime: current.resetTime
    };
  }

  // Update rate limit configuration
  public updateConfig(config: Partial<RateLimitConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // Clear rate limit counters
  public clearCounters(): void {
    this.rateLimits.clear();
  }
}

export class ErrorHandlingService {
  private static instance: ErrorHandlingService;
  private retryConfig: RetryConfig;

  public static getInstance(): ErrorHandlingService {
    if (!ErrorHandlingService.instance) {
      ErrorHandlingService.instance = new ErrorHandlingService();
    }
    return ErrorHandlingService.instance;
  }

  constructor(retryConfig: RetryConfig = DEFAULT_RETRY_CONFIG) {
    this.retryConfig = retryConfig;
  }

  // Parse API error response
  public parseApiError(response: Response, body?: any): ApiError {
    const traceId = createIdempotencyKey();
    
    if (body && typeof body === 'object' && body.code) {
      return {
        code: body.code,
        message: body.message || 'Unknown error',
        details: body.details,
        trace_id: body.trace_id || traceId
      };
    }

    // Fallback error parsing based on HTTP status
    const statusErrors: Record<number, { code: string; message: string }> = {
      400: { code: 'BAD_REQUEST', message: 'Bad Request' },
      401: { code: 'UNAUTHORIZED', message: 'Unauthorized' },
      403: { code: 'FORBIDDEN', message: 'Forbidden' },
      404: { code: 'NOT_FOUND', message: 'Not Found' },
      409: { code: 'CONFLICT', message: 'Conflict' },
      422: { code: 'UNPROCESSABLE', message: 'Unprocessable Entity' },
      429: { code: 'RATE_LIMITED', message: 'Too Many Requests' },
      500: { code: 'INTERNAL', message: 'Internal Server Error' },
      503: { code: 'UNAVAILABLE', message: 'Service Unavailable' }
    };

    const error = statusErrors[response.status] || {
      code: 'UNKNOWN',
      message: 'Unknown error'
    };

    return {
      ...error,
      trace_id: traceId
    };
  }

  // Execute request with retry logic
  public async executeWithRetry<T>(
    requestFn: () => Promise<T>,
    context: string = 'API request'
  ): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // Don't retry on certain error types
        if (this.shouldNotRetry(error)) {
          throw lastError;
        }
        
        // Don't retry on last attempt
        if (attempt === this.retryConfig.maxRetries) {
          break;
        }
        
        // Calculate delay with exponential backoff
        const delay = Math.min(
          this.retryConfig.baseDelay * Math.pow(this.retryConfig.backoffMultiplier, attempt),
          this.retryConfig.maxDelay
        );
        
        console.warn(`${context} failed (attempt ${attempt + 1}/${this.retryConfig.maxRetries + 1}), retrying in ${delay}ms:`, lastError.message);
        
        await this.sleep(delay);
      }
    }
    
    throw lastError || new Error(`${context} failed after ${this.retryConfig.maxRetries + 1} attempts`);
  }

  // Check if error should not be retried
  private shouldNotRetry(error: any): boolean {
    if (error instanceof Response) {
      const status = error.status;
      // Don't retry client errors (4xx) except 429 (rate limit)
      return status >= 400 && status < 500 && status !== 429;
    }
    
    if (error && typeof error === 'object' && error.code) {
      // Don't retry certain error codes
      const noRetryCodes = ['BAD_REQUEST', 'UNAUTHORIZED', 'FORBIDDEN', 'NOT_FOUND', 'CONFLICT', 'UNPROCESSABLE'];
      return noRetryCodes.includes(error.code);
    }
    
    return false;
  }

  // Sleep utility
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Handle rate limit errors
  public handleRateLimitError(error: ApiError): { retryAfter: number; message: string } {
    const retryAfter = this.extractRetryAfter(error);
    const message = `Rate limit exceeded. Please try again in ${retryAfter} seconds.`;
    
    return { retryAfter, message };
  }

  // Extract retry-after from error
  private extractRetryAfter(error: ApiError): number {
    // Try to extract from error details
    if (error.details) {
      for (const detail of error.details) {
        if (detail.issue === 'burst_exceeded' || detail.field === 'retry_after') {
          return parseInt(detail.issue) || 60; // Default to 60 seconds
        }
      }
    }
    
    // Default retry after time
    return 60;
  }

  // Update retry configuration
  public updateRetryConfig(config: Partial<RetryConfig>): void {
    this.retryConfig = { ...this.retryConfig, ...config };
  }

  // Create user-friendly error message
  public createUserFriendlyMessage(error: ApiError): string {
    const userMessages: Record<string, string> = {
      'BAD_REQUEST': 'The request was invalid. Please check your input and try again.',
      'UNAUTHORIZED': 'You are not authorized to perform this action. Please check your credentials.',
      'FORBIDDEN': 'Access denied. You do not have permission to perform this action.',
      'NOT_FOUND': 'The requested resource was not found.',
      'CONFLICT': 'The request conflicts with the current state of the resource.',
      'UNPROCESSABLE': 'The request was well-formed but contains invalid data.',
      'RATE_LIMITED': 'Too many requests. Please wait a moment before trying again.',
      'INTERNAL': 'An internal server error occurred. Please try again later.',
      'UNAVAILABLE': 'The service is temporarily unavailable. Please try again later.'
    };

    return userMessages[error.code] || error.message || 'An unexpected error occurred.';
  }

  // Log error for debugging
  public logError(error: ApiError, context: string = 'API Error'): void {
    console.error(`[${context}] ${error.code}: ${error.message}`, {
      trace_id: error.trace_id,
      details: error.details,
      timestamp: new Date().toISOString()
    });
  }
}

// Utility function to create idempotency key
export function createIdempotencyKey(): string {
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

// Utility function to handle fetch with rate limiting and error handling
export async function fetchWithRateLimit(
  url: string,
  options: RequestInit,
  policy: keyof RateLimitConfig = 'ui_write'
): Promise<Response> {
  const rateLimitService = RateLimitService.getInstance();
  const errorHandlingService = ErrorHandlingService.getInstance();
  
  // Check rate limit before making request
  const rateLimitStatus = rateLimitService.checkRateLimit(policy);
  
  if (rateLimitStatus.remaining === 0) {
    const error: ApiError = {
      code: 'RATE_LIMITED',
      message: 'Rate limit exceeded',
      trace_id: createIdempotencyKey()
    };
    
    const { retryAfter } = errorHandlingService.handleRateLimitError(error);
    throw new Error(`Rate limit exceeded. Retry after ${retryAfter} seconds.`);
  }
  
  // Execute request with retry logic
  return errorHandlingService.executeWithRetry(async () => {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      let body;
      try {
        body = await response.json();
      } catch {
        body = null;
      }
      
      const apiError = errorHandlingService.parseApiError(response, body);
      errorHandlingService.logError(apiError, 'Fetch Request');
      throw apiError;
    }
    
    return response;
  }, `Fetch request to ${url}`);
}
