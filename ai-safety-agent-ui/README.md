# AI Safety Agent UI - UNICC Sandbox Integration

A production-ready UI integration for AI safety agents designed for use in the UNICC sandbox environment. Built with React, TypeScript, and comprehensive accessibility features.

## 🎯 Key Features

### Performance Guardrails
- **Average latency**: ≤500ms (enforced)
- **P95 latency**: ≤900ms (enforced)
- Real-time performance monitoring
- Latency warnings when approaching guardrails

### AI Safety & Risk Management
- Multi-level risk assessment (Low, Medium, High, Critical)
- Real-time safety flag detection
- Content policy enforcement
- Privacy concern detection
- Bias detection
- Harmful content filtering

### Accessibility (WCAG 2.1 AA Compliant)
- Full keyboard navigation support
- Screen reader compatible (ARIA labels)
- Focus management and skip links
- High contrast mode support
- Reduced motion support
- Semantic HTML structure

### Developer Experience
- Mock AI agent service for testing
- Comprehensive validation tests
- TypeScript for type safety
- Hot module replacement
- Easy integration with actual AI agent

## 📋 Prerequisites

- Node.js 16+ and npm/yarn
- Modern web browser
- (Optional) AI agent API endpoint

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd /Users/s/ai-safety-agent-ui
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### 3. Run Tests

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run with coverage
npm test -- --coverage
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

```bash
# Use mock service (default for development)
VITE_USE_MOCK=true

# When connecting to actual AI agent:
VITE_AI_AGENT_API_URL=http://your-ai-agent-url:8000
VITE_USE_MOCK=false
```

### Connecting Your AI Agent

The UI is designed to work with or without an actual AI agent:

1. **Mock Mode (Default)**: Perfect for development and testing
   - Set `VITE_USE_MOCK=true`
   - Uses built-in mock service with realistic responses

2. **Production Mode**: Connect to your actual AI agent
   - Set `VITE_AI_AGENT_API_URL` to your agent's URL
   - Set `VITE_USE_MOCK=false`
   - Ensure your agent implements the required API endpoints

### Required AI Agent API Endpoints

Your AI agent should implement these endpoints:

#### Health Check
```
GET /health
Response: {
  isConnected: boolean,
  version: string,
  capabilities: string[]
}
```

#### Process Request
```
POST /process
Body: {
  id: string,
  prompt: string,
  context?: Record<string, unknown>,
  timestamp: number,
  userId?: string,
  sessionId?: string
}
Response: {
  id: string,
  requestId: string,
  content: string,
  confidence: number,
  riskLevel: 'low' | 'medium' | 'high' | 'critical',
  safetyFlags: Array<{
    type: string,
    severity: string,
    message: string,
    details?: string
  }>,
  processingTime: number,
  timestamp: number
}
```

## 📁 Project Structure

```
ai-safety-agent-ui/
├── src/
│   ├── components/          # React components
│   │   ├── AgentInterface.tsx
│   │   ├── StatusIndicator.tsx
│   │   ├── SafetyFlagDisplay.tsx
│   │   ├── RiskLevelBadge.tsx
│   │   └── PerformanceMonitor.tsx
│   ├── services/           # API services
│   │   ├── agentService.ts
│   │   └── mockAgentService.ts
│   ├── hooks/              # Custom React hooks
│   │   └── useAgentService.ts
│   ├── types/              # TypeScript types
│   │   └── index.ts
│   ├── utils/              # Utility functions
│   │   ├── validation.ts
│   │   └── accessibility.ts
│   ├── styles/             # Global styles
│   │   └── index.css
│   └── tests/              # Test files
│       ├── validation.test.ts
│       ├── mockAgentService.test.ts
│       └── setup.ts
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
└── README.md
```

## 🧪 Testing

### Unit Tests

```bash
# Run all tests
npm test

# Watch mode
npm test -- --watch

# Coverage report
npm test -- --coverage
```

### Manual Testing Checklist

