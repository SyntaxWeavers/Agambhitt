import { useCallback, useEffect, useState } from 'react'
import {
  redTeamControls,
  redTeamLogLines,
  redTeamMetrics,
  redTeamPath,
  redTeamTimeline,
} from '../data/dashboardData.js'
import { fetchRedTeam, normalizeRedTeamResponse } from '../lib/agambhittApi.js'

function SectionCard({ icon, title, action, children, className = '' }) {
  return (
    <section className={`surface-card ${className}`.trim()}>
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

function MetricBar({ label, value, tone }) {
  return (
    <div>
      <div className="metric-row">
        <span className="metric-label app-heading">{label}</span>
        <span className={`metric-value ${tone}`}>{value}</span>
      </div>
      <div className="metric-track">
        <div className={`metric-fill ${tone}`} style={{ width: value }} />
      </div>
    </div>
  )
}

function TimelineItem({ item }) {
  return (
    <div className={`timeline-item is-${item.tone}`}>
      <div className="timeline-marker" />
      <div className="timeline-grid">
        <article className="timeline-card is-attack">
          <div className="timeline-head">
            <span className={`timeline-tag is-${item.tone}`}>{item.phase}</span>
            <span className="timeline-time">{item.time}</span>
          </div>
          <h3 className="timeline-title app-heading">{item.attackTitle}</h3>
          <p className="timeline-copy">{item.attackBody}</p>
        </article>

        <article className={`timeline-card is-defense is-${item.defenseTone}`}>
          <div className="timeline-head">
            <span className={`timeline-tag is-${item.defenseTone}`}>DETECTION</span>
            <span className="material-symbols-outlined timeline-icon" aria-hidden="true">
              {item.defenseTone === 'error' ? 'warning' : 'verified'}
            </span>
          </div>
          <h3 className="timeline-title app-heading">{item.defenseTitle}</h3>
          <p className="timeline-copy">{item.defenseBody}</p>
        </article>
      </div>
    </div>
  )
}

function PathNode({ node }) {
  return (
    <div className="redteam-node">
      <div className={`redteam-node-circle is-${node.tone}`}>
        <span className="material-symbols-outlined" aria-hidden="true">
          {node.icon}
        </span>
        <span className="redteam-node-status">{node.status}</span>
      </div>
      <span className="redteam-node-label app-heading">{node.label}</span>
    </div>
  )
}

export function RedTeamWorkspace() {
  const [simulation, setSimulation] = useState(null)
  const [actorProfile, setActorProfile] = useState(redTeamControls[0].value)
  const [attackVelocity, setAttackVelocity] = useState(72)
  const [autoGeneratePlaybook, setAutoGeneratePlaybook] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const runSimulation = useCallback(async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await fetchRedTeam({
        threat_actor_profile: actorProfile,
        attack_velocity: attackVelocity,
        auto_generate_playbook: autoGeneratePlaybook,
      })
      setSimulation(normalizeRedTeamResponse(response))
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to load red team simulation.')
      setSimulation(null)
    } finally {
      setIsLoading(false)
    }
  }, [actorProfile, attackVelocity, autoGeneratePlaybook])

  useEffect(() => {
    void Promise.resolve().then(() => runSimulation())
  }, [runSimulation])

  const simulationData = simulation ?? {
    sessionTitle: 'Operation Golden Eye',
    ttr: '14m 22s',
    topologyNodes: redTeamPath,
    timeline: redTeamTimeline,
    metrics: redTeamMetrics,
    logLines: redTeamLogLines,
  }

  return (
    <section className="workspace-section dashboard-content redteam-workspace">
      <div className="workspace-title-row redteam-header">
        <div>
          <h1 className="section-heading app-heading">Red Team Simulator</h1>
          <p className="section-subtitle">
            Active Session: {simulationData.sessionTitle} {simulationData.ttr ? `• TTR: ${simulationData.ttr}` : ''}
          </p>
        </div>

        <div className="redteam-actions">
          <button className="control-chip secondary-chip" type="button">
            Terminate
          </button>
          <button className="new-simulation generate-button" type="button" onClick={runSimulation}>
            {isLoading ? 'Executing...' : 'Execute Next Step'}
            <span className="material-symbols-outlined" aria-hidden="true">play_arrow</span>
          </button>
        </div>
      </div>

      {error ? <p className="path-note" style={{ color: '#b91c1c' }}>{error}</p> : null}

      <SectionCard
        icon={{ name: 'hub', tone: 'is-secondary' }}
        title="Network Topology Configuration"
        action={
          <div className="path-legend redteam-legend">
            <div className="legend-item">
              <span className="legend-dot is-secondary" aria-hidden="true" />
              <span className="small-label">12 Protected</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot is-danger pulse-dot" aria-hidden="true" />
              <span className="small-label">2 Compromised</span>
            </div>
          </div>
        }
      >
        <div className="topology-shell">
          <div className="topology-row">
            {simulationData.topologyNodes.map((node, index) => (
              <div className="topology-item" key={node.label}>
                <PathNode node={node} />
                {index < simulationData.topologyNodes.length - 1 ? <div className="topology-link" aria-hidden="true" /> : null}
              </div>
            ))}
          </div>
        </div>
      </SectionCard>

      <div className="redteam-grid">
        <div className="redteam-main">
          <div className="redteam-switcher">
            <div className="switcher-item">
              <span className="legend-dot is-primary" aria-hidden="true" />
              <span className="small-label">Red Attack</span>
            </div>
            <div className="switcher-item">
              <span className="legend-dot is-secondary" aria-hidden="true" />
              <span className="small-label">Blue Defense</span>
            </div>
            <span className="switcher-note">Sorted by Chronology</span>
          </div>

          <div className="timeline-list">
            {simulationData.timeline.map((item) => (
              <TimelineItem key={`${item.phase}-${item.time}`} item={item} />
            ))}
          </div>
        </div>

        <aside className="redteam-sidebar">
          <SectionCard icon={{ name: 'analytics', tone: 'is-primary' }} title="Impact Assessment">
            <div className="metric-stack">
              {simulationData.metrics.map((metric) => (
                <MetricBar key={metric.label} {...metric} />
              ))}
            </div>
          </SectionCard>

          <SectionCard icon={{ name: 'settings', tone: 'is-secondary' }} title="Scenario Parameters">
            <div className="scenario-stack">
              {redTeamControls.map((control) => (
                <div className="scenario-control" key={control.label}>
                  <label className="scenario-label app-heading">{control.label}</label>
                  {control.type === 'select' ? (
                    <select
                      className="scenario-select"
                      onChange={(event) => setActorProfile(event.target.value)}
                      value={actorProfile}
                    >
                      <option>{control.value}</option>
                      <option>Lazarus Group</option>
                      <option>Fin7 / Carbanak</option>
                    </select>
                  ) : control.type === 'range' ? (
                    <div className="range-shell">
                      <input
                        className="scenario-range"
                        onChange={(event) => setAttackVelocity(Number(event.target.value))}
                        type="range"
                        value={attackVelocity}
                      />
                      <div className="range-labels">
                        <span>Stealthy</span>
                        <span>Real-time</span>
                        <span>Fast</span>
                      </div>
                    </div>
                  ) : (
                    <label className="toggle-shell">
                      <input
                        checked={autoGeneratePlaybook}
                        onChange={(event) => setAutoGeneratePlaybook(event.target.checked)}
                        type="checkbox"
                      />
                      <span>Auto-generate Playbook</span>
                    </label>
                  )}
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard icon={{ name: 'terminal', tone: 'is-danger' }} title="Live Log">
            <div className="live-log">
              <div className="live-log-head">
                <span className="small-label">Terminal Output</span>
                <span className="live-pill">
                  <span className="live-dot" /> Live
                </span>
              </div>
              <div className="live-log-body">
                {simulationData.logLines.map((line) => (
                  <p className={`log-line tone-${line.tone}`} key={line.text}>
                    {line.text}
                  </p>
                ))}
                <p className="log-line caret">_</p>
              </div>
            </div>
          </SectionCard>
        </aside>
      </div>

      <button className="redteam-fab" type="button" aria-label="Open analytics">
        <span className="material-symbols-outlined" aria-hidden="true">analytics</span>
      </button>
    </section>
  )
}