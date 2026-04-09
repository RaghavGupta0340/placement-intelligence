-- ============================================
-- PlaceIQ — Full Database Schema v2
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. PROFILES TABLE (linked to auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'student'
    CHECK (role IN ('student', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 2. STUDENTS TABLE (expanded)
-- ============================================
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  branch TEXT NOT NULL DEFAULT 'Computer Science',
  year INT DEFAULT 4,
  cgpa DECIMAL(4,2) NOT NULL DEFAULT 0.0,
  skills TEXT[] DEFAULT '{}',
  placement_status TEXT NOT NULL DEFAULT 'seeking'
    CHECK (placement_status IN ('seeking', 'applied', 'interviewing', 'placed')),
  internships_count INT DEFAULT 0,
  projects_count INT DEFAULT 0,
  hackathons_count INT DEFAULT 0,
  resume_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 3. CERTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS certifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  issuer TEXT NOT NULL DEFAULT '',
  issue_date DATE,
  credential_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 4. INTERNSHIPS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS internships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT '',
  duration TEXT DEFAULT '',
  description TEXT DEFAULT '',
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 5. HACKATHONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS hackathons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'Participant',
  event_date DATE,
  achievement TEXT DEFAULT '',
  certificate_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 6. ACHIEVEMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  achievement_date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 7. COMPANIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  short TEXT NOT NULL,
  industry TEXT NOT NULL DEFAULT 'Technology',
  required_skills TEXT[] DEFAULT '{}',
  min_cgpa DECIMAL(4,2) DEFAULT 0.0,
  package_lpa DECIMAL(6,2) DEFAULT 0.0,
  base_salary_lpa DECIMAL(6,2) DEFAULT 0.0,
  bonus_lpa DECIMAL(6,2) DEFAULT 0.0,
  stocks_lpa DECIMAL(6,2) DEFAULT 0.0,
  joining_bonus_lpa DECIMAL(6,2) DEFAULT 0.0,
  roles TEXT[] DEFAULT '{}',
  deadline TIMESTAMPTZ,
  visit_date TIMESTAMPTZ,
  slots INT DEFAULT 0,
  apply_url TEXT DEFAULT '',
  logo_color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 8. APPLICATIONS TABLE
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
-- 9. ALERTS TABLE
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
-- 10. QUERIES TABLE (Student → TPC)
-- ============================================
CREATE TABLE IF NOT EXISTS queries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  category TEXT NOT NULL DEFAULT 'general'
    CHECK (category IN ('general', 'company', 'technical', 'career', 'complaint')),
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'answered', 'closed')),
  admin_reply TEXT,
  replied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 11. AUTO-CREATE PROFILE ON SIGN UP
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  );
  -- If student role, also create a students record
  IF COALESCE(NEW.raw_user_meta_data->>'role', 'student') = 'student' THEN
    INSERT INTO public.students (user_id, name, email, branch)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'branch', 'Computer Science')
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if any
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 12. ROW LEVEL SECURITY
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE internships ENABLE ROW LEVEL SECURITY;
ALTER TABLE hackathons ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE queries ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read all, update own
CREATE POLICY "Profiles viewable by authenticated" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Students: authenticated can view all, students can update own
CREATE POLICY "Students viewable by authenticated" ON students FOR SELECT TO authenticated USING (true);
CREATE POLICY "Students can update own record" ON students FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Students can insert own record" ON students FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Companies: everyone can read
CREATE POLICY "Companies viewable by everyone" ON companies FOR SELECT USING (true);

-- Applications: authenticated can view, students can insert/update own
CREATE POLICY "Applications viewable by authenticated" ON applications FOR SELECT TO authenticated USING (true);
CREATE POLICY "Students can insert applications" ON applications FOR INSERT TO authenticated
  WITH CHECK (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()));
CREATE POLICY "Students can update own applications" ON applications FOR UPDATE TO authenticated
  USING (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()));

-- Certifications/Internships/Hackathons/Achievements: students manage own
CREATE POLICY "Certs viewable by authenticated" ON certifications FOR SELECT TO authenticated USING (true);
CREATE POLICY "Students manage own certs" ON certifications FOR ALL TO authenticated
  USING (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()));

CREATE POLICY "Internships viewable by authenticated" ON internships FOR SELECT TO authenticated USING (true);
CREATE POLICY "Students manage own internships" ON internships FOR ALL TO authenticated
  USING (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()));

CREATE POLICY "Hackathons viewable by authenticated" ON hackathons FOR SELECT TO authenticated USING (true);
CREATE POLICY "Students manage own hackathons" ON hackathons FOR ALL TO authenticated
  USING (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()));

CREATE POLICY "Achievements viewable by authenticated" ON achievements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Students manage own achievements" ON achievements FOR ALL TO authenticated
  USING (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()));

-- Alerts: viewable by authenticated
CREATE POLICY "Alerts viewable by authenticated" ON alerts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Alerts insertable" ON alerts FOR INSERT TO authenticated WITH CHECK (true);

-- Queries: students can insert and view own, admins view all
CREATE POLICY "Students can view own queries" ON queries FOR SELECT TO authenticated
  USING (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()));
CREATE POLICY "Admins can view all queries" ON queries FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Students can insert queries" ON queries FOR INSERT TO authenticated
  WITH CHECK (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()));
