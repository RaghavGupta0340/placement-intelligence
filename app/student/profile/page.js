'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  User, Mail, Phone, Linkedin, Github, BookOpen, GraduationCap,
  Save, Plus, X, Award, Briefcase, Trophy, Code, CheckCircle, Loader2, Heart
} from 'lucide-react';

const ALL_SKILLS = [
  'DSA', 'System Design', 'Python', 'Java', 'C++', 'JavaScript', 'React', 'Node.js',
  'SQL', 'MongoDB', 'AWS', 'Docker', 'Kubernetes', 'Machine Learning', 'Go',
  'Spring Boot', 'Microservices', 'Kafka', 'Communication', 'Agile', 'Analytics',
  'Tableau', 'Git', 'Linux', 'Distributed Systems', 'Payments', 'Excel',
  'Problem Solving', 'Algorithms', 'Data Analysis', 'Azure', 'TypeScript',
  'Angular', 'Vue.js', 'Flutter', 'Django', 'FastAPI', 'Redis', 'GraphQL',
];

const JOB_INTERESTS = [
  'Backend Development', 'Frontend Development', 'Full Stack Development',
  'Mobile App Development', 'Data Science', 'Machine Learning / AI',
  'DevOps / Cloud Engineering', 'Cybersecurity', 'Product Management',
  'Data Analytics', 'Blockchain Development', 'Game Development',
  'System Design / Architecture', 'Embedded Systems / IoT',
  'UI/UX Design', 'Quality Assurance / Testing', 'Consulting',
  'Research & Development', 'FinTech', 'SaaS / Enterprise Software',
];

const TABS = [
  { id: 'personal', label: 'Personal', icon: User },
  { id: 'interests', label: 'Interests', icon: Heart },
  { id: 'skills', label: 'Skills', icon: Code },
  { id: 'certifications', label: 'Certifications', icon: Award },
  { id: 'internships', label: 'Internships', icon: Briefcase },
  { id: 'hackathons', label: 'Hackathons', icon: Trophy },
  { id: 'achievements', label: 'Achievements', icon: GraduationCap },
];

