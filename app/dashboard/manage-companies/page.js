'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Plus, Pencil, Trash2, Building2, Save, X, IndianRupee, Search, CheckCircle, Loader2
} from 'lucide-react';

const EMPTY_COMPANY = {
  name: '', short: '', industry: 'Technology', required_skills: [],
  min_cgpa: 6.0, package_lpa: 0, base_salary_lpa: 0, bonus_lpa: 0,
  stocks_lpa: 0, joining_bonus_lpa: 0, roles: [], deadline: '',
  visit_date: '', slots: 0, apply_url: '', logo_color: '#6366f1',
};

const SKILL_OPTIONS = [
  'DSA', 'System Design', 'Python', 'Java', 'C++', 'JavaScript', 'React',
  'Node.js', 'SQL', 'MongoDB', 'AWS', 'Docker', 'Go', 'Spring Boot',
  'Microservices', 'Kafka', 'Communication', 'Agile', 'Analytics', 'Excel',
  'Machine Learning', 'Linux', 'Distributed Systems', 'Problem Solving',
  'Algorithms', 'Azure', 'Payments', 'Databases', 'Cloud', 'TypeScript',
];

export default function ManageCompanies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null | 'new' | company id
  const [form, setForm] = useState(EMPTY_COMPANY);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [search, setSearch] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [roleInput, setRoleInput] = useState('');

  useEffect(() => { loadCompanies(); }, []);

  const loadCompanies = async () => {
    const supabase = createClient();
    const { data } = await supabase.from('companies').select('*').order('created_at', { ascending: false });
    setCompanies(data || []);
    setLoading(false);
  };

  const startEdit = (company) => {
    setEditing(company.id);
    setForm({
      ...company,
      required_skills: company.required_skills || [],
      roles: company.roles || [],
      deadline: company.deadline ? new Date(company.deadline).toISOString().split('T')[0] : '',
      visit_date: company.visit_date ? new Date(company.visit_date).toISOString().split('T')[0] : '',
    });
  };

  const startNew = () => {
    setEditing('new');
    setForm(EMPTY_COMPANY);
  };

  const cancelEdit = () => {
    setEditing(null);
    setForm(EMPTY_COMPANY);
  };

  const saveCompany = async () => {
    if (!form.name || !form.short) return;
    setSaving(true);

    const supabase = createClient();
    const payload = {
      name: form.name, short: form.short, industry: form.industry,
      required_skills: form.required_skills, min_cgpa: parseFloat(form.min_cgpa) || 0,
      package_lpa: parseFloat(form.package_lpa) || 0,
      base_salary_lpa: parseFloat(form.base_salary_lpa) || 0,
      bonus_lpa: parseFloat(form.bonus_lpa) || 0,
      stocks_lpa: parseFloat(form.stocks_lpa) || 0,
      joining_bonus_lpa: parseFloat(form.joining_bonus_lpa) || 0,
      roles: form.roles, slots: parseInt(form.slots) || 0,
      deadline: form.deadline || null, visit_date: form.visit_date || null,
      apply_url: form.apply_url, logo_color: form.logo_color,
    };

    if (editing === 'new') {
      await supabase.from('companies').insert(payload);
    } else {
      await supabase.from('companies').update(payload).eq('id', editing);
    }

    await loadCompanies();
    setSaving(false);
    setSaved(true);
    setTimeout(() => { setSaved(false); cancelEdit(); }, 1200);
  };

  const deleteCompany = async (id) => {
    if (!confirm('Delete this company? This cannot be undone.')) return;
    const supabase = createClient();
    await supabase.from('companies').delete().eq('id', id);
    await loadCompanies();
  };

  const addSkill = (skill) => {
    if (skill && !form.required_skills.includes(skill)) {
      setForm(p => ({ ...p, required_skills: [...p.required_skills, skill] }));
    }
    setSkillInput('');
  };

  const addRole = () => {
    if (roleInput.trim() && !form.roles.includes(roleInput.trim())) {
      setForm(p => ({ ...p, roles: [...p.roles, roleInput.trim()] }));
    }
    setRoleInput('');
  };

  const filtered = companies.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.short.toLowerCase().includes(search.toLowerCase())
  );

  const inputStyle = {
    width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-light)', background: 'var(--bg-secondary)',
    color: 'var(--text-primary)', fontSize: 'var(--font-sm)', outline: 'none', boxSizing: 'border-box',
  };
  const labelStyle = { display: 'block', fontSize: 'var(--font-xs)', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 };

  if (loading) return <div style={{ padding: 'var(--space-2xl)', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading companies...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
        <div>
          <h1 className="page-title">Manage Companies</h1>
          <p className="page-subtitle">Add, edit, or remove companies visiting campus</p>
        </div>
        <button onClick={startNew} className="btn btn-accent">
          <Plus size={16} /> Add Company
        </button>
      </div>

      {/* Edit / Create Form */}
      {editing && (
        <div className="card animate-fade-in-up" style={{ padding: 'var(--space-xl)', marginBottom: 'var(--space-lg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
            <h3>{editing === 'new' ? 'Add New Company' : `Edit ${form.short}`}</h3>
            <button onClick={cancelEdit} className="btn btn-ghost" style={{ padding: 4 }}><X size={18} /></button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-md)' }}>
            <div><label style={labelStyle}>Company Name *</label><input style={inputStyle} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Tata Consultancy Services" /></div>
            <div><label style={labelStyle}>Short Name *</label><input style={inputStyle} value={form.short} onChange={e => setForm(p => ({ ...p, short: e.target.value }))} placeholder="TCS" /></div>
            <div><label style={labelStyle}>Industry</label><input style={inputStyle} value={form.industry} onChange={e => setForm(p => ({ ...p, industry: e.target.value }))} placeholder="IT Services" /></div>
            <div><label style={labelStyle}>Min CGPA</label><input type="number" step="0.1" min="0" max="10" style={inputStyle} value={form.min_cgpa} onChange={e => setForm(p => ({ ...p, min_cgpa: e.target.value }))} /></div>

            <div><label style={labelStyle}>Total CTC (LPA)</label><input type="number" step="0.5" style={inputStyle} value={form.package_lpa} onChange={e => setForm(p => ({ ...p, package_lpa: e.target.value }))} /></div>
            <div><label style={labelStyle}>Base Salary (LPA)</label><input type="number" step="0.5" style={inputStyle} value={form.base_salary_lpa} onChange={e => setForm(p => ({ ...p, base_salary_lpa: e.target.value }))} /></div>
            <div><label style={labelStyle}>Bonus (LPA)</label><input type="number" step="0.5" style={inputStyle} value={form.bonus_lpa} onChange={e => setForm(p => ({ ...p, bonus_lpa: e.target.value }))} /></div>
            <div><label style={labelStyle}>Stocks/RSU (LPA)</label><input type="number" step="0.5" style={inputStyle} value={form.stocks_lpa} onChange={e => setForm(p => ({ ...p, stocks_lpa: e.target.value }))} /></div>
            <div><label style={labelStyle}>Joining Bonus (LPA)</label><input type="number" step="0.5" style={inputStyle} value={form.joining_bonus_lpa} onChange={e => setForm(p => ({ ...p, joining_bonus_lpa: e.target.value }))} /></div>
            <div><label style={labelStyle}>Openings</label><input type="number" style={inputStyle} value={form.slots} onChange={e => setForm(p => ({ ...p, slots: e.target.value }))} /></div>
            <div><label style={labelStyle}>Deadline</label><input type="date" style={inputStyle} value={form.deadline} onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))} /></div>
            <div><label style={labelStyle}>Visit Date</label><input type="date" style={inputStyle} value={form.visit_date} onChange={e => setForm(p => ({ ...p, visit_date: e.target.value }))} /></div>
            <div><label style={labelStyle}>Apply URL</label><input style={inputStyle} value={form.apply_url} onChange={e => setForm(p => ({ ...p, apply_url: e.target.value }))} placeholder="https://..." /></div>
            <div>
              <label style={labelStyle}>Logo Color</label>
              <div style={{ display: 'flex', gap: 'var(--space-xs)', alignItems: 'center' }}>
                <input type="color" value={form.logo_color} onChange={e => setForm(p => ({ ...p, logo_color: e.target.value }))} style={{ width: 40, height: 36, border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }} />
                <input style={inputStyle} value={form.logo_color} onChange={e => setForm(p => ({ ...p, logo_color: e.target.value }))} />
              </div>
            </div>
          </div>

          {/* Skills */}
          <div style={{ marginTop: 'var(--space-lg)' }}>
            <label style={labelStyle}>Required Skills</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-xs)', marginBottom: 'var(--space-sm)' }}>
              {form.required_skills.map(sk => (
                <span key={sk} className="skill-tag skill-tag-match" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                  onClick={() => setForm(p => ({ ...p, required_skills: p.required_skills.filter(s => s !== sk) }))}>
                  {sk} <X size={10} />
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-xs)' }}>
              {SKILL_OPTIONS.filter(s => !form.required_skills.includes(s)).slice(0, 15).map(sk => (
                <button key={sk} className="skill-tag" style={{ cursor: 'pointer', border: '1px dashed var(--border-light)', fontSize: '11px' }}
                  onClick={() => addSkill(sk)}>
                  <Plus size={8} /> {sk}
                </button>
              ))}
            </div>
          </div>

          {/* Roles */}
          <div style={{ marginTop: 'var(--space-md)' }}>
            <label style={labelStyle}>Job Roles</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-xs)', marginBottom: 'var(--space-sm)' }}>
              {form.roles.map(r => (
                <span key={r} className="skill-tag" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(99,102,241,0.15)', color: 'var(--primary-light)' }}
                  onClick={() => setForm(p => ({ ...p, roles: p.roles.filter(x => x !== r) }))}>
                  {r} <X size={10} />
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
              <input style={{ ...inputStyle, maxWidth: 250 }} value={roleInput} onChange={e => setRoleInput(e.target.value)}
                placeholder="e.g. Software Engineer" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addRole())} />
              <button className="btn btn-secondary" onClick={addRole}><Plus size={14} /></button>
            </div>
          </div>

          <div style={{ marginTop: 'var(--space-lg)', display: 'flex', gap: 'var(--space-sm)' }}>
            <button onClick={saveCompany} disabled={saving || !form.name || !form.short}
              className={`btn ${saved ? 'btn-success' : 'btn-accent'}`} style={{ minWidth: 160 }}>
              {saving ? <><Loader2 size={14} className="spin" /> Saving...</> :
               saved ? <><CheckCircle size={14} /> Saved!</> :
               <><Save size={14} /> {editing === 'new' ? 'Add Company' : 'Save Changes'}</>}
            </button>
            <button onClick={cancelEdit} className="btn btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="header-search" style={{ maxWidth: 350, marginBottom: 'var(--space-lg)' }}>
        <Search size={16} />
        <input type="text" placeholder="Search companies..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Company List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
        {filtered.map(c => (
          <div key={c.id} className="card" style={{ padding: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
            <div style={{
              width: 40, height: 40, borderRadius: 'var(--radius-sm)',
              background: (c.logo_color || '#6366f1') + '22', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              color: c.logo_color || '#6366f1', fontWeight: 800, fontSize: '13px', flexShrink: 0,
            }}>
              {c.short?.slice(0, 2)}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 'var(--font-sm)' }}>{c.name}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                {c.industry} • ₹{c.package_lpa}L CTC • Min {c.min_cgpa} CGPA • {c.slots} openings
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, maxWidth: 200 }}>
              {c.required_skills?.slice(0, 3).map(sk => (
                <span key={sk} style={{ fontSize: '10px', padding: '1px 6px', borderRadius: 10, background: 'var(--glass)', color: 'var(--text-secondary)' }}>{sk}</span>
              ))}
              {(c.required_skills?.length || 0) > 3 && (
                <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>+{c.required_skills.length - 3}</span>
              )}
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
              <button onClick={() => startEdit(c)} className="btn btn-secondary" style={{ padding: '6px 10px' }}>
                <Pencil size={14} />
              </button>
              <button onClick={() => deleteCompany(c.id)} style={{
                padding: '6px 10px', borderRadius: 'var(--radius-sm)',
                background: 'rgba(239,68,68,0.1)', border: 'none', color: 'var(--danger)', cursor: 'pointer',
              }}>
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="card" style={{ padding: 'var(--space-2xl)', textAlign: 'center' }}>
            <Building2 size={40} style={{ color: 'var(--text-tertiary)', marginBottom: 'var(--space-md)' }} />
            <h3>No Companies</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-sm)' }}>
              Click &quot;Add Company&quot; to add companies visiting campus.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
