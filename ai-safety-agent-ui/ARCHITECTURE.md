# Architecture Diagram - AI Safety Agent UI

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        AI Safety Agent UI                        │
│                      (UNICC Sandbox Integration)                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                           Frontend Layer                         │
├─────────────────────────────────────────────────────────────────┤
│  React 18 + TypeScript + Vite                                   │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐   │
│  │   Components    │  │     Hooks       │  │    Services     │   │
│  │                 │  │                 │  │                 │   │
│  │ • AgentInterface│  │ • useAgentService│  │ • agentService  │   │
│  │ • StatusIndicator│  │                 │  │ • mockAgentService│ │
│  │ • SafetyFlags   │  │                 │  │                 │   │
│  │ • RiskBadge     │  │                 │  │                 │   │
│  │ • PerfMonitor   │  │                 │  │                 │   │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         Business Logic                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐   │
│  │   Validation    │  │ Accessibility   │  │   Type Safety   │   │
│  │                 │  │                 │  │                 │   │
│  │ • Input sanitize│  │ • ARIA labels   │  │ • TypeScript    │   │
│  │ • Pattern detect│  │ • Keyboard nav  │  │ • Strict mode   │   │
│  │ • Length check  │  │ • Screen reader │  │ • Type guards   │   │
│  │ • Rate limiting │  │ • Focus mgmt    │  │ • Interfaces    │   │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        Testing Layer                             │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐   │
│  │   Unit Tests    │  │ Integration     │  │ Performance     │   │
│  │                 │  │ Tests           │  │ Tests           │   │
│  │ • Validation    │  │ • Mock Service  │  │ • Latency       │   │
│  │ • Utilities     │  │ • API Client    │  │ • Guardrails    │   │
│  │ • Sanitization  │  │ • Error Handling│  │ • Metrics       │   │
│  │ • Rate Limiting │  │ • Connection    │  │ • P95 Tracking  │   │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      Integration Layer                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐                    ┌─────────────────┐   │
│  │   Mock Mode     │                    │  Production     │   │
│  │                 │                    │  Mode           │   │
│  │ • Realistic     │                    │                 │   │
│  │   responses     │                    │ • Real AI Agent │   │
│  │ • Safety        │                    │ • HTTP/REST API │   │
│  │   simulation    │                    │ • JSON Protocol │   │
│  │ • Performance   │                    │ • Error Handling│   │
│  │   simulation    │                    │ • Timeout Mgmt  │   │
│  │ • Independent   │                    │                 │   │
│  │   testing       │                    │                 │   │
│  └─────────────────┘                    └─────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        External Systems                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐                    ┌─────────────────┐   │
│  │   AI Agent      │                    │   UNICC         │   │
│  │   (Backend)     │                    │   Sandbox       │   │
│  │                 │                    │                 │   │
│  │ • /health       │                    │ • Deployment    │   │
│  │ • /process      │                    │ • Environment   │   │
│  │ • Safety        │                    │ • Monitoring    │   │
│  │   Analysis      │                    │ • Security      │   │
│  │ • Risk          │                    │                 │   │
│  │   Assessment    │                    │                 │   │
│  │ • Performance   │                    │                 │   │
│  │   Monitoring    │                    │                 │   │
│  └─────────────────┘                    └─────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Request Flow                              │
└─────────────────────────────────────────────────────────────────┘

User Input
    ↓
┌─────────────────┐
│   Validation    │ ← Input sanitization, pattern detection
└─────────────────┘
    ↓
┌─────────────────┐
│   UI State      │ ← Loading state, error handling
└─────────────────┘
    ↓
┌─────────────────┐
│   Service       │ ← Mock or Real agent service
└─────────────────┘
    ↓
┌─────────────────┐
│   AI Agent      │ ← /process endpoint
└─────────────────┘
    ↓
┌─────────────────┐
│   Response      │ ← Safety analysis, risk assessment
└─────────────────┘
    ↓
┌─────────────────┐
│   UI Display    │ ← Risk badges, safety flags, metrics
└─────────────────┘
    ↓
┌─────────────────┐
│   Performance   │ ← Latency tracking, guardrail monitoring
└─────────────────┘
```

## 🎯 Component Hierarchy

```
App
├── AgentInterface (Main Container)
│   ├── StatusIndicator
│   │   ├── Connection Status
│   │   ├── Version Info
│   │   └── Refresh Button
│   │
│   ├── Form Section
│   │   ├── Textarea (Prompt Input)
│   │   ├── Validation Errors
│   │   ├── Send Button
│   │   └── Clear Button
│   │
│   ├── Response Section
│   │   ├── RiskLevelBadge
│   │   ├── Response Content
│   │   ├── SafetyFlagDisplay
│   │   └── Processing Time
│   │
│   └── PerformanceMonitor
│       ├── Request Count
│       ├── Latency Metrics
│       ├── Guardrail Indicators
│       └── Performance Warnings
```

## 🔧 Service Architecture

```
useAgentService Hook
├── State Management
│   ├── Connection Status
│   ├── Loading State
│   ├── Error Handling
│   ├── Response Data
│   └── Performance Metrics
│
├── Service Layer
│   ├── agentService (Real)
│   │   ├── checkConnection()
│   │   ├── processRequest()
│   │   └── getPerformanceMetrics()
│   │
│   └── mockAgentService (Testing)
│       ├── checkConnection()
│       ├── processRequest()
│       ├── getPerformanceMetrics()
│       └── resetMetrics()
│
└── Utility Functions
    ├── validatePrompt()
    ├── sanitizeInput()
    ├── announceToScreenReader()
    └── trapFocus()
