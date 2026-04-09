// Synthetic Indian Placement Data — Seed Data
// Realistic companies, students, and placement scenarios

export const companies = [
  {
    id: 'c1',
    name: 'Tata Consultancy Services',
    short: 'TCS',
    industry: 'IT Services',
    required_skills: ['Java', 'SQL', 'Python', 'Communication', 'Problem Solving'],
    min_cgpa: 6.0,
    package_lpa: 7.0,
    roles: ['Software Developer', 'Systems Engineer'],
    deadline: '2026-04-20',
    visit_date: '2026-04-25',
    slots: 120,
    logo_color: '#1a73e8',
  },
  {
    id: 'c2',
    name: 'Infosys Limited',
    short: 'Infosys',
    industry: 'IT Services',
    required_skills: ['Java', 'Python', 'SQL', 'Agile', 'DSA'],
    min_cgpa: 6.5,
    package_lpa: 6.5,
    roles: ['Software Engineer', 'Technology Analyst'],
    deadline: '2026-04-18',
    visit_date: '2026-04-22',
    slots: 100,
    logo_color: '#007cc3',
  },
  {
    id: 'c3',
    name: 'Wipro Technologies',
    short: 'Wipro',
    industry: 'IT Services',
    required_skills: ['Java', 'C++', 'SQL', 'Linux', 'Communication'],
    min_cgpa: 6.0,
    package_lpa: 6.0,
    roles: ['Project Engineer', 'Software Developer'],
    deadline: '2026-04-15',
    visit_date: '2026-04-19',
    slots: 80,
    logo_color: '#6c2dc7',
  },
  {
    id: 'c4',
    name: 'Google India',
    short: 'Google',
    industry: 'Technology',
    required_skills: ['DSA', 'System Design', 'Python', 'Machine Learning', 'Algorithms'],
    min_cgpa: 8.0,
    package_lpa: 32.0,
    roles: ['Software Engineer L3', 'SDE Intern'],
    deadline: '2026-04-12',
    visit_date: '2026-04-16',
    slots: 5,
    logo_color: '#4285f4',
  },
  {
    id: 'c5',
    name: 'Microsoft India',
    short: 'Microsoft',
    industry: 'Technology',
    required_skills: ['DSA', 'System Design', 'C++', 'Azure', 'Problem Solving'],
    min_cgpa: 7.5,
    package_lpa: 28.0,
    roles: ['Software Engineer', 'Cloud Engineer'],
    deadline: '2026-04-14',
    visit_date: '2026-04-18',
    slots: 8,
    logo_color: '#00a4ef',
  },
  {
    id: 'c6',
    name: 'Amazon India',
    short: 'Amazon',
    industry: 'E-Commerce / Technology',
    required_skills: ['DSA', 'System Design', 'Java', 'AWS', 'Distributed Systems'],
    min_cgpa: 7.0,
    package_lpa: 26.0,
    roles: ['SDE-1', 'Cloud Support Engineer'],
    deadline: '2026-04-13',
    visit_date: '2026-04-17',
    slots: 10,
    logo_color: '#ff9900',
  },
  {
    id: 'c7',
    name: 'Flipkart',
    short: 'Flipkart',
    industry: 'E-Commerce',
    required_skills: ['DSA', 'Java', 'React', 'System Design', 'Databases'],
    min_cgpa: 7.5,
    package_lpa: 24.0,
    roles: ['SDE-1', 'Backend Engineer'],
    deadline: '2026-04-16',
    visit_date: '2026-04-20',
    slots: 6,
    logo_color: '#f7d716',
  },
  {
    id: 'c8',
    name: 'Deloitte India',
    short: 'Deloitte',
    industry: 'Consulting',
    required_skills: ['SQL', 'Excel', 'Python', 'Analytics', 'Communication'],
    min_cgpa: 7.0,
    package_lpa: 12.0,
    roles: ['Analyst', 'Technology Consultant'],
    deadline: '2026-04-19',
    visit_date: '2026-04-23',
    slots: 25,
    logo_color: '#86bc25',
  },
  {
    id: 'c9',
    name: 'Zoho Corporation',
    short: 'Zoho',
    industry: 'SaaS',
    required_skills: ['Java', 'C++', 'DSA', 'Problem Solving', 'Databases'],
    min_cgpa: 6.5,
    package_lpa: 8.5,
    roles: ['Member Technical Staff', 'Software Developer'],
    deadline: '2026-04-17',
    visit_date: '2026-04-21',
    slots: 30,
    logo_color: '#e42527',
  },
  {
    id: 'c10',
    name: 'Razorpay',
    short: 'Razorpay',
    industry: 'FinTech',
    required_skills: ['DSA', 'Go', 'React', 'System Design', 'Payments'],
    min_cgpa: 7.5,
    package_lpa: 22.0,
    roles: ['Software Engineer', 'Backend Developer'],
    deadline: '2026-04-15',
    visit_date: '2026-04-19',
    slots: 8,
    logo_color: '#3395ff',
  },
  {
    id: 'c11',
    name: 'Accenture India',
    short: 'Accenture',
    industry: 'IT Consulting',
    required_skills: ['Java', 'SQL', 'Cloud', 'Communication', 'Agile'],
    min_cgpa: 6.0,
    package_lpa: 6.5,
    roles: ['Associate Software Engineer', 'Analyst'],
    deadline: '2026-04-21',
    visit_date: '2026-04-26',
    slots: 150,
    logo_color: '#a100ff',
  },
  {
    id: 'c12',
    name: 'PhonePe',
    short: 'PhonePe',
    industry: 'FinTech',
    required_skills: ['Java', 'Spring Boot', 'Microservices', 'DSA', 'Kafka'],
    min_cgpa: 7.0,
    package_lpa: 20.0,
    roles: ['Software Engineer', 'Platform Engineer'],
    deadline: '2026-04-14',
    visit_date: '2026-04-18',
    slots: 12,
    logo_color: '#5f259f',
  },
];

