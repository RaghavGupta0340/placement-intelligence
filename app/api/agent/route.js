// RAG-Powered Agentic AI API Route
// Retrieves real data from Supabase based on user role, feeds to Gemini
import { NextResponse } from 'next/server';
import { companies as seedCompanies } from '@/lib/data/seed';
import { matchStudentToCompanies, generateActionSuggestions } from '@/lib/ai/matching';

// Build RAG context — handles BOTH admin and student modes
async function buildRAGContext(userId, role) {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // Fetch companies from DB (fall back to seed)
    const { data: dbCompanies } = await supabase.from('companies').select('*');
    const allCompanies = (dbCompanies && dbCompanies.length > 0) ? dbCompanies : seedCompanies;

    if (role === 'admin') {
      // ADMIN MODE: load ALL students
      const { data: allStudents } = await supabase
        .from('students')
        .select('*')
        .order('name');

      // Also get students from seed data as fallback
      const { students: seedStudents } = await import('@/lib/data/seed');
      const students = (allStudents && allStudents.length > 0) ? allStudents : seedStudents;

      return {
        mode: 'admin',
        students,
        companies: allCompanies,
      };
    } else {
      // STUDENT MODE: load only their profile
      const { data: student } = await supabase
        .from('students')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!student) return null;

      const [certs, interns, hackathons, achievements] = await Promise.all([
        supabase.from('certifications').select('*').eq('student_id', student.id),
        supabase.from('internships').select('*').eq('student_id', student.id),
        supabase.from('hackathons').select('*').eq('student_id', student.id),
        supabase.from('achievements').select('*').eq('student_id', student.id),
      ]);

      const matches = matchStudentToCompanies(student, allCompanies);
      const suggestions = generateActionSuggestions(student, allCompanies);
      const eligibleCompanies = allCompanies.filter(c => student.cgpa >= c.min_cgpa);

      return {
        mode: 'student',
        student,
        certifications: certs.data || [],
        internships: interns.data || [],
        hackathons: hackathons.data || [],
        achievements: achievements.data || [],
        topMatches: matches.slice(0, 6),
        allMatches: matches,
        suggestions,
        eligibleCompanies,
        companies: allCompanies,
      };
    }
  } catch (err) {
    console.error('RAG context build error:', err);
    return null;
  }
}