- [ ] Connection status indicator updates correctly
- [ ] Form validation works (empty, too long, dangerous patterns)
- [ ] Requests process within latency guardrails
- [ ] Risk levels display correctly
- [ ] Safety flags appear for harmful content
- [ ] Performance metrics update in real-time
- [ ] Keyboard navigation works throughout
- [ ] Screen reader announces status changes
- [ ] Error handling displays appropriate messages

### Performance Testing

The mock service is designed to meet the guardrails:
- 80% of requests: 200-400ms
- 15% of requests: 400-600ms
- 5% of requests: 600-850ms

This ensures:
- Average latency: ~350ms (well below 500ms guardrail)
- P95 latency: ~850ms (below 900ms guardrail)

## 🎨 Customization

### Styling

All styles use CSS custom properties (variables) defined in `src/styles/index.css`. You can customize:

- Color palette
- Typography
- Spacing
- Borders and shadows
- Transitions

### Risk Levels

Modify risk level thresholds in `src/services/mockAgentService.ts`:

```typescript
private analyzeSafety(prompt: string) {
  // Customize safety analysis logic here
}
```

### Validation Rules

Customize validation in `src/utils/validation.ts`:

```typescript
export function validatePrompt(prompt: string): ValidationResult {
  // Add your custom validation rules
}
```

## 🔒 Security Features

- Input sanitization (removes control characters, XSS attempts)
- Dangerous pattern detection (eval, exec, script tags)
- Rate limiting check
- Privacy concern detection
- Content policy enforcement

## ♿ Accessibility Features

- WCAG 2.1 AA compliant
- Full keyboard navigation (Tab, Enter, Escape)
- Screen reader support with ARIA labels
- Skip to main content link
- Focus indicators on all interactive elements
- High contrast mode support
- Reduced motion support
- Semantic HTML structure

## 📊 Performance Monitoring

Real-time metrics displayed in the UI:
- Request count
- Last request latency
- Average latency (with 500ms guardrail indicator)
- P95 latency (with 900ms guardrail indicator)

Warnings appear automatically when guardrails are exceeded.

## 🤝 Integration with Your Team

Since this is a group project, here's how to integrate:

1. **Frontend Team**: Use the UI as-is, customize styling/components as needed
2. **Backend/AI Team**: Implement the required API endpoints (see above)
3. **Testing Team**: Run the validation tests and add integration tests
4. **DevOps Team**: Use the build output for deployment

### Connecting to Teammate's AI Agent

When your teammate's AI agent is ready:

```bash
# Update .env file
VITE_AI_AGENT_API_URL=http://teammate-agent-url:8000
VITE_USE_MOCK=false

# Restart dev server
npm run dev
```

## 📦 Building for Production

```bash
# Build optimized production bundle
npm run build

# Preview production build
npm run preview
```

Output will be in the `dist/` directory.

## 🐛 Troubleshooting

### Connection Issues
- Ensure `VITE_AI_AGENT_API_URL` is correct
- Check CORS settings on your AI agent
- Verify network connectivity
- Check browser console for errors

### Performance Issues
- Monitor the Performance Metrics panel
- Check if AI agent is responding slowly
- Verify no other processes are blocking
- Check browser DevTools Network tab

### Build Issues
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear cache: `npm run build -- --force`
- Check Node.js version: `node --version` (should be 16+)

## 📝 License

MIT

## 👥 Team Collaboration

This UI is designed for easy integration with your AI agent implementation:

- ✅ Works standalone with mock service
- ✅ Easy to connect to actual AI agent
- ✅ Comprehensive documentation
- ✅ Type-safe interfaces
- ✅ Extensive testing
- ✅ Performance guardrails enforced
- ✅ Production-ready

## 🔗 Additional Resources

- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Vite Documentation](https://vitejs.dev)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)

## 📞 Support

For questions or issues:
1. Check this README
2. Review the code comments
3. Run tests to verify functionality
4. Check browser console for errors

# ai-safety-agent-ui
# ai-safety-agent-ui
# ai-safety-agent-ui
# ai-safety-agent-ui