export const students = [
  {
    id: 's1', name: 'Aarav Sharma', email: 'aarav.sharma@university.edu',
    branch: 'Computer Science', cgpa: 8.7,
    skills: ['Python', 'DSA', 'Machine Learning', 'System Design', 'SQL', 'React'],
    placement_status: 'seeking', year: 4,
    internships: 2, projects: 5, hackathons: 3,
  },
  {
    id: 's2', name: 'Priya Patel', email: 'priya.patel@university.edu',
    branch: 'Computer Science', cgpa: 9.1,
    skills: ['Java', 'DSA', 'System Design', 'C++', 'Algorithms', 'Databases'],
    placement_status: 'interviewing', year: 4,
    internships: 3, projects: 4, hackathons: 5,
  },
  {
    id: 's3', name: 'Rohit Kumar', email: 'rohit.kumar@university.edu',
    branch: 'Information Technology', cgpa: 7.2,
    skills: ['Java', 'SQL', 'Python', 'Communication', 'Agile'],
    placement_status: 'applied', year: 4,
    internships: 1, projects: 3, hackathons: 0,
  },
  {
    id: 's4', name: 'Ananya Reddy', email: 'ananya.reddy@university.edu',
    branch: 'Computer Science', cgpa: 8.3,
    skills: ['Python', 'React', 'Node.js', 'MongoDB', 'DSA', 'AWS'],
    placement_status: 'seeking', year: 4,
    internships: 2, projects: 6, hackathons: 2,
  },
  {
    id: 's5', name: 'Vikram Singh', email: 'vikram.singh@university.edu',
    branch: 'Electronics', cgpa: 6.8,
    skills: ['C++', 'Embedded Systems', 'IoT', 'Python', 'Linux'],
    placement_status: 'seeking', year: 4,
    internships: 1, projects: 2, hackathons: 1,
  },
  {
    id: 's6', name: 'Sneha Joshi', email: 'sneha.joshi@university.edu',
    branch: 'Computer Science', cgpa: 7.8,
    skills: ['Java', 'Spring Boot', 'SQL', 'React', 'Docker', 'Communication'],
    placement_status: 'placed', year: 4,
    internships: 2, projects: 4, hackathons: 2,
  },
  {
    id: 's7', name: 'Arjun Mehta', email: 'arjun.mehta@university.edu',
    branch: 'Computer Science', cgpa: 6.2,
    skills: ['Python', 'SQL', 'Excel', 'Communication'],
    placement_status: 'seeking', year: 4,
    internships: 0, projects: 1, hackathons: 0,
  },
  {
    id: 's8', name: 'Kavya Nair', email: 'kavya.nair@university.edu',
    branch: 'Information Technology', cgpa: 8.0,
    skills: ['Python', 'Machine Learning', 'Data Analysis', 'SQL', 'Tableau', 'Statistics'],
    placement_status: 'applied', year: 4,
    internships: 2, projects: 3, hackathons: 1,
  },
  {
    id: 's9', name: 'Rahul Gupta', email: 'rahul.gupta@university.edu',
    branch: 'Computer Science', cgpa: 7.5,
    skills: ['Java', 'DSA', 'C++', 'Problem Solving', 'Databases'],
    placement_status: 'interviewing', year: 4,
    internships: 1, projects: 3, hackathons: 2,
  },
  {
    id: 's10', name: 'Divya Iyer', email: 'divya.iyer@university.edu',
    branch: 'Computer Science', cgpa: 9.3,
    skills: ['DSA', 'System Design', 'C++', 'Python', 'Algorithms', 'Machine Learning', 'Go'],
    placement_status: 'placed', year: 4,
    internships: 3, projects: 7, hackathons: 6,
  },
  {
    id: 's11', name: 'Manish Tiwari', email: 'manish.tiwari@university.edu',
    branch: 'Mechanical', cgpa: 6.5,
    skills: ['Excel', 'Communication', 'AutoCAD', 'Python'],
    placement_status: 'seeking', year: 4,
    internships: 0, projects: 2, hackathons: 0,
  },
  {
    id: 's12', name: 'Riya Deshmukh', email: 'riya.deshmukh@university.edu',
    branch: 'Computer Science', cgpa: 8.1,
    skills: ['React', 'Node.js', 'JavaScript', 'MongoDB', 'CSS', 'Git'],
    placement_status: 'applied', year: 4,
    internships: 2, projects: 5, hackathons: 3,
  },
  {
    id: 's13', name: 'Aditya Verma', email: 'aditya.verma@university.edu',
    branch: 'Information Technology', cgpa: 7.0,
    skills: ['Java', 'SQL', 'Linux', 'Communication', 'Cloud'],
    placement_status: 'seeking', year: 4,
    internships: 1, projects: 2, hackathons: 0,
  },
  {
    id: 's14', name: 'Pooja Saxena', email: 'pooja.saxena@university.edu',
    branch: 'Computer Science', cgpa: 8.5,
    skills: ['Python', 'DSA', 'React', 'SQL', 'AWS', 'Docker', 'Kubernetes'],
    placement_status: 'interviewing', year: 4,
    internships: 2, projects: 4, hackathons: 4,
  },
  {
    id: 's15', name: 'Karan Malhotra', email: 'karan.malhotra@university.edu',
    branch: 'Electronics', cgpa: 7.3,
    skills: ['C++', 'Python', 'MATLAB', 'Signal Processing', 'Communication'],
    placement_status: 'seeking', year: 4,
    internships: 1, projects: 3, hackathons: 1,
  },
  {
    id: 's16', name: 'Neha Agarwal', email: 'neha.agarwal@university.edu',
    branch: 'Computer Science', cgpa: 7.9,
    skills: ['Java', 'Spring Boot', 'Microservices', 'DSA', 'Kafka', 'SQL'],
    placement_status: 'applied', year: 4,
    internships: 1, projects: 3, hackathons: 2,
  },
  {
    id: 's17', name: 'Siddharth Rao', email: 'siddharth.rao@university.edu',
    branch: 'Computer Science', cgpa: 5.8,
    skills: ['HTML', 'CSS', 'JavaScript'],
    placement_status: 'seeking', year: 4,
    internships: 0, projects: 1, hackathons: 0,
  },
  {
    id: 's18', name: 'Ishita Banerjee', email: 'ishita.banerjee@university.edu',
    branch: 'Information Technology', cgpa: 8.4,
    skills: ['Python', 'Analytics', 'SQL', 'Excel', 'Communication', 'Tableau'],
    placement_status: 'seeking', year: 4,
    internships: 2, projects: 3, hackathons: 1,
  },
  {
    id: 's19', name: 'Varun Chopra', email: 'varun.chopra@university.edu',
    branch: 'Computer Science', cgpa: 7.6,
    skills: ['Go', 'React', 'DSA', 'System Design', 'Docker'],
    placement_status: 'applied', year: 4,
    internships: 1, projects: 4, hackathons: 3,
  },
  {
    id: 's20', name: 'Meera Krishnan', email: 'meera.krishnan@university.edu',
    branch: 'Computer Science', cgpa: 8.8,
    skills: ['DSA', 'Algorithms', 'Python', 'Java', 'System Design', 'Machine Learning'],
    placement_status: 'placed', year: 4,
    internships: 3, projects: 5, hackathons: 4,
  },
];

