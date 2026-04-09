'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { companies as seedCompanies } from '@/lib/data/seed';
import { matchStudentToCompanies, generateActionSuggestions } from '@/lib/ai/matching';
import { BrainCircuit, Send, Sparkles, User, Bot, Loader2 } from 'lucide-react';

export default function AdvisorPage() {
  const [student, setStudent] = useState(null);
  const [userId, setUserId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserId(data.user.id);
        supabase.from('students').select('*').eq('user_id', data.user.id).single()
          .then(({ data: s }) => {
            if (s) {
              setStudent(s);
              // Initial AI assessment
              const matches = matchStudentToCompanies(s, seedCompanies).slice(0, 3);
              const suggestions = generateActionSuggestions(s, seedCompanies);
              setMessages([{
                role: 'assistant',
                content: `Hello **${s.name || 'there'}**! 👋 I'm your AI Career Advisor.\n\nHere's a quick profile analysis:\n\n**📊 Profile Strength:** ${s.skills?.length || 0} skills, ${s.cgpa} CGPA, ${s.internships_count || 0} internships\n\n**🏢 Top Matches:**\n${matches.map((m, i) => `${i + 1}. **${m.company.short}** — ${m.matchScore}% match (₹${m.company.package_lpa}L)`).join('\n')}\n\n**💡 Priority Actions:**\n${suggestions.slice(0, 3).map(s => `• ${s.title}`).join('\n')}\n\nAsk me anything — "What skills should I learn?", "Am I ready for Google?", "How to prepare for TCS interview?"`,
              }]);
            }
          });
      }
    });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, userId, userRole: 'student' }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.reply || 'Sorry, I could not process that request.',
        toolCalls: data.toolCalls,
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again.',
      }]);
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
      <div style={{ marginBottom: 'var(--space-md)' }}>
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
          <BrainCircuit size={24} style={{ color: 'var(--accent)' }} />
          AI Career Advisor
        </h1>
        <p className="page-subtitle">Get personalized career advice, skill recommendations, and interview tips</p>
      </div>

      {/* Chat Area */}
      <div className="card" style={{
        flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0,
      }}>
        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-lg)' }}>
          {messages.map((msg, i) => (
            <div key={i} style={{
              display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            }}>
              {msg.role === 'assistant' && (
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                  background: 'var(--gradient-primary)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <Bot size={16} color="white" />
                </div>
              )}
              <div style={{
                maxWidth: '75%', padding: 'var(--space-sm) var(--space-md)',
                borderRadius: 'var(--radius-md)',
                background: msg.role === 'user' ? 'var(--primary)' : 'var(--glass)',
                color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                fontSize: 'var(--font-sm)', lineHeight: 1.6,
                whiteSpace: 'pre-line',
              }}>
                {msg.content}
                {msg.toolCalls?.length > 0 && (
                  <div style={{ marginTop: 'var(--space-xs)', fontSize: '10px', color: msg.role === 'user' ? 'rgba(255,255,255,0.7)' : 'var(--text-tertiary)' }}>
                    🔧 {msg.toolCalls.map(t => t.function).join(', ')}
                  </div>
                )}
              </div>
              {msg.role === 'user' && (
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                  background: 'var(--accent)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <User size={16} color="white" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center', color: 'var(--text-tertiary)', fontSize: 'var(--font-xs)' }}>
              <Loader2 size={14} className="spin" /> Thinking...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={{ padding: 'var(--space-md)', borderTop: '1px solid var(--border-light)', display: 'flex', gap: 'var(--space-sm)' }}>
          <input
            type="text" value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="Ask about skills, companies, interview prep..."
            style={{
              flex: 1, padding: '12px', borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-light)', background: 'var(--bg-secondary)',
              color: 'var(--text-primary)', fontSize: 'var(--font-sm)', outline: 'none',
            }}
          />
          <button onClick={sendMessage} disabled={loading || !input.trim()} className="btn btn-accent">
            <Send size={16} />
          </button>
        </div>

        {/* Quick Actions */}
        <div style={{ padding: '0 var(--space-md) var(--space-md)', display: 'flex', gap: 'var(--space-xs)', flexWrap: 'wrap' }}>
          {['What skills should I learn?', 'Am I ready for Google?', 'Show my skill gaps', 'Interview tips for TCS'].map(q => (
            <button key={q} onClick={() => { setInput(q); }} className="skill-tag" style={{ cursor: 'pointer', fontSize: '10px' }}>
              {q}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