// Format admin RAG document
function formatAdminRAGDocument(ctx) {
  const lines = [];

  lines.push('=== TPC ADMIN DASHBOARD — FULL PLACEMENT DATA ===\n');

  // Student summary
  lines.push(`Total Students: ${ctx.students.length}`);
  const seeking = ctx.students.filter(s => s.placement_status === 'seeking');
  const placed = ctx.students.filter(s => s.placement_status === 'placed');
  const interviewing = ctx.students.filter(s => s.placement_status === 'interviewing');
  lines.push(`Seeking: ${seeking.length} | Interviewing: ${interviewing.length} | Placed: ${placed.length}`);

  // At-risk students
  const atRisk = ctx.students.filter(s =>
    s.placement_status === 'seeking' && (s.cgpa < 7 || (s.skills?.length || 0) < 4)
  );
  lines.push(`\n--- AT-RISK STUDENTS (${atRisk.length}) ---`);
  atRisk.forEach(s => {
    const reasons = [];
    if (s.cgpa < 7) reasons.push(`low CGPA ${s.cgpa}`);
    if ((s.skills?.length || 0) < 4) reasons.push(`only ${s.skills?.length || 0} skills`);
    if ((s.internships_count || s.internships || 0) === 0) reasons.push('no internships');
    lines.push(`• ${s.name} (${s.branch}, ${s.cgpa} CGPA) — Risk: ${reasons.join(', ')}`);
  });

  // All students
  lines.push('\n--- ALL STUDENTS ---');
  ctx.students.forEach(s => {
    const skillCount = s.skills?.length || 0;
    lines.push(`• ${s.name} | ${s.email || ''} | ${s.branch || 'CS'} | CGPA: ${s.cgpa} | Skills(${skillCount}): ${s.skills?.join(', ') || 'none'} | Status: ${s.placement_status} | Internships: ${s.internships_count || s.internships || 0}`);
  });

  // Company info
  lines.push(`\n--- COMPANIES ON CAMPUS (${ctx.companies.length}) ---`);
  ctx.companies.forEach(c => {
    lines.push(`• ${c.name} (${c.short}) — ₹${c.package_lpa}L | Min CGPA: ${c.min_cgpa} | Skills: ${c.required_skills?.join(', ')} | Slots: ${c.slots} | Deadline: ${c.deadline || 'TBD'}`);
  });

  // Skill demand vs supply
  const skillDemand = {};
  ctx.companies.forEach(c => (c.required_skills || []).forEach(s => { skillDemand[s] = (skillDemand[s] || 0) + 1; }));
  const studentSkills = {};
  ctx.students.forEach(s => (s.skills || []).forEach(sk => { studentSkills[sk] = (studentSkills[sk] || 0) + 1; }));

  lines.push('\n--- SKILL DEMAND vs SUPPLY ---');
  Object.entries(skillDemand)
    .sort(([, a], [, b]) => b - a)
    .forEach(([skill, demand]) => {
      const supply = studentSkills[skill] || 0;
      const gap = demand - supply;
      lines.push(`• ${skill}: Demanded by ${demand} companies, ${supply} students have it${gap > 0 ? ` (GAP: ${gap})` : ''}`);
    });

  // Top performers
  const topPerformers = ctx.students.filter(s => s.cgpa >= 8.5).sort((a, b) => b.cgpa - a.cgpa);
  if (topPerformers.length > 0) {
    lines.push(`\n--- TOP PERFORMERS (CGPA ≥ 8.5) ---`);
    topPerformers.forEach(s => {
      lines.push(`• ${s.name} (${s.cgpa} CGPA, ${s.skills?.length || 0} skills, ${s.placement_status})`);
    });
  }

  return lines.join('\n');
}

// Format student RAG document
function formatStudentRAGDocument(ctx) {
  if (!ctx) return 'No student data available.';
  const s = ctx.student;
  const lines = [];

  lines.push('=== STUDENT PROFILE (RETRIEVED FROM DATABASE) ===');
  lines.push(`Name: ${s.name} | Email: ${s.email} | Branch: ${s.branch} | Year: ${s.year}`);
  lines.push(`CGPA: ${s.cgpa} | Skills: ${s.skills?.join(', ') || 'None'}`);
  lines.push(`Interests: ${s.interests?.join(', ') || 'None'}`);
  lines.push(`Status: ${s.placement_status} | Internships: ${s.internships_count || 0} | Hackathons: ${s.hackathons_count || 0}`);
  if (s.bio) lines.push(`Bio: ${s.bio}`);

  if (ctx.certifications.length > 0) {
    lines.push('\n--- CERTIFICATIONS ---');
    ctx.certifications.forEach(c => lines.push(`• ${c.name} (${c.issuer})`));
  }
  if (ctx.internships.length > 0) {
    lines.push('\n--- INTERNSHIPS ---');
    ctx.internships.forEach(i => lines.push(`• ${i.role} at ${i.company} (${i.duration})`));
  }
  if (ctx.hackathons.length > 0) {
    lines.push('\n--- HACKATHONS ---');
    ctx.hackathons.forEach(h => lines.push(`• ${h.name} — ${h.role}${h.achievement ? ` (${h.achievement})` : ''}`));
  }
  if (ctx.achievements.length > 0) {
    lines.push('\n--- ACHIEVEMENTS ---');
    ctx.achievements.forEach(a => lines.push(`• ${a.title}`));
  }

  lines.push('\n=== COMPANY MATCHING RESULTS ===');
  lines.push(`Eligible: ${ctx.eligibleCompanies.length}/${ctx.companies.length}`);
  ctx.topMatches.forEach((m, i) => {
    lines.push(`${i + 1}. ${m.company.name} (${m.company.short}) — ${m.matchScore}% match, ${m.selectionProbability}% selection`);
    lines.push(`   ₹${m.company.package_lpa}L | ${m.meetsMinCGPA ? '✓ Eligible' : '✗ Not eligible'} | Matched: ${m.matchedSkills.join(', ') || 'None'} | Missing: ${m.missingSkills.join(', ') || 'None'}`);
    if (m.isInterestMatch) lines.push(`   ★ Matches interests (+${m.interestBonus}%)`);
  });

  lines.push('\n=== AI RECOMMENDATIONS ===');
  ctx.suggestions.forEach(s => lines.push(`• [${s.priority?.toUpperCase()}] ${s.title}: ${s.message}`));

  lines.push('\n=== ALL COMPANIES ===');
  ctx.companies.forEach(c => lines.push(`• ${c.name} (${c.short}) — ₹${c.package_lpa}L, Min: ${c.min_cgpa}, Skills: ${c.required_skills?.join(', ')}`));

  return lines.join('\n');
}

