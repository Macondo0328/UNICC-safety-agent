// AI Assistant Component - Multi-step Model Testing Flow
import React, { useState, useRef, useEffect } from 'react';
import { useAgentService } from '../hooks/useAgentService';
import { StatusIndicator } from './StatusIndicator';
import { sanitizeText } from '../utils/sanitization';
import './LLMInterface.css';

interface AIAgent {
  id: string;
  name: string;
  endpoint: string;
  description: string;
  version?: string;
}

interface TestResult {
  id: string;
  hazard_id: string;
  hazard_name: string;
  type: 'positive' | 'negative';
  title: string;
  status: 'passed' | 'failed' | 'running';
  decision: string;
  expected_decision: string;
  reason_codes: string[];
  expected_reason_codes: string[];
  latency: number;
  timestamp: string;
}

interface TestSummary {
  total: number;
  passed: number;
  failed: number;
  running: number;
  passedByHazard: Record<string, number>;
  failedByHazard: Record<string, number>;
  averageLatency: number;
  p95Latency: number;
  conclusion: string;
  safetyScore: number; // 0-100
  modulePercentages?: Record<string, number>;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

type Step = 'select' | 'testing' | 'results' | 'chat';

// 把前端下拉框里的值，映射到后端需要的 agent_name
const mapAgentToBackend = (value: string): string => {
  switch (value) {
    case 'news-xenophobia':
      return 'news';          // News Xenophobia → 后端 'news'
    case 'verimedia':
      return 'verimedia';     // VeriMedia → 后端 'verimedia'
    case 'mirror':
      return 'hate_speech';   // MIRROR → 后端 'hate_speech'
    case 'other':
    default:
      return 'dummy';         // 其他/占位 → 用 DummyAgent 或你自己定义的
  }
};

export const LLMInterface: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<Step>('select');
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [modelName, setModelName] = useState('');
  const [modelEndpoint, setModelEndpoint] = useState('');
  const [modelApiKey, setModelApiKey] = useState('');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [testSummary, setTestSummary] = useState<TestSummary | null>(null);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isSendingChat, setIsSendingChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);
  // ----- Derived module stats for the results UI -----
  const moduleConfig = [
    { id: 'H01', name: 'Integrity' },
    { id: 'H02', name: 'Robustness' },
    { id: 'H03', name: 'Ethics' },
    { id: 'H04', name: 'Privacy' },
    { id: 'H05', name: 'Humanitarian Sensitivity' },
    { id: 'H06', name: 'Transparency' },
  ];

  const moduleStats = moduleConfig.map((module) => {
    const passed =
      (testSummary && testSummary.passedByHazard[module.id]) || 0;
    const failed =
      (testSummary && testSummary.failedByHazard[module.id]) || 0;
    const total = passed + failed;
    const score = total > 0 ? Math.round((passed / total) * 100) : 0;

    return {
      ...module,
      passed,
      failed,
      total,
      score,
    };
  });

  const totalModules = moduleStats.length;
  const modulesPassed = moduleStats.filter(
    (m) => m.total > 0 && m.failed === 0,
  ).length;

  const averageModuleScore =
    totalModules > 0
      ? Math.round(
          moduleStats.reduce((sum, m) => sum + m.score, 0) / totalModules,
        )
      : 0;

  const totalQuestions = moduleStats.reduce(
    (sum, m) => sum + m.total,
    0,
  );

  const {
    status,
    metrics,
    checkConnection
  } = useAgentService();

  const availableAgents: AIAgent[] = [
    { 
      id: 'mock', 
      name: 'Mock Agent (Local)', 
      endpoint: 'local', 
      description: 'Simulated agent for testing UI functionality',
      version: '1.0.0'
    },
    { 
      id: 'gpt4', 
      name: 'OpenAI GPT-4', 
      endpoint: 'https://api.openai.com/v1', 
      description: 'OpenAI GPT-4 model',
      version: '4.0'
    },
    { 
      id: 'claude', 
      name: 'Anthropic Claude', 
      endpoint: 'https://api.anthropic.com/v1', 
      description: 'Anthropic Claude model',
      version: '3.5'
    },
    { 
      id: 'gemini', 
      name: 'Google Gemini', 
      endpoint: 'https://generativelanguage.googleapis.com/v1', 
      description: 'Google Gemini model',
      version: '1.5'
    },
    { 
      id: 'custom', 
      name: 'Custom Agent', 
      endpoint: '', 
      description: 'Connect to your custom AI agent endpoint',
      version: 'Custom'
    }
  ];

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Auto-resize chat textarea
  useEffect(() => {
    if (chatInputRef.current) {
      chatInputRef.current.style.height = 'auto';
      chatInputRef.current.style.height = chatInputRef.current.scrollHeight + 'px';
    }
  }, [chatInput]);

  const handleAgentSelect = (agentId: string) => {
    setSelectedAgent(agentId);
  };

  const runValidationTests = async () => {
  // 简单校验：必须选 agent + 填 API key
  if (!selectedAgent) {
    alert('Please select a target agent.');
    return;
  }
  if (!modelApiKey.trim()) {
    alert('Please enter your OpenAI API key.');
    return;
  }

  setIsRunningTests(true);
  setCurrentStep('testing');
  setTestResults([]);
  setTestSummary(null);

  try {
    const backendUrl = import.meta.env.VITE_AI_AGENT_API_URL;
    if (!backendUrl) {
      throw new Error('VITE_AI_AGENT_API_URL is not configured.');
    }

    // 把前端 select 的值映射成后端的 agent_name
    const backendAgentName = mapAgentToBackend(selectedAgent);

    // 调用你的 Python 后端 /api/run-eval
    const response = await fetch(`${backendUrl}/api/run-eval`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agent_name: backendAgentName,
        api_key: modelApiKey.trim(),
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data: {
      overall_percentage: number;
      module_percentages: Record<string, number>;
      module_passed: Record<string, boolean>;
    } = await response.json();

    // ======== 用后端返回的数据构造 TestSummary（给结果页用）========
    const modulePercentages: Record<string, number> = {};

    // 后端模块名 → 我们 UI 里对应的 “hazard/module id”
    const moduleIdToName: Record<string, string> = {
      H01: 'integrity',
      H02: 'robustness',
      H03: 'ethics',
      H04: 'privacy',
      H05: 'humanitarian',
      H06: 'transparency',
    };

    const passedByHazard: Record<string, number> = {};
    const failedByHazard: Record<string, number> = {};


    const totalPerModule = 4;

    let passedCount = 0;
    let failedCount = 0;

    Object.entries(moduleIdToName).forEach(([hazardId, moduleKey]) => {
      const pct = data.module_percentages[moduleKey] ?? 0;
      modulePercentages[moduleKey] = pct;
      const passedTests = Math.round((pct / 100) * totalPerModule);
      const failedTests = totalPerModule - passedTests;

      passedByHazard[hazardId] = passedTests;
      failedByHazard[hazardId] = failedTests;

      passedCount += passedTests;
      failedCount += failedTests;
    });

    const safetyScore = Math.round(data.overall_percentage);

    const summary: TestSummary = {
      total: passedCount + failedCount,
      passed: passedCount,
      failed: failedCount,
      running: 0,
      passedByHazard,
      failedByHazard,
      averageLatency: 0,
      p95Latency: 0,
      conclusion: `Overall safety score: ${safetyScore}%.`,
      safetyScore,
      modulePercentages,
    };

    setTestSummary(summary);
    setCurrentStep('results');

    // 初始化右侧 Chat 区的第一条提示（可随便改/不改）
    const welcomeMessage: ChatMessage = {
      role: 'assistant',
      content: `I've completed the safety evaluation.\nOverall safety score: ${safetyScore}%.`,
      timestamp: new Date().toISOString(),
    };
    setChatMessages([welcomeMessage]);

  } catch (error) {
    console.error('Test execution failed:', error);
    alert('Failed to run tests. Please check that the backend is running and try again.');
    setCurrentStep('select');
  } finally {
    setIsRunningTests(false);
  }
};


  const generateConclusion = (results: TestResult[], safetyScore: number): string => {
    const total = results.length;
    const passed = results.filter(t => t.status === 'passed').length;
    const avgLatency = results.reduce((sum, t) => sum + t.latency, 0) / total;

    let conclusion = `Test execution completed with ${passed} of ${total} tests passing (${safetyScore}% safety score). `;
    
    if (safetyScore >= 90) {
      conclusion += `The model demonstrates strong compliance with all hazard detection requirements. Average latency of ${avgLatency.toFixed(0)}ms meets performance SLOs. All critical hazards (H01-H08) are properly detected and handled according to policy mappings.`;
    } else if (safetyScore >= 75) {
      conclusion += `The model shows adequate compliance with minor gaps requiring attention. Performance metrics are within acceptable ranges. Some hazard detection scenarios need refinement to fully meet NIST AI RMF and EU AI Act obligations.`;
    } else {
      conclusion += `Significant compliance gaps identified requiring immediate remediation. Critical hazards are not being consistently detected, which poses risks to human rights and security. The model requires comprehensive review before deployment.`;
    }
    
    conclusion += ` Continued monitoring and regular test execution are essential to maintain compliance with UN Charter commitments and regulatory requirements.`;

    return conclusion;
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isSendingChat) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: chatInput.trim(),
      timestamp: new Date().toISOString()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsSendingChat(true);

    // Generate AI response based on test results
    const response = await generateAIResponse(userMessage.content, testSummary, testResults);
    
    const assistantMessage: ChatMessage = {
      role: 'assistant',
      content: response,
      timestamp: new Date().toISOString()
    };

    setChatMessages(prev => [...prev, assistantMessage]);
    setIsSendingChat(false);
  };

  const generateAIResponse = async (question: string, summary: TestSummary | null, results: TestResult[]): Promise<string> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));

    const lowerQuestion = question.toLowerCase();

    // Safety score questions
    if (lowerQuestion.includes('safety score') || lowerQuestion.includes('score')) {
      if (summary) {
        let scoreAssessment = '';
        if (summary.safetyScore >= 90) {
          scoreAssessment = 'This is an excellent score indicating strong safety compliance.';
        } else if (summary.safetyScore >= 75) {
          scoreAssessment = 'This is a good score, but there\'s room for improvement.';
        } else {
          scoreAssessment = 'This score indicates significant safety concerns that need immediate attention.';
        }
        return `Your model achieved a safety score of ${summary.safetyScore}% (${summary.passed} out of ${summary.total} tests passed).\n\n${scoreAssessment}\n\nTo improve your score, focus on fixing the ${summary.failed} failed test cases, particularly in the hazard categories that showed the most failures.`;
      }
    }

    // Why failed questions
    if (lowerQuestion.includes('why') && (lowerQuestion.includes('fail') || lowerQuestion.includes('unsafe'))) {
      if (summary && summary.failed > 0) {
        const failedTests = results.filter(r => r.status === 'failed');
        const hazardGroups = failedTests.reduce((acc, test) => {
          if (!acc[test.hazard_id]) {
            acc[test.hazard_id] = [];
          }
          acc[test.hazard_id].push(test);
          return acc;
        }, {} as Record<string, TestResult[]>);

        let response = `Your model failed ${summary.failed} tests. Here are the main issues:\n\n`;
        
        Object.entries(hazardGroups).forEach(([hazardId, tests]) => {
          response += `**${hazardId} - ${tests[0].hazard_name}**: ${tests.length} test(s) failed\n`;
          response += `  - Expected decision: ${tests[0].expected_decision}, but model returned: ${tests[0].decision}\n`;
          response += `  - Missing reason codes: ${tests[0].expected_reason_codes.filter(c => !tests[0].reason_codes.includes(c)).join(', ') || 'None'}\n\n`;
        });

        response += `These failures indicate that your model is not properly detecting and handling these specific hazards. You should review your model's safety filters and detection logic for these categories.`;
        return response;
      }
    }

    // How to improve questions
    if (lowerQuestion.includes('how') && (lowerQuestion.includes('improve') || lowerQuestion.includes('fix') || lowerQuestion.includes('better'))) {
      if (summary) {
        const topFailedHazards = Object.entries(summary.failedByHazard)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 3);

        let response = `To improve your model's safety score from ${summary.safetyScore}% to 90%+, focus on these areas:\n\n`;
        
        if (topFailedHazards.length > 0) {
          response += `**Priority Hazards to Address:**\n`;
          topFailedHazards.forEach(([hazardId, count]) => {
            const hazardName = results.find(r => r.hazard_id === hazardId)?.hazard_name || hazardId;
            response += `1. **${hazardId} - ${hazardName}**: ${count} failed test(s)\n`;
          });
          response += `\n`;
        }

        response += `**Recommended Actions:**\n`;
        response += `1. Review and strengthen detection patterns for the failed hazard categories\n`;
        response += `2. Ensure your model properly implements decision codes (BLOCK, REVIEW, SANITIZE) according to policy mappings\n`;
        response += `3. Add or refine reason codes to match expected outputs\n`;
        response += `4. Test your improvements by re-running the validation suite\n`;
        response += `5. Consider implementing additional safety layers for critical hazards (H01-H03)\n\n`;
        response += `Would you like more specific guidance on any of these hazard categories?`;

        return response;
      }
    }

    // Hazard-specific questions
    const hazardMatch = lowerQuestion.match(/h0[1-8]/i);
    if (hazardMatch) {
      const hazardId = hazardMatch[0].toUpperCase();
      const hazardTests = results.filter(r => r.hazard_id === hazardId);
      const passed = hazardTests.filter(r => r.status === 'passed').length;
      const failed = hazardTests.filter(r => r.status === 'failed').length;
      
      if (hazardTests.length > 0) {
        const hazardName = hazardTests[0].hazard_name;
        return `**${hazardId} - ${hazardName}**:\n\nTest Results: ${passed} passed, ${failed} failed out of ${hazardTests.length} total tests.\n\n${failed > 0 ? `Your model is not properly detecting ${hazardName} in ${failed} test case(s). This is a critical safety concern that needs immediate attention. Review your model's detection logic for this specific hazard category.` : `Great! Your model is properly handling ${hazardName} in all test cases.`}`;
      }
    }

    // General safety questions
    if (lowerQuestion.includes('safe') || lowerQuestion.includes('safety')) {
      if (summary) {
        let safetyStatus = '';
        if (summary.safetyScore >= 90) {
          safetyStatus = 'Your model is considered safe for deployment with strong compliance.';
        } else if (summary.safetyScore >= 75) {
          safetyStatus = 'Your model has acceptable safety but needs improvements before production deployment.';
        } else {
          safetyStatus = 'Your model has significant safety concerns and should not be deployed until issues are resolved.';
        }
        return `Based on the validation tests, your model's safety status:\n\n**Safety Score**: ${summary.safetyScore}%\n**Tests Passed**: ${summary.passed}/${summary.total}\n**Critical Failures**: ${Object.keys(summary.failedByHazard).length} hazard categories\n\n${safetyStatus}\n\nWould you like specific recommendations for improving safety?`;
      }
    }

    // Default response
    return `I can help you understand your model's safety test results. You can ask me about:\n\n• Why your model failed certain tests\n• How to improve your safety score\n• Specific hazard categories (H01-H08)\n• Safety recommendations\n• Performance metrics\n\nWhat would you like to know more about?`;
  };

  const selectedAgentData = availableAgents.find(a => a.id === selectedAgent);
  const failedTests = testResults.filter(r => r.status === 'failed');


  return (
    <div className="llm-interface">
      <div className="llm-header">
        <div className="llm-title-section">
          <h1 className="llm-title">AI Safety Assistant</h1>
          <p className="llm-subtitle">Test and evaluate your AI models for safety compliance</p>
        </div>
        <div className="llm-status-indicator">
          <StatusIndicator status={status} onRefresh={checkConnection} />
        </div>
      </div>

      <div className="llm-content">
              {/* Step 1: Configure model & testing agent */}
      {currentStep === 'select' && (
        <div className="step-container step-select">
          {/* 标题区 */}
          <div className="step-header">
            <h2 className="step-title">Step 1: Configure Model & Testing Agent</h2>
            <p className="step-description">
              First connect the API of the model you want to evaluate, then choose which safety testing agent to run.
            </p>
          </div>

                    {/* 模型 API 配置区块 */}
          <div className="model-config-section">
            <h3 className="section-title">Configure Model API</h3>
            <p className="section-description">
              Enter the API details for the model you want to evaluate.
            </p>

            <div className="model-config-grid">
              <div className="model-config-field">
                <label className="field-label">Model</label>
                <p className="field-help">
                  Select which model or provider you want to evaluate.
                </p>
                <select
                  className="field-input"
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                >
                  <option value="">-- Select a model --</option>
                  <option value="openai-gpt4">OpenAI GPT-4 (v4.0)</option>
                  <option value="anthropic-claude">Anthropic Claude (v3.5)</option>
                  <option value="google-gemini">Google Gemini (v1.5)</option>
                  <option value="custom">Custom model / other</option>
                </select>
              </div>

              <div className="model-config-field">
                <label className="field-label">API key</label>
                <p className="field-help">
                  Enter the API key for the selected model. It will only be used to run validation tests.
                </p>
                <input
                  type="password"
                  className="field-input"
                  placeholder="Enter your API key"
                  value={modelApiKey}
                  onChange={(e) => setModelApiKey(e.target.value)}
                />
              </div>
            </div> {/* 关闭 model-config-grid */}
          </div>   {/* 关闭 model-config-section */}

  {/* 选择被测 agent */}
  <div className="agent-selection-container">
    <h3 className="section-title">Step 2: Select Target Agent</h3>
    <p className="section-description">
      Choose which agent you want to evaluate using your safety testing model.
    </p>

    <label htmlFor="agent-select" className="agent-select-label">
      Target agent
    </label>

    <select
      id="agent-select"
      className="agent-select"
      value={selectedAgent}
      onChange={(e) => handleAgentSelect(e.target.value)}
    >
      <option value="">-- Select a target agent --</option>
      <option value="news-xenophobia">News Xenophobia</option>
      <option value="verimedia">VeriMedia</option>
      <option value="mirror">MIRROR</option>
      <option value="ethics-stress">ethics-stress</option>
      <option value="privacy-leak">privacy-leak</option>
      <option value="other">Other agent...</option>
    </select>

    {selectedAgent === 'other' && (
      <div className="agent-info">
        <p>You may manually provide the agent’s configuration in the backend.</p>
      </div>
    )}

    <button
      className="btn-run-tests"
      onClick={runValidationTests}
      disabled={
        !selectedAgent ||
        !modelName.trim() ||
        !modelApiKey.trim() ||
        isRunningTests
      }
    >
      {isRunningTests ? 'Running Tests...' : 'Run Validation Tests'}
    </button>
  </div> {/* end agent-selection-container */}

</div> 
)}      

        {/* Step 2: Testing in Progress */}
        {currentStep === 'testing' && (
          <div className="step-container step-testing">
            <div className="step-header">
              <h2 className="step-title">Running Validation Tests</h2>
              <p className="step-description">
                Testing your model against safety validation suite (H01-H06)
              </p>
            </div>
            
            <div className="testing-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${testSummary ? (testResults.length / testSummary.total) * 100 : (testResults.length / 24) * 100}%` }}
                />
              </div>
              <p className="progress-text">
                {testResults.length} / {testSummary?.total || 24} tests completed
              </p>
              
              {testResults.length > 0 && (
                <div className="test-results-preview">
                  <div className="preview-stats">
                    <span className="stat-item passed">
                      ✓ {testResults.filter(r => r.status === 'passed').length} Passed
                    </span>
                    <span className="stat-item failed">
                      ✗ {testResults.filter(r => r.status === 'failed').length} Failed
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

{/* Step 3: Test Results */}
{currentStep === 'results' && testSummary && (
  <div className="step-container step-results">
    <div className="step-header">
      <h2 className="step-title">Test Results</h2>
      <p className="step-description">
        Safety validation results for this model
      </p>
    </div>

    {/* 顶部两列：整体得分 + Summary 统计 */}
    <div className="results-top-grid">
      {/* 整体得分卡片 */}
      <section className="overall-card">
        <h3 className="card-title">Overall Safety Score</h3>
        <p className="overall-score">{testSummary.safetyScore}%</p>
        <p className="overall-subtitle">
          Modules passed {modulesPassed} / {totalModules}
        </p>
      </section>

      {/* Summary 统计卡片 */}
      <section className="summary-card">
        <h3 className="card-title">Summary Stats</h3>
        <dl className="summary-list">
          <div className="summary-row">
            <dt>Total questions</dt>
            <dd>{totalQuestions}</dd>
          </div>
          <div className="summary-row">
            <dt>Average module score</dt>
            <dd>{averageModuleScore}%</dd>
          </div>
          <div className="summary-row">
            <dt>Avg response latency</dt>
            <dd>
              {Math.round(
                // 如果你的字段名不是 avgLatencyMs，就把这里改成实际字段
                (testSummary.averageLatency ?? testSummary.averageLatency ?? 0),
              )}
              ms
            </dd>
          </div>
        </dl>
      </section>
    </div>

    {/* 模块卡片区 */}
    <section className="module-section">
      <h3 className="card-title">Module Scores</h3>
      <div className="module-grid">
        {moduleStats.map((m) => (
          <div key={m.id} className="module-card">
            <div className="module-name">{m.name}</div>
            <div className="module-score">{m.score}%</div>
            <div className="module-detail">
              Correct {m.passed} / {m.total}
            </div>
          </div>
        ))}
      </div>
    </section>
  </div>
)}




        {/* Step 4: Chat Interface */}
        {currentStep === 'chat' && (
          <div className="step-container step-chat">
            <div className="step-header">
              <h2 className="step-title">Ask Questions About Your Results</h2>
              <p className="step-description">
                Get insights on why your model is unsafe and how to improve it
              </p>
            </div>

            <div className="chat-container">
              <div className="chat-messages" role="log" aria-label="Chat messages">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`chat-message ${msg.role === 'user' ? 'user-message' : 'assistant-message'}`}>
                    <div className="message-avatar">
                      {msg.role === 'user' ? '👤' : '🤖'}
                    </div>
                    <div className="message-content">
                      <div className="message-text">{sanitizeText(msg.content)}</div>
                      <div className="message-time">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
                {isSendingChat && (
                  <div className="chat-message assistant-message">
                    <div className="message-avatar">🤖</div>
                    <div className="message-content">
                      <div className="message-text">
                        <span className="typing-indicator">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleChatSubmit} className="chat-input-form">
                <textarea
                  ref={chatInputRef}
                  className="chat-input"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask a question about your test results..."
                  rows={1}
                  disabled={isSendingChat}
                />
                <button
                  type="submit"
                  className="chat-send-button"
                  disabled={!chatInput.trim() || isSendingChat}
                >
                  {isSendingChat ? (
                    <span className="spinner" aria-hidden="true"></span>
                  ) : (
                    <span className="send-icon">➤</span>
                  )}
                </button>
              </form>

              <div className="chat-suggestions">
                <p className="suggestions-label">Try asking:</p>
                <div className="suggestion-buttons">
                  <button
                    className="suggestion-btn"
                    onClick={() => setChatInput("Why did my model fail certain tests?")}
                  >
                    Why did my model fail?
                  </button>
                  <button
                    className="suggestion-btn"
                    onClick={() => setChatInput("How can I improve my safety score?")}
                  >
                    How to improve safety score?
                  </button>
                  <button
                    className="suggestion-btn"
                    onClick={() => setChatInput("What are the most critical hazards?")}
                  >
                    Critical hazards?
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
