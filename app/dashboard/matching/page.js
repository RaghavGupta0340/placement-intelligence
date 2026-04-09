'use client';

import { useState } from 'react';
import { BrainCircuit, Sparkles, Search, ChevronRight, Target, Zap, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { students, companies } from '@/lib/data/seed';
import { matchStudentToCompanies } from '@/lib/ai/matching';
import { getInitials, getScoreColor, formatPackage, daysUntil, capitalize, getStatusColor } from '@/lib/utils';

export default function AIMatchingPage() {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [matches, setMatches] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const runMatching = (student) => {
    setIsProcessing(true);
    setSelectedStudent(student);
    // Simulate AI processing delay
    setTimeout(() => {
      const results = matchStudentToCompanies(student, companies);
      setMatches(results);
      setIsProcessing(false);
    }, 800);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-xl)' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
            <BrainCircuit size={28} style={{ color: 'var(--primary-light)' }} />
            AI Company Matching
          </h1>
          <p className="page-subtitle">Select a student to run the AI matching engine • Cosine similarity + weighted scoring</p>
        </div>
        <span className="ai-badge" style={{ fontSize: '11px', padding: '5px 12px' }}>
          <Sparkles size={12} /> Agentic AI
        </span>
      </div>

      {/* Student Selection */}
      <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
        <h3 className="card-title" style={{ marginBottom: 'var(--space-md)' }}>Select Student</h3>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 'var(--space-sm)', maxHeight: 300, overflowY: 'auto',
        }}>
          {students.map(student => (
            <div
              key={student.id}
              onClick={() => runMatching(student)}
              className="card card-interactive"
              style={{
                padding: 'var(--space-sm) var(--space-md)',
                cursor: 'pointer',
                borderColor: selectedStudent?.id === student.id ? 'var(--primary)' : undefined,
                background: selectedStudent?.id === student.id ? 'var(--primary-alpha)' : undefined,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                <div className="header-avatar" style={{ width: 30, height: 30, fontSize: '11px' }}>
                  {getInitials(student.name)}
                </div>
                <div>
                  <div style={{ fontSize: 'var(--font-sm)', fontWeight: 600 }}>{student.name}</div>
                  <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>
                    {student.branch} • {student.cgpa} CGPA
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Processing State */}
      {isProcessing && (
        <div className="card ai-panel" style={{ textAlign: 'center', padding: 'var(--space-2xl)' }}>
          <div className="spinner spinner-lg" style={{ margin: '0 auto var(--space-lg)' }} />
          <h3 style={{ marginBottom: 'var(--space-sm)' }}>AI Agent Processing...</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-sm)' }}>
            Running cosine similarity • Analyzing skill vectors • Computing match scores
          </p>
        </div>
      )}

      {/* Match Results */}
      {!isProcessing && selectedStudent && matches.length > 0 && (
        <div className="animate-fade-in-up">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)' }}>
            <Sparkles size={16} style={{ color: 'var(--primary-light)' }} />
            <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 700 }}>
              Match Results for {selectedStudent.name}
            </h2>
            <span className="badge badge-success">{matches.filter(m => m.matchScore >= 60).length} strong matches</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 'var(--space-md)' }}>
            {matches.map((match, i) => (
              <div key={i} className="card card-interactive animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-md)' }}>
                  <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 'var(--radius-md)',
                      background: match.company.logo_color, display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, fontSize: 'var(--font-xs)', color: 'white',
                    }}>
                      {match.company.short.slice(0, 2)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700 }}>{match.company.name}</div>
                      <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>
                        {match.company.roles[0]} • {formatPackage(match.company.package_lpa)}
                      </div>
                    </div>
                  </div>
                  <div style={{
                    width: 56, height: 56, borderRadius: 'var(--radius-full)',
                    border: `3px solid ${getScoreColor(match.matchScore)}`,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    gap: 0,
                  }}>
                    <span style={{ fontSize: 'var(--font-md)', fontWeight: 800, color: getScoreColor(match.matchScore), lineHeight: 1 }}>
                      {match.matchScore}
                    </span>
                    <span style={{ fontSize: '9px', color: 'var(--text-tertiary)' }}>MATCH</span>
                  </div>
                </div>

                {/* Score Breakdown */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
                  {[
                    { label: 'Skills', value: match.breakdown.skills, color: 'var(--primary)' },
                    { label: 'CGPA', value: match.breakdown.cgpa, color: 'var(--success)' },
                    { label: 'Experience', value: match.breakdown.experience, color: 'var(--warning)' },
                    { label: 'Branch', value: match.breakdown.branch, color: 'var(--accent)' },
                  ].map(item => (
                    <div key={item.label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-xs)', color: 'var(--text-secondary)', marginBottom: 3 }}>
                        <span>{item.label}</span>
                        <span style={{ fontWeight: 600 }}>{item.value}%</span>
                      </div>
                      <div className="progress-bar" style={{ height: 4 }}>
                        <div className="progress-fill" style={{ width: `${item.value}%`, background: item.color }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Selection Probability */}
                <div style={{
                  padding: 'var(--space-sm) var(--space-md)', borderRadius: 'var(--radius-md)',
                  background: 'var(--glass)', marginBottom: 'var(--space-sm)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>Selection Probability</span>
                  <span style={{ fontWeight: 700, color: getScoreColor(match.selectionProbability) }}>
                    {match.selectionProbability}%
                    <span className={`badge badge-${match.confidence === 'high' ? 'success' : match.confidence === 'medium' ? 'warning' : 'danger'}`} style={{ marginLeft: 6 }}>
                      {match.confidence}
                    </span>
                  </span>
                </div>

                {/* Matched & Missing Skills */}
                <div className="skill-tags">
                  {match.matchedSkills.map(s => (
                    <span key={s} className="skill-tag skill-tag-match">{s} ✓</span>
                  ))}
                  {match.missingSkills.map(s => (
                    <span key={s} className="skill-tag" style={{ borderColor: 'hsla(0,72%,55%,0.3)', color: 'var(--danger-light)' }}>
                      {s} ✗
                    </span>
                  ))}
                </div>

                {!match.meetsMinCGPA && (
                  <div style={{ fontSize: 'var(--font-xs)', color: 'var(--danger-light)', marginTop: 'var(--space-sm)', fontWeight: 500 }}>
                    ⚠️ CGPA {selectedStudent.cgpa} is below minimum {match.company.min_cgpa}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!selectedStudent && !isProcessing && (
        <div className="empty-state card ai-panel">
          <div className="empty-state-icon" style={{ background: 'var(--primary-alpha)' }}>
            <BrainCircuit size={28} style={{ color: 'var(--primary-light)' }} />
          </div>
          <h3>Select a Student to Begin</h3>
          <p>The AI matching engine will analyze skills, CGPA, experience, and company requirements to find the best matches using cosine similarity.</p>
        </div>
      )}
    </div>
  );
}