const ADMIN_SYSTEM_PROMPT = `You are PlaceIQ Agent — the AI assistant for the Training & Placement Cell (TPC) administrators.

CRITICAL RULES:
1. You have COMPLETE access to all student profiles, company data, and placement analytics shown below.
2. ONLY use the retrieved data. NEVER make up student names, CGPAs, skills, or any data.
3. When asked about a specific student, find them in the data and give precise details.
4. For "at-risk" questions, use the at-risk list provided — students with CGPA < 7 or < 4 skills who are still seeking.
5. Give data-driven, actionable recommendations to the TPC team.
6. Be specific with numbers, percentages, and student names from the data.

Your capabilities as TPC Admin advisor:
- Student risk assessment: Who needs intervention?
- Company-student matching: Who is best suited for which company?
- Skill gap analysis: What skills are most lacking across students?
- Placement predictions: Which students are most likely to get placed?
- Deadline management: Which applications are closing soon?
- Performance reports: Top performers, branch-wise stats

When asked about a student by name, search the student list and provide their exact CGPA, skills, status, and analysis.`;

const STUDENT_SYSTEM_PROMPT = `You are PlaceIQ Advisor — a personal AI career advisor for a university student.

CRITICAL RULES:
1. ONLY use the student's actual profile data shown below. NEVER invent data.
2. When asked about their profile, cite exact CGPA, skills, match scores from the data.
3. If information isn't in the context, say so.
4. Give actionable advice based on actual skill gaps and match scores.
5. For salary questions, use the actual CTC data.

Your capabilities:
- Profile strength analysis
- Company matching with reasons
- Skill gap identification
- Interview preparation tips
- Career planning based on interests`;

