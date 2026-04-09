'use client';

import { useState, useMemo } from 'react';
import { TrendingUp, Sparkles, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ScatterChart, Scatter, ZAxis
} from 'recharts';
import { students, companies } from '@/lib/data/seed';
import { predictSelectionProbability } from '@/lib/ai/matching';
import { getInitials, getScoreColor, formatPackage } from '@/lib/utils';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{
      background: 'var(--bg-elevated)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)', padding: '10px 14px',
      boxShadow: 'var(--shadow-lg)', fontSize: 'var(--font-xs)',
    }}>
      <p style={{ fontWeight: 600 }}>{d.studentName} → {d.companyShort}</p>
      <p style={{ color: 'var(--primary-light)' }}>Match: {d.matchScore}%</p>
      <p style={{ color: 'var(--success)' }}>Selection: {d.probability}%</p>
    </div>
  );
};

export default function PredictionsPage() {
  const [selectedCompany, setSelectedCompany] = useState(companies[0]);

  // Generate predictions for all students vs selected company
  const predictions = useMemo(() => {
    return students
      .map(student => {
        const result = predictSelectionProbability(student, selectedCompany);
        return {
          student,
          studentName: student.name,
          companyShort: selectedCompany.short,
          probability: result.probability,
          confidence: result.confidence,
          matchScore: result.matchResult.total,
          matchedSkills: result.matchResult.matchedSkills,
          missingSkills: result.matchResult.missingSkills,
          meetsMinCGPA: student.cgpa >= selectedCompany.min_cgpa,
        };
      })
      .sort((a, b) => b.probability - a.probability);
  }, [selectedCompany]);

  const chartData = predictions.map(p => ({
    name: p.student.name.split(' ')[0],
    probability: p.probability,
    matchScore: p.matchScore,
    studentName: p.studentName,
    companyShort: p.companyShort,
  }));

  const avgProbability = Math.round(predictions.reduce((s, p) => s + p.probability, 0) / predictions.length);
  const highConfidence = predictions.filter(p => p.confidence === 'high').length;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-xl)' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
            <TrendingUp size={28} style={{ color: 'var(--success)' }} />
            Selection Predictions
          </h1>
          <p className="page-subtitle">ML-powered selection probability for every student-company pair</p>
        </div>
        <span className="ai-badge" style={{ fontSize: '11px', padding: '5px 12px' }}>
          <Sparkles size={12} /> Predictive AI
        </span>
      </div>

      {/* Company Selector */}
      <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
        <h3 className="card-title" style={{ marginBottom: 'var(--space-md)' }}>Select Company</h3>
        <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
          {companies.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCompany(c)}
              className={`btn ${selectedCompany.id === c.id ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: 'var(--font-xs)' }}
            >
              {c.short}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="card stat-card stat-card-blue">
          <div className="stat-label">Avg Probability</div>
          <div className="stat-value" style={{ color: getScoreColor(avgProbability) }}>{avgProbability}%</div>
        </div>
        <div className="card stat-card stat-card-green">
          <div className="stat-label">High Confidence</div>
          <div className="stat-value" style={{ color: 'var(--success)' }}>{highConfidence}</div>
        </div>
        <div className="card stat-card stat-card-amber">
          <div className="stat-label">CGPA Eligible</div>
          <div className="stat-value">{predictions.filter(p => p.meetsMinCGPA).length}/{students.length}</div>
        </div>
      </div>

      {/* Chart */}
      <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
        <h3 className="card-title">Selection Probability Distribution — {selectedCompany.short}</h3>
        <p className="card-subtitle" style={{ marginBottom: 'var(--space-md)' }}>{formatPackage(selectedCompany.package_lpa)} • Min CGPA: {selectedCompany.min_cgpa}</p>
        <div style={{ width: '100%', height: 350 }}>
          <ResponsiveContainer>
            <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 60, left: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" stroke="var(--text-tertiary)" fontSize={11} angle={-45} textAnchor="end" />
              <YAxis stroke="var(--text-tertiary)" fontSize={12} domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="probability" radius={[4, 4, 0, 0]} name="Selection %">
                {chartData.map((entry, idx) => (
                  <Cell key={idx} fill={getScoreColor(entry.probability)} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: 'var(--space-lg) var(--space-lg) 0' }}>
          <h3 className="card-title">Detailed Predictions — {selectedCompany.name}</h3>
        </div>
        <div className="table-container" style={{ border: 'none' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Student</th>
                <th>CGPA</th>
                <th>Match Score</th>
                <th>Selection Prob.</th>
                <th>Confidence</th>
                <th>Key Skills</th>
              </tr>
            </thead>
            <tbody>
              {predictions.map((p, i) => (
                <tr key={p.student.id} className="animate-fade-in" style={{ opacity: p.meetsMinCGPA ? 1 : 0.5 }}>
                  <td>
                    <span style={{
                      width: 24, height: 24, borderRadius: 'var(--radius-full)',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '11px', fontWeight: 700,
                      background: i < 3 ? 'var(--primary-alpha)' : 'var(--glass)',
                      color: i < 3 ? 'var(--primary-light)' : 'var(--text-secondary)',
                    }}>
                      {i + 1}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                      <div className="header-avatar" style={{ width: 28, height: 28, fontSize: '10px' }}>
                        {getInitials(p.student.name)}
                      </div>
                      <span style={{ fontWeight: 500 }}>{p.student.name}</span>
                    </div>
                  </td>
                  <td style={{ fontWeight: 600, color: p.meetsMinCGPA ? 'var(--text-primary)' : 'var(--danger-light)' }}>
                    {p.student.cgpa}
                    {!p.meetsMinCGPA && <span style={{ fontSize: '10px' }}> ⚠️</span>}
                  </td>
                  <td>
                    <span style={{ color: getScoreColor(p.matchScore), fontWeight: 700 }}>{p.matchScore}%</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                      <div className="progress-bar" style={{ width: 80, height: 6 }}>
                        <div className="progress-fill" style={{
                          width: `${p.probability}%`,
                          background: getScoreColor(p.probability),
                        }} />
                      </div>
                      <span style={{ fontWeight: 700, color: getScoreColor(p.probability), fontSize: 'var(--font-sm)' }}>
                        {p.probability}%
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge badge-${p.confidence === 'high' ? 'success' : p.confidence === 'medium' ? 'warning' : 'danger'}`}>
                      {p.confidence}
                    </span>
                  </td>
                  <td>
                    <div className="skill-tags">
                      {p.matchedSkills.slice(0, 2).map(s => (
                        <span key={s} className="skill-tag skill-tag-match" style={{ fontSize: '10px' }}>{s}</span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
