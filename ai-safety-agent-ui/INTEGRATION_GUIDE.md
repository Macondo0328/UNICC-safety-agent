# AI Safety Agent Integration Guide

This guide helps you integrate the UI with your actual AI agent implementation.

## Integration Steps

### Step 1: Understand the Architecture

```
┌─────────────┐      HTTP/REST      ┌──────────────┐
│   React UI  │ ◄─────────────────► │  AI Agent    │
│  (Frontend) │     JSON API        │  (Backend)   │
└─────────────┘                     └──────────────┘
```

The UI communicates with the AI agent via REST API:
- Health checks every 30 seconds
- Request/response for AI processing
- Real-time performance monitoring

### Step 2: Implement Required Endpoints

Your AI agent must implement these two endpoints:

#### 1. Health Check Endpoint

**Endpoint**: `GET /health`

**Purpose**: Verify agent is alive and ready

**Response Format**:
```json
{
  "isConnected": true,
  "version": "1.0.0",
  "capabilities": [
    "text-analysis",
    "safety-check",
    "risk-assessment"
  ]
}
```

**Example Implementation (Python/FastAPI)**:
```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/health")
async def health_check():
    return {
        "isConnected": True,
        "version": "1.0.0",
        "capabilities": [
            "text-analysis",
            "safety-check",
            "risk-assessment"
        ]
    }
```

#### 2. Process Request Endpoint

**Endpoint**: `POST /process`

**Purpose**: Process user prompts and return AI responses with safety analysis

**Request Format**:
```json
{
  "id": "req-123456789-abc",
  "prompt": "User's input text",
  "context": {},
  "timestamp": 1697123456789,
  "userId": "optional-user-id",
  "sessionId": "session-123456789-xyz"
}
```

**Response Format**:
```json
{
  "id": "resp-123456789-def",
  "requestId": "req-123456789-abc",
  "content": "AI agent's response text",
  "confidence": 0.95,
  "riskLevel": "low",
  "safetyFlags": [
    {
      "type": "bias_detection",
      "severity": "info",
      "message": "Potential bias detected",
      "details": "Additional context about the flag"
    }
  ],
  "processingTime": 342,
  "timestamp": 1697123456999
}
```

**Field Descriptions**:
- `id`: Unique response identifier
- `requestId`: Original request ID (for tracking)
- `content`: Your AI's response to the prompt
- `confidence`: 0.0-1.0 confidence score
- `riskLevel`: One of: "low", "medium", "high", "critical"
- `safetyFlags`: Array of safety concerns detected
- `processingTime`: Time taken in milliseconds
- `timestamp`: Response timestamp

**Example Implementation (Python/FastAPI)**:
```python
from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import time

app = FastAPI()

class SafetyFlag(BaseModel):
    type: str
    severity: str
    message: str
    details: Optional[str] = None

class AIRequest(BaseModel):
    id: str
    prompt: str
    context: Optional[Dict[str, Any]] = None
    timestamp: int
    userId: Optional[str] = None
    sessionId: Optional[str] = None

class AIResponse(BaseModel):
    id: str
    requestId: str
    content: str
    confidence: float
    riskLevel: str
    safetyFlags: List[SafetyFlag]
    processingTime: float
    timestamp: int

@app.post("/process")
async def process_request(request: AIRequest):
    start_time = time.time()
    
    # Your AI processing logic here
    ai_response = your_ai_model.process(request.prompt)
    safety_analysis = your_safety_checker.analyze(request.prompt)
    
    processing_time = (time.time() - start_time) * 1000  # Convert to ms
    
    return AIResponse(
        id=f"resp-{int(time.time())}-xyz",
        requestId=request.id,
        content=ai_response,
        confidence=0.95,
        riskLevel=safety_analysis.risk_level,
        safetyFlags=safety_analysis.flags,
        processingTime=processing_time,
        timestamp=int(time.time() * 1000)
    )
```

### Step 3: Configure CORS

Your AI agent must allow requests from the UI:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # UI dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Step 4: Performance Requirements

**Critical**: Your AI agent must meet these guardrails:

- ✅ **Average latency**: ≤500ms
- ✅ **P95 latency**: ≤900ms

**Tips to meet guardrails**:

1. **Optimize AI model inference**
   - Use model quantization
   - Batch processing where possible
   - GPU acceleration

2. **Implement caching**
   ```python
   from functools import lru_cache
   
   @lru_cache(maxsize=1000)
   def process_common_prompt(prompt: str):
       # Cache frequent prompts
       return ai_model.process(prompt)
   ```

3. **Use async processing**
   ```python
   import asyncio
   
   async def process_request(request):
       # Non-blocking AI processing
       result = await asyncio.to_thread(ai_model.process, request.prompt)
       return result
   ```

4. **Monitor performance**
   ```python
   import time
   
   @app.middleware("http")
   async def add_process_time_header(request, call_next):
       start_time = time.time()
       response = await call_next(request)
       process_time = (time.time() - start_time) * 1000
       
       if process_time > 500:
           print(f"⚠️ Slow request: {process_time:.2f}ms")
       
       return response
   ```

### Step 5: Implement Safety Analysis

