'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Filter, ChevronRight, GraduationCap } from 'lucide-react';
import { students } from '@/lib/data/seed';
import { getStatusColor, capitalize, getInitials } from '@/lib/utils';

export default function StudentsPage() {
  const [search, setSearch] = useState('');
  const [filterBranch, setFilterBranch] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const filtered = students.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.skills.some(sk => sk.toLowerCase().includes(search.toLowerCase()));
    const matchBranch = filterBranch === 'all' || s.branch === filterBranch;
    const matchStatus = filterStatus === 'all' || s.placement_status === filterStatus;
    return matchSearch && matchBranch && matchStatus;
  });

  const branches = [...new Set(students.map(s => s.branch))];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-xl)' }}>
        <div>
          <h1 className="page-title">Students</h1>
          <p className="page-subtitle">{students.length} students registered • {students.filter(s => s.placement_status === 'placed').length} placed</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)', flexWrap: 'wrap' }}>
        <div className="input-with-icon" style={{ flex: 1, minWidth: 240 }}>
          <Search size={16} className="input-icon" />
          <input
            className="input"
            placeholder="Search by name or skill..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="select" style={{ width: 180 }} value={filterBranch} onChange={e => setFilterBranch(e.target.value)}>
          <option value="all">All Branches</option>
          {branches.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
        <select className="select" style={{ width: 180 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">All Status</option>
          <option value="seeking">Seeking</option>
          <option value="applied">Applied</option>
          <option value="interviewing">Interviewing</option>
          <option value="placed">Placed</option>
        </select>
      </div>

      {/* Student Table */}
      <div className="table-container card" style={{ padding: 0 }}>
        <table className="table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Branch</th>
              <th>CGPA</th>
              <th>Skills</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(student => (
              <tr key={student.id} className="animate-fade-in">
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                    <div className="header-avatar" style={{ width: 34, height: 34, fontSize: 'var(--font-xs)', flexShrink: 0 }}>
                      {getInitials(student.name)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{student.name}</div>
                      <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>{student.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>{student.branch}</span>
                </td>
                <td>
                  <span style={{
                    fontWeight: 700,
                    color: student.cgpa >= 8 ? 'var(--success)' : student.cgpa >= 7 ? 'var(--text-primary)' : 'var(--warning)',
                  }}>
                    {student.cgpa}
                  </span>
                </td>
                <td>
                  <div className="skill-tags">
                    {student.skills.slice(0, 3).map(skill => (
                      <span key={skill} className="skill-tag">{skill}</span>
                    ))}
                    {student.skills.length > 3 && (
                      <span className="skill-tag">+{student.skills.length - 3}</span>
                    )}
                  </div>
                </td>
                <td>
                  <span className={`badge ${getStatusColor(student.placement_status)}`}>
                    {capitalize(student.placement_status)}
                  </span>
                </td>
                <td>
                  <Link href={`/dashboard/students/${student.id}`} className="btn btn-ghost btn-sm">
                    View <ChevronRight size={14} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
