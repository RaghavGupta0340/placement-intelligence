'use client';

import { 
  Users, Building2, FileCheck, TrendingUp, ArrowUpRight, 
  ArrowDownRight, BrainCircuit, Sparkles, AlertTriangle, 
  Clock, ChevronRight, Zap 
} from 'lucide-react';
import Link from 'next/link';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell 
} from 'recharts';
import { students, companies, applications, alerts, getPlacementStats } from '@/lib/data/seed';
import { getStatusColor, formatPackage, timeAgo, capitalize, getAlertColor } from '@/lib/utils';

const stats = getPlacementStats();

const funnelData = [
  { stage: 'Total Students', count: stats.totalStudents, color: 'var(--primary)' },
  { stage: 'Applied', count: stats.applied + stats.interviewing + stats.placed, color: 'var(--info)' },
  { stage: 'Interviewing', count: stats.interviewing + stats.placed, color: 'var(--warning)' },
  { stage: 'Placed', count: stats.placed, color: 'var(--success)' },
];

const trendData = [
  { month: 'Oct', placements: 2, applications: 15 },
  { month: 'Nov', placements: 5, applications: 35 },
  { month: 'Dec', placements: 8, applications: 55 },
  { month: 'Jan', placements: 12, applications: 78 },
  { month: 'Feb', placements: 18, applications: 95 },
  { month: 'Mar', placements: 22, applications: 110 },
  { month: 'Apr', placements: stats.placed, applications: stats.totalApplications + 90 },
];