export async function POST(request) {
  let userMessage = '';
  try {
    const { message, history = [], userId, userRole } = await request.json();
    userMessage = message;

    // Step 1: RETRIEVE — Build RAG context
    const role = userRole || 'student';
    let ragContext = null;
    if (userId || role === 'admin') {
      ragContext = await buildRAGContext(userId, role);
    }

    // Step 2: Format context based on role
    let ragDocument, systemPrompt;
    if (ragContext?.mode === 'admin') {
      ragDocument = formatAdminRAGDocument(ragContext);
      systemPrompt = ADMIN_SYSTEM_PROMPT;
    } else if (ragContext?.mode === 'student') {
      ragDocument = formatStudentRAGDocument(ragContext);
      systemPrompt = STUDENT_SYSTEM_PROMPT;
    } else {
      ragDocument = 'No data available.';
      systemPrompt = STUDENT_SYSTEM_PROMPT;
    }

    // Step 3: GENERATE — Send to Gemini with full context
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(apiKey);

        const model = genAI.getGenerativeModel({
          model: 'gemini-2.0-flash',
          systemInstruction: systemPrompt + '\n\n--- RETRIEVED DATA ---\n' + ragDocument,
        });

        const chat = model.startChat({
          history: history.slice(-6),
        });

        const result = await chat.sendMessage(message);
        const response = result.response;

        return NextResponse.json({
          reply: response.text(),
          toolCalls: [],
          model: 'gemini-rag',
          context: ragContext?.mode || 'none',
        });
      } catch (geminiError) {
        console.warn('Gemini RAG error, using fallback:', geminiError.message);
      }
    }

    // Fallback: Smart rule-based response
    const reply = ragContext?.mode === 'admin'
      ? generateAdminFallback(message, ragContext)
      : generateStudentFallback(message, ragContext);

    return NextResponse.json({
      reply: reply.text,
      toolCalls: reply.toolCalls || [],
      model: 'rag-fallback',
      context: ragContext?.mode || 'none',
    });
  } catch (error) {
    console.error('RAG Agent error:', error);
    if (userMessage) {
      const reply = generateAdminFallback(userMessage, null);
      return NextResponse.json({ reply: reply.text, toolCalls: [], model: 'emergency-fallback' });
    }
    return NextResponse.json({ error: 'Agent failed', details: error.message }, { status: 500 });
  }
}

