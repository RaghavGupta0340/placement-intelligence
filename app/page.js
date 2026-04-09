'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  BrainCircuit, BarChart3, Users, Building2, Zap, 
  ArrowRight, Sparkles, Shield, TrendingUp, Target,
  ChevronRight, Star, Award, FlaskConical
} from 'lucide-react';

function AnimatedCounter({ end, duration = 2000, prefix = '', suffix = '' }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration]);
  return <>{prefix}{count}{suffix}</>;
}

export default function LandingPage() {
  return (
    <div className="landing-page">
      <div className="landing-bg" />

      {/* Floating particles */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {[
          { w: 5, h: 6, hue: 230, op: 0.2, top: 15, left: 20, dur: 4, del: 0 },
          { w: 7, h: 5, hue: 250, op: 0.25, top: 35, left: 70, dur: 5, del: 0.5 },
          { w: 4, h: 7, hue: 270, op: 0.18, top: 65, left: 40, dur: 6, del: 1 },
          { w: 6, h: 4, hue: 290, op: 0.3, top: 80, left: 85, dur: 3.5, del: 1.5 },
          { w: 5, h: 5, hue: 310, op: 0.22, top: 25, left: 55, dur: 4.5, del: 0.8 },
          { w: 8, h: 6, hue: 330, op: 0.15, top: 50, left: 15, dur: 5.5, del: 1.2 },
        ].map((p, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: p.w,
            height: p.h,
            borderRadius: '50%',
            background: `hsla(${p.hue}, 80%, 60%, ${p.op})`,
            top: `${p.top}%`,
            left: `${p.left}%`,
            animation: `float ${p.dur}s ease-in-out infinite`,
            animationDelay: `${p.del}s`,
          }} />
        ))}
      </div>

      <div className="landing-content">
        <div className="landing-badge">
          <Sparkles size={14} />
          AI-Powered Placement Intelligence • HackAI Season 2
        </div>

        <h1 className="landing-title">
          Transforming Campus{' '}
          <span className="text-gradient">Placements</span>{' '}
          with Agentic AI
        </h1>

        <p className="landing-subtitle">
          Track student journeys, predict selection outcomes, and get autonomous 
          AI recommendations — all in one intelligent dashboard built for your 
          Training & Placement Cell.
        </p>

        <div className="landing-actions">
          <Link href="/dashboard" className="btn btn-primary btn-lg">
            Launch Dashboard
            <ArrowRight size={18} />
          </Link>
          <Link href="/login" className="btn btn-secondary btn-lg">
            <Shield size={18} />
            Sign In
          </Link>
        </div>

        {/* Live Stats Bar */}
        <div style={{
          display: 'flex', gap: 'var(--space-2xl)', justifyContent: 'center',
          marginTop: 'var(--space-2xl)', flexWrap: 'wrap',
        }}>
          {[
            { value: 20, suffix: '+', label: 'Students Tracked', color: 'var(--primary-light)' },
            { value: 12, suffix: '', label: 'Companies Visiting', color: 'var(--success)' },
            { value: 92, suffix: '%', label: 'Match Accuracy', color: 'var(--accent)' },
            { value: 5, suffix: '', label: 'AI Agents Active', color: 'var(--warning)' },
          ].map((stat, i) => (
            <div key={i} style={{ textAlign: 'center', animation: 'fadeInUp 0.6s ease-out', animationDelay: `${0.3 + i * 0.1}s`, animationFillMode: 'both' }}>
              <div style={{ fontSize: 'var(--font-3xl)', fontWeight: 800, color: stat.color }}>
                <AnimatedCounter end={stat.value} suffix={stat.suffix} />
              </div>
              <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Feature Cards */}
        <div className="landing-features" style={{ maxWidth: 900, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
          {[
            { icon: BrainCircuit, title: 'Agentic AI', desc: 'Autonomous matching & decision-making', color: 'stat-icon-blue' },
            { icon: TrendingUp, title: 'Smart Predictions', desc: 'ML-powered selection probability', color: 'stat-icon-green' },
            { icon: Target, title: 'Skill Matching', desc: 'Cosine similarity engine', color: 'stat-icon-pink' },
            { icon: FlaskConical, title: 'What-If Analysis', desc: 'Simulate skill impact on scores', color: 'stat-icon-amber' },
          ].map(({ icon: Icon, title, desc, color }, i) => (
            <div key={i} className="glass-card landing-feature animate-fade-in-up" style={{ animationDelay: `${0.5 + i * 0.1}s`, animationFillMode: 'both' }}>
              <div className={`landing-feature-icon ${color}`}>
                <Icon size={20} />
              </div>
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
          ))}
        </div>

        {/* Architecture Badge */}
        <div style={{
          marginTop: 'var(--space-2xl)', padding: 'var(--space-lg) var(--space-xl)',
          borderRadius: 'var(--radius-lg)', border: '1px solid var(--glass-border)',
          background: 'var(--glass)', maxWidth: 700, width: '100%',
          animation: 'fadeInUp 0.8s ease-out 0.8s both',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-lg)', flexWrap: 'wrap', fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)' }} />
              Next.js 16
            </span>
            <span>•</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)' }} />
              Gemini AI
            </span>
            <span>•</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--warning)' }} />
              Supabase
            </span>
            <span>•</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }} />
              Recharts
            </span>
            <span>•</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Award size={14} />
              Problem Statement 1
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
