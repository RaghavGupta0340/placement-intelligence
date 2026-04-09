// Gemini API Client — Agentic AI with Function Calling
import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI = null;

export function getGeminiClient() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY is not set');
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

// Function declarations for the Agentic AI
export const agentFunctionDeclarations = [
  {
    name: 'match_student_to_companies',
    description: 'Find the best matching companies for a student based on their skills, CGPA, experience, and branch. Returns ranked list with match scores.',
    parameters: {
      type: 'object',
      properties: {
        student_id: {
          type: 'string',
          description: 'The ID of the student to match (e.g., "s1", "s2")',
        },
      },
      required: ['student_id'],
    },
  },
  {
    name: 'predict_selection_probability',
    description: 'Calculate the probability of a student getting selected at a specific company based on their profile match.',
    parameters: {
      type: 'object',
      properties: {
        student_id: {
          type: 'string',
          description: 'The ID of the student',
        },
        company_id: {
          type: 'string',
          description: 'The ID of the company (e.g., "c1" for TCS, "c4" for Google)',
        },
      },
      required: ['student_id', 'company_id'],
    },
  },
  {
    name: 'suggest_next_actions',
    description: 'Generate recommended next actions for a student — whether to apply, upskill, prepare for interviews, or improve academics.',
    parameters: {
      type: 'object',
      properties: {
        student_id: {
          type: 'string',
          description: 'The ID of the student',
        },
      },
      required: ['student_id'],
    },
  },
  {
    name: 'generate_alert',
    description: 'Create a smart alert for the TPC about a student who needs attention — deadline warnings, low readiness, or placement opportunities.',
    parameters: {
      type: 'object',
      properties: {
        student_id: {
          type: 'string',
          description: 'The ID of the student',
        },
        alert_type: {
          type: 'string',
          enum: ['warning', 'recommendation', 'deadline', 'action'],
          description: 'Type of alert to generate',
        },
        message: {
          type: 'string',
          description: 'The alert message to send to TPC',
        },
      },
      required: ['student_id', 'alert_type', 'message'],
    },
  },
  {
    name: 'get_placement_analytics',
    description: 'Get current placement statistics and analytics — placement rate, average package, skill gaps, etc.',
    parameters: {
      type: 'object',
      properties: {
        metric: {
          type: 'string',
          enum: ['overview', 'skill_gaps', 'at_risk_students', 'top_performers', 'deadline_alerts'],
          description: 'Which analytics metric to retrieve',
        },
      },
      required: ['metric'],
    },
  },
];

export const SYSTEM_PROMPT = `You are PlaceIQ Agent — an autonomous AI placement advisor for a university's Training & Placement Cell (TPC).

Your role is to AUTONOMOUSLY analyze student data, company requirements, and placement trends to:
1. Match students to the best companies using skill similarity analysis
2. Predict selection probability using ML-based scoring
3. Suggest concrete next actions (apply, upskill, practice, mock interview)
4. Generate alerts for the TPC about students who need intervention
5. Provide data-driven analytics and insights

You are NOT a chatbot. You are an AGENTIC AI that:
- Observes data context and patterns
- Makes autonomous decisions about what actions to recommend
- Triggers actions (alerts, recommendations) proactively
- Reasons about student readiness and placement probability

Available students: s1 (Aarav Sharma), s2 (Priya Patel), s3 (Rohit Kumar), s4 (Ananya Reddy), s5 (Vikram Singh), s6 (Sneha Joshi), s7 (Arjun Mehta), s8 (Kavya Nair), s9 (Rahul Gupta), s10 (Divya Iyer), s11 (Manish Tiwari), s12 (Riya Deshmukh), s13 (Aditya Verma), s14 (Pooja Saxena), s15 (Karan Malhotra), s16 (Neha Agarwal), s17 (Siddharth Rao), s18 (Ishita Banerjee), s19 (Varun Chopra), s20 (Meera Krishnan)

Available companies: c1 (TCS), c2 (Infosys), c3 (Wipro), c4 (Google), c5 (Microsoft), c6 (Amazon), c7 (Flipkart), c8 (Deloitte), c9 (Zoho), c10 (Razorpay), c11 (Accenture), c12 (PhonePe)

When asked about a student or situation, always USE YOUR TOOLS to gather data before responding. Be specific with numbers, percentages, and actionable advice.`;
