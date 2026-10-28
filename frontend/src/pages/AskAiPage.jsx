import { API_BASE_URL } from "../config.js";
import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Sparkles, 
  Send, 
  User, 
  FileText,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './AskAiPage.css';

export default function AskAiPage() {
  const [searchParams] = useSearchParams();
  const linkedDocId = searchParams.get('docId');
  const { user } = useAuth();
  const chatBottomRef = useRef(null);

  const [inputQuestion, setInputQuestion] = useState('');
  const [targetDoc, setTargetDoc] = useState(null);
  const [messages, setMessages] = useState([
    {
      id: 'msg-init',
      sender: 'assistant',
      text: `Hello ${user?.name ? user.name.split(' ')[0] : 'there'}! I am your DocVault AI Assistant powered by Groq. Ask me any question about your policies, warranties, renewal dates, or coverage.`,
      sources: []
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (linkedDocId) {
      fetch(`${API_BASE_URL}/api/documents/${linkedDocId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data) {
            setTargetDoc(data.data);
            setMessages([
              {
                id: 'msg-doc-focused',
                sender: 'assistant',
                text: `I have focused on "${data.data.title}". What would you like to verify or check in this document?`,
                sources: [{ title: data.data.title, category: data.data.category }]
              }
            ]);
          }
        })
        .catch(err => console.error(err));
    }
  }, [linkedDocId]);

  const handleSend = async (textToSend) => {
    const query = textToSend || inputQuestion;
    if (!query.trim()) return;

    // Append user query to chat stream
    const userMsg = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: query
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuestion('');
    setIsTyping(true);

    try {
      const token = localStorage.getItem('docvault_token');
      const response = await fetch(`${API_BASE_URL}/api/ai/query`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          question: query,
          docId: linkedDocId || null
        })
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.detail || resData.error || 'AI query failed.');
      }

      setMessages(prev => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          sender: 'assistant',
          text: resData.answer,
          sources: resData.sources || []
        }
      ]);
    } catch (err) {
      console.error('Groq AI Query Error:', err);
      setMessages(prev => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          sender: 'assistant',
          text: `Sorry, I encountered an issue: ${err.message}. Please make sure documents are uploaded to your vault.`,
          sources: []
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const samplePrompts = [
    "What is the claim process for my insurance?",
    "When does my warranty expire?",
    "Show key policy numbers and dates",
    "What coverage is included in my policies?"
  ];

  return (
    <div className="ask-ai-page">
      {/* Target doc pill if filtered */}
      {targetDoc && (
        <div className="active-doc-badge">
          <FileText size={14} color="#4338CA" />
          <span>Focused on: <strong>{targetDoc.title}</strong></span>
        </div>
      )}

      {/* Chat Messages Log */}
      <div className="chat-stream">
        {messages.map((m) => (
          <div key={m.id} className={`chat-bubble-row ${m.sender}`}>
            <div className="avatar-wrap">
              {m.sender === 'assistant' ? (
                <div className="bot-avatar">
                  <Sparkles size={16} color="#fff" />
                </div>
              ) : (
                <div className="user-avatar">
                  <User size={16} color="#fff" />
                </div>
              )}
            </div>

            <div className="bubble-content">
              <div className="bubble-text">
                {m.text.split('\n').map((paragraph, idx) => (
                  <p key={idx} style={{ marginBottom: paragraph ? '4px' : '0' }}>{paragraph}</p>
                ))}
              </div>

              {/* Verified Sources Pill */}
              {m.sources && m.sources.length > 0 && (
                <div className="sources-container">
                  <span className="sources-title">Verified Sources:</span>
                  {m.sources.map((src, i) => (
                    <div key={i} className="source-citation-pill">
                      <FileText size={12} />
                      <span className="source-file">{src.title}</span>
                      <span className="source-page">({src.category})</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="chat-bubble-row assistant">
            <div className="avatar-wrap">
              <div className="bot-avatar pulse">
                <Sparkles size={16} color="#fff" />
              </div>
            </div>
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={chatBottomRef} />
      </div>

      {/* Suggested Prompt Chips */}
      {messages.length < 3 && (
        <div className="prompt-suggestions">
          <span className="suggestions-header">Quick Prompts</span>
          <div className="suggestions-list">
            {samplePrompts.map((s, idx) => (
              <button 
                key={idx} 
                className="suggestion-chip"
                onClick={() => handleSend(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form Bar */}
      <div className="chat-input-container">
        <form 
          className="chat-input-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
        >
          <input 
            type="text" 
            placeholder="Ask anything about your documents..."
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
          />
          <button 
            type="submit" 
            className="chat-send-btn"
            disabled={!inputQuestion.trim() || isTyping}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