export const applications = [
  { id: 'a1', student_id: 's2', company_id: 'c4', status: 'interview', applied_at: '2026-04-05', ai_match_score: 88, ai_prediction: 72 },
  { id: 'a2', student_id: 's2', company_id: 'c5', status: 'shortlisted', applied_at: '2026-04-06', ai_match_score: 85, ai_prediction: 68 },
  { id: 'a3', student_id: 's3', company_id: 'c1', status: 'applied', applied_at: '2026-04-07', ai_match_score: 76, ai_prediction: 65 },
  { id: 'a4', student_id: 's3', company_id: 'c2', status: 'applied', applied_at: '2026-04-07', ai_match_score: 72, ai_prediction: 58 },
  { id: 'a5', student_id: 's6', company_id: 'c12', status: 'offered', applied_at: '2026-04-01', ai_match_score: 82, ai_prediction: 75 },
  { id: 'a6', student_id: 's9', company_id: 'c9', status: 'interview', applied_at: '2026-04-04', ai_match_score: 79, ai_prediction: 62 },
  { id: 'a7', student_id: 's9', company_id: 'c7', status: 'shortlisted', applied_at: '2026-04-05', ai_match_score: 74, ai_prediction: 45 },
  { id: 'a8', student_id: 's10', company_id: 'c4', status: 'offered', applied_at: '2026-03-28', ai_match_score: 95, ai_prediction: 89 },
  { id: 'a9', student_id: 's10', company_id: 'c5', status: 'offered', applied_at: '2026-03-28', ai_match_score: 92, ai_prediction: 85 },
  { id: 'a10', student_id: 's12', company_id: 'c7', status: 'applied', applied_at: '2026-04-08', ai_match_score: 71, ai_prediction: 50 },
  { id: 'a11', student_id: 's14', company_id: 'c6', status: 'interview', applied_at: '2026-04-03', ai_match_score: 83, ai_prediction: 65 },
  { id: 'a12', student_id: 's14', company_id: 'c10', status: 'shortlisted', applied_at: '2026-04-04', ai_match_score: 77, ai_prediction: 55 },
  { id: 'a13', student_id: 's16', company_id: 'c12', status: 'applied', applied_at: '2026-04-06', ai_match_score: 85, ai_prediction: 70 },
  { id: 'a14', student_id: 's19', company_id: 'c10', status: 'applied', applied_at: '2026-04-07', ai_match_score: 80, ai_prediction: 58 },
  { id: 'a15', student_id: 's8', company_id: 'c8', status: 'applied', applied_at: '2026-04-06', ai_match_score: 78, ai_prediction: 63 },
  { id: 'a16', student_id: 's1', company_id: 'c4', status: 'shortlisted', applied_at: '2026-04-05', ai_match_score: 84, ai_prediction: 60 },
  { id: 'a17', student_id: 's1', company_id: 'c6', status: 'applied', applied_at: '2026-04-07', ai_match_score: 78, ai_prediction: 55 },
  { id: 'a18', student_id: 's20', company_id: 'c4', status: 'offered', applied_at: '2026-03-30', ai_match_score: 93, ai_prediction: 87 },
  { id: 'a19', student_id: 's4', company_id: 'c6', status: 'applied', applied_at: '2026-04-08', ai_match_score: 80, ai_prediction: 58 },
  { id: 'a20', student_id: 's4', company_id: 'c7', status: 'applied', applied_at: '2026-04-08', ai_match_score: 73, ai_prediction: 48 },
];

