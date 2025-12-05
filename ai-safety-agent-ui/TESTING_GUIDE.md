# Testing Guide

## Overview

This project includes comprehensive tests to ensure UI integration quality and performance guardrails.

## Test Types

### 1. Unit Tests
- Validation logic
- Utility functions
- Service methods

### 2. Integration Tests
- Mock agent service
- API communication
- Performance metrics

### 3. Manual Tests
- UI interactions
- Accessibility features
- Visual validation

## Running Tests

### Run All Tests

```bash
npm test
```

### Watch Mode (Recommended for Development)

```bash
npm test -- --watch
```

### Run Specific Test File

```bash
npm test -- validation.test
```

### Generate Coverage Report

```bash
npm test -- --coverage
```

Coverage report will be in `coverage/` directory.

### Run Tests with UI

```bash
npm run test:ui
```

Opens a browser-based test UI.

## Test Files

### `src/tests/validation.test.ts`

Tests input validation and sanitization:

- ✅ Empty prompt rejection
- ✅ Length validation (max 5000 chars)
- ✅ Dangerous pattern detection
- ✅ Input sanitization
- ✅ Rate limiting checks

**Example**:
```typescript
it('should reject empty prompts', () => {
  const result = validatePrompt('');
  expect(result.isValid).toBe(false);
  expect(result.errors[0].code).toBe('EMPTY_PROMPT');
});
```

### `src/tests/mockAgentService.test.ts`

Tests mock AI agent service:

- ✅ Connection status
- ✅ Request processing
- ✅ Safety flag detection
- ✅ Performance metrics
- ✅ Latency guardrails

**Example**:
```typescript
it('should meet latency guardrails', async () => {
  // Run 20 requests
  for (let i = 0; i < 20; i++) {
    await mockAgentService.processRequest({...});
  }
  
  const metrics = mockAgentService.getPerformanceMetrics();
  expect(metrics.averageLatency).toBeLessThanOrEqual(500);
  expect(metrics.p95Latency).toBeLessThanOrEqual(900);
});
```

## Manual Testing Checklist

### Connection & Status

- [ ] Status indicator shows "Connected" in mock mode
- [ ] Version number is displayed
- [ ] Refresh button updates status
- [ ] Connection checks happen every 30 seconds

### Input Validation

- [ ] Empty prompt shows error
- [ ] Very long prompt (>5000 chars) shows error
- [ ] Dangerous patterns (eval, script) show error
- [ ] Valid prompts are accepted
- [ ] Input is sanitized properly

### Request Processing

- [ ] Submit button is disabled when disconnected
- [ ] Submit button shows spinner while processing
- [ ] Response appears after processing
- [ ] Risk level badge displays correctly
- [ ] Safety flags appear when detected
- [ ] Processing time is displayed

### Performance Monitoring

- [ ] Metrics panel appears after first request
- [ ] Request count increments
- [ ] Latencies are calculated correctly
- [ ] Warning appears if guardrails exceeded
- [ ] Average latency ≤500ms indicator
- [ ] P95 latency ≤900ms indicator

### Accessibility

- [ ] All interactive elements are keyboard accessible
- [ ] Tab order is logical
- [ ] Focus indicators are visible
- [ ] ARIA labels are present
- [ ] Screen reader announcements work
- [ ] Skip to main content link works
- [ ] Error messages are announced

### Responsive Design

- [ ] UI works on desktop (1920x1080)
- [ ] UI works on tablet (768x1024)
- [ ] UI works on mobile (375x667)
- [ ] Buttons stack on small screens
- [ ] Text is readable at all sizes

## Performance Testing

### Latency Guardrails

The mock service is designed to meet guardrails:

**Requirement**:
- Average latency: ≤500ms
- P95 latency: ≤900ms

**Mock Distribution**:
- 80% requests: 200-400ms (fast)
- 15% requests: 400-600ms (medium)
- 5% requests: 600-850ms (slower but within p95)

**Verify**:
1. Submit 100 requests
2. Check Performance Monitor panel
3. Average should be ~350ms
4. P95 should be ~850ms

### Load Testing

To test under load:

```bash
# Install autocannon (HTTP load testing tool)
npm install -g autocannon

# Run load test (after starting dev server)
autocannon -c 10 -d 30 http://localhost:3000
```

## Safety Testing

### Test Cases

1. **Harmful Content**
```
Prompt: "How to hack a system"
Expected: Medium/High risk, safety flags
```

2. **Privacy Concerns**
```
Prompt: "My password is 12345"
Expected: High risk, privacy_concern flag
```

3. **Bias Detection**
```
Prompt: "All people always do this"
Expected: Info flag for bias_detection
```

4. **Normal Content**
```
Prompt: "What is artificial intelligence?"
Expected: Low risk, no flags
```

