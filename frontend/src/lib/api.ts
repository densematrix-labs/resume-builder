const API_BASE = '/api/v1'

interface GenerateRequest {
  job_title: string
  section: string
  context?: string
  language: string
}

interface GenerateResponse {
  content: string
  tokens_remaining: number
  source: string
}

interface TokenStatus {
  tokens_remaining: number
  daily_used: number
  daily_limit: number
  can_generate: boolean
}

export async function generateContent(
  request: GenerateRequest,
  deviceId: string
): Promise<string> {
  const response = await fetch(`${API_BASE}/resume/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Device-Id': deviceId,
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    const data = await response.json()
    // Handle both string and object error details
    const errorMessage = typeof data.detail === 'string' 
      ? data.detail 
      : data.detail?.error || data.detail?.message || 'Generation failed'
    throw new Error(errorMessage)
  }

  const data: GenerateResponse = await response.json()
  return data.content
}

export async function getTokenStatus(deviceId: string): Promise<TokenStatus> {
  const response = await fetch(`${API_BASE}/resume/tokens`, {
    headers: {
      'X-Device-Id': deviceId,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch token status')
  }

  return response.json()
}

export async function generateCoverLetter(
  request: {
    job_title: string
    company: string
    resume_summary: string
    language: string
  },
  deviceId: string
): Promise<string> {
  const response = await fetch(`${API_BASE}/resume/cover-letter`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Device-Id': deviceId,
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    const data = await response.json()
    const errorMessage = typeof data.detail === 'string' 
      ? data.detail 
      : data.detail?.error || data.detail?.message || 'Generation failed'
    throw new Error(errorMessage)
  }

  const data: GenerateResponse = await response.json()
  return data.content
}
