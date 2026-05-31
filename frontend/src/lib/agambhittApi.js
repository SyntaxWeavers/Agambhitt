const DEFAULT_API_BASE_URL = 'http://172.21.8.87:8000'

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

function toArray(value) {
  if (Array.isArray(value)) {
    return value
  }

  if (value == null) {
    return []
  }

  return [value]
}

function toText(value, fallback = '') {
  if (typeof value === 'string') {
    return value
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }

  return fallback
}

function normalizeSeverityTone(value) {
  const text = toText(value).toLowerCase()

  if (text.includes('crit') || text.includes('high') || text.includes('sev1') || text.includes('9')) {
    return 'critical'
  }

  if (text.includes('med') || text.includes('warning')) {
    return 'medium'
  }

  return 'medium'
}

function normalizeStatusTone(value) {
  const text = toText(value).toLowerCase()

  if (text.includes('block') || text.includes('error') || text.includes('fail')) {
    return 'danger'
  }

  if (text.includes('progress') || text.includes('active')) {
    return 'primary'
  }

  return 'secondary'
}

function normalizeVectorList(list) {
  return toArray(list).map((item, index) => ({
    title: toText(item?.title ?? item?.name ?? item?.vector ?? item?.attack_vector, `Vector ${index + 1}`),
    severity: toText(item?.severity ?? item?.risk ?? item?.score_label ?? item?.rating, 'Medium'),
    tone: normalizeSeverityTone(item?.severity ?? item?.risk ?? item?.score_label ?? item?.rating),
    description: toText(item?.description ?? item?.summary ?? item?.details, ''),
    path: toText(item?.path ?? item?.route ?? item?.chain ?? item?.attack_path, ''),
    actors: toArray(item?.actors ?? item?.tags ?? item?.nodes).map((value) => toText(value)),
  }))
}

function normalizePathNodes(list) {
  return toArray(list).map((item, index) => ({
    label: toText(item?.label ?? item?.name ?? item?.node, `Node ${index + 1}`),
    icon: toText(item?.icon ?? item?.symbol ?? item?.material_icon ?? 'schema', 'schema'),
    tone: toText(item?.tone ?? item?.status_tone ?? 'primary', 'primary'),
    status: toText(item?.status ?? item?.state ?? item?.tag ?? '', ''),
  }))
}

function normalizeSteps(value) {
  return toArray(value).map((item, index) => {
    if (typeof item === 'string') {
      return { text: item, checked: index === 2 }
    }

    return {
      text: toText(item?.text ?? item?.description ?? item?.step ?? item?.title, `Step ${index + 1}`),
      checked: Boolean(item?.checked ?? item?.completed ?? item?.done),
    }
  })
}

function normalizeAuditRows(list) {
  return toArray(list).map((item, index) => ({
    timestamp: toText(item?.timestamp ?? item?.time ?? item?.created_at, `Record ${index + 1}`),
    icon: toText(item?.icon ?? item?.action_icon ?? 'history', 'history'),
    action: toText(item?.action ?? item?.title ?? item?.message, `Action ${index + 1}`),
    detail: toText(item?.detail ?? item?.description ?? item?.notes ?? item?.message ?? item?.summary, ''),
    severity: toText(item?.severity ?? item?.level ?? item?.priority, 'Low'),
    severityTone: normalizeSeverityTone(item?.severity ?? item?.level ?? item?.priority),
    status: toText(item?.status ?? item?.result ?? item?.state, 'Success'),
    statusTone: normalizeStatusTone(item?.status ?? item?.result ?? item?.state),
  }))
}

function normalizeMetricList(list) {
  return toArray(list).map((item, index) => ({
    label: toText(item?.label ?? item?.name ?? item?.metric, `Metric ${index + 1}`),
    value: toText(item?.value ?? item?.count ?? item?.score, ''),
    detail: toText(item?.detail ?? item?.subtitle ?? item?.note, ''),
    tone: normalizeStatusTone(item?.tone ?? item?.status ?? item?.type),
  }))
}

