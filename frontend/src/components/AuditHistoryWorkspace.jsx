import { useEffect, useState } from 'react'
import { fetchHistory } from '../lib/agambhittApi.js'

export function AuditHistoryWorkspace() {
  const [logs, setLogs] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedLog, setSelectedLog] = useState(null)

  const loadHistory = async () => {
    setIsLoading(true)
    setError('')
    try {
      const response = await fetchHistory()
      setLogs(response || [])
      setSelectedLog(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load audit history.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void Promise.resolve().then(() => loadHistory())
  }, [])

  return (
    <section className="workspace-section dashboard-content">
      <div className="workspace-title-row">
        <div>
          <h1 className="section-heading app-heading">Audit & History Logs</h1>
          <p className="section-subtitle">
            View historical requests, predictions, and simulator execution logs stored in SQLite database.
          </p>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <button
            className="control-chip secondary-chip"
            onClick={loadHistory}
            disabled={isLoading}
            style={{ cursor: 'pointer' }}
          >
            {isLoading ? 'Refreshing...' : 'Refresh Logs'}
          </button>
        </div>
      </div>

      {error && <p style={{ color: 'var(--danger)', padding: '0 1rem' }}>{error}</p>}

      <div className="dashboard-grid">
        <section className="surface-card">
          <div className="card-header">
            <h2 className="card-title app-heading">Database Records</h2>
            <span className="count-pill">{logs.length} Operations</span>
          </div>
          <div className="card-body">
            {logs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '3rem' }}>history</span>
                <p>No logged operations in the database history.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="audit-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                      <th style={{ padding: '0.75rem' }}>ID</th>
                      <th style={{ padding: '0.75rem' }}>ENDPOINT</th>
                      <th style={{ padding: '0.75rem' }}>TIMESTAMP</th>
                      <th style={{ padding: '0.75rem' }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.75rem' }}>{log.id}</td>
                        <td style={{ padding: '0.75rem' }}>
                          <span className="severity-pill" style={{ background: '#e0f2fe', color: '#0369a1', fontSize: '0.8rem', padding: '3px 8px', borderRadius: '4px' }}>
                            {log.endpoint}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem', fontSize: '0.85rem' }}>{new Date(log.timestamp).toLocaleString()}</td>
                        <td style={{ padding: '0.75rem' }}>
                          <button
                            className="control-chip"
                            style={{ cursor: 'pointer', padding: '4px 10px', fontSize: '0.75rem' }}
                            onClick={() => setSelectedLog(log)}
                          >
                            Explore Payloads
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {selectedLog && (
          <section className="surface-card">
            <div className="card-header">
              <h3 className="card-title app-heading">Payload details for #{selectedLog.id} ({selectedLog.endpoint})</h3>
              <button
                className="control-chip"
                onClick={() => setSelectedLog(null)}
                style={{ cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
            <div className="card-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <h4 className="app-heading" style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Request Payload</h4>
                <pre style={{
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '0.5rem',
                  padding: '0.75rem',
                  overflowX: 'auto',
                  maxHeight: '20rem',
                  fontSize: '0.75rem',
                  fontFamily: 'monospace'
                }}>
                  {JSON.stringify(selectedLog.request, null, 2)}
                </pre>
              </div>
              <div>
                <h4 className="app-heading" style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Response Payload</h4>
                <pre style={{
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '0.5rem',
                  padding: '0.75rem',
                  overflowX: 'auto',
                  maxHeight: '20rem',
                  fontSize: '0.75rem',
                  fontFamily: 'monospace'
                }}>
                  {JSON.stringify(selectedLog.response, null, 2)}
                </pre>
              </div>
            </div>
          </section>
        )}
      </div>
    </section>
  )
}