'use client';

import { use } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Mail, GraduationCap, Briefcase, Code2, Trophy,
  BrainCircuit, Sparkles, TrendingUp, Building2, ChevronRight,
  Zap, BookOpen, Target
} from 'lucide-react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip
} from 'recharts';
import { students, companies, getStudentApplications } from '@/lib/data/seed';
import { matchStudentToCompanies, generateActionSuggestions } from '@/lib/ai/matching';
import { getStatusColor, capitalize, getInitials, formatPackage, getScoreColor, daysUntil } from '@/lib/utils';

export default function StudentDetailPage({ params }) {
  const { id } = use(params);
  const student = students.find(s => s.id === id);

  if (!student) {
    return (
      <div className="empty-state">
        <h3>Student not found</h3>
        <Link href="/dashboard/students" className="btn btn-primary">Back to Students</Link>
      </div>
    );
  }

  const apps = getStudentApplications(student.id);
  const matches = matchStudentToCompanies(student, companies).slice(0, 6);
  const suggestions = generateActionSuggestions(student, companies);

  // Radar chart data
  const radarData = [
    { skill: 'DSA', value: student.skills.some(s => ['DSA', 'Algorithms', 'Problem Solving'].includes(s)) ? 85 : 30 },
    { skill: 'Dev', value: student.skills.some(s => ['React', 'Node.js', 'Spring Boot', 'Java'].includes(s)) ? 80 : 25 },
    { skill: 'ML/AI', value: student.skills.some(s => ['Machine Learning', 'Data Analysis', 'Statistics'].includes(s)) ? 75 : 20 },
    { skill: 'System Design', value: student.skills.includes('System Design') ? 80 : 20 },
    { skill: 'Cloud', value: student.skills.some(s => ['AWS', 'Azure', 'Docker', 'Kubernetes'].includes(s)) ? 70 : 15 },
    { skill: 'Communication', value: student.skills.includes('Communication') ? 75 : 40 },
  ];

  return (
    <div>
      <Link href="/dashboard/students" className="btn btn-ghost" style={{ marginBottom: 'var(--space-lg)' }}>
        <ArrowLeft size={16} /> Back to Students
      </Link>

      {/* Student Header */}
      <div className="card" style={{
        display: 'flex', gap: 'var(--space-xl)', alignItems: 'flex-start',
        marginBottom: 'var(--space-lg)', flexWrap: 'wrap',
      }}>
        <div className="header-avatar" style={{
          width: 72, height: 72, fontSize: 'var(--font-2xl)', flexShrink: 0,
        }}>
          {getInitials(student.name)}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: 'var(--font-2xl)', fontWeight: 700 }}>{student.name}</h1>
            <span className={`badge ${getStatusColor(student.placement_status)}`}>
              {capitalize(student.placement_status)}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-xl)', marginTop: 'var(--space-md)', flexWrap: 'wrap', color: 'var(--text-secondary)', fontSize: 'var(--font-sm)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Mail size={14} /> {student.email}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><GraduationCap size={14} /> {student.branch}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Trophy size={14} /> CGPA: <strong style={{ color: 'var(--text-primary)' }}>{student.cgpa}</strong></span>
          </div>
          <div className="skill-tags" style={{ marginTop: 'var(--space-md)' }}>
            {student.skills.map(skill => (
              <span key={skill} className="skill-tag">{skill}</span>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-lg)', textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, color: 'var(--primary-light)' }}>{student.internships}</div>
            <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>Internships</div>
          </div>
          <div>
            <div style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, color: 'var(--success)' }}>{student.projects}</div>
            <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>Projects</div>
          </div>
          <div>
            <div style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, color: 'var(--warning)' }}>{student.hackathons}</div>
            <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>Hackathons</div>
          </div>
        </div>
      </div>

      <div className="grid-main" style={{ marginBottom: 'var(--space-lg)' }}>
        {/* Skill Radar */}
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: 'var(--space-md)' }}>Skill Profile</h3>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="skill" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Skills" dataKey="value" stroke="hsl(230, 80%, 60%)" fill="hsl(230, 80%, 60%)" fillOpacity={0.2} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Action Suggestions */}
        <div className="card ai-panel">
          <div className="ai-panel-header" style={{ marginBottom: 'var(--space-md)' }}>
            <Sparkles size={16} style={{ color: 'var(--primary-light)' }} />
            <h3 className="card-title">AI Recommendations</h3>
            <span className="ai-badge">Agentic</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            {suggestions.map((s, i) => (
              <div key={i} className="ai-suggestion" style={{ alignItems: 'flex-start' }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 'var(--radius-md)', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: s.priority === 'high' ? 'var(--danger-alpha)' : 'var(--primary-alpha)',
                  color: s.priority === 'high' ? 'var(--danger-light)' : 'var(--primary-light)',
                }}>
                  {s.type === 'apply' && <Target size={14} />}
                  {s.type === 'upskill' && <BookOpen size={14} />}
                  {s.type === 'improve' && <TrendingUp size={14} />}
                  {s.type === 'action' && <Zap size={14} />}
                  {s.type === 'prepare' && <BrainCircuit size={14} />}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 'var(--font-sm)', color: 'var(--text-primary)', marginBottom: 2 }}>
                    {s.title}
                  </div>
                  <div style={{ fontSize: 'var(--font-xs)', lineHeight: 1.5 }}>{s.message}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Company Matches */}
      <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">🤖 AI Company Matches</h3>
            <p className="card-subtitle">Ranked by match score • Powered by cosine similarity</p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-md)' }}>
          {matches.map((m, i) => (
            <div key={i} className="card card-interactive" style={{ padding: 'var(--space-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-sm)' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{m.company.short}</div>
                  <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>{m.company.roles[0]}</div>
                </div>
                <div style={{
                  width: 48, height: 48, borderRadius: 'var(--radius-full)',
                  border: `3px solid ${getScoreColor(m.matchScore)}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 'var(--font-sm)', fontWeight: 800,
                  color: getScoreColor(m.matchScore),
                }}>
                  {m.matchScore}%
                </div>
              </div>
              <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--space-sm)' }}>
                {formatPackage(m.company.package_lpa)} • {daysUntil(m.company.deadline)} days left
              </div>
              <div className="skill-tags">
                {m.matchedSkills.map(s => (
                  <span key={s} className="skill-tag skill-tag-match">{s}</span>
                ))}
                {m.missingSkills.slice(0, 2).map(s => (
                  <span key={s} className="skill-tag" style={{ borderColor: 'hsla(0, 72%, 55%, 0.3)', color: 'var(--danger-light)' }}>{s}</span>
                ))}
              </div>
              {!m.meetsMinCGPA && (
                <div style={{ fontSize: 'var(--font-xs)', color: 'var(--danger-light)', marginTop: 'var(--space-sm)' }}>
                  ⚠ CGPA below minimum ({m.company.min_cgpa} required)
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Applications */}
      {apps.length > 0 && (
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: 'var(--space-md)' }}>Application History</h3>
          <div className="table-container" style={{ border: 'none' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Match Score</th>
                  <th>Prediction</th>
                  <th>Status</th>
                  <th>Applied</th>
                </tr>
              </thead>
              <tbody>
                {apps.map(app => (
                  <tr key={app.id}>
                    <td style={{ fontWeight: 600 }}>{app.company?.name}</td>
                    <td>
                      <span style={{ color: getScoreColor(app.ai_match_score), fontWeight: 700 }}>
                        {app.ai_match_score}%
                      </span>
                    </td>
                    <td>
                      <span style={{ color: getScoreColor(app.ai_prediction), fontWeight: 700 }}>
                        {app.ai_prediction}%
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${getStatusColor(app.status)}`}>{capitalize(app.status)}</span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-sm)' }}>
                      {new Date(app.applied_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
