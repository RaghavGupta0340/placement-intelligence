'use client';

import { useState, useRef, useEffect } from 'react';
import { BrainCircuit, Send, X, Sparkles, Wrench, ChevronDown } from 'lucide-react';

export default function AgentChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'agent',
      text: '🧠 **PlaceIQ Agent** ready. I can autonomously analyze students, match companies, predict outcomes, and suggest actions.\n\nTry: "Match Aarav to companies" or "Show at-risk students"',
      toolCalls: [],
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg }),
      });

      const data = await res.json();

      if (data.error) {
        setMessages(prev => [...prev, {
          role: 'agent',
          text: `❌ Error: ${data.details || data.error}`,
          toolCalls: [],
        }]);
      } else {
        setMessages(prev => [...prev, {
          role: 'agent',
          text: data.reply,
          toolCalls: data.toolCalls || [],
          model: data.model,
        }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'agent',
        text: '❌ Failed to reach the agent. Please check if the server is running.',
        toolCalls: [],
      }]);
    }

    setLoading(false);
  };

  // Simple markdown-like rendering
  const renderText = (text) => {
    return text.split('\n').map((line, i) => {
      // Bold
      line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      // Bullet points
      if (line.startsWith('• ') || line.startsWith('- ')) {
        return <div key={i} style={{ paddingLeft: 8, marginBottom: 2 }} dangerouslySetInnerHTML={{ __html: line }} />;
      }
      if (line.match(/^\d+\./)) {
        return <div key={i} style={{ paddingLeft: 8, marginBottom: 2 }} dangerouslySetInnerHTML={{ __html: line }} />;
      }
      return <div key={i} style={{ marginBottom: line ? 4 : 8 }} dangerouslySetInnerHTML={{ __html: line || '&nbsp;' }} />;
    });
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed', bottom: 24, right: 24, zIndex: 300,
            width: 56, height: 56, borderRadius: '50%',
            background: 'linear-gradient(135deg, hsl(230,80%,60%), hsl(340,82%,60%))',
            border: 'none', cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            animation: 'float 3s ease-in-out infinite',
          }}
          onMouseOver={e => { e.target.style.transform = 'scale(1.1)'; }}
          onMouseOut={e => { e.target.style.transform = 'scale(1)'; }}
        >
          <BrainCircuit size={24} color="white" />
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 300,
          width: 420, maxHeight: '70vh', borderRadius: 'var(--radius-xl)',
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-xl)', display: 'flex', flexDirection: 'column',
          animation: 'scaleIn 0.3s ease-out',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            padding: '14px 18px', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', borderBottom: '1px solid var(--border)',
            background: 'linear-gradient(135deg, hsla(230,80%,60%,0.1), hsla(340,82%,60%,0.05))',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
              <div style={{
                width: 32, height: 32, borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, hsl(230,80%,60%), hsl(340,82%,60%))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <BrainCircuit size={16} color="white" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 'var(--font-sm)' }}>PlaceIQ Agent</div>
                <div style={{ fontSize: '10px', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)' }} /> Online • Agentic Mode
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="btn btn-ghost btn-icon" style={{ width: 28, height: 28 }}>
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: 'var(--space-md)',
            display: 'flex', flexDirection: 'column', gap: 'var(--space-md)',
            maxHeight: '50vh', minHeight: 300,
          }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                display: 'flex', flexDirection: 'column',
                alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
              }}>
                <div style={{
                  maxWidth: '90%', padding: '10px 14px', borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--font-sm)', lineHeight: 1.6,
                  background: msg.role === 'user' ? 'var(--primary)' : 'var(--bg-elevated)',
                  color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                  border: msg.role === 'agent' ? '1px solid var(--border)' : 'none',
                }}>
                  {renderText(msg.text)}
                </div>
                {/* Tool calls indicator */}
                {msg.toolCalls?.length > 0 && (
                  <div style={{
                    display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap',
                  }}>
                    {msg.toolCalls.map((tc, j) => (
                      <span key={j} style={{
                        fontSize: '9px', padding: '2px 6px',
                        background: 'var(--primary-alpha)', borderRadius: 'var(--radius-full)',
                        color: 'var(--primary-light)', display: 'flex', alignItems: 'center', gap: 3,
                      }}>
                        <Wrench size={8} /> {tc.function}
                      </span>
                    ))}
                    {msg.model && (
                      <span style={{
                        fontSize: '9px', padding: '2px 6px',
                        background: 'var(--glass)', borderRadius: 'var(--radius-full)',
                        color: 'var(--text-tertiary)',
                      }}>
                        via {msg.model}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                <div className="spinner" />
                <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>
                  Agent reasoning & executing tools...
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={sendMessage} style={{
            padding: 'var(--space-sm) var(--space-md)', borderTop: '1px solid var(--border)',
            display: 'flex', gap: 'var(--space-sm)',
          }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask the agent anything..."
              className="input"
              style={{ flex: 1, fontSize: 'var(--font-sm)' }}
              disabled={loading}
            />
            <button
              type="submit"
              className="btn btn-primary btn-icon"
              disabled={loading || !input.trim()}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
