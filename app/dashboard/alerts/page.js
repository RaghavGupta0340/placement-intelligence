'use client';

import { useState } from 'react';
import {
  Bell, AlertTriangle, BrainCircuit, Clock, Zap, TrendingUp,
  Check, Sparkles, Filter
} from 'lucide-react';
import { alerts, students } from '@/lib/data/seed';
import { getAlertColor, timeAgo, getInitials } from '@/lib/utils';

const alertTypeIcons = {
  warning: AlertTriangle,
  recommendation: BrainCircuit,
  deadline: Clock,
  action: Zap,
  insight: TrendingUp,
};

export default function AlertsPage() {
  const [filterType, setFilterType] = useState('all');
  const [alertData, setAlertData] = useState(alerts);

  const filtered = filterType === 'all' ? alertData : alertData.filter(a => a.type === filterType);
  const types = [...new Set(alerts.map(a => a.type))];
  const unreadCount = alertData.filter(a => !a.is_read).length;

  const markAsRead = (id) => {
    setAlertData(prev => prev.map(a => a.id === id ? { ...a, is_read: true } : a));
  };

  const markAllRead = () => {
    setAlertData(prev => prev.map(a => ({ ...a, is_read: true })));
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-xl)' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
            <Bell size={28} style={{ color: 'var(--warning)' }} />
            Smart Alerts
          </h1>
          <p className="page-subtitle">{unreadCount} unread alerts • AI-generated autonomous notifications</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
          <span className="ai-badge" style={{ fontSize: '11px', padding: '5px 12px' }}>
            <Sparkles size={12} /> Auto-generated
          </span>
          <button className="btn btn-secondary btn-sm" onClick={markAllRead}>
            <Check size={14} /> Mark all read
          </button>
        </div>
      </div>

      {/* Filter Chips */}
      <div style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)', flexWrap: 'wrap' }}>
        <button
          className={`btn ${filterType === 'all' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setFilterType('all')}
        >
          All ({alertData.length})
        </button>
        {types.map(type => {
          const count = alertData.filter(a => a.type === type).length;
          return (
            <button
              key={type}
              className={`btn ${filterType === type ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              onClick={() => setFilterType(type)}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)} ({count})
            </button>
          );
        })}
      </div>

      {/* Alert List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        {filtered.map(alert => {
          const colors = getAlertColor(alert.type);
          const Icon = alertTypeIcons[alert.type] || Zap;
          const student = alert.student_id ? students.find(s => s.id === alert.student_id) : null;

          return (
            <div
              key={alert.id}
              className="card animate-fade-in-up"
              style={{
                display: 'flex', gap: 'var(--space-lg)', alignItems: 'flex-start',
                borderLeft: `3px solid ${colors.color}`,
                opacity: alert.is_read ? 0.6 : 1,
                transition: 'var(--transition-base)',
              }}
            >
              <div className="alert-icon" style={{
                background: colors.bg, color: colors.color,
                width: 44, height: 44, flexShrink: 0,
              }}>
                <Icon size={20} />
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-xs)' }}>
                  <div>
                    <span className={`badge badge-${alert.type === 'warning' ? 'danger' : alert.type === 'deadline' ? 'warning' : alert.type === 'recommendation' ? 'primary' : alert.type === 'insight' ? 'info' : 'success'}`} style={{ marginRight: 'var(--space-sm)' }}>
                      {alert.type.toUpperCase()}
                    </span>
                    <span style={{ fontWeight: 700, fontSize: 'var(--font-base)' }}>{alert.title}</span>
                  </div>
                  <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>
                    {timeAgo(alert.created_at)}
                  </span>
                </div>

                <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 'var(--space-sm)' }}>
                  {alert.message}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {student ? (
                    <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
                      <div className="header-avatar" style={{ width: 20, height: 20, fontSize: '8px' }}>
                        {getInitials(student.name)}
                      </div>
                      {student.name} • {student.branch}
                    </span>
                  ) : (
                    <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>📊 TPC System Alert</span>
                  )}

                  {!alert.is_read && (
                    <button className="btn btn-ghost btn-sm" onClick={() => markAsRead(alert.id)}>
                      <Check size={14} /> Mark read
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
