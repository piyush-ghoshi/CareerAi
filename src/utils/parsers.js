/**
 * Safely parses JSON from Claude's response.
 * Strips markdown code blocks if present.
 */
export function parseClaudeJSON(text) {
  if (!text || typeof text !== 'string') {
    throw new Error('JSON_PARSE_FAILED')
  }

  // Strip markdown code blocks
  let cleaned = text.trim()
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
  }

  // Remove any leading/trailing non-JSON content
  const jsonStart = cleaned.indexOf('{')
  const jsonEnd = cleaned.lastIndexOf('}')
  if (jsonStart !== -1 && jsonEnd !== -1) {
    cleaned = cleaned.slice(jsonStart, jsonEnd + 1)
  }

  try {
    return JSON.parse(cleaned)
  } catch {
    throw new Error('JSON_PARSE_FAILED')
  }
}

/**
 * Maps error codes/messages to user-friendly messages
 */
export function mapApiError(errorMessage) {
  if (!errorMessage) return 'Something went wrong. Please try again.'

  if (errorMessage.includes('400')) {
    return 'Invalid request. Please check your input and try again.'
  }
  if (errorMessage.includes('401') || errorMessage.includes('403') || errorMessage.includes('API_KEY_INVALID') || errorMessage.includes('invalid_api_key')) {
    return 'Invalid API key. Check your .env file (VITE_GROQ_API_KEY).'
  }
  if (errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED') || errorMessage.includes('rate_limit')) {
    return 'Rate limit hit. Wait a minute and try again (free tier: 30 req/min).'
  }
  if (errorMessage.includes('500') || errorMessage.includes('503') || errorMessage.includes('502')) {
    return 'Groq API is temporarily down. Try again shortly.'
  }
  if (errorMessage.includes('JSON_PARSE_FAILED')) {
    return 'Unexpected response format. Please try again.'
  }
  if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
    return 'Network error. Check your internet connection and try again.'
  }

  return errorMessage || 'Something went wrong. Please try again.'
}