export const alerts = [
  {
    id: 'al1', student_id: 's7', type: 'warning',
    title: 'Low Placement Readiness',
    message: 'Arjun has only 3 skills and 0 internships. Recommend DSA course and mock interviews immediately.',
    is_read: false, created_at: '2026-04-09T10:00:00',
  },
  {
    id: 'al2', student_id: 's17', type: 'warning',
    title: 'Critical: Very Low CGPA & Skills',
    message: 'Siddharth has 5.8 CGPA and only basic web skills. High risk of missing all placements. Urgent intervention needed.',
    is_read: false, created_at: '2026-04-09T09:30:00',
  },
  {
    id: 'al3', student_id: 's1', type: 'recommendation',
    title: 'Apply to Microsoft — 84% Match',
    message: 'Aarav\'s skills strongly match Microsoft requirements. Deadline in 5 days. Recommend immediate application.',
    is_read: false, created_at: '2026-04-09T08:00:00',
  },
  {
    id: 'al4', student_id: 's3', type: 'deadline',
    title: 'Wipro Deadline Tomorrow',
    message: 'Rohit has not applied to Wipro yet. Deadline: April 15. His match score is 72%. Auto-recommend application.',
    is_read: false, created_at: '2026-04-09T07:00:00',
  },
  {
    id: 'al5', student_id: 's11', type: 'action',
    title: 'Suggest Career Pivot',
    message: 'Manish (Mechanical) shows interest in coding. Recommend Python + SQL upskilling track. TCS/Accenture have cross-branch hiring.',
    is_read: true, created_at: '2026-04-08T15:00:00',
  },
  {
    id: 'al6', student_id: 's14', type: 'recommendation',
    title: 'Interview Prep: Amazon Round 2',
    message: 'Pooja cleared Amazon Round 1. Schedule mock System Design interview. Focus areas: Distributed Systems, AWS.',
    is_read: false, created_at: '2026-04-09T11:00:00',
  },
  {
    id: 'al7', student_id: 's5', type: 'action',
    title: 'Cross-skill Opportunity',
    message: 'Vikram\'s IoT + Python skills match Bosch & Siemens profiles. No applications yet. Trigger outreach.',
    is_read: true, created_at: '2026-04-08T12:00:00',
  },
  {
    id: 'al8', student_id: null, type: 'insight',
    title: 'TPC Insight: DSA Gap Detected',
    message: '38% of students lack DSA skills. Top 6 companies require it. Recommend batch-wide DSA bootcamp before placement season peaks.',
    is_read: false, created_at: '2026-04-09T06:00:00',
  },
];