export default function ProfilePage() {
  const [tab, setTab] = useState('personal');
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [certs, setCerts] = useState([]);
  const [interns, setInterns] = useState([]);
  const [hackathons, setHackathons] = useState([]);
  const [achievements, setAchievements] = useState([]);

  // Form state
  const [form, setForm] = useState({
    name: '', phone: '', linkedin_url: '', github_url: '',
    branch: 'Computer Science', year: 4, cgpa: 0, bio: '', skills: [], interests: [],
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: s } = await supabase.from('students').select('*').eq('user_id', user.id).single();
    if (s) {
      setStudent(s);
      setForm({
        name: s.name || '', phone: s.phone || '', linkedin_url: s.linkedin_url || '',
        github_url: s.github_url || '', branch: s.branch || 'Computer Science',
        year: s.year || 4, cgpa: s.cgpa || 0, bio: s.bio || '', skills: s.skills || [],
        interests: s.interests || [],
      });

      // Load sub-tables
      const [c, i, h, a] = await Promise.all([
        supabase.from('certifications').select('*').eq('student_id', s.id).order('created_at', { ascending: false }),
        supabase.from('internships').select('*').eq('student_id', s.id).order('created_at', { ascending: false }),
        supabase.from('hackathons').select('*').eq('student_id', s.id).order('created_at', { ascending: false }),
        supabase.from('achievements').select('*').eq('student_id', s.id).order('created_at', { ascending: false }),
      ]);
      setCerts(c.data || []);
      setInterns(i.data || []);
      setHackathons(h.data || []);
      setAchievements(a.data || []);
    }
    setLoading(false);
  };

  const saveProfile = async () => {
    if (!student) return;
    setSaving(true);
    const supabase = createClient();
    await supabase.from('students').update({
      name: form.name, phone: form.phone, linkedin_url: form.linkedin_url,
      github_url: form.github_url, branch: form.branch, year: form.year,
      cgpa: parseFloat(form.cgpa) || 0, bio: form.bio, skills: form.skills,
      interests: form.interests,
      internships_count: interns.length, hackathons_count: hackathons.length,
      updated_at: new Date().toISOString(),
    }).eq('id', student.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const addSkill = (skill) => {
    if (!form.skills.includes(skill)) {
      setForm(p => ({ ...p, skills: [...p.skills, skill] }));
    }
  };

  const removeSkill = (skill) => {
    setForm(p => ({ ...p, skills: p.skills.filter(s => s !== skill) }));
  };

  // Generic add/delete for sub-tables
  const addItem = async (table, item, setter) => {
    const supabase = createClient();
    const { data } = await supabase.from(table).insert({ ...item, student_id: student.id }).select().single();
    if (data) setter(prev => [data, ...prev]);
  };

  const deleteItem = async (table, id, setter) => {
    const supabase = createClient();
    await supabase.from(table).delete().eq('id', id);
    setter(prev => prev.filter(i => i.id !== id));
  };

  if (loading) {
    return <div style={{ padding: 'var(--space-2xl)', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading profile...</div>;
  }

  const inputStyle = {
    width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-light)', background: 'var(--bg-secondary)',
    color: 'var(--text-primary)', fontSize: 'var(--font-sm)', outline: 'none', boxSizing: 'border-box',
  };
  const labelStyle = { display: 'block', fontSize: 'var(--font-xs)', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
        <div>
          <h1 className="page-title">Edit Profile</h1>
          <p className="page-subtitle">Keep your profile updated to get the best AI-powered company matches</p>
        </div>
        <button onClick={saveProfile} disabled={saving} className={`btn ${saved ? 'btn-success' : 'btn-accent'}`} style={{ minWidth: 140 }}>
          {saving ? <><Loader2 size={16} className="spin" /> Saving...</> :
           saved ? <><CheckCircle size={16} /> Saved!</> :
           <><Save size={16} /> Save Profile</>}
        </button>
      </div>

      {/* Tab Navigation */}
      <div style={{
        display: 'flex', gap: 'var(--space-xs)', marginBottom: 'var(--space-lg)',
        overflowX: 'auto', paddingBottom: 4,
      }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: 'var(--space-sm) var(--space-md)', borderRadius: 'var(--radius-md)',
            border: tab === t.id ? '1px solid var(--primary)' : '1px solid var(--border-light)',
            background: tab === t.id ? 'var(--accent-alpha)' : 'var(--glass)',
            color: tab === t.id ? 'var(--primary-light)' : 'var(--text-secondary)',
            cursor: 'pointer', fontWeight: 600, fontSize: 'var(--font-xs)',
            display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
          }}>
            <t.icon size={14} /> {t.label}
            {t.id === 'skills' && form.skills.length > 0 && (
              <span style={{ background: 'var(--primary)', color: 'white', borderRadius: 10, padding: '1px 6px', fontSize: '10px' }}>
                {form.skills.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* PERSONAL TAB */}
      {tab === 'personal' && (
        <div className="card animate-fade-in-up" style={{ padding: 'var(--space-xl)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
            <div>
              <label style={labelStyle}>Full Name</label>
              <input style={inputStyle} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Your full name" />
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input style={{ ...inputStyle, opacity: 0.6 }} value={student?.email || ''} disabled />
            </div>
            <div>
              <label style={labelStyle}>Phone</label>
              <input style={inputStyle} value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+91 98765 43210" />
            </div>
            <div>
              <label style={labelStyle}>CGPA</label>
              <input type="number" step="0.01" min="0" max="10" style={inputStyle} value={form.cgpa} onChange={e => setForm(p => ({ ...p, cgpa: e.target.value }))} />
            </div>
            <div>
              <label style={labelStyle}>Branch</label>
              <select style={inputStyle} value={form.branch} onChange={e => setForm(p => ({ ...p, branch: e.target.value }))}>
                {['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Electrical', 'Civil'].map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Year</label>
              <select style={inputStyle} value={form.year} onChange={e => setForm(p => ({ ...p, year: Number(e.target.value) }))}>
                {[1,2,3,4].map(y => <option key={y} value={y}>Year {y}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>LinkedIn URL</label>
              <input style={inputStyle} value={form.linkedin_url} onChange={e => setForm(p => ({ ...p, linkedin_url: e.target.value }))} placeholder="https://linkedin.com/in/yourname" />
            </div>
            <div>
              <label style={labelStyle}>GitHub URL</label>
              <input style={inputStyle} value={form.github_url} onChange={e => setForm(p => ({ ...p, github_url: e.target.value }))} placeholder="https://github.com/yourname" />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Bio</label>
              <textarea rows={3} style={{ ...inputStyle, resize: 'vertical' }} value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} placeholder="Tell us about yourself, your interests, and career goals..." />
            </div>
          </div>
        </div>
      )}

      {/* INTERESTS TAB */}
      {tab === 'interests' && (
        <div className="card animate-fade-in-up" style={{ padding: 'var(--space-xl)' }}>
          <h3 style={{ marginBottom: 'var(--space-xs)' }}>Job Interests ({form.interests.length})</h3>
          <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--space-md)' }}>
            Select the types of roles you&apos;re interested in. Matching companies will be prioritized for you.
          </p>
          {form.interests.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-xs)', marginBottom: 'var(--space-lg)' }}>
              {form.interests.map(interest => (
                <span key={interest} className="skill-tag skill-tag-match" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(236,72,153,0.15)', color: '#ec4899', border: '1px solid rgba(236,72,153,0.3)' }}
                  onClick={() => setForm(p => ({ ...p, interests: p.interests.filter(i => i !== interest) }))}>
                  <Heart size={10} /> {interest} <X size={10} />
                </span>
              ))}
            </div>
          )}
          <h4 style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-sm)' }}>Select Your Interests</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-xs)' }}>
            {JOB_INTERESTS.filter(j => !form.interests.includes(j)).map(j => (
              <button key={j} className="skill-tag" style={{ cursor: 'pointer', border: '1px dashed var(--border-light)' }}
                onClick={() => setForm(p => ({ ...p, interests: [...p.interests, j] }))}>
                <Plus size={10} /> {j}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* SKILLS TAB */}
      {tab === 'skills' && (
        <div className="card animate-fade-in-up" style={{ padding: 'var(--space-xl)' }}>
          <h3 style={{ marginBottom: 'var(--space-sm)' }}>Your Skills ({form.skills.length})</h3>
          {form.skills.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-xs)', marginBottom: 'var(--space-lg)' }}>
              {form.skills.map(s => (
                <span key={s} className="skill-tag skill-tag-match" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                  onClick={() => removeSkill(s)}>
                  {s} <X size={10} />
                </span>
              ))}
            </div>
          )}

          <h4 style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-sm)' }}>Add Skills</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-xs)' }}>
            {ALL_SKILLS.filter(s => !form.skills.includes(s)).map(s => (
              <button key={s} className="skill-tag" style={{ cursor: 'pointer', border: '1px dashed var(--border-light)' }}
                onClick={() => addSkill(s)}>
                <Plus size={10} /> {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* CERTIFICATIONS TAB */}
      {tab === 'certifications' && (
        <div className="animate-fade-in-up">
          <AddItemForm
            title="Certifications"
            fields={[
              { key: 'name', label: 'Certification Name', placeholder: 'AWS Cloud Practitioner' },
              { key: 'issuer', label: 'Issuer', placeholder: 'Amazon Web Services' },
              { key: 'credential_url', label: 'Credential URL', placeholder: 'https://...' },
            ]}
            onAdd={(item) => addItem('certifications', item, setCerts)}
          />
          <ItemList items={certs} onDelete={(id) => deleteItem('certifications', id, setCerts)}
            renderItem={(c) => (
              <>
                <strong>{c.name}</strong>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{c.issuer}</div>
              </>
            )}
          />
        </div>
      )}

      {/* INTERNSHIPS TAB */}
      {tab === 'internships' && (
        <div className="animate-fade-in-up">
          <AddItemForm
            title="Internships"
            fields={[
              { key: 'company', label: 'Company', placeholder: 'Google' },
              { key: 'role', label: 'Role', placeholder: 'Software Engineering Intern' },
              { key: 'duration', label: 'Duration', placeholder: '3 months' },
              { key: 'description', label: 'Description', placeholder: 'Worked on...', multiline: true },
            ]}
            onAdd={(item) => addItem('internships', item, setInterns)}
          />
          <ItemList items={interns} onDelete={(id) => deleteItem('internships', id, setInterns)}
            renderItem={(i) => (
              <>
                <strong>{i.role}</strong> at {i.company}
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{i.duration}</div>
              </>
            )}
          />
        </div>
      )}

      {/* HACKATHONS TAB */}
      {tab === 'hackathons' && (
        <div className="animate-fade-in-up">
          <AddItemForm
            title="Hackathons & Workshops"
            fields={[
              { key: 'name', label: 'Event Name', placeholder: 'Smart India Hackathon 2025' },
              { key: 'role', label: 'Role', placeholder: 'Team Lead' },
              { key: 'achievement', label: 'Achievement', placeholder: 'Winner / Finalist / Participant' },
            ]}
            onAdd={(item) => addItem('hackathons', item, setHackathons)}
          />
          <ItemList items={hackathons} onDelete={(id) => deleteItem('hackathons', id, setHackathons)}
            renderItem={(h) => (
              <>
                <strong>{h.name}</strong> — {h.role}
                {h.achievement && <div style={{ fontSize: '11px', color: 'var(--success)' }}>🏆 {h.achievement}</div>}
              </>
            )}
          />
        </div>
      )}

      {/* ACHIEVEMENTS TAB */}
      {tab === 'achievements' && (
        <div className="animate-fade-in-up">
          <AddItemForm
            title="Achievements"
            fields={[
              { key: 'title', label: 'Title', placeholder: 'Dean\'s List 2025' },
              { key: 'description', label: 'Description', placeholder: 'Awarded for...', multiline: true },
            ]}
            onAdd={(item) => addItem('achievements', item, setAchievements)}
          />
          <ItemList items={achievements} onDelete={(id) => deleteItem('achievements', id, setAchievements)}
            renderItem={(a) => (
              <>
                <strong>{a.title}</strong>
                {a.description && <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{a.description}</div>}
              </>
            )}
          />
        </div>
      )}
    </div>
  );
}

// Reusable: Add Item Form
function AddItemForm({ title, fields, onAdd }) {
  const [form, setForm] = useState({});
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    if (!form[fields[0].key]) return;
    setAdding(true);
    await onAdd(form);
    setForm({});
    setAdding(false);
  };

  const inputStyle = {
    width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-light)', background: 'var(--bg-secondary)',
    color: 'var(--text-primary)', fontSize: 'var(--font-sm)', outline: 'none', boxSizing: 'border-box',
  };

  return (
    <div className="card" style={{ padding: 'var(--space-lg)', marginBottom: 'var(--space-md)' }}>
      <h3 style={{ fontSize: 'var(--font-md)', marginBottom: 'var(--space-md)' }}>Add {title}</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-sm)' }}>
        {fields.map(f => (
          <div key={f.key} style={f.multiline ? { gridColumn: '1 / -1' } : {}}>
            <label style={{ display: 'block', fontSize: 'var(--font-xs)', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>{f.label}</label>
            {f.multiline ? (
              <textarea rows={2} style={{ ...inputStyle, resize: 'vertical' }} value={form[f.key] || ''}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} />
            ) : (
              <input style={inputStyle} value={form[f.key] || ''}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} />
            )}
          </div>
        ))}
      </div>
      <button onClick={handleAdd} disabled={adding || !form[fields[0].key]} className="btn btn-primary" style={{ marginTop: 'var(--space-md)' }}>
        <Plus size={14} /> Add {title.replace(/s$/, '')}
      </button>
    </div>
  );
}

// Reusable: Item List
function ItemList({ items, onDelete, renderItem }) {
  if (items.length === 0) {
    return <div className="card" style={{ padding: 'var(--space-lg)', textAlign: 'center', color: 'var(--text-tertiary)' }}>No items yet. Add one above!</div>;
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
      {items.map(item => (
        <div key={item.id} className="card" style={{ padding: 'var(--space-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>{renderItem(item)}</div>
          <button onClick={() => onDelete(item.id)} style={{
            background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: 'var(--radius-sm)',
            padding: '6px 8px', color: 'var(--danger)', cursor: 'pointer',
          }}>
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