// ==========================================
// ADMIN FALLBACK — uses all student data
// ==========================================
function generateAdminFallback(message, ctx) {
  const msg = message.toLowerCase();

  if (!ctx || !ctx.students) {
    // Load seed data as last resort
    try {
      const seed = require('@/lib/data/seed');
      ctx = { students: seed.students, companies: seed.companies, mode: 'admin' };
    } catch {
      return { text: 'Could not load placement data. Please try again.' };
    }
  }

  const students = ctx.students;
  const companies = ctx.companies;

  // Find specific student by name
  const findStudent = (name) => {
    const lower = name.toLowerCase();
    return students.find(s =>
      s.name?.toLowerCase().includes(lower) ||
      s.name?.toLowerCase().split(' ').some(part => lower.includes(part))
    );
  };

  // Try to extract a student name from the message
  const mentionedStudent = students.find(s => {
    const nameParts = s.name?.toLowerCase().split(' ') || [];
    return nameParts.some(part => part.length > 2 && msg.includes(part));
  });

  // At-risk students
  if (msg.includes('risk') || msg.includes('weak') || msg.includes('struggling') || msg.includes('concern')) {
    const atRisk = students.filter(s =>
      (s.placement_status === 'seeking') && (s.cgpa < 7 || (s.skills?.length || 0) < 4)
    );

    if (mentionedStudent) {
      const s = mentionedStudent;
      const risks = [];
      if (s.cgpa < 7) risks.push(`CGPA is ${s.cgpa} (below 7.0 threshold)`);
      if ((s.skills?.length || 0) < 4) risks.push(`only ${s.skills?.length || 0} skills listed`);
      if ((s.internships_count || s.internships || 0) === 0) risks.push('zero internships');
      const isAtRisk = risks.length > 0 && s.placement_status === 'seeking';

      const matches = matchStudentToCompanies(s, companies).slice(0, 3);

      return {
        text: `📋 **Risk Assessment: ${s.name}**\n\n` +
          `• Branch: ${s.branch} | CGPA: ${s.cgpa}\n` +
          `• Skills (${s.skills?.length || 0}): ${s.skills?.join(', ') || 'None'}\n` +
          `• Status: ${s.placement_status}\n` +
          `• Internships: ${s.internships_count || s.internships || 0}\n\n` +
          (isAtRisk
            ? `⚠️ **AT RISK** — Reasons:\n${risks.map(r => `• ${r}`).join('\n')}\n\n`
            : `✅ **Not currently at risk.** ${s.placement_status === 'placed' ? 'Already placed!' : 'Profile looks solid.'}\n\n`) +
          `**Top Matches:**\n${matches.map((m, i) => `${i+1}. ${m.company.short} — ${m.matchScore}% match`).join('\n')}\n\n` +
          `**Recommended Actions:**\n` +
          (s.cgpa < 7 ? `• Focus on improving CGPA above 7.0\n` : '') +
          ((s.skills?.length || 0) < 4 ? `• Add more skills — especially DSA, Java, SQL\n` : '') +
          ((s.internships_count || s.internships || 0) === 0 ? `• Get at least one internship ASAP\n` : '') +
          `• Target companies: ${matches.map(m => m.company.short).join(', ')}`,
        toolCalls: [{ function: 'assess_student_risk', args: { student: s.name }, result: { at_risk: risks.length > 0 } }],
      };
    }

    return {
      text: `⚠️ **At-Risk Students (${atRisk.length})**\n\n` +
        atRisk.map((s, i) => {
          const reasons = [];
          if (s.cgpa < 7) reasons.push(`CGPA ${s.cgpa}`);
          if ((s.skills?.length || 0) < 4) reasons.push(`${s.skills?.length || 0} skills`);
          return `${i+1}. **${s.name}** (${s.branch}) — ${reasons.join(', ')}`;
        }).join('\n') +
        `\n\n💡 These students need immediate TPC intervention — mock interviews, skill workshops, or mentoring.`,
      toolCalls: [{ function: 'get_at_risk_students', args: {}, result: { count: atRisk.length } }],
    };
  }

  // Specific student query
  if (mentionedStudent) {
    const s = mentionedStudent;
    const matches = matchStudentToCompanies(s, companies).slice(0, 4);

    return {
      text: `📋 **Student Profile: ${s.name}**\n\n` +
        `• Branch: ${s.branch} | Year: ${s.year || 4}\n` +
        `• CGPA: ${s.cgpa}\n` +
        `• Skills (${s.skills?.length || 0}): ${s.skills?.join(', ') || 'None listed'}\n` +
        `• Status: ${s.placement_status}\n` +
        `• Internships: ${s.internships_count || s.internships || 0}\n\n` +
        `**Top Company Matches:**\n` +
        matches.map((m, i) =>
          `${i+1}. **${m.company.name}** — ${m.matchScore}% match, ${m.selectionProbability}% prob\n` +
          `   Matched: ${m.matchedSkills.join(', ') || 'None'} | Missing: ${m.missingSkills.join(', ') || 'All matched'}`
        ).join('\n') +
        `\n\n📊 Eligible for ${companies.filter(c => s.cgpa >= c.min_cgpa).length}/${companies.length} companies.`,
      toolCalls: [{ function: 'get_student_profile', args: { name: s.name }, result: { cgpa: s.cgpa } }],
    };
  }

  // Skill gaps
  if (msg.includes('skill') || msg.includes('gap') || msg.includes('demand')) {
    const skillDemand = {};
    companies.forEach(c => (c.required_skills || []).forEach(s => { skillDemand[s] = (skillDemand[s] || 0) + 1; }));
    const studentSkills = {};
    students.forEach(s => (s.skills || []).forEach(sk => { studentSkills[sk] = (studentSkills[sk] || 0) + 1; }));

    const gaps = Object.entries(skillDemand)
      .map(([skill, demand]) => ({ skill, demand, supply: studentSkills[skill] || 0, gap: demand - (studentSkills[skill] || 0) }))
      .sort((a, b) => b.gap - a.gap)
      .slice(0, 8);

    return {
      text: `📊 **Skill Gap Analysis**\n\n` +
        gaps.map((g, i) =>
          `${i+1}. **${g.skill}** — ${g.demand} companies need it, ${g.supply} students have it ${g.gap > 0 ? `(gap: ${g.gap})` : '✓'}`
        ).join('\n') +
        `\n\n💡 **Action:** Organize workshops for: ${gaps.filter(g => g.gap > 0).slice(0, 3).map(g => g.skill).join(', ')}`,
      toolCalls: [{ function: 'analyze_skill_gaps', args: {}, result: { gaps: gaps.length } }],
    };
  }

  // Placement stats
  if (msg.includes('stat') || msg.includes('overview') || msg.includes('summary') || msg.includes('placement rate')) {
    const total = students.length;
    const placedCount = students.filter(s => s.placement_status === 'placed').length;
    const rate = total > 0 ? ((placedCount / total) * 100).toFixed(1) : 0;
    const avgCGPA = (students.reduce((sum, s) => sum + (s.cgpa || 0), 0) / total).toFixed(2);

    return {
      text: `📊 **Placement Overview**\n\n` +
        `• Total Students: ${total}\n` +
        `• Placed: ${placedCount} (${rate}%)\n` +
        `• Seeking: ${students.filter(s => s.placement_status === 'seeking').length}\n` +
        `• Interviewing: ${students.filter(s => s.placement_status === 'interviewing').length}\n` +
        `• Avg CGPA: ${avgCGPA}\n` +
        `• Companies on campus: ${companies.length}\n` +
        `• Avg package: ₹${(companies.reduce((s, c) => s + c.package_lpa, 0) / companies.length).toFixed(1)}L`,
      toolCalls: [{ function: 'get_placement_stats', args: {}, result: { rate } }],
    };
  }

  // Default admin
  return {
    text: `🛡️ **PlaceIQ TPC Admin Agent**\n\nI have access to ${students.length} students and ${companies.length} companies. Try:\n\n` +
      `• **"How is [student name] at risk?"** — Individual risk assessment\n` +
      `• **"Show at-risk students"** — Students needing intervention\n` +
      `• **"Skill gap analysis"** — Demand vs supply\n` +
      `• **"Placement stats"** — Overall placement overview\n` +
      `• **"Tell me about [student]"** — Full profile + matches\n` +
      `• **"Which students match Google?"** — Company-specific candidates`,
    toolCalls: [],
  };
}

