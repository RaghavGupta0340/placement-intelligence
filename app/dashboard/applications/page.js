'use client';

import { useState } from 'react';
import { Filter } from 'lucide-react';
import { applications, students, companies } from '@/lib/data/seed';
import { getStatusColor, capitalize, getInitials, getScoreColor, formatPackage } from '@/lib/utils';

const statusOrder = ['applied', 'shortlisted', 'interview', 'offered', 'rejected'];

export default function ApplicationsPage() {
  const [filterStatus, setFilterStatus] = useState('all');

  const enriched = applications.map(a => ({
    ...a,
    student: students.find(s => s.id === a.student_id),
    company: companies.find(c => c.id === a.company_id),
  }));

  const filtered = filterStatus === 'all' ? enriched : enriched.filter(a => a.status === filterStatus);

  // Group by status for overview
  const statusCounts = {};
  statusOrder.forEach(s => { statusCounts[s] = enriched.filter(a => a.status === s).length; });

  return (
    <div>
      <h1 className="page-title">Applications</h1>
      <p className="page-subtitle">Tracking {applications.length} applications across {companies.length} companies</p>

      {/* Status Overview */}
      <div className="stats-grid" style={{ marginBottom: 'var(--space-lg)' }}>
        {statusOrder.filter(s => statusCounts[s] > 0).map(status => (
          <div
            key={status}
            className="card"
            style={{ cursor: 'pointer', borderColor: filterStatus === status ? 'var(--primary)' : undefined }}
            onClick={() => setFilterStatus(filterStatus === status ? 'all' : status)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className={`badge ${getStatusColor(status)}`}>{capitalize(status)}</span>
              <span style={{ fontSize: 'var(--font-2xl)', fontWeight: 800 }}>{statusCounts[status]}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Applications Table */}
      <div className="table-container card" style={{ padding: 0 }}>
        <table className="table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Company</th>
              <th>Package</th>
              <th>AI Match</th>
              <th>AI Prediction</th>
              <th>Status</th>
              <th>Applied</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(app => (
              <tr key={app.id} className="animate-fade-in">
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                    <div className="header-avatar" style={{ width: 30, height: 30, fontSize: '11px', flexShrink: 0 }}>
                      {getInitials(app.student?.name || '??')}
                    </div>
                    <span style={{ fontWeight: 500 }}>{app.student?.name}</span>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 'var(--radius-sm)',
                      background: app.company?.logo_color, display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      fontSize: '10px', fontWeight: 800, color: 'white', flexShrink: 0,
                    }}>
                      {app.company?.short?.slice(0, 2)}
                    </div>
                    <span style={{ fontWeight: 500 }}>{app.company?.short}</span>
                  </div>
                </td>
                <td style={{ color: 'var(--success)', fontWeight: 600 }}>
                  {formatPackage(app.company?.package_lpa || 0)}
                </td>
                <td>
                  <span style={{ color: getScoreColor(app.ai_match_score), fontWeight: 700, fontSize: 'var(--font-sm)' }}>
                    {app.ai_match_score}%
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                    <div className="progress-bar" style={{ width: 60, height: 6 }}>
                      <div className="progress-fill" style={{
                        width: `${app.ai_prediction}%`,
                        background: getScoreColor(app.ai_prediction),
                      }} />
                    </div>
                    <span style={{ fontSize: 'var(--font-xs)', fontWeight: 600, color: getScoreColor(app.ai_prediction) }}>
                      {app.ai_prediction}%
                    </span>
                  </div>
                </td>
                <td>
                  <span className={`badge ${getStatusColor(app.status)}`}>{capitalize(app.status)}</span>
                </td>
                <td style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>
                  {new Date(app.applied_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
