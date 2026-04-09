'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  MessageSquare, Send, Plus, CheckCircle, Clock, AlertCircle, ChevronDown, ChevronUp
} from 'lucide-react';

const CATEGORIES = [
  { value: 'general', label: 'General Inquiry' },
  { value: 'company', label: 'Company-specific' },
  { value: 'technical', label: 'Technical/Skills' },
  { value: 'career', label: 'Career Guidance' },
  { value: 'complaint', label: 'Complaint/Feedback' },
];

export default function QueriesPage() {
  const [student, setStudent] = useState(null);
  const [queries, setQueries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('general');
  const [submitting, setSubmitting] = useState(false);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: s } = await supabase.from('students').select('*').eq('user_id', user.id).single();
    if (s) {
      setStudent(s);
      const { data: q } = await supabase.from('queries').select('*').eq('student_id', s.id).order('created_at', { ascending: false });
      setQueries(q || []);
    }
  };

  const submitQuery = async () => {
    if (!subject.trim() || !message.trim() || !student) return;
    setSubmitting(true);
    const supabase = createClient();
    const { data } = await supabase.from('queries').insert({
      student_id: student.id,
      category,
      subject: subject.trim(),
      message: message.trim(),
    }).select().single();

    if (data) {
      setQueries(prev => [data, ...prev]);
      setSubject('');
      setMessage('');
      setShowForm(false);
    }
    setSubmitting(false);
  };

  const statusIcon = (status) => {
    switch (status) {
      case 'answered': return <CheckCircle size={14} style={{ color: 'var(--success)' }} />;
      case 'closed': return <AlertCircle size={14} style={{ color: 'var(--text-tertiary)' }} />;
      default: return <Clock size={14} style={{ color: 'var(--warning)' }} />;
    }
  };

  const inputStyle = {
    width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-light)', background: 'var(--bg-secondary)',
    color: 'var(--text-primary)', fontSize: 'var(--font-sm)', outline: 'none', boxSizing: 'border-box',
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
        <div>
          <h1 className="page-title">Raise a Query</h1>
          <p className="page-subtitle">Send questions, feedback, or requests to the TPC team</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-accent">
          <Plus size={16} /> New Query
        </button>
      </div>

      {/* New Query Form */}
      {showForm && (
        <div className="card animate-fade-in-up" style={{ padding: 'var(--space-xl)', marginBottom: 'var(--space-lg)' }}>
          <h3 style={{ marginBottom: 'var(--space-md)' }}>Submit a Query</h3>
          <div style={{ display: 'grid', gap: 'var(--space-md)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
              <div>
                <label style={{ display: 'block', fontSize: 'var(--font-xs)', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Category</label>
                <select style={inputStyle} value={category} onChange={e => setCategory(e.target.value)}>
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 'var(--font-xs)', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Subject</label>
                <input style={inputStyle} value={subject} onChange={e => setSubject(e.target.value)} placeholder="Brief subject line" />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-xs)', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Message</label>
              <textarea rows={4} style={{ ...inputStyle, resize: 'vertical' }} value={message} onChange={e => setMessage(e.target.value)}
                placeholder="Describe your question or concern in detail..." />
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
              <button onClick={submitQuery} disabled={submitting || !subject || !message} className="btn btn-primary">
                <Send size={14} /> {submitting ? 'Submitting...' : 'Submit Query'}
              </button>
              <button onClick={() => setShowForm(false)} className="btn btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Query List */}
      {queries.length === 0 ? (
        <div className="card" style={{ padding: 'var(--space-2xl)', textAlign: 'center' }}>
          <MessageSquare size={40} style={{ color: 'var(--text-tertiary)', marginBottom: 'var(--space-md)' }} />
          <h3>No Queries Yet</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-sm)' }}>
            Click &quot;New Query&quot; to send a question to the TPC team.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          {queries.map(q => (
            <div key={q.id} className="card" style={{ cursor: 'pointer' }} onClick={() => setExpanded(expanded === q.id ? null : q.id)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                {statusIcon(q.status)}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 'var(--font-sm)' }}>{q.subject}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', display: 'flex', gap: 'var(--space-sm)', marginTop: 2 }}>
                    <span style={{ textTransform: 'capitalize' }}>{q.category}</span> •
                    <span>{new Date(q.created_at).toLocaleDateString('en-IN')}</span> •
                    <span style={{
                      color: q.status === 'answered' ? 'var(--success)' : q.status === 'open' ? 'var(--warning)' : 'var(--text-tertiary)',
                      fontWeight: 600, textTransform: 'capitalize',
                    }}>{q.status}</span>
                  </div>
                </div>
                {expanded === q.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
              {expanded === q.id && (
                <div style={{ marginTop: 'var(--space-md)', paddingTop: 'var(--space-md)', borderTop: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    <strong>Your message:</strong><br />{q.message}
                  </div>
                  {q.admin_reply && (
                    <div style={{
                      marginTop: 'var(--space-md)', padding: 'var(--space-md)',
                      background: 'rgba(34,197,94,0.08)', borderRadius: 'var(--radius-sm)',
                      border: '1px solid rgba(34,197,94,0.2)',
                    }}>
                      <strong style={{ fontSize: 'var(--font-xs)', color: 'var(--success)' }}>TPC Response:</strong>
                      <p style={{ fontSize: 'var(--font-sm)', marginTop: 4 }}>{q.admin_reply}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