const branchData = [
  { name: 'CS', students: 12, placed: 3, color: 'var(--primary)' },
  { name: 'IT', students: 4, placed: 0, color: 'var(--info)' },
  { name: 'ECE', students: 2, placed: 0, color: 'var(--warning)' },
  { name: 'Mech', students: 1, placed: 0, color: 'var(--accent)' },
  { name: 'Other', students: 1, placed: 0, color: 'var(--text-tertiary)' },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload) return null;
  return (
    <div style={{
      background: 'var(--bg-elevated)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)', padding: '10px 14px',
      boxShadow: 'var(--shadow-lg)', fontSize: 'var(--font-xs)',
    }}>
      <p style={{ fontWeight: 600, marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

export default function DashboardOverview() {
  const recentAlerts = alerts.filter(a => !a.is_read).slice(0, 4);
  const recentApplications = applications.slice(-5).reverse().map(a => ({
    ...a,
    student: students.find(s => s.id === a.student_id),
    company: companies.find(c => c.id === a.company_id),
  }));

  return (
    <div>
      <h1 className="page-title">Dashboard Overview</h1>
      <p className="page-subtitle">Real-time placement intelligence at a glance</p>

      {/* Stat Cards */}
      <div className="stats-grid">
        <div className="card stat-card stat-card-blue animate-fade-in-up stagger-1">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="stat-icon stat-icon-blue"><Users size={20} /></div>
            <span className="stat-change stat-change-up"><ArrowUpRight size={14} /> 12%</span>
          </div>
          <div className="stat-value">{stats.totalStudents}</div>
          <div className="stat-label">Total Students</div>
        </div>

        <div className="card stat-card stat-card-green animate-fade-in-up stagger-2">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="stat-icon stat-icon-green"><FileCheck size={20} /></div>
            <span className="stat-change stat-change-up"><ArrowUpRight size={14} /> {stats.placementRate}%</span>
          </div>
          <div className="stat-value">{stats.placed}</div>
          <div className="stat-label">Students Placed</div>
        </div>

        <div className="card stat-card stat-card-amber animate-fade-in-up stagger-3">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="stat-icon stat-icon-amber"><Building2 size={20} /></div>
            <span className="stat-change stat-change-up"><ArrowUpRight size={14} /> 3 new</span>
          </div>
          <div className="stat-value">{stats.totalCompanies}</div>
          <div className="stat-label">Companies Visiting</div>
        </div>

        <div className="card stat-card stat-card-pink animate-fade-in-up stagger-4">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="stat-icon stat-icon-pink"><TrendingUp size={20} /></div>
            <span className="stat-change stat-change-up"><ArrowUpRight size={14} /> ₹2L</span>
          </div>
          <div className="stat-value">₹{stats.avgPackage}L</div>
          <div className="stat-label">Avg Package</div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid-main" style={{ marginBottom: 'var(--space-md)' }}>
        {/* Placement Trend Chart */}
        <div className="card animate-fade-in-up stagger-3">
          <div className="card-header">
            <div>
              <h3 className="card-title">Placement Trend</h3>
              <p className="card-subtitle">Monthly placement progress</p>
            </div>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="gradPlacements" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(152, 68%, 50%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(152, 68%, 50%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradApplications" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(230, 80%, 60%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(230, 80%, 60%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--text-tertiary)" fontSize={12} />
                <YAxis stroke="var(--text-tertiary)" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="applications" name="Applications"
                  stroke="hsl(230, 80%, 60%)" fill="url(#gradApplications)" strokeWidth={2} />
                <Area type="monotone" dataKey="placements" name="Placements"
                  stroke="hsl(152, 68%, 50%)" fill="url(#gradPlacements)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Smart Alerts */}
        <div className="card ai-panel animate-fade-in-up stagger-4">
          <div className="card-header">
            <div className="ai-panel-header">
              <Sparkles size={16} style={{ color: 'var(--primary-light)' }} />
              <h3 className="card-title">AI Alerts</h3>
              <span className="ai-badge">Live</span>
            </div>
            <Link href="/dashboard/alerts" className="btn btn-ghost btn-sm">
              View All <ChevronRight size={14} />
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            {recentAlerts.map(alert => {
              const colors = getAlertColor(alert.type);
              return (
                <div key={alert.id} className="alert-card">
                  <div className="alert-icon" style={{ background: colors.bg, color: colors.color }}>
                    {alert.type === 'warning' && <AlertTriangle size={16} />}
                    {alert.type === 'recommendation' && <BrainCircuit size={16} />}
                    {alert.type === 'deadline' && <Clock size={16} />}
                    {alert.type === 'action' && <Zap size={16} />}
                    {alert.type === 'insight' && <TrendingUp size={16} />}
                  </div>
                  <div className="alert-content">
                    <div className="alert-title">{alert.title}</div>
                    <div className="alert-message">{alert.message.slice(0, 80)}...</div>
                    <div className="alert-time">{timeAgo(alert.created_at)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid-2">
        {/* Placement Funnel */}
        <div className="card animate-fade-in-up stagger-5">
          <div className="card-header">
            <div>
              <h3 className="card-title">Placement Funnel</h3>
              <p className="card-subtitle">Student journey stages</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', padding: 'var(--space-md) 0' }}>
            {funnelData.map((item, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 'var(--font-sm)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{item.stage}</span>
                  <span style={{ fontWeight: 600 }}>{item.count}</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${(item.count / stats.totalStudents) * 100}%`,
                      background: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Applications */}
        <div className="card animate-fade-in-up stagger-6">
          <div className="card-header">
            <div>
              <h3 className="card-title">Recent Applications</h3>
              <p className="card-subtitle">Latest student applications</p>
            </div>
            <Link href="/dashboard/applications" className="btn btn-ghost btn-sm">
              View All <ChevronRight size={14} />
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            {recentApplications.map(app => (
              <div key={app.id} style={{
                display: 'flex', alignItems: 'center', gap: 'var(--space-md)',
                padding: 'var(--space-sm) 0',
                borderBottom: '1px solid var(--border)',
              }}>
                <div className="header-avatar" style={{
                  width: 32, height: 32, fontSize: 'var(--font-xs)',
                  background: app.company?.logo_color || 'var(--primary)',
                }}>
                  {app.company?.short?.slice(0, 2) || '??'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 'var(--font-sm)', fontWeight: 500 }}>
                    {app.student?.name}
                  </div>
                  <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>
                    Applied to {app.company?.short}
                  </div>
                </div>
                <span className={`badge ${getStatusColor(app.status)}`}>
                  {capitalize(app.status)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
