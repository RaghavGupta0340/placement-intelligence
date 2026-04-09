-- ============================================
-- PlaceIQ — Supabase Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. STUDENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  branch TEXT NOT NULL DEFAULT 'Computer Science',
  cgpa DECIMAL(4,2) NOT NULL DEFAULT 0.0,
  skills TEXT[] DEFAULT '{}',
  placement_status TEXT NOT NULL DEFAULT 'seeking'
    CHECK (placement_status IN ('seeking', 'applied', 'interviewing', 'placed')),
  year INT DEFAULT 4,
  internships INT DEFAULT 0,
  projects INT DEFAULT 0,
  hackathons INT DEFAULT 0,
  resume_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 2. COMPANIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  short TEXT NOT NULL,
  industry TEXT NOT NULL DEFAULT 'Technology',
  required_skills TEXT[] DEFAULT '{}',
  min_cgpa DECIMAL(4,2) DEFAULT 0.0,
  package_lpa DECIMAL(6,2) DEFAULT 0.0,
  roles TEXT[] DEFAULT '{}',
  deadline TIMESTAMPTZ,
  visit_date TIMESTAMPTZ,
  slots INT DEFAULT 0,
  logo_color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 3. APPLICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'applied'
    CHECK (status IN ('applied', 'shortlisted', 'interview', 'offered', 'rejected')),
  applied_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  ai_match_score DECIMAL(5,2),
  ai_prediction DECIMAL(5,2),
  UNIQUE(student_id, company_id)
);

-- ============================================
-- 4. INTERVIEWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS interviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  round TEXT NOT NULL DEFAULT 'technical',
  scheduled_at TIMESTAMPTZ,
  result TEXT DEFAULT 'pending'
    CHECK (result IN ('passed', 'failed', 'pending')),
  feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 5. ALERTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'action'
    CHECK (type IN ('warning', 'recommendation', 'deadline', 'action', 'insight')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 6. ROW LEVEL SECURITY
-- ============================================
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Public read access for companies (everyone can see)
CREATE POLICY "Companies are viewable by everyone"
  ON companies FOR SELECT USING (true);

-- Students can view all students (admin dashboard)
CREATE POLICY "Students are viewable by authenticated users"
  ON students FOR SELECT TO authenticated USING (true);

-- Applications viewable by authenticated users
CREATE POLICY "Applications viewable by authenticated"
  ON applications FOR SELECT TO authenticated USING (true);

-- Alerts viewable by authenticated users
CREATE POLICY "Alerts viewable by authenticated"
  ON alerts FOR SELECT TO authenticated USING (true);

-- Allow inserts for service role (admin operations)
CREATE POLICY "Allow service role full access students"
  ON students FOR ALL USING (true);

CREATE POLICY "Allow service role full access applications"
  ON applications FOR ALL USING (true);

CREATE POLICY "Allow service role full access alerts"
  ON alerts FOR ALL USING (true);

-- ============================================
-- 7. SEED DATA — Indian Companies
-- ============================================
INSERT INTO companies (name, short, industry, required_skills, min_cgpa, package_lpa, roles, deadline, visit_date, slots, logo_color) VALUES
  ('Tata Consultancy Services', 'TCS', 'IT Services', '{Java,SQL,Python,Communication,Problem Solving}', 6.0, 7.0, '{Software Developer,Systems Engineer}', '2026-04-20', '2026-04-25', 120, '#1a73e8'),
  ('Infosys Limited', 'Infosys', 'IT Services', '{Java,Python,SQL,Agile,DSA}', 6.5, 6.5, '{Software Engineer,Technology Analyst}', '2026-04-18', '2026-04-22', 100, '#007cc3'),
  ('Wipro Technologies', 'Wipro', 'IT Services', '{Java,C++,SQL,Linux,Communication}', 6.0, 6.0, '{Project Engineer,Software Developer}', '2026-04-15', '2026-04-19', 80, '#6c2dc7'),
  ('Google India', 'Google', 'Technology', '{DSA,System Design,Python,Machine Learning,Algorithms}', 8.0, 32.0, '{Software Engineer L3,SDE Intern}', '2026-04-12', '2026-04-16', 5, '#4285f4'),
  ('Microsoft India', 'Microsoft', 'Technology', '{DSA,System Design,C++,Azure,Problem Solving}', 7.5, 28.0, '{Software Engineer,Cloud Engineer}', '2026-04-14', '2026-04-18', 8, '#00a4ef'),
  ('Amazon India', 'Amazon', 'E-Commerce / Technology', '{DSA,System Design,Java,AWS,Distributed Systems}', 7.0, 26.0, '{SDE-1,Cloud Support Engineer}', '2026-04-13', '2026-04-17', 10, '#ff9900'),
  ('Flipkart', 'Flipkart', 'E-Commerce', '{DSA,Java,React,System Design,Databases}', 7.5, 24.0, '{SDE-1,Backend Engineer}', '2026-04-16', '2026-04-20', 6, '#f7d716'),
  ('Deloitte India', 'Deloitte', 'Consulting', '{SQL,Excel,Python,Analytics,Communication}', 7.0, 12.0, '{Analyst,Technology Consultant}', '2026-04-19', '2026-04-23', 25, '#86bc25'),
  ('Zoho Corporation', 'Zoho', 'SaaS', '{Java,C++,DSA,Problem Solving,Databases}', 6.5, 8.5, '{Member Technical Staff,Software Developer}', '2026-04-17', '2026-04-21', 30, '#e42527'),
  ('Razorpay', 'Razorpay', 'FinTech', '{DSA,Go,React,System Design,Payments}', 7.5, 22.0, '{Software Engineer,Backend Developer}', '2026-04-15', '2026-04-19', 8, '#3395ff'),
  ('Accenture India', 'Accenture', 'IT Consulting', '{Java,SQL,Cloud,Communication,Agile}', 6.0, 6.5, '{Associate Software Engineer,Analyst}', '2026-04-21', '2026-04-26', 150, '#a100ff'),
  ('PhonePe', 'PhonePe', 'FinTech', '{Java,Spring Boot,Microservices,DSA,Kafka}', 7.0, 20.0, '{Software Engineer,Platform Engineer}', '2026-04-14', '2026-04-18', 12, '#5f259f');

-- ============================================
-- 8. INDEXES for performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_students_status ON students(placement_status);
CREATE INDEX IF NOT EXISTS idx_students_branch ON students(branch);
CREATE INDEX IF NOT EXISTS idx_applications_student ON applications(student_id);
CREATE INDEX IF NOT EXISTS idx_applications_company ON applications(company_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_alerts_student ON alerts(student_id);
CREATE INDEX IF NOT EXISTS idx_alerts_read ON alerts(is_read);

-- ============================================
-- Done! Your database is ready.
-- ============================================