CREATE POLICY "Admins can update queries" ON queries FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ============================================
-- 13. SEED DATA — Indian Companies with CTC
-- ============================================
INSERT INTO companies (name, short, industry, required_skills, min_cgpa, package_lpa, base_salary_lpa, bonus_lpa, stocks_lpa, joining_bonus_lpa, roles, deadline, visit_date, slots, apply_url, logo_color) VALUES
  ('Tata Consultancy Services', 'TCS', 'IT Services', '{Java,SQL,Python,Communication,Problem Solving}', 6.0, 7.0, 5.5, 0.5, 0, 1.0, '{Software Developer,Systems Engineer}', '2026-04-20', '2026-04-25', 120, 'https://careers.tcs.com', '#1a73e8'),
  ('Infosys Limited', 'Infosys', 'IT Services', '{Java,Python,SQL,Agile,DSA}', 6.5, 6.5, 5.0, 0.5, 0, 1.0, '{Software Engineer,Technology Analyst}', '2026-04-18', '2026-04-22', 100, 'https://careers.infosys.com', '#007cc3'),
  ('Wipro Technologies', 'Wipro', 'IT Services', '{Java,C++,SQL,Linux,Communication}', 6.0, 6.0, 4.8, 0.4, 0, 0.8, '{Project Engineer,Software Developer}', '2026-04-15', '2026-04-19', 80, 'https://careers.wipro.com', '#6c2dc7'),
  ('Google India', 'Google', 'Technology', '{DSA,System Design,Python,Machine Learning,Algorithms}', 8.0, 32.0, 20.0, 4.0, 6.0, 2.0, '{Software Engineer L3,SDE Intern}', '2026-04-12', '2026-04-16', 5, 'https://careers.google.com', '#4285f4'),
  ('Microsoft India', 'Microsoft', 'Technology', '{DSA,System Design,C++,Azure,Problem Solving}', 7.5, 28.0, 18.0, 3.5, 4.5, 2.0, '{Software Engineer,Cloud Engineer}', '2026-04-14', '2026-04-18', 8, 'https://careers.microsoft.com', '#00a4ef'),
  ('Amazon India', 'Amazon', 'E-Commerce / Technology', '{DSA,System Design,Java,AWS,Distributed Systems}', 7.0, 26.0, 16.0, 3.0, 5.0, 2.0, '{SDE-1,Cloud Support Engineer}', '2026-04-13', '2026-04-17', 10, 'https://amazon.jobs', '#ff9900'),
  ('Flipkart', 'Flipkart', 'E-Commerce', '{DSA,Java,React,System Design,Databases}', 7.5, 24.0, 15.0, 3.0, 4.0, 2.0, '{SDE-1,Backend Engineer}', '2026-04-16', '2026-04-20', 6, 'https://flipkartcareers.com', '#f7d716'),
  ('Deloitte India', 'Deloitte', 'Consulting', '{SQL,Excel,Python,Analytics,Communication}', 7.0, 12.0, 8.5, 1.5, 0, 2.0, '{Analyst,Technology Consultant}', '2026-04-19', '2026-04-23', 25, 'https://careers.deloitte.com', '#86bc25'),
  ('Zoho Corporation', 'Zoho', 'SaaS', '{Java,C++,DSA,Problem Solving,Databases}', 6.5, 8.5, 6.5, 1.0, 0, 1.0, '{Member Technical Staff,Software Developer}', '2026-04-17', '2026-04-21', 30, 'https://careers.zoho.com', '#e42527'),
  ('Razorpay', 'Razorpay', 'FinTech', '{DSA,Go,React,System Design,Payments}', 7.5, 22.0, 14.0, 2.5, 3.5, 2.0, '{Software Engineer,Backend Developer}', '2026-04-15', '2026-04-19', 8, 'https://razorpay.com/careers', '#3395ff'),
  ('Accenture India', 'Accenture', 'IT Consulting', '{Java,SQL,Cloud,Communication,Agile}', 6.0, 6.5, 5.0, 0.5, 0, 1.0, '{Associate Software Engineer,Analyst}', '2026-04-21', '2026-04-26', 150, 'https://accenture.com/careers', '#a100ff'),
  ('PhonePe', 'PhonePe', 'FinTech', '{Java,Spring Boot,Microservices,DSA,Kafka}', 7.0, 20.0, 13.0, 2.5, 3.0, 1.5, '{Software Engineer,Platform Engineer}', '2026-04-14', '2026-04-18', 12, 'https://phonepe.com/careers', '#5f259f');

-- ============================================
-- 14. INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_students_user ON students(user_id);
CREATE INDEX IF NOT EXISTS idx_students_status ON students(placement_status);
CREATE INDEX IF NOT EXISTS idx_applications_student ON applications(student_id);
CREATE INDEX IF NOT EXISTS idx_applications_company ON applications(company_id);
CREATE INDEX IF NOT EXISTS idx_queries_student ON queries(student_id);
CREATE INDEX IF NOT EXISTS idx_queries_status ON queries(status);
CREATE INDEX IF NOT EXISTS idx_certs_student ON certifications(student_id);
CREATE INDEX IF NOT EXISTS idx_internships_student ON internships(student_id);

-- ============================================
-- Done! Your database is ready.
-- ============================================
