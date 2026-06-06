import { parseClaudeJSON } from '../utils/parsers'
import {
  RESUME_SYSTEM_PROMPT,
  INTERVIEW_QUESTION_SYSTEM_PROMPT,
  INTERVIEW_SCORE_SYSTEM_PROMPT,
  PORTFOLIO_SYSTEM_PROMPT,
  SCAM_SYSTEM_PROMPT,
} from '../utils/prompts'

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
// llama-3.3-70b gives the best JSON accuracy on Groq's free tier
const GROQ_MODEL = 'llama-3.3-70b-versatile'

/**
 * Base function for all Groq API calls.
 * Groq is OpenAI-compatible — uses messages array with system + user roles.
 */
async function callGroq(systemPrompt, userMessage) {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY

  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_groq_api_key_here') {
    throw new Error('Invalid API key. Check your .env file (VITE_GROQ_API_KEY).')
  }

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.3,
      max_tokens: 2048,
      // Ask for JSON output
      response_format: { type: 'json_object' },
    }),
  })

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}))
    const status = response.status
    const msg = errBody?.error?.message || response.statusText
    throw new Error(`API error: ${status} — ${msg}`)
  }

  const data = await response.json()
  const rawText = data?.choices?.[0]?.message?.content

  if (!rawText) {
    throw new Error('JSON_PARSE_FAILED')
  }

  return parseClaudeJSON(rawText)
}

/**
 * Analyse resume against a job description
 */
export async function analyseResume(resumeText, jobDescription) {
  const userMessage = `RESUME:\n${resumeText}\n\nJOB DESCRIPTION:\n${jobDescription}`
  return callGroq(RESUME_SYSTEM_PROMPT, userMessage)
}

/**
 * Generate a single interview question, avoiding previously asked ones
 */
export async function generateInterviewQuestion(role, type, difficulty, questionNumber, previousQuestions = []) {
  const avoidSection = previousQuestions.length > 0
    ? `\n\nPrevious questions already asked (DO NOT repeat or rephrase these):\n${previousQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}`
    : ''
  const userMessage = `Generate a ${difficulty} ${type} interview question for a ${role} position. This is question number ${questionNumber} of 5 in this session.${avoidSection}\n\nMake sure this question covers a different topic and concept from all previous questions above.`
  return callGroq(INTERVIEW_QUESTION_SYSTEM_PROMPT, userMessage)
}

/**
 * Score an interview answer
 */
export async function scoreInterviewAnswer(question, answer, role, type) {
  const userMessage = `QUESTION: ${question}\nANSWER: ${answer}\nROLE: ${role}\nTYPE: ${type}`
  return callGroq(INTERVIEW_SCORE_SYSTEM_PROMPT, userMessage)
}

/**
 * Review a portfolio / GitHub profile
 */
export async function reviewPortfolio(githubUrl, targetRole, projectsDescription) {
  const userMessage = `GITHUB URL: ${githubUrl}\nTARGET ROLE: ${targetRole}\nPROJECTS:\n${projectsDescription}`
  return callGroq(PORTFOLIO_SYSTEM_PROMPT, userMessage)
}

/**
 * Detect scam / fake job posting
 */
export async function detectJobScam(jobPosting) {
  const userMessage = `Analyse this job posting:\n\n${jobPosting}`
  return callGroq(SCAM_SYSTEM_PROMPT, userMessage)
}
