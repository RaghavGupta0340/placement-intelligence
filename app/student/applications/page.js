'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { applications as seedApps, companies as seedCompanies, getCompanyById } from '@/lib/data/seed';
import { getStatusColor } from '@/lib/utils';
import { FileText, Clock, Building2 } from 'lucide-react';

export default function StudentApplications() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        supabase.from('students').select('id').eq('user_id', data.user.id).single()
          .then(({ data: s }) => {
            if (s) {
              // Try Supabase first, fall back to seed
              supabase.from('applications').select('*, companies(*)').eq('student_id', s.id)
                .then(({ data: dbApps }) => {
                  if (dbApps && dbApps.length > 0) {
                    setApps(dbApps);
                  } else {
                    // Show seed data as demo
                    setApps(seedApps.filter(a => a.student_id === s.id).map(a => ({
                      ...a,
                      companies: getCompanyById(a.company_id),
                    })));
                  }
                  setLoading(false);
                });
            } else { setLoading(false); }
          });
      } else { setLoading(false); }
    });
  }, []);

  if (loading) return <div style={{ padding: 'var(--space-2xl)', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</div>;

  return (
    <div>
      <h1 className="page-title">My Applications</h1>
      <p className="page-subtitle" style={{ marginBottom: 'var(--space-xl)' }}>Track your application status and interview progress</p>

      {apps.length === 0 ? (
        <div className="card" style={{ padding: 'var(--space-2xl)', textAlign: 'center' }}>
          <FileText size={40} style={{ color: 'var(--text-tertiary)', marginBottom: 'var(--space-md)' }} />
          <h3>No Applications Yet</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-sm)' }}>
            Visit the Companies page to find and apply to matching companies!
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          {apps.map((app, i) => (
            <div key={i} className="card" style={{ padding: 'var(--space-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 'var(--radius-sm)',
                  background: 'var(--glass)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Building2 size={18} style={{ color: 'var(--primary-light)' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{app.companies?.name || app.company_id}</div>
                  <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={11} /> Applied {new Date(app.applied_at).toLocaleDateString('en-IN')}
                  </div>
                </div>
                <span className={`status-badge status-${app.status}`} style={{
                  padding: '4px 12px', borderRadius: 20, fontSize: '11px', fontWeight: 600,
                  background: getStatusColor(app.status) + '22', color: getStatusColor(app.status),
                }}>
                  {app.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