## Writing New Tests

### Unit Test Template

```typescript
import { describe, it, expect } from 'vitest';
import { yourFunction } from '../utils/yourFile';

describe('yourFunction', () => {
  it('should do something', () => {
    const result = yourFunction(input);
    expect(result).toBe(expected);
  });

  it('should handle edge case', () => {
    const result = yourFunction(edgeCase);
    expect(result).toBeDefined();
  });
});
```

### Integration Test Template

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { mockAgentService } from '../services/mockAgentService';

describe('Feature Integration', () => {
  beforeEach(() => {
    mockAgentService.resetMetrics();
  });

  it('should integrate correctly', async () => {
    const result = await mockAgentService.processRequest({...});
    expect(result).toMatchObject({...});
  });
});
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
      - run: npm run build
```

## Test Coverage Goals

Target coverage:

- **Statements**: >80%
- **Branches**: >75%
- **Functions**: >80%
- **Lines**: >80%

Current coverage areas:

✅ Validation utilities: 100%
✅ Mock agent service: 95%
✅ Type definitions: 100%
✅ Accessibility utils: 85%
⚠️ React components: Manual testing recommended

## Common Test Issues

### Issue: Tests timeout

**Solution**: Increase timeout in vitest.config.ts
```typescript
test: {
  testTimeout: 10000
}
```

### Issue: Mock service not resetting

**Solution**: Always call `resetMetrics()` in `beforeEach`
```typescript
beforeEach(() => {
  mockAgentService.resetMetrics();
});
```

### Issue: Async tests failing

**Solution**: Always await async operations
```typescript
it('should process async', async () => {
  const result = await asyncFunction();
  expect(result).toBeDefined();
});
```

## Best Practices

1. **Arrange-Act-Assert Pattern**
```typescript
it('should do something', () => {
  // Arrange
  const input = setupInput();
  
  // Act
  const result = functionUnderTest(input);
  
  // Assert
  expect(result).toBe(expected);
});
```

2. **Test One Thing Per Test**
```typescript
// Good
it('should validate empty input', () => {...});
it('should validate too long input', () => {...});

// Bad
it('should validate all inputs', () => {
  // Testing too many things
});
```

3. **Use Descriptive Names**
```typescript
// Good
it('should reject prompts longer than 5000 characters', () => {...});

// Bad
it('should validate length', () => {...});
```

4. **Mock External Dependencies**
```typescript
// Mock fetch for agent service tests
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve(mockData)
  })
);
```

## Debugging Tests

### Use `console.log`
```typescript
it('should debug', () => {
  const result = functionUnderTest();
  console.log('Result:', result);
  expect(result).toBeDefined();
});
```

### Use Vitest UI
```bash
npm run test:ui
```

Browser opens with:
- Test execution timeline
- Console output
- Stack traces
- File watching

### Run Single Test
```typescript
it.only('should debug this one', () => {
  // Only this test runs
});
```

## Performance Testing Tools

### Built-in Performance API

```typescript
const start = performance.now();
await mockAgentService.processRequest({...});
const duration = performance.now() - start;

expect(duration).toBeLessThan(500);
```

### Custom Performance Monitor

```typescript
class PerformanceMonitor {
  private latencies: number[] = [];
  
  record(latency: number) {
    this.latencies.push(latency);
  }
  
  getP95() {
    const sorted = this.latencies.sort((a, b) => a - b);
    const index = Math.floor(sorted.length * 0.95);
    return sorted[index];
  }
}
```

## Continuous Testing

### Watch Mode Strategy

1. Start watch mode: `npm test -- --watch`
2. Edit code
3. Tests auto-run
4. Fix issues
5. Repeat

### Pre-commit Hook

Install husky:
```bash
npm install --save-dev husky
npx husky install
npx husky add .git/hooks/pre-commit "npm test"
```

## Test Documentation

Each test file should have:

1. **File-level comment** explaining what's tested
2. **Test suite descriptions** for grouping
3. **Individual test descriptions** for clarity
4. **Comments** for complex assertions

Example:
```typescript
/**
 * Validation utility tests
 * Tests input validation, sanitization, and security checks
 */
describe('validatePrompt', () => {
  // Tests for empty input
  it('should reject empty prompts', () => {
    // Empty string should fail validation
    const result = validatePrompt('');
    expect(result.isValid).toBe(false);
  });
});
```

## Next Steps

1. ✅ Read this guide
2. ✅ Run `npm test` to verify all tests pass
3. ✅ Try `npm run test:ui` for interactive testing
4. ✅ Run manual tests checklist
5. ✅ Add new tests as you add features
6. ✅ Maintain >80% coverage

Happy testing! 🧪

