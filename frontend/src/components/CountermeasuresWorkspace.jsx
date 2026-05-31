import { useState, useEffect } from 'react'
import { fetchCountermeasures } from '../lib/agambhittApi.js'

export function CountermeasuresWorkspace({ attackChain }) {
  const [countermeasures, setCountermeasures] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGenerate = async () => {
    if (attackChain.length === 0) {
      setError('Please run a Red Team simulation first to generate an attack chain.')
      return
    }

    setIsLoading(true)
    setError('')
    try {
      const response = await fetchCountermeasures({
        attack_chain: attackChain
      })
      setCountermeasures(response.countermeasures || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate countermeasures')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (attackChain.length > 0) {
      void Promise.resolve().then(() => handleGenerate())
    }
  }, [attackChain])

  return (
    <section className="workspace-section dashboard-content">
      <div className="workspace-title-row">
        <div>
          <h1 className="section-heading app-heading">Defensive Response Recommendations</h1>
          <p className="section-subtitle">
            Generate and categorize countermeasures based on the active Red Team simulation.
          </p>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <button
            className="new-simulation generate-button"
            onClick={handleGenerate}
            disabled={isLoading || attackChain.length === 0}
            style={{ cursor: 'pointer' }}
          >
            {isLoading ? 'Generating...' : 'Analyze Defensive Controls ⚡'}
          </button>
        </div>
      </div>

      {error && <p style={{ color: 'var(--danger)', padding: '0 1rem' }}>{error}</p>}

      <div className="dashboard-grid">
        {attackChain.length === 0 && (
          <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', padding: '3rem 1rem', borderRadius: '0.75rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '3rem' }}>shield_with_heart</span>
            <p>No active attack chain input found. Go to the Red Team Simulator, run a simulation, and click "Send to Defensive Response".</p>
          </div>
        )}

        {countermeasures.length > 0 && (
          <div className="panel-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
            {['Preventive', 'Mitigation', 'Detection', 'Monitoring'].map(cat => {
              const items = countermeasures.filter(c => c.type.toLowerCase().includes(cat.toLowerCase()))
              return (
                <section key={cat} className="surface-card">
                  <div className="card-header">
                    <h3 className="card-title app-heading">{cat} Controls</h3>
                    <span className="count-pill">{items.length} Recs</span>
                  </div>
                  <div className="card-body">
                    {items.length === 0 ? (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No specific {cat} controls recommended.</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {items.map((item, idx) => (
                          <div key={idx} style={{ padding: '0.5rem', background: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                            <div style={{ fontWeight: 600, fontSize: '0.85rem' }} className="app-heading">{item.description}</div>
                            <div style={{ fontSize: '0.8rem', margin: '0.25rem 0' }}>{item.details}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Target Node: <strong>{item.target_node}</strong></div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </section>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
