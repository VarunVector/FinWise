import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useFinancialData } from '../context/FinancialDataContext';
import { authAPI } from '../services/api';
import NoticeBanner from '../components/common/NoticeBanner';
import { formatINR } from '../utils/formatters';
import {
  Send,
  Sparkles,
  Bot,
  User,
  TrendingUp,
  Target,
  IndianRupee,
  PieChart,
  RotateCcw,
  ShieldCheck
} from 'lucide-react';

export default function AIPoweredAdvisor() {
  const { user } = useAuth();
  const { metrics, goals } = useFinancialData();

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      type: 'ai',
      text: `Hello ${user?.name ? user.name.split(' ')[0] : 'there'}! 👋 I'm your FinWise AI Advisor.\n\n` +
        `I've analyzed your current portfolio of **${formatINR(metrics.portfolioValue)}** and monthly savings surplus of **${formatINR(metrics.monthlySurplus)}** (${metrics.savingsRate.toFixed(1)}% savings rate).\n\n` +
        `Here is what I can help you with today:\n` +
        `• 📊 **Portfolio Rebalancing** - Review your 66.4% Equity vs 33% Debt allocation\n` +
        `• 🎯 **Goal Strategy** - Bridge the funding gap on your ${goals.length} target goals\n` +
        `• 💰 **Tax Saving (FY 2026-27)** - Optimize Section 80C and 80CCD deductions\n` +
        `• 🛡️ **Emergency Reserve** - Ensure your 6-month safety buffer is liquid\n\n` +
        `What would you like to discuss?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([
    { text: `How to allocate my ${formatINR(metrics.monthlySurplus)} surplus?`, icon: <TrendingUp size={14} /> },
    { text: 'Review my asset class rebalancing', icon: <PieChart size={14} /> },
    { text: 'How can I reach my Higher Education goal?', icon: <Target size={14} /> },
    { text: 'Best tax saving instruments for FY 2026-27', icon: <IndianRupee size={14} /> },
  ]);

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (text) => {
    if (!text.trim() || loading) return;

    const userMessage = {
      id: `u_${Date.now()}`,
      type: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setSuggestions([]);

    try {
      const result = await authAPI.getAIAdvice(user?.id, text.trim());
      await new Promise((resolve) => setTimeout(resolve, 400));

      const aiMessage = {
        id: `ai_${Date.now()}`,
        type: 'ai',
        text: result.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, aiMessage]);

      setSuggestions([
        { text: 'Can you break down the returns?', icon: <TrendingUp size={14} /> },
        { text: 'What are the main market risks?', icon: <ShieldCheck size={14} /> },
        { text: 'How will this impact my retirement corpus?', icon: <Target size={14} /> },
      ]);
    } catch (err) {
      const errorMessage = {
        id: `err_${Date.now()}`,
        type: 'ai',
        text: 'I apologize, but I encountered a temporary connection issue. Please try rephrasing your financial question.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(input);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: `welcome_${Date.now()}`,
        type: 'ai',
        text: `Hi again! I'm ready to help you analyze your portfolio or plan investments. Ask me anything!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const formatMessage = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <div className="ai-advisor-page d-flex flex-column gap-3.5">
      <NoticeBanner message="AI Financial Advisor provides educational guidance based on your portfolio figures. Always review with a SEBI-registered advisor before executing large allocations." />

      <div className="card fintech-card chat-card flex-grow-1" style={{ minHeight: '620px' }}>
        {/* Chat Header */}
        <div className="card-header bg-white border-bottom p-3 d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-2.5">
            <div className="p-2 rounded-circle bg-teal-subtle text-teal">
              <Sparkles size={18} />
            </div>
            <div>
              <div className="fw-semibold text-dark small">FinWise AI Wealth Advisory Engine</div>
              <div className="text-muted small" style={{ fontSize: '0.72rem' }}>
                Context: Portfolio {formatINR(metrics.portfolioValue)} · Surplus {formatINR(metrics.monthlySurplus)}/mo
              </div>
            </div>
          </div>
          <button
            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
            onClick={clearChat}
            title="Reset conversation"
          >
            <RotateCcw size={14} />
            <span className="d-none d-sm-inline">Clear chat</span>
          </button>
        </div>

        {/* Messages Viewport */}
        <div className="card-body p-3 p-md-4 d-flex flex-column gap-3 custom-scrollbar" style={{ maxHeight: '460px', overflowY: 'auto' }}>
          {messages.map((m) => {
            const isAI = m.type === 'ai';
            return (
              <div
                key={m.id}
                className={`d-flex gap-2.5 ${isAI ? 'justify-content-start' : 'justify-content-end'}`}
              >
                {isAI && (
                  <div className="chat-avatar-icon ai flex-shrink-0 mt-1">
                    <Bot size={16} />
                  </div>
                )}

                <div className={`chat-bubble ${isAI ? 'chat-bubble-ai' : 'chat-bubble-user'}`}>
                  <div
                    className="chat-text"
                    dangerouslySetInnerHTML={{ __html: formatMessage(m.text) }}
                  />
                  <div className="chat-time text-end mt-1">{m.timestamp}</div>
                </div>

                {!isAI && (
                  <div className="chat-avatar-icon user flex-shrink-0 mt-1">
                    <User size={16} />
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="d-flex gap-2.5 justify-content-start">
              <div className="chat-avatar-icon ai flex-shrink-0">
                <Bot size={16} />
              </div>
              <div className="chat-bubble chat-bubble-ai d-flex align-items-center gap-1.5 py-2 px-3">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Suggestions Bar */}
        {suggestions.length > 0 && (
          <div className="px-3 pt-2 pb-1 d-flex flex-wrap gap-1.5 border-top bg-light">
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                className="btn btn-sm btn-outline-secondary suggestion-chip d-flex align-items-center gap-1.5"
                onClick={() => handleSendMessage(s.text)}
              >
                {s.icon}
                <span>{s.text}</span>
              </button>
            ))}
          </div>
        )}

        {/* Chat Input Bar */}
        <div className="card-footer bg-white p-3 border-top">
          <div className="input-group">
            <textarea
              className="form-control border-end-0 custom-scrollbar"
              placeholder="Ask anything about investments, mutual funds, tax, or retirement goals..."
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              style={{ resize: 'none' }}
            />
            <button
              className="btn btn-primary-fintech px-3.5 d-flex align-items-center justify-content-center"
              onClick={() => handleSendMessage(input)}
              disabled={!input.trim() || loading}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