// Helper: get computed placement stats
export function getPlacementStats() {
  const totalStudents = students.length;
  const placed = students.filter(s => s.placement_status === 'placed').length;
  const interviewing = students.filter(s => s.placement_status === 'interviewing').length;
  const applied = students.filter(s => s.placement_status === 'applied').length;
  const seeking = students.filter(s => s.placement_status === 'seeking').length;

  const avgCGPA = (students.reduce((sum, s) => sum + s.cgpa, 0) / totalStudents).toFixed(1);

  const totalApplications = applications.length;
  const offers = applications.filter(a => a.status === 'offered').length;
  const interviews = applications.filter(a => a.status === 'interview').length;
  const avgPackage = companies.reduce((sum, c) => sum + c.package_lpa, 0) / companies.length;

  return {
    totalStudents,
    placed,
    interviewing,
    applied,
    seeking,
    avgCGPA,
    totalApplications,
    offers,
    interviews,
    totalCompanies: companies.length,
    avgPackage: avgPackage.toFixed(1),
    placementRate: ((placed / totalStudents) * 100).toFixed(0),
    conversionRate: totalApplications > 0 ? ((offers / totalApplications) * 100).toFixed(0) : 0,
    unreadAlerts: alerts.filter(a => !a.is_read).length,
  };
}

// Helper: get student by ID
export function getStudentById(id) {
  return students.find(s => s.id === id);
}

// Helper: get company by ID
export function getCompanyById(id) {
  return companies.find(c => c.id === id);
}

// Helper: get applications for a student
export function getStudentApplications(studentId) {
  return applications
    .filter(a => a.student_id === studentId)
    .map(a => ({
      ...a,
      company: getCompanyById(a.company_id),
    }));
}

// Helper: get applications for a company
export function getCompanyApplications(companyId) {
  return applications
    .filter(a => a.company_id === companyId)
    .map(a => ({
      ...a,
      student: getStudentById(a.student_id),
    }));
}

// Helper: get alerts for a student (or all)
export function getStudentAlerts(studentId = null) {
  if (!studentId) return alerts;
  return alerts.filter(a => a.student_id === studentId || a.student_id === null);
}