```

## 🛡️ Safety Architecture

```
Input Processing Pipeline
├── Sanitization
│   ├── Remove control characters
│   ├── Normalize whitespace
│   └── Filter dangerous patterns
│
├── Validation
│   ├── Length checks
│   ├── Pattern detection
│   ├── Rate limiting
│   └── Security scanning
│
├── Safety Analysis
│   ├── Content Policy
│   ├── Privacy Detection
│   ├── Bias Detection
│   ├── Harmful Content
│   └── Misinformation
│
└── Risk Assessment
    ├── LOW (Safe)
    ├── MEDIUM (Caution)
    ├── HIGH (Review)
    └── CRITICAL (Block)
```

## ⚡ Performance Architecture

```
Performance Monitoring
├── Request Tracking
│   ├── Start Time
│   ├── End Time
│   ├── Duration
│   └── Timestamp
│
├── Metrics Calculation
│   ├── Average Latency
│   ├── P95 Latency
│   ├── Request Count
│   └── Error Rate
│
├── Guardrail Monitoring
│   ├── 500ms Average Limit
│   ├── 900ms P95 Limit
│   ├── Real-time Warnings
│   └── Performance Alerts
│
└── Optimization
    ├── Code Splitting
    ├── Lazy Loading
    ├── Bundle Optimization
    └── Caching Strategy
```

## ♿ Accessibility Architecture

```
Accessibility Features
├── Keyboard Navigation
│   ├── Tab Order
│   ├── Focus Management
│   ├── Skip Links
│   └── Keyboard Shortcuts
│
├── Screen Reader Support
│   ├── ARIA Labels
│   ├── Live Regions
│   ├── Status Announcements
│   └── Semantic HTML
│
├── Visual Accessibility
│   ├── High Contrast
│   ├── Color Independence
│   ├── Focus Indicators
│   └── Reduced Motion
│
└── Cognitive Accessibility
    ├── Clear Labels
    ├── Error Messages
    ├── Progress Indicators
    └── Consistent Patterns
```

## 🧪 Testing Architecture

```
Testing Strategy
├── Unit Tests
│   ├── Validation Logic
│   ├── Utility Functions
│   ├── Type Guards
│   └── Helper Functions
│
├── Integration Tests
│   ├── Service Communication
│   ├── Mock Agent Service
│   ├── Error Handling
│   └── State Management
│
├── Performance Tests
│   ├── Latency Verification
│   ├── Guardrail Compliance
│   ├── Memory Usage
│   └── Bundle Size
│
└── Accessibility Tests
    ├── Keyboard Navigation
    ├── Screen Reader
    ├── Color Contrast
    └── Focus Management
```

## 📦 Build Architecture

```
Build Pipeline
├── Development
│   ├── Vite Dev Server
│   ├── Hot Module Replacement
│   ├── TypeScript Compilation
│   └── CSS Processing
│
├── Testing
│   ├── Vitest Test Runner
│   ├── jsdom Environment
│   ├── Coverage Reports
│   └── Watch Mode
│
├── Production Build
│   ├── Code Splitting
│   ├── Tree Shaking
│   ├── Minification
│   ├── Asset Optimization
│   └── Source Maps
│
└── Deployment
    ├── Static Assets
    ├── Environment Config
    ├── CDN Ready
    └── UNICC Compatible
```

## 🔄 Integration Flow

```
AI Agent Integration
├── Development Phase
│   ├── Mock Service Active
│   ├── Independent Testing
│   ├── Feature Development
│   └── UI Refinement
│
├── Integration Phase
│   ├── API Contract Review
│   ├── Endpoint Implementation
│   ├── Connection Testing
│   └── Performance Validation
│
├── Production Phase
│   ├── Real Agent Connection
│   ├── Performance Monitoring
│   ├── Error Handling
│   └── User Testing
│
└── Deployment Phase
    ├── UNICC Sandbox
    ├── Environment Config
    ├── Monitoring Setup
    └── Performance Tracking
```

## 📊 Monitoring Architecture

```
Real-time Monitoring
├── Connection Status
│   ├── Health Checks
│   ├── Heartbeat Monitoring
│   ├── Reconnection Logic
│   └── Status Indicators
│
├── Performance Metrics
│   ├── Latency Tracking
│   ├── Throughput Monitoring
│   ├── Error Rate Tracking
│   └── Resource Usage
│
├── Safety Monitoring
│   ├── Risk Level Tracking
│   ├── Safety Flag Analysis
│   ├── Content Policy Violations
│   └── Privacy Breach Detection
│
└── User Experience
    ├── Response Time
    ├── Error Recovery
    ├── Accessibility Compliance
    └── Feature Usage
```

---

## 🎯 Architecture Benefits

### ✅ Modular Design
- Clear separation of concerns
- Reusable components
- Testable units
- Maintainable code

### ✅ Scalable Architecture
- Service-oriented design
- Configurable endpoints
- Performance monitoring
- Error handling

### ✅ Accessible Design
- WCAG 2.1 AA compliant
- Keyboard navigation
- Screen reader support
- Inclusive UX

### ✅ Performance Optimized
- Guardrail compliance
- Real-time monitoring
- Bundle optimization
- Efficient rendering

### ✅ Production Ready
- Type safety
- Error boundaries
- Comprehensive testing
- Documentation

---

**This architecture supports:**
- ✅ Independent frontend development
- ✅ Easy AI agent integration
- ✅ Performance guardrail compliance
- ✅ Accessibility standards
- ✅ Production deployment
- ✅ Team collaboration

