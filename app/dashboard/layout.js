'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  LayoutDashboard, Users, Building2, FileText, BrainCircuit,
  TrendingUp, Bell, BarChart3, LogOut, ChevronLeft, Search,
  Menu, Sparkles, FlaskConical, MessageSquare, PlusCircle, Shield
} from 'lucide-react';
import AgentChat from '@/components/ai/AgentChat';

const navItems = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Students', href: '/dashboard/students', icon: Users },
  { label: 'Companies', href: '/dashboard/companies', icon: Building2 },
  { label: 'Manage Companies', href: '/dashboard/manage-companies', icon: PlusCircle, badge: 'NEW' },
  { label: 'Applications', href: '/dashboard/applications', icon: FileText },
  { section: 'AI Intelligence' },
  { label: 'AI Matching', href: '/dashboard/matching', icon: BrainCircuit, badge: 'AI' },
  { label: 'Predictions', href: '/dashboard/predictions', icon: TrendingUp, badge: 'AI' },
  { label: 'What-If', href: '/dashboard/whatif', icon: FlaskConical, badge: 'NEW' },
  { label: 'Smart Alerts', href: '/dashboard/alerts', icon: Bell, badgeCount: 5 },
  { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { section: 'Support' },
  { label: 'Student Queries', href: '/dashboard/queries', icon: MessageSquare },
];

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        supabase.from('profiles').select('*').eq('id', data.user.id).single()
          .then(({ data: p }) => {
            if (p) setAdmin(p);
          });
      }
    });
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  const getPageTitle = () => {
    const item = navItems.find(n => n.href === pathname);
    return item?.label || 'Dashboard';
  };

  return (
    <div className="dashboard-layout">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            zIndex: 150, display: 'none',
          }}
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <BrainCircuit size={20} />
          </div>
          <span className="sidebar-brand">PlaceIQ</span>
          <span style={{ fontSize: '9px', padding: '2px 6px', borderRadius: 10, background: 'rgba(236,72,153,0.15)', color: '#ec4899', fontWeight: 700, marginLeft: 4 }}>ADMIN</span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item, i) => {
            if (item.section) {
              return (
                <div key={i} className="sidebar-section-title">
                  {item.section}
                </div>
              );
            }

            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {item.badge && <span className="ai-badge">{item.badge}</span>}
                {item.badgeCount && (
                  <span className="sidebar-link-badge">{item.badgeCount}</span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div style={{ padding: 'var(--space-sm) var(--space-md)', borderTop: '1px solid var(--border)', marginBottom: 'var(--space-sm)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'var(--gradient-accent)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: '11px', fontWeight: 700, color: 'white',
              }}>
                {admin?.full_name?.split(' ').map(n => n[0]).join('').slice(0,2) || 'TP'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 'var(--font-xs)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {admin?.full_name || 'TPC Admin'}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Shield size={9} /> Administrator
                </div>
              </div>
            </div>
          </div>
          <div className="sidebar-link" style={{ cursor: 'pointer', color: 'var(--danger)' }} onClick={handleSignOut}>
            <LogOut size={18} />
            <span>Sign Out</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <header className="header">
          <div className="header-left">
            <button
              className="btn btn-ghost btn-icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ display: 'none' }}
              id="mobile-menu-btn"
            >
              <Menu size={20} />
            </button>
            <h2 className="header-title">{getPageTitle()}</h2>
          </div>

          <div className="header-search">
            <Search size={16} style={{ color: 'var(--text-tertiary)' }} />
            <input placeholder="Search students, companies..." />
          </div>

          <div className="header-right">
            <button className="btn btn-ghost btn-icon header-notification">
              <Bell size={18} />
              <span className="notification-dot" />
            </button>
            <div className="header-avatar" title={admin?.full_name || 'Admin'}>
              {admin?.full_name?.split(' ').map(n => n[0]).join('').slice(0,2) || 'TP'}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="page-content">
          {children}
        </main>
      </div>

      {/* Floating AI Agent Chat */}
      <AgentChat />

      <style jsx>{`
        @media (max-width: 768px) {
          .sidebar-overlay { display: block !important; }
          #mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
