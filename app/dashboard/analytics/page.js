'use client';

import {
  BarChart3, TrendingUp, Sparkles
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
  LineChart, Line, AreaChart, Area, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { students, companies, applications } from '@/lib/data/seed';

const COLORS = ['hsl(230,80%,60%)', 'hsl(152,68%,50%)', 'hsl(38,92%,55%)', 'hsl(340,82%,60%)', 'hsl(195,85%,55%)'];

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
        <p key={i} style={{ color: p.color || p.fill }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

// Compute analytics data
const branchDist = (() => {
  const counts = {};
  students.forEach(s => {
    counts[s.branch] = (counts[s.branch] || 0) + 1;
  });
  return Object.entries(counts).map(([name, value]) => ({ name: name.replace('Computer Science', 'CS').replace('Information Technology', 'IT'), value }));
})();

const statusDist = (() => {
  const counts = {};
  students.forEach(s => {
    counts[s.placement_status] = (counts[s.placement_status] || 0) + 1;
  });
  return Object.entries(counts).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));
})();

const packageDist = (() => {
  const ranges = { '< 7L': 0, '7-12L': 0, '12-20L': 0, '20-30L': 0, '30L+': 0 };
  companies.forEach(c => {
    if (c.package_lpa < 7) ranges['< 7L']++;
    else if (c.package_lpa <= 12) ranges['7-12L']++;
    else if (c.package_lpa <= 20) ranges['12-20L']++;
    else if (c.package_lpa <= 30) ranges['20-30L']++;
    else ranges['30L+']++;
  });
  return Object.entries(ranges).map(([name, count]) => ({ range: name, count }));
})();

const skillDemand = (() => {
  const counts = {};
  companies.forEach(c => {
    c.required_skills.forEach(s => {
      counts[s] = (counts[s] || 0) + 1;
    });
  });
  return Object.entries(counts).sort(([, a], [, b]) => b - a).slice(0, 10)
    .map(([skill, demand]) => ({ skill, demand }));
})();

const cgpaDist = (() => {
  const ranges = { '< 6.5': 0, '6.5-7.5': 0, '7.5-8.5': 0, '8.5+': 0 };
  students.forEach(s => {
    if (s.cgpa < 6.5) ranges['< 6.5']++;
    else if (s.cgpa <= 7.5) ranges['6.5-7.5']++;
    else if (s.cgpa <= 8.5) ranges['7.5-8.5']++;
    else ranges['8.5+']++;
  });
  return Object.entries(ranges).map(([range, count]) => ({ range, count }));
})();

const appStatusData = (() => {
  const counts = {};
  applications.forEach(a => {
    counts[a.status] = (counts[a.status] || 0) + 1;
  });
  return Object.entries(counts).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));
})();

const monthlyTrend = [
  { month: 'Sep', students: 20, companies: 2, applications: 5 },
  { month: 'Oct', students: 20, companies: 4, applications: 18 },
  { month: 'Nov', students: 20, companies: 6, applications: 35 },
  { month: 'Dec', students: 20, companies: 8, applications: 58 },
  { month: 'Jan', students: 20, companies: 10, applications: 80 },
  { month: 'Feb', students: 20, companies: 11, applications: 95 },
  { month: 'Mar', students: 20, companies: 12, applications: 110 },
];

