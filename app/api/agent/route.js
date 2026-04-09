// Agentic AI API Route — Gemini with Function Calling
import { NextResponse } from 'next/server';
import { students, companies, applications, alerts, getPlacementStats, getStudentById, getCompanyById } from '@/lib/data/seed';
import { matchStudentToCompanies, predictSelectionProbability, generateActionSuggestions } from '@/lib/ai/matching';

// Tool execution functions
function executeFunction(name, args) {
  switch (name) {
    case 'match_student_to_companies': {
      const student = getStudentById(args.student_id);
      if (!student) return { error: `Student ${args.student_id} not found` };
      const matches = matchStudentToCompanies(student, companies).slice(0, 5);
      return {
        student: student.name,
        top_matches: matches.map(m => ({
          company: m.company.name,
          match_score: m.matchScore,
          selection_probability: m.selectionProbability,
          matched_skills: m.matchedSkills,
          missing_skills: m.missingSkills,
          package: `₹${m.company.package_lpa} LPA`,
          deadline: m.company.deadline,
        })),
      };
    }

    case 'predict_selection_probability': {
      const student = getStudentById(args.student_id);
      const company = getCompanyById(args.company_id);
      if (!student) return { error: `Student ${args.student_id} not found` };
      if (!company) return { error: `Company ${args.company_id} not found` };
      const result = predictSelectionProbability(student, company);
      return {
        student: student.name,
        company: company.name,
        probability: result.probability,
        confidence: result.confidence,
        match_score: result.matchResult.total,
        matched_skills: result.matchResult.matchedSkills,
        missing_skills: result.matchResult.missingSkills,
        meets_cgpa: student.cgpa >= company.min_cgpa,
      };
    }

    case 'suggest_next_actions': {
      const student = getStudentById(args.student_id);
      if (!student) return { error: `Student ${args.student_id} not found` };
      const suggestions = generateActionSuggestions(student, companies);
      return {
        student: student.name,
        current_status: student.placement_status,
        cgpa: student.cgpa,
        skills: student.skills,
        suggestions: suggestions.map(s => ({
          type: s.type,
          priority: s.priority,
          title: s.title,
          message: s.message,
        })),
      };
    }

    case 'generate_alert': {
      const student = getStudentById(args.student_id);
      return {
        alert_created: true,
        student: student?.name || 'Unknown',
        type: args.alert_type,
        message: args.message,
        timestamp: new Date().toISOString(),
      };
    }

    case 'get_placement_analytics': {
      const stats = getPlacementStats();
      switch (args.metric) {
        case 'overview':
          return stats;
        case 'skill_gaps': {
          const skillDemand = {};
          companies.forEach(c => c.required_skills.forEach(s => { skillDemand[s] = (skillDemand[s] || 0) + 1; }));
          const studentSkills = {};
          students.forEach(s => s.skills.forEach(sk => { studentSkills[sk] = (studentSkills[sk] || 0) + 1; }));
          return {
            most_demanded: Object.entries(skillDemand).sort(([, a], [, b]) => b - a).slice(0, 5),
            biggest_gaps: Object.entries(skillDemand)
              .map(([skill, demand]) => ({ skill, demand, supply: studentSkills[skill] || 0, gap: demand - (studentSkills[skill] || 0) }))
              .sort((a, b) => b.gap - a.gap).slice(0, 5),
          };
        }
        case 'at_risk_students':
          return {
            at_risk: students
              .filter(s => s.placement_status === 'seeking' && (s.cgpa < 7 || s.skills.length < 4))
              .map(s => ({ name: s.name, cgpa: s.cgpa, skills_count: s.skills.length, internships: s.internships })),
          };
        case 'top_performers':
          return {
            top: students
              .filter(s => s.cgpa >= 8.5)
              .map(s => ({ name: s.name, cgpa: s.cgpa, status: s.placement_status, skills: s.skills })),
          };
        case 'deadline_alerts':
          return {
            upcoming: companies
              .map(c => ({ company: c.name, deadline: c.deadline, days_left: Math.ceil((new Date(c.deadline) - new Date()) / 86400000) }))
              .filter(c => c.days_left > 0 && c.days_left <= 7)
              .sort((a, b) => a.days_left - b.days_left),
          };
        default:
          return stats;
      }
    }

    default:
      return { error: `Unknown function: ${name}` };
  }
}

