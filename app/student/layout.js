'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  LayoutDashboard, User, Building2, FileText, BrainCircuit,
  MessageSquare, LogOut, ChevronLeft, Search, Menu, Bell
} from 'lucide-react';
import AgentChat from '@/components/ai/AgentChat';

const navItems = [
  { label: 'Overview', href: '/student', icon: LayoutDashboard },
  { label: 'My Profile', href: '/student/profile', icon: User },
  { label: 'Companies', href: '/student/companies', icon: Building2 },
  { label: 'My Applications', href: '/student/applications', icon: FileText },
  { section: 'AI & Support' },
  { label: 'AI Advisor', href: '/student/advisor', icon: BrainCircuit, badge: 'AI' },
  { label: 'Raise Query', href: '/student/queries', icon: MessageSquare },
];

export default function StudentLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const [student, setStudent] = useState(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser(data.user);
        // Get student record
        supabase.from('students').select('*').eq('user_id', data.user.id).single()
          .then(({ data: s }) => { if (s) setStudent(s); });
      }
    });
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="dashboard-layout">
      <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="sidebar-header">
          <Link href="/student" className="sidebar-logo">
            <div className="sidebar-logo-icon">
              <BrainCircuit size={20} />
            </div>
            {!collapsed && <span className="sidebar-logo-text">PlaceIQ</span>}
          </Link>
          <button className="sidebar-toggle" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <Menu size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item, i) => {
            if (item.section) {
              return !collapsed && (
                <div key={i} className="sidebar-section">{item.section}</div>
              );
            }
            const isActive = item.href === '/student'
              ? pathname === '/student'
              : pathname.startsWith(item.href);
            return (
              <Link key={i} href={item.href} className={`sidebar-link ${isActive ? 'active' : ''}`}>
                <item.icon size={18} />
                {!collapsed && <span>{item.label}</span>}
                {!collapsed && item.badge && <span className="ai-badge" style={{ fontSize: '9px', padding: '2px 6px' }}>{item.badge}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleSignOut} className="sidebar-link" style={{ color: 'var(--danger)', width: '100%', border: 'none', background: 'none', cursor: 'pointer' }}>
            <LogOut size={18} />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="main-header">
          <h2 className="header-title">
            {navItems.find(n => n.href && (n.href === '/student' ? pathname === '/student' : pathname.startsWith(n.href)))?.label || 'Student'}
          </h2>
          <div className="header-actions">
            <div className="header-search">
              <Search size={16} />
              <input type="text" placeholder="Search companies, skills..." />
            </div>
            <div className="header-avatar" title={user?.email || 'Student'}>
              {student?.name?.split(' ').map(n => n[0]).join('').slice(0,2) || 'S'}
            </div>
          </div>
        </header>

        <div className="main-body">
          {children}
        </div>
      </main>

      <AgentChat />
    </div>
  );
}