// ==========================================
// STUDENT FALLBACK — uses own profile data
// ==========================================
function generateStudentFallback(message, ctx) {
  const msg = message.toLowerCase();

  if (!ctx || !ctx.student) {
    return {
      text: "I need your profile data to give personalized advice. Please make sure you're signed in and try again.\n\nGeneral tips:\n• Build DSA and problem-solving skills\n• Get at least 1 internship\n• Keep CGPA above 7.0\n• Practice mock interviews",
    };
  }

  const s = ctx.student;
  const matches = ctx.topMatches;
  const suggestions = ctx.suggestions;

  if (msg.includes('profile') || msg.includes('about me') || msg.includes('my details')) {
    return {
      text: `📋 **${s.name}** | ${s.branch} Year ${s.year}\n• CGPA: ${s.cgpa} | Skills: ${s.skills?.join(', ') || 'None'}\n• Interests: ${s.interests?.join(', ') || 'Not set'}\n• Internships: ${s.internships_count || 0}\n\nUpdate your profile for better matches!`,
      toolCalls: [{ function: 'retrieve_profile', args: {}, result: { name: s.name } }],
    };
  }

  if (msg.includes('skill') || msg.includes('learn') || msg.includes('gap')) {
    const allMissing = {};
    ctx.allMatches.slice(0, 6).forEach(m => m.missingSkills.forEach(sk => { allMissing[sk] = (allMissing[sk] || 0) + 1; }));
    const topMissing = Object.entries(allMissing).sort(([,a],[,b]) => b - a).slice(0, 5);
    return {
      text: `🎯 **Skill Analysis**\n\nYour Skills: ${s.skills?.join(', ') || 'None'}\n\n**Learn these:**\n` +
        topMissing.map(([sk, n], i) => `${i+1}. **${sk}** — needed by ${n}/6 top companies`).join('\n') +
        `\n\n💡 Learning ${topMissing[0]?.[0] || 'key skills'} boosts scores by 10-15%.`,
      toolCalls: [{ function: 'analyze_skills', args: {}, result: {} }],
    };
  }

  if (msg.includes('match') || msg.includes('compan') || msg.includes('eligible') || msg.includes('apply')) {
    return {
      text: `🏢 **Your Top Matches**\n\n` +
        matches.map((m, i) =>
          `${i+1}. **${m.company.name}** — ${m.matchScore}%${m.isInterestMatch ? ' ★' : ''}\n   ₹${m.company.package_lpa}L | ${m.meetsMinCGPA ? '✓ Eligible' : `✗ Need ${m.company.min_cgpa}`}`
        ).join('\n\n') +
        `\n\nEligible for ${ctx.eligibleCompanies.length}/${ctx.companies.length} companies.`,
      toolCalls: [{ function: 'match_companies', args: {}, result: {} }],
    };
  }

  // Specific company
  const companyMention = ctx.companies.find(c => msg.includes(c.short?.toLowerCase()) || msg.includes(c.name?.toLowerCase()));
  if (companyMention) {
    const match = ctx.allMatches.find(m => m.company.id === companyMention.id || m.company.short === companyMention.short);
    if (match) {
      return {
        text: `🏢 **${companyMention.name}**\n\n• Match: **${match.matchScore}%** | Prob: **${match.selectionProbability}%**\n• ₹${companyMention.package_lpa}L CTC | Min CGPA: ${companyMention.min_cgpa} ${match.meetsMinCGPA ? '✓' : '✗'}\n• Matched: ${match.matchedSkills.join(', ') || 'None'}\n• Missing: ${match.missingSkills.join(', ') || 'All matched!'}\n• Deadline: ${companyMention.deadline ? new Date(companyMention.deadline).toLocaleDateString('en-IN') : 'TBD'}`,
        toolCalls: [{ function: 'analyze_company', args: { company: companyMention.short }, result: {} }],
      };
    }
  }

  if (msg.includes('salary') || msg.includes('ctc') || msg.includes('package')) {
    const eligible = ctx.eligibleCompanies.sort((a, b) => b.package_lpa - a.package_lpa);
    return {
      text: `💰 **Salary Info** (CGPA ${s.cgpa})\n\n` +
        eligible.slice(0, 5).map((c, i) => `${i+1}. **${c.name}** — ₹${c.package_lpa}L (Base: ₹${c.base_salary_lpa}L)`).join('\n') +
        `\n\nBest: ₹${eligible[0]?.package_lpa || 0}L | Avg: ₹${(eligible.reduce((s, c) => s + c.package_lpa, 0) / (eligible.length || 1)).toFixed(1)}L`,
      toolCalls: [{ function: 'salary_analysis', args: {}, result: {} }],
    };
  }

  if (msg.includes('advice') || msg.includes('suggest') || msg.includes('what should') || msg.includes('help')) {
    return {
      text: `💡 **Recommendations**\n\n` +
        suggestions.map((su, i) => `${i+1}. **[${su.priority?.toUpperCase()}] ${su.title}**\n   ${su.message}`).join('\n\n'),
      toolCalls: [{ function: 'get_suggestions', args: {}, result: {} }],
    };
  }

  return {
    text: `Hi ${s.name}! 👋 Try:\n• "Show my profile"\n• "What skills should I learn?"\n• "Which companies match me?"\n• "Am I ready for Google?"\n• "What should I do next?"\n• "Show salary info"\n\nTop match: **${matches[0]?.company?.short || 'N/A'}** at ${matches[0]?.matchScore || 0}%`,
    toolCalls: [],
  };
}
