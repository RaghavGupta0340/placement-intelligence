'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  MessageSquare, Send, CheckCircle, Clock, AlertCircle, Filter
} from 'lucide-react';

export default function AdminQueriesPage() {
  const [queries, setQueries] = useState([]);
  const [filter, setFilter] = useState('all');
  const [replyText, setReplyText] = useState({});
  const [replying, setReplying] = useState(null);

  useEffect(() => {
    loadQueries();
  }, []);

  const loadQueries = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('queries')
      .select('*, students(name, email, branch)')
      .order('created_at', { ascending: false });
    setQueries(data || []);
  };

  const replyToQuery = async (queryId) => {
    if (!replyText[queryId]?.trim()) return;
    setReplying(queryId);
    const supabase = createClient();
    await supabase.from('queries').update({
      admin_reply: replyText[queryId].trim(),
      status: 'answered',
      replied_at: new Date().toISOString(),
    }).eq('id', queryId);
    await loadQueries();
    setReplyText(prev => ({ ...prev, [queryId]: '' }));
    setReplying(null);
  };

  const filtered = queries.filter(q => filter === 'all' || q.status === filter);

  return (
    <div>
      <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
        <MessageSquare size={24} /> Student Queries
      </h1>
      <p className="page-subtitle" style={{ marginBottom: 'var(--space-lg)' }}>View and respond to student queries</p>

      <div style={{ display: 'flex', gap: 'var(--space-xs)', marginBottom: 'var(--space-lg)' }}>
        {['all', 'open', 'answered', 'closed'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`btn ${filter === f ? 'btn-accent' : 'btn-secondary'}`}
            style={{ textTransform: 'capitalize', fontSize: 'var(--font-xs)' }}>
            {f} ({f === 'all' ? queries.length : queries.filter(q => q.status === f).length})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card" style={{ padding: 'var(--space-2xl)', textAlign: 'center' }}>
          <MessageSquare size={40} style={{ color: 'var(--text-tertiary)', marginBottom: 'var(--space-md)' }} />
          <h3>No Queries</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-sm)' }}>
            {filter === 'all' ? 'When students raise queries, they will appear here.' : `No ${filter} queries.`}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {filtered.map(q => (
            <div key={q.id} className="card" style={{ padding: 'var(--space-lg)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 4 }}>
                    <span style={{ fontWeight: 700 }}>{q.subject}</span>
                    <span style={{
                      padding: '2px 8px', borderRadius: 10, fontSize: '10px', fontWeight: 600, textTransform: 'capitalize',
                      background: q.status === 'answered' ? 'rgba(34,197,94,0.15)' : q.status === 'open' ? 'rgba(245,158,11,0.15)' : 'var(--glass)',
                      color: q.status === 'answered' ? 'var(--success)' : q.status === 'open' ? 'var(--warning)' : 'var(--text-tertiary)',
                    }}>{q.status}</span>
                  </div>
                  <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>
                    From: <strong>{q.students?.name || 'Unknown'}</strong> ({q.students?.branch || ''}) • {q.category} • {new Date(q.created_at).toLocaleDateString('en-IN')}
                  </div>
                </div>
              </div>

              <div style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 'var(--space-md)' }}>
                {q.message}
              </div>

              {q.admin_reply ? (
                <div style={{
                  padding: 'var(--space-md)', background: 'rgba(34,197,94,0.08)',
                  borderRadius: 'var(--radius-sm)', border: '1px solid rgba(34,197,94,0.2)',
                }}>
                  <strong style={{ fontSize: 'var(--font-xs)', color: 'var(--success)' }}>Your Response:</strong>
                  <p style={{ fontSize: 'var(--font-sm)', marginTop: 4 }}>{q.admin_reply}</p>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                  <input
                    type="text" value={replyText[q.id] || ''}
                    onChange={e => setReplyText(prev => ({ ...prev, [q.id]: e.target.value }))}
                    placeholder="Type your response..."
                    style={{
                      flex: 1, padding: '10px 12px', borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-light)', background: 'var(--bg-secondary)',
                      color: 'var(--text-primary)', fontSize: 'var(--font-sm)', outline: 'none',
                    }}
                  />
                  <button onClick={() => replyToQuery(q.id)} disabled={replying === q.id} className="btn btn-primary">
                    <Send size={14} /> {replying === q.id ? 'Sending...' : 'Reply'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
