'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BrainCircuit, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // For MVP: direct redirect to dashboard (no auth needed for demo)
    setTimeout(() => {
      router.push('/dashboard');
    }, 600);
  };

  return (
    <div className="auth-page">
      <div className="landing-bg" />

      <div className="auth-card glass-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <BrainCircuit size={22} color="white" />
          </div>
          PlaceIQ
        </div>
        <p className="auth-description">
          {isLogin
            ? 'Sign in to access the AI-powered placement dashboard'
            : 'Create an account to get started with PlaceIQ'
          }
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="input-group">
              <label className="input-label">Full Name</label>
              <input className="input" placeholder="Enter your name" type="text" />
            </div>
          )}

          <div className="input-group">
            <label className="input-label">Email</label>
            <div className="input-with-icon">
              <Mail size={16} className="input-icon" />
              <input className="input" placeholder="you@university.edu" type="email" />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <div className="input-with-icon">
              <Lock size={16} className="input-icon" />
              <input className="input" placeholder="••••••••" type="password" />
            </div>
          </div>

          {!isLogin && (
            <div className="input-group">
              <label className="input-label">Role</label>
              <select className="select">
                <option value="admin">TPC Admin</option>
                <option value="student">Student</option>
              </select>
            </div>
          )}

          <button className="btn btn-primary btn-lg" type="submit" disabled={loading} style={{ width: '100%', marginTop: 'var(--space-sm)' }}>
            {loading ? (
              <><div className="spinner" /> Processing...</>
            ) : (
              <>{isLogin ? 'Sign In' : 'Create Account'} <ArrowRight size={16} /></>
            )}
          </button>
        </form>

        <div className="auth-divider">or continue as</div>

        <button
          className="btn btn-secondary"
          style={{ width: '100%' }}
          onClick={() => router.push('/dashboard')}
        >
          <Sparkles size={16} />
          Demo Admin (No Login Required)
        </button>

        <p className="auth-switch">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}
