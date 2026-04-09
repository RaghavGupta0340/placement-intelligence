'use client';

import { useState, useMemo } from 'react';
import { Sparkles, FlaskConical, Plus, X, TrendingUp, ArrowRight, Zap } from 'lucide-react';
import { students, companies } from '@/lib/data/seed';
import { matchStudentToCompanies, predictSelectionProbability } from '@/lib/ai/matching';
import { getInitials, getScoreColor, formatPackage } from '@/lib/utils';

const ALL_SKILLS = [
  'DSA', 'System Design', 'Python', 'Java', 'C++', 'React', 'Node.js',
  'SQL', 'MongoDB', 'AWS', 'Docker', 'Kubernetes', 'Machine Learning',
  'Go', 'Spring Boot', 'Microservices', 'Kafka', 'Communication',
  'Agile', 'Analytics', 'Tableau', 'Git', 'Linux', 'Distributed Systems',
  'Payments', 'Excel', 'Problem Solving', 'Algorithms', 'Data Analysis',
];

export default function WhatIfPage() {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [addedSkills, setAddedSkills] = useState([]);
  const [results, setResults] = useState(null);

  const availableSkills = useMemo(() => {
    if (!selectedStudent) return ALL_SKILLS;
    return ALL_SKILLS.filter(s =>
      !selectedStudent.skills.map(sk => sk.toLowerCase()).includes(s.toLowerCase()) &&
      !addedSkills.map(sk => sk.toLowerCase()).includes(s.toLowerCase())
    );
  }, [selectedStudent, addedSkills]);

  const runAnalysis = () => {
    if (!selectedStudent) return;

    // Original scores
    const originalMatches = matchStudentToCompanies(selectedStudent, companies);

    // Enhanced student with added skills
    const enhancedStudent = {
      ...selectedStudent,
      skills: [...selectedStudent.skills, ...addedSkills],
    };
    const enhancedMatches = matchStudentToCompanies(enhancedStudent, companies);

    // Calculate deltas
    const comparison = companies.map(company => {
      const original = originalMatches.find(m => m.company.id === company.id);
      const enhanced = enhancedMatches.find(m => m.company.id === company.id);
      return {
        company,
        originalScore: original?.matchScore || 0,
        enhancedScore: enhanced?.matchScore || 0,
        delta: (enhanced?.matchScore || 0) - (original?.matchScore || 0),
        originalProb: original?.selectionProbability || 0,
        enhancedProb: enhanced?.selectionProbability || 0,
        probDelta: (enhanced?.selectionProbability || 0) - (original?.selectionProbability || 0),
        newMatchedSkills: enhanced?.matchedSkills?.filter(
          s => !original?.matchedSkills?.includes(s)
        ) || [],
      };
    }).sort((a, b) => b.delta - a.delta);

    setResults({
      comparison,
      avgDelta: Math.round(comparison.reduce((s, c) => s + c.delta, 0) / comparison.length),
      maxDelta: Math.max(...comparison.map(c => c.delta)),
      companiesImproved: comparison.filter(c => c.delta > 0).length,
    });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-xl)' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
            <FlaskConical size={28} style={{ color: 'var(--accent)' }} />
            What-If Skill Analyzer
          </h1>
          <p className="page-subtitle">Simulate how learning new skills impacts match scores and selection probability</p>
        </div>
        <span className="ai-badge" style={{ fontSize: '11px', padding: '5px 12px' }}>
          <Sparkles size={12} /> Predictive AI
        </span>
      </div>

      <div className="grid-main" style={{ marginBottom: 'var(--space-lg)' }}>
        {/* Left — Config */}
        <div>
          {/* Student Selection */}
          <div className="card" style={{ marginBottom: 'var(--space-md)' }}>
            <h3 className="card-title" style={{ marginBottom: 'var(--space-md)' }}>1. Select Student</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 'var(--space-sm)', maxHeight: 200, overflowY: 'auto' }}>
              {students.map(s => (
                <div
                  key={s.id}
                  onClick={() => { setSelectedStudent(s); setAddedSkills([]); setResults(null); }}
                  className="card card-interactive"
                  style={{
                    padding: 'var(--space-sm)', cursor: 'pointer',
                    borderColor: selectedStudent?.id === s.id ? 'var(--accent)' : undefined,
                    background: selectedStudent?.id === s.id ? 'var(--accent-alpha)' : undefined,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                    <div className="header-avatar" style={{ width: 28, height: 28, fontSize: '10px' }}>
                      {getInitials(s.name)}
                    </div>
                    <div>
                      <div style={{ fontSize: 'var(--font-xs)', fontWeight: 600 }}>{s.name}</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>{s.cgpa} CGPA</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Skill Addition */}
          {selectedStudent && (
            <div className="card" style={{ marginBottom: 'var(--space-md)' }}>
              <h3 className="card-title" style={{ marginBottom: 'var(--space-sm)' }}>2. Add Skills to Simulate</h3>
              <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--space-md)' }}>
                Current skills: {selectedStudent.skills.join(', ')}
              </p>

              {addedSkills.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-xs)', marginBottom: 'var(--space-md)' }}>
                  {addedSkills.map(skill => (
                    <span key={skill} className="skill-tag skill-tag-match" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                      onClick={() => { setAddedSkills(prev => prev.filter(s => s !== skill)); setResults(null); }}>
                      + {skill} <X size={10} />
                    </span>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-xs)', maxHeight: 150, overflowY: 'auto' }}>
                {availableSkills.map(skill => (
                  <button
                    key={skill}
                    className="skill-tag"
                    style={{ cursor: 'pointer', border: '1px dashed var(--border-light)' }}
                    onClick={() => { setAddedSkills(prev => [...prev, skill]); setResults(null); }}
                  >
                    <Plus size={10} /> {skill}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Run Button */}
          {selectedStudent && addedSkills.length > 0 && (
            <button className="btn btn-accent btn-lg" style={{ width: '100%' }} onClick={runAnalysis}>
              <FlaskConical size={18} />
              Run What-If Analysis
              <ArrowRight size={16} />
            </button>
          )}
        </div>

        {/* Right — Results Summary */}
        <div>
          {results ? (
            <div className="card ai-panel animate-fade-in-up">
              <div className="ai-panel-header" style={{ marginBottom: 'var(--space-md)' }}>
                <Sparkles size={16} style={{ color: 'var(--accent)' }} />
                <h3 className="card-title">Impact Analysis</h3>
              </div>
              <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-lg)' }}>
                If <strong>{selectedStudent.name}</strong> learns <strong style={{ color: 'var(--success-light)' }}>{addedSkills.join(', ')}</strong>:
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, color: results.avgDelta > 0 ? 'var(--success)' : 'var(--text-primary)' }}>
                    +{results.avgDelta}%
                  </div>
                  <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>Avg Score Boost</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, color: 'var(--primary-light)' }}>
                    +{results.maxDelta}%
                  </div>
                  <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>Max Improvement</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, color: 'var(--warning)' }}>
                    {results.companiesImproved}
                  </div>
                  <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>Companies Improved</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                {results.comparison.filter(c => c.delta > 0).slice(0, 5).map((c, i) => (
                  <div key={i} className="ai-suggestion" style={{ padding: 'var(--space-sm) var(--space-md)' }}>
                    <Zap size={14} style={{ color: 'var(--success)', flexShrink: 0, marginTop: 2 }} />
                    <div style={{ flex: 1 }}>
                      <span style={{ fontWeight: 600, fontSize: 'var(--font-sm)' }}>{c.company.short}</span>
                      <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-xs)', marginLeft: 8 }}>
                        {formatPackage(c.company.package_lpa)}
                      </span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>
                        {c.originalScore}% → <span style={{ color: 'var(--success)', fontWeight: 700 }}>{c.enhancedScore}%</span>
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--success)' }}>+{c.delta}% match</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="card ai-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, textAlign: 'center' }}>
              <FlaskConical size={40} style={{ color: 'var(--text-tertiary)', marginBottom: 'var(--space-md)' }} />
              <h3 style={{ marginBottom: 'var(--space-sm)' }}>What-If Analysis</h3>
              <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', maxWidth: 300 }}>
                Select a student, add hypothetical skills, and see how their match scores change across all companies.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Full Results Table */}
      {results && (
        <div className="card animate-fade-in-up" style={{ padding: 0 }}>
          <div style={{ padding: 'var(--space-lg) var(--space-lg) 0' }}>
            <h3 className="card-title">Full Company Impact Breakdown</h3>
          </div>
          <div className="table-container" style={{ border: 'none' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Package</th>
                  <th>Before</th>
                  <th>After</th>
                  <th>Change</th>
                  <th>New Skills Matched</th>
                </tr>
              </thead>
              <tbody>
                {results.comparison.map((c, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{c.company.short}</td>
                    <td style={{ color: 'var(--success)' }}>{formatPackage(c.company.package_lpa)}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{c.originalScore}%</td>
                    <td style={{ fontWeight: 700, color: getScoreColor(c.enhancedScore) }}>{c.enhancedScore}%</td>
                    <td>
                      <span style={{
                        color: c.delta > 0 ? 'var(--success)' : c.delta < 0 ? 'var(--danger)' : 'var(--text-tertiary)',
                        fontWeight: 700,
                      }}>
                        {c.delta > 0 ? '+' : ''}{c.delta}%
                      </span>
                    </td>
                    <td>
                      <div className="skill-tags">
                        {c.newMatchedSkills.map(s => (
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
      )}
    </div>
  );
}
