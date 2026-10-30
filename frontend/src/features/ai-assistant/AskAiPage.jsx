import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { apiRequest } from "../../services/api";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Sparkles, Send, User, FileText, RotateCcw, AlertCircle } from "lucide-react";

import AppHeader from "../../components/layout/AppHeader/AppHeader";
import Card from "../../components/common/Card/Card";
import Button from "../../components/common/Button/Button";
import Badge from "../../components/common/Badge/Badge";
import "./AskAiPage.css";

const SUGGESTED_PROMPTS = [
  "When does my motor policy expire?",
  "What is my zero-dep insurance deductible?",
  "What is covered under my health policy?",
  "List all appliance warranty expiration dates.",
];

export default function AskAiPage() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I am your **DocVault AI Copilot**. Ask me any question regarding your stored policies, warranties, or IDs. All my answers are grounded strictly in your personal vault documents.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [targetDoc, setTargetDoc] = useState(null);

  const [searchParams] = useSearchParams();
  const linkedDocId = searchParams.get("docId");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (linkedDocId) {
      apiRequest(`/api/documents/${linkedDocId}`)
        .then((res) => {
          if (res.success && res.data) setTargetDoc(res.data);
        })
        .catch((err) => console.warn(err));
    }
  }, [linkedDocId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (questionText) => {
    const textToSend = questionText || input;
    if (!textToSend.trim() || loading) return;

    const userMessage = { role: "user", content: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await apiRequest("/api/ai/query", {
        method: "POST",
        body: JSON.stringify({
          question: textToSend,
          docId: targetDoc ? targetDoc._id : undefined,
        }),
      });

      if (res.success && res.data) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: res.data.answer,
            referencedDocIds: res.data.referencedDocIds || [],
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "⚠️ I encountered an issue analyzing your vault documents. Please verify your connection and try again.",
          },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "⚠️ Server communication error. Please try again later.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        role: "assistant",
        content: "Conversation history cleared. How may I assist you with your vault documents?",
      },
    ]);
  };

  return (
    <div className="dv-ai-page">
      <AppHeader
        title="Ask AI Copilot"
        subtitle="Zero-hallucination bounded RAG answering queries exclusively using your verified policy clauses."
      />

      <div className="dv-ai-content">
        {targetDoc && (
          <div className="dv-ai-scoped-banner">
            <Sparkles size={16} color="#7C3AED" />
            <span>Scoped query mode: Concentrating on <strong>{targetDoc.title}</strong></span>
            <Button variant="ghost" size="sm" onClick={() => setTargetDoc(null)}>
              Remove Scope
            </Button>
          </div>
        )}

        {/* Chat Scroll Container */}
        <Card padding="none" className="dv-ai-chat-window">
          <div className="dv-ai-chat-history">
            {messages.map((m, idx) => (
              <div key={idx} className={`dv-chat-msg dv-chat-msg--${m.role}`}>
                <div className="dv-chat-msg__avatar">
                  {m.role === "assistant" ? <Sparkles size={16} /> : <User size={16} />}
                </div>
                <div className="dv-chat-msg__bubble">
                  <div className="dv-markdown-wrapper">
                    <Markdown remarkPlugins={[remarkGfm]}>{m.content}</Markdown>
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="dv-chat-msg dv-chat-msg--assistant">
                <div className="dv-chat-msg__avatar">
                  <Sparkles size={16} />
                </div>
                <div className="dv-chat-msg__bubble dv-chat-loading-bubble">
                  <div className="dv-btn__spinner" />
                  <span>Searching vault embeddings & synthesizing answer via Groq...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Prompts Bar */}
          <div className="dv-ai-prompts-bar">
            {SUGGESTED_PROMPTS.map((prompt, pIdx) => (
              <button
                key={pIdx}
                className="dv-prompt-chip"
                onClick={() => handleSend(prompt)}
                disabled={loading}
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat Composer */}
          <div className="dv-ai-composer">
            <input
              type="text"
              className="dv-ai-composer__input"
              placeholder="Ask anything about your policies, warranties, or certificates..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              disabled={loading}
            />
            <Button
              variant="ghost"
              size="sm"
              icon={RotateCcw}
              onClick={handleClear}
              title="Reset Chat"
            />
            <Button
              variant="primary"
              size="md"
              icon={Send}
              loading={loading}
              disabled={!input.trim()}
              onClick={() => handleSend()}
            >
              Ask
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
