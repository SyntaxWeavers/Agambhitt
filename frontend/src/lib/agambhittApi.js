const DEFAULT_API_BASE_URL = 'http://localhost:8000'
export const API_BASE_URL = import.meta.env.VITE_AGAMBHITT_API_URL ?? DEFAULT_API_BASE_URL

async function requestApi(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    ...options,
    body:
      options.body === undefined || typeof options.body === 'string'
        ? options.body
        : JSON.stringify(options.body),
  })

  const responseText = await response.text()
  let payload = null

  if (responseText) {
    try {
      payload = JSON.parse(responseText)
    } catch {
      payload = responseText
    }
  }

  if (!response.ok) {
    const message =
      (payload && typeof payload === 'object' && (payload.detail || payload.error || payload.message)) ||
      (typeof payload === 'string' && payload) ||
      `Request failed with status ${response.status}`
    throw new Error(message)
  }

  return payload
}

export async function fetchAnalyze(payload) {
  return requestApi('/analyze', {
    method: 'POST',
    body: payload,
  })
}

export async function fetchPlaybook(payload) {
  return requestApi('/playbook', {
    method: 'POST',
    body: payload,
  })
}

export async function fetchRedTeam(payload) {
  return requestApi('/redteam', {
    method: 'POST',
    body: payload,
  })
}

export async function fetchCountermeasures(payload) {
  return requestApi('/countermeasures', {
    method: 'POST',
    body: payload,
  })
}

export async function fetchHistory() {
  return requestApi('/history')
}
