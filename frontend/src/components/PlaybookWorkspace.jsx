import { useState, useEffect } from 'react'
import { fetchPlaybook } from '../lib/agambhittApi.js'

export function PlaybookWorkspace({
  selectedVector,
  setSelectedVector,
  incidentDesc,
  setIncidentDesc,
  playbook,
  setPlaybook
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGenerate = async () => {
    if (!selectedVector) {
      setError('Please select or generate an attack vector first.')
      return
    }

    setIsLoading(true)
    setError('')
    try {
      const response = await fetchPlaybook({
        selected_attack_vector: selectedVector,
        incident_description: incidentDesc
      })
      setPlaybook(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Playbook generation failed.')
    } finally {
      setIsLoading(false)
    }
  }

  // Clear current playbook output if a new vector is chosen
  useEffect(() => {
    if (selectedVector) {
      setPlaybook(null)
    }
  }, [selectedVector, setPlaybook])

  return (
    <section className="workspace-section dashboard-content">
      <div className="workspace-title-row">
        <div>
          <h1 className="section-heading app-heading">Remediation Playbook Generator</h1>
          <p className="section-subtitle">
            Generate containment, eradication, and recovery plans for selected attack paths.
          </p>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="panel-grid" style={{ gridTemplateColumns: '1fr' }}>
          <section className="surface-card">
            <div className="card-header">
              <h2 className="card-title app-heading">Input Context</h2>
              <button
                className="new-simulation"
                onClick={handleGenerate}
                disabled={isLoading || !selectedVector}
                style={{ cursor: 'pointer', padding: '0.55rem 0.9rem', width: 'auto' }}
              >
                {isLoading ? 'Generating...' : 'Generate Playbook'}
              </button>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="small-label">Selected Attack Vector</label>
                {selectedVector ? (
                  <div style={{ background: '#f1f5f9', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }}>
                    <div style={{ fontWeight: 600 }} className="app-heading">{selectedVector.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Path: {selectedVector.path.join(' ➔ ')}</div>
                  </div>
                ) : (
                  <div style={{ padding: '0.75rem', border: '1px dashed #cbd5e1', borderRadius: '0.5rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="material-symbols-outlined">warning</span>
                    <span>No vector selected. Go to the Attack Predictor tab, run an analysis, and click "Generate Playbook".</span>
                  </div>
                )}
              </div>

              <div>
                <label className="small-label">Incident Description / Observations</label>
                <textarea
                  className="text-editor"
                  style={{ minHeight: '6rem' }}
                  value={incidentDesc}
                  onChange={(e) => setIncidentDesc(e.target.value)}
                />
              </div>

              {!selectedVector && (
                <button
                  className="control-chip"
                  style={{ alignSelf: 'flex-start' }}
                  onClick={() => setSelectedVector({
                    vector_id: "VEC-TEST",
                    name: "Test Compromise Path",
                    path: ["External_C2", "AppServer_Portal", "DB_Core_Banking"],
                    severity: "High",
                    likelihood: "High",
                    business_impact: "Database Compromise",
                    mitre_attack_mappings: ["T1190"],
                    description: "Manual test vector bypass configuration."
                  })}
                >
                  Use Dummy Test Vector
                </button>
              )}

              {error && <p style={{ color: 'var(--danger)', margin: 0 }}>{error}</p>}
            </div>
          </section>
        </div>

        {playbook && (
          <div className="panel-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <section className="surface-card">
              <div className="card-header" style={{ borderBottom: '2px solid #ef4444' }}>
                <h3 className="card-title app-heading" style={{ color: '#ef4444' }}>Containment</h3>
              </div>
              <div className="card-body">
                <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {playbook.containment.map((item, idx) => (
                    <li key={idx} style={{ fontSize: '0.85rem' }}>{item}</li>
                  ))}
                </ul>
              </div>
            </section>

            <section className="surface-card">
              <div className="card-header" style={{ borderBottom: '2px solid #f59e0b' }}>
                <h3 className="card-title app-heading" style={{ color: '#f59e0b' }}>Eradication</h3>
              </div>
              <div className="card-body">
                <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {playbook.eradication.map((item, idx) => (
                    <li key={idx} style={{ fontSize: '0.85rem' }}>{item}</li>
                  ))}
                </ul>
              </div>
            </section>

            <section className="surface-card">
              <div className="card-header" style={{ borderBottom: '2px solid #10b981' }}>
                <h3 className="card-title app-heading" style={{ color: '#10b981' }}>Recovery</h3>
              </div>
              <div className="card-body">
                <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {playbook.recovery.map((item, idx) => (
                    <li key={idx} style={{ fontSize: '0.85rem' }}>{item}</li>
                  ))}
                </ul>
              </div>
            </section>
          </div>
        )}

        {playbook && playbook.rca && (
          <section className="surface-card">
            <div className="card-header">
              <h3 className="card-title app-heading">Root Cause Analysis (RCA)</h3>
            </div>
            <div className="card-body">
              <p style={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem', lineHeight: 1.5 }}>{playbook.rca}</p>
            </div>
          </section>
        )}

        {playbook && playbook.cacao_playbook && (
          <div className="panel-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
            <section className="surface-card">
              <div className="card-header">
                <h3 className="card-title app-heading">OASIS CACAO Playbook Specification</h3>
              </div>
              <div className="card-body">
                <pre style={{
                  background: '#0b1329',
                  color: '#38bdf8',
                  padding: '1rem',
                  overflowX: 'auto',
                  maxHeight: '25rem',
                  fontSize: '0.8rem',
                  fontFamily: 'monospace',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all'
                }}>
                  {JSON.stringify(playbook.cacao_playbook, null, 2)}
                </pre>
              </div>
            </section>

            <section className="surface-card">
              <div className="card-header">
                <h3 className="card-title app-heading">Remediation Script</h3>
              </div>
              <div className="card-body">
                <pre style={{
                  background: '#0b1329',
                  color: '#10b981',
                  padding: '1rem',
                  overflowX: 'auto',
                  maxHeight: '25rem',
                  fontSize: '0.8rem',
                  fontFamily: 'monospace',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all'
                }}>
                  {playbook.remediation_script}
                </pre>
              </div>
            </section>
          </div>
        )}

        {playbook && playbook.script_risks && playbook.script_risks.length > 0 && (
          <section className="surface-card" style={{ borderLeft: '4px solid #ef4444' }}>
            <div className="card-header">
              <h3 className="card-title app-heading" style={{ color: '#ef4444' }}>Script Execution Risks & Destructive Impact</h3>
            </div>
            <div className="card-body">
              <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', margin: 0 }}>
                {playbook.script_risks.map((risk, idx) => (
                  <li key={idx} style={{ fontSize: '0.85rem', color: 'var(--text-strong)', lineHeight: 1.4 }}>
                    {risk}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </div>
    </section>
  )
}