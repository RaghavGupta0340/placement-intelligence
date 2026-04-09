'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { companies as seedCompanies } from '@/lib/data/seed';
import { matchStudentToCompanies } from '@/lib/ai/matching';
import { getScoreColor, formatPackage } from '@/lib/utils';
import {
  Building2, Target, Clock, ExternalLink, ChevronDown, ChevronUp,
  Sparkles, CheckCircle, XCircle, IndianRupee, TrendingUp, Search
} from 'lucide-react';

export default function StudentCompanies() {
  const [student, setStudent] = useState(null);
  const [matches, setMatches] = useState([]);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [filter, setFilter] = useState('all'); // all, eligible, dream

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        supabase.from('students').select('*').eq('user_id', data.user.id).single()
          .then(({ data: s }) => {
            if (s) {
              setStudent(s);
              setMatches(matchStudentToCompanies(s, seedCompanies));
            }
          });
      }
    });
  }, []);

  const filtered = matches
    .filter(m => {
      if (filter === 'eligible') return student?.cgpa >= m.company.min_cgpa;
      if (filter === 'dream') return m.company.package_lpa >= 20;
      return true;
    })
    .filter(m => m.company.name.toLowerCase().includes(search.toLowerCase()) ||
      m.company.short.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <h1 className="page-title">Companies & Opportunities</h1>
        <p className="page-subtitle">Your personalized company matches with CTC breakdown and eligibility</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)', flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="header-search" style={{ flex: 1, maxWidth: 350 }}>
          <Search size={16} />
          <input type="text" placeholder="Search companies..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {['all', 'eligible', 'dream'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`btn ${filter === f ? 'btn-accent' : 'btn-secondary'}`}
            style={{ textTransform: 'capitalize', fontSize: 'var(--font-xs)' }}>
            {f === 'all' ? `All (${matches.length})` : f === 'eligible' ? `Eligible (${matches.filter(m => student?.cgpa >= m.company.min_cgpa).length})` : `Dream (${matches.filter(m => m.company.package_lpa >= 20).length})`}
          </button>
        ))}
      </div>

      {/* Company Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        {filtered.map((m, i) => {
          const isEligible = student?.cgpa >= m.company.min_cgpa;
          const isExpanded = expanded === m.company.id;
          const c = m.company;

          return (
            <div key={c.id} className="card animate-fade-in-up" style={{ animationDelay: `${i * 0.03}s` }}>
              {/* Header Row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', cursor: 'pointer' }}
                onClick={() => setExpanded(isExpanded ? null : c.id)}>
                <div style={{
                  width: 44, height: 44, borderRadius: 'var(--radius-md)',
                  background: c.logo_color + '22', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  color: c.logo_color, fontWeight: 800, fontSize: '14px', flexShrink: 0,
                }}>
                  {c.short?.slice(0, 2)}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                    <span style={{ fontWeight: 700 }}>{c.name}</span>
                    {isEligible ? (
                      <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: 20, background: 'rgba(34,197,94,0.15)', color: 'var(--success)', fontWeight: 600 }}>
                        ✓ Eligible
                      </span>
                    ) : (
                      <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: 20, background: 'rgba(239,68,68,0.15)', color: 'var(--danger)', fontWeight: 600 }}>
                        Min {c.min_cgpa} CGPA
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)', marginTop: 2 }}>
                    {c.industry} • {c.roles?.join(', ')}
                  </div>
                </div>

                <div style={{ textAlign: 'right', marginRight: 'var(--space-sm)' }}>
                  <div style={{ fontSize: 'var(--font-lg)', fontWeight: 800, color: 'var(--success)' }}>
                    ₹{c.package_lpa}L
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>CTC / year</div>
                </div>

                <div style={{ textAlign: 'center', marginRight: 'var(--space-sm)' }}>
                  <div style={{ fontSize: 'var(--font-lg)', fontWeight: 800, color: getScoreColor(m.matchScore) }}>
                    {m.matchScore}%
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>match</div>
                </div>

                {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div style={{ marginTop: 'var(--space-lg)', paddingTop: 'var(--space-lg)', borderTop: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-lg)' }}>
                    {/* CTC Breakdown */}
                    <div>
                      <h4 style={{ fontSize: 'var(--font-sm)', marginBottom: 'var(--space-sm)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <IndianRupee size={14} /> CTC Breakdown
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
                        {[
                          { label: 'Base Salary', value: c.base_salary_lpa || (c.package_lpa * 0.65) },
                          { label: 'Performance Bonus', value: c.bonus_lpa || (c.package_lpa * 0.12) },
                          { label: 'Stocks/RSU', value: c.stocks_lpa || 0 },
                          { label: 'Joining Bonus', value: c.joining_bonus_lpa || (c.package_lpa * 0.1) },
                        ].map((item, j) => (
                          <div key={j} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-xs)' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                            <span style={{ fontWeight: 600 }}>₹{(typeof item.value === 'number' ? item.value : 0).toFixed(1)}L</span>
                          </div>
                        ))}
                        <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: 4, display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 'var(--font-sm)' }}>
                          <span>Total CTC</span>
                          <span style={{ color: 'var(--success)' }}>₹{c.package_lpa}L</span>
                        </div>
                      </div>
                    </div>

                    {/* Skills Match */}
                    <div>
                      <h4 style={{ fontSize: 'var(--font-sm)', marginBottom: 'var(--space-sm)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Target size={14} /> Skills Required
                      </h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-xs)' }}>
                        {c.required_skills?.map(skill => {
                          const hasSkill = student?.skills?.map(s => s.toLowerCase()).includes(skill.toLowerCase());
                          return (
                            <span key={skill} className={`skill-tag ${hasSkill ? 'skill-tag-match' : 'skill-tag-missing'}`}>
                              {hasSkill ? <CheckCircle size={10} /> : <XCircle size={10} />}
                              {skill}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Details */}
                    <div>
                      <h4 style={{ fontSize: 'var(--font-sm)', marginBottom: 'var(--space-sm)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Clock size={14} /> Details
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)', fontSize: 'var(--font-xs)' }}>
                        <div><span style={{ color: 'var(--text-secondary)' }}>Deadline:</span> <strong>{new Date(c.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</strong></div>
                        <div><span style={{ color: 'var(--text-secondary)' }}>Visit Date:</span> <strong>{new Date(c.visit_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</strong></div>
                        <div><span style={{ color: 'var(--text-secondary)' }}>Openings:</span> <strong>{c.slots}</strong></div>
                        <div><span style={{ color: 'var(--text-secondary)' }}>Selection Prob:</span> <strong style={{ color: getScoreColor(m.selectionProbability) }}>{m.selectionProbability}%</strong></div>
                      </div>
                    </div>
                  </div>

                  {/* Apply Button */}
                  <div style={{ marginTop: 'var(--space-lg)', display: 'flex', gap: 'var(--space-sm)' }}>
                    {c.apply_url ? (
                      <a href={c.apply_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                        <ExternalLink size={14} /> Apply Now
                      </a>
                    ) : (
                      <button className="btn btn-primary" disabled>
                        Applications via TPC
                      </button>
                    )}
                    <button className="btn btn-secondary" style={{ fontSize: 'var(--font-xs)' }}>
                      <Sparkles size={14} /> Get AI Advice for {c.short}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
