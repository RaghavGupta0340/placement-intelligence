'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { BrainCircuit, Mail, Lock, LogIn, Users, Shield, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [role, setRole] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // Check role matches
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();

    if (profile && profile.role !== role) {
      setError(`This account is registered as ${profile.role === 'admin' ? 'TPC Admin' : 'Student'}. Please select the correct role.`);
      await supabase.auth.signOut();
      setLoading(false);
      return;
    }

    if (role === 'admin') {
      router.push('/dashboard');
    } else {
      router.push('/student');
    }
  };

  const handleDemoAccess = () => {
    router.push('/dashboard');
  };

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
          <h2 style={{ textAlign: 'center', marginBottom: 'var(--space-xs)', fontSize: 'var(--font-xl)' }}>Welcome Back</h2>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: 'var(--space-lg)', fontSize: 'var(--font-sm)' }}>
            Sign in to your account
          </p>

          {/* Role Tabs */}
          <div style={{
            display: 'flex', gap: 'var(--space-xs)', marginBottom: 'var(--space-lg)',
            background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: 4,
          }}>
            <button
              onClick={() => { setRole('student'); setError(''); }}
              style={{
                flex: 1, padding: 'var(--space-sm) var(--space-md)',
                borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer',
                fontWeight: 600, fontSize: 'var(--font-sm)', transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                background: role === 'student' ? 'var(--gradient-primary)' : 'transparent',
                color: role === 'student' ? 'white' : 'var(--text-secondary)',
              }}
            >
              <Users size={16} /> Student
            </button>
            <button
              onClick={() => { setRole('admin'); setError(''); }}
              style={{
                flex: 1, padding: 'var(--space-sm) var(--space-md)',
                borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer',
                fontWeight: 600, fontSize: 'var(--font-sm)', transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                background: role === 'admin' ? 'var(--gradient-accent)' : 'transparent',
                color: role === 'admin' ? 'white' : 'var(--text-secondary)',
              }}
            >
              <Shield size={16} /> TPC Admin
            </button>
          </div>

          {error && (
            <div style={{
              padding: 'var(--space-sm) var(--space-md)', marginBottom: 'var(--space-md)',
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 'var(--radius-sm)', color: 'var(--danger)', fontSize: 'var(--font-xs)',
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 'var(--space-md)' }}>
              <label style={{ display: 'block', fontSize: 'var(--font-xs)', fontWeight: 600, margBottom: 6, color: 'var(--text-secondary)', marginBottom: 6 }}>Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                <input
                  type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@university.edu"
                  style={{
                    width: '100%', padding: '12px 12px 12px 38px', borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-light)', background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)', fontSize: 'var(--font-sm)', outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 'var(--space-lg)' }}>
              <label style={{ display: 'block', fontSize: 'var(--font-xs)', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                <input
                  type={showPassword ? 'text' : 'password'} required value={password}
                  onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                  style={{
                    width: '100%', padding: '12px 42px 12px 38px', borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-light)', background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)', fontSize: 'var(--font-sm)', outline: 'none',
                    boxSizing: 'border-box',
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

            <button type="submit" disabled={loading} className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center', marginBottom: 'var(--space-md)' }}>
              {loading ? 'Signing in...' : <>
                <LogIn size={18} />
                Sign In as {role === 'admin' ? 'TPC Admin' : 'Student'}
              </>}
            </button>
          </form>

          {role === 'student' && (
            <div style={{ textAlign: 'center', marginTop: 'var(--space-sm)' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-sm)' }}>
                Don&apos;t have an account?{' '}
                <Link href="/signup" style={{ color: 'var(--primary-light)', fontWeight: 600 }}>
                  Sign Up <ArrowRight size={12} style={{ display: 'inline' }} />
                </Link>
              </p>
            </div>
          )}

          {role === 'admin' && (
            <div style={{ textAlign: 'center', marginTop: 'var(--space-sm)' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-sm)' }}>
                New TPC member?{' '}
                <Link href="/admin-signup" style={{ color: '#ec4899', fontWeight: 600 }}>
                  Register as Admin <ArrowRight size={12} style={{ display: 'inline' }} />
                </Link>
              </p>
            </div>
          )}

          <div style={{ marginTop: 'var(--space-lg)', borderTop: '1px solid var(--border-light)', paddingTop: 'var(--space-md)' }}>
            <button onClick={handleDemoAccess} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', fontSize: 'var(--font-xs)' }}>
              Demo Access (TPC Dashboard)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