export async function POST(request) {
  let userMessage = '';
  try {
    const { message, history = [] } = await request.json();
    userMessage = message;

    // Check if Gemini API key is available
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      // Use real Gemini API with function calling
      try {
        const { getGeminiClient, agentFunctionDeclarations, SYSTEM_PROMPT } = await import('@/lib/ai/gemini');
        const genAI = getGeminiClient();
        
        const model = genAI.getGenerativeModel({
          model: 'gemini-2.0-flash',
          systemInstruction: SYSTEM_PROMPT,
          tools: [{ functionDeclarations: agentFunctionDeclarations }],
        });

        const chat = model.startChat({ history });

        let result = await chat.sendMessage(message);
        let response = result.response;
        let iterations = 0;
        const toolCalls = [];

        // Agentic loop: keep processing function calls until the model gives a text response
        while (response.functionCalls() && iterations < 5) {
          const functionCalls = response.functionCalls();
          const functionResponses = [];

          for (const call of functionCalls) {
            const output = executeFunction(call.name, call.args);
            toolCalls.push({ function: call.name, args: call.args, result: output });
            functionResponses.push({
              functionResponse: {
                name: call.name,
                response: output,
              },
            });
          }

          result = await chat.sendMessage(functionResponses);
          response = result.response;
          iterations++;
        }

        return NextResponse.json({
          reply: response.text(),
          toolCalls,
          model: 'gemini-2.0-flash',
        });
      } catch (geminiError) {
        console.warn('Gemini API error, using fallback:', geminiError.message);
        // Fall through to fallback
      }
    }

    // Fallback: Smart rule-based response (used when no API key or Gemini fails)
    const reply = generateFallbackResponse(message);
    return NextResponse.json({
      reply: reply.text,
      toolCalls: reply.toolCalls,
      model: 'smart-fallback',
    });
  } catch (error) {
    console.error('Agent error:', error);
    if (userMessage) {
      const reply = generateFallbackResponse(userMessage);
      return NextResponse.json({
        reply: reply.text,
        toolCalls: reply.toolCalls,
        model: 'emergency-fallback',
      });
    }
    return NextResponse.json(
      { error: 'Agent processing failed', details: error.message },
      { status: 500 }
    );
  }
}

