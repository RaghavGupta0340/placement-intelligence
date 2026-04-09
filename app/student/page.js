'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { companies as seedCompanies } from '@/lib/data/seed';
import { matchStudentToCompanies } from '@/lib/ai/matching';
import {
  User, Building2, Target, Clock, Award, TrendingUp, ArrowRight, Sparkles, AlertTriangle
} from 'lucide-react';

export default function StudentOverview() {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [topMatches, setTopMatches] = useState([]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        supabase.from('students').select('*').eq('user_id', data.user.id).single()
          .then(({ data: s }) => {
            if (s) {
              setStudent(s);
              const matches = matchStudentToCompanies(s, seedCompanies).slice(0, 5);
              setTopMatches(matches);
            }
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    });
  }, []);

  if (loading) {
    return <div style={{ padding: 'var(--space-2xl)', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading your dashboard...</div>;
  }

  if (!student) {
    return (
      <div style={{ padding: 'var(--space-2xl)', textAlign: 'center' }}>
        <AlertTriangle size={40} style={{ color: 'var(--warning)', marginBottom: 'var(--space-md)' }} />
        <h2>Profile Not Found</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Please sign in again to access your dashboard.</p>
        <Link href="/login" className="btn btn-primary" style={{ marginTop: 'var(--space-md)' }}>Go to Login</Link>
      </div>
    );
  }

  const profileCompletion = Math.min(100, Math.round(
    (student.name ? 15 : 0) +
    (student.cgpa > 0 ? 15 : 0) +
    ((student.skills?.length || 0) > 0 ? 20 : 0) +
    (student.phone ? 10 : 0) +
    (student.linkedin_url ? 10 : 0) +
    (student.github_url ? 10 : 0) +
    ((student.internships_count || 0) > 0 ? 10 : 0) +
    (student.bio ? 10 : 0)
  ));

  const eligibleCompanies = seedCompanies.filter(c => student.cgpa >= c.min_cgpa);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-xl)', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
        <div>
          <h1 className="page-title">Welcome back, {student.name?.split(' ')[0] || 'Student'} 👋</h1>
          <p className="page-subtitle">{student.branch} • Year {student.year} • {student.cgpa > 0 ? `${student.cgpa} CGPA` : 'CGPA not set'}</p>
        </div>
        <Link href="/student/profile" className="btn btn-accent">
          <User size={16} /> Complete Profile
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid" style={{ marginBottom: 'var(--space-xl)' }}>
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-icon stat-icon-blue"><Target size={20} /></div>
            <span className="stat-trend trend-up">{profileCompletion}%</span>
          </div>
          <div className="stat-value">{profileCompletion}%</div>
          <div className="stat-label">Profile Complete</div>
          <div style={{ marginTop: 8, height: 4, borderRadius: 2, background: 'var(--bg-secondary)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${profileCompletion}%`, background: profileCompletion === 100 ? 'var(--success)' : 'var(--primary)', borderRadius: 2, transition: 'width 0.5s ease' }} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-icon stat-icon-green"><Building2 size={20} /></div>
          </div>
          <div className="stat-value">{eligibleCompanies.length}</div>
          <div className="stat-label">Eligible Companies</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-icon stat-icon-pink"><Award size={20} /></div>
          </div>
          <div className="stat-value">{student.skills?.length || 0}</div>
          <div className="stat-label">Skills Listed</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-icon stat-icon-amber"><TrendingUp size={20} /></div>
          </div>
          <div className="stat-value">{topMatches[0]?.matchScore || 0}%</div>
          <div className="stat-label">Best Match Score</div>
        </div>
      </div>

      <div className="grid-main">
        {/* Top Company Matches */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
            <h3 className="card-title">
              <Sparkles size={16} style={{ color: 'var(--accent)' }} /> Top Company Matches
            </h3>
            <Link href="/student/companies" style={{ fontSize: 'var(--font-xs)', color: 'var(--primary-light)', display: 'flex', alignItems: 'center', gap: 4 }}>
              View All <ArrowRight size={12} />
            </Link>
          </div>

          {topMatches.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
              {topMatches.map((m, i) => (
                <div key={i} className="card card-interactive" style={{ padding: 'var(--space-sm) var(--space-md)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 'var(--radius-sm)',
                      background: m.company.logo_color + '22', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      color: m.company.logo_color, fontWeight: 700, fontSize: '11px',
                    }}>
                      {m.company.short?.slice(0, 3)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 'var(--font-sm)' }}>{m.company.short}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                        ₹{m.company.package_lpa} LPA • {m.matchedSkills?.length || 0} skills matched
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, color: m.matchScore >= 70 ? 'var(--success)' : m.matchScore >= 50 ? 'var(--warning)' : 'var(--danger)' }}>
                        {m.matchScore}%
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>match</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-sm)' }}>
              Add skills to your profile to see company matches.
            </p>
          )}
        </div>

        {/* Quick Actions / Profile Completion Tips */}
        <div className="card ai-panel">
          <div className="ai-panel-header" style={{ marginBottom: 'var(--space-md)' }}>
            <Sparkles size={16} style={{ color: 'var(--accent)' }} />
            <h3 className="card-title">AI Career Tips</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            {profileCompletion < 100 && (
              <div className="ai-suggestion">
                <Target size={14} style={{ color: 'var(--warning)', flexShrink: 0 }} />
                <div>
                  <strong style={{ fontSize: 'var(--font-xs)' }}>Complete Your Profile</strong>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: 2 }}>
                    Your profile is {profileCompletion}% complete. Add skills, internships, and certifications for better matches.
                  </p>
                </div>
              </div>
            )}

            {(student.skills?.length || 0) < 3 && (
              <div className="ai-suggestion">
                <Award size={14} style={{ color: 'var(--primary-light)', flexShrink: 0 }} />
                <div>
                  <strong style={{ fontSize: 'var(--font-xs)' }}>Add More Skills</strong>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: 2 }}>
                    Companies like TCS, Infosys require 5+ skills. Top demanded: DSA, Java, SQL, System Design.
                  </p>
                </div>
              </div>
            )}

            {(student.internships_count || 0) === 0 && (
              <div className="ai-suggestion">
                <TrendingUp size={14} style={{ color: 'var(--success)', flexShrink: 0 }} />
                <div>
                  <strong style={{ fontSize: 'var(--font-xs)' }}>Get an Internship</strong>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: 2 }}>
                    Students with internships have 40% higher selection probability at top companies.
                  </p>
                </div>
              </div>
            )}

            <div className="ai-suggestion">
              <Clock size={14} style={{ color: 'var(--danger)', flexShrink: 0 }} />
              <div>
                <strong style={{ fontSize: 'var(--font-xs)' }}>Upcoming Deadlines</strong>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: 2 }}>
                  {seedCompanies.filter(c => new Date(c.deadline) > new Date()).length} companies have open applications. Check the Companies page!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