Your AI agent should analyze prompts for:

1. **Content Policy Violations**
   - Harmful instructions
   - Violence
   - Illegal activities

2. **Privacy Concerns**
   - Personal information (PII)
   - Passwords or credentials
   - Financial data

3. **Bias Detection**
   - Stereotypes
   - Discriminatory language
   - Unfair generalizations

4. **Misinformation**
   - False claims
   - Conspiracy theories
   - Misleading information

**Example Safety Checker**:
```python
class SafetyChecker:
    def analyze(self, prompt: str):
        flags = []
        risk_level = "low"
        
        # Check for harmful keywords
        harmful_keywords = ["hack", "exploit", "attack"]
        if any(kw in prompt.lower() for kw in harmful_keywords):
            flags.append(SafetyFlag(
                type="harmful_content",
                severity="warning",
                message="Prompt contains potentially harmful keywords"
            ))
            risk_level = "medium"
        
        # Check for PII
        if re.search(r'\b\d{3}-\d{2}-\d{4}\b', prompt):  # SSN pattern
            flags.append(SafetyFlag(
                type="privacy_concern",
                severity="error",
                message="Prompt may contain sensitive personal information"
            ))
            risk_level = "high"
        
        return {
            "flags": flags,
            "risk_level": risk_level
        }
```

### Step 6: Connect UI to Your Agent

1. Update the `.env` file:
```bash
VITE_AI_AGENT_API_URL=http://localhost:8000
VITE_USE_MOCK=false
```

2. Restart the UI:
```bash
npm run dev
```

3. Test the integration:
   - Check connection status indicator
   - Send a test prompt
   - Verify response appears
   - Check performance metrics

### Step 7: Testing the Integration

Create integration tests:

```bash
# Test health endpoint
curl http://localhost:8000/health

# Test process endpoint
curl -X POST http://localhost:8000/process \
  -H "Content-Type: application/json" \
  -d '{
    "id": "test-1",
    "prompt": "Hello, AI agent",
    "timestamp": 1697123456789
  }'
```

Expected health response:
```json
{
  "isConnected": true,
  "version": "1.0.0",
  "capabilities": ["text-analysis", "safety-check", "risk-assessment"]
}
```

## Common Integration Issues

### Issue 1: CORS Errors

**Symptom**: Console shows "CORS policy" error

**Solution**: Add CORS middleware to your AI agent (see Step 3)

### Issue 2: Timeout Errors

**Symptom**: Requests fail after 5 seconds

**Solution**: 
- Optimize AI processing to be faster
- Increase timeout in `src/services/agentService.ts`:
  ```typescript
  private timeout: number = 10000; // 10 seconds
  ```

### Issue 3: Connection Shows "Disconnected"

**Symptom**: Status indicator is red

**Solutions**:
1. Verify agent is running: `curl http://localhost:8000/health`
2. Check URL in `.env` file
3. Check browser console for errors
4. Verify CORS is configured

### Issue 4: Slow Performance

**Symptom**: Performance warnings appear

**Solutions**:
1. Profile your AI processing
2. Implement caching
3. Use async/await properly
4. Consider using a message queue for long operations

## Advanced Integration

### WebSocket Support (Optional)

For real-time updates, implement WebSocket:

```typescript
// In src/services/agentService.ts
class AgentService {
  private ws: WebSocket | null = null;

  connectWebSocket() {
    this.ws = new WebSocket('ws://localhost:8000/ws');
    
    this.ws.onmessage = (event) => {
      const update = JSON.parse(event.data);
      // Handle real-time updates
    };
  }
}
```

### Authentication (Optional)

Add authentication headers:

```typescript
const response = await fetch(`${this.apiEndpoint}/process`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(request)
});
```

### Load Balancing (Production)

For high traffic:

```
┌─────────┐      ┌──────────┐
│   UI    │ ────►│  LB      │
└─────────┘      └──────────┘
                  ↓    ↓    ↓
              ┌────┐ ┌────┐ ┌────┐
              │ A1 │ │ A2 │ │ A3 │
              └────┘ └────┘ └────┘
```

Update `.env`:
```bash
VITE_AI_AGENT_API_URL=https://ai-agent-lb.example.com
```

## Deployment Checklist

- [ ] AI agent implements `/health` endpoint
- [ ] AI agent implements `/process` endpoint
- [ ] CORS is configured correctly
- [ ] Performance meets guardrails (≤500ms avg, ≤900ms p95)
- [ ] Safety analysis is implemented
- [ ] Error handling is robust
- [ ] Logging is configured
- [ ] Load testing is performed
- [ ] UI `.env` is configured
- [ ] Integration tests pass

## Support

If you encounter issues during integration:

1. Check the browser console for errors
2. Check your AI agent logs
3. Use the mock service to verify UI functionality
4. Test endpoints independently with curl/Postman
5. Review this guide and README.md

## Next Steps

After successful integration:

1. **Performance Optimization**: Monitor and optimize latency
2. **Enhanced Safety**: Improve safety detection algorithms
3. **User Testing**: Gather feedback from users
4. **Monitoring**: Set up monitoring and alerting
5. **Documentation**: Document your AI agent's specific features

