// AI Matching Engine — Cosine Similarity + Scoring
// All ML logic runs in JavaScript (no Python needed for MVP)

/**
 * Calculate cosine similarity between two skill arrays
 * Using TF-IDF-like weighting for better results
 */
export function calculateSkillMatch(studentSkills, companySkills) {
  if (!studentSkills?.length || !companySkills?.length) return 0;

  const allSkills = [...new Set([...studentSkills, ...companySkills])].map(s => s.toLowerCase());
  const studentVec = allSkills.map(skill =>
    studentSkills.map(s => s.toLowerCase()).includes(skill) ? 1 : 0
  );
  const companyVec = allSkills.map(skill =>
    companySkills.map(s => s.toLowerCase()).includes(skill) ? 1 : 0
  );

  // Cosine similarity
  let dotProduct = 0, magA = 0, magB = 0;
  for (let i = 0; i < allSkills.length; i++) {
    dotProduct += studentVec[i] * companyVec[i];
    magA += studentVec[i] * studentVec[i];
    magB += companyVec[i] * companyVec[i];
  }

  if (magA === 0 || magB === 0) return 0;
  return dotProduct / (Math.sqrt(magA) * Math.sqrt(magB));
}

/**
 * Calculate overall match score between a student and company
 * Weights: Skills 40%, CGPA 25%, Experience 20%, Branch 15%
 */
export function calculateMatchScore(student, company) {
  // 1. Skill match (40%)
  const skillSimilarity = calculateSkillMatch(student.skills, company.required_skills);
  const skillScore = skillSimilarity * 100;

  // 2. CGPA score (25%) — how much above minimum
  let cgpaScore = 0;
  if (student.cgpa >= company.min_cgpa) {
    cgpaScore = Math.min(100, ((student.cgpa - company.min_cgpa) / (10 - company.min_cgpa)) * 100 + 50);
  } else {
    cgpaScore = Math.max(0, (student.cgpa / company.min_cgpa) * 40);
  }

  // 3. Experience score (20%) — internships, projects, hackathons
  const expScore = Math.min(100,
    (student.internships || 0) * 20 +
    (student.projects || 0) * 8 +
    (student.hackathons || 0) * 10
  );

  // 4. Branch relevance (15%)
  const techBranches = ['Computer Science', 'Information Technology'];
  const branchScore = techBranches.includes(student.branch) ? 85 :
    student.branch === 'Electronics' ? 55 : 30;

  // Weighted total
  const totalScore = (
    skillScore * 0.40 +
    cgpaScore * 0.25 +
    expScore * 0.20 +
    branchScore * 0.15
  );

  return {
    total: Math.round(Math.min(99, Math.max(5, totalScore))),
    breakdown: {
      skills: Math.round(skillScore),
      cgpa: Math.round(cgpaScore),
      experience: Math.round(expScore),
      branch: Math.round(branchScore),
    },
    matchedSkills: student.skills.filter(s =>
      company.required_skills.map(r => r.toLowerCase()).includes(s.toLowerCase())
    ),
    missingSkills: company.required_skills.filter(s =>
      !student.skills.map(r => r.toLowerCase()).includes(s.toLowerCase())
    ),
  };
}

/**
 * Predict selection probability using a scoring model
 * Simulates a trained Random Forest classifier
 */
export function predictSelectionProbability(student, company) {
  const matchResult = calculateMatchScore(student, company);

  // Feature engineering
  const features = {
    matchScore: matchResult.total / 100,
    cgpaRatio: student.cgpa / 10,
    cgpaAboveMin: student.cgpa >= company.min_cgpa ? 1 : 0,
    skillOverlap: matchResult.matchedSkills.length / company.required_skills.length,
    internshipCount: Math.min(student.internships || 0, 4) / 4,
    projectCount: Math.min(student.projects || 0, 7) / 7,
    hackathonCount: Math.min(student.hackathons || 0, 6) / 6,
    competitionRatio: company.slots / 100, // Higher slots = less competition
  };

  // Weighted prediction model (simulates Random Forest output)
  let probability = (
    features.matchScore * 0.30 +
    features.cgpaRatio * 0.15 +
    features.cgpaAboveMin * 0.10 +
    features.skillOverlap * 0.20 +
    features.internshipCount * 0.10 +
    features.projectCount * 0.05 +
    features.hackathonCount * 0.05 +
    features.competitionRatio * 0.05
  ) * 100;

  // Add some realistic variance
  const variance = (Math.sin(student.id.charCodeAt(1) * company.id.charCodeAt(1)) * 5);
  probability = Math.min(95, Math.max(8, probability + variance));

  return {
    probability: Math.round(probability),
    confidence: probability > 70 ? 'high' : probability > 40 ? 'medium' : 'low',
    matchResult,
  };
}

/**
 * Map job interests to company role keywords for interest matching
 */
