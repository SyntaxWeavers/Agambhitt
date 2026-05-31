import { useState } from 'react'
import { fetchRedTeam } from '../lib/agambhittApi.js'

export function RedTeamWorkspace({
  topology,
  setAttackChain,
  setActiveView
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [chain, setChain] = useState([])

  const handleSimulate = async () => {
    setIsLoading(true)
    setError('')
    try {
      const response = await fetchRedTeam({
        topology: topology,
        vulnerabilities: []
      })
      setChain(response.attack_chain || [])
      setAttackChain(response.attack_chain || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Simulation failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="workspace-section dashboard-content">
      <div className="workspace-title-row">
        <div>
          <h1 className="section-heading app-heading">Red Team Simulator</h1>
          <p className="section-subtitle">
            Simulate sophisticated multi-stage attacks using the active topology and local LLM.
          </p>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <button
            className="new-simulation generate-button"
            onClick={handleSimulate}
            disabled={isLoading}
            style={{ cursor: 'pointer' }}
          >
            {isLoading ? 'Simulating...' : 'Run Simulation'}
          </button>
        </div>
      </div>

      {error && <p style={{ color: 'var(--danger)', padding: '0 1rem' }}>{error}</p>}

      <div className="dashboard-grid">
        <section className="surface-card">
          <div className="card-header">
            <h2 className="card-title app-heading">Active Attack Chain Simulation</h2>
            {chain.length > 0 && (
              <button
                className="control-chip"
                style={{ background: 'var(--primary)', color: '#fff', cursor: 'pointer' }}
                onClick={() => setActiveView('countermeasures')}
              >
                Send to Defensive Response
              </button>
            )}
          </div>
          <div className="card-body">
            {chain.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '3.5rem' }}>terminal</span>
                <p>No active attack simulation has been run yet. Run the simulation to view the timeline.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1rem 0' }}>
                {chain.map((step, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '1rem', borderLeft: '2px solid var(--primary)', paddingLeft: '1.5rem', position: 'relative' }}>
                    <div style={{
                      position: 'absolute',
                      left: '-7px',
                      top: '0',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: 'var(--primary)'
                    }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span className="severity-pill critical" style={{ fontSize: '0.75rem', padding: '2px 6px' }}>{step.phase}</span>
                        <span className="tag-chip" style={{ background: '#f1f5f9', color: '#475569', fontSize: '0.75rem', borderRadius: '4px', padding: '2px 6px' }}>{step.mitre_id}</span>
                        <strong className="app-heading" style={{ fontSize: '0.9rem' }}>{step.technique}</strong>
                      </div>
                      <p style={{ margin: '0.5rem 0', fontSize: '0.85rem', color: 'var(--text-strong)' }}>{step.description}</p>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Path: <strong>{step.src_node}</strong> ➔ <strong>{step.dst_node}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </section>
  )
}