'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { BrainCircuit, Mail, Lock, User, BookOpen, ArrowLeft, CheckCircle, Eye, EyeOff } from 'lucide-react';

const BRANCHES = ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Electrical', 'Civil'];

export default function SignUpPage() {
  const [step, setStep] = useState('form'); // form | success
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [branch, setBranch] = useState('Computer Science');
  const [year, setYear] = useState(4);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: 'student',
          branch: branch,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    setStep('success');
    setLoading(false);
  };

  if (step === 'success') {
    return (
      <div className="landing-page" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="landing-bg" />
        <div style={{ maxWidth: 440, padding: 'var(--space-xl)', zIndex: 1, width: '100%' }}>
          <div className="glass-card animate-fade-in-up" style={{ padding: 'var(--space-2xl)', textAlign: 'center' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%', background: 'rgba(34,197,94,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-lg)',
            }}>
              <CheckCircle size={32} style={{ color: 'var(--success)' }} />
            </div>

            <h2 style={{ marginBottom: 'var(--space-sm)' }}>Check Your Email! 📧</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-sm)', marginBottom: 'var(--space-lg)', lineHeight: 1.6 }}>
              We&apos;ve sent a verification link to<br />
              <strong style={{ color: 'var(--primary-light)' }}>{email}</strong>
            </p>

            <div style={{
              padding: 'var(--space-md)', borderRadius: 'var(--radius-md)',
              background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
              marginBottom: 'var(--space-lg)', textAlign: 'left',
            }}>
              <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                <strong style={{ color: 'var(--text-primary)' }}>Next steps:</strong><br />
                1. Open the email from PlaceIQ<br />
                2. Click the <strong>verification link</strong><br />
                3. You&apos;ll be redirected to your dashboard<br />
                4. Complete your profile to get AI-matched!
              </p>
            </div>

            <Link href="/login" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              Go to Sign In
            </Link>

            <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)', marginTop: 'var(--space-md)' }}>
              Didn&apos;t get the email? Check your spam folder.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="landing-page" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="landing-bg" />

      <div style={{ width: '100%', maxWidth: 440, padding: 'var(--space-xl)', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-sm)', textDecoration: 'none' }}>
            <div style={{
              width: 44, height: 44, borderRadius: 'var(--radius-md)',
              background: 'var(--gradient-primary)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <BrainCircuit size={24} color="white" />
            </div>
            <span style={{ fontSize: 'var(--font-xl)', fontWeight: 800, color: 'var(--text-primary)' }}>PlaceIQ</span>
          </Link>
        </div>

        {/* Card */}
        <div className="glass-card" style={{ padding: 'var(--space-xl)' }}>
          <h2 style={{ textAlign: 'center', marginBottom: 'var(--space-xs)', fontSize: 'var(--font-xl)' }}>Create Account</h2>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: 'var(--space-lg)', fontSize: 'var(--font-sm)' }}>
            Join PlaceIQ to access AI-powered placement intelligence
          </p>

          {error && (
            <div style={{
              padding: 'var(--space-sm) var(--space-md)', marginBottom: 'var(--space-md)',
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 'var(--radius-sm)', color: 'var(--danger)', fontSize: 'var(--font-xs)',
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSignUp}>
            {/* Full Name */}
            <div style={{ marginBottom: 'var(--space-md)' }}>
              <label style={{ display: 'block', fontSize: 'var(--font-xs)', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)}
                  placeholder="Aarav Sharma"
                  style={{
                    width: '100%', padding: '12px 12px 12px 38px', borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-light)', background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)', fontSize: 'var(--font-sm)', outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            {/* Email */}
            <div style={{ marginBottom: 'var(--space-md)' }}>
              <label style={{ display: 'block', fontSize: 'var(--font-xs)', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@university.edu"
                  style={{
                    width: '100%', padding: '12px 12px 12px 38px', borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-light)', background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)', fontSize: 'var(--font-sm)', outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            {/* Branch + Year */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
              <div>
                <label style={{ display: 'block', fontSize: 'var(--font-xs)', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Branch</label>
                <div style={{ position: 'relative' }}>
                  <BookOpen size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                  <select value={branch} onChange={e => setBranch(e.target.value)}
                    style={{
                      width: '100%', padding: '12px 12px 12px 38px', borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-light)', background: 'var(--bg-secondary)',
                      color: 'var(--text-primary)', fontSize: 'var(--font-sm)', outline: 'none',
                      boxSizing: 'border-box', appearance: 'auto',
                    }}
                  >
                    {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 'var(--font-xs)', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Year</label>
                <select value={year} onChange={e => setYear(Number(e.target.value))}
                  style={{
                    width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-light)', background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)', fontSize: 'var(--font-sm)', outline: 'none',
                    boxSizing: 'border-box', appearance: 'auto',
                  }}
                >
                  {[1,2,3,4].map(y => <option key={y} value={y}>Year {y}</option>)}
                </select>
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: 'var(--space-lg)' }}>
              <label style={{ display: 'block', fontSize: 'var(--font-xs)', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                <input type={showPassword ? 'text' : 'password'} required value={password}
                  onChange={e => setPassword(e.target.value)} placeholder="Min 6 characters"
                  style={{
                    width: '100%', padding: '12px 42px 12px 38px', borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-light)', background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)', fontSize: 'var(--font-sm)', outline: 'none', boxSizing: 'border-box',
                  }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer',
                }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }}>
              {loading ? 'Creating account...' : 'Create Student Account'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 'var(--space-md)' }}>
            <Link href="/login" style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-sm)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <ArrowLeft size={14} /> Already have an account? Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