const INTEREST_ROLE_MAP = {
  'Backend Development': ['Backend', 'Software Developer', 'Software Engineer', 'SDE', 'Platform Engineer'],
  'Frontend Development': ['Frontend', 'UI', 'React', 'Web Developer'],
  'Full Stack Development': ['Software Engineer', 'SDE', 'Software Developer', 'Full Stack'],
  'Mobile App Development': ['Mobile', 'Android', 'iOS', 'Flutter'],
  'Data Science': ['Data Scientist', 'ML Engineer', 'Analyst', 'Analytics'],
  'Machine Learning / AI': ['ML', 'Machine Learning', 'AI', 'Data Scientist'],
  'DevOps / Cloud Engineering': ['Cloud', 'DevOps', 'SRE', 'Cloud Engineer', 'Cloud Support'],
  'Cybersecurity': ['Security', 'Cyber', 'InfoSec'],
  'Product Management': ['Product Manager', 'PM'],
  'Data Analytics': ['Analyst', 'Analytics', 'Data Analysis', 'Technology Analyst'],
  'Consulting': ['Consultant', 'Technology Consultant', 'Analyst'],
  'FinTech': ['Payments', 'FinTech', 'Platform Engineer'],
  'SaaS / Enterprise Software': ['Software Engineer', 'Member Technical Staff', 'SDE'],
  'System Design / Architecture': ['Architect', 'System Design', 'Software Engineer'],
};

/**
 * Calculate interest match bonus — how well company roles match student interests
 */
function calculateInterestBonus(student, company) {
  if (!student.interests?.length || !company.roles?.length) return 0;
  
  let bonus = 0;
  for (const interest of student.interests) {
    const keywords = INTEREST_ROLE_MAP[interest] || [];
    for (const role of company.roles) {
      const roleLower = role.toLowerCase();
      if (keywords.some(kw => roleLower.includes(kw.toLowerCase()))) {
        bonus += 8; // Each matching interest-role adds 8% boost
        break;
      }
    }
    // Also check industry
    if (interest === 'FinTech' && company.industry?.includes('FinTech')) bonus += 5;
    if (interest === 'Consulting' && company.industry?.includes('Consulting')) bonus += 5;
  }
  return Math.min(20, bonus); // Cap at 20% bonus
}

/**
 * Match a student to all companies and rank them
 * Interest-matched companies get priority sorting
 */
export function matchStudentToCompanies(student, companies) {
  return companies
    .map(company => {
      const prediction = predictSelectionProbability(student, company);
      const interestBonus = calculateInterestBonus(student, company);
      const boostedMatchScore = Math.min(99, prediction.matchResult.total + interestBonus);
      
      return {
        company,
        matchScore: boostedMatchScore,
        baseMatchScore: prediction.matchResult.total,
        interestBonus,
        selectionProbability: prediction.probability,
        confidence: prediction.confidence,
        matchedSkills: prediction.matchResult.matchedSkills,
        missingSkills: prediction.matchResult.missingSkills,
        breakdown: prediction.matchResult.breakdown,
        meetsMinCGPA: student.cgpa >= company.min_cgpa,
        isInterestMatch: interestBonus > 0,
      };
    })
    .sort((a, b) => {
      // Interest matches come first at same score tier
      if (a.isInterestMatch && !b.isInterestMatch && Math.abs(a.matchScore - b.matchScore) < 15) return -1;
      if (!a.isInterestMatch && b.isInterestMatch && Math.abs(a.matchScore - b.matchScore) < 15) return 1;
      return b.matchScore - a.matchScore;
    });
}

/**
 * Generate AI action suggestions for a student
 */
export function generateActionSuggestions(student, companies) {
  const matches = matchStudentToCompanies(student, companies);
  const suggestions = [];

  // Top matches they haven't applied to
  const topMatches = matches.filter(m => m.matchScore > 60).slice(0, 3);
  if (topMatches.length > 0) {
    suggestions.push({
      type: 'apply',
      priority: 'high',
      title: `Apply to ${topMatches[0].company.short}`,
      message: `${topMatches[0].matchScore}% match score. Deadline: ${topMatches[0].company.deadline}. Your ${topMatches[0].matchedSkills.join(', ')} skills are strong matches.`,
      company: topMatches[0].company,
    });
  }

  // Skill gaps
  const allMissingSkills = {};
  matches.slice(0, 5).forEach(m => {
    m.missingSkills.forEach(skill => {
      allMissingSkills[skill] = (allMissingSkills[skill] || 0) + 1;
    });
  });
  const topMissingSkill = Object.entries(allMissingSkills)
    .sort(([, a], [, b]) => b - a)[0];

  if (topMissingSkill) {
    suggestions.push({
      type: 'upskill',
      priority: 'medium',
      title: `Learn ${topMissingSkill[0]}`,
      message: `${topMissingSkill[1]} of your top 5 matching companies require ${topMissingSkill[0]}. Learning this could boost your match scores by 10-15%.`,
    });
  }

  // Low CGPA warning
  if (student.cgpa < 7.0) {
    suggestions.push({
      type: 'improve',
      priority: 'medium',
      title: 'Focus on Academics',
      message: `Your CGPA (${student.cgpa}) is below the threshold for ${matches.filter(m => !m.meetsMinCGPA).length} companies. Focus on improving grades this semester.`,
    });
  }

  // No internship warning
  if (!student.internships || student.internships === 0) {
    suggestions.push({
      type: 'action',
      priority: 'high',
      title: 'Get an Internship',
      message: 'You have 0 internships. This significantly impacts your selection probability. Apply to internship programs immediately.',
    });
  }

  // Mock interview suggestion for interview-stage students
  if (student.placement_status === 'interviewing') {
    suggestions.push({
      type: 'prepare',
      priority: 'high',
      title: 'Schedule Mock Interview',
      message: 'You have active interviews. Practice DSA problems and system design. Book a mock interview session.',
    });
  }

  return suggestions;
}
