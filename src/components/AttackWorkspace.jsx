import { useCallback, useEffect, useState } from 'react'
import { attackPathNodes, attackVectors, topologyJson, workspaceHighlights } from '../data/dashboardData.js'
import {
  fetchAnalyze,
  fetchCountermeasures,
  normalizeAnalyzeResponse,
} from '../lib/agambhittApi.js'

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

function AttackVectorCard({ vector }) {
  return (
    <article className={`vector-card${vector.muted ? ' is-muted' : ''}`}>
      <div className="vector-header">
        <h3 className="vector-title app-heading">{vector.title}</h3>
        <span className={`severity-pill ${vector.tone}`}>{vector.severity}</span>
      </div>

      <p className="vector-desc">{vector.description}</p>

      {vector.path ? (
        <div className="vector-meta">
          <div className="avatar-stack" aria-hidden="true">
            {(vector.actors ?? []).map((actor) => (
              <div className="avatar" key={actor}>
                {actor}
              </div>
            ))}
          </div>
          <span className="meta-copy app-heading">{vector.path}</span>
        </div>
      ) : null}
    </article>
  )
}

function PathNode({ node }) {
  return (
    <div className="path-node">
      <div className={`node-circle is-${node.tone}`}>
        <span className={`material-symbols-outlined ${node.tone === 'primary' ? 'text-primary' : ''}`} aria-hidden="true">
          {node.icon}
        </span>
      </div>
      <span className="label-copy app-heading">{node.label}</span>
    </div>
  )
}

export function AttackWorkspace() {
  const [topologyInput, setTopologyInput] = useState(topologyJson)
  const [analysis, setAnalysis] = useState(null)
  const [countermeasures, setCountermeasures] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const runAnalysis = useCallback(
    async (input = topologyInput) => {
      let parsedTopology

      try {
        parsedTopology = JSON.parse(input)
      } catch {
        setError('Topology JSON is invalid.')
        return
      }

      setIsLoading(true)
      setError('')

      try {
        const analyzeResponse = await fetchAnalyze({ topology: parsedTopology })
        const normalizedAnalyze = normalizeAnalyzeResponse(analyzeResponse)
        setAnalysis(normalizedAnalyze)

        const counterResponse = await fetchCountermeasures({
          topology: parsedTopology,
          analysis: analyzeResponse,
        })
        const normalizedCountermeasures = normalizeAnalyzeResponse(counterResponse)
        setCountermeasures(normalizedCountermeasures.countermeasures)
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : 'Unable to analyze topology.')
        setAnalysis(null)
        setCountermeasures([])
      } finally {
        setIsLoading(false)
      }
    },
    [topologyInput],
  )

  useEffect(() => {
    void Promise.resolve().then(() => runAnalysis(topologyJson))
  }, [runAnalysis])

  const vectors = analysis?.vectors.length ? analysis.vectors : attackVectors
  const pathNodes = analysis?.pathNodes.length ? analysis.pathNodes : attackPathNodes
  const controls = countermeasures.length
    ? countermeasures
    : [
        { title: 'Network Segmentation', description: 'Segment exposed web and database tiers.' },
        { title: 'Credential Reset', description: 'Rotate privileged credentials and invalidate active sessions.' },
        { title: 'Firewall Review', description: 'Block suspicious egress paths at the edge firewall.' },
      ]

  return (
    <section className="workspace-section dashboard-content">
      <div className="workspace-title-row">
        <div>
          <h1 className="section-heading app-heading">Attack Predictor</h1>
          <p className="section-subtitle">
            {analysis?.summary || 'Predictive detection for likely attack chains across exposed assets.'}
          </p>
        </div>

        <p className="workspace-tag">{workspaceHighlights[0].title}</p>
      </div>

      <div className="dashboard-grid">
        <div className="panel-grid">
          <SectionCard
            icon={{ name: 'data_object', tone: 'is-secondary' }}
            title="Network Topology Data"
            action={
              <div className="badge-row" style={{ gap: '0.5rem' }}>
                <button className="control-chip" type="button">
                  Import JSON
                </button>
                <button className="control-chip" type="button" onClick={() => runAnalysis()}>
                  {isLoading ? 'Analyzing...' : 'Analyze'}
                </button>
              </div>
            }
          >
            <textarea
              className="text-editor"
              onChange={(event) => setTopologyInput(event.target.value)}
              spellCheck="false"
              value={topologyInput}
            />
            {error ? <p className="path-note" style={{ color: '#b91c1c' }}>{error}</p> : null}
          </SectionCard>

          <SectionCard
            icon={{ name: 'warning', tone: 'is-danger' }}
            title="Ranked Attack Vectors"
            action={<span className="count-pill">{vectors.length} Findings</span>}
          >
            <div className="vector-list">
              {vectors.map((vector) => (
                <AttackVectorCard key={vector.title} vector={vector} />
              ))}
            </div>
          </SectionCard>
        </div>

        <SectionCard
          icon={{ name: 'hub', tone: 'is-secondary' }}
          title="Predicted Attack Path Visualization"
          action={
            <div className="path-legend">
              <div className="legend-item">
                <span className="legend-dot is-danger" aria-hidden="true" />
                <span className="small-label">Exploited</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot is-primary" aria-hidden="true" />
                <span className="small-label">Target</span>
              </div>
            </div>
          }
        >
          <div className="path-board">
            <div className="decor-dots" aria-hidden="true" />

            <div className="path-grid">
              {pathNodes.map((node, index) => (
                <>
                  <PathNode key={node.label} node={node} />

                  {index < pathNodes.length - 1 ? (
                    <div
                      className={`path-link${index === 0 ? ' is-animated' : ''}${index === 1 ? ' is-accent' : ''}${index === 2 ? ' is-dashed' : ''}`}
                      aria-hidden="true"
                    />
                  ) : null}
                </>
              ))}
            </div>

            <p className="path-note app-heading">
              {analysis?.summary ||
                'The active chain begins at the external actor, pivots through the web tier, and reaches the database before exfiltration.'}
            </p>
          </div>
        </SectionCard>

        <SectionCard
          icon={{ name: 'shield', tone: 'is-secondary' }}
          title="Countermeasures"
          action={<span className="count-pill">{controls.length} Controls</span>}
        >
          <div className="vector-list">
            {controls.map((control) => (
              <article className="vector-card" key={control.title}>
                <h3 className="vector-title app-heading">{control.title}</h3>
                <p className="vector-desc">{control.description}</p>
              </article>
            ))}
          </div>
        </SectionCard>
      </div>
    </section>
  )
}