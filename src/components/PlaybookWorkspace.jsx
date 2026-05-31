import { useCallback, useEffect, useState } from 'react'
import { incidentSteps, playbookInsights, playbookMetrics } from '../data/dashboardData.js'
import { fetchPlaybook, normalizePlaybookResponse } from '../lib/agambhittApi.js'

function SectionCard({ icon, title, action, children }) {
  return (
    <section className="surface-card">
      <div className="card-header">
        <div className="badge-row">
          <span className={`icon-badge ${icon.tone ?? ''}`.trim()} aria-hidden="true">
            <span className="material-symbols-outlined inline-icon">{icon.name}</span>
          </span>
          <h2 className="card-title app-heading">{title}</h2>
        </div>

        {action}
      </div>

      <div className="card-body">{children}</div>
    </section>
  )
}

function StepList({ steps }) {
  return (
    <div className="step-list">
      {steps.map((step, index) => (
        <label className="step-item" key={step.text ?? step}>
          <input type="checkbox" defaultChecked={step.checked ?? index === 2} />
          <span>{step.text ?? step}</span>
        </label>
      ))}
    </div>
  )
}

export function PlaybookWorkspace() {
  const [incidentDescription, setIncidentDescription] = useState(
    "Unusual outbound traffic on port 443 from DB-SRV-01 to unknown IP in Russia...",
  )
  const [playbook, setPlaybook] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const generatePlaybook = useCallback(
    async (input = incidentDescription) => {
      setIsLoading(true)
      setError('')

      try {
        const response = await fetchPlaybook({ incident_description: input })
        setPlaybook(normalizePlaybookResponse(response))
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : 'Unable to generate playbook.')
        setPlaybook(null)
      } finally {
        setIsLoading(false)
      }
    },
    [incidentDescription],
  )

  useEffect(() => {
    void Promise.resolve().then(() => generatePlaybook())
  }, [generatePlaybook])

  const playbookData = playbook ?? {
    containment: incidentSteps.containment.map((text, index) => ({ text, checked: index === 2 })),
    eradication: incidentSteps.eradication.map((text) => ({ text, checked: false })),
    recovery: incidentSteps.recovery.map((text) => ({ text, checked: false })),
    rootCause: {
      vulnerability: 'CVE-2024-21887',
      summary: 'Command Injection in Legacy API Gateway',
      actor: 'Uncategorized (SUSPECTED APT-41)',
      impact: 'Low (Intercepted at 0.4GB)',
      recommendation:
        'Upgrade the core API gateway to v4.2.1 immediately to patch the command injection flaw. Legacy endpoints must be audited for similar signatures.',
    },
    metrics: playbookMetrics,
  }

  const metrics = playbookData.metrics.length ? playbookData.metrics : playbookMetrics

  return (
    <section className="workspace-section dashboard-content">
      <div className="workspace-title-row">
        <div>
          <h1 className="section-heading app-heading">Automated Response Workflow</h1>
          <p className="section-subtitle">
            Generate, organize, and track remediation steps for active incidents.
          </p>
        </div>

        <p className="workspace-tag">{isLoading ? 'Generating...' : 'AI-powered analysis'}</p>
      </div>

      <div className="dashboard-grid">
        <section className="surface-card">
          <div className="card-header">
            <div className="badge-row">
              <span className="icon-badge is-secondary" aria-hidden="true">
                <span className="material-symbols-outlined inline-icon">description</span>
              </span>
              <h2 className="card-title app-heading">Incident Description</h2>
            </div>

            <span className="pill-accent">AI-POWERED ANALYSIS</span>
          </div>

          <div className="card-body">
            <textarea
              className="text-editor playbook-input"
              onChange={(event) => setIncidentDescription(event.target.value)}
              placeholder="Describe the detected anomaly or incident signature (e.g., 'Unusual outbound traffic on port 443 from DB-SRV-01 to unknown IP in Russia...')"
              value={incidentDescription}
            />

            {error ? <p className="path-note" style={{ color: '#b91c1c' }}>{error}</p> : null}

            <div className="workspace-actions">
              <button className="new-simulation generate-button" type="button" onClick={() => generatePlaybook()}>
                {isLoading ? 'Generating...' : 'Generate Remediation Steps'}
                <span className="material-symbols-outlined" aria-hidden="true">bolt</span>
              </button>
            </div>
          </div>
        </section>

        <div className="panel-grid playbook-grid">
          <SectionCard
            icon={{ name: 'security_update_good', tone: 'is-danger' }}
            title="Containment"
            action={<span className="count-pill">Priority 1</span>}
          >
            <StepList steps={playbookData.containment} />
            <button className="add-step-button" type="button">+ Add Step</button>
          </SectionCard>

          <SectionCard
            icon={{ name: 'cleaning_services', tone: 'is-secondary' }}
            title="Eradication"
            action={<span className="count-pill">Priority 2</span>}
          >
            <StepList steps={playbookData.eradication} />
            <button className="add-step-button" type="button">+ Add Step</button>
          </SectionCard>

          <SectionCard
            icon={{ name: 'settings_backup_restore', tone: 'is-primary' }}
            title="Recovery"
            action={<span className="count-pill">Priority 3</span>}
          >
            <StepList steps={playbookData.recovery} />
            <button className="add-step-button" type="button">+ Add Step</button>
          </SectionCard>
        </div>

        <SectionCard
          icon={{ name: 'troubleshoot', tone: 'is-primary' }}
          title="Root Cause Analysis"
          action={<span className="workspace-tag">Incident drill-down</span>}
        >
          <div className="analysis-grid">
            <div className="analysis-visual">
              <div className="analysis-map">
                <span className="material-symbols-outlined analysis-icon" aria-hidden="true">schema</span>
                <p className="small-label">Attack Vector Map</p>
              </div>
            </div>

            <div className="analysis-details">
              <div className="analysis-primary">
                <p className="small-label">Primary Vulnerability</p>
                <div className="analysis-inline">
                  <span className="analysis-chip">{playbookData.rootCause.vulnerability || 'CVE-2024-21887'}</span>
                  <p className="body-copy">{playbookData.rootCause.summary || 'Command Injection in Legacy API Gateway'}</p>
                </div>
              </div>

              <div className="analysis-metrics">
                {metrics.map((metric) => (
                  <div className="analysis-metric" key={metric.label}>
                    <p className="metric-label small-label">{metric.label}</p>
                    <p className="metric-value app-heading">{metric.value}</p>
                  </div>
                ))}
              </div>

              <div className="analysis-insights">
                <div className="analysis-insight">
                  <p className="small-label">Threat Actor</p>
                  <p className="analysis-value app-heading">{playbookData.rootCause.actor || playbookInsights[1].value}</p>
                  <p className="muted-copy">{playbookInsights[1].note}</p>
                </div>
                <div className="analysis-insight">
                  <p className="small-label">Data Impact</p>
                  <p className="analysis-value app-heading">{playbookData.rootCause.impact || playbookInsights[2].value}</p>
                  <p className="muted-copy">{playbookInsights[2].note}</p>
                </div>
              </div>

              <div className="analysis-recommendation">
                <p className="small-label">Analyst Recommendation</p>
                <p className="body-copy italic-copy">
                  {playbookData.rootCause.recommendation || playbookInsights[2].note}
                </p>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>
    </section>
  )
}