export default function AnalyticsPage() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-xl)' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
            <BarChart3 size={28} style={{ color: 'var(--primary-light)' }} />
            Analytics Dashboard
          </h1>
          <p className="page-subtitle">Real-time placement analytics for the Training & Placement Cell</p>
        </div>
      </div>

      {/* Row 1: Skill Demand + Branch Distribution */}
      <div className="grid-2" style={{ marginBottom: 'var(--space-md)' }}>
        <div className="card animate-fade-in-up stagger-1">
          <h3 className="card-title">🔥 Top Skill Demand</h3>
          <p className="card-subtitle" style={{ marginBottom: 'var(--space-md)' }}>Most required skills across all companies</p>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={skillDemand} layout="vertical" margin={{ left: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis type="number" stroke="var(--text-tertiary)" fontSize={12} />
                <YAxis dataKey="skill" type="category" stroke="var(--text-tertiary)" fontSize={12} width={70} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="demand" fill="hsl(230,80%,60%)" radius={[0, 4, 4, 0]} name="Companies">
                  {skillDemand.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card animate-fade-in-up stagger-2">
          <h3 className="card-title">Branch Distribution</h3>
          <p className="card-subtitle" style={{ marginBottom: 'var(--space-md)' }}>Students by department</p>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={branchDist}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  nameKey="name"
                  stroke="var(--bg-card)"
                  strokeWidth={3}
                >
                  {branchDist.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: '12px', color: 'var(--text-secondary)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Application Funnel + Package Distribution */}
      <div className="grid-2" style={{ marginBottom: 'var(--space-md)' }}>
        <div className="card animate-fade-in-up stagger-3">
          <h3 className="card-title">Application Status Funnel</h3>
          <p className="card-subtitle" style={{ marginBottom: 'var(--space-md)' }}>Conversion at each stage</p>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={appStatusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  nameKey="name"
                  stroke="var(--bg-card)"
                  strokeWidth={2}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {appStatusData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card animate-fade-in-up stagger-4">
          <h3 className="card-title">💰 Package Distribution</h3>
          <p className="card-subtitle" style={{ marginBottom: 'var(--space-md)' }}>Company packages by range</p>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={packageDist}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="range" stroke="var(--text-tertiary)" fontSize={12} />
                <YAxis stroke="var(--text-tertiary)" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Companies" radius={[6, 6, 0, 0]}>
                  {packageDist.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: CGPA + Monthly Trend */}
      <div className="grid-2" style={{ marginBottom: 'var(--space-md)' }}>
        <div className="card animate-fade-in-up stagger-5">
          <h3 className="card-title">📊 CGPA Distribution</h3>
          <p className="card-subtitle" style={{ marginBottom: 'var(--space-md)' }}>Student academic spread</p>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <BarChart data={cgpaDist}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="range" stroke="var(--text-tertiary)" fontSize={12} />
                <YAxis stroke="var(--text-tertiary)" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Students" fill="hsl(195,85%,55%)" radius={[6, 6, 0, 0]} fillOpacity={0.8} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card animate-fade-in-up stagger-6">
          <h3 className="card-title">📈 Monthly Activity Trend</h3>
          <p className="card-subtitle" style={{ marginBottom: 'var(--space-md)' }}>Season overview</p>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--text-tertiary)" fontSize={12} />
                <YAxis stroke="var(--text-tertiary)" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="applications" name="Applications" stroke="hsl(230,80%,60%)" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="companies" name="Companies" stroke="hsl(152,68%,50%)" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="card ai-panel animate-fade-in-up">
        <div className="ai-panel-header" style={{ marginBottom: 'var(--space-md)' }}>
          <Sparkles size={16} style={{ color: 'var(--primary-light)' }} />
          <h3 className="card-title">AI-Generated Insights</h3>
          <span className="ai-badge">Auto-analyzed</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-md)' }}>
          <div className="ai-suggestion">
            <TrendingUp size={16} style={{ color: 'var(--success)', flexShrink: 0, marginTop: 2 }} />
            <div>
              <strong>Skill Gap Alert:</strong> DSA is required by 7/12 companies but only 45% of students have it. Recommend batch-wide DSA bootcamp.
            </div>
          </div>
          <div className="ai-suggestion">
            <TrendingUp size={16} style={{ color: 'var(--warning)', flexShrink: 0, marginTop: 2 }} />
            <div>
              <strong>Deadline Risk:</strong> 3 companies have deadlines within 5 days. 8 eligible students haven&apos;t applied yet. Auto-triggering reminders.
            </div>
          </div>
          <div className="ai-suggestion">
            <TrendingUp size={16} style={{ color: 'var(--primary-light)', flexShrink: 0, marginTop: 2 }} />
            <div>
              <strong>Placement Velocity:</strong> Current rate is 15% — on track for 65% by season end. Focus on mid-tier companies for mass placement.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