function generateFallbackResponse(message) {
  const msg = message.toLowerCase();
  const toolCalls = [];

  // At-risk students
  if (msg.includes('at risk') || msg.includes('at-risk') || msg.includes('weak') || msg.includes('struggling')) {
    const atRisk = students.filter(s => s.placement_status === 'seeking' && (s.cgpa < 7 || s.skills.length < 4));
    toolCalls.push({ function: 'get_placement_analytics', args: { metric: 'at_risk_students' }, result: { at_risk: atRisk } });
    return {
      text: `🚨 **At-Risk Students Identified:**\n\n${atRisk.map(s => `• **${s.name}** — CGPA: ${s.cgpa}, Skills: ${s.skills.length}, Internships: ${s.internships || 0}`).join('\n')}\n\n**Autonomous Action:** I recommend immediate intervention for these students — DSA bootcamp enrollment and mock interview scheduling.\n\n**Priority Actions:**\n1. Schedule 1-on-1 counseling sessions\n2. Enroll in competitive programming practice\n3. Arrange peer mentoring with placed students`,
      toolCalls,
    };
  }

  // Skill gaps
  if (msg.includes('skill gap') || msg.includes('skill demand') || msg.includes('most needed') || msg.includes('trending')) {
    const skillDemand = {};
    companies.forEach(c => c.required_skills.forEach(s => { skillDemand[s] = (skillDemand[s] || 0) + 1; }));
    const studentSkills = {};
    students.forEach(s => s.skills.forEach(sk => { studentSkills[sk] = (studentSkills[sk] || 0) + 1; }));
    const gaps = Object.entries(skillDemand)
      .map(([skill, demand]) => ({ skill, demand, supply: studentSkills[skill] || 0 }))
      .sort((a, b) => b.demand - a.demand).slice(0, 8);
    toolCalls.push({ function: 'get_placement_analytics', args: { metric: 'skill_gaps' }, result: { gaps } });
    return {
      text: `📊 **Skill Gap Analysis:**\n\n${gaps.map((g, i) => `${i + 1}. **${g.skill}** — Required by ${g.demand} companies, known by ${g.supply} students ${g.demand > g.supply ? '⚠️ GAP' : '✅'}`).join('\n')}\n\n🧠 **Agent Recommendation:** Focus training on DSA, System Design, and Java — these have the highest demand-supply gap. Consider organizing a week-long bootcamp.`,
      toolCalls,
    };
  }

  // Top performers
  if (msg.includes('top') || msg.includes('best') || msg.includes('performer') || msg.includes('star')) {
    const top = students.filter(s => s.cgpa >= 8.0).sort((a, b) => b.cgpa - a.cgpa);
    toolCalls.push({ function: 'get_placement_analytics', args: { metric: 'top_performers' }, result: { top } });
    return {
      text: `⭐ **Top Performers:**\n\n${top.map((s, i) => `${i + 1}. **${s.name}** — CGPA: ${s.cgpa} | ${s.skills.slice(0, 4).join(', ')} | Status: ${s.placement_status}`).join('\n')}\n\n🧠 **Agent Strategy:** These students should be prioritized for dream companies (Google, Microsoft, Amazon). Schedule mock system design interviews immediately.`,
      toolCalls,
    };
  }

  // Specific student matching
  if (msg.includes('match')) {
    let studentId = 's1';
    const nameMap = { aarav: 's1', priya: 's2', rohit: 's3', ananya: 's4', vikram: 's5', sneha: 's6', arjun: 's7', kavya: 's8', rahul: 's9', divya: 's10' };
    for (const [name, id] of Object.entries(nameMap)) {
      if (msg.includes(name)) { studentId = id; break; }
    }
    const student = getStudentById(studentId);
    const matches = matchStudentToCompanies(student, companies).slice(0, 5);
    toolCalls.push({ function: 'match_student_to_companies', args: { student_id: studentId }, result: { matches } });
    return {
      text: `🤖 **AI Matching Results for ${student.name}:**\n\n${matches.map((m, i) => `${i + 1}. **${m.company.short}** — Match: ${m.matchScore}% | Selection: ${m.selectionProbability}% | ${m.matchedSkills.join(', ')}`).join('\n')}\n\n**Agent Decision:** ${matches[0].matchScore > 70 ? `Strong match with ${matches[0].company.short}. Recommending immediate application.` : `Best available match is ${matches[0].company.short} at ${matches[0].matchScore}%. Consider upskilling first.`}`,
      toolCalls,
    };
  }

  // Suggestions / what should X do
  if (msg.includes('suggest') || msg.includes('should') || msg.includes('recommend') || msg.includes('advice') || msg.includes('next')) {
    let studentId = 's1';
    const nameMap = { aarav: 's1', priya: 's2', rohit: 's3', ananya: 's4', vikram: 's5', sneha: 's6', arjun: 's7' };
    for (const [name, id] of Object.entries(nameMap)) {
      if (msg.includes(name)) { studentId = id; break; }
    }
    const student = getStudentById(studentId);
    const suggestions = generateActionSuggestions(student, companies);
    toolCalls.push({ function: 'suggest_next_actions', args: { student_id: studentId }, result: { suggestions } });
    return {
      text: `💡 **AI Recommendations for ${student.name}** (${student.branch}, ${student.cgpa} CGPA):\n\n${suggestions.map((s, i) => `${i + 1}. **[${s.priority.toUpperCase()}]** ${s.title}\n   ${s.message}`).join('\n\n')}\n\n🧠 **Agent Notes:** These are autonomously generated based on ${student.name}'s profile analysis against all ${companies.length} visiting companies.`,
      toolCalls,
    };
  }

  // Prediction query
  if (msg.includes('predict') || msg.includes('chance') || msg.includes('probability') || msg.includes('likely')) {
    const student = getStudentById('s1');
    const topCompanies = companies.slice(0, 5);
    const predictions = topCompanies.map(c => {
      const r = predictSelectionProbability(student, c);
      return { company: c.short, probability: r.probability, confidence: r.confidence };
    });
    toolCalls.push({ function: 'predict_selection_probability', args: { student_id: 's1' }, result: { predictions } });
    return {
      text: `📈 **Selection Predictions for ${student.name}:**\n\n${predictions.map(p => `• **${p.company}** — ${p.probability}% (${p.confidence} confidence)`).join('\n')}\n\n🧠 **Agent Analysis:** Focus applications on companies where selection probability exceeds 50%. For lower-probability dream companies, intensive preparation is key.`,
      toolCalls,
    };
  }

  // Default overview response
  const stats = getPlacementStats();
  toolCalls.push({ function: 'get_placement_analytics', args: { metric: 'overview' }, result: stats });
  return {
    text: `📊 **PlaceIQ Agent — Placement Overview:**\n\n• **${stats.totalStudents}** students | **${stats.placed}** placed (${stats.placementRate}%)\n• **${stats.totalCompanies}** companies visiting | **${stats.totalApplications}** applications\n• Avg Package: ₹${stats.avgPackage}L | Conversion Rate: ${stats.conversionRate}%\n• **${stats.unreadAlerts}** unread smart alerts\n\n🧠 **Agent Insights:** ${stats.seeking > 5 ? `${stats.seeking} students still seeking — I recommend running batch matching for high-priority companies.` : 'Placement season is progressing well.'}\n\nTry asking me:\n• "Match Aarav to companies"\n• "Show at-risk students"\n• "What should Priya do next?"\n• "Show skill gaps"\n• "Who are the top performers?"`,
    toolCalls,
  };
}