function normalizeLogLines(list) {
  return toArray(list).map((item, index) => {
    if (typeof item === 'string') {
      return { tone: 'default', text: item, index }
    }

    return {
      tone: toText(item?.tone ?? item?.level ?? 'default', 'default'),
      text: toText(item?.text ?? item?.message ?? item?.line, `Log line ${index + 1}`),
      index,
    }
  })
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

export function normalizeAnalyzeResponse(response) {
  const payload = response?.data ?? response ?? {}
  return {
    summary: toText(payload.summary ?? payload.description ?? payload.message, ''),
    vectors: normalizeVectorList(payload.attack_vectors ?? payload.vectors ?? payload.threat_vectors ?? payload.results),
    pathNodes: normalizePathNodes(payload.attack_path ?? payload.path_nodes ?? payload.nodes ?? payload.chain),
    countermeasures: toArray(payload.countermeasures ?? payload.controls ?? payload.mitigations ?? payload.detections).map(
      (item, index) => ({
        title: toText(item?.title ?? item?.name ?? item?.label, `Control ${index + 1}`),
        description: toText(item?.description ?? item?.detail ?? item?.summary, ''),
      }),
    ),
  }
}

export function normalizePlaybookResponse(response) {
  const payload = response?.data ?? response ?? {}
  return {
    incident: toText(payload.incident ?? payload.description ?? payload.summary, ''),
    containment: normalizeSteps(payload.containment ?? payload.containment_steps ?? payload.steps?.containment),
    eradication: normalizeSteps(payload.eradication ?? payload.eradication_steps ?? payload.steps?.eradication),
    recovery: normalizeSteps(payload.recovery ?? payload.recovery_steps ?? payload.steps?.recovery),
    rootCause: {
      vulnerability: toText(payload.primary_vulnerability ?? payload.vulnerability ?? payload.cve, ''),
      summary: toText(payload.root_cause ?? payload.analysis ?? payload.summary, ''),
      actor: toText(payload.threat_actor ?? payload.actor ?? payload.attacker, ''),
      impact: toText(payload.data_impact ?? payload.impact ?? payload.exposure, ''),
      recommendation: toText(payload.recommendation ?? payload.advice ?? payload.remediation, ''),
    },
    metrics: normalizeMetricList(payload.metrics ?? payload.insights ?? payload.scores),
  }
}

export function normalizeRedTeamResponse(response) {
  const payload = response?.data ?? response ?? {}
  return {
    sessionTitle: toText(payload.session_title ?? payload.title ?? payload.session ?? 'Operation', 'Operation'),
    ttr: toText(payload.ttr ?? payload.elapsed ?? payload.duration ?? '', ''),
    topologyNodes: normalizePathNodes(payload.topology ?? payload.path_nodes ?? payload.network_topology ?? payload.nodes),
    timeline: toArray(payload.timeline ?? payload.events ?? payload.steps).map((item, index) => ({
      phase: toText(item?.phase ?? item?.stage ?? item?.label, `Phase ${index + 1}`),
      time: toText(item?.time ?? item?.timestamp ?? item?.at, ''),
      attackTitle: toText(item?.attackTitle ?? item?.attack_title ?? item?.attack ?? item?.red, ''),
      attackBody: toText(item?.attackBody ?? item?.attack_body ?? item?.attack_description ?? '', ''),
      defenseTitle: toText(item?.defenseTitle ?? item?.defense_title ?? item?.blue ?? '', ''),
      defenseBody: toText(item?.defenseBody ?? item?.defense_body ?? item?.defense_description ?? '', ''),
      tone: toText(item?.tone ?? item?.attack_tone ?? 'primary', 'primary'),
      defenseTone: toText(item?.defenseTone ?? item?.defense_tone ?? 'secondary', 'secondary'),
    })),
    metrics: normalizeMetricList(payload.metrics ?? payload.assessment ?? payload.risk),
    logLines: normalizeLogLines(payload.live_log ?? payload.logs ?? payload.terminal_output),
    controls: toArray(payload.controls ?? payload.parameters ?? payload.scenario).map((item, index) => ({
      label: toText(item?.label ?? item?.name ?? item?.parameter, `Control ${index + 1}`),
      value: item?.value ?? item?.default ?? '',
      type: toText(item?.type ?? 'select', 'select'),
    })),
  }
}

export function normalizeAuditResponse(response) {
  const payload = response?.data ?? response ?? {}
  const rows = Array.isArray(payload) ? payload : payload.records ?? payload.history ?? payload.logs ?? payload.audit_logs
  return {
    rows: normalizeAuditRows(rows),
    metrics: normalizeMetricList(payload.metrics ?? payload.summary ?? payload.stats),
  }
}
