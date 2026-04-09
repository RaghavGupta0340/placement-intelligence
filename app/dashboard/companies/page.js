'use client';

import { useState } from 'react';
import { Search, IndianRupee, Users, Clock, MapPin } from 'lucide-react';
import { companies, getCompanyApplications } from '@/lib/data/seed';
import { formatPackage, daysUntil, getStatusColor, capitalize } from '@/lib/utils';

export default function CompaniesPage() {
  const [search, setSearch] = useState('');
  const [filterIndustry, setFilterIndustry] = useState('all');

  const industries = [...new Set(companies.map(c => c.industry))];

  const filtered = companies.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.required_skills.some(s => s.toLowerCase().includes(search.toLowerCase()));
    const matchIndustry = filterIndustry === 'all' || c.industry === filterIndustry;
    return matchSearch && matchIndustry;
  });

  return (
    <div>
      <h1 className="page-title">Companies</h1>
      <p className="page-subtitle">{companies.length} companies visiting this season</p>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)', flexWrap: 'wrap' }}>
        <div className="input-with-icon" style={{ flex: 1, minWidth: 240 }}>
          <Search size={16} className="input-icon" />
          <input className="input" placeholder="Search companies or skills..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="select" style={{ width: 200 }} value={filterIndustry} onChange={e => setFilterIndustry(e.target.value)}>
          <option value="all">All Industries</option>
          {industries.map(i => <option key={i} value={i}>{i}</option>)}
        </select>
      </div>

      {/* Company Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 'var(--space-md)' }}>
        {filtered.map(company => {
          const apps = getCompanyApplications(company.id);
          const daysLeft = daysUntil(company.deadline);

          return (
            <div key={company.id} className="card card-interactive animate-fade-in-up">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-md)' }}>
                <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 'var(--radius-md)',
                    background: company.logo_color, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontWeight: 800, fontSize: 'var(--font-sm)',
                    color: 'white', flexShrink: 0,
                  }}>
                    {company.short.slice(0, 2)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700 }}>{company.name}</div>
                    <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>{company.industry}</div>
                  </div>
                </div>
                {daysLeft <= 3 && daysLeft > 0 && (
                  <span className="badge badge-danger">
                    <Clock size={10} /> {daysLeft}d left
                  </span>
                )}
                {daysLeft > 3 && (
                  <span className="badge badge-neutral">
                    <Clock size={10} /> {daysLeft}d left
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-lg)', marginBottom: 'var(--space-md)', fontSize: 'var(--font-sm)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--success)' }}>
                  <IndianRupee size={14} /> {formatPackage(company.package_lpa)}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-secondary)' }}>
                  <Users size={14} /> {company.slots} slots
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-secondary)' }}>
                  Min {company.min_cgpa} CGPA
                </span>
              </div>

              <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--space-sm)' }}>
                Roles: {company.roles.join(', ')}
              </div>

              <div className="skill-tags" style={{ marginBottom: 'var(--space-md)' }}>
                {company.required_skills.map(skill => (
                  <span key={skill} className="skill-tag">{skill}</span>
                ))}
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--space-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>
                  {apps.length} applications
                </span>
                <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
                  {apps.slice(0, 3).map(a => (
                    <span key={a.id} className={`badge ${getStatusColor(a.status)}`} style={{ fontSize: '10px' }}>
                      {capitalize(a.status)}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
