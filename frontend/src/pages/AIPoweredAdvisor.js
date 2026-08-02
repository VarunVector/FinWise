import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import {
  FiSend, FiCpu, FiUser, FiTrendingUp, FiTarget,
  FiDollarSign, FiPieChart, FiBarChart2, FiRefreshCw
} from 'react-icons/fi';
import { BiBot } from 'react-icons/bi';

const AIPoweredAdvisor = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      type: 'ai',
      text: `Hello ${user?.name || 'there'}! 👋 I'm your AI Financial Advisor. I can help you with:\n\n` +
        `💰 **Investment Planning** - Get personalized investment recommendations\n` +
        `🎯 **Retirement Goals** - Plan your retirement corpus\n` +
        `📊 **Portfolio Analysis** - Review and optimize your portfolio\n` +
        `💵 **Tax Optimization** - Save taxes smartly\n` +
        `📝 **Budget Planning** - Manage your expenses better\n\n` +
        `What would you like to discuss today?`,
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([
    { text: 'How should I invest ₹50,000?', icon: <FiTrendingUp /> },
    { text: 'Plan my retirement at 60', icon: <FiTarget /> },
    { text: 'How to save tax this year?', icon: <FiDollarSign /> },
    { text: 'Review my portfolio allocation', icon: <FiPieChart /> },
  ]);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (text) => {
    if (!text.trim() || loading) return;

    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      text: text.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setSuggestions([]);

    try {
      const result = await authAPI.getAIAdvice(user?.id, text.trim());

      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate typing

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        text: result.response,
        timestamp: result.timestamp
      };

      setMessages(prev => [...prev, aiMessage]);

      // Show follow-up suggestions
      setSuggestions([
        { text: 'Tell me more about this', icon: <FiCpu /> },
        { text: 'Compare with other options', icon: <FiBarChart2 /> },
        { text: 'What are the risks?', icon: <FiTrendingUp /> },
        { text: 'Create a plan for me', icon: <FiTarget /> },
      ]);
    } catch (err) {
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        text: 'I apologize, but I encountered an error processing your request. Please try again or rephrase your question.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
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

  const formatMessage = (text) => {
    // Convert markdown-like bold to styled spans
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>');
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome-' + Date.now(),
        type: 'ai',
        text: `Hi again! 👋 I'm ready to help you with your financial queries. What would you like to discuss?`,
        timestamp: new Date().toISOString()
      }
    ]);
    setSuggestions([
      { text: 'How should I invest ₹50,000?', icon: <FiTrendingUp /> },
      { text: 'Plan my retirement at 60', icon: <FiTarget /> },
      { text: 'How to save tax this year?', icon: <FiDollarSign /> },
      { text: 'Review my portfolio allocation', icon: <FiPieChart /> },
    ]);
  };

  return (
    <div className="dashboard-container">
      <div className="row mb-3">
        <div className="col-12">
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <h4 className="fw-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                <FiCpu className="me-2" style={{ color: 'var(--primary)' }} />
                AI Financial Advisor
              </h4>
              <p className="text-muted mb-0" style={{ fontSize: '0.95rem' }}>
                Powered by advanced AI to provide personalized financial guidance
              </p>
            </div>
            <button
              className="btn btn-outline-secondary d-flex align-items-center gap-2"
              onClick={clearChat}
              style={{ borderRadius: '10px', fontSize: '0.9rem' }}
            >
              <FiRefreshCw /> New Chat
            </button>
          </div>
        </div>
      </div>

      <div className="ai-advisor-container">
        {/* Chat Messages */}
        <div className="chat-container" style={{ flex: 1, overflowY: 'auto', paddingRight: '8px' }}>
          {messages.map((msg) => (
            <div key={msg.id} className={`chat-message ${msg.type}`}>
              <div className={`chat-avatar ${msg.type}`}>
                {msg.type === 'ai' ? <BiBot /> : <FiUser />}
              </div>
              <div
                className="chat-bubble"
                dangerouslySetInnerHTML={{ __html: formatMessage(msg.text) }}
              />
            </div>
          ))}

          {/* Loading indicator */}
          {loading && (
            <div className="chat-message ai">
              <div className="chat-avatar ai">
                <BiBot />
              </div>
              <div className="chat-bubble d-flex align-items-center gap-2">
                <div className="spinner-grow spinner-grow-sm text-primary" role="status"></div>
                <div className="spinner-grow spinner-grow-sm text-primary" role="status" style={{ animationDelay: '0.2s' }}></div>
                <div className="spinner-grow spinner-grow-sm text-primary" role="status" style={{ animationDelay: '0.4s' }}></div>
                <span style={{ marginLeft: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Thinking...
                </span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && !loading && (
          <div className="my-2">
            <div style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '8px' }}>
              Quick suggestions:
            </div>
            <div className="chip-container">
              {suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  className="chip d-inline-flex align-items-center gap-2"
                  onClick={() => handleSendMessage(suggestion.text)}
                >
                  {suggestion.icon}
                  {suggestion.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="chat-input-container d-flex align-items-center mt-2">
          <input
            ref={inputRef}
            type="text"
            className="form-control"
            placeholder="Ask me anything about your finances..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />
          <button
            className="btn btn-primary ms-2 d-flex align-items-center gap-2"
            onClick={() => handleSendMessage(input)}
            disabled={!input.trim() || loading}
            style={{ whiteSpace: 'nowrap' }}
          >
            <FiSend />
            <span className="d-none d-md-inline">Send</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIPoweredAdvisor;

