import { useState } from 'react'
import { fetchAnalyze } from '../lib/agambhittApi.js'

export function AttackWorkspace({
  topology,
  setTopology,
  vulnerabilities,
  setVulnerabilities,
  incidents,
  setIncidents,
  setSelectedVector,
  setActiveView
}) {
  const [topologyStr, setTopologyStr] = useState(JSON.stringify(topology, null, 2))
  const [vulnStr, setVulnStr] = useState(JSON.stringify(vulnerabilities, null, 2))
  const [incidentsStr, setIncidentsStr] = useState(JSON.stringify(incidents, null, 2))
  
  const [attackVectors, setAttackVectors] = useState([])
  const [graphNodes, setGraphNodes] = useState([])
  const [graphEdges, setGraphEdges] = useState([])
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleAnalyze = async () => {
    setIsLoading(true)
    setError('')
    try {
      const parsedTopology = JSON.parse(topologyStr)
      const parsedVulns = JSON.parse(vulnStr)
      const parsedIncidents = JSON.parse(incidentsStr)

      // Save to parent state for sharing
      setTopology(parsedTopology)
      setVulnerabilities(parsedVulns)
      setIncidents(parsedIncidents)

      const result = await fetchAnalyze({
        topology: parsedTopology,
        vulnerabilities: parsedVulns,
        historical_incidents: parsedIncidents,
      })

      setAttackVectors(result.attack_vectors || [])
      setGraphNodes(result.graph_nodes || [])
      setGraphEdges(result.graph_edges || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="workspace-section dashboard-content">
      <div className="workspace-title-row">
        <div>
          <h1 className="section-heading app-heading">Attack Predictor</h1>
          <p className="section-subtitle">
            Analyze network topology and vulnerabilities using NetworkX and granite4.1:3b.
          </p>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Input Forms */}
        <div className="panel-grid">
          <section className="surface-card">
            <div className="card-header">
              <h2 className="card-title app-heading">Network Configuration</h2>
              <button 
                className="control-chip" 
                onClick={handleAnalyze} 
                disabled={isLoading}
                style={{ cursor: 'pointer', background: 'var(--primary)', color: '#fff' }}
              >
                {isLoading ? 'Analyzing...' : 'Run Analysis ⚡'}
              </button>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="small-label">Topology JSON</label>
                <textarea
                  className="text-editor"
                  style={{ minHeight: '10rem', fontFamily: 'monospace', fontSize: '0.85rem' }}
                  value={topologyStr}
                  onChange={(e) => setTopologyStr(e.target.value)}
                />
              </div>
              <div>
                <label className="small-label">Vulnerabilities JSON</label>
                <textarea
                  className="text-editor"
                  style={{ minHeight: '8rem', fontFamily: 'monospace', fontSize: '0.85rem' }}
                  value={vulnStr}
                  onChange={(e) => setVulnStr(e.target.value)}
                />
              </div>
              <div>
                <label className="small-label">Incidents JSON</label>
                <textarea
                  className="text-editor"
                  style={{ minHeight: '6rem', fontFamily: 'monospace', fontSize: '0.85rem' }}
                  value={incidentsStr}
                  onChange={(e) => setIncidentsStr(e.target.value)}
                />
              </div>
              {error && <p style={{ color: 'var(--danger)', margin: 0 }}>{error}</p>}
            </div>
          </section>

          {/* Results List */}
          <section className="surface-card">
            <div className="card-header">
              <h2 className="card-title app-heading">Predicted Attack Vectors</h2>
              <span className="count-pill">{attackVectors.length} Found</span>
            </div>
            <div className="card-body" style={{ overflowY: 'auto', maxHeight: '42rem' }}>
              {attackVectors.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '3rem' }}>shield</span>
                  <p>No attack vectors predicted yet. Configure inputs and run analysis.</p>
                </div>
              ) : (
                <div className="vector-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {attackVectors.map((vec, idx) => (
                    <article key={idx} className="vector-card" style={{ borderLeft: '4px solid var(--danger)' }}>
                      <div className="vector-header">
                        <h3 className="vector-title app-heading">{vec.name}</h3>
                        <span className="severity-pill critical">{vec.severity}</span>
                      </div>
                      <p className="vector-desc">{vec.description}</p>
                      <div style={{ fontSize: '0.85rem', margin: '0.5rem 0' }}>
                        <strong>Likelihood:</strong> {vec.likelihood} | <strong>Impact:</strong> {vec.business_impact}
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', margin: '0.5rem 0' }}>
                        {vec.mitre_attack_mappings.map(tag => (
                          <span key={tag} className="tag-chip" style={{ background: '#fee2e2', color: '#b91c1c', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem' }}>{tag}</span>
                        ))}
                      </div>
                      <div className="vector-meta" style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', marginTop: '0.5rem' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Path: {vec.path.join(' ➔ ')}</span>
                        <button
                          className="control-chip"
                          style={{ marginLeft: 'auto', background: 'var(--bg-soft)', border: '1px solid #cbd5e1', cursor: 'pointer' }}
                          onClick={() => {
                            setSelectedVector(vec)
                            setActiveView('playbook')
                          }}
                        >
                          Generate Playbook ➔
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Path Visualization Panel */}
        {graphNodes.length > 0 && (
          <section className="surface-card">
            <div className="card-header">
              <h2 className="card-title app-heading">Topology Connections & Paths</h2>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '0.75rem' }}>
                {graphNodes.map(node => (
                  <div key={node.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fff', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                    <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>
                      {node.type === 'DB' ? 'database' : node.type === 'External' ? 'public' : 'dns'}
                    </span>
                    <div>
                      <div className="app-heading" style={{ fontSize: '0.9rem', fontWeight: 600 }}>{node.id}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{node.ip || 'no-ip'} (Tier {node.tier})</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '1rem' }}>
                <h4 className="app-heading" style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>Active Traffic Flows:</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
                  {graphEdges.map((edge, idx) => (
                    <div key={idx} style={{ fontSize: '0.8rem', padding: '0.5rem', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.25rem' }}>
                      <strong>{edge.source}</strong> ➔ <strong>{edge.target}</strong>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Protocol: {edge.protocol || 'N/A'} (Port: {edge.port || 'N/A'})</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </section>
  )
